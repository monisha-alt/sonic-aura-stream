# Simplified installation - installs everything without strict version pins
# This avoids Rust compilation issues by using latest versions with pre-built wheels

Write-Host "`n🎤 Installing Wav2Vec2 Emotion Detection API (Simple Method)...`n" -ForegroundColor Cyan

# Install everything using latest compatible versions
Write-Host "Installing all dependencies (this may take 5-10 minutes)...`n" -ForegroundColor Yellow

pip install fastapi uvicorn[standard] python-multipart
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu
pip install transformers tokenizers
pip install soundfile pydub numpy librosa python-dotenv

Write-Host "`n🎉 Installation complete!`n" -ForegroundColor Green
Write-Host "Run the API with: python app.py`n" -ForegroundColor Cyan

