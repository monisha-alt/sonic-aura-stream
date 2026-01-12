#!/usr/bin/env python
"""
Corrected Wav2Vec2 RAVDESS Emotion Detection Training Script

Fixes:
- 25 epochs for proper convergence
- Feature extractor freeze/unfreeze strategy (proper two-phase training)
- Balanced class weights for imbalanced dataset
- Proper audio normalization (16kHz, amplitude)
- Gaussian noise augmentation
- Correct label mapping
"""

import argparse
import glob
import io
import inspect
import os
import time
from dataclasses import dataclass
from typing import Dict, List

import evaluate
import librosa
import numpy as np
import pyarrow as pa
import pyarrow.parquet as pq
import soundfile as sf
import torch
import torch.nn as nn
from requests.exceptions import ChunkedEncodingError, ConnectionError, Timeout, RequestException
from urllib3.exceptions import ProtocolError
from sklearn.utils.class_weight import compute_class_weight
from torch.nn.utils.rnn import pad_sequence
from datasets import Dataset
from huggingface_hub import snapshot_download
from transformers import (
    AutoConfig,
    Trainer,
    TrainingArguments,
    Wav2Vec2ForSequenceClassification,
    Wav2Vec2FeatureExtractor,
    set_seed,
)


@dataclass
class DataCollatorWithPadding:
    processor: Wav2Vec2FeatureExtractor
    padding: bool = True

    def __call__(self, features: List[Dict[str, np.ndarray]]) -> Dict[str, torch.Tensor]:
        input_tensors = [
            torch.as_tensor(feature["input_values"], dtype=torch.float32)
            for feature in features
        ]
        padded_inputs = pad_sequence(
            input_tensors,
            batch_first=True,
            padding_value=0.0,
        )

        if "attention_mask" in features[0]:
            attention_tensors = [
                torch.as_tensor(feature["attention_mask"], dtype=torch.long)
                for feature in features
            ]
            padded_attention = pad_sequence(
                attention_tensors,
                batch_first=True,
                padding_value=0,
            )
        else:
            padded_attention = (padded_inputs != 0.0).long()

        labels = torch.tensor([feature["labels"] for feature in features], dtype=torch.long)

        return {
            "input_values": padded_inputs,
            "attention_mask": padded_attention,
            "labels": labels,
        }


