export const GOOGLE_SIGN_IN_CONFIG = {
  WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
  IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '909435925564-n4ltt9ao229hf7j0iqg4okb5bbhfcnhh.apps.googleusercontent.com',
  OFFLINE_ACCESS: true,
};

export const APP_CONFIG = {
  ACCESS_TOKEN_KEY: 'accessToken',
  USER_STORAGE_KEY: 'user',
  REFRESH_TOKEN_KEY: 'refreshToken',
};

