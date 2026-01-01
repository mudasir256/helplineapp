#!/bin/bash

echo "🔧 EXPO BARE: Complete Google Sign-In Fix"
echo "========================================"
echo ""

REVERSED_CLIENT_ID="com.googleusercontent.apps.909435925564-n4ltt9ao229hf7j0iqg4okb5bbhfcnhh"
IOS_CLIENT_ID="909435925564-n4ltt9ao229hf7j0iqg4okb5bbhfcnhh.apps.googleusercontent.com"

echo "📋 Step 1: Verifying Configuration"
echo "   REVERSED_CLIENT_ID: $REVERSED_CLIENT_ID"
echo "   iosClientId: $IOS_CLIENT_ID"
echo ""

# Verify Info.plist
if grep -q "$REVERSED_CLIENT_ID" ios/HelplineWelfareTrust/Info.plist; then
    echo "✅ Info.plist has REVERSED_CLIENT_ID as URL Scheme"
else
    echo "❌ Info.plist missing URL Scheme!"
    exit 1
fi

# Verify app.json
if grep -q "$REVERSED_CLIENT_ID" app.json; then
    echo "✅ app.json has REVERSED_CLIENT_ID"
else
    echo "❌ app.json missing URL Scheme!"
    exit 1
fi

# Check GoogleService-Info.plist (optional)
if [ -f "ios/GoogleService-Info.plist" ]; then
    echo "✅ GoogleService-Info.plist found"
else
    echo "⚠️  GoogleService-Info.plist not found (optional - using iosClientId directly)"
fi

echo ""
echo "🧹 Step 2: Cleaning ALL build artifacts..."
rm -rf ios/build 2>/dev/null
rm -rf ios/DerivedData 2>/dev/null
rm -rf ios/Pods 2>/dev/null
rm -rf ios/Podfile.lock 2>/dev/null
rm -rf node_modules/.cache 2>/dev/null
echo "✅ Cleaned"

echo ""
echo "📦 Step 3: Reinstalling CocoaPods (MANDATORY for Expo Bare)..."
cd ios
rm -rf Pods Podfile.lock
pod install
if [ $? -ne 0 ]; then
    echo "❌ pod install failed!"
    cd ..
    exit 1
fi
cd ..
echo "✅ CocoaPods reinstalled"

echo ""
echo "🔨 Step 4: Rebuilding iOS app..."
echo "   This will take 3-5 minutes..."
echo ""
npx expo run:ios

echo ""
echo "✅ Rebuild complete!"
echo ""
echo "📝 IMPORTANT: If error persists, verify in Xcode:"
echo "   1. Open: open ios/HelplineWelfareTrust.xcworkspace"
echo "   2. Select 'HelplineWelfareTrust' target"
echo "   3. Go to 'Info' tab"
echo "   4. Scroll to 'URL Types'"
echo "   5. Ensure URL Scheme exists: $REVERSED_CLIENT_ID"
echo ""
echo "   If not present, click '+' and add:"
echo "   - Identifier: google"
echo "   - URL Schemes: $REVERSED_CLIENT_ID"
