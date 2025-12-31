import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useLoginMutation, useSignupMutation, useGoogleAuthMutation, User, AuthResponse } from '../store/api/authApi';
import { showToast } from '../utils/toast';

interface AuthUser extends User {
  email: string;
  name?: string;
  picture?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // RTK Query hooks
  const [loginMutation, { isLoading: isLoginLoading }] = useLoginMutation();
  const [signupMutation, { isLoading: isSignupLoading }] = useSignupMutation();
  const [googleAuthMutation] = useGoogleAuthMutation();

  useEffect(() => {
    // Configure Google Sign-In
    const configureGoogleSignIn = async () => {
      try {
        const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
        
        if (!webClientId) {
          console.warn('⚠️ EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID not found in environment variables');
          return;
        }

        GoogleSignin.configure({
          webClientId: webClientId, // From Google Cloud Console - Web Client ID
          iosClientId: webClientId, // For iOS, use the same web client ID (or get iOS client ID from Google Cloud Console)
          offlineAccess: true, // If you want to access Google API on behalf of the user FROM YOUR SERVER
          scopes: ['profile', 'email'],
        });
      } catch (error) {
        console.error('Error configuring Google Sign-In:', error);
      }
    };

    configureGoogleSignIn();
    // Check if user is already logged in
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('token');
      if (userData && token) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await loginMutation({ email, password }).unwrap();
      
      // Log the full response for debugging
      console.log('Login response:', JSON.stringify(response, null, 2));
      
      // Handle different response formats
      let userData: AuthUser | null = null;
      let token: string | undefined = undefined;
      
      // Cast to any to handle different response formats
      const responseAny = response as any;
      
      // Case 1: Response has user object wrapped (expected format)
      if (response.user) {
        userData = {
          email: response.user.email || email,
          name: response.user.name,
          picture: response.user.picture,
          id: response.user.id,
        };
        token = response.token;
      }
      // Case 2: Response IS the user object directly
      else if (responseAny.email || responseAny.id) {
        userData = {
          email: responseAny.email || email,
          name: responseAny.name,
          picture: responseAny.picture,
          id: responseAny.id,
        };
        token = responseAny.token || response.token;
      }
      // Case 3: Response has data property
      else if (responseAny.data) {
        const data = responseAny.data;
        userData = {
          email: data.email || email,
          name: data.name,
          picture: data.picture,
          id: data.id,
        };
        token = data.token || response.token;
      }
      
      if (userData && userData.email) {
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        if (token) {
          await AsyncStorage.setItem('token', token);
        }
        setUser(userData);
        showToast.success('Logged in successfully!', 'Welcome back');
        return true;
      }
      
      console.warn('⚠️ Login succeeded but response format unexpected:', response);
      return false;
    } catch (error: any) {
      console.error('❌ Login error caught:', error);
      console.error('Error type:', typeof error);
      console.error('Error keys:', Object.keys(error || {}));
      
      // Log more details for debugging
      if (error.status === 'FETCH_ERROR') {
        console.error('Network error - Make sure your API server is running');
        console.error('API URL should be accessible from your device/emulator');
      } else if (error.data) {
        console.error('API Error Response Data:', JSON.stringify(error.data, null, 2));
        // Check if error.data actually contains user info (some APIs return user even on "error")
        const errorData = error.data as any;
        if (errorData.email || errorData.id || errorData.user) {
          console.log('⚠️ Error response contains user data, attempting to use it...');
          try {
            const userData: AuthUser = {
              email: errorData.email || errorData.user?.email || email,
              name: errorData.name || errorData.user?.name,
              picture: errorData.picture || errorData.user?.picture,
              id: errorData.id || errorData.user?.id,
            };
            if (userData.email) {
              await AsyncStorage.setItem('user', JSON.stringify(userData));
              if (errorData.token || errorData.user?.token) {
                await AsyncStorage.setItem('token', errorData.token || errorData.user.token);
              }
              setUser(userData);
              showToast.success('Logged in successfully!', 'Welcome back');
              return true;
            }
          } catch (parseError) {
            console.error('Failed to parse user from error response:', parseError);
          }
        }
      } else if (error.error) {
        console.error('API Error Object:', JSON.stringify(error.error, null, 2));
      }
      
      // Log the full error object
      console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      
      // Show user-friendly error message
      let errorMessage = 'Failed to create account. Please try again.';
      if (error.status === 'FETCH_ERROR') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
      showToast.error(errorMessage, 'Signup Failed');
      
      return false;
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const response = await signupMutation({ email, password, name }).unwrap();
      
      // Log the full response for debugging
      console.log('Signup response:', JSON.stringify(response, null, 2));
      
      // Handle different response formats
      let userData: AuthUser | null = null;
      let token: string | undefined = undefined;
      
      // Cast to any to handle different response formats
      const responseAny = response as any;
      
      // Case 1: Response has user object wrapped (expected format)
      if (response.user) {
        userData = {
          email: response.user.email || email,
          name: response.user.name || name,
          picture: response.user.picture,
          id: response.user.id,
        };
        token = response.token;
      }
      // Case 2: Response IS the user object directly
      else if (responseAny.email || responseAny.id) {
        userData = {
          email: responseAny.email || email,
          name: responseAny.name || name,
          picture: responseAny.picture,
          id: responseAny.id,
        };
        token = responseAny.token || response.token;
      }
      // Case 3: Response has data property
      else if (responseAny.data) {
        const data = responseAny.data;
        userData = {
          email: data.email || email,
          name: data.name || name,
          picture: data.picture,
          id: data.id,
        };
        token = data.token || response.token;
      }
      
      if (userData && userData.email) {
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        if (token) {
          await AsyncStorage.setItem('token', token);
        }
        setUser(userData);
        showToast.success('Account created successfully!', 'Welcome');
        return true;
      }
      
      console.warn('⚠️ Signup succeeded but response format unexpected:', response);
      // Even if response format is unexpected, if we have email, create user
      const fallbackUser: AuthUser = {
        email: email,
        name: name,
      };
      await AsyncStorage.setItem('user', JSON.stringify(fallbackUser));
      setUser(fallbackUser);
      showToast.success('Account created successfully!', 'Welcome');
      return true;
    } catch (error: any) {
      console.error('❌ Signup error caught:', error);
      console.error('Error type:', typeof error);
      console.error('Error keys:', Object.keys(error || {}));
      
      // Log more details for debugging
      if (error.status === 'FETCH_ERROR') {
        console.error('Network error - Make sure your API server is running');
        console.error('API URL should be accessible from your device/emulator');
      } else if (error.data) {
        console.error('API Error Response Data:', JSON.stringify(error.data, null, 2));
        // Check if error.data actually contains user info (some APIs return user even on "error")
        const errorData = error.data as any;
        if (errorData.email || errorData.id || errorData.user) {
          console.log('⚠️ Error response contains user data, attempting to use it...');
          try {
            const userData: AuthUser = {
              email: errorData.email || errorData.user?.email || email,
              name: errorData.name || errorData.user?.name || name,
              picture: errorData.picture || errorData.user?.picture,
              id: errorData.id || errorData.user?.id,
            };
            if (userData.email) {
              await AsyncStorage.setItem('user', JSON.stringify(userData));
              if (errorData.token || errorData.user?.token) {
                await AsyncStorage.setItem('token', errorData.token || errorData.user.token);
              }
              setUser(userData);
              showToast.success('Account created successfully!', 'Welcome');
              return true;
            }
          } catch (parseError) {
            console.error('Failed to parse user from error response:', parseError);
          }
        }
      } else if (error.error) {
        console.error('API Error Object:', JSON.stringify(error.error, null, 2));
      }
      
      // Log the full error object
      console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      
      // Show user-friendly error message
      let errorMessage = 'Failed to create account. Please try again.';
      if (error.status === 'FETCH_ERROR') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
      showToast.error(errorMessage, 'Signup Failed');
      
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      setUser(null);
      showToast.success('Logged out successfully', 'Goodbye');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      // Simulate API call - replace with actual password reset
      if (email) {
        // In a real app, you would send a password reset email
        return true;
      }
      return false;
    } catch (error) {
      console.error('Reset password error:', error);
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      // Check if Google Sign-In is configured
      const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
      
      if (!webClientId) {
        showToast.error('Google Client ID not configured', 'Configuration Error');
        console.error('Please set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in your .env file');
        return false;
      }

      // Check if Google Play Services are available (Android only)
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }

      // Sign in with Google
      const userInfo = await GoogleSignin.signIn();
      
      if (!userInfo.data?.user) {
        console.error('No user data received from Google');
        showToast.error('Failed to get Google user information', 'Google Login Error');
        return false;
      }

      const googleUser = userInfo.data.user;
      const googleId = googleUser.id;
      const email = googleUser.email;
      const name = googleUser.name || undefined;
      const picture = googleUser.photo || undefined;

      if (!googleId || !email) {
        console.error('Missing required Google user data');
        showToast.error('Failed to get complete Google user information', 'Google Login Error');
        return false;
      }

      console.log('Google user data received:', { googleId, email, name, picture });

      // Send Google user data to backend
      try {
        const response = await googleAuthMutation({
          googleId: googleId,
          email: email,
          name: name,
          picture: picture,
        }).unwrap();
        
        console.log('Google auth API response:', response);

        if (response.user) {
          const userData: AuthUser = {
            email: response.user.email || '',
            name: response.user.name,
            picture: response.user.picture,
            id: response.user.id,
          };

          await AsyncStorage.setItem('user', JSON.stringify(userData));
          if (response.token) {
            await AsyncStorage.setItem('token', response.token);
          }
          setUser(userData);
          showToast.success('Logged in with Google!', 'Welcome');
          return true;
        }

        showToast.error('Failed to get user information from backend', 'Google Login Error');
        return false;
      } catch (apiError: any) {
        console.error('Google auth API error:', apiError);
        console.error('Error details:', {
          status: apiError.status,
          data: apiError.data,
          error: apiError.error,
        });
        
        // Show specific error message
        let errorMessage = 'Google login failed. Please try again.';
        if (apiError.status === 400) {
          errorMessage = apiError.data?.message || 'Invalid Google token. Please try again.';
        } else if (apiError.status === 'FETCH_ERROR') {
          errorMessage = 'Network error. Please check your connection.';
        } else if (apiError.data?.message) {
          errorMessage = apiError.data.message;
        }
        
        showToast.error(errorMessage, 'Google Login Failed');
        return false;
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      
      // Handle specific Google Sign-In errors
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login flow');
        return false;
      } else if (error.code === statusCodes.IN_PROGRESS) {
        showToast.error('Sign in already in progress', 'Please wait');
        return false;
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        showToast.error('Google Play Services not available', 'Please update Google Play Services');
        return false;
      }
      
      console.error('Error details:', JSON.stringify(error, null, 2));
      showToast.error('Google login failed. Please try again.', 'Login Failed');
      return false;
    }
  };

  const isLoadingState = isLoading || isLoginLoading || isSignupLoading;

  return (
    <AuthContext.Provider value={{ user, isLoading: isLoadingState, login, signup, loginWithGoogle, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

