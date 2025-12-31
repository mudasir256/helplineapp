# Helpline Welfare Trust - Student Support App

A React Native Expo app for Helpline Welfare Trust to support students with authentication and home screen.

## Features

- 🔐 User Authentication (Login, Sign Up, Forgot Password)
- 🏠 Protected Home Screen
- 📱 Modern UI/UX Design
- 🔄 Persistent Authentication State

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on your device:
   - Scan the QR code with Expo Go app (iOS/Android)
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser

## Project Structure

```
helplineApp/
├── App.tsx                 # Main app entry point
├── app.json                # Expo configuration
├── package.json            # Dependencies
├── contexts/
│   └── AuthContext.tsx     # Authentication context
├── screens/
│   ├── LoginScreen.tsx     # Login screen
│   ├── SignUpScreen.tsx    # Sign up screen
│   ├── ForgotPasswordScreen.tsx  # Forgot password screen
│   └── HomeScreen.tsx      # Home screen (protected)
└── navigation/
    └── AppNavigator.tsx    # Navigation setup
```

## Authentication Flow

1. **Login Screen**: Users can log in with email and password
2. **Sign Up Screen**: New users can create an account
3. **Forgot Password Screen**: Users can request password reset
4. **Home Screen**: Protected screen accessible only after authentication

## Notes

- Authentication is currently using local storage (AsyncStorage) for demo purposes
- Replace the authentication logic in `AuthContext.tsx` with your actual backend API
- The app uses React Navigation for screen navigation
- All screens are responsive and follow modern design principles

## License

This project is created for Helpline Welfare Trust.

