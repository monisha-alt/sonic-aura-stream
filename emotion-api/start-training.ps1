# Quick start script for training

Write-Host "Wav2Vec2 RAVDESS Training - Quick Start" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Check if virtual environment exists
if (-not (Test-Path ".venv-train\Scripts\Activate.ps1")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv .venv-train
    Write-Host "Installing packages..." -ForegroundColor Yellow
    & .\.venv-train\Scripts\python.exe -m pip install --upgrade pip
    & .\.venv-train\Scripts\python.exe -m pip install torch torchaudio transformers datasets evaluate librosa soundfile pyarrow scikit-learn accelerate
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& .\.venv-train\Scripts\Activate.ps1

# Check for HF token
if (-not $env:HF_TOKEN) {
    Write-Host ""
    Write-Host "⚠️  Hugging Face token not set!" -ForegroundColor Yellow
    Write-Host "Get your token from: https://huggingface.co/settings/tokens" -ForegroundColor Cyan
    $token = Read-Host "Paste your Hugging Face token" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($token)
    $plain_token = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    $env:HF_TOKEN = $plain_token
    Write-Host "✅ Token set!" -ForegroundColor Green
}

# Set HF_HOME if not set
if (-not $env:HF_HOME) {
    $env:HF_HOME = "$PWD\.hf_cache"
    Write-Host "Set HF_HOME to: $env:HF_HOME" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Ready to train!" -ForegroundColor Green
Write-Host ""
Write-Host "Training will:" -ForegroundColor Cyan
Write-Host "  - Take 2-4 hours on GPU (12-24 hours on CPU)" -ForegroundColor Yellow
Write-Host "  - Train 25 epochs total (3 frozen + 22 unfrozen)" -ForegroundColor Yellow
Write-Host "  - Save model to: wav2vec2-ravdess-emotion/" -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "Start training? (y/N)"
if ($confirm -eq "y" -or $confirm -eq "Y") {
    Write-Host ""
    Write-Host "🚀 Starting training..." -ForegroundColor Green
    python train_ravdess.py
} else {
    Write-Host "Training cancelled. Run 'python train_ravdess.py' when ready." -ForegroundColor Yellow
}

