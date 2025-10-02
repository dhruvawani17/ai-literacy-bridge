# 🔥 Firebase Permission Error - INSTANT FIX

## You're seeing this error:
```
FirebaseError: Missing or insufficient permissions
```

---

## ⚡ Quick Fix (30 seconds)

### Option 1: One Command
```bash
npm run firebase:deploy:rules
```

### Option 2: Manual Steps
```bash
# 1. Login (if not already)
firebase login

# 2. Deploy rules
firebase deploy --only firestore:rules
```

### Option 3: Use the Setup Script
```bash
npm run firebase:setup
```

---

## ✅ What This Does

Deploys the security rules from `firestore.rules` to your Firebase project, which:
- ✅ Allows public read access to student/scribe profiles (for matching)
- ✅ Requires authentication for creating/updating data
- ✅ Protects user data with owner-only access
- ✅ Enables admin accounts for management

---

## 🎯 Verify It Worked

After running the command:

1. **Refresh your browser** (Ctrl+R or Cmd+R)
2. **Check the console** - error should be gone
3. **Test the app** - try creating a profile

If you still see errors:
- Check that you deployed to the correct Firebase project
- Verify your `.env.local` has the right `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- Run `firebase projects:list` to see your projects

---

## 🧪 Alternative: Use Mock Mode

Want to develop without Firebase? The app already works in mock mode!

**What's Mock Mode?**
- App runs with sample data
- No real database needed
- Perfect for UI development
- Automatic fallback when Firebase isn't configured

**When to use it:**
- Working on design/layout
- Don't have Firebase set up yet
- Offline development
- Quick prototyping

---

## 📚 Need More Help?

- **Quick commands:** [QUICKSTART.md](QUICKSTART.md)
- **Full setup:** [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
- **All errors:** [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## 💡 Pro Tip

Add this to your workflow:

```bash
# After changing firestore.rules
npm run firebase:deploy:rules

# To deploy everything (rules + indexes)
npm run firebase:deploy
```

---

**Still stuck?** Open [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed debugging steps.
