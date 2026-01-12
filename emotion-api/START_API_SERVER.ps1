# PowerShell script to start the Emotion Detection API server
# Usage: .\START_API_SERVER.ps1

Write-Host "`n🚀 Starting Emotion Detection API Server...`n" -ForegroundColor Cyan

# Set environment variables
Write-Host "Setting environment variables..." -ForegroundColor Yellow
$env:HF_HOME = "C:\aura\hf-cache"
$env:TRANSFORMERS_NO_TF = "1"
Write-Host "✅ Environment variables set" -ForegroundColor Green

# Check if virtual environment exists
$venvPath = Join-Path $PSScriptRoot "venv"
if (Test-Path $venvPath) {
    Write-Host "`nActivating virtual environment..." -ForegroundColor Yellow
    & "$venvPath\Scripts\Activate.ps1"
    Write-Host "✅ Virtual environment activated" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Virtual environment not found. Using system Python." -ForegroundColor Yellow
}

Write-Host "`nStarting FastAPI server on http://localhost:8000..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Gray
Write-Host "Once started, open: http://localhost:8000/docs`n" -ForegroundColor Cyan
Write-Host ("="*80) -ForegroundColor Gray
Write-Host ""

# Start the server
python app.py

