import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
// Using a simple dropdown approach - can be replaced with @react-native-picker/picker if installed
import {
  useCreateHealthItemMutation,
  useCreateHigherEducationItemMutation,
  useCreateSchoolItemMutation,
  useCreateWelfareItemMutation,
} from '../store/api/adoptionApi';

const domainTitles: Record<string, string> = {
  health: 'Create Health Case',
  'higher-education': 'Create Higher Education Student',
  'school-student': 'Create School Student',
  welfare: 'Create Welfare Work',
};

export default function CreateAdoptionScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const domain = (route.params as { domain?: 'health' | 'higher-education' | 'school-student' | 'welfare' })?.domain || 'health';
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mutations
  const [createHealthItem] = useCreateHealthItemMutation();
  const [createHigherEducationItem] = useCreateHigherEducationItemMutation();
  const [createSchoolItem] = useCreateSchoolItemMutation();
  const [createWelfareItem] = useCreateWelfareItemMutation();

  // Common fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amountNeeded, setAmountNeeded] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Health specific fields
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('male');
  const [medicalCondition, setMedicalCondition] = useState('');
  const [treatmentType, setTreatmentType] = useState('surgery');

  // Higher Education specific fields
  const [studentName, setStudentName] = useState('');
  const [studentAge, setStudentAge] = useState('');
  const [studentGender, setStudentGender] = useState('male');
  const [currentEducationLevel, setCurrentEducationLevel] = useState('bachelor');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [currentInstitution, setCurrentInstitution] = useState('');

  // School Student specific fields
  const [schoolStudentName, setSchoolStudentName] = useState('');
  const [schoolStudentAge, setSchoolStudentAge] = useState('');
  const [schoolStudentGender, setSchoolStudentGender] = useState('male');
  const [educationLevel, setEducationLevel] = useState('primary');
  const [currentClass, setCurrentClass] = useState('');
  const [currentSchool, setCurrentSchool] = useState('');

  // Welfare specific fields
  const [category, setCategory] = useState('orphan-care');
  const [projectName, setProjectName] = useState('');
  const [organizerType, setOrganizerType] = useState('ngo');

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Title is required');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Description is required');
      return false;
    }
    if (!amountNeeded.trim() || isNaN(Number(amountNeeded))) {
      Alert.alert('Validation Error', 'Valid amount needed is required');
      return false;
    }
    if (!contactPhone.trim()) {
      Alert.alert('Validation Error', 'Contact phone is required');
      return false;
    }

    // Domain-specific validations
    if (domain === 'health') {
      if (!patientName.trim()) {
        Alert.alert('Validation Error', 'Patient name is required');
        return false;
      }
      if (!patientAge.trim() || isNaN(Number(patientAge))) {
        Alert.alert('Validation Error', 'Valid patient age is required');
        return false;
      }
      if (!medicalCondition.trim()) {
        Alert.alert('Validation Error', 'Medical condition is required');
        return false;
      }
    } else if (domain === 'higher-education') {
      if (!studentName.trim()) {
        Alert.alert('Validation Error', 'Student name is required');
        return false;
      }
      if (!studentAge.trim() || isNaN(Number(studentAge))) {
        Alert.alert('Validation Error', 'Valid student age is required');
        return false;
      }
      if (!fieldOfStudy.trim()) {
        Alert.alert('Validation Error', 'Field of study is required');
        return false;
      }
      if (!currentInstitution.trim()) {
        Alert.alert('Validation Error', 'Current institution is required');
        return false;
      }
    } else if (domain === 'school-student') {
      if (!schoolStudentName.trim()) {
        Alert.alert('Validation Error', 'Student name is required');
        return false;
      }
      if (!schoolStudentAge.trim() || isNaN(Number(schoolStudentAge))) {
        Alert.alert('Validation Error', 'Valid student age is required');
        return false;
      }
      if (!currentClass.trim()) {
        Alert.alert('Validation Error', 'Current class is required');
        return false;
      }
      if (!currentSchool.trim()) {
        Alert.alert('Validation Error', 'Current school is required');
        return false;
      }
    } else if (domain === 'welfare') {
      if (!projectName.trim()) {
        Alert.alert('Validation Error', 'Project name is required');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      let payload: any = {
        title: title.trim(),
        description: description.trim(),
        amountNeeded: Number(amountNeeded),
        contactPhone: contactPhone.trim(),
      };

      // Add domain-specific fields
      if (domain === 'health') {
        payload = {
          ...payload,
          patientName: patientName.trim(),
          patientAge: Number(patientAge),
          patientGender,
          medicalCondition: medicalCondition.trim(),
          treatmentType,
        };
        await createHealthItem(payload).unwrap();
      } else if (domain === 'higher-education') {
        payload = {
          ...payload,
          studentName: studentName.trim(),
          studentAge: Number(studentAge),
          studentGender,
          currentEducationLevel,
          fieldOfStudy: fieldOfStudy.trim(),
          currentInstitution: currentInstitution.trim(),
        };
        await createHigherEducationItem(payload).unwrap();
      } else if (domain === 'school-student') {
        payload = {
          ...payload,
          studentName: schoolStudentName.trim(),
          studentAge: Number(schoolStudentAge),
          studentGender: schoolStudentGender,
          educationLevel,
          currentClass: currentClass.trim(),
          currentSchool: currentSchool.trim(),
        };
        await createSchoolItem(payload).unwrap();
      } else if (domain === 'welfare') {
        payload = {
          ...payload,
          category,
          projectName: projectName.trim(),
          organizerType,
        };
        await createWelfareItem(payload).unwrap();
      }

      Alert.alert(
        'Success!',
        'Adoption case created successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Create error:', error);
      Alert.alert(
        'Error',
        error?.data?.message || error?.message || 'Failed to create adoption case. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderHealthForm = () => (
    <>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Patient Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter patient name"
          value={patientName}
          onChangeText={setPatientName}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Patient Age *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter patient age"
          value={patientAge}
          onChangeText={setPatientAge}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Patient Gender *</Text>
        <View style={styles.radioGroup}>
          {['male', 'female', 'other'].map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[styles.radioOption, patientGender === gender && styles.radioOptionSelected]}
              onPress={() => setPatientGender(gender)}
            >
              <Text style={[styles.radioText, patientGender === gender && styles.radioTextSelected]}>
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Medical Condition *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter medical condition"
          value={medicalCondition}
          onChangeText={setMedicalCondition}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Treatment Type *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., surgery, medication, therapy"
          value={treatmentType}
          onChangeText={setTreatmentType}
        />
        <Text style={styles.hintText}>Options: surgery, medication, therapy, diagnostic, emergency, other</Text>
      </View>
    </>
  );

  const renderHigherEducationForm = () => (
    <>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Student Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter student name"
          value={studentName}
          onChangeText={setStudentName}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Student Age *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter student age"
          value={studentAge}
          onChangeText={setStudentAge}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Student Gender *</Text>
        <View style={styles.radioGroup}>
          {['male', 'female', 'other'].map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[styles.radioOption, studentGender === gender && styles.radioOptionSelected]}
              onPress={() => setStudentGender(gender)}
            >
              <Text style={[styles.radioText, studentGender === gender && styles.radioTextSelected]}>
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Education Level *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., bachelor, master, phd"
          value={currentEducationLevel}
          onChangeText={setCurrentEducationLevel}
        />
        <Text style={styles.hintText}>Options: bachelor, master, phd, diploma, certification</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Field of Study *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Computer Engineering, Medicine"
          value={fieldOfStudy}
          onChangeText={setFieldOfStudy}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Current Institution *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter institution name"
          value={currentInstitution}
          onChangeText={setCurrentInstitution}
        />
      </View>
    </>
  );

  const renderSchoolStudentForm = () => (
    <>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Student Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter student name"
          value={schoolStudentName}
          onChangeText={setSchoolStudentName}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Student Age *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter student age"
          value={schoolStudentAge}
          onChangeText={setSchoolStudentAge}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Student Gender *</Text>
        <View style={styles.radioGroup}>
          {['male', 'female', 'other'].map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[styles.radioOption, schoolStudentGender === gender && styles.radioOptionSelected]}
              onPress={() => setSchoolStudentGender(gender)}
            >
              <Text style={[styles.radioText, schoolStudentGender === gender && styles.radioTextSelected]}>
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Education Level *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., primary, middle, secondary"
          value={educationLevel}
          onChangeText={setEducationLevel}
        />
        <Text style={styles.hintText}>Options: primary, middle, secondary, higher-secondary</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Current Class *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 3rd Grade, 10th Grade"
          value={currentClass}
          onChangeText={setCurrentClass}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Current School *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter school name"
          value={currentSchool}
          onChangeText={setCurrentSchool}
        />
      </View>
    </>
  );

  const renderWelfareForm = () => (
    <>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Category *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., orphan-care, clean-water"
          value={category}
          onChangeText={setCategory}
        />
        <Text style={styles.hintText}>
          Options: orphan-care, elderly-care, disability-support, women-empowerment, skill-development, food-distribution, clothing-drive, shelter-housing, clean-water, community-development, disaster-relief, other
        </Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Project Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter project name"
          value={projectName}
          onChangeText={setProjectName}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Organizer Type *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., ngo, foundation, individual"
          value={organizerType}
          onChangeText={setOrganizerType}
        />
        <Text style={styles.hintText}>Options: individual, ngo, foundation, trust, government, community</Text>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{domainTitles[domain] || 'Create Adoption'}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter title"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter detailed description"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
            </View>

            {domain === 'health' && renderHealthForm()}
            {domain === 'higher-education' && renderHigherEducationForm()}
            {domain === 'school-student' && renderSchoolStudentForm()}
            {domain === 'welfare' && renderWelfareForm()}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Amount Needed (PKR) *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter amount needed"
                value={amountNeeded}
                onChangeText={setAmountNeeded}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Contact Phone *</Text>
              <TextInput
                style={styles.input}
                placeholder="03001234567"
                value={contactPhone}
                onChangeText={setContactPhone}
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons name="check-circle" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Create Adoption Case</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardView: {
    flex: 1,
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    color: '#2c3e50',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  radioOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  radioOptionSelected: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  radioText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  radioTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  hintText: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 4,
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

