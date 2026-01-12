#!/usr/bin/env python
"""
Extended verification: Test model with varied audio patterns
"""

import numpy as np
import torch
from transformers import AutoProcessor, Wav2Vec2ForSequenceClassification
import os

def create_varied_audio_samples():
    """Create varied audio samples to test model diversity"""
    sample_rate = 16000
    duration = 2.0
    samples = []
    
    # Sample 1: Low frequency (sad-like)
    t = np.linspace(0, duration, int(sample_rate * duration))
    samples.append(("low_freq", np.sin(2 * np.pi * 100 * t).astype(np.float32)))
    
    # Sample 2: High frequency (happy/excited-like)
    samples.append(("high_freq", np.sin(2 * np.pi * 800 * t).astype(np.float32)))
    
    # Sample 3: Medium frequency (neutral-like)
    samples.append(("medium_freq", np.sin(2 * np.pi * 440 * t).astype(np.float32)))
    
    # Sample 4: Variable frequency (dynamic)
    freq = 200 + 400 * np.sin(2 * np.pi * 2 * t)
    samples.append(("variable_freq", np.sin(2 * np.pi * freq * t).astype(np.float32)))
    
    # Sample 5: Multiple frequencies (complex)
    samples.append(("complex", (np.sin(2 * np.pi * 200 * t) + 0.5 * np.sin(2 * np.pi * 600 * t)).astype(np.float32)))
    
    # Sample 6: Quiet (calm-like)
    samples.append(("quiet", 0.1 * np.sin(2 * np.pi * 440 * t).astype(np.float32)))
    
    # Sample 7: Loud (angry-like)
    samples.append(("loud", 2.0 * np.sin(2 * np.pi * 440 * t).astype(np.float32)))
    
    # Sample 8: Noise-like (uncertain)
    samples.append(("noise", np.random.normal(0, 0.1, int(sample_rate * duration)).astype(np.float32)))
    
    # Sample 9: Silence (should be uncertain)
    samples.append(("silence", np.zeros(int(sample_rate * duration), dtype=np.float32)))
    
    # Sample 10: Chirp (surprised-like)
    freq_chirp = 200 + 600 * t / duration
    samples.append(("chirp", np.sin(2 * np.pi * freq_chirp * t).astype(np.float32)))
    
    return samples

def verify_model_extended():
    model_path = "wav2vec2-ravdess-emotion"
    
    print("=" * 80)
    print("Extended RAVDESS Emotion Model Verification")
    print("=" * 80)
    
    # Load model
    print("\nLoading model...")
    try:
        processor = AutoProcessor.from_pretrained(model_path)
        model = Wav2Vec2ForSequenceClassification.from_pretrained(model_path)
        model.eval()
        print("Model loaded!")
    except Exception as e:
        print(f"Failed: {e}")
        return False
    
    # Test with varied samples
    print("\nTesting with varied audio patterns...")
    print("-" * 80)
    
    predictions = []
    all_probs = []
    
    samples = create_varied_audio_samples()
    
    for name, audio in samples:
        try:
            inputs = processor(audio, sampling_rate=16000, return_tensors="pt", padding=True)
            
            with torch.no_grad():
                outputs = model(**inputs)
                logits = outputs.logits
                probabilities = torch.softmax(logits, dim=-1)
                predicted_id = torch.argmax(logits, dim=-1).item()
                confidence = probabilities[0][predicted_id].item()
                predicted_emotion = model.config.id2label[predicted_id]
                
                # Get top 3 predictions
                top3_probs, top3_ids = torch.topk(probabilities[0], 3)
                top3_emotions = [model.config.id2label[i.item()] for i in top3_ids]
                top3_confidences = [p.item() for p in top3_probs]
            
            predictions.append(predicted_emotion)
            all_probs.append(probabilities[0].cpu().numpy())
            
            print(f"{name:15} -> {predicted_emotion:10} ({confidence:.3f}) | Top 3: {', '.join([f'{e}({c:.2f})' for e, c in zip(top3_emotions, top3_confidences)])}")
            
        except Exception as e:
            print(f"{name:15} -> ERROR: {e}")
    
    # Analysis
    print("\n" + "=" * 80)
    print("Analysis")
    print("=" * 80)
    
    unique_emotions = set(predictions)
    emotion_counts = {}
    for emotion in predictions:
        emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
    
    print(f"\nUnique emotions predicted: {len(unique_emotions)}/{model.config.num_labels}")
    print(f"\nEmotion distribution:")
    for emotion in sorted(model.config.id2label.values()):
        count = emotion_counts.get(emotion, 0)
        percentage = (count / len(predictions)) * 100
        print(f"  {emotion:10} {count:2}/10 ({percentage:5.1f}%)")
    
    # Check for biases
    print(f"\nBias Check:")
    for emotion in ["angry", "disgust", "neutral", "happy"]:
        count = emotion_counts.get(emotion, 0)
        percentage = (count / len(predictions)) * 100
        if percentage > 50:
            print(f"  [WARNING] {emotion}: {percentage:.1f}% (potential bias)")
        else:
            print(f"  [OK] {emotion}: {percentage:.1f}% (OK)")
    
    # Average confidence
    avg_confidences = [max(probs) for probs in all_probs]
    avg_conf = np.mean(avg_confidences)
    print(f"\nAverage confidence: {avg_conf:.3f}")
    if avg_conf < 0.5:
        print("  [OK] Model is appropriately uncertain (good for diverse predictions)")
    elif avg_conf < 0.8:
        print("  [OK] Model confidence is reasonable")
    else:
        print("  [WARNING] Model may be overconfident")
    
    # Overall verdict
    print("\n" + "=" * 80)
    if len(unique_emotions) >= 4:
        print("VERDICT: Model shows good diversity in predictions!")
    elif len(unique_emotions) >= 2:
        print("VERDICT: Model shows some diversity but could be better")
    else:
        print("VERDICT: Model lacks diversity - may need retraining")
    print("=" * 80)
    
    return len(unique_emotions) >= 3

if __name__ == "__main__":
    success = verify_model_extended()
    exit(0 if success else 1)

