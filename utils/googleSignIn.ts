import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';
import { GOOGLE_SIGN_IN_CONFIG } from '../config/constants';

// Helper functions from the documentation
export const isErrorWithCode = (error: any): error is { code: string; message?: string } => {
  return error && typeof error.code === 'string';
};

export const isSuccessResponse = (response: any): boolean => {
  return response && response.type === 'success';
};

export const isNoSavedCredentialFoundResponse = (response: any): boolean => {
  return response && response.type === 'noSavedCredentialFound';
};

export const isCancelledResponse = (response: any): boolean => {
  return response && response.type === 'cancelled';
};

export const initializeGoogleSignIn = (): void => {
  try {
    if (!GOOGLE_SIGN_IN_CONFIG.WEB_CLIENT_ID) {
      console.warn('⚠️ Google Web Client ID not configured');
      return;
    }

    // Configure according to official documentation
    const config: {
      webClientId: string;
      iosClientId?: string;
      offlineAccess: boolean;
      scopes: string[];
    } = {
      webClientId: GOOGLE_SIGN_IN_CONFIG.WEB_CLIENT_ID,
      offlineAccess: GOOGLE_SIGN_IN_CONFIG.OFFLINE_ACCESS,
      scopes: ['profile', 'email'],
    };

    // Set iOS client ID for iOS platform (required for iOS)
    if (Platform.OS === 'ios' && GOOGLE_SIGN_IN_CONFIG.IOS_CLIENT_ID) {
      config.iosClientId = GOOGLE_SIGN_IN_CONFIG.IOS_CLIENT_ID;
    }

    if (__DEV__) {
      console.log('🔧 Google Sign-In Configuration:', {
        platform: Platform.OS,
        hasWebClientId: !!config.webClientId,
        hasIosClientId: !!config.iosClientId,
        iosClientId: Platform.OS === 'ios' ? config.iosClientId : 'N/A',
        offlineAccess: config.offlineAccess,
        scopes: config.scopes,
      });
    }

    GoogleSignin.configure(config);
    console.log('✅ Google Sign-In configured successfully');
  } catch (error) {
    console.error('❌ Error configuring Google Sign-In:', error);
  }
};

export const isGoogleSignInConfigured = (): boolean => {
  return !!GOOGLE_SIGN_IN_CONFIG.WEB_CLIENT_ID;
};

