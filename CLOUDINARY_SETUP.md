# Cloudinary Private Configuration Guide

This guide explains how to configure Cloudinary credentials securely without committing them to git or exposing them.

---

## Option 1: Local Untracked Config File (Recommended)

1. Create a local file named `js/config.local.js` (this file is excluded by `.gitignore`).
2. Add your credentials inside `js/config.local.js`:

```javascript
window.CLOUDINARY_CLOUD_NAME = 'your_actual_cloud_name';
window.CLOUDINARY_UPLOAD_PRESET = 'your_actual_unsigned_preset';
```

---

## Option 2: Browser LocalStorage (Zero Code Changes)

You can save your credentials directly in your browser's `localStorage` so they stay local to your machine and never appear in source code:

1. Open your browser console (`F12` -> **Console**).
2. Run these two commands:

```javascript
localStorage.setItem('cheeno_cloudinary_cloud', 'YOUR_CLOUD_NAME');
localStorage.setItem('cheeno_cloudinary_preset', 'YOUR_UNSIGNED_PRESET');
```

3. `js/cloudinary.js` will automatically read these values on every upload!

---

## Option 3: Secrets Markdown / Private File

If you keep your secrets in a `secrets.md` file:
- `secrets.md` has been added to `.gitignore`.
- It will never be tracked by git or uploaded to public repositories.
