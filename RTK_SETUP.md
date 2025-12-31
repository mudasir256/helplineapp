# RTK Query & Google Sign-In Setup

## Overview
This app now uses Redux Toolkit Query (RTK Query) for API calls and `@react-native-google-signin/google-signin` for Google authentication.

## API Endpoints
- **Login**: `POST http://localhost:3000/api/auth/login`
- **Sign Up**: `POST http://localhost:3000/api/users`
- **Google Auth**: `POST http://localhost:3000/api/auth/google`

## Configuration Required

### 1. Google Sign-In Setup

**Important**: `@react-native-google-signin/google-signin` requires native code and **does NOT work with Expo Go**. You need to create a development build:

```bash
npx expo prebuild
npx expo run:android  # or npx expo run:ios
```

Update the Google Client ID in `contexts/AuthContext.tsx`:
```typescript
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID', // Replace with your Google OAuth Web Client ID
  offlineAccess: true,
  scopes: ['profile', 'email'],
});
```

### 2. API Base URL

The API base URL is automatically configured in `config/api.ts` based on the platform:

- **Android Emulator**: `http://10.0.2.2:3000` (automatically set)
- **iOS Simulator**: `http://localhost:3000` (automatically set)
- **Physical Devices**: You need to update `config/api.ts` with your computer's IP address

**To find your computer's IP address:**
- **macOS/Linux**: Run `ifconfig` or `ip addr` and look for your local network IP (usually starts with 192.168.x.x or 10.x.x.x)
- **Windows**: Run `ipconfig` and look for IPv4 Address

**To use your IP address on physical devices**, update `config/api.ts`:
```typescript
if (Platform.OS === 'android') {
  return 'http://192.168.1.100:3000'; // Replace with your computer's IP
}
```

**Important**: Make sure your API server is running and accessible from your device/emulator!

## API Request/Response Format

### Login Request
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Sign Up Request
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

### Google Auth Request
```json
{
  "idToken": "google_id_token",
  "accessToken": "optional_access_token"
}
```

### Auth Response
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "profile_picture_url"
  },
  "token": "jwt_token"
}
```

## Usage

The authentication context (`AuthContext`) now uses RTK Query hooks internally. The API is the same:

```typescript
const { login, signup, loginWithGoogle, logout } = useAuth();
```

All functions return `Promise<boolean>` (except `logout` which returns `Promise<void>`).

