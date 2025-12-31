import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getApiBaseUrl } from '../../config/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface GoogleAuthRequest {
  googleId: string;
  email: string;
  name?: string;
  picture?: string;
}

export interface User {
  id?: string;
  email: string;
  name?: string;
  picture?: string;
  token?: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
  message?: string;
}

// Custom base query to handle different response formats
const baseQuery = fetchBaseQuery({
  baseUrl: getApiBaseUrl(),
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Wrapper to handle different status codes and response formats
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  const result = await baseQuery(args, api, extraOptions);
  
  // Log the raw result for debugging
  if (__DEV__) {
    console.log('API Raw Result:', {
      data: result.data,
      error: result.error,
      meta: result.meta,
    });
  }
  
  // If we have data, even with a non-200 status, check if it's actually a success
  // Some APIs return 201 (Created) for signup which is still success
  if (result.meta?.response) {
    const status = result.meta.response.status;
    // Accept 200-299 as success
    if (status >= 200 && status < 300 && result.data) {
      return { data: result.data, meta: result.meta };
    }
  }
  
  return result;
};

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse | any, LoginRequest>({
      query: (credentials) => ({
        url: '/api/auth/login',
        method: 'POST',
        body: credentials,
      }),
      // Transform response to handle different formats
      transformResponse: (response: any, meta, arg) => {
        console.log('Raw login API response:', response);
        console.log('Response status:', meta?.response?.status);
        
        // If response already has user property, return as is
        if (response.user) {
          return response;
        }
        
        // If response is the user object directly, wrap it
        if (response.email || response.id) {
          return {
            user: {
              email: response.email,
              name: response.name,
              picture: response.picture,
              id: response.id,
            },
            token: response.token,
          };
        }
        
        // If response has data property
        if (response.data) {
          return {
            user: response.data,
            token: response.token || response.data.token,
          };
        }
        
        // Return response as is if format is unknown
        return response;
      },
    }),
    signup: builder.mutation<AuthResponse | any, SignupRequest>({
      query: (userData) => ({
        url: '/api/users',
        method: 'POST',
        body: userData,
      }),
      // Transform response to handle different formats
      transformResponse: (response: any, meta, arg) => {
        console.log('Raw signup API response:', response);
        console.log('Response status:', meta?.response?.status);
        
        // If response already has user property, return as is
        if (response.user) {
          return response;
        }
        
        // If response is the user object directly, wrap it
        if (response.email || response.id) {
          return {
            user: {
              email: response.email,
              name: response.name,
              picture: response.picture,
              id: response.id,
            },
            token: response.token,
          };
        }
        
        // If response has data property
        if (response.data) {
          return {
            user: response.data,
            token: response.token || response.data.token,
          };
        }
        
        // Return response as is if format is unknown
        return response;
      },
    }),
    googleAuth: builder.mutation<AuthResponse | any, GoogleAuthRequest>({
      query: (googleData) => ({
        url: '/api/auth/google',
        method: 'POST',
        body: googleData,
      }),
      // Transform response to handle different formats
      transformResponse: (response: any, meta, arg) => {
        console.log('Raw Google auth API response:', response);
        console.log('Response status:', meta?.response?.status);
        
        // If response already has user property, return as is
        if (response.user) {
          return response;
        }
        
        // If response is the user object directly, wrap it
        if (response.email || response.id) {
          return {
            user: {
              email: response.email,
              name: response.name,
              picture: response.picture,
              id: response.id,
            },
            token: response.token,
          };
        }
        
        // If response has data property
        if (response.data) {
          return {
            user: response.data,
            token: response.token || response.data.token,
          };
        }
        
        // Return response as is if format is unknown
        return response;
      },
    }),
  }),
});

export const { useLoginMutation, useSignupMutation, useGoogleAuthMutation } = authApi;

