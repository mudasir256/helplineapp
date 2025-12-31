import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AdoptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDomain: (domain: string) => void;
}

const domains = [
  {
    id: 'health',
    title: 'Adopt in Health',
    icon: 'medical-bag',
    description: 'Support healthcare initiatives',
    color: '#e74c3c',
  },
  {
    id: 'higher-education',
    title: 'Adopt Higher Education Student',
    icon: 'school',
    description: 'Support college and university students',
    color: '#3498db',
  },
  {
    id: 'school-student',
    title: 'Adopt School Student',
    icon: 'book-open-variant',
    description: 'Support school students',
    color: '#27ae60',
  },
  {
    id: 'welfare',
    title: 'Adopt Any Welfare Work',
    icon: 'hand-heart',
    description: 'Support various welfare activities',
    color: '#f39c12',
  },
];

export default function AdoptionModal({ isOpen, onClose, onSelectDomain }: AdoptionModalProps) {
  const handleSelectDomain = (domainId: string) => {
    onSelectDomain(domainId);
    onClose();
  };

  const renderDomainItem = ({ item }: { item: typeof domains[0] }) => (
    <TouchableOpacity
      style={styles.domainCard}
      onPress={() => handleSelectDomain(item.id)}
    >
      <View style={[styles.domainIconContainer, { backgroundColor: `${item.color}15` }]}>
        <MaterialCommunityIcons name={item.icon as any} size={32} color={item.color} />
      </View>
      <View style={styles.domainContent}>
        <Text style={styles.domainTitle}>{item.title}</Text>
        <Text style={styles.domainDescription}>{item.description}</Text>
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
          
          <Text style={styles.subtitle}>Select a domain to view available adoption opportunities</Text>
          
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
  domainTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  domainDescription: {
    fontSize: 13,
    color: '#7f8c8d',
  },
});

