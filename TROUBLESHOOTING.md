# 🔧 Troubleshooting Guide

## Common Errors and Solutions

### 🔥 Firebase Errors

#### Error: "Missing or insufficient permissions"

**Symptoms:**
- Console error: `FirebaseError: Missing or insufficient permissions`
- Data not saving to database
- Unable to fetch user profiles

**Causes:**
- Firestore security rules not deployed
- Using test/development rules in wrong environment
- Not authenticated when accessing protected data

**Solutions:**

1. **Deploy Security Rules (Primary Fix)**
   ```bash
   npm run firebase:deploy:rules
   ```

2. **Verify Firebase Configuration**
   ```bash
   # Check that firebase.json exists
   ls -la firebase.json firestore.rules
   
   # Verify you're logged in
   firebase login:list
   
   # Check current project
   firebase projects:list
   ```

3. **Test with Emulator (Development)**
   ```bash
   # Start emulator for local testing
   npm run firebase:emulator
   
   # In .env.local, add:
   NEXT_PUBLIC_FIREBASE_USE_EMULATOR=true
   ```

4. **Check Browser Console**
   - Open browser DevTools (F12)
   - Look for detailed Firebase errors
   - Check Network tab for failed requests

---

#### Error: "Firestore not initialized"

**Symptoms:**
- `Firestore not initialized` warning in console
- App shows mock data
- Firebase features not working

**Causes:**
- Missing environment variables
- Invalid Firebase configuration
- Firebase not set up for the project

**Solutions:**

1. **Check Environment Variables**
   ```bash
   # Verify .env.local exists
   ls -la .env.local
   
   # Check it has Firebase config
   grep FIREBASE .env.local
   ```

