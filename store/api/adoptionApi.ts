import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAdoptionApiBaseUrl } from '../../config/api';
import { APP_CONFIG } from '../../config/constants';

// Base interfaces
export interface AdoptionItem {
  id?: string | number;
  _id?: string;
  name?: string;
  title?: string;
  description?: string;
  amount?: number;
  status?: string;
  adopted?: boolean;
  adoptedBy?: string;
  adoptedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  // Health specific
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
  medicalCondition?: string;
  hospitalName?: string;
  hospitalAddress?: string;
  doctorName?: string;
  treatmentType?: string;
  urgencyLevel?: string;
  amountNeeded?: number;
  amountRaised?: number;
  contactPhone?: string;
  contactEmail?: string;
  contactPersonName?: string;
  // Higher Education specific
  studentName?: string;
  studentAge?: number;
  studentGender?: string;
  fieldOfStudy?: string;
  currentInstitution?: string;
  currentSemester?: string;
  CGPA?: number;
  familyIncome?: number;
  studentPhone?: string;
  studentEmail?: string;
  // School Student specific
  currentClass?: string;
  currentSchool?: string;
  schoolAddress?: string;
  academicPerformance?: string;
  lastYearPercentage?: number;
  guardianPhone?: string;
  guardianEmail?: string;
  // Welfare specific
  projectName?: string;
  category?: string;
  organizerType?: string;
  targetBeneficiaries?: number;
  currentBeneficiaries?: number;
  volunteersNeeded?: number;
  currentVolunteers?: number;
  // Common fields
  location?: string;
  address?: string;
  city?: string;
  [key: string]: any; // Allow additional fields
}

export interface AdoptionListResponse {
  success: boolean;
  data: AdoptionItem[];
  count?: number;
}

export interface AdoptionResponse {
  success: boolean;
  data: AdoptionItem;
  message?: string;
}

// Custom base query for Adoption APIs (uses port 5001)
const baseQuery = fetchBaseQuery({
  baseUrl: getAdoptionApiBaseUrl(),
  prepareHeaders: async (headers) => {
    headers.set('Content-Type', 'application/json');
    
    // Get token from AsyncStorage
    try {
      // Try accessToken first (from APP_CONFIG), then fallback to 'token'
      const accessToken = await AsyncStorage.getItem(APP_CONFIG.ACCESS_TOKEN_KEY);
      const token = await AsyncStorage.getItem('token');
      
      // Use accessToken if available, otherwise fallback to token
      const authToken = accessToken || token;
      
      if (authToken) {
        headers.set('Authorization', `Bearer ${authToken}`);
        if (__DEV__) {
          console.log('✅ Added auth token to adoption API request');
        }
      } else {
        if (__DEV__) {
          console.warn('⚠️ No auth token found for adoption API request');
        }
      }
    } catch (error) {
      console.error('Error getting token for adoption API:', error);
    }
    
    return headers;
  },
  timeout: 10000, // 10 second timeout
});

