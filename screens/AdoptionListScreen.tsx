import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  FlatList,
  Alert,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useAdoption } from '../contexts/AdoptionContext';

interface Student {
  id: string;
  name: string;
  age: number;
  location: string;
  need: string;
  amount: number;
  status: 'pending' | 'adopted';
  description: string;
}

interface AdoptionListScreenProps {
  route: {
    params: {
      domain: string;
    };
  };
  navigation: any;
}

const mockStudents: Record<string, Student[]> = {
  health: [
    {
      id: '1',
      name: 'Ahmed Khan',
      age: 8,
      location: 'Karachi',
      need: 'Heart Surgery',
      amount: 500000,
      status: 'pending',
      description: 'Needs urgent heart surgery. Family cannot afford the medical expenses.',
    },
    {
      id: '2',
      name: 'Fatima Ali',
      age: 12,
      location: 'Lahore',
      need: 'Cancer Treatment',
      amount: 800000,
      status: 'pending',
      description: 'Battling cancer, requires chemotherapy and ongoing treatment.',
    },
  ],
  'higher-education': [
    {
      id: '3',
      name: 'Hassan Malik',
      age: 20,
      location: 'Islamabad',
      need: 'University Fees',
      amount: 150000,
      status: 'pending',
      description: 'Merit scholarship student needs support for university fees and books.',
    },
    {
      id: '4',
      name: 'Ayesha Sheikh',
      age: 19,
      location: 'Lahore',
      need: 'Medical School',
      amount: 200000,
      status: 'pending',
      description: 'Aspiring doctor needs financial support for medical school education.',
    },
    {
      id: '5',
      name: 'Bilal Ahmed',
      age: 21,
      location: 'Karachi',
      need: 'Engineering Degree',
      amount: 180000,
      status: 'pending',
      description: 'Talented student pursuing engineering degree needs financial assistance.',
    },
  ],
  'school-student': [
    {
      id: '6',
      name: 'Zainab Hassan',
      age: 10,
      location: 'Rawalpindi',
      need: 'School Fees & Supplies',
      amount: 30000,
      status: 'pending',
      description: 'Bright student needs support for school fees, books, and uniform.',
    },
    {
      id: '7',
      name: 'Omar Farooq',
      age: 12,
      location: 'Faisalabad',
      need: 'Education Support',
      amount: 35000,
      status: 'pending',
      description: 'Needs financial support for quality education and school supplies.',
    },
    {
      id: '8',
      name: 'Sara Khan',
      age: 9,
      location: 'Multan',
      need: 'School Expenses',
      amount: 28000,
      status: 'pending',
      description: 'Orphan student needs support for school fees and educational materials.',
    },
  ],
  welfare: [
    {
      id: '9',
      name: 'Community Health Center',
      location: 'Karachi',
      need: 'Medical Equipment',
      amount: 500000,
      status: 'pending',
      description: 'Community center needs medical equipment for free health services.',
      age: 0,
    },
    {
      id: '10',
      name: 'Orphanage Support',
      location: 'Lahore',
      need: 'Daily Needs',
      amount: 200000,
      status: 'pending',
      description: 'Orphanage needs support for food, clothing, and basic necessities.',
      age: 0,
    },
  ],
};

const domainTitles: Record<string, string> = {
  health: 'Health Adoption',
  'higher-education': 'Higher Education Students',
  'school-student': 'School Students',
  welfare: 'Welfare Projects',
};

export default function AdoptionListScreen({ route, navigation }: AdoptionListScreenProps) {
  const { domain } = route.params;
  const [students, setStudents] = useState<Student[]>([]);
  const { adoptItem } = useAdoption();

  useEffect(() => {
    setStudents(mockStudents[domain] || []);
  }, [domain]);

  const handleAdopt = async (student: Student) => {
    try {
      await adoptItem({
        id: student.id,
        name: student.name,
        age: student.age,
        location: student.location,
        need: student.need,
        amount: student.amount,
        domain: domain,
        adoptedDate: new Date().toISOString(),
        description: student.description,
      });
      
      Alert.alert(
        'Success!',
        `You have successfully adopted ${student.name}. They will appear in your Adopted tab.`,
        [
          {
            text: 'View Adopted',
            onPress: () => navigation.navigate('MainTabs', { screen: 'AdoptedDetailsTab' }),
          },
          {
            text: 'OK',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save adoption. Please try again.');
    }
  };

  const formatAmount = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  const renderStudentCard = ({ item }: { item: Student }) => (
    <View style={styles.studentCard}>
      <View style={styles.studentHeader}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{item.name}</Text>
          {item.age > 0 && (
            <Text style={styles.studentAge}>{item.age} years old</Text>
          )}
        </View>
        <View style={[styles.statusBadge, item.status === 'adopted' && styles.statusAdopted]}>
          <Text style={[styles.statusText, item.status === 'adopted' && styles.statusTextAdopted]}>
            {item.status === 'adopted' ? 'Adopted' : 'Needs Support'}
          </Text>
        </View>
      </View>

      <View style={styles.studentDetails}>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="map-marker" size={16} color="#7f8c8d" />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="tag" size={16} color="#7f8c8d" />
          <Text style={styles.detailText}>{item.need}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="currency-usd" size={16} color="#27ae60" />
          <Text style={[styles.detailText, styles.amountText]}>{formatAmount(item.amount)}</Text>
        </View>
      </View>

      <Text style={styles.description}>{item.description}</Text>

      {item.status === 'pending' && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.adoptButton, styles.adoptButtonPrimary]}
            onPress={() => handleAdopt(item)}
          >
            <MaterialCommunityIcons name="heart" size={20} color="#fff" />
            <Text style={styles.adoptButtonText}>Adopt Now</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.adoptButton, styles.payButton]}
            onPress={() => {
              WebBrowser.openBrowserAsync('https://www.helplinewelfaretrust.org/donation');
            }}
          >
            <MaterialCommunityIcons name="credit-card" size={20} color="#fff" />
            <Text style={styles.adoptButtonText}>Pay Now</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{domainTitles[domain] || 'Adoption List'}</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{students.length}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {students.filter(s => s.status === 'adopted').length}
          </Text>
          <Text style={styles.statLabel}>Adopted</Text>
        </View>
      </View>

      <FlatList
        data={students}
        renderItem={renderStudentCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="information-outline" size={64} color="#95a5a6" />
            <Text style={styles.emptyText}>No students available</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  studentCard: {
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
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  studentAge: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  statusBadge: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  statusAdopted: {
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#856404',
  },
  statusTextAdopted: {
    color: '#155724',
  },
  studentDetails: {
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  adoptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  adoptButtonPrimary: {
    backgroundColor: '#3498db',
  },
  payButton: {
    backgroundColor: '#27ae60',
  },
  adoptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#95a5a6',
    marginTop: 16,
    fontWeight: '500',
  },
});

