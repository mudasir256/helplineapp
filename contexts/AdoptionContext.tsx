import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AdoptedItem {
  id: string;
  name: string;
  age?: number;
  location: string;
  need: string;
  amount: number;
  domain: string;
  adoptedDate: string;
  description: string;
}

interface AdoptionContextType {
  adoptedItems: AdoptedItem[];
  adoptItem: (item: AdoptedItem) => Promise<void>;
  removeAdoptedItem: (id: string) => Promise<void>;
  isLoading: boolean;
}

const AdoptionContext = createContext<AdoptionContextType | undefined>(undefined);

export const AdoptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adoptedItems, setAdoptedItems] = useState<AdoptedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAdoptedItems();
  }, []);

  const loadAdoptedItems = async () => {
    try {
      const stored = await AsyncStorage.getItem('adoptedItems');
      if (stored) {
        setAdoptedItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading adopted items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const adoptItem = async (item: AdoptedItem) => {
    try {
      const newItem: AdoptedItem = {
        ...item,
        adoptedDate: new Date().toISOString(),
      };
      const updated = [...adoptedItems, newItem];
      setAdoptedItems(updated);
      await AsyncStorage.setItem('adoptedItems', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving adopted item:', error);
      throw error;
    }
  };

  const removeAdoptedItem = async (id: string) => {
    try {
      const updated = adoptedItems.filter(item => item.id !== id);
      setAdoptedItems(updated);
      await AsyncStorage.setItem('adoptedItems', JSON.stringify(updated));
    } catch (error) {
      console.error('Error removing adopted item:', error);
    }
  };

  return (
    <AdoptionContext.Provider value={{ adoptedItems, adoptItem, removeAdoptedItem, isLoading }}>
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