// Base query with error handling
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  const result = await baseQuery(args, api, extraOptions);
  
  const requestUrl = typeof args === 'string' ? args : (args as any)?.url || 'unknown';
  const fullUrl = `${getAdoptionApiBaseUrl()}${requestUrl}`;
  
  if (__DEV__) {
    console.log('🔍 API Raw Result:', {
      url: requestUrl,
      fullUrl: fullUrl,
      data: result.data,
      error: result.error,
      status: result.meta?.response?.status,
    });
  }
  
  // Handle errors
  if (result.error) {
    const errorMessage = result.error as any;
    console.error('❌ API Error:', {
      error: errorMessage,
      fullUrl: fullUrl,
      message: errorMessage?.error || errorMessage?.message || 'Unknown error',
    });
    
    // Provide helpful troubleshooting info
    if (errorMessage?.error?.includes('Network request failed') || 
        errorMessage?.error?.includes('timed out') ||
        errorMessage?.status === 'FETCH_ERROR') {
      console.error('💡 Troubleshooting Network Error:');
      console.error(`   1. Backend URL: ${fullUrl}`);
      console.error('   2. Make sure your backend is running on port 3001');
      console.error('   3. For physical devices, use your computer IP instead of localhost');
      console.error('   4. Check both devices are on the same Wi-Fi network');
      console.error('   5. Verify firewall is not blocking port 3001');
    }
    return result;
  }
  
  // Handle successful responses
  if (result.data) {
    if (__DEV__) {
      console.log('📦 Raw API Response:', JSON.stringify(result.data, null, 2));
    }
    
    // If response has { success, data } structure, return as is
    if (typeof result.data === 'object' && result.data !== null) {
      if ('success' in result.data && 'data' in result.data) {
        const responseData = result.data as { success: boolean; data: any; count?: number };
        if (__DEV__) {
          console.log('✅ API Response Structure (success/data):', {
            success: responseData.success,
            dataLength: Array.isArray(responseData.data) ? responseData.data.length : 'not array',
            count: responseData.count,
            firstItem: Array.isArray(responseData.data) && responseData.data.length > 0 ? responseData.data[0] : 'no items',
          });
        }
        return { data: responseData, meta: result.meta };
      }
      // If response is direct array, wrap it
      if (Array.isArray(result.data)) {
        if (__DEV__) {
          console.log('✅ API Response is Direct Array, wrapping:', {
            arrayLength: result.data.length,
            firstItem: result.data.length > 0 ? result.data[0] : 'no items',
          });
        }
        return { 
          data: { success: true, data: result.data, count: result.data.length }, 
          meta: result.meta 
        };
      }
      // If response is an object but not the expected structure, try to extract data
      if (typeof result.data === 'object') {
        if (__DEV__) {
          console.log('⚠️ Unexpected response structure, attempting to extract data:', Object.keys(result.data));
        }
      }
    }
  }
  
  if (result.meta?.response) {
    const status = result.meta.response.status;
    if (status >= 200 && status < 300 && result.data) {
      if (__DEV__) {
        console.log('✅ Status 200-299, returning data as-is');
      }
      return { data: result.data, meta: result.meta };
    }
  }
  
  if (__DEV__) {
    console.warn('⚠️ No data transformation applied, returning raw result');
  }
  return result;
};

