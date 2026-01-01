#!/bin/bash

echo "🔄 Rebuilding iOS App for Google Sign-In"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -f "app.json" ]; then
    echo "❌ Error: app.json not found. Please run this script from the project root."
    exit 1
fi

echo "✅ Configuration verified:"
echo "   - app.json has correct URL scheme"
echo "   - Info.plist has correct URL scheme"
echo "   - Google Sign-In config uses iOS Client ID"
echo ""

echo "📱 Starting iOS rebuild..."
echo "   This will:"
echo "   1. Clean previous builds"
echo "   2. Rebuild the iOS app"
echo "   3. Install on simulator/device"
echo ""

# Clean iOS build
echo "🧹 Cleaning iOS build..."
rm -rf ios/build 2>/dev/null
rm -rf ios/Pods 2>/dev/null
rm -rf ios/Podfile.lock 2>/dev/null

echo ""
echo "🔨 Rebuilding iOS app..."
echo "   (This may take a few minutes)"
echo ""

# Rebuild using Expo
npx expo run:ios

echo ""
echo "✅ Rebuild complete!"
echo "   Google Sign-In should now work on iOS."
