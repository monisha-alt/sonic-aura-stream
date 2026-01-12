# PowerShell script to start the Wav2Vec2 Emotion Detection API
# Run this script to start the API server

Write-Host "`n🎤 Starting Wav2Vec2 Emotion Detection API...`n" -ForegroundColor Cyan

# Navigate to API directory
Set-Location $PSScriptRoot

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error activating virtual environment!" -ForegroundColor Red
    Write-Host "Please run: python -m venv venv" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Virtual environment activated`n" -ForegroundColor Green

# Start the API
Write-Host "Starting API server..." -ForegroundColor Yellow
Write-Host "API will be available at: http://localhost:8000`n" -ForegroundColor Cyan

python app.py

