import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import {
  useGetMyHealthAdoptionsQuery,
  useGetMyHigherEducationAdoptionsQuery,
  useGetMySchoolAdoptionsQuery,
  useGetMyWelfareAdoptionsQuery,
  useUnadoptHealthItemMutation,
  useUnadoptHigherEducationItemMutation,
  useUnadoptSchoolItemMutation,
  useUnadoptWelfareItemMutation,
  AdoptionItem,
} from '../store/api/adoptionApi';

export interface AdoptedItem {
  id: string;
  name: string;
  age?: number;
  location: string;
  need: string;
  amount: number;
  amountNeeded?: number;
  domain: string;
  adoptedDate: string;
  description: string;
}

interface AdoptionContextType {
  adoptedItems: AdoptedItem[];
  adoptItem: (item: AdoptedItem) => Promise<void>;
  removeAdoptedItem: (id: string, domain: string) => Promise<void>;
  isLoading: boolean;
  refetchAdoptions: () => void;
}

const AdoptionContext = createContext<AdoptionContextType | undefined>(undefined);

// Helper function to convert API AdoptionItem to AdoptedItem
const convertToAdoptedItem = (item: AdoptionItem, domain: string): AdoptedItem => {
  const itemId = String(item.id || item._id || '');
  const itemName = item.name || item.title || item.patientName || item.studentName || item.projectName || 'Unknown';
  const itemAge = item.age || item.patientAge || item.studentAge || 0;
  const itemLocation = item.location || item.address || item.city || item.hospitalAddress || item.institutionAddress || item.schoolAddress || 'Location not specified';
  const itemDescription = item.description || 'No description available';
  const itemAmount = item.amount || item.estimatedCost || item.totalTuitionFee || item.annualTuitionFee || item.totalBudget || 0;
  const amountNeeded = item.amountNeeded || (itemAmount > 0 && item.amountRaised ? itemAmount - item.amountRaised : itemAmount);

  return {
    id: itemId,
    name: itemName,
    age: itemAge > 0 ? itemAge : undefined,
    location: itemLocation,
    need: item.need || item.title || 'Support',
    amount: itemAmount,
    amountNeeded: amountNeeded,
    domain: domain,
    adoptedDate: item.adoptedAt || new Date().toISOString(),
    description: itemDescription,
  };
};

