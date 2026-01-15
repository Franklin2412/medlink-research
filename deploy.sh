#!/bin/bash
# GitHub Deployment Script for MedLink Research
# Run this in PowerShell after creating your GitHub repository

echo "🚀 Deploying MedLink Research to GitHub"
echo "=========================================="
echo ""

# Step 1: Set your GitHub username
echo "📝 Please enter your GitHub username:"
read -p "Username: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ Error: GitHub username is required"
    exit 1
fi

echo ""
echo "✅ GitHub username set to: $GITHUB_USERNAME"
echo ""

# Step 2: Add remote repository
echo "📡 Connecting to GitHub repository..."
git remote add origin "https://github.com/$GITHUB_USERNAME/medlink-research.git" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Remote repository added successfully"
else
    echo "⚠️  Remote 'origin' already exists, updating URL..."
    git remote set-url origin "https://github.com/$GITHUB_USERNAME/medlink-research.git"
    echo "✅ Remote URL updated"
fi

echo ""

# Step 3: Rename branch to main
echo "🔄 Renaming branch to 'main'..."
git branch -M main
echo "✅ Branch renamed to main"
echo ""

# Step 4: Push to GitHub
echo "⬆️  Pushing code to GitHub..."
echo "   (You may be prompted for your GitHub credentials)"
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! Your code is now on GitHub!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Go to: https://github.com/$GITHUB_USERNAME/medlink-research"
    echo "2. Click 'Settings' tab"
    echo "3. Click 'Pages' in the left sidebar"
    echo "4. Under 'Source', select branch: 'main' and folder: '/ (root)'"
    echo "5. Click 'Save'"
    echo ""
    echo "⏳ Wait 1-2 minutes, then your site will be live at:"
    echo "   https://$GITHUB_USERNAME.github.io/medlink-research/"
    echo ""
else
    echo ""
    echo "❌ Push failed. Please check:"
    echo "   - You've created the repository on GitHub"
    echo "   - Your GitHub credentials are correct"
    echo "   - You have internet connection"
    echo ""
fi
