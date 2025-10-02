#!/bin/bash

# ==============================================
# Firebase Quick Setup Script
# ==============================================
# This script helps you quickly set up Firebase for the AI Literacy Bridge project

set -e  # Exit on any error

echo "🔥 Firebase Quick Setup for AI Literacy Bridge"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${YELLOW}⚠️  Firebase CLI is not installed.${NC}"
    echo ""
    echo "Would you like to install it now? (y/n)"
    read -r install_firebase
    
    if [ "$install_firebase" = "y" ] || [ "$install_firebase" = "Y" ]; then
        echo -e "${BLUE}📦 Installing Firebase CLI...${NC}"
        npm install -g firebase-tools
        echo -e "${GREEN}✅ Firebase CLI installed successfully!${NC}"
    else
        echo -e "${RED}❌ Firebase CLI is required. Please install it manually:${NC}"
        echo "   npm install -g firebase-tools"
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}Step 1: Firebase Login${NC}"
echo "---------------------------------------"
echo "You'll be redirected to login to Firebase..."
firebase login

echo ""
echo -e "${BLUE}Step 2: Initialize Firebase${NC}"
echo "---------------------------------------"

# Check if firebase.json exists
if [ -f "firebase.json" ]; then
    echo -e "${GREEN}✅ firebase.json already exists${NC}"
else
    echo "Initializing Firebase Firestore..."
    firebase init firestore
fi

echo ""
echo -e "${BLUE}Step 3: Deploy Firestore Rules${NC}"
echo "---------------------------------------"
echo "Deploying security rules to Firebase..."
firebase deploy --only firestore:rules

echo ""
echo -e "${BLUE}Step 4: Deploy Firestore Indexes${NC}"
echo "---------------------------------------"
echo "Deploying database indexes..."
firebase deploy --only firestore:indexes

echo ""
echo -e "${GREEN}✅ Firebase setup complete!${NC}"
echo ""
echo "================================================"
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Make sure your .env.local file has Firebase credentials"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Check the browser console for any remaining errors"
echo ""
echo "📖 For more details, see: FIREBASE_SETUP.md"
echo "================================================"
