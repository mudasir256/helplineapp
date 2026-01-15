import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import { AdoptedItem } from '../contexts/AdoptionContext';

const domainTitles: Record<string, string> = {
  health: 'Health',
  'higher-education': 'Higher Education',
  'school-student': 'School Student',
  welfare: 'Welfare Work',
};

export default function AdoptedItemDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { item } = (route.params as { item: AdoptedItem }) || {};

  if (!item) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Item not found</Text>
      </View>
    );
  }

  const formatAmount = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3498db" />
      <SafeAreaView style={styles.statusBarArea} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Adoption Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Name and Domain */}
        <View style={styles.nameSection}>
          <Text style={styles.name}>{item.name}</Text>
          {item.age && item.age > 0 && (
            <Text style={styles.age}>{item.age} years old</Text>
          )}
          <View style={styles.domainBadge}>
            <Text style={styles.domainBadgeText}>
              {domainTitles[item.domain] || item.domain}
            </Text>
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="map-marker" size={18} color="#7f8c8d" />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>

        {/* Need */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Need</Text>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="tag" size={18} color="#3498db" />
            <Text style={styles.needText}>{item.need}</Text>
          </View>
        </View>

        {/* Financial Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Information</Text>
          <View style={styles.amountCard}>
            <View style={styles.amountRow}>
              <MaterialCommunityIcons name="currency-usd" size={20} color="#27ae60" />
              <Text style={styles.amountLabel}>Amount Needed</Text>
              <Text style={styles.amountValue}>
                {formatAmount(item.amountNeeded !== undefined ? item.amountNeeded : item.amount)}
              </Text>
            </View>
            {item.amountNeeded !== undefined && item.amountNeeded !== item.amount && (
              <View style={styles.amountRow}>
                <MaterialCommunityIcons name="information" size={18} color="#3498db" />
                <Text style={styles.amountLabel}>Total Amount</Text>
                <Text style={[styles.amountValue, { color: '#3498db' }]}>{formatAmount(item.amount)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Adoption Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adoption Information</Text>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="calendar" size={18} color="#3498db" />
            <Text style={styles.detailText}>Adopted on {formatDate(item.adoptedDate)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Button */}
      <View style={styles.footer}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  statusBarArea: {
    backgroundColor: '#3498db',
  },
  header: {
    backgroundColor: '#3498db',
    padding: 20,
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  nameSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  age: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 12,
  },
  domainBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  domainBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3498db',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontSize: 16,
    color: '#7f8c8d',
    flex: 1,
  },
  description: {
    fontSize: 15,
    color: '#2c3e50',
    lineHeight: 22,
  },
  needText: {
    fontSize: 16,
    color: '#2c3e50',
    flex: 1,
    fontWeight: '600',
  },
  detailText: {
    fontSize: 16,
    color: '#7f8c8d',
    flex: 1,
  },
  amountCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#d4edda',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#27ae60',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27ae60',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 50,
  },
});

