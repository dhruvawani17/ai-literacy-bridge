# 🚀 Quick Start Guide - Firebase Setup

## ⚡ TL;DR - Fix Permission Errors

If you're seeing **"Missing or insufficient permissions"** errors:

```bash
# One-line fix:
npm run firebase:deploy:rules
```

---

## 📋 Complete Setup (First Time)

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
npm run firebase:login
```

### Step 3: Deploy Security Rules
```bash
npm run firebase:deploy
```

### Step 4: Start Development
```bash
npm run dev
```

---

## 🛠️ Available Commands

| Command | Description |
|---------|-------------|
| `npm run firebase:setup` | Interactive Firebase setup wizard |
| `npm run firebase:deploy` | Deploy rules and indexes |
| `npm run firebase:deploy:rules` | Deploy security rules only |
| `npm run firebase:deploy:indexes` | Deploy database indexes only |
| `npm run firebase:emulator` | Start Firebase emulator (local testing) |
| `npm run firebase:login` | Login to Firebase account |

---

## 🔍 Common Issues

### Issue: "No project ID found"
**Solution:** Make sure `.env.local` has `NEXT_PUBLIC_FIREBASE_PROJECT_ID`

### Issue: "Permission denied" 
**Solution:** Run `npm run firebase:deploy:rules`

### Issue: "Firebase not initialized"
**Solution:** Check that all Firebase environment variables are set

### Issue: "Command not found: firebase"
**Solution:** Install Firebase CLI: `npm install -g firebase-tools`

---

## 📁 Important Files

- `firestore.rules` - Security rules for database access
- `firestore.indexes.json` - Database query indexes
- `firebase.json` - Firebase configuration
- `.env.local` - Your Firebase credentials (keep private!)
- `FIREBASE_SETUP.md` - Detailed setup guide

---

## 🎯 Development Workflow

### First Time Setup
```bash
npm install
npm run firebase:login
npm run firebase:deploy
npm run dev
```

### Daily Development
```bash
npm run dev
# App runs with mock data if Firebase is not configured
# No Firebase setup required for UI development!
```

### Before Deployment
```bash
npm run firebase:deploy  # Deploy latest rules
npm run build            # Build production app
```

---

## 🧪 Testing with Firebase Emulator

For local testing without affecting production data:

```bash
# Terminal 1: Start emulator
npm run firebase:emulator

# Terminal 2: Start dev server
npm run dev
```

Then set in `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_USE_EMULATOR=true
```

---

## 🔒 Security Best Practices

✅ **DO:**
- Keep `.env.local` private
- Use separate Firebase projects for dev/prod
- Review security rules before deploying
- Enable authentication for sensitive operations

❌ **DON'T:**
- Commit `.env.local` to version control
- Use test mode rules in production
- Share your Firebase credentials
- Disable security rules

---

## 💡 Pro Tips

1. **Mock Mode:** App works without Firebase for UI development
2. **Quick Deploy:** Use `npm run firebase:deploy:rules` for fast rule updates
3. **Local Testing:** Use Firebase emulator to test without internet
4. **Multiple Projects:** Use `firebase use <project-id>` to switch projects

---

## 📖 More Information

- Full Guide: [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
- Project README: [README.md](README.md)
- Firebase Console: https://console.firebase.google.com/
- Firebase Docs: https://firebase.google.com/docs

---

## 🆘 Still Having Issues?

1. Check browser console for detailed errors
2. Read [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
3. Verify all environment variables are set
4. Make sure you're logged into the correct Firebase account
5. Check that your Firebase project has Firestore enabled

---

**Need to start fresh?** Run the automated setup:
```bash
npm run firebase:setup
```
