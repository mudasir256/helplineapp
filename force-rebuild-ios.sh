#!/bin/bash

echo "🔧 FORCING COMPLETE iOS REBUILD FOR GOOGLE SIGN-IN"
echo "=================================================="
echo ""

# Stop any running processes
echo "🛑 Step 1: Stopping any running processes..."
pkill -f "expo start" 2>/dev/null
pkill -f "react-native" 2>/dev/null
echo "✅ Stopped"

# Clean everything
echo ""
echo "🧹 Step 2: Cleaning all build artifacts..."
rm -rf ios/build 2>/dev/null
rm -rf ios/DerivedData 2>/dev/null
rm -rf ios/Pods 2>/dev/null
rm -rf ios/Podfile.lock 2>/dev/null
rm -rf node_modules/.cache 2>/dev/null
echo "✅ Cleaned"

# Verify configuration
echo ""
echo "📋 Step 3: Verifying configuration..."
if grep -q "n4ltt9ao229hf7j0iqg4okb5bbhfcnhh" app.json && \
   grep -q "n4ltt9ao229hf7j0iqg4okb5bbhfcnhh" ios/HelplineWelfareTrust/Info.plist; then
    echo "✅ Configuration is correct"
else
    echo "❌ Configuration mismatch! Please check files."
    exit 1
fi

# Regenerate native files
echo ""
echo "🔄 Step 4: Regenerating native files from app.json..."
npx expo prebuild --clean --platform ios

# Install pods
echo ""
echo "📦 Step 5: Installing CocoaPods dependencies..."
cd ios && pod install && cd ..

# Rebuild
echo ""
echo "🔨 Step 6: Rebuilding iOS app..."
echo "   This will take 3-5 minutes. Please wait..."
echo ""
npx expo run:ios

echo ""
echo "✅ Rebuild complete! Google Sign-In should now work."
