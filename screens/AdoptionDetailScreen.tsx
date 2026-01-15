import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import {
  useAdoptHealthItemMutation,
  useAdoptHigherEducationItemMutation,
  useAdoptSchoolItemMutation,
  useAdoptWelfareItemMutation,
  AdoptionItem,
} from '../store/api/adoptionApi';
import { useAdoption } from '../contexts/AdoptionContext';

export default function AdoptionDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { item, domain } = (route.params as { item: AdoptionItem; domain: string }) || {};
  const { user } = useAuth();
  const { adoptItem, refetchAdoptions } = useAdoption();

  const [adoptHealthItem, { isLoading: isAdoptingHealth }] = useAdoptHealthItemMutation();
  const [adoptHigherEducationItem, { isLoading: isAdoptingHigherEducation }] = useAdoptHigherEducationItemMutation();
  const [adoptSchoolItem, { isLoading: isAdoptingSchool }] = useAdoptSchoolItemMutation();
  const [adoptWelfareItem, { isLoading: isAdoptingWelfare }] = useAdoptWelfareItemMutation();

  if (!item) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Item not found</Text>
      </View>
    );
  }

  const itemId = String(item.id || item._id || '');
  const itemName = item.name || item.title || item.patientName || item.studentName || item.projectName || 'Unknown';
  const itemAge = item.age || item.patientAge || item.studentAge || 0;
  const itemLocation = item.location || item.address || item.city || item.hospitalAddress || item.institutionAddress || item.schoolAddress || 'Location not specified';
  const itemDescription = item.description || 'No description available';
  const itemAmount = item.amount || item.estimatedCost || item.totalTuitionFee || item.annualTuitionFee || item.totalBudget || 0;
  const amountNeeded = item.amountNeeded || (itemAmount > 0 && item.amountRaised ? itemAmount - item.amountRaised : itemAmount);
  const amountRaised = item.amountRaised || 0;
  const isAdopted = item.adopted || item.status === 'adopted';

  const formatAmount = (amount?: number) => {
    if (!amount) return 'Amount not specified';
    return `PKR ${amount.toLocaleString()}`;
  };

  const handleAdopt = async () => {
    try {
      const adopterName = user?.name || 'Anonymous';
      const adopterEmail = user?.email || '';
      const adopterPhone = '0000000000'; // Default phone - backend requires this field

      if (!adopterEmail) {
        Alert.alert('Error', 'Please update your profile with email address to adopt.');
        return;
      }

      if (!adopterName || adopterName === 'Anonymous') {
        Alert.alert('Error', 'Please update your profile with your name to adopt.');
        return;
      }

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
        description: itemDescription,
      });

      // Refetch adoptions from backend
      refetchAdoptions();

      Alert.alert(
        'Success!',
        `You have successfully adopted ${itemName}. They will appear in your Adopted tab.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      console.error('Adoption error:', error);
      Alert.alert(
        'Error',
        error?.data?.message || error?.message || 'Failed to adopt. Please try again.'
      );
    }
  };

  const getDomainSpecificFields = () => {
    const fields: React.ReactElement[] = [];

    if (domain === 'health') {
      if (item.patientName) fields.push(<DetailRow key="patient" icon="account" iconColor="#e74c3c" label="Patient" value={item.patientName} />);
      if (item.medicalCondition) fields.push(<DetailRow key="condition" icon="medical-bag" iconColor="#e74c3c" label="Condition" value={item.medicalCondition} />);
      if (item.hospitalName) fields.push(<DetailRow key="hospital" icon="hospital-building" iconColor="#e74c3c" label="Hospital" value={item.hospitalName} />);
      if (item.doctorName) fields.push(<DetailRow key="doctor" icon="doctor" iconColor="#e74c3c" label="Doctor" value={item.doctorName} />);
      if (item.treatmentType) fields.push(<DetailRow key="treatment" icon="stethoscope" iconColor="#e74c3c" label="Treatment" value={item.treatmentType} />);
      if (item.urgencyLevel) fields.push(<DetailRow key="urgency" icon="alert-circle" iconColor={item.urgencyLevel === 'critical' ? '#e74c3c' : '#f39c12'} label="Urgency" value={item.urgencyLevel.toUpperCase()} />);
      if (item.contactPersonName) fields.push(<DetailRow key="contact" icon="account-circle" iconColor="#7f8c8d" label="Contact" value={`${item.contactPersonName} (${item.contactPersonRelation})`} />);
      if (item.contactPhone) fields.push(<DetailRow key="phone" icon="phone" iconColor="#7f8c8d" label="Phone" value={item.contactPhone} />);
      if (item.contactEmail) fields.push(<DetailRow key="email" icon="email" iconColor="#7f8c8d" label="Email" value={item.contactEmail} />);
    } else if (domain === 'higher-education') {
      if (item.studentName) fields.push(<DetailRow key="student" icon="account-school" iconColor="#3498db" label="Student" value={item.studentName} />);
      if (item.fieldOfStudy) fields.push(<DetailRow key="field" icon="book-open-variant" iconColor="#3498db" label="Field" value={item.fieldOfStudy} />);
      if (item.currentInstitution) fields.push(<DetailRow key="institution" icon="school" iconColor="#3498db" label="Institution" value={item.currentInstitution} />);
      if (item.currentSemester) fields.push(<DetailRow key="semester" icon="calendar-clock" iconColor="#3498db" label="Semester" value={item.currentSemester} />);
      if (item.CGPA) fields.push(<DetailRow key="cgpa" icon="star" iconColor="#f39c12" label="CGPA" value={String(item.CGPA)} />);
      if (item.familyIncome) fields.push(<DetailRow key="income" icon="currency-usd" iconColor="#7f8c8d" label="Family Income" value={`PKR ${item.familyIncome.toLocaleString()}/month`} />);
      if (item.studentPhone) fields.push(<DetailRow key="phone" icon="phone" iconColor="#7f8c8d" label="Phone" value={item.studentPhone} />);
      if (item.studentEmail) fields.push(<DetailRow key="email" icon="email" iconColor="#7f8c8d" label="Email" value={item.studentEmail} />);
    } else if (domain === 'school-student') {
      if (item.studentName) fields.push(<DetailRow key="student" icon="account-school" iconColor="#27ae60" label="Student" value={item.studentName} />);
      if (item.currentClass) fields.push(<DetailRow key="class" icon="book-open-page-variant" iconColor="#27ae60" label="Class" value={item.currentClass} />);
      if (item.currentSchool) fields.push(<DetailRow key="school" icon="school" iconColor="#27ae60" label="School" value={item.currentSchool} />);
      if (item.academicPerformance) fields.push(<DetailRow key="performance" icon="trophy" iconColor="#f39c12" label="Performance" value={item.academicPerformance} />);
      if (item.lastYearPercentage) fields.push(<DetailRow key="percentage" icon="percent" iconColor="#f39c12" label="Last Year" value={`${item.lastYearPercentage}%`} />);
      if (item.familyIncome) fields.push(<DetailRow key="income" icon="currency-usd" iconColor="#7f8c8d" label="Family Income" value={`PKR ${item.familyIncome.toLocaleString()}/month`} />);
      if (item.guardianPhone) fields.push(<DetailRow key="phone" icon="phone" iconColor="#7f8c8d" label="Phone" value={item.guardianPhone} />);
      if (item.guardianEmail) fields.push(<DetailRow key="email" icon="email" iconColor="#7f8c8d" label="Email" value={item.guardianEmail} />);
    } else if (domain === 'welfare') {
      if (item.projectName) fields.push(<DetailRow key="project" icon="folder-multiple" iconColor="#f39c12" label="Project" value={item.projectName} />);
      if (item.category) fields.push(<DetailRow key="category" icon="tag-multiple" iconColor="#f39c12" label="Category" value={item.category} />);
      if (item.targetBeneficiaries) fields.push(<DetailRow key="beneficiaries" icon="account-group" iconColor="#f39c12" label="Beneficiaries" value={`${item.currentBeneficiaries || 0}/${item.targetBeneficiaries}`} />);
      if (item.volunteersNeeded) fields.push(<DetailRow key="volunteers" icon="hand-heart" iconColor="#f39c12" label="Volunteers" value={`${item.currentVolunteers || 0}/${item.volunteersNeeded}`} />);
      if (item.urgencyLevel) fields.push(<DetailRow key="urgency" icon="alert-circle" iconColor={item.urgencyLevel === 'critical' ? '#e74c3c' : '#f39c12'} label="Urgency" value={item.urgencyLevel.toUpperCase()} />);
      if (item.contactPersonName) fields.push(<DetailRow key="contact" icon="account-circle" iconColor="#7f8c8d" label="Contact" value={item.contactPersonName} />);
      if (item.contactPhone) fields.push(<DetailRow key="phone" icon="phone" iconColor="#7f8c8d" label="Phone" value={item.contactPhone} />);
      if (item.contactEmail) fields.push(<DetailRow key="email" icon="email" iconColor="#7f8c8d" label="Email" value={item.contactEmail} />);
      if (item.activities && Array.isArray(item.activities) && item.activities.length > 0) {
        fields.push(
          <View key="activities" style={styles.activitiesContainer}>
            <Text style={styles.sectionLabel}>Activities:</Text>
            {item.activities.map((activity: string, idx: number) => (
              <Text key={idx} style={styles.activityItem}>• {activity}</Text>
            ))}
          </View>
        );
      }
    }

    return fields;
  };

  const isAdopting = isAdoptingHealth || isAdoptingHigherEducation || isAdoptingSchool || isAdoptingWelfare;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3498db" />
      <SafeAreaView style={styles.statusBarArea} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Name and Status */}
        <View style={styles.nameSection}>
          <Text style={styles.name}>{itemName}</Text>
          {itemAge > 0 && <Text style={styles.age}>{itemAge} years old</Text>}
          <View style={[styles.statusBadge, isAdopted && styles.statusAdopted]}>
            <Text style={[styles.statusText, isAdopted && styles.statusTextAdopted]}>
              {isAdopted ? 'Adopted' : 'Needs Support'}
            </Text>
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="map-marker" size={18} color="#7f8c8d" />
            <Text style={styles.locationText}>{itemLocation}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{itemDescription}</Text>
        </View>

        {/* Amount Information */}
        {(itemAmount > 0 || amountNeeded > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Financial Information</Text>
            {itemAmount > 0 && (
              <View style={styles.amountCard}>
                <View style={styles.amountRow}>
                  <MaterialCommunityIcons name="currency-usd" size={20} color="#27ae60" />
                  <Text style={styles.amountLabel}>Total Amount</Text>
                  <Text style={styles.amountValue}>{formatAmount(itemAmount)}</Text>
                </View>
                {amountRaised > 0 && (
                  <View style={styles.amountRow}>
                    <MaterialCommunityIcons name="check-circle" size={18} color="#27ae60" />
                    <Text style={styles.amountLabel}>Raised</Text>
                    <Text style={[styles.amountValue, { color: '#27ae60' }]}>{formatAmount(amountRaised)}</Text>
                  </View>
                )}
                {amountNeeded > 0 && (
                  <View style={styles.amountRow}>
                    <MaterialCommunityIcons name="alert-circle" size={18} color="#e74c3c" />
                    <Text style={[styles.amountLabel, { color: '#e74c3c' }]}>Needed</Text>
                    <Text style={[styles.amountValue, { color: '#e74c3c', fontWeight: '700' }]}>{formatAmount(amountNeeded)}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Domain-specific fields */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          {getDomainSpecificFields()}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {!isAdopted && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.adoptButton, isAdopting && styles.buttonDisabled]}
            onPress={handleAdopt}
            disabled={isAdopting}
          >
            {isAdopting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="heart" size={20} color="#fff" />
                <Text style={styles.adoptButtonText}>Adopt Now</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const DetailRow = ({ icon, iconColor, label, value }: { icon: string; iconColor: string; label: string; value: string }) => (
  <View style={styles.detailRow}>
    <MaterialCommunityIcons name={icon as any} size={16} color={iconColor} />
    <Text style={styles.detailLabel}>{label}: </Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

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
  statusBadge: {
    alignSelf: 'flex-start',
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
  locationText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginLeft: 8,
    flex: 1,
  },
  description: {
    fontSize: 15,
    color: '#2c3e50',
    lineHeight: 22,
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
    marginBottom: 12,
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
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
    minWidth: 100,
  },
  detailValue: {
    fontSize: 15,
    color: '#7f8c8d',
    flex: 1,
  },
  activitiesContainer: {
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  activityItem: {
    fontSize: 15,
    color: '#7f8c8d',
    marginLeft: 8,
    marginBottom: 4,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  adoptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  adoptButtonText: {
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

