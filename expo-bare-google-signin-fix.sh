#!/bin/bash

echo "🔧 EXPO BARE: Google Sign-In Fix"
echo "================================"
echo ""

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

# Check GoogleService-Info.plist (optional but recommended)
if [ -f "ios/GoogleService-Info.plist" ]; then
    echo "✅ GoogleService-Info.plist found"
    if grep -q "$REVERSED_CLIENT_ID" ios/GoogleService-Info.plist; then
        echo "✅ REVERSED_CLIENT_ID matches in GoogleService-Info.plist"
    fi
else
    echo "⚠️  GoogleService-Info.plist not found (optional if using iosClientId directly)"
fi

echo ""
echo "🧹 Step 2: Cleaning build artifacts..."
rm -rf ios/build 2>/dev/null
rm -rf ios/DerivedData 2>/dev/null
rm -rf ios/Pods 2>/dev/null
rm -rf ios/Podfile.lock 2>/dev/null
echo "✅ Cleaned"

echo ""
echo "📦 Step 3: Reinstalling CocoaPods (MANDATORY)..."
cd ios
pod install
cd ..

echo ""
echo "🔨 Step 4: Rebuilding iOS app..."
echo "   This will take 3-5 minutes..."
echo ""
npx expo run:ios

echo ""
echo "✅ Done! Google Sign-In should now work."
echo ""
echo "📝 IMPORTANT: If error persists, verify in Xcode:"
echo "   1. Open: open ios/HelplineWelfareTrust.xcworkspace"
echo "   2. Select app target → Info → URL Types"
echo "   3. Ensure URL Scheme: $REVERSED_CLIENT_ID is added"
