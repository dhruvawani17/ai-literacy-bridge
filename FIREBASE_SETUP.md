# Firebase Setup Guide for AI Literacy Bridge

## 🔥 Firebase Configuration & Firestore Security Rules

This guide will help you set up Firebase for the AI Literacy Bridge project and fix the "Missing or insufficient permissions" error.

## Problem: Firebase Permission Errors

If you're seeing errors like:
```
FirebaseError: Missing or insufficient permissions.
```

This means your Firestore security rules need to be configured.

---

## Solution Steps

### 1. Deploy Firestore Security Rules

The project includes a `firestore.rules` file with proper security rules. Deploy it to your Firebase project:

```bash
# Install Firebase CLI if you haven't
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not already done)
firebase init firestore

# Deploy the security rules
firebase deploy --only firestore:rules
```

### 2. Alternative: Manual Rule Setup via Firebase Console

If you prefer to use the Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules**
4. Copy and paste the contents of `firestore.rules` file
5. Click **Publish**

---

## 🔒 Security Rules Explanation

The `firestore.rules` file includes:

### **Public Read Access** (for matching purposes)
- Students and Scribes profiles are publicly readable
- This allows the matching algorithm to work without authentication
- Sensitive data should be stored in a separate private collection

### **Authenticated Write Access**
- Only authenticated users can create profiles
- Users can only update/delete their own data
- Admins have full access

### **Collections Covered**
- `/students/` - Student profiles
- `/scribes/` - Scribe profiles
- `/exams/` - Exam information
- `/matches/` - Scribe-student matches
- `/users/` - User accounts
- `/admins/` - Admin management
- `/stats/` - Analytics data

---

## 🧪 Testing in Development

### Option 1: Use Mock Mode (No Firebase Required)
The code now gracefully handles Firebase permission errors by falling back to mock data in development.

### Option 2: Use Firebase Emulator
For local development with Firebase:

```bash
# Install emulator
firebase init emulators

# Start emulator
firebase emulators:start
```

Then update your `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_USE_EMULATOR=true
```

### Option 3: Use Test Mode (Temporary)
For quick testing, you can temporarily set Firestore to test mode:

⚠️ **WARNING: Do not use test mode in production!**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

---

## 📋 Environment Variables Required

Make sure your `.env.local` file has all Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

Get these from:
1. Firebase Console → Project Settings → General
2. Scroll down to "Your apps" section
3. Select your web app or create one
4. Copy the config values

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] Firebase security rules are deployed
- [ ] Environment variables are set in production
- [ ] Authentication is properly configured
- [ ] Test mode is disabled
- [ ] Admin accounts are created
- [ ] Backup strategy is in place

---

## 🔧 Troubleshooting

### Error: "Firestore not initialized"
- Check that environment variables are set
- Verify Firebase config in `src/lib/firebase.ts`
- Check browser console for initialization errors

### Error: "Permission denied"
- Deploy/update security rules
- Verify user is authenticated for protected operations
- Check that the user has the correct role

### Error: "Project not found"
- Verify `NEXT_PUBLIC_FIREBASE_PROJECT_ID` is correct
- Check that the project exists in Firebase Console

---

## 📚 Additional Resources

- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication Setup](https://firebase.google.com/docs/auth/web/start)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

---

## 💡 Development vs Production

### Development
- Uses fallback mock data if Firebase is not configured
- Logs warnings instead of throwing errors
- Allows testing without Firebase setup

### Production
- Requires proper Firebase configuration
- Enforces security rules
- Uses real authentication and authorization

---

## Need Help?

If you continue to experience issues:
1. Check the browser console for detailed error messages
2. Verify your Firebase project is active
3. Ensure billing is enabled (if using production quotas)
4. Check Firebase status page for outages
