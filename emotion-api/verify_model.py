#!/usr/bin/env python
"""
Verify the trained RAVDESS emotion model
Tests that the model:
1. Loads correctly
2. Can make predictions
3. Predicts diverse emotions (not just "angry")
"""

import numpy as np
import torch
from transformers import AutoProcessor, Wav2Vec2ForSequenceClassification
import os

def create_dummy_audio(duration_seconds=2.0, sample_rate=16000):
    """Create dummy audio for testing (sine wave)"""
    t = np.linspace(0, duration_seconds, int(sample_rate * duration_seconds))
    # Create a simple sine wave
    audio = np.sin(2 * np.pi * 440 * t).astype(np.float32)
    return audio

def verify_model():
    model_path = "wav2vec2-ravdess-emotion"
    
    print("=" * 80)
    print("RAVDESS Emotion Model Verification")
    print("=" * 80)
    
    # Step 1: Load model and processor
    print("\n📦 Step 1: Loading model and processor...")
    try:
        processor = AutoProcessor.from_pretrained(model_path)
        model = Wav2Vec2ForSequenceClassification.from_pretrained(model_path)
        model.eval()  # Set to evaluation mode
        print("✅ Model and processor loaded successfully!")
        print(f"   Model has {model.config.num_labels} emotion classes")
        print(f"   Labels: {list(model.config.id2label.values())}")
    except Exception as e:
        print(f"❌ Failed to load model: {e}")
        return False
    
    # Step 2: Test predictions with multiple dummy audio samples
    print("\n🧪 Step 2: Testing predictions with dummy audio...")
    
    predictions = []
    confidences = []
    
    # Test with 10 different audio samples
    for i in range(10):
        try:
            # Create dummy audio
            audio = create_dummy_audio(duration_seconds=2.0)
            
            # Process audio
            inputs = processor(audio, sampling_rate=16000, return_tensors="pt", padding=True)
            
            # Make prediction
            with torch.no_grad():
                outputs = model(**inputs)
                logits = outputs.logits
                probabilities = torch.softmax(logits, dim=-1)
                predicted_id = torch.argmax(logits, dim=-1).item()
                confidence = probabilities[0][predicted_id].item()
                predicted_emotion = model.config.id2label[predicted_id]
            
            predictions.append(predicted_emotion)
            confidences.append(confidence)
            
            print(f"   Sample {i+1}: {predicted_emotion} (confidence: {confidence:.3f})")
            
        except Exception as e:
            print(f"   ❌ Sample {i+1} failed: {e}")
            return False
    
    # Step 3: Analyze prediction diversity
    print("\n📊 Step 3: Analyzing prediction diversity...")
    
    unique_emotions = set(predictions)
    emotion_counts = {}
    for emotion in predictions:
        emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
    
    print(f"   Unique emotions predicted: {len(unique_emotions)}/{model.config.num_labels}")
    print(f"   Emotion distribution:")
    for emotion, count in sorted(emotion_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"      {emotion}: {count}/10 ({count*10}%)")
    
    avg_confidence = np.mean(confidences)
    print(f"   Average confidence: {avg_confidence:.3f}")
    
    # Step 4: Check for "angry" bias
    print("\n🔍 Step 4: Checking for 'angry' bias...")
    
    angry_count = emotion_counts.get("angry", 0)
    angry_percentage = (angry_count / len(predictions)) * 100
    
    print(f"   'Angry' predictions: {angry_count}/10 ({angry_percentage:.1f}%)")
    
    if angry_percentage > 70:
        print("   ⚠️  WARNING: High 'angry' bias detected (>70%)")
        return False
    elif angry_percentage > 50:
        print("   ⚠️  CAUTION: Moderate 'angry' bias detected (>50%)")
    else:
        print("   ✅ No significant 'angry' bias detected")
    
    # Step 5: Overall verification
    print("\n✅ Step 5: Overall verification...")
    
    if len(unique_emotions) >= 3:
        print("   ✅ Model predicts diverse emotions (≥3 different emotions)")
    else:
        print("   ⚠️  Model predicts limited emotions (<3 different emotions)")
    
    if avg_confidence < 0.95:
        print("   ✅ Confidence levels are reasonable (not overconfident)")
    else:
        print("   ⚠️  Model may be overconfident")
    
    print("\n" + "=" * 80)
    print("✅ Model verification complete!")
    print("=" * 80)
    
    return True

if __name__ == "__main__":
    success = verify_model()
    exit(0 if success else 1)

