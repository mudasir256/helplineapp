# How to Fix Google Sign-In URL Scheme Error

## The Problem
Your app is showing: "Your app is missing support for the following URL schemes: com.googleusercontent.apps.909435925564-n4ltt9ao229hf7j0iqg4okb5bbhfcnhh"

## The Solution
The configuration files are correct, but the **running app** still has the old configuration. You MUST rebuild the iOS app.

## Step-by-Step Instructions

### Method 1: Using Expo CLI (Recommended)

1. **Stop the current Expo server:**
   - Find the terminal where `expo start` is running
   - Press `Ctrl+C` to stop it

2. **Clean and rebuild:**
   ```bash
   cd /Users/irfanayaz/Desktop/helplineApp
   npx expo run:ios
   ```

3. **Wait for the build to complete** (this may take a few minutes)

4. **Test Google Sign-In** - it should work now!

### Method 2: Using Xcode

1. **Open the workspace:**
   ```bash
   open ios/HelplineWelfareTrust.xcworkspace
   ```

2. **Clean the build:**
   - In Xcode: `Product` → `Clean Build Folder` (or press `Cmd+Shift+K`)

3. **Build and run:**
   - In Xcode: `Product` → `Run` (or press `Cmd+R`)

4. **Test Google Sign-In** - it should work now!

## Why This Is Necessary

- The `Info.plist` file has been updated correctly
- The `app.json` file has been updated correctly
- BUT: The running app was built BEFORE these changes
- iOS apps read the URL schemes from the compiled app bundle
- You must rebuild to include the new URL scheme in the app bundle

## Verification

After rebuilding, the error should disappear and Google Sign-In should work!

