# GitHub Deployment Script for NMDA Therapy Tools
# Run this in PowerShell to deploy to GitHub Pages

Write-Host "🚀 Deploying NMDA Therapy Tools to GitHub" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Your GitHub username
$GITHUB_USERNAME = "Franklin2412"

Write-Host ""
Write-Host "✅ GitHub username set to: $GITHUB_USERNAME" -ForegroundColor Green
Write-Host ""

# Step 2: Add remote repository
Write-Host "📡 Connecting to GitHub repository..." -ForegroundColor Yellow

try {
    git remote add origin "https://github.com/$GITHUB_USERNAME/nmda-therapy-tools.git" 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Remote repository added successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Remote 'origin' already exists, updating URL..." -ForegroundColor Yellow
        git remote set-url origin "https://github.com/$GITHUB_USERNAME/nmda-therapy-tools.git"
        Write-Host "✅ Remote URL updated" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Remote 'origin' already exists, updating URL..." -ForegroundColor Yellow
    git remote set-url origin "https://github.com/$GITHUB_USERNAME/nmda-therapy-tools.git"
    Write-Host "✅ Remote URL updated" -ForegroundColor Green
}

Write-Host ""

# Step 3: Rename branch to main
Write-Host "🔄 Renaming branch to 'main'..." -ForegroundColor Yellow
git branch -M main
Write-Host "✅ Branch renamed to main" -ForegroundColor Green
Write-Host ""

# Step 4: Push to GitHub
Write-Host "⬆️  Pushing code to GitHub..." -ForegroundColor Yellow
Write-Host "   (You may be prompted for your GitHub credentials)" -ForegroundColor Gray
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 SUCCESS! Your code is now on GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Go to: https://github.com/$GITHUB_USERNAME/nmda-therapy-tools" -ForegroundColor White
    Write-Host "2. Click 'Settings' tab" -ForegroundColor White
    Write-Host "3. Click 'Pages' in the left sidebar" -ForegroundColor White
    Write-Host "4. Under 'Source', select branch: 'main' and folder: '/ (root)'" -ForegroundColor White
    Write-Host "5. Click 'Save'" -ForegroundColor White
    Write-Host ""
    Write-Host "⏳ Wait 1-2 minutes, then your site will be live at:" -ForegroundColor Yellow
    Write-Host "   https://$GITHUB_USERNAME.github.io/nmda-therapy-tools/" -ForegroundColor Green
    Write-Host ""
    
    # Open browser to GitHub repository
    $openBrowser = Read-Host "Would you like to open the GitHub repository in your browser? (Y/N)"
    if ($openBrowser -eq "Y" -or $openBrowser -eq "y") {
        Start-Process "https://github.com/$GITHUB_USERNAME/nmda-therapy-tools"
    }
} else {
    Write-Host ""
    Write-Host "❌ Push failed. Please check:" -ForegroundColor Red
    Write-Host "   - You've created the repository on GitHub" -ForegroundColor Yellow
    Write-Host "   - Your GitHub credentials are correct" -ForegroundColor Yellow
    Write-Host "   - You have internet connection" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Tip: You may need to create a Personal Access Token" -ForegroundColor Cyan
    Write-Host "   Go to: https://github.com/settings/tokens" -ForegroundColor Cyan
    Write-Host ""
}
