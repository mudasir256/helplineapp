import { Platform } from 'react-native';

// Auth API base URL (port 5001)
export const getApiBaseUrl = (): string => {
  if (__DEV__) {
    const API_IP = '192.168.100.56';
    const API_PORT = '5001';
    return `http://${API_IP}:${API_PORT}`;
  }
  return 'https://your-production-api.com';
};

// Adoption API base URL (port 3001)
export const getAdoptionApiBaseUrl = (): string => {
  if (__DEV__) {
    const API_IP = '192.168.100.56';
    const API_PORT = '5001';
    return `http://${API_IP}:${API_PORT}`;
  }
  return 'https://your-production-api.com';
};

export const API_BASE_URL = getApiBaseUrl();
export const ADOPTION_API_BASE_URL = getAdoptionApiBaseUrl();

if (__DEV__) {
  console.log('🌐 Auth API Base URL (port 5001):', API_BASE_URL);
  console.log('🌐 Adoption API Base URL (port 3001):', ADOPTION_API_BASE_URL);
  console.log('📱 Platform:', Platform.OS);
  console.log('💡 Make sure both API servers are running!');
}