// Unified Adoption API with all categories
export const adoptionApi = createApi({
  reducerPath: 'adoptionApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['HealthAdoption', 'HigherEducationAdoption', 'SchoolAdoption', 'WelfareAdoption'],
  endpoints: (builder) => ({
    // ========== Health Adoption ==========
    listHealthItems: builder.query<AdoptionListResponse, void>({
      query: () => '/api/adopt-health',
      transformResponse: (response: any) => {
        if (__DEV__) {
          console.log('🔄 Health transformResponse input:', {
            type: typeof response,
            isArray: Array.isArray(response),
            hasSuccess: response?.success,
            hasData: response?.data,
            keys: typeof response === 'object' ? Object.keys(response) : 'not object',
          });
        }
        
        // Handle both { success: true, data: [...] } and direct array
        if (response?.success && response?.data) {
          if (__DEV__) {
            console.log('✅ Health: Using success/data structure, data count:', response.data?.length || 0);
          }
          return response;
        }
        
        // If response is a direct array
        if (Array.isArray(response)) {
          if (__DEV__) {
            console.log('✅ Health: Response is array, wrapping. Count:', response.length);
          }
          return { success: true, data: response, count: response.length };
        }
        
        // Fallback
        if (__DEV__) {
          console.log('⚠️ Health: Unexpected response format, creating empty array');
        }
        return { success: true, data: response || [], count: Array.isArray(response) ? response.length : 0 };
      },
      providesTags: (result) =>
        result && result.data
          ? [
              ...result.data.map((item: AdoptionItem) => ({ type: 'HealthAdoption' as const, id: item.id || item._id })),
              { type: 'HealthAdoption' as const, id: 'LIST' },
            ]
          : [{ type: 'HealthAdoption' as const, id: 'LIST' }],
    }),

    getHealthItem: builder.query<AdoptionResponse, string | number>({
      query: (id) => `/api/adopt-health/${id}`,
      transformResponse: (response: any) => {
        if (response?.success && response?.data) {
          return response;
        }
        return { success: true, data: response };
      },
      providesTags: (result, error, id) => [{ type: 'HealthAdoption' as const, id: String(id) }],
    }),

    adoptHealthItem: builder.mutation<AdoptionResponse, { id: string | number; adopterName: string; adopterEmail: string; adopterPhone: string }>({
      query: ({ id, adopterName, adopterEmail, adopterPhone }) => ({
        url: `/api/adopt-health/${id}/adopt`,
        method: 'POST',
        body: { 
          email: adopterEmail, // Backend will find user by email and save only user ID
          // Keep adopterName and adopterPhone for backward compatibility if backend needs them
          adopterName,
          adopterEmail,
          adopterPhone,
        },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'HealthAdoption' as const, id: String(id) }, { type: 'HealthAdoption' as const, id: 'LIST' }, { type: 'HealthAdoption' as const, id: 'MY_ADOPTIONS' }],
    }),

    getMyHealthAdoptions: builder.query<AdoptionListResponse, { userId?: string; email?: string; phone?: string }>({
      query: ({ userId, email, phone }) => {
        const params = new URLSearchParams();
        if (userId) params.append('userId', userId);
        if (email) params.append('email', email);
        if (phone) params.append('phone', phone);
        return `/api/adopt-health/my-adoptions?${params.toString()}`;
      },
      transformResponse: (response: any) => {
        if (response?.success && response?.data) {
          return response;
        }
        if (Array.isArray(response)) {
          return { success: true, data: response, count: response.length };
        }
        return { success: true, data: response?.data || [], count: response?.count || 0 };
      },
      providesTags: [{ type: 'HealthAdoption' as const, id: 'MY_ADOPTIONS' }],
    }),

    unadoptHealthItem: builder.mutation<AdoptionResponse, { id: string | number; userId?: string; email?: string; phone?: string }>({
      query: ({ id, userId, email, phone }) => {
        const params = new URLSearchParams();
        if (userId) params.append('userId', userId);
        if (email) params.append('email', email);
        if (phone) params.append('phone', phone);
        return {
          url: `/api/adopt-health/${id}/unadopt?${params.toString()}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'HealthAdoption' as const, id: String(id) }, { type: 'HealthAdoption' as const, id: 'LIST' }, { type: 'HealthAdoption' as const, id: 'MY_ADOPTIONS' }],
    }),

    // ========== Higher Education Adoption ==========
    listHigherEducationItems: builder.query<AdoptionListResponse, void>({
      query: () => '/api/adopt-higher-education',
      transformResponse: (response: any) => {
        if (response?.success && response?.data) {
          return response;
        }
        return { success: true, data: response || [], count: Array.isArray(response) ? response.length : 0 };
      },
      providesTags: (result) =>
        result && result.data
          ? [
              ...result.data.map((item: AdoptionItem) => ({ type: 'HigherEducationAdoption' as const, id: item.id || item._id })),
              { type: 'HigherEducationAdoption' as const, id: 'LIST' },
            ]
          : [{ type: 'HigherEducationAdoption' as const, id: 'LIST' }],
    }),

    getHigherEducationItem: builder.query<AdoptionResponse, string | number>({
      query: (id) => `/api/adopt-higher-education/${id}`,
      transformResponse: (response: any) => {
        if (response?.success && response?.data) {
          return response;
        }
        return { success: true, data: response };
      },
      providesTags: (result, error, id) => [{ type: 'HigherEducationAdoption' as const, id: String(id) }],
    }),

    adoptHigherEducationItem: builder.mutation<AdoptionResponse, { id: string | number; adopterName: string; adopterEmail: string; adopterPhone: string }>({
      query: ({ id, adopterName, adopterEmail, adopterPhone }) => ({
        url: `/api/adopt-higher-education/${id}/adopt`,
        method: 'POST',
        body: { 
          email: adopterEmail, // Backend will find user by email and save only user ID
          adopterName,
          adopterEmail,
          adopterPhone,
        },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'HigherEducationAdoption' as const, id: String(id) }, { type: 'HigherEducationAdoption' as const, id: 'LIST' }, { type: 'HigherEducationAdoption' as const, id: 'MY_ADOPTIONS' }],
    }),

    getMyHigherEducationAdoptions: builder.query<AdoptionListResponse, { userId?: string; email?: string; phone?: string }>({
      query: ({ userId, email, phone }) => {
        const params = new URLSearchParams();
        if (userId) params.append('userId', userId);
        if (email) params.append('email', email);
        if (phone) params.append('phone', phone);
        return `/api/adopt-higher-education/my-adoptions?${params.toString()}`;
      },
      transformResponse: (response: any) => {
        if (response?.success && response?.data) {
          return response;
        }
        if (Array.isArray(response)) {
          return { success: true, data: response, count: response.length };
        }
        return { success: true, data: response?.data || [], count: response?.count || 0 };
      },
      providesTags: [{ type: 'HigherEducationAdoption' as const, id: 'MY_ADOPTIONS' }],
    }),

    unadoptHigherEducationItem: builder.mutation<AdoptionResponse, { id: string | number; userId?: string; email?: string; phone?: string }>({
      query: ({ id, userId, email, phone }) => {
        const params = new URLSearchParams();
        if (userId) params.append('userId', userId);
        if (email) params.append('email', email);
        if (phone) params.append('phone', phone);
        return {
          url: `/api/adopt-higher-education/${id}/unadopt?${params.toString()}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'HigherEducationAdoption' as const, id: String(id) }, { type: 'HigherEducationAdoption' as const, id: 'LIST' }, { type: 'HigherEducationAdoption' as const, id: 'MY_ADOPTIONS' }],
    }),

    // ========== School Adoption ==========
    listSchoolItems: builder.query<AdoptionListResponse, void>({
      query: () => '/api/adopt-school',
      transformResponse: (response: any) => {
        if (__DEV__) {
          console.log('🔄 School transformResponse:', {
            hasSuccess: response?.success,
            hasData: response?.data,
            isArray: Array.isArray(response),
          });
        }
        if (response?.success && response?.data) {
          return response;
        }
        if (Array.isArray(response)) {
          return { success: true, data: response, count: response.length };
        }
        return { success: true, data: response || [], count: Array.isArray(response) ? response.length : 0 };
      },
      providesTags: (result) =>
        result && result.data
          ? [
              ...result.data.map((item: AdoptionItem) => ({ type: 'SchoolAdoption' as const, id: item.id || item._id })),
              { type: 'SchoolAdoption' as const, id: 'LIST' },
            ]
          : [{ type: 'SchoolAdoption' as const, id: 'LIST' }],
    }),

    getSchoolItem: builder.query<AdoptionResponse, string | number>({
      query: (id) => `/api/adopt-school/${id}`,
      transformResponse: (response: any) => {
        if (response?.success && response?.data) {
          return response;
        }
        return { success: true, data: response };
      },
      providesTags: (result, error, id) => [{ type: 'SchoolAdoption' as const, id: String(id) }],
    }),

    adoptSchoolItem: builder.mutation<AdoptionResponse, { id: string | number; adopterName: string; adopterEmail: string; adopterPhone: string }>({
      query: ({ id, adopterName, adopterEmail, adopterPhone }) => ({
        url: `/api/adopt-school/${id}/adopt`,
        method: 'POST',
        body: { 
          email: adopterEmail, // Backend will find user by email and save only user ID
          adopterName,
          adopterEmail,
          adopterPhone,
        },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'SchoolAdoption' as const, id: String(id) }, { type: 'SchoolAdoption' as const, id: 'LIST' }, { type: 'SchoolAdoption' as const, id: 'MY_ADOPTIONS' }],
    }),

    getMySchoolAdoptions: builder.query<AdoptionListResponse, { userId?: string; email?: string; phone?: string }>({
      query: ({ userId, email, phone }) => {
        const params = new URLSearchParams();
        if (userId) params.append('userId', userId);
        if (email) params.append('email', email);
        if (phone) params.append('phone', phone);
        return `/api/adopt-school/my-adoptions?${params.toString()}`;
      },
      transformResponse: (response: any) => {
        if (response?.success && response?.data) {
          return response;
        }
        if (Array.isArray(response)) {
          return { success: true, data: response, count: response.length };
        }
        return { success: true, data: response?.data || [], count: response?.count || 0 };
      },
      providesTags: [{ type: 'SchoolAdoption' as const, id: 'MY_ADOPTIONS' }],
    }),

    unadoptSchoolItem: builder.mutation<AdoptionResponse, { id: string | number; userId?: string; email?: string; phone?: string }>({
      query: ({ id, userId, email, phone }) => {
        const params = new URLSearchParams();
        if (userId) params.append('userId', userId);
        if (email) params.append('email', email);
        if (phone) params.append('phone', phone);
        return {
          url: `/api/adopt-school/${id}/unadopt?${params.toString()}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'SchoolAdoption' as const, id: String(id) }, { type: 'SchoolAdoption' as const, id: 'LIST' }, { type: 'SchoolAdoption' as const, id: 'MY_ADOPTIONS' }],
    }),

    // ========== Welfare Adoption ==========
    listWelfareItems: builder.query<AdoptionListResponse, void>({
      query: () => '/api/adopt-welfare',
      transformResponse: (response: any) => {
        if (__DEV__) {
          console.log('🔄 Welfare transformResponse:', {
            hasSuccess: response?.success,
            hasData: response?.data,
            isArray: Array.isArray(response),
          });
        }
        if (response?.success && response?.data) {
          return response;
        }
        if (Array.isArray(response)) {
          return { success: true, data: response, count: response.length };
        }
        return { success: true, data: response || [], count: Array.isArray(response) ? response.length : 0 };
      },
      providesTags: (result) =>
        result && result.data
          ? [
              ...result.data.map((item: AdoptionItem) => ({ type: 'WelfareAdoption' as const, id: item.id || item._id })),
              { type: 'WelfareAdoption' as const, id: 'LIST' },
            ]
          : [{ type: 'WelfareAdoption' as const, id: 'LIST' }],
    }),

    getWelfareItem: builder.query<AdoptionResponse, string | number>({
      query: (id) => `/api/adopt-welfare/${id}`,
      transformResponse: (response: any) => {
        if (response?.success && response?.data) {
          return response;
        }
        return { success: true, data: response };
      },
      providesTags: (result, error, id) => [{ type: 'WelfareAdoption' as const, id: String(id) }],
    }),

    adoptWelfareItem: builder.mutation<AdoptionResponse, { id: string | number; adopterName: string; adopterEmail: string; adopterPhone: string }>({
      query: ({ id, adopterName, adopterEmail, adopterPhone }) => ({
        url: `/api/adopt-welfare/${id}/adopt`,
        method: 'POST',
        body: { 
          email: adopterEmail, // Backend will find user by email and save only user ID
          adopterName,
          adopterEmail,
          adopterPhone,
        },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'WelfareAdoption' as const, id: String(id) }, { type: 'WelfareAdoption' as const, id: 'LIST' }, { type: 'WelfareAdoption' as const, id: 'MY_ADOPTIONS' }],
    }),

    getMyWelfareAdoptions: builder.query<AdoptionListResponse, { userId?: string; email?: string; phone?: string }>({
      query: ({ userId, email, phone }) => {
        const params = new URLSearchParams();
        if (userId) params.append('userId', userId);
        if (email) params.append('email', email);
        if (phone) params.append('phone', phone);
        return `/api/adopt-welfare/my-adoptions?${params.toString()}`;
      },
      transformResponse: (response: any) => {
        if (response?.success && response?.data) {
          return response;
        }
        if (Array.isArray(response)) {
          return { success: true, data: response, count: response.length };
        }
        return { success: true, data: response?.data || [], count: response?.count || 0 };
      },
      providesTags: [{ type: 'WelfareAdoption' as const, id: 'MY_ADOPTIONS' }],
    }),

    unadoptWelfareItem: builder.mutation<AdoptionResponse, { id: string | number; userId?: string; email?: string; phone?: string }>({
      query: ({ id, userId, email, phone }) => {
        const params = new URLSearchParams();
        if (userId) params.append('userId', userId);
        if (email) params.append('email', email);
        if (phone) params.append('phone', phone);
        return {
          url: `/api/adopt-welfare/${id}/unadopt?${params.toString()}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'WelfareAdoption' as const, id: String(id) }, { type: 'WelfareAdoption' as const, id: 'LIST' }, { type: 'WelfareAdoption' as const, id: 'MY_ADOPTIONS' }],
    }),
  }),
});

