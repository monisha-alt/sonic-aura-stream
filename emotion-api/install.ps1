# PowerShell installation script for Wav2Vec2 Emotion API
# This script installs dependencies in the correct order to avoid Rust compilation issues

Write-Host "`n🎤 Installing Wav2Vec2 Emotion Detection API Dependencies...`n" -ForegroundColor Cyan

# Step 1: Install basic web framework packages first
Write-Host "Step 1: Installing web framework..." -ForegroundColor Yellow
pip install fastapi==0.104.1
pip install "uvicorn[standard]==0.24.0"
pip install python-multipart==0.0.6
Write-Host "✅ Web framework installed`n" -ForegroundColor Green

# Step 2: Install PyTorch (large package, install separately)
Write-Host "Step 2: Installing PyTorch..." -ForegroundColor Yellow
pip install torch>=2.6.0 --index-url https://download.pytorch.org/whl/cpu
pip install torchaudio>=2.6.0 --index-url https://download.pytorch.org/whl/cpu
Write-Host "✅ PyTorch installed`n" -ForegroundColor Green

# Step 3: Install tokenizers separately (this may take time if building from source)
Write-Host "Step 3: Installing tokenizers (this may take a few minutes)..." -ForegroundColor Yellow
pip install tokenizers>=0.19.0
Write-Host "✅ Tokenizers installed`n" -ForegroundColor Green

# Step 4: Install transformers (now that tokenizers is ready)
Write-Host "Step 4: Installing transformers..." -ForegroundColor Yellow
pip install transformers>=4.40.0
Write-Host "✅ Transformers installed`n" -ForegroundColor Green

# Step 5: Install audio processing libraries
Write-Host "Step 5: Installing audio processing libraries..." -ForegroundColor Yellow
pip install soundfile>=0.12.1
pip install pydub>=0.25.1
pip install numpy>=1.24.0
pip install librosa>=0.10.1
Write-Host "✅ Audio libraries installed`n" -ForegroundColor Green

# Step 6: Install utilities
Write-Host "Step 6: Installing utilities..." -ForegroundColor Yellow
pip install python-dotenv==1.0.0
Write-Host "✅ Utilities installed`n" -ForegroundColor Green

Write-Host "🎉 All dependencies installed successfully!`n" -ForegroundColor Green
Write-Host "You can now run the API with:" -ForegroundColor Cyan
Write-Host "   python app.py`n" -ForegroundColor White