2. **Verify Configuration**
   - Open `.env.local`
   - Ensure all `NEXT_PUBLIC_FIREBASE_*` variables are set
   - Get correct values from [Firebase Console](https://console.firebase.google.com/)

3. **Copy from Example**
   ```bash
   # If .env.local is missing
   cp .env.example .env.local
   # Then edit .env.local with your Firebase credentials
   ```

4. **Development Mode (Skip Firebase)**
   - App works with mock data if Firebase is not configured
   - Great for UI development
   - See warning: "Using mock mode for development"

---

#### Error: "No project ID found"

**Symptoms:**
- `Error: No project ID found`
- Firebase commands fail
- Cannot deploy rules

**Solutions:**

1. **Set Project ID in Environment**
   ```bash
   # In .env.local, add:
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   ```

2. **Initialize Firebase**
   ```bash
   firebase init
   # Select Firestore
   # Choose your project
   ```

3. **Select Project Manually**
   ```bash
   # List available projects
   firebase projects:list
   
   # Use specific project
   firebase use your-project-id
   ```

---

### 🔐 Authentication Errors

#### Error: "User not authenticated"

**Symptoms:**
- Cannot save data
- Login/signup not working
- Redirected to auth page

**Solutions:**

1. **Enable Authentication in Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Navigate to Authentication > Sign-in method
   - Enable Email/Password and Google sign-in

2. **Check Auth Configuration**
   ```javascript
   // In browser console:
   firebase.auth().currentUser
   // Should show user object when logged in
   ```

3. **Clear Browser Cache**
   - Clear cookies and local storage
   - Try incognito/private mode
   - Re-login to the app

---

### 🚀 Build and Development Errors

#### Error: Build fails with Firebase error

**Symptoms:**
- `npm run build` fails
- Firebase errors during build
- "Cannot resolve module" errors

**Solutions:**

1. **Check Node Version**
   ```bash
   node --version
   # Should be 18+
   ```

2. **Clean Build**
   ```bash
   rm -rf .next
   npm run build
   ```

3. **Verify Dependencies**
   ```bash
   npm install
   # Or force reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

---

#### Error: "Module not found" errors

**Symptoms:**
- Import errors
- Cannot find '@/...' modules
- TypeScript errors

**Solutions:**

1. **Check tsconfig.json**
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

2. **Restart Dev Server**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

3. **Check File Paths**
   - Ensure files exist at import paths
   - Check for typos in import statements
   - Verify file extensions

---

### 🌐 Network and API Errors

#### Error: "Failed to fetch" or CORS errors

**Symptoms:**
- API requests failing
- CORS policy errors
- Network timeout

**Solutions:**

1. **Check API Keys**
   ```bash
   # Verify Cerebras API key
   grep CEREBRAS_API_KEY .env.local
   ```

2. **Test API Connection**
   ```bash
   # Test Cerebras endpoint
   curl -H "Authorization: Bearer YOUR_API_KEY" \
        https://api.cerebras.ai/v1/models
   ```

3. **Check Firewall/VPN**
   - Disable VPN temporarily
   - Check if corporate firewall blocks Firebase
   - Try different network

---

### 💻 Environment-Specific Issues

#### Development vs Production Differences

**Issue:** Works locally but fails in production

**Solutions:**

1. **Check Environment Variables**
   - Verify production environment has all variables
   - Use correct Firebase project for production
   - Check Vercel/deployment platform environment settings

2. **Build Locally to Test**
   ```bash
   npm run build
   npm start
   # Test at http://localhost:3000
   ```

3. **Check Logs**
   - Review deployment logs
   - Check browser console in production
   - Enable verbose logging temporarily

---

## 🔍 Debugging Steps

### Step 1: Check Console

```bash
# Browser Console (F12)
# Look for:
# - Red error messages
# - Firebase warnings
# - Network failures
```

### Step 2: Verify Configuration

```bash
# Run diagnostic script
node -e "console.log(process.env)" | grep FIREBASE

# Or check .env.local directly
cat .env.local | grep FIREBASE
```

### Step 3: Test Firebase Connection

```javascript
// In browser console:
import { db } from './src/lib/firebase'
console.log('DB initialized:', !!db)
```

### Step 4: Enable Debug Mode

```bash
# Add to .env.local
NEXT_PUBLIC_ENABLE_DEBUG_LOGS=true

# Check console for detailed logs
```

### Step 5: Test Individual Components

```bash
# Test authentication only
npm run dev
# Navigate to /auth

# Test database only  
# Try creating a test record
```

---

## 📋 Checklist Before Asking for Help

- [ ] Checked browser console for errors
- [ ] Verified all environment variables are set
- [ ] Deployed Firebase security rules
- [ ] Logged into correct Firebase account
- [ ] Tried clearing cache and cookies
- [ ] Tested in incognito/private mode
- [ ] Read [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
- [ ] Checked [QUICKSTART.md](QUICKSTART.md)
- [ ] Reviewed this troubleshooting guide
- [ ] Tried restarting dev server

---

## 🆘 Still Stuck?

### Collect Diagnostic Information

```bash
# System info
node --version
npm --version
firebase --version

# Project info
cat package.json | grep version
ls -la | grep firebase

# Environment (remove sensitive data!)
cat .env.local | grep -v "API_KEY"
```

### Where to Get Help

1. **Check Documentation**
   - [FIREBASE_SETUP.md](FIREBASE_SETUP.md) - Firebase setup
   - [QUICKSTART.md](QUICKSTART.md) - Quick commands
   - [README.md](README.md) - Project overview

2. **Firebase Resources**
   - [Firebase Documentation](https://firebase.google.com/docs)
   - [Firebase Status](https://status.firebase.google.com/)
   - [Firebase Support](https://firebase.google.com/support)

3. **Project Issues**
   - Create a GitHub issue with diagnostic info
   - Include error messages and console logs
   - Describe steps to reproduce

---

## 💡 Pro Tips

1. **Use Firebase Emulator**
   - Test locally without affecting production
   - Faster iteration during development
   - No internet required

2. **Enable Mock Mode**
   - Continue development even without Firebase
   - Perfect for UI work
   - Automatic fallback built into the app

3. **Monitor Firebase Usage**
   - Check [Firebase Console](https://console.firebase.google.com/)
   - Monitor quotas and limits
   - Set up billing alerts

4. **Keep Rules Updated**
   - Deploy rules after changes
   - Test rules with Firebase emulator
   - Review rules before production deployment

---

**Last Updated:** October 2025
