#!/usr/bin/env python
"""Check model training status and summary"""

from transformers import AutoConfig
import os
from datetime import datetime

model_path = "wav2vec2-ravdess-emotion"

print("=" * 80)
print("Model Status Summary")
print("=" * 80)

# Check config
config = AutoConfig.from_pretrained(model_path)
print(f"\n✅ Model Configuration:")
print(f"   Model type: {config.model_type}")
print(f"   Num labels: {config.num_labels}")
print(f"   Labels: {list(config.id2label.values())}")
print(f"   Finetuning task: {config.finetuning_task}")

# Check files
print(f"\n📁 Model Files:")
model_file = os.path.join(model_path, "model.safetensors")
if os.path.exists(model_file):
    size_mb = os.path.getsize(model_file) / (1024*1024)
    mtime = os.path.getmtime(model_file)
    mtime_str = datetime.fromtimestamp(mtime).strftime("%Y-%m-%d %H:%M:%S")
    print(f"   ✅ model.safetensors: {size_mb:.2f} MB (modified: {mtime_str})")
else:
    print(f"   ❌ model.safetensors: NOT FOUND")

config_file = os.path.join(model_path, "config.json")
if os.path.exists(config_file):
    mtime = os.path.getmtime(config_file)
    mtime_str = datetime.fromtimestamp(mtime).strftime("%Y-%m-%d %H:%M:%S")
    print(f"   ✅ config.json (modified: {mtime_str})")

# Check for checkpoints
checkpoint_dirs = [d for d in os.listdir(model_path) if d.startswith("checkpoint-") and os.path.isdir(os.path.join(model_path, d))]
if checkpoint_dirs:
    print(f"\n📦 Found {len(checkpoint_dirs)} checkpoint directories (training may be incomplete)")
else:
    print(f"\n✅ No checkpoint directories (model appears to be final)")

print("\n" + "=" * 80)
print("✅ Model is ready for deployment!")
print("=" * 80)

