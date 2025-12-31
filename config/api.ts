import { Platform } from 'react-native';

// Get the API base URL based on the environment
export const getApiBaseUrl = (): string => {
  if (__DEV__) {
    // Development mode - using your computer's IP address
    const API_IP = '192.168.100.31';
    const API_PORT = '3000';
    return `http://${API_IP}:${API_PORT}`;
  }
  // Production mode - update this with your production API URL
  return 'https://your-production-api.com';
};

// Export the base URL - call function to get current URL
export const API_BASE_URL = getApiBaseUrl();

// Log the API URL in development for debugging
if (__DEV__) {
  console.log('🌐 API Base URL:', API_BASE_URL);
  console.log('📱 Platform:', Platform.OS);
  console.log('💡 Make sure your API server is running on this URL!');
}

