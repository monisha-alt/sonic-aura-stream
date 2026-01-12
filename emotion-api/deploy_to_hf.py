#!/usr/bin/env python
"""
Script to deploy the trained model to Hugging Face Hub
Usage: python deploy_to_hf.py [your-username/repo-name]
"""

import os
import sys
from pathlib import Path

def deploy_model(repo_id=None):
    """Deploy the trained model to Hugging Face Hub"""
    
    model_dir = Path("wav2vec2-ravdess-emotion")
    
    if not model_dir.exists():
        print(f"❌ Error: Model directory '{model_dir}' not found!")
        print("   Make sure you're running this from the emotion-api directory")
        return False
    
    # Check if huggingface_hub is installed
    try:
        from huggingface_hub import HfApi, login, create_repo
    except ImportError:
        print("❌ Error: huggingface_hub not installed!")
        print("   Install it with: pip install huggingface_hub")
        return False
    
    # Get repo ID
    if not repo_id:
        repo_id = input("Enter Hugging Face repo ID (e.g., 'username/aura-emotion-model'): ").strip()
        if not repo_id:
            print("❌ Error: Repo ID is required")
            return False
    
    print(f"\n🚀 Deploying model to Hugging Face Hub...")
    print(f"   Model directory: {model_dir}")
    print(f"   Repository: {repo_id}")
    print()
    
    # Login check
    try:
        api = HfApi()
        print("✅ Hugging Face API initialized")
    except Exception as e:
        print(f"⚠️ Warning: {e}")
        print("   You may need to login first: huggingface-cli login")
    
    # Create repo if it doesn't exist
    try:
        print("🔍 Checking if repository exists...")
        api = HfApi()
        try:
            api.model_info(repo_id)
            print(f"✅ Repository {repo_id} already exists")
        except:
            print(f"📦 Creating repository {repo_id}...")
            create_repo(repo_id=repo_id, repo_type="model", exist_ok=True)
            print(f"✅ Repository created successfully")
    except Exception as e:
        print(f"⚠️ Warning: Could not check/create repository: {e}")
        print("   Will attempt upload anyway...")
    
    # Upload model
    try:
        print("📤 Uploading model files...")
        api = HfApi()
        api.upload_folder(
            folder_path=str(model_dir),
            repo_id=repo_id,
            repo_type="model",
            commit_message="Upload trained RAVDESS emotion detection model"
        )
        print(f"✅ Model successfully uploaded to: https://huggingface.co/{repo_id}")
        return True
    except Exception as e:
        print(f"❌ Upload failed: {e}")
        print("\n💡 Troubleshooting:")
        print("   1. Make sure you're logged in with a valid token")
        print("   2. Get a token from: https://huggingface.co/settings/tokens")
        print("   3. Login: python -c \"from huggingface_hub import login; login(token='YOUR_TOKEN')\"")
        print("   4. Verify you have write access to the repo")
        return False

if __name__ == "__main__":
    repo_id = sys.argv[1] if len(sys.argv) > 1 else None
    success = deploy_model(repo_id)
    sys.exit(0 if success else 1)

