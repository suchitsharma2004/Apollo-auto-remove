#!/bin/bash

echo "🚀 Creating new repository for Apollo Auto Remove deployment"
echo "=================================================="

# Suggest better repository names
echo "Suggested repository names (avoid generic names):"
echo "1. apollo-sequence-remover"
echo "2. apollo-contact-manager"
echo "3. apollo-auto-sequence-remove"
echo "4. sequence-contact-remover"
echo "5. apollo-email-remover"
echo ""

read -p "Enter your preferred repository name (or choose from above): " REPO_NAME

if [ -z "$REPO_NAME" ]; then
    REPO_NAME="apollo-sequence-remover"
    echo "Using default name: $REPO_NAME"
fi

echo ""
echo "📋 Manual steps to create new repository:"
echo "========================================"
echo "1. Go to https://github.com/new"
echo "2. Repository name: $REPO_NAME"
echo "3. Description: Apollo sequence contact removal tool"
echo "4. Make it PUBLIC (required for Vercel free tier)"
echo "5. Don't initialize with README (we have files already)"
echo "6. Click 'Create repository'"
echo ""
echo "7. Then run these commands in your terminal:"
echo "   git remote remove origin"
echo "   git remote add origin https://github.com/YOUR_USERNAME/$REPO_NAME.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "8. After pushing, try Vercel deployment again with the new repo URL"
echo ""
echo "🎯 New Vercel deploy URL will be:"
echo "https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/$REPO_NAME"
