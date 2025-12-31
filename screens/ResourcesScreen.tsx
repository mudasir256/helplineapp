import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';

export default function ResourcesScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.statusBarArea} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Resources</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Materials</Text>
          
          <TouchableOpacity style={styles.resourceCard}>
            <Text style={styles.resourceCardTitle}>Study Guides</Text>
            <Text style={styles.resourceCardText}>Access comprehensive study materials</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resourceCard}>
            <Text style={styles.resourceCardTitle}>Video Tutorials</Text>
            <Text style={styles.resourceCardText}>Watch educational videos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resourceCard}>
            <Text style={styles.resourceCardTitle}>Practice Tests</Text>
            <Text style={styles.resourceCardText}>Test your knowledge</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scholarship Information</Text>
          
          <TouchableOpacity style={styles.resourceCard}>
            <Text style={styles.resourceCardTitle}>Available Scholarships</Text>
            <Text style={styles.resourceCardText}>Browse scholarship opportunities</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resourceCard}>
            <Text style={styles.resourceCardTitle}>Application Guidelines</Text>
            <Text style={styles.resourceCardText}>Learn how to apply</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 80,
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
  resourceCard: {
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
  resourceCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  resourceCardText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
});

