# Quick Training Status Checker
# Auto-detect script location and set working directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (Test-Path (Join-Path $scriptDir "train_ravdess.py")) {
    $workDir = $scriptDir
} elseif (Test-Path (Join-Path (Split-Path -Parent $scriptDir) "emotion-api\train_ravdess.py")) {
    $workDir = Join-Path (Split-Path -Parent $scriptDir) "emotion-api"
} else {
    # Try current directory
    if (Test-Path "train_ravdess.py") {
        $workDir = Get-Location
    } else {
        Write-Host "[ERROR] Cannot find emotion-api directory. Please run from C:\aura\emotion-api" -ForegroundColor Red
        exit 1
    }
}

Push-Location $workDir
Write-Host "`n=== TRAINING STATUS CHECK ===" -ForegroundColor Cyan
Write-Host "Working directory: $workDir" -ForegroundColor Gray
Write-Host ""

# Check if training process is running
$procs = Get-Process python -ErrorAction SilentlyContinue | Where-Object { $_.WorkingSet -gt 50000000 }
if ($procs) {
    $proc = $procs | Select-Object -First 1
    Write-Host "[RUNNING] Python process found (PID: $($proc.Id))" -ForegroundColor Green
    $memMB = [math]::Round($proc.WorkingSet / 1MB, 2)
    Write-Host "         Memory: $memMB MB" -ForegroundColor Gray
} else {
    Write-Host "[STOPPED] No training process detected" -ForegroundColor Red
}

Write-Host ""

# Find latest checkpoint
$checkpoints = Get-ChildItem "wav2vec2-ravdess-emotion\checkpoint-*" -Directory -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending
if ($checkpoints) {
    $latest = $checkpoints[0]
    $checkpointPath = $latest.FullName
    $stateFile = Join-Path $checkpointPath "trainer_state.json"
    
    Write-Host "[CHECKPOINT] Latest: $($latest.Name)" -ForegroundColor Yellow
    Write-Host "            Modified: $($latest.LastWriteTime)" -ForegroundColor Gray
    
    if (Test-Path $stateFile) {
        $state = Get-Content $stateFile | ConvertFrom-Json
        
        $currentStep = $state.global_step
        $currentEpoch = [math]::Round($state.epoch, 2)
        
        # Calculate progress
        $totalSteps = 2280 / (4 * 2) * 25  # steps_per_epoch * num_epochs
        $totalEpochs = 25
        $progressSteps = [math]::Round(($currentStep / $totalSteps) * 100, 1)
        $progressEpochs = [math]::Round(($currentEpoch / $totalEpochs) * 100, 1)
        $remainingSteps = [math]::Round($totalSteps - $currentStep)
        $remainingEpochs = [math]::Round($totalEpochs - $currentEpoch, 2)
        
        Write-Host ""
        Write-Host "=== PROGRESS ===" -ForegroundColor Cyan
        Write-Host "Step:   $currentStep / $([math]::Round($totalSteps)) ($progressSteps%)" -ForegroundColor White
        Write-Host "Epoch:  $currentEpoch / $totalEpochs ($progressEpochs%)" -ForegroundColor White
        Write-Host ""
        Write-Host "Remaining: ~$remainingSteps steps (~$remainingEpochs epochs)" -ForegroundColor Yellow
        
        # Estimate time (simplified - just show estimate)
        Write-Host "ETA:    ~2.5-4 hours (estimated)" -ForegroundColor Gray
        
        # Show latest metrics if available
        if ($state.log_history -and $state.log_history.Count -gt 0) {
            $latestLog = $state.log_history[-1]
            Write-Host ""
            Write-Host "=== LATEST METRICS ===" -ForegroundColor Cyan
            if ($latestLog.train_loss) {
                Write-Host "Train Loss: $([math]::Round($latestLog.train_loss, 4))" -ForegroundColor White
            }
            if ($latestLog.eval_loss) {
                Write-Host "Eval Loss:  $([math]::Round($latestLog.eval_loss, 4))" -ForegroundColor White
            }
            if ($latestLog.eval_accuracy) {
                Write-Host "Eval Acc:   $([math]::Round($latestLog.eval_accuracy * 100, 2))%" -ForegroundColor White
            }
        }
    } else {
        Write-Host "[WARNING] trainer_state.json not found in checkpoint" -ForegroundColor Red
    }
} else {
    Write-Host "[NO CHECKPOINT] No checkpoints found" -ForegroundColor Red
}

Write-Host ""

# Show latest log entries - find the newest log file
$allLogs = Get-ChildItem "train_run*.log" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending
$foundLog = $null
if ($allLogs) {
    $foundLog = $allLogs[0].FullName
    Write-Host "Reading from: $($allLogs[0].Name) (most recent)" -ForegroundColor Gray
} else {
    # Fallback to known log files
    $logFiles = @("train_run_active.log", "train_run_fixed.log", "train_run_resume.log", "train_run_fixed2.log")
    foreach ($logFile in $logFiles) {
        if (Test-Path $logFile) {
            $foundLog = $logFile
            break
        }
    }
}

if ($foundLog) {
    $logContent = Get-Content $foundLog -Tail 20 -ErrorAction SilentlyContinue
    
    # Check if in preprocessing phase
    $mapLine = $logContent | Select-String -Pattern "Map \(num_proc" | Select-Object -Last 1
    if ($mapLine) {
        if ($mapLine -match "(\d+)/2280") {
            $processed = [int]$matches[1]
            $preprocessPercent = [math]::Round(($processed / 2280) * 100, 1)
            Write-Host "=== CURRENT PHASE ===" -ForegroundColor Cyan
            Write-Host "[PREPROCESSING] Dataset: $processed / 2280 ($preprocessPercent%)" -ForegroundColor Yellow
            Write-Host "                 This happens once before training resumes" -ForegroundColor Gray
            Write-Host ""
        }
    }
    
    Write-Host "=== RECENT LOG OUTPUT (last 10 lines) ===" -ForegroundColor Cyan
    $logContent | Select-Object -Last 10 | ForEach-Object {
        if ($_ -match "epoch|step|loss|accuracy|RESUME|PHASE|Training|checkpoint") {
            Write-Host $_ -ForegroundColor Yellow
        } elseif ($_ -match "Map") {
            Write-Host $_ -ForegroundColor Cyan
        } else {
            Write-Host $_ -ForegroundColor Gray
        }
    }
} else {
    Write-Host "[NO LOG] No log file found" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== QUICK COMMANDS ===" -ForegroundColor Cyan
Write-Host "Run this script anytime: .\emotion-api\check_training_status.ps1" -ForegroundColor White
Write-Host "View full log: Get-Content emotion-api\train_run_active.log -Tail 50" -ForegroundColor White
Write-Host ""

Pop-Location

