# Quick Training Status Checker (Root version - redirects to emotion-api)
$scriptPath = Join-Path $PSScriptRoot "emotion-api\check_training_status.ps1"
if (Test-Path $scriptPath) {
    & $scriptPath
} else {
    # Try relative path
    $scriptPath = "emotion-api\check_training_status.ps1"
    if (Test-Path $scriptPath) {
        & $scriptPath
    } else {
        Write-Host "[ERROR] Cannot find emotion-api\check_training_status.ps1" -ForegroundColor Red
        Write-Host "Please run from C:\aura or C:\aura\emotion-api" -ForegroundColor Yellow
    }
}

