# Push Project to GitHub
# This script helps you push your project to GitHub

Write-Host ""
Write-Host "="*80 -ForegroundColor Cyan
Write-Host "🚀 PUSH PROJECT TO GITHUB" -ForegroundColor Cyan
Write-Host "="*80 -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "❌ Git repository not initialized!" -ForegroundColor Red
    Write-Host "   Run: git init" -ForegroundColor Yellow
    exit 1
}

# Show current status
Write-Host "📋 Current Git Status:" -ForegroundColor Yellow
git status --short | Select-Object -First 10
Write-Host ""

# Check for GitHub remote
$githubRemote = git remote | Select-String -Pattern "github"
if ($githubRemote) {
    Write-Host "✅ GitHub remote found: $githubRemote" -ForegroundColor Green
    $githubUrl = git remote get-url $githubRemote
    Write-Host "   URL: $githubUrl" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "⚠️  No GitHub remote found" -ForegroundColor Yellow
    Write-Host ""
    $repoUrl = Read-Host "Enter your GitHub repository URL (e.g., https://github.com/username/repo.git)"
    
    if ($repoUrl) {
        Write-Host "`n➕ Adding GitHub remote..." -ForegroundColor Cyan
        git remote add github $repoUrl
        Write-Host "✅ GitHub remote added!" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "❌ No repository URL provided. Exiting." -ForegroundColor Red
        exit 1
    }
}

# Ask user what to do
Write-Host "📝 What would you like to do?" -ForegroundColor Cyan
Write-Host "   1. Stage all changes and commit" -ForegroundColor White
Write-Host "   2. Stage only tracked files (skip untracked)" -ForegroundColor White
Write-Host "   3. Show what will be committed first" -ForegroundColor White
Write-Host ""
$choice = Read-Host "Enter choice (1-3)"

# Stage files based on choice
if ($choice -eq "1") {
    Write-Host "`n➕ Staging all changes..." -ForegroundColor Cyan
    git add .
} elseif ($choice -eq "2") {
    Write-Host "`n➕ Staging tracked files only..." -ForegroundColor Cyan
    git add -u
} elseif ($choice -eq "3") {
    Write-Host "`n📋 Files that will be committed:" -ForegroundColor Cyan
    git status --short
    Write-Host ""
    $confirm = Read-Host "Continue? (y/n)"
    if ($confirm -ne "y") {
        Write-Host "❌ Cancelled." -ForegroundColor Red
        exit 0
    }
    git add .
} else {
    Write-Host "❌ Invalid choice. Exiting." -ForegroundColor Red
    exit 1
}

# Check if there are changes to commit
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "`n✅ No changes to commit!" -ForegroundColor Green
    Write-Host "   Everything is already committed." -ForegroundColor Gray
} else {
    # Get commit message
    Write-Host ""
    $commitMsg = Read-Host "Enter commit message (or press Enter for default)"
    if ([string]::IsNullOrWhiteSpace($commitMsg)) {
        $commitMsg = "Update project files"
    }
    
    Write-Host "`n💾 Committing changes..." -ForegroundColor Cyan
    git commit -m $commitMsg
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Changes committed!" -ForegroundColor Green
    } else {
        Write-Host "❌ Commit failed!" -ForegroundColor Red
        exit 1
    }
}

# Determine which remote to push to
$remotes = git remote
Write-Host ""
Write-Host "📡 Available remotes:" -ForegroundColor Cyan
$i = 1
$remoteList = @()
foreach ($remote in $remotes) {
    $url = git remote get-url $remote
    Write-Host "   $i. $remote - $url" -ForegroundColor White
    $remoteList += $remote
    $i++
}

$githubRemote = $remoteList | Where-Object { $_ -like "*github*" }
if (-not $githubRemote) {
    $githubRemote = $remoteList | Where-Object { $_ -eq "origin" }
}

if ($githubRemote) {
    Write-Host ""
    Write-Host "🚀 Pushing to: $githubRemote" -ForegroundColor Cyan
    
    # Get current branch
    $branch = git branch --show-current
    Write-Host "   Branch: $branch" -ForegroundColor Gray
    Write-Host ""
    
    # Push to GitHub
    git push $githubRemote $branch
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "="*80 -ForegroundColor Green
        Write-Host "✅ SUCCESSFULLY PUSHED TO GITHUB!" -ForegroundColor Green
        Write-Host "="*80 -ForegroundColor Green
        Write-Host ""
        Write-Host "🌐 Repository URL:" -ForegroundColor Cyan
        $repoUrl = git remote get-url $githubRemote
        Write-Host "   $repoUrl" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Push failed!" -ForegroundColor Red
        Write-Host "   Check the error message above." -ForegroundColor Yellow
        Write-Host "   You may need to:" -ForegroundColor Yellow
        Write-Host "   - Set upstream: git push -u $githubRemote $branch" -ForegroundColor White
        Write-Host "   - Or force push: git push -f $githubRemote $branch" -ForegroundColor White
    }
} else {
    Write-Host ""
    Write-Host "❌ No GitHub remote found!" -ForegroundColor Red
    Write-Host "   Add GitHub remote first:" -ForegroundColor Yellow
    Write-Host "   git remote add github https://github.com/username/repo.git" -ForegroundColor White
}

Write-Host ""

