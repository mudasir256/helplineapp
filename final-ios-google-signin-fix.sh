#!/bin/bash

echo "🔧 FINAL FIX: Google Sign-In for iOS"
echo "===================================="
echo ""

# Verify REVERSED_CLIENT_ID
REVERSED_CLIENT_ID="com.googleusercontent.apps.909435925564-n4ltt9ao229hf7j0iqg4okb5bbhfcnhh"
IOS_CLIENT_ID="909435925564-n4ltt9ao229hf7j0iqg4okb5bbhfcnhh.apps.googleusercontent.com"

echo "📋 Step 1: Verifying Configuration"
echo "   REVERSED_CLIENT_ID: $REVERSED_CLIENT_ID"
echo "   iosClientId: $IOS_CLIENT_ID"
echo ""

# Check Info.plist
if grep -q "$REVERSED_CLIENT_ID" ios/HelplineWelfareTrust/Info.plist; then
    echo "✅ Info.plist has REVERSED_CLIENT_ID as URL Scheme"
else
    echo "❌ Info.plist missing URL Scheme!"
    exit 1
fi

# Check app.json
if grep -q "$REVERSED_CLIENT_ID" app.json; then
    echo "✅ app.json has REVERSED_CLIENT_ID"
else
    echo "❌ app.json missing URL Scheme!"
    exit 1
fi

echo ""
echo "🧹 Step 2: Cleaning build artifacts..."
rm -rf ios/build 2>/dev/null
rm -rf ios/DerivedData 2>/dev/null
rm -rf ios/Pods 2>/dev/null
rm -rf ios/Podfile.lock 2>/dev/null
echo "✅ Cleaned"

echo ""
echo "🔄 Step 3: Regenerating native files..."
npx expo prebuild --clean --platform ios

echo ""
echo "📦 Step 4: Installing CocoaPods..."
cd ios && pod install && cd ..

echo ""
echo "🔨 Step 5: Rebuilding iOS app..."
echo "   This will take 3-5 minutes..."
echo ""
npx expo run:ios

echo ""
echo "✅ Done! Google Sign-In should now work."
