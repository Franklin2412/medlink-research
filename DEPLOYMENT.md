# 🚀 Quick Deployment Guide

## Deploy to GitHub Pages in 5 Minutes

### Prerequisites
- GitHub account (create at github.com if needed)
- Your code is already committed to Git ✅

---

## Step-by-Step Instructions

### 1️⃣ Create GitHub Repository (2 minutes)

1. Go to **https://github.com**
2. Click **"+" button** (top right) → **"New repository"**
3. Fill in:
   - **Repository name**: `nmda-therapy-tools`
   - **Description**: `Free therapeutic web apps for children recovering from NMDA encephalitis`
   - **Visibility**: ✅ Public
   - ❌ **DO NOT** check "Initialize with README"
4. Click **"Create repository"**

---

### 2️⃣ Push Your Code (2 minutes)

Open **PowerShell** and run these commands:

```powershell
# Navigate to your project
cd C:\Users\damer\Documents\Projects\medical

# Add GitHub as remote (replace [YOUR-USERNAME] with your actual GitHub username!)
git remote add origin https://github.com/[YOUR-USERNAME]/nmda-therapy-tools.git

# Rename branch to main
git branch -M main

# Push your code to GitHub
git push -u origin main
```

**Enter your GitHub credentials when prompted.**

✅ **Success message**: You'll see "Branch 'main' set up to track remote branch 'main' from 'origin'"

---

### 3️⃣ Enable GitHub Pages (1 minute)

1. Go to your repository: `https://github.com/[YOUR-USERNAME]/nmda-therapy-tools`
2. Click **"Settings"** tab (top right, gear icon)
3. Scroll down left sidebar → Click **"Pages"**
4. Under **"Source"**:
   - **Branch**: Select `main` (dropdown)
   - **Folder**: Select `/ (root)` (dropdown)
5. Click **"Save"**

✅ **You'll see**: "Your site is ready to be published at https://[YOUR-USERNAME].github.io/nmda-therapy-tools/"

---

### 4️⃣ Wait & Test (1-2 minutes)

1. Wait **1-2 minutes** for GitHub to build your site
2. **Refresh the Settings → Pages** page
3. When ready, you'll see: ✅ "Your site is live at https://[YOUR-USERNAME].github.io/nmda-therapy-tools/"
4. **Click the link** to visit your live site!

---

## ✅ Your Live URLs

Once deployed, share these links:

- **Landing Page**: `https://[YOUR-USERNAME].github.io/nmda-therapy-tools/`
- **Memory Garden**: `https://[YOUR-USERNAME].github.io/nmda-therapy-tools/memory-garden/`
- **HandyHelper**: `https://[YOUR-USERNAME].github.io/nmda-therapy-tools/handy-helper/`
- **Documentation**: `https://[YOUR-USERNAME].github.io/nmda-therapy-tools/plans/`

---

## 🔄 Updating Your Site

Whenever you make changes:

```powershell
cd C:\Users\damer\Documents\Projects\medical

# Stage all changes
git add .

# Commit with a message describing what you changed
git commit -m "Your change description here"

# Push to GitHub
git push origin main
```

GitHub Pages will automatically rebuild (takes 1-2 minutes).

---

## 🆘 Troubleshooting

### "Permission denied" error?
- Make sure you're logged into GitHub
- Use a Personal Access Token instead of password (GitHub requires this now)
- Create one at: https://github.com/settings/tokens

### Site not updating?
- Wait 2-3 minutes (GitHub Pages takes time to rebuild)
- Hard refresh browser: **Ctrl + F5** (Windows) or **Cmd + Shift + R** (Mac)
- Check GitHub Actions tab for build status

### 404 Error?
- Verify GitHub Pages is enabled in Settings → Pages
- Check that branch is set to `main` and folder to `/ (root)`
- Ensure index.html is in root directory (it is! ✅)

---

## 📧 Share with Medical Team

Email template:

```
Subject: NMDA Therapy Tools - Free Web Applications for Review

Dear [Doctor/Therapist Name],

I've developed free, web-based therapeutic applications to support 
children recovering from NMDA encephalitis, including my daughter.

Live Demo: https://[YOUR-USERNAME].github.io/nmda-therapy-tools/

Applications:
1. Memory Garden - Memory training games
2. HandyHelper - Gesture detection for hand motor function

I would appreciate your clinical feedback before wider deployment.

Planning documents are here: 
https://[YOUR-USERNAME].github.io/nmda-therapy-tools/plans/

Thank you for your time and expertise.

Best regards,
[Your Name]
```

---

## 🎉 You're Done!

Your therapeutic tools are now accessible worldwide! 🌍

Anyone with internet can now benefit from your work.

---

**Questions?** Review the full [Deployment Guide](file:///C:/Users/damer/Documents/Projects/medical/docs/deployment-guide.md)