class WeightedTrainer(Trainer):
    """Trainer with weighted loss for imbalanced classes"""
    
    def __init__(self, class_weights=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.class_weights = class_weights
        if class_weights is not None:
            self.class_weights = torch.tensor(class_weights, dtype=torch.float32)
            if torch.cuda.is_available():
                self.class_weights = self.class_weights.cuda()
    
    # Accept **kwargs so newer Trainer APIs (e.g., num_items_in_batch) don't break this override
    def compute_loss(self, model, inputs, return_outputs=False, **kwargs):
        labels = inputs.get("labels")
        outputs = model(**inputs)
        logits = outputs.get("logits")
        
        if self.class_weights is not None:
            loss_fct = nn.CrossEntropyLoss(weight=self.class_weights)
        else:
            loss_fct = nn.CrossEntropyLoss()
        
        loss = loss_fct(logits.view(-1, self.model.config.num_labels), labels.view(-1))
        return (loss, outputs) if return_outputs else loss


def compute_metrics(eval_pred):
    accuracy_metric = evaluate.load("accuracy")
    predictions, labels = eval_pred
    preds = np.argmax(predictions, axis=1)
    
    # Also compute per-class metrics
    from sklearn.metrics import classification_report
    report = classification_report(labels, preds, output_dict=True, zero_division=0)
    
    return {
        "accuracy": accuracy_metric.compute(predictions=preds, references=labels)["accuracy"],
        "macro_f1": report.get("macro avg", {}).get("f1-score", 0.0),
        "weighted_f1": report.get("weighted avg", {}).get("f1-score", 0.0),
    }


def add_gaussian_noise(audio: np.ndarray, noise_factor: float = 0.01) -> np.ndarray:
    """Add small Gaussian noise for augmentation"""
    noise = np.random.normal(0, noise_factor, audio.shape).astype(np.float32)
    return np.clip(audio + noise, -1.0, 1.0)


def prepare_dataset(batch, processor, sampling_rate, augment: bool = False):
    """
    Prepare dataset with proper audio normalization and optional augmentation.
    
    - Enforces 16kHz resampling
    - Normalizes amplitude to [-1, 1]
    - Optionally adds small Gaussian noise
    """
    audio_arrays: List[np.ndarray] = []
    
    for audio_bytes in batch["audio_bytes"]:
        # Read audio
        with io.BytesIO(audio_bytes) as buffer:
            waveform, source_sr = sf.read(buffer, dtype='float32')
        
        # Ensure mono
        if waveform.ndim > 1:
            waveform = np.mean(waveform, axis=1)
        
        # Enforce 16kHz resampling
        if source_sr != sampling_rate:
            waveform = librosa.resample(
                waveform, 
                orig_sr=source_sr, 
                target_sr=sampling_rate,
                res_type='kaiser_best'
            )
        
        # Normalize amplitude to [-1, 1] range
        max_val = np.abs(waveform).max()
        if max_val > 0:
            waveform = waveform / max_val
        
        # Ensure float32
        waveform = waveform.astype(np.float32)
        
        # Apply augmentation (only for training)
        if augment:
            waveform = add_gaussian_noise(waveform, noise_factor=0.01)
        
        audio_arrays.append(waveform)
    
    # Process with feature extractor
    processed = processor(
        audio_arrays,
        sampling_rate=sampling_rate,
        return_attention_mask=True,
    )
    
    batch["input_values"] = [
        np.asarray(array, dtype=np.float32) for array in processed["input_values"]
    ]
    
    if "attention_mask" in processed:
        batch["attention_mask"] = [
            np.asarray(mask, dtype=np.int64) for mask in processed["attention_mask"]
        ]
    
    batch["labels"] = [int(label) for label in batch["label"]]
    return batch


def parse_args():
    parser = argparse.ArgumentParser(description="Train Wav2Vec2 on RAVDESS emotion dataset")
    parser.add_argument("--model_name_or_path", default="facebook/wav2vec2-base-960h")
    default_output_dir = os.path.join(os.path.dirname(__file__), "wav2vec2-ravdess-emotion")
    parser.add_argument("--output_dir", default=default_output_dir)
    parser.add_argument("--dataset_name", default="confit/ravdess-parquet")
    parser.add_argument("--dataset_config", default="fold1")
    parser.add_argument("--train_split", default="train")
    parser.add_argument("--eval_split", default="test")
    parser.add_argument("--sampling_rate", type=int, default=16_000)
    parser.add_argument("--num_train_epochs", type=float, default=25.0)
    parser.add_argument("--warmup_epochs", type=int, default=3, help="Epochs with frozen feature extractor")
    parser.add_argument("--per_device_train_batch_size", type=int, default=4)
    parser.add_argument("--per_device_eval_batch_size", type=int, default=4)
    parser.add_argument("--learning_rate", type=float, default=3e-5)
    parser.add_argument("--warmup_ratio", type=float, default=0.1)
    parser.add_argument("--weight_decay", type=float, default=0.01)
    parser.add_argument("--gradient_accumulation_steps", type=int, default=2)
    parser.add_argument("--seed", type=int, default=1337)
    parser.add_argument("--max_train_samples", type=int, default=None)
    parser.add_argument("--max_eval_samples", type=int, default=None)
    parser.add_argument("--resume_from_checkpoint", type=str, default=None, help="Path to checkpoint to resume from")
    parser.add_argument("--push_to_hub", action="store_true")
    parser.add_argument("--hub_model_id", default=None)
    parser.add_argument("--hub_private_repo", action="store_true")
    return parser.parse_args()


def main():
    args = parse_args()
    set_seed(args.seed)
    
    print("=" * 80)
    print("Wav2Vec2 RAVDESS Emotion Detection Training")
    print("=" * 80)
    print(f"Model: {args.model_name_or_path}")
    print(f"Total epochs: {args.num_train_epochs}")
    print(f"Warmup epochs (frozen): {args.warmup_epochs}")
    print(f"Unfrozen epochs: {args.num_train_epochs - args.warmup_epochs}")
    print(f"Learning rate: {args.learning_rate}")
    print(f"Batch size: {args.per_device_train_batch_size} (gradient accumulation: {args.gradient_accumulation_steps})")
    print("=" * 80)
    
    # Download dataset with retry logic
    print("\nDownloading RAVDESS dataset...")
    max_retries = 5
    retry_delay = 10  # Start with 10 seconds
    
    for attempt in range(max_retries):
        try:
            snapshot_path = snapshot_download(
                repo_id=args.dataset_name,
                repo_type="dataset",
                cache_dir=os.getenv("HF_HOME"),
                token=os.getenv("HF_TOKEN"),
                resume_download=True,  # Resume partial downloads
            )
            print("Dataset downloaded successfully!")
            break
        except (ChunkedEncodingError, ConnectionError, Timeout, RequestException, ProtocolError, Exception) as e:
            if attempt < max_retries - 1:
                wait_time = retry_delay * (2 ** attempt)  # Exponential backoff
                print(f"\n⚠️  Download failed (attempt {attempt + 1}/{max_retries}): {str(e)[:100]}")
                print(f"   Retrying in {wait_time} seconds...")
                time.sleep(wait_time)
            else:
                print(f"\n❌ Failed to download dataset after {max_retries} attempts.")
                print("   Error:", str(e))
                raise
    
    split_root = os.path.join(snapshot_path, args.dataset_config) if args.dataset_config else snapshot_path
    
    def load_split(split_name: str):
        pattern = os.path.join(split_root, f"{split_name}-*.parquet")
        parquet_files = sorted(glob.glob(pattern))
        if not parquet_files:
            return None
        tables = [pq.read_table(path) for path in parquet_files]
        table = pa.concat_tables(tables)
        data = table.to_pydict()
        return {
            "audio_bytes": [entry["bytes"] for entry in data["audio"]],
            "label": [int(label) for label in data["label"]],
            "emotion": data["emotion"],
            "file": data["file"],
        }
    
    train_dict = load_split(args.train_split)
    if train_dict is None:
        raise ValueError(f"Could not locate parquet files for split '{args.train_split}' in {split_root}")
    
    eval_dict = load_split(args.eval_split)
    
    train_dataset = Dataset.from_dict(train_dict)
    if eval_dict is not None:
        eval_dataset = Dataset.from_dict(eval_dict)
    else:
        split_dataset = train_dataset.train_test_split(test_size=0.1, seed=args.seed)
        train_dataset = split_dataset["train"]
        eval_dataset = split_dataset["test"]
    
    print(f"Train samples: {len(train_dataset)}")
    print(f"Eval samples: {len(eval_dataset)}")
    
    # Build label mapping (consistent id2label / label2id)
    print("\nBuilding label mapping...")
    label_names = {}
    for label, emotion in zip(train_dataset["label"], train_dataset["emotion"]):
        label_names[int(label)] = emotion
    
    # Ensure consistent ordering
    id2label = {idx: label_names[idx] for idx in sorted(label_names)}
    label2id = {name: idx for idx, name in id2label.items()}
    
    print(f"Labels ({len(id2label)}): {list(id2label.values())}")
    print(f"Label mapping: {id2label}")
    
    # Compute class weights for balanced training
    print("\nComputing class weights for balanced training...")
    labels_array = np.array(train_dataset["label"])
    unique_labels = np.unique(labels_array)
    class_weights = compute_class_weight(
        'balanced',
        classes=unique_labels,
        y=labels_array
    )
    class_weight_dict = dict(zip(unique_labels, class_weights))
    class_weight_list = [class_weight_dict[i] for i in sorted(unique_labels)]
    
    print(f"Class weights: {dict(zip([id2label[i] for i in sorted(unique_labels)], class_weight_list))}")
    
    # Load feature extractor (no tokenizer needed for pure audio)
    print("\nLoading feature extractor and config...")
    processor = Wav2Vec2FeatureExtractor.from_pretrained(
        args.model_name_or_path,
        cache_dir=os.getenv("HF_HOME"),
    )
    
    config = AutoConfig.from_pretrained(
        args.model_name_or_path,
        num_labels=len(label2id),
        label2id=label2id,
        id2label=id2label,
        finetuning_task="wav2vec2_emotion",
        cache_dir=os.getenv("HF_HOME"),
    )
    
    # Verify label mapping in config
    print(f"Config labels: {config.id2label}")
    assert config.label2id == label2id, "Label mapping mismatch!"
    assert config.id2label == id2label, "Label mapping mismatch!"
    
    # Prepare datasets with proper normalization
    print("\nPreparing training dataset (with augmentation)...")
    processed_train_dataset = train_dataset.map(
        prepare_dataset,
        fn_kwargs=dict(
            processor=processor,
            sampling_rate=args.sampling_rate,
            augment=True,  # Add noise augmentation for training
        ),
        remove_columns=["audio_bytes", "file", "emotion", "label"],
        batched=True,
        batch_size=8,
        num_proc=1,
    )
    
    print("Preparing evaluation dataset (no augmentation)...")
    processed_eval_dataset = eval_dataset.map(
        prepare_dataset,
        fn_kwargs=dict(
            processor=processor,
            sampling_rate=args.sampling_rate,
            augment=False,  # No augmentation for eval
        ),
        remove_columns=["audio_bytes", "file", "emotion", "label"],
        batched=True,
        batch_size=8,
        num_proc=1,
    )
    
    if args.max_train_samples:
        processed_train_dataset = processed_train_dataset.select(range(args.max_train_samples))
    if args.max_eval_samples:
        processed_eval_dataset = processed_eval_dataset.select(range(args.max_eval_samples))
    
    # Load model (allow classifier head size to be reinitialized for new num_labels)
    print("\nLoading model...")
    model = Wav2Vec2ForSequenceClassification.from_pretrained(
        args.model_name_or_path,
        config=config,
        cache_dir=os.getenv("HF_HOME"),
        ignore_mismatched_sizes=True,
    )
    
    # Disable caching for training
    model.config.use_cache = False
    
    # Freeze feature extractor initially
    print("Freezing feature extractor for warmup...")
    model.freeze_feature_extractor()
    
    data_collator = DataCollatorWithPadding(processor=processor)
    
    # Calculate steps per epoch
    steps_per_epoch = len(processed_train_dataset) // (args.per_device_train_batch_size * args.gradient_accumulation_steps)
    total_steps = int(steps_per_epoch * args.num_train_epochs)
    warmup_steps = int(total_steps * args.warmup_ratio)
    
    print(f"Steps per epoch: {steps_per_epoch}")
    print(f"Total steps: {total_steps}")
    print(f"Warmup steps: {warmup_steps}")
    
    # ============================================================================
    # CHECKPOINT RESUME LOGIC: Determine which phase to resume from
    # ============================================================================
    resume_checkpoint_phase1 = None
    resume_checkpoint_phase2 = None
    skip_phase1 = False
    checkpoint_step = 0
    checkpoint_epoch = 0.0
    
    if args.resume_from_checkpoint and os.path.exists(args.resume_from_checkpoint):
        checkpoint_state_path = os.path.join(args.resume_from_checkpoint, "trainer_state.json")
        if os.path.exists(checkpoint_state_path):
            import json
            with open(checkpoint_state_path, 'r') as f:
                checkpoint_state = json.load(f)
                checkpoint_step = checkpoint_state.get("global_step", 0)
                checkpoint_epoch = checkpoint_state.get("epoch", 0.0)
                # Phase 1 ends after warmup_epochs, so max steps = warmup_epochs * steps_per_epoch
                phase1_max_steps = int(args.warmup_epochs * steps_per_epoch)
                
                print("\n" + "=" * 80)
                print(f"CHECKPOINT DETECTED: {args.resume_from_checkpoint}")
                print("=" * 80)
                print(f"Checkpoint step: {checkpoint_step}")
                print(f"Checkpoint epoch: {checkpoint_epoch:.2f}")
                print(f"Phase 1 max steps: {phase1_max_steps}")
                
                if checkpoint_step < phase1_max_steps:
                    # Checkpoint is from Phase 1
                    resume_checkpoint_phase1 = args.resume_from_checkpoint
                    print(f"[RESUME] Resuming Phase 1 from checkpoint at step {checkpoint_step}")
                    print(f"[RESUME] Continuing training at step: {checkpoint_step} / epoch: {checkpoint_epoch:.2f}")
                else:
                    # Checkpoint is from Phase 2 - skip Phase 1 entirely
                    resume_checkpoint_phase2 = args.resume_from_checkpoint
                    skip_phase1 = True
                    print(f"[RESUME] Checkpoint is from Phase 2 - skipping Phase 1")
                    print(f"[RESUME] Resuming Phase 2 from checkpoint at step {checkpoint_step}")
                    print(f"[RESUME] Continuing training at step: {checkpoint_step} / epoch: {checkpoint_epoch:.2f}")
                    
                    # Load model from checkpoint for Phase 2
                    print(f"[RESUME] Loading model from checkpoint...")
                    model = Wav2Vec2ForSequenceClassification.from_pretrained(
                        args.resume_from_checkpoint,
                        config=config,
                        ignore_mismatched_sizes=True,
                    )
                    # Disable caching for training
                    model.config.use_cache = False
                    print(f"[RESUME] Model loaded successfully!")
        else:
            print(f"[WARNING] Checkpoint directory exists but trainer_state.json not found")
            print(f"[WARNING] Will attempt to load model weights from checkpoint anyway")
            resume_checkpoint_phase2 = args.resume_from_checkpoint
            skip_phase1 = True
    
    # ============================================================================
    # PHASE 1: Train with FROZEN feature extractor (warmup)
    # ============================================================================
    if not skip_phase1:
        print("\n" + "=" * 80)
        print(f"PHASE 1: Training with FROZEN feature extractor ({args.warmup_epochs} epochs)")
        print("=" * 80)
        
        # Training arguments for Phase 1 (warmup)
        phase1_training_args = dict(
            output_dir=args.output_dir,
            per_device_train_batch_size=args.per_device_train_batch_size,
            per_device_eval_batch_size=args.per_device_eval_batch_size,
            evaluation_strategy="epoch",
            save_strategy="epoch",
            num_train_epochs=args.warmup_epochs,
            learning_rate=args.learning_rate,
            warmup_steps=warmup_steps,
            weight_decay=args.weight_decay,
            gradient_accumulation_steps=args.gradient_accumulation_steps,
            fp16=torch.cuda.is_available(),
            group_by_length=True,
            dataloader_num_workers=min(4, os.cpu_count() or 1),
            logging_steps=25,
            save_total_limit=3,
            load_best_model_at_end=False,  # Don't load best for phase 1
            metric_for_best_model="accuracy",
            greater_is_better=True,
            report_to="none",
        )
        
        # Filter to supported arguments
        training_args_signature = inspect.signature(TrainingArguments)
        supported_phase1_args = {
            key: value
            for key, value in phase1_training_args.items()
            if key in training_args_signature.parameters
        }
        
        # Handle evaluation_strategy compatibility
        if "evaluation_strategy" not in supported_phase1_args:
            supported_phase1_args.pop("save_strategy", None)
            supported_phase1_args.pop("load_best_model_at_end", None)
            supported_phase1_args.pop("metric_for_best_model", None)
        
        phase1_training_args_obj = TrainingArguments(**supported_phase1_args)
        
        # Create trainer for Phase 1
        trainer_phase1 = WeightedTrainer(
            model=model,
            args=phase1_training_args_obj,
            train_dataset=processed_train_dataset,
            eval_dataset=processed_eval_dataset,
            tokenizer=processor,
            data_collator=data_collator,
            compute_metrics=compute_metrics,
            class_weights=class_weight_list,
        )
        
        # Train Phase 1
        print(f"[TRAINING] Starting Phase 1 training...")
        if resume_checkpoint_phase1:
            print(f"[TRAINING] Resuming from checkpoint: {resume_checkpoint_phase1}")
        trainer_phase1.train(resume_from_checkpoint=resume_checkpoint_phase1)
        
        print(f"\n[OK] Phase 1 complete: {args.warmup_epochs} epochs with frozen feature extractor")
    else:
        print("\n" + "=" * 80)
        print(f"PHASE 1: SKIPPED (resuming from Phase 2 checkpoint)")
        print("=" * 80)
    
    # ============================================================================
    # PHASE 2: Unfreeze feature extractor and continue training
    # ============================================================================
    print("\n" + "=" * 80)
    print(f"PHASE 2: Training with UNFROZEN feature extractor ({args.num_train_epochs - args.warmup_epochs} epochs)")
    print("=" * 80)
    
    # Unfreeze feature extractor (only if not resuming from Phase 2 checkpoint)
    if not skip_phase1:
        print("[UNFREEZE] Unfreezing feature extractor...")
        # Manually unfreeze feature encoder parameters
        # Wav2Vec2 models have the feature extractor at model.wav2vec2.feature_extractor
        if hasattr(model, 'wav2vec2'):
            if hasattr(model.wav2vec2, 'feature_extractor'):
                for param in model.wav2vec2.feature_extractor.parameters():
                    param.requires_grad = True
                print("   Unfroze feature_extractor parameters")
            if hasattr(model.wav2vec2, 'feature_projection'):
                for param in model.wav2vec2.feature_projection.parameters():
                    param.requires_grad = True
                print("   Unfroze feature_projection parameters")
        # Also try method-based unfreezing as fallback
        try:
            if hasattr(model, 'unfreeze_feature_encoder'):
                model.unfreeze_feature_encoder()
                print("   Used unfreeze_feature_encoder() method")
            elif hasattr(model, 'unfreeze_feature_extractor'):
                model.unfreeze_feature_extractor()
                print("   Used unfreeze_feature_extractor() method")
        except Exception as e:
            print(f"   Method-based unfreezing not available: {e}")
        print("[OK] Feature extractor unfrozen!")
    else:
        print("[SKIP] Feature extractor already unfrozen (loaded from Phase 2 checkpoint)")
    
    # Training arguments for Phase 2 (unfrozen)
    phase2_total_epochs = max(1, args.num_train_epochs - args.warmup_epochs)
    phase2_total_steps = max(1, int(phase2_total_epochs * steps_per_epoch))

    completed_phase2_epochs = 0.0
    if skip_phase1 and checkpoint_epoch > 0:
        completed_phase2_epochs = checkpoint_epoch
        remaining_phase2_epochs = max(0.0, phase2_total_epochs - completed_phase2_epochs)
        if remaining_phase2_epochs <= 0:
            print(f"[RESUME] Checkpoint already completed the requested {phase2_total_epochs} phase-2 epochs.")
            print("[RESUME] Nothing left to train. Exiting.")
            return
        print(f"[RESUME] Already completed {completed_phase2_epochs:.2f} phase-2 epochs, remaining: {remaining_phase2_epochs:.2f}")
    else:
        remaining_phase2_epochs = phase2_total_epochs
    
    # Get TrainingArguments signature for filtering supported args
    training_args_signature = inspect.signature(TrainingArguments)
    
    phase2_training_args = dict(
        output_dir=args.output_dir,
        per_device_train_batch_size=args.per_device_train_batch_size,
        per_device_eval_batch_size=args.per_device_eval_batch_size,
        evaluation_strategy="epoch",
        save_strategy="epoch",
        num_train_epochs=phase2_total_epochs,
        max_steps=phase2_total_steps,
        learning_rate=args.learning_rate * 0.5,  # Slightly lower LR for fine-tuning
        warmup_steps=0,  # No warmup in phase 2
        weight_decay=args.weight_decay,
        gradient_accumulation_steps=args.gradient_accumulation_steps,
        fp16=torch.cuda.is_available(),
        group_by_length=True,
        dataloader_num_workers=min(4, os.cpu_count() or 1),
        logging_steps=25,
        save_total_limit=3,
        load_best_model_at_end=True,  # Load best model at end
        metric_for_best_model="accuracy",
        greater_is_better=True,
        report_to="none",
    )
    
    # Filter to supported arguments
    supported_phase2_args = {
        key: value
        for key, value in phase2_training_args.items()
        if key in training_args_signature.parameters
    }
    
    # Handle evaluation_strategy compatibility
    if "evaluation_strategy" not in supported_phase2_args:
        supported_phase2_args.pop("save_strategy", None)
        supported_phase2_args.pop("load_best_model_at_end", None)
        supported_phase2_args.pop("metric_for_best_model", None)
    
    phase2_training_args_obj = TrainingArguments(**supported_phase2_args)
    
    # Create trainer for Phase 2
    trainer_phase2 = WeightedTrainer(
        model=model,
        args=phase2_training_args_obj,
        train_dataset=processed_train_dataset,
        eval_dataset=processed_eval_dataset,
        tokenizer=processor,
        data_collator=data_collator,
        compute_metrics=compute_metrics,
        class_weights=class_weight_list,
    )
    
    # Train Phase 2
    print(f"[TRAINING] Starting Phase 2 training...")
    if resume_checkpoint_phase2:
        print(f"[TRAINING] Resuming from checkpoint: {resume_checkpoint_phase2}")
        print(f"[TRAINING] Continuing training at step: {checkpoint_step} / epoch: {checkpoint_epoch:.2f}")
        print(f"[TRAINING] Target: {args.num_train_epochs} total epochs")
    else:
        print(f"[TRAINING] Starting fresh Phase 2 training")
    
    # Ensure training continues - pass resume checkpoint
    trainer_phase2.train(resume_from_checkpoint=resume_checkpoint_phase2)
    
    print(f"\n[OK] Phase 2 complete: Training finished!")
    
    print(f"\n[OK] Phase 2 complete: {phase2_total_epochs} epochs with unfrozen feature extractor")
    
    # ============================================================================
    # Save final model
    # ============================================================================
    print("\n[SAVE] Saving final model and processor...")
    trainer_phase2.save_model()
    processor.save_pretrained(args.output_dir)
    
    # Verify label mapping is saved correctly
    saved_config = AutoConfig.from_pretrained(args.output_dir)
    print(f"\n[OK] Saved model label mapping:")
    print(f"   id2label: {saved_config.id2label}")
    print(f"   label2id: {saved_config.label2id}")
    
    # Verify they match
    assert saved_config.id2label == id2label, "Saved id2label mismatch!"
    assert saved_config.label2id == label2id, "Saved label2id mismatch!"
    
    if args.push_to_hub:
        print("\n📤 Pushing to Hugging Face Hub...")
        trainer_phase2.push_to_hub()
    
    print(f"\n[COMPLETE] Training complete! Model saved to: {args.output_dir}")
    print("=" * 80)


if __name__ == "__main__":
    main()
