import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  FlatList,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useNavigation } from '@react-navigation/native';
import { useAdoption, AdoptedItem } from '../contexts/AdoptionContext';
import AdoptionModal from '../components/AdoptionModal';

const domainTitles: Record<string, string> = {
  health: 'Health',
  'higher-education': 'Higher Education',
  'school-student': 'School Student',
  welfare: 'Welfare Work',
};

export default function AdoptedDetailsScreen() {
  const navigation = useNavigation();
  const [isAdoptionModalOpen, setIsAdoptionModalOpen] = useState(false);
  const { adoptedItems, removeAdoptedItem, isLoading } = useAdoption();

  const handleSelectDomain = (domain: string) => {
    (navigation as any).navigate('AdoptionList', { domain });
  };

  const formatAmount = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleRemove = (id: string, name: string) => {
    Alert.alert(
      'Remove Adoption',
      `Are you sure you want to remove ${name} from your adopted list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeAdoptedItem(id),
        },
      ]
    );
  };

  const renderAdoptedItem = ({ item }: { item: AdoptedItem }) => (
    <View style={styles.adoptedCard}>
      <View style={styles.adoptedHeader}>
        <View style={styles.adoptedInfo}>
          <Text style={styles.adoptedName}>{item.name}</Text>
          <View style={styles.domainBadge}>
            <Text style={styles.domainBadgeText}>
              {domainTitles[item.domain] || item.domain}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => handleRemove(item.id, item.name)}
          style={styles.removeButton}
        >
          <MaterialCommunityIcons name="close-circle" size={24} color="#e74c3c" />
        </TouchableOpacity>
      </View>

      <View style={styles.adoptedDetails}>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="map-marker" size={16} color="#7f8c8d" />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
        {item.age && item.age > 0 && (
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="account" size={16} color="#7f8c8d" />
            <Text style={styles.detailText}>{item.age} years old</Text>
          </View>
        )}
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="tag" size={16} color="#7f8c8d" />
          <Text style={styles.detailText}>{item.need}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="currency-usd" size={16} color="#27ae60" />
          <Text style={[styles.detailText, styles.amountText]}>{formatAmount(item.amount)}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="calendar" size={16} color="#3498db" />
          <Text style={styles.detailText}>Adopted on {formatDate(item.adoptedDate)}</Text>
        </View>
      </View>

      <Text style={styles.description}>{item.description}</Text>

      <TouchableOpacity
        style={styles.payButton}
        onPress={() => {
          WebBrowser.openBrowserAsync('https://www.helplinewelfaretrust.org/donation');
        }}
      >
        <MaterialCommunityIcons name="credit-card" size={20} color="#fff" />
        <Text style={styles.payButtonText}>Pay Now</Text>
      </TouchableOpacity>
    </View>
  );
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.statusBarArea} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Adopted Details</Text>
      </View>

      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{adoptedItems.length}</Text>
          <Text style={styles.statLabel}>Total Adopted</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {adoptedItems.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Total Amount</Text>
        </View>
      </View>

      <View style={styles.content}>
        <TouchableOpacity 
          style={[styles.actionCard, styles.adoptNewCard]}
          onPress={() => setIsAdoptionModalOpen(true)}
        >
          <MaterialCommunityIcons name="plus-circle" size={24} color="#fff" />
          <View style={styles.adoptNewContent}>
            <Text style={styles.adoptNewTitle}>Adopt New Student/Project</Text>
            <Text style={styles.adoptNewText}>Choose a domain to start adoption</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Adoptions</Text>
          
          {isLoading ? (
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>Loading...</Text>
            </View>
          ) : adoptedItems.length === 0 ? (
            <View style={styles.infoCard}>
              <MaterialCommunityIcons name="heart-outline" size={64} color="#95a5a6" />
              <Text style={styles.infoText}>No adopted items yet</Text>
              <Text style={styles.infoSubtext}>Click "Adopt New" to start supporting students</Text>
            </View>
          ) : (
            <FlatList
              data={adoptedItems}
              renderItem={renderAdoptedItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          )}
        </View>
      </View>
      
      <AdoptionModal
        isOpen={isAdoptionModalOpen}
        onClose={() => setIsAdoptionModalOpen(false)}
        onSelectDomain={handleSelectDomain}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statusBarArea: {
    backgroundColor: '#3498db',
  },
  header: {
    backgroundColor: '#3498db',
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3498db',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  listContainer: {
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  infoSubtext: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  actionCardText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  adoptNewCard: {
    backgroundColor: '#3498db',
    borderWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  adoptNewContent: {
    marginLeft: 16,
    flex: 1,
  },
  adoptNewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  adoptNewText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  adoptedCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  adoptedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  adoptedInfo: {
    flex: 1,
  },
  adoptedName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 8,
  },
  domainBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  domainBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3498db',
  },
  removeButton: {
    padding: 4,
  },
  adoptedDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 8,
  },
  amountText: {
    color: '#27ae60',
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
    marginBottom: 16,
  },
  payButton: {
    backgroundColor: '#27ae60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

