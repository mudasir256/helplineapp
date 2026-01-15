import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAdoption } from '../contexts/AdoptionContext';
import { useAuth } from '../contexts/AuthContext';
import {
  useListHealthItemsQuery,
  useListHigherEducationItemsQuery,
  useListSchoolItemsQuery,
  useListWelfareItemsQuery,
  useAdoptHealthItemMutation,
  useAdoptHigherEducationItemMutation,
  useAdoptSchoolItemMutation,
  useAdoptWelfareItemMutation,
  AdoptionItem,
  adoptionApi,
} from '../store/api/adoptionApi';
import { useDispatch } from 'react-redux';

const domainTitles: Record<string, string> = {
  health: 'Health Adoption',
  'higher-education': 'Higher Education',
  'school-student': 'School Students',
  welfare: 'Welfare Projects',
};

export default function AdoptionListScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const domain = (route.params as { domain?: string })?.domain || 'health';
  const { adoptItem, refetchAdoptions } = useAdoption();
  const { user } = useAuth();
  const dispatch = useDispatch();
  
  // Multi-select state
  const [selectedItems, setSelectedItems] = React.useState<Set<string>>(new Set());
  const [isAdoptingMultiple, setIsAdoptingMultiple] = React.useState(false);
  const [adoptedItems, setAdoptedItems] = React.useState<Set<string>>(new Set());
  const [showPaymentModal, setShowPaymentModal] = React.useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data based on domain
  const { data: healthData, isLoading: isLoadingHealth, error: healthError, refetch: refetchHealth } = useListHealthItemsQuery(undefined, {
    skip: domain !== 'health',
  });
  
  const { data: higherEducationData, isLoading: isLoadingHigherEducation, error: higherEducationError, refetch: refetchHigherEducation } = useListHigherEducationItemsQuery(undefined, {
    skip: domain !== 'higher-education',
  });
  
  const { data: schoolData, isLoading: isLoadingSchool, error: schoolError, refetch: refetchSchool } = useListSchoolItemsQuery(undefined, {
    skip: domain !== 'school-student',
  });
  
  const { data: welfareData, isLoading: isLoadingWelfare, error: welfareError, refetch: refetchWelfare } = useListWelfareItemsQuery(undefined, {
    skip: domain !== 'welfare',
  });

  // Adoption mutations
  const [adoptHealthItem, { isLoading: isAdoptingHealth }] = useAdoptHealthItemMutation();
  const [adoptHigherEducationItem, { isLoading: isAdoptingHigherEducation }] = useAdoptHigherEducationItemMutation();
  const [adoptSchoolItem, { isLoading: isAdoptingSchool }] = useAdoptSchoolItemMutation();
  const [adoptWelfareItem, { isLoading: isAdoptingWelfare }] = useAdoptWelfareItemMutation();

  // Log data for debugging - All categories
  React.useEffect(() => {
    console.log('📊 Current Domain:', domain);
    console.log('📊 All API States:', {
      health: {
        data: healthData,
        isLoading: isLoadingHealth,
        error: healthError,
        count: healthData?.data?.length || 0,
      },
      higherEducation: {
        data: higherEducationData,
        isLoading: isLoadingHigherEducation,
        error: higherEducationError,
        count: higherEducationData?.data?.length || 0,
      },
      school: {
        data: schoolData,
        isLoading: isLoadingSchool,
        error: schoolError,
        count: schoolData?.data?.length || 0,
      },
      welfare: {
        data: welfareData,
        isLoading: isLoadingWelfare,
        error: welfareError,
        count: welfareData?.data?.length || 0,
      },
    });
  }, [domain, healthData, higherEducationData, schoolData, welfareData, healthError, higherEducationError, schoolError, welfareError, isLoadingHealth, isLoadingHigherEducation, isLoadingSchool, isLoadingWelfare]);

  // Get current data based on domain
  const currentData = useMemo(() => {
    let data: AdoptionItem[] = [];
    
    switch (domain) {
      case 'health':
        data = healthData?.data || [];
        if (__DEV__) {
          console.log('🏥 Health Data:', {
            raw: healthData,
            dataArray: data,
            count: data.length,
            error: healthError,
          });
        }
        break;
      case 'higher-education':
        data = higherEducationData?.data || [];
        if (__DEV__) {
          console.log('🎓 Higher Education Data:', {
            raw: higherEducationData,
            dataArray: data,
            count: data.length,
            error: higherEducationError,
          });
        }
        break;
      case 'school-student':
        data = schoolData?.data || [];
        if (__DEV__) {
          console.log('📚 School Data:', {
            raw: schoolData,
            dataArray: data,
            count: data.length,
            error: schoolError,
          });
        }
        break;
      case 'welfare':
        data = welfareData?.data || [];
        if (__DEV__) {
          console.log('🤝 Welfare Data:', {
            raw: welfareData,
            dataArray: data,
            count: data.length,
            error: welfareError,
          });
        }
        break;
      default:
        data = [];
    }
    
    return data;
  }, [domain, healthData, higherEducationData, schoolData, welfareData, healthError, higherEducationError, schoolError, welfareError]);

  const isLoading = useMemo(() => {
    switch (domain) {
      case 'health':
        return isLoadingHealth;
      case 'higher-education':
        return isLoadingHigherEducation;
      case 'school-student':
        return isLoadingSchool;
      case 'welfare':
        return isLoadingWelfare;
      default:
        return false;
    }
  }, [domain, isLoadingHealth, isLoadingHigherEducation, isLoadingSchool, isLoadingWelfare]);

  const isAdopting = useMemo(() => {
    switch (domain) {
      case 'health':
        return isAdoptingHealth;
      case 'higher-education':
        return isAdoptingHigherEducation;
      case 'school-student':
        return isAdoptingSchool;
      case 'welfare':
        return isAdoptingWelfare;
      default:
        return false;
    }
  }, [domain, isAdoptingHealth, isAdoptingHigherEducation, isAdoptingSchool, isAdoptingWelfare]);

  // Toggle item selection
  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  // Handle adopt now click - show payment modal
  const handleAdoptNowClick = () => {
    if (selectedItems.size === 0) {
      Alert.alert('No Selection', 'Please select at least one item to adopt.');
      return;
    }
    setShowPaymentModal(true);
  };

  // Handle multi-adoption
  const handleAdoptMultiple = async () => {
    if (selectedItems.size === 0) {
      Alert.alert('No Selection', 'Please select at least one item to adopt.');
      return;
    }

    try {
      setIsAdoptingMultiple(true);
      const adopterName = user?.name || 'Anonymous';
      const adopterEmail = user?.email || '';
      const adopterPhone = '0000000000'; // Default phone - backend requires this field

      if (!adopterEmail) {
        Alert.alert('Error', 'Please update your profile with email address to adopt.');
        setIsAdoptingMultiple(false);
        return;
      }

      if (!adopterName || adopterName === 'Anonymous') {
        Alert.alert('Error', 'Please update your profile with your name to adopt.');
        setIsAdoptingMultiple(false);
        return;
      }

      const itemsToAdopt = currentData.filter(item => {
        const itemId = String(item.id || item._id || '');
        return selectedItems.has(itemId) && !(item.adopted || item.status === 'adopted');
      });

      const adoptionPromises = itemsToAdopt.map(async (item) => {
        const itemId = String(item.id || item._id || '');
        let result;

        switch (domain) {
          case 'health':
            result = await adoptHealthItem({ id: itemId, adopterName, adopterEmail, adopterPhone }).unwrap();
            break;
          case 'higher-education':
            result = await adoptHigherEducationItem({ id: itemId, adopterName, adopterEmail, adopterPhone }).unwrap();
            break;
          case 'school-student':
            result = await adoptSchoolItem({ id: itemId, adopterName, adopterEmail, adopterPhone }).unwrap();
            break;
          case 'welfare':
            result = await adoptWelfareItem({ id: itemId, adopterName, adopterEmail, adopterPhone }).unwrap();
            break;
          default:
            throw new Error('Invalid domain');
        }

        // Save to local context for Adopted tab
        const itemName = item.name || item.title || item.patientName || item.studentName || item.projectName || 'Unknown';
        const itemAge = item.age || item.patientAge || item.studentAge || 0;
        const itemLocation = item.location || item.address || item.city || item.hospitalAddress || item.institutionAddress || item.schoolAddress || 'Unknown';
        const itemAmount = item.amount || item.estimatedCost || item.totalTuitionFee || item.annualTuitionFee || item.totalBudget || 0;
        const amountNeeded = item.amountNeeded || (itemAmount > 0 && item.amountRaised ? itemAmount - item.amountRaised : itemAmount);
        
        await adoptItem({
          id: itemId,
          name: itemName,
          age: itemAge,
          location: itemLocation,
          need: item.need || item.title || 'Support',
          amount: itemAmount,
          amountNeeded: amountNeeded,
          domain: domain,
          adoptedDate: new Date().toISOString(),
          description: item.description || '',
        });

        return itemId;
      });

      const adoptedIds = await Promise.all(adoptionPromises);
      setAdoptedItems(new Set([...adoptedItems, ...adoptedIds]));
      setSelectedItems(new Set());
      setShowPaymentModal(false);
      
      // Refetch adoptions from backend
      refetchAdoptions();

      // Invalidate RTK Query cache to remove adopted items from list
      switch (domain) {
        case 'health':
          dispatch(adoptionApi.util.invalidateTags(['HealthAdoption']));
          refetchHealth();
          break;
        case 'higher-education':
          dispatch(adoptionApi.util.invalidateTags(['HigherEducationAdoption']));
          refetchHigherEducation();
          break;
        case 'school-student':
          dispatch(adoptionApi.util.invalidateTags(['SchoolAdoption']));
          refetchSchool();
          break;
        case 'welfare':
          dispatch(adoptionApi.util.invalidateTags(['WelfareAdoption']));
          refetchWelfare();
          break;
      }

      Alert.alert(
        'Success!',
        `You have successfully adopted ${adoptedIds.length} item(s). They will appear in your Adopted tab.`,
        [
          {
            text: 'View Adopted',
            onPress: () => (navigation as any).navigate('MainTabs', { screen: 'AdoptedDetailsTab' }),
          },
          { text: 'OK' },
        ]
      );
    } catch (error: any) {
      console.error('Adoption error:', error);
      Alert.alert(
        'Error',
        error?.data?.message || error?.message || 'Failed to adopt. Please try again.'
      );
    } finally {
      setIsAdoptingMultiple(false);
    }
  };

  // Handle pay now from modal
  const handlePayNow = () => {
    WebBrowser.openBrowserAsync('https://www.helplinewelfaretrust.org/donation');
  };

  // Get selected items data
  const selectedItemsData = useMemo(() => {
    return currentData.filter(item => {
      const itemId = String(item.id || item._id || '');
      return selectedItems.has(itemId) && !(item.adopted || item.status === 'adopted');
    });
  }, [currentData, selectedItems]);

  // Calculate total amount
  const totalAmount = useMemo(() => {
    return selectedItemsData.reduce((sum, item) => {
      return sum + (item.amount || item.estimatedCost || item.totalTuitionFee || item.annualTuitionFee || item.totalBudget || 0);
    }, 0);
  }, [selectedItemsData]);

  // Calculate total amount needed
  const totalAmountNeeded = useMemo(() => {
    return selectedItemsData.reduce((sum, item) => {
      const itemAmount = item.amount || item.estimatedCost || item.totalTuitionFee || item.annualTuitionFee || item.totalBudget || 0;
      const amountRaised = item.amountRaised || 0;
      const amountNeeded = item.amountNeeded || (itemAmount > 0 && amountRaised > 0 ? itemAmount - amountRaised : itemAmount);
      return sum + amountNeeded;
    }, 0);
  }, [selectedItemsData]);

  const formatAmount = (amount?: number) => {
    if (!amount) return 'Amount not specified';
    return `PKR ${amount.toLocaleString()}`;
  };

  const renderStudentCard = ({ item }: { item: AdoptionItem }) => {
    const isAdopted = item.adopted || item.status === 'adopted';
    // Handle both numeric id and string _id
    const itemId = String(item.id || item._id || '');
    const isSelected = selectedItems.has(itemId) || adoptedItems.has(itemId);
    
    // Extract data based on domain type
    let itemName = item.name || item.title || item.patientName || item.studentName || item.projectName || 'Unknown';
    let itemAge = item.age || item.patientAge || item.studentAge || 0;
    let itemLocation = item.location || item.address || item.city || item.hospitalAddress || item.institutionAddress || item.schoolAddress || 'Location not specified';
    let itemDescription = item.description || 'No description available';
    
    // Get amount based on domain
    let itemAmount = item.amount || item.estimatedCost || item.totalTuitionFee || item.annualTuitionFee || item.totalBudget || 0;
    let amountNeeded = item.amountNeeded || (itemAmount > 0 && item.amountRaised ? itemAmount - item.amountRaised : 0);
    let amountRaised = item.amountRaised || 0;

    // Domain-specific fields
    const getDomainSpecificFields = () => {
      const fields: React.ReactElement[] = [];

      if (domain === 'health') {
        // Health specific fields
        if (item.patientName) {
          fields.push(
            <View key="patient" style={styles.detailRow}>
              <MaterialCommunityIcons name="account" size={10} color="#e74c3c" />
              <Text style={styles.detailText}><Text style={styles.labelText}>Patient: </Text>{item.patientName}</Text>
        </View>
          );
        }
        if (item.medicalCondition) {
          fields.push(
            <View key="condition" style={styles.detailRow}>
              <MaterialCommunityIcons name="medical-bag" size={10} color="#e74c3c" />
              <Text style={styles.detailText}><Text style={styles.labelText}>Condition: </Text>{item.medicalCondition}</Text>
            </View>
          );
        }
        if (item.hospitalName) {
          fields.push(
            <View key="hospital" style={styles.detailRow}>
              <MaterialCommunityIcons name="hospital-building" size={10} color="#e74c3c" />
              <Text style={styles.detailText}><Text style={styles.labelText}>Hospital: </Text>{item.hospitalName}</Text>
            </View>
          );
        }
        if (item.doctorName) {
          fields.push(
            <View key="doctor" style={styles.detailRow}>
              <MaterialCommunityIcons name="doctor" size={10} color="#e74c3c" />
              <Text style={styles.detailText}><Text style={styles.labelText}>Doctor: </Text>{item.doctorName}</Text>
            </View>
          );
        }
        if (item.treatmentType) {
          fields.push(
            <View key="treatment" style={styles.detailRow}>
              <MaterialCommunityIcons name="stethoscope" size={10} color="#e74c3c" />
              <Text style={styles.detailText}><Text style={styles.labelText}>Treatment: </Text>{item.treatmentType}</Text>
            </View>
          );
        }
        if (item.urgencyLevel) {
          fields.push(
            <View key="urgency" style={styles.detailRow}>
              <MaterialCommunityIcons name="alert-circle" size={10} color={item.urgencyLevel === 'critical' ? '#e74c3c' : '#f39c12'} />
              <Text style={[styles.detailText, { color: item.urgencyLevel === 'critical' ? '#e74c3c' : '#f39c12', fontWeight: '600' }]}>
                Urgency: {item.urgencyLevel.toUpperCase()}
          </Text>
        </View>
          );
        }
        if (item.contactPersonName) {
          fields.push(
            <View key="contact" style={styles.detailRow}>
              <MaterialCommunityIcons name="account-circle" size={10} color="#7f8c8d" />
              <Text style={styles.detailText}><Text style={styles.labelText}>Contact: </Text>{item.contactPersonName} ({item.contactPersonRelation})</Text>
      </View>
          );
        }
        if (item.contactPhone) {
          fields.push(
            <View key="phone" style={styles.detailRow}>
              <MaterialCommunityIcons name="phone" size={10} color="#7f8c8d" />
              <Text style={styles.detailText}>{item.contactPhone}</Text>
        </View>
          );
        }
      } else if (domain === 'higher-education') {
        // Higher Education specific fields
        if (item.studentName) {
          fields.push(
            <View key="student" style={styles.detailRow}>
              <MaterialCommunityIcons name="account-school" size={10} color="#3498db" />
              <Text style={styles.detailText}><Text style={styles.labelText}>Student: </Text>{item.studentName}</Text>
        </View>
          );
        }
        if (item.fieldOfStudy) {
          fields.push(
            <View key="field" style={styles.detailRow}>
              <MaterialCommunityIcons name="book-open-variant" size={10} color="#3498db" />
              <Text style={styles.detailText}><Text style={styles.labelText}>Field: </Text>{item.fieldOfStudy}</Text>
        </View>
          );
        }
        if (item.currentInstitution) {
          fields.push(
            <View key="institution" style={styles.detailRow}>
              <MaterialCommunityIcons name="school" size={10} color="#3498db" />
              <Text style={styles.detailText}><Text style={styles.labelText}>Institution: </Text>{item.currentInstitution}</Text>
      </View>
          );
        }
        if (item.currentSemester) {
          fields.push(
            <View key="semester" style={styles.detailRow}>
              <MaterialCommunityIcons name="calendar-clock" size={10} color="#3498db" />
              <Text style={styles.detailText}><Text style={styles.labelText}>Semester: </Text>{item.currentSemester}</Text>
            </View>
          );
        }
        if (item.CGPA) {
          fields.push(
            <View key="cgpa" style={styles.detailRow}>
              <MaterialCommunityIcons name="star" size={10} color="#f39c12" />
              <Text style={styles.detailText}><Text style={styles.labelText}>CGPA: </Text>{item.CGPA}</Text>
            </View>
          );
        }
        if (item.familyIncome) {
          fields.push(
            <View key="income" style={styles.detailRow}>
              <MaterialCommunityIcons name="currency-usd" size={10} color="#7f8c8d" />
              <Text style={styles.detailText}><Text style={styles.labelText}>Family Income: </Text>PKR {item.familyIncome.toLocaleString()}/month</Text>
            </View>
          );
        }
        if (item.studentPhone) {
          fields.push(
            <View key="phone" style={styles.detailRow}>
              <MaterialCommunityIcons name="phone" size={10} color="#7f8c8d" />
              <Text style={styles.detailText}>{item.studentPhone}</Text>
            </View>
          );
        }
        if (item.studentEmail) {
          fields.push(
            <View key="email" style={styles.detailRow}>
              <MaterialCommunityIcons name="email" size={10} color="#7f8c8d" />
              <Text style={styles.detailText}>{item.studentEmail}</Text>
            </View>
          );
        }
      } else if (domain === 'school-student') {
        // School Student specific fields
        if (item.studentName) {
          fields.push(
            <View key="student" style={styles.detailRow}>
              <MaterialCommunityIcons name="account-school" size={10} color="#27ae60" />
              <Text style={styles.detailText}><Text style={styles.labelText}>Student: </Text>{item.studentName}</Text>
            </View>
          );
        }
        if (item.currentClass) {
          fields.push(
            <View key="class" style={styles.detailRow}>
              <MaterialCommunityIcons name="book-open-page-variant" size={10} color="#27ae60" />
              <Text style={styles.detailText}><Text style={styles.labelText}>Class: </Text>{item.currentClass}</Text>
            </View>
          );
        }
        if (item.currentSchool) {
          fields.push(
            <View key="school" style={styles.detailRow}>
              <MaterialCommunityIcons name="school" size={10} color="#27ae60" />
              <Text style={styles.detailText}><Text style={styles.labelText}>School: </Text>{item.currentSchool}</Text>
            </View>
          );
        }
        if (item.academicPerformance) {
          fields.push(
            <View key="performance" style={styles.detailRow}>
              <MaterialCommunityIcons name="trophy" size={10} color="#f39c12" />
              <Text style={styles.detailText}><Text style={styles.labelText}>Performance: </Text>{item.academicPerformance}</Text>
            </View>
          );
        }
        if (item.lastYearPercentage) {
          fields.push(
            <View key="percentage" style={styles.detailRow}>
              <MaterialCommunityIcons name="percent" size={10} color="#f39c12" />
              <Text style={styles.detailText}><Text style={styles.labelText}>Last Year: </Text>{item.lastYearPercentage}%</Text>
            </View>
          );
        }
        if (item.familyIncome) {
          fields.push(
            <View key="income" style={styles.detailRow}>
              <MaterialCommunityIcons name="currency-usd" size={10} color="#7f8c8d" />
              <Text style={styles.detailText}><Text style={styles.labelText}>Family Income: </Text>PKR {item.familyIncome.toLocaleString()}/month</Text>
            </View>
          );
        }
        if (item.guardianPhone) {
          fields.push(
            <View key="phone" style={styles.detailRow}>
              <MaterialCommunityIcons name="phone" size={10} color="#7f8c8d" />
              <Text style={styles.detailText}>{item.guardianPhone}</Text>
            </View>
          );
        }
        if (item.guardianEmail) {
          fields.push(
            <View key="email" style={styles.detailRow}>
              <MaterialCommunityIcons name="email" size={10} color="#7f8c8d" />
              <Text style={styles.detailText}>{item.guardianEmail}</Text>
            </View>
          );
        }
      } else if (domain === 'welfare') {
        // Welfare Work specific fields
        if (item.projectName) {
          fields.push(
            <View key="project" style={styles.detailRow}>
              <MaterialCommunityIcons name="folder-multiple" size={10} color="#f39c12" />
              <Text style={styles.detailText}><Text style={styles.labelText}>Project: </Text>{item.projectName}</Text>
            </View>
          );
        }
        if (item.category) {
          fields.push(
            <View key="category" style={styles.detailRow}>
              <MaterialCommunityIcons name="tag-multiple" size={10} color="#f39c12" />
              <Text style={styles.detailText}><Text style={styles.labelText}>Category: </Text>{item.category}</Text>
            </View>
          );
        }
        if (item.targetBeneficiaries) {
          fields.push(
            <View key="beneficiaries" style={styles.detailRow}>
              <MaterialCommunityIcons name="account-group" size={10} color="#f39c12" />
              <Text style={styles.detailText}><Text style={styles.labelText}>Beneficiaries: </Text>{item.currentBeneficiaries || 0}/{item.targetBeneficiaries}</Text>
            </View>
          );
        }
        if (item.volunteersNeeded) {
          fields.push(
            <View key="volunteers" style={styles.detailRow}>
              <MaterialCommunityIcons name="hand-heart" size={10} color="#f39c12" />
              <Text style={styles.detailText}><Text style={styles.labelText}>Volunteers: </Text>{item.currentVolunteers || 0}/{item.volunteersNeeded}</Text>
            </View>
          );
        }
        if (item.urgencyLevel) {
          fields.push(
            <View key="urgency" style={styles.detailRow}>
              <MaterialCommunityIcons name="alert-circle" size={10} color={item.urgencyLevel === 'critical' ? '#e74c3c' : '#f39c12'} />
              <Text style={[styles.detailText, { color: item.urgencyLevel === 'critical' ? '#e74c3c' : '#f39c12', fontWeight: '600' }]}>
                Urgency: {item.urgencyLevel.toUpperCase()}
              </Text>
            </View>
          );
        }
        if (item.contactPersonName) {
          fields.push(
            <View key="contact" style={styles.detailRow}>
              <MaterialCommunityIcons name="account-circle" size={10} color="#7f8c8d" />
              <Text style={styles.detailText}><Text style={styles.labelText}>Contact: </Text>{item.contactPersonName}</Text>
            </View>
          );
        }
        if (item.contactPhone) {
          fields.push(
            <View key="phone" style={styles.detailRow}>
              <MaterialCommunityIcons name="phone" size={10} color="#7f8c8d" />
              <Text style={styles.detailText}>{item.contactPhone}</Text>
            </View>
          );
        }
        if (item.contactEmail) {
          fields.push(
            <View key="email" style={styles.detailRow}>
              <MaterialCommunityIcons name="email" size={10} color="#7f8c8d" />
              <Text style={styles.detailText}>{item.contactEmail}</Text>
            </View>
          );
        }
        if (item.activities && Array.isArray(item.activities) && item.activities.length > 0) {
          fields.push(
            <View key="activities" style={styles.activitiesContainer}>
              <Text style={styles.sectionLabel}>Activities:</Text>
              {item.activities.slice(0, 3).map((activity: string, idx: number) => (
                <Text key={idx} style={styles.activityItem}>• {activity}</Text>
              ))}
              {item.activities.length > 3 && (
                <Text style={styles.moreText}>+ {item.activities.length - 3} more</Text>
              )}
            </View>
          );
        }
      }

      return fields;
    };

    return (
    <View style={[styles.studentCard, isSelected && styles.studentCardSelected]}>
      {/* Checkbox */}
      {!isAdopted && (
          <TouchableOpacity
          style={styles.cardCheckbox}
          onPress={() => toggleItemSelection(itemId)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <MaterialCommunityIcons name="check" size={14} color="#fff" />}
          </View>
          </TouchableOpacity>
      )}

      {/* Name */}
      <Text style={styles.cardName} numberOfLines={1}>{itemName}</Text>

      {/* Location */}
      <View style={styles.cardLocationRow}>
        <MaterialCommunityIcons name="map-marker" size={12} color="#7f8c8d" />
        <Text style={styles.cardLocation} numberOfLines={1}>{itemLocation}</Text>
      </View>

      {/* Amount */}
      {amountNeeded > 0 ? (
        <View style={styles.cardAmountRow}>
          <MaterialCommunityIcons name="alert-circle" size={12} color="#e74c3c" />
          <Text style={styles.cardAmountNeeded}>Needed: {formatAmount(amountNeeded)}</Text>
        </View>
      ) : itemAmount > 0 ? (
        <View style={styles.cardAmountRow}>
          <MaterialCommunityIcons name="currency-usd" size={12} color="#27ae60" />
          <Text style={styles.cardAmount}>{formatAmount(itemAmount)}</Text>
        </View>
      ) : null}

      {/* Detail Button */}
          <TouchableOpacity
        style={styles.cardDetailButton}
            onPress={() => {
          (navigation as any).navigate('AdoptionDetail', { item, domain });
            }}
          >
        <Text style={styles.cardDetailButtonText}>See Detail</Text>
        <MaterialCommunityIcons name="chevron-right" size={14} color="#3498db" />
          </TouchableOpacity>
    </View>
  );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3498db" />
      <SafeAreaView style={styles.statusBarArea} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{domainTitles[domain] || 'Adoption List'}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, selectedItems.size === 0 && styles.headerButtonDisabled]}
            onPress={handleAdoptNowClick}
            disabled={selectedItems.size === 0}
          >
            <MaterialCommunityIcons name="heart" size={16} color="#fff" />
            <Text style={styles.headerButtonText}>Adopt Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{currentData.length}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {currentData.filter(item => item.adopted || item.status === 'adopted').length}
          </Text>
          <Text style={styles.statLabel}>Adopted</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: selectedItems.size > 0 ? '#27ae60' : '#7f8c8d' }]}>
            {selectedItems.size}
          </Text>
          <Text style={styles.statLabel}>Selected</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#7f8c8d" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, description, or location..."
          placeholderTextColor="#95a5a6"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchClear}>
            <MaterialCommunityIcons name="close-circle" size={20} color="#7f8c8d" />
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading adoption opportunities...</Text>
        </View>
      ) : (
      <FlatList
          key="two-column-list"
          data={currentData}
        renderItem={renderStudentCard}
          keyExtractor={(item) => String(item.id || item._id || Math.random())}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={currentData.length > 0 ? styles.row : undefined}
          refreshing={isLoading}
          onRefresh={() => {
            console.log('🔄 Refreshing data for domain:', domain);
            switch (domain) {
              case 'health':
                refetchHealth();
                break;
              case 'higher-education':
                refetchHigherEducation();
                break;
              case 'school-student':
                refetchSchool();
                break;
              case 'welfare':
                refetchWelfare();
                break;
            }
          }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="information-outline" size={64} color="#95a5a6" />
              <Text style={styles.emptyText}>No items available</Text>
              <Text style={styles.emptySubtext}>
                {isLoading ? 'Loading...' : 'Check back later for new adoption opportunities'}
              </Text>
              {healthError && domain === 'health' && (
                <Text style={[styles.emptySubtext, { color: '#e74c3c', marginTop: 8 }]}>
                  Error: {String('data' in healthError && healthError.data && typeof healthError.data === 'object' && 'message' in healthError.data ? healthError.data.message : 'message' in healthError ? healthError.message : 'Failed to load data')}
                </Text>
              )}
              {higherEducationError && domain === 'higher-education' && (
                <Text style={[styles.emptySubtext, { color: '#e74c3c', marginTop: 8 }]}>
                  Error: {String('data' in higherEducationError && higherEducationError.data && typeof higherEducationError.data === 'object' && 'message' in higherEducationError.data ? higherEducationError.data.message : 'message' in higherEducationError ? higherEducationError.message : 'Failed to load data')}
                </Text>
              )}
              {schoolError && domain === 'school-student' && (
                <Text style={[styles.emptySubtext, { color: '#e74c3c', marginTop: 8 }]}>
                  Error: {String('data' in schoolError && schoolError.data && typeof schoolError.data === 'object' && 'message' in schoolError.data ? schoolError.data.message : 'message' in schoolError ? schoolError.message : 'Failed to load data')}
                </Text>
              )}
              {welfareError && domain === 'welfare' && (
                <Text style={[styles.emptySubtext, { color: '#e74c3c', marginTop: 8 }]}>
                  Error: {String('data' in welfareError && welfareError.data && typeof welfareError.data === 'object' && 'message' in welfareError.data ? welfareError.data.message : 'message' in welfareError ? welfareError.message : 'Failed to load data')}
                </Text>
              )}
          </View>
        }
      />
      )}

      {/* Payment Summary Modal */}
      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adoption Summary</Text>
              <TouchableOpacity
                onPress={() => setShowPaymentModal(false)}
                style={styles.modalCloseButton}
              >
                <MaterialCommunityIcons name="close" size={24} color="#7f8c8d" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSubtitle}>
                {selectedItemsData.length} item(s) selected
              </Text>

              {selectedItemsData.map((item, index) => {
                const itemName = item.name || item.title || item.patientName || item.studentName || item.projectName || 'Unknown';
                const itemAmount = item.amount || item.estimatedCost || item.totalTuitionFee || item.annualTuitionFee || item.totalBudget || 0;
                
                return (
                  <View key={String(item.id || item._id || index)} style={styles.summaryItem}>
                    <View style={styles.summaryItemLeft}>
                      <Text style={styles.summaryItemName}>{itemName}</Text>
                      {item.description && (
                        <Text style={styles.summaryItemDesc} numberOfLines={2}>
                          {item.description}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.summaryItemAmount}>
                      PKR {itemAmount.toLocaleString()}
                    </Text>
                  </View>
                );
              })}

              <View style={styles.totalContainer}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  <Text style={styles.totalAmount}>PKR {totalAmount.toLocaleString()}</Text>
                </View>
                {totalAmountNeeded > 0 && (
                  <View style={styles.totalRow}>
                    <View style={styles.totalNeededRow}>
                      <MaterialCommunityIcons name="alert-circle" size={16} color="#e74c3c" />
                      <Text style={styles.totalNeededLabel}>Total Needed</Text>
                    </View>
                    <Text style={styles.totalAmountNeeded}>PKR {totalAmountNeeded.toLocaleString()}</Text>
                  </View>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowPaymentModal(false)}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleAdoptMultiple}
                disabled={isAdoptingMultiple}
              >
                {isAdoptingMultiple ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalButtonTextPrimary}>Confirm Adoption</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerActions: {
    minWidth: 90,
    alignItems: 'flex-end',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27ae60',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  headerButtonDisabled: {
    backgroundColor: '#bdc3c7',
    opacity: 0.6,
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  adoptButtonInStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
    minWidth: 110,
    justifyContent: 'center',
  },
  adoptButtonDisabled: {
    backgroundColor: '#bdc3c7',
    opacity: 0.6,
  },
  adoptButtonInStatsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    padding: 10,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
  },
  studentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    width: '47%',
  },
  studentCardSelected: {
    borderColor: '#3498db',
    backgroundColor: '#f0f8ff',
  },
  cardCheckbox: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#bdc3c7',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  cardName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 6,
    marginRight: 30,
    marginTop: 2,
  },
  cardLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  cardLocation: {
    fontSize: 10,
    color: '#7f8c8d',
    flex: 1,
  },
  cardAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  cardAmount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#27ae60',
  },
  cardAmountNeeded: {
    fontSize: 11,
    fontWeight: '700',
    color: '#e74c3c',
  },
  statusBadge: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  statusAdopted: {
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#856404',
  },
  statusTextAdopted: {
    color: '#155724',
  },
  studentDetails: {
    marginBottom: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 11,
    color: '#7f8c8d',
    marginLeft: 4,
    flex: 1,
  },
  amountText: {
    color: '#27ae60',
    fontWeight: '700',
  },
  priceContainer: {
    backgroundColor: '#f0fdf4',
    borderRadius: 6,
    padding: 6,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#d4edda',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#27ae60',
  },
  priceSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 20,
    gap: 4,
  },
  priceSubText: {
    fontSize: 10,
    color: '#27ae60',
    fontWeight: '500',
  },
  description: {
    fontSize: 11,
    color: '#2c3e50',
    lineHeight: 14,
    marginBottom: 6,
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
  emptySubtext: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  additionalInfo: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  additionalText: {
    fontSize: 12,
    color: '#95a5a6',
    marginLeft: 8,
  },
  amountAfterContact: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  amountAfterContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  amountAfterContactLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2c3e50',
  },
  amountAfterContactValue: {
    fontSize: 10,
    fontWeight: '700',
    color: '#27ae60',
  },
  amountNeededBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
    marginBottom: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#fcc',
  },
  amountNeededText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#e74c3c',
  },
  cardDetailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e3f2fd',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#3498db',
    gap: 4,
  },
  cardDetailButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#3498db',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginVertical: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
    padding: 0,
  },
  searchClear: {
    marginLeft: 8,
    padding: 4,
  },
  labelText: {
    fontWeight: '600',
    color: '#2c3e50',
  },
  activitiesContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 6,
  },
  activityItem: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 8,
    marginBottom: 4,
  },
  moreText: {
    fontSize: 12,
    color: '#3498db',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f8c8d',
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  summaryItemLeft: {
    flex: 1,
    marginRight: 12,
  },
  summaryItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  summaryItemDesc: {
    fontSize: 12,
    color: '#7f8c8d',
    lineHeight: 16,
  },
  summaryItemAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#27ae60',
  },
  totalContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#3498db',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#27ae60',
  },
  totalNeededRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  totalNeededLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e74c3c',
  },
  totalAmountNeeded: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e74c3c',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonSecondary: {
    backgroundColor: '#ecf0f1',
  },
  modalButtonPrimary: {
    backgroundColor: '#3498db',
  },
  modalButtonPay: {
    backgroundColor: '#27ae60',
    flexDirection: 'row',
    gap: 6,
  },
  modalButtonTextSecondary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  modalButtonTextPrimary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

