#!/bin/bash

echo "🔧 Fixing Google Sign-In for iOS"
echo "================================="
echo ""

# Verify configuration
echo "📋 Step 1: Verifying configuration..."
if grep -q "n4ltt9ao229hf7j0iqg4okb5bbhfcnhh" app.json && \
   grep -q "n4ltt9ao229hf7j0iqg4okb5bbhfcnhh" ios/HelplineWelfareTrust/Info.plist; then
    echo "✅ Configuration files are correct"
else
    echo "❌ Configuration mismatch found!"
    exit 1
fi

echo ""
echo "🧹 Step 2: Cleaning previous builds..."
rm -rf ios/build 2>/dev/null
rm -rf ios/DerivedData 2>/dev/null
echo "✅ Cleaned"

echo ""
echo "🔄 Step 3: Regenerating native files from app.json..."
npx expo prebuild --clean --platform ios

echo ""
echo "🔨 Step 4: Rebuilding iOS app..."
echo "   (This will take 2-5 minutes)"
echo ""
npx expo run:ios

echo ""
echo "✅ Done! Google Sign-In should now work."