// Export hooks for Health (GET queries + adopt mutation only)
export const {
  useListHealthItemsQuery,
  useGetHealthItemQuery,
  useAdoptHealthItemMutation,
  useGetMyHealthAdoptionsQuery,
  useUnadoptHealthItemMutation,
  useLazyListHealthItemsQuery,
  useLazyGetHealthItemQuery,
  useLazyGetMyHealthAdoptionsQuery,
} = adoptionApi;

// Export hooks for Higher Education (GET queries + adopt mutation only)
export const {
  useListHigherEducationItemsQuery,
  useGetHigherEducationItemQuery,
  useAdoptHigherEducationItemMutation,
  useGetMyHigherEducationAdoptionsQuery,
  useUnadoptHigherEducationItemMutation,
  useLazyListHigherEducationItemsQuery,
  useLazyGetHigherEducationItemQuery,
  useLazyGetMyHigherEducationAdoptionsQuery,
} = adoptionApi;

// Export hooks for School (GET queries + adopt mutation only)
export const {
  useListSchoolItemsQuery,
  useGetSchoolItemQuery,
  useAdoptSchoolItemMutation,
  useGetMySchoolAdoptionsQuery,
  useUnadoptSchoolItemMutation,
  useLazyListSchoolItemsQuery,
  useLazyGetSchoolItemQuery,
  useLazyGetMySchoolAdoptionsQuery,
} = adoptionApi;

// Export hooks for Welfare (GET queries + adopt mutation only)
export const {
  useListWelfareItemsQuery,
  useGetWelfareItemQuery,
  useAdoptWelfareItemMutation,
  useGetMyWelfareAdoptionsQuery,
  useUnadoptWelfareItemMutation,
  useLazyListWelfareItemsQuery,
  useLazyGetWelfareItemQuery,
  useLazyGetMyWelfareAdoptionsQuery,
} = adoptionApi;
