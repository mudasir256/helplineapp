import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Pressable, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  useListHealthItemsQuery,
  useListHigherEducationItemsQuery,
  useListSchoolItemsQuery,
  useListWelfareItemsQuery,
} from '../store/api/adoptionApi';

interface AdoptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDomain: (domain: string) => void;
}

interface DomainConfig {
  id: string;
  title: string;
  icon: string;
  description: string;
  color: string;
  apiEndpoint: string;
}

const domainConfigs: DomainConfig[] = [
  {
    id: 'health',
    title: 'Adopt in Health',
    icon: 'medical-bag',
    description: 'Support healthcare initiatives',
    color: '#e74c3c',
    apiEndpoint: 'adopt-health',
  },
  {
    id: 'higher-education',
    title: 'Adopt Higher Education',
    icon: 'school',
    description: 'Support college and university students',
    color: '#3498db',
    apiEndpoint: 'adopt-higher-education',
  },
  {
    id: 'school-student',
    title: 'Adopt School Student',
    icon: 'book-open-variant',
    description: 'Support school students',
    color: '#27ae60',
    apiEndpoint: 'adopt-school',
  },
  {
    id: 'welfare',
    title: 'Adopt Any Welfare Work',
    icon: 'hand-heart',
    description: 'Support various welfare activities',
    color: '#f39c12',
    apiEndpoint: 'adopt-welfare',
  },
];

export default function AdoptionModal({ isOpen, onClose, onSelectDomain }: AdoptionModalProps) {
  // Fetch data from all adoption APIs
  const { data: healthData, isLoading: isLoadingHealth } = useListHealthItemsQuery(undefined, {
    skip: !isOpen, // Only fetch when modal is open
  });
  
  const { data: higherEducationData, isLoading: isLoadingHigherEducation } = useListHigherEducationItemsQuery(undefined, {
    skip: !isOpen,
  });
  
  const { data: schoolData, isLoading: isLoadingSchool } = useListSchoolItemsQuery(undefined, {
    skip: !isOpen,
  });
  
  const { data: welfareData, isLoading: isLoadingWelfare } = useListWelfareItemsQuery(undefined, {
    skip: !isOpen,
  });

  // Map API data to domain configs with counts
  const domains = useMemo(() => {
    return domainConfigs.map((config) => {
      let count = 0;
      let isLoading = false;

      switch (config.id) {
        case 'health':
          count = healthData?.data?.length || 0;
          isLoading = isLoadingHealth;
          break;
        case 'higher-education':
          count = higherEducationData?.data?.length || 0;
          isLoading = isLoadingHigherEducation;
          break;
        case 'school-student':
          count = schoolData?.data?.length || 0;
          isLoading = isLoadingSchool;
          break;
        case 'welfare':
          count = welfareData?.data?.length || 0;
          isLoading = isLoadingWelfare;
          break;
      }

      return {
        ...config,
        count,
        isLoading,
      };
    });
  }, [healthData, higherEducationData, schoolData, welfareData, isLoadingHealth, isLoadingHigherEducation, isLoadingSchool, isLoadingWelfare]);

  const handleSelectDomain = (domainId: string) => {
    onSelectDomain(domainId);
    onClose();
  };

  const renderDomainItem = ({ item }: { item: typeof domains[0] }) => (
    <TouchableOpacity
      style={styles.domainCard}
      onPress={() => handleSelectDomain(item.id)}
      disabled={item.isLoading}
    >
      <View style={[styles.domainIconContainer, { backgroundColor: `${item.color}15` }]}>
        <MaterialCommunityIcons name={item.icon as any} size={32} color={item.color} />
      </View>
      <View style={styles.domainContent}>
        <View style={styles.domainTitleRow}>
          <Text style={styles.domainTitle}>{item.title}</Text>
          {item.isLoading ? (
            <ActivityIndicator size="small" color={item.color} style={styles.loadingIndicator} />
          ) : (
            <View style={[styles.countBadge, { backgroundColor: item.color }]}>
              <Text style={styles.countText}>{item.count}</Text>
            </View>
          )}
        </View>
        <Text style={styles.domainDescription}>
          {item.description} • {item.count} {item.count === 1 ? 'item' : 'items'} available
        </Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#7f8c8d" />
    </TouchableOpacity>
  );

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Choose Adoption Domain</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#7f8c8d" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.subtitle}>
            Select a domain to view available adoption opportunities
          </Text>
          
          <FlatList
            data={domains}
            renderItem={renderDomainItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 24,
    lineHeight: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  domainCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  domainIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  domainContent: {
    flex: 1,
  },
  domainTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  domainTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    flex: 1,
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  countBadge: {
    minWidth: 32,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  domainDescription: {
    fontSize: 13,
    color: '#7f8c8d',
  },
});

