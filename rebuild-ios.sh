#!/bin/bash
echo "🔄 Rebuilding iOS app with updated Google Sign-In configuration..."
echo ""
echo "This will:"
echo "  1. Clean the build folder"
echo "  2. Rebuild the iOS app"
echo "  3. Install the app on simulator/device"
echo ""
echo "Starting rebuild..."
npx expo run:ios
