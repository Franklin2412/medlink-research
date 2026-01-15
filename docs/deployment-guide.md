# Deployment Guide - MedLink Research

## 🚀 Quick Deployment to GitHub Pages

Follow these steps to deploy MedLink Research to GitHub Pages.

### Step 1: Create GitHub Repository

1. **Go to GitHub**: Visit [github.com](https://github.com)
2. **New Repository**:
   - Click the "+" icon → "New repository"
   - Repository name: `medlink-research`
   - Description: `Clinical AI & Rehabilitation tools`
   - Choose: **Public** (so others can access it)
   - **Don't** initialize with README (we already have one)
   - Click "Create repository"

### Step 2: Connect Local Repository to GitHub

In your terminal (PowerShell), run:

```powershell
cd C:\Users\damer\Documents\Projects\medical

# Add remote repository (replace [username] with your GitHub username)
git remote add origin https://github.com/[username]/medlink-research.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (gear icon)
3. Scroll down to **Pages** section (left sidebar)
4. Under "Source":
   - Branch: Select `main`
   - Folder: Select `/ (root)`
   - Click **Save**

5. Wait 1-2 minutes for deployment
6. Your site will be live at: `https://[username].github.io/medlink-research/`

### Step 4: Test Your Deployment

1. Visit: `https://[username].github.io/medlink-research/`
2. Click through all applications
3. Test Memory Garden game
4. Verify all features work online

---

## 🔄 Updating Your Site

Whenever you make changes to your code:

```powershell
cd C:\Users\damer\Documents\Projects\medical

# Stage changes
git add .

# Commit changes
git commit -m "Describe your changes here"

# Push to GitHub
git push origin main
```

GitHub Pages will automatically rebuild your site within 1-2 minutes.

---

## 📝 Custom Domain (Optional)

If you want a custom domain like `medlink-research.org`:

1. **Purchase domain** from a registrar (GoDaddy, Namecheap, etc.)
2. **Add DNS records**:
   - Type: `A`
   - Name: `@`
   - Value: GitHub Pages IP addresses:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
3. **Configure in GitHub**:
   - Settings → Pages → Custom domain
   - Enter your domain
   - Enable "Enforce HTTPS"

---

## 🏥 Sharing with Hospital

### Option 1: Direct Link
Simply share the GitHub Pages URL with the medical team:
- `https://[username].github.io/medlink-research/`

### Option 2: Embed in Hospital Website

If the hospital wants to integrate it into their website, they can use an `<iframe>`:

```html
<iframe 
  src="https://[username].github.io/medlink-research/" 
  width="100%" 
  height="800px" 
  frameborder="0"
  title="MedLink Research">
</iframe>
```

Or link to individual apps:
- Memory Garden: `https://[username].github.io/medlink-research/memory-garden/`
- HandyHelper: `https://[username].github.io/medlink-research/handy-helper/` (when ready)

### Option 3: White-Label Version

If the hospital wants their own branded version:

1. Fork the repository
2. Customize colors/branding in `shared/css/common.css`
3. Add hospital logo to landing page
4. Deploy to their own GitHub Pages or hosting

---

## 📊 Analytics (Optional, Privacy-Friendly)

If you want to track usage (anonymously) to understand impact:

### Option 1: Simple Counter (No personal data)
Use a free service like [GoatCounter](https://www.goatcounter.com/) - privacy-focused, GDPR-compliant

### Option 2: Self-Hosted
Use Plausible or Umami (open-source, privacy-friendly analytics)

**Important**: Always prioritize user privacy. These tools don't collect any personal information by design!

---

## ✅ Deployment Checklist

Before sharing with medical team:

- [ ] Repository is public on GitHub
- [ ] GitHub Pages is enabled
- [ ] Site loads correctly at GitHub Pages URL
- [ ] All links work (Home, Memory Garden, etc.)
- [ ] Memory Garden game functions properly
- [ ] Progress tracking and export work
- [ ] Accessibility features functional (High Contrast, Large Text)
- [ ] Mobile/tablet testing complete
- [ ] README.md is updated with correct GitHub Pages URL
- [ ] Documentation (plans folder) is accessible
- [ ] No console errors in browser

---

## 🆘 Troubleshooting

### Site not updating after push?
- Wait 2-3 minutes (GitHub Pages takes time to rebuild)
- Check GitHub Actions tab for build status
- Hard refresh browser (Ctrl + F5)

### 404 Error on pages?
- Ensure file paths are relative (no absolute paths)
- Check that all files are committed and pushed
- Verify GitHub Pages is enabled in Settings

### Styles not loading?
- Check that CSS paths use relative paths (`../shared/css/common.css`)
- Ensure all CSS files are committed to repository

### Game not working online?
- Open browser console (F12) to check for errors
- Verify JavaScript files are loading
- Check if LocalStorage is enabled in browser

---

## 🌐 Sharing the Project

Once deployed, share with:

### Medical Community
- Hospital social workers
- Encephalitis support groups
- Pediatric neurology departments
- Rehabilitation specialists

### Patient Families
- Direct link via email
- QR code for easy mobile access
- Print flyers with URL and description

### Open Source Community
- Post on Reddit (r/webdev, r/health)
- Share on Twitter/LinkedIn
- Submit to lists of free educational resources

---

## 📱 Mobile Access

Your site automatically works on mobile devices! Users can:

1. **Add to Home Screen** (acts like an app):
   - iOS: Safari → Share → "Add to Home Screen"
   - Android: Chrome → Menu → "Add to Home Screen"

2. **Bookmark** for easy access

3. **Share** via messaging apps

---

## 🎉 You're Live!

Congratulations! Your therapeutic tools are now accessible to families worldwide.

**Example URL**: `https://yourusername.github.io/medlink-research/`

**Next Steps**:
1. Test thoroughly on multiple devices
2. Gather feedback from your daughter and medical team
3. Iterate and improve based on real-world usage
4. Add HandyHelper as next priority
5. Continue building additional applications

---

**Need Help?** Open an issue on GitHub or consult the [main documentation](../plans/README.md).
