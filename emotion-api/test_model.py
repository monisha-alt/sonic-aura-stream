"""Test script to diagnose model loading issue"""
from transformers import AutoProcessor, Wav2Vec2Processor
import sys
import os

default_model = os.path.join(os.path.dirname(__file__), "wav2vec2-ravdess-emotion")
model_name = os.environ.get("MODEL_ID_OR_PATH", default_model if os.path.isdir(default_model) else "superb/wav2vec2-base-superb-er")

print(f"Testing model: {model_name}")
print("-" * 50)

# Test 1: AutoProcessor
print("\n1. Testing AutoProcessor...")
try:
    processor = AutoProcessor.from_pretrained(model_name)
    print("✅ AutoProcessor: SUCCESS")
except Exception as e:
    print(f"❌ AutoProcessor: FAILED - {e}")

# Test 2: Direct Wav2Vec2Processor  
print("\n2. Testing Wav2Vec2Processor...")
try:
    processor = Wav2Vec2Processor.from_pretrained(model_name)
    print("✅ Wav2Vec2Processor: SUCCESS")
except Exception as e:
    print(f"❌ Wav2Vec2Processor: FAILED - {e}")

print("\n" + "-" * 50)

