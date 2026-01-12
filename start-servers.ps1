# Start Both Frontend and Backend Servers
Write-Host ""
Write-Host "="*80 -ForegroundColor Cyan
Write-Host "🚀 STARTING AURA MUSIC APPLICATION SERVERS" -ForegroundColor Cyan
Write-Host "="*80 -ForegroundColor Cyan
Write-Host ""

# Set environment variables
$env:HF_HOME = "C:\aura\hf-cache"
$env:TRANSFORMERS_NO_TF = "1"

# Check prerequisites
Write-Host "📋 Checking Prerequisites..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "  ✅ Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Python not found!" -ForegroundColor Red
    exit 1
}

try {
    $nodeVersion = node --version 2>&1
    Write-Host "  ✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Node.js not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Start backend
Write-Host "🔧 Starting Backend Server..." -ForegroundColor Yellow
Write-Host "   Port: 8000 | URL: http://localhost:8000" -ForegroundColor Gray
Write-Host ""

$backendScript = 'cd C:\aura\emotion-api; $env:HF_HOME="C:\aura\hf-cache"; $env:TRANSFORMERS_NO_TF="1"; Write-Host "🚀 Backend API Server" -ForegroundColor Cyan; Write-Host "Port: 8000" -ForegroundColor Gray; Write-Host ""; python app.py'

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript
Start-Sleep -Seconds 3

# Check node_modules for frontend
Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Yellow
Write-Host "   Port: 5173 | URL: http://localhost:5173" -ForegroundColor Gray
Write-Host ""

if (-not (Test-Path "C:\aura\node_modules")) {
    Write-Host "   Installing dependencies..." -ForegroundColor Yellow
    Set-Location "C:\aura"
    npm install
}

$frontendScript = 'cd C:\aura; Write-Host "🚀 Frontend Server" -ForegroundColor Cyan; Write-Host "Port: 5173" -ForegroundColor Gray; Write-Host ""; npm run dev'

Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "📊 Waiting for servers to start..." -ForegroundColor Cyan
Write-Host ""

# Wait function
function Wait-ForServer {
    param([string]$Url, [string]$Name, [int]$MaxAttempts = 30)
    Write-Host "   Checking $Name..." -ForegroundColor Gray -NoNewline
    $attempt = 0
    while ($attempt -lt $MaxAttempts) {
        try {
            $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Host " ✅" -ForegroundColor Green
                return $true
            }
        } catch {}
        Start-Sleep -Seconds 1
        $attempt++
    }
    Write-Host " ⚠️" -ForegroundColor Yellow
    return $false
}

Start-Sleep -Seconds 5
Wait-ForServer -Url "http://localhost:8000/docs" -Name "Backend API" -MaxAttempts 60
Wait-ForServer -Url "http://localhost:5173" -Name "Frontend" -MaxAttempts 30

Write-Host ""
Write-Host "="*80 -ForegroundColor Green
Write-Host "✅ SERVERS STARTED!" -ForegroundColor Green
Write-Host "="*80 -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Application URLs:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host "   Backend:   http://localhost:8000" -ForegroundColor White
Write-Host "   API Docs:  http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "📝 Two PowerShell windows opened for each server" -ForegroundColor Gray
Write-Host "🛑 Close windows or press Ctrl+C to stop servers" -ForegroundColor Yellow
Write-Host ""