export const AdoptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [adoptedItems, setAdoptedItems] = useState<AdoptedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize user identifier to prevent infinite loops
  const userIdentifier = useMemo(() => {
    if (!user) return undefined;
    return {
      userId: user.id,
      email: user.email,
    };
  }, [user?.id, user?.email]);

  // Fetch adoptions from backend for each category
  const { data: healthData, isLoading: isLoadingHealth, refetch: refetchHealth } = useGetMyHealthAdoptionsQuery(
    userIdentifier || { email: '' },
    { skip: !userIdentifier }
  );
  
  const { data: higherEducationData, isLoading: isLoadingHigherEducation, refetch: refetchHigherEducation } = useGetMyHigherEducationAdoptionsQuery(
    userIdentifier || { email: '' },
    { skip: !userIdentifier }
  );
  
  const { data: schoolData, isLoading: isLoadingSchool, refetch: refetchSchool } = useGetMySchoolAdoptionsQuery(
    userIdentifier || { email: '' },
    { skip: !userIdentifier }
  );
  
  const { data: welfareData, isLoading: isLoadingWelfare, refetch: refetchWelfare } = useGetMyWelfareAdoptionsQuery(
    userIdentifier || { email: '' },
    { skip: !userIdentifier }
  );

  // Unadopt mutations
  const [unadoptHealth] = useUnadoptHealthItemMutation();
  const [unadoptHigherEducation] = useUnadoptHigherEducationItemMutation();
  const [unadoptSchool] = useUnadoptSchoolItemMutation();
  const [unadoptWelfare] = useUnadoptWelfareItemMutation();

  // Memoize combined adoptions to prevent unnecessary recalculations
  const allAdoptions = useMemo(() => {
    if (!userIdentifier) {
      return [];
    }

    const adoptions: AdoptedItem[] = [];

    // Add health adoptions
    if (healthData?.data && Array.isArray(healthData.data)) {
      const healthAdoptions = healthData.data.map(item => convertToAdoptedItem(item, 'health'));
      adoptions.push(...healthAdoptions);
    }

    // Add higher education adoptions
    if (higherEducationData?.data && Array.isArray(higherEducationData.data)) {
      const higherEdAdoptions = higherEducationData.data.map(item => convertToAdoptedItem(item, 'higher-education'));
      adoptions.push(...higherEdAdoptions);
    }

    // Add school adoptions
    if (schoolData?.data && Array.isArray(schoolData.data)) {
      const schoolAdoptions = schoolData.data.map(item => convertToAdoptedItem(item, 'school-student'));
      adoptions.push(...schoolAdoptions);
    }

    // Add welfare adoptions
    if (welfareData?.data && Array.isArray(welfareData.data)) {
      const welfareAdoptions = welfareData.data.map(item => convertToAdoptedItem(item, 'welfare'));
      adoptions.push(...welfareAdoptions);
    }

    return adoptions;
  }, [healthData?.data, higherEducationData?.data, schoolData?.data, welfareData?.data, userIdentifier]);

  // Update state when adoptions change
  useEffect(() => {
    setAdoptedItems(allAdoptions);
    setIsLoading(isLoadingHealth || isLoadingHigherEducation || isLoadingSchool || isLoadingWelfare);

    // Cache to local storage as backup (only if user is logged in)
    if (userIdentifier && allAdoptions.length >= 0) {
      AsyncStorage.setItem('adoptedItems', JSON.stringify(allAdoptions)).catch(err => {
        console.error('Error caching adoptions:', err);
      });
    }
  }, [allAdoptions, isLoadingHealth, isLoadingHigherEducation, isLoadingSchool, isLoadingWelfare]);

  const refetchAdoptions = useCallback(() => {
    if (userIdentifier) {
      refetchHealth();
      refetchHigherEducation();
      refetchSchool();
      refetchWelfare();
    }
  }, [userIdentifier, refetchHealth, refetchHigherEducation, refetchSchool, refetchWelfare]);

  const adoptItem = async (item: AdoptedItem) => {
    // This is now handled by the backend API when adopting
    // We just need to refetch the adoptions list
    refetchAdoptions();
  };

  const removeAdoptedItem = async (id: string, domain: string) => {
    if (!userIdentifier) {
      console.error('Cannot remove adoption: User not logged in');
      return;
    }

    try {
      // Call the appropriate unadopt API based on domain
      switch (domain) {
        case 'health':
          await unadoptHealth({ id, ...userIdentifier }).unwrap();
          break;
        case 'higher-education':
          await unadoptHigherEducation({ id, ...userIdentifier }).unwrap();
          break;
        case 'school-student':
          await unadoptSchool({ id, ...userIdentifier }).unwrap();
          break;
        case 'welfare':
          await unadoptWelfare({ id, ...userIdentifier }).unwrap();
          break;
        default:
          console.error('Unknown domain:', domain);
          return;
      }

      // Refetch adoptions to update the list
      refetchAdoptions();
    } catch (error) {
      console.error('Error removing adopted item:', error);
      throw error;
    }
  };

  return (
    <AdoptionContext.Provider value={{ adoptedItems, adoptItem, removeAdoptedItem, isLoading, refetchAdoptions }}>
      {children}
    </AdoptionContext.Provider>
  );
};

export const useAdoption = () => {
  const context = useContext(AdoptionContext);
  if (context === undefined) {
    throw new Error('useAdoption must be used within an AdoptionProvider');
  }
  return context;
};

