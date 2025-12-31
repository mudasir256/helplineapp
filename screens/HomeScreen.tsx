import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import AdoptionModal from '../components/AdoptionModal';

export default function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [isAdoptionModalOpen, setIsAdoptionModalOpen] = useState(false);

  const handleSelectDomain = (domain: string) => {
    (navigation as any).navigate('AdoptionList', { domain });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.statusBarArea} />
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
        </View>
        <View style={styles.userInfoContainer}>
          <View style={styles.profileImageContainer}>
            <Text style={styles.profileImageText}>
              {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="school" size={24} color="#3498db" />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="hand-heart" size={24} color="#27ae60" />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Adopted</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="book-check" size={24} color="#e74c3c" />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Applications</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <MaterialCommunityIcons name="lightning-bolt" size={20} color="#3498db" />
          </View>
          
          <View style={styles.actionGrid}>
            <TouchableOpacity style={[styles.actionCard, styles.actionCardPrimary]}>
              <View style={styles.actionIconContainer}>
                <MaterialCommunityIcons name="school-outline" size={28} color="#fff" />
              </View>
              <Text style={[styles.actionCardTitle, styles.actionCardTitlePrimary]}>Scholarship</Text>
              <Text style={[styles.actionCardText, styles.actionCardTextPrimary]}>Apply now</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionCard, styles.actionCardSecondary]}>
              <View style={[styles.actionIconContainer, styles.actionIconSecondary]}>
                <MaterialCommunityIcons name="help-circle-outline" size={28} color="#3498db" />
              </View>
              <Text style={[styles.actionCardTitle, styles.actionCardTitleSecondary]}>Support</Text>
              <Text style={[styles.actionCardText, styles.actionCardTextSecondary]}>Get help</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionCard, styles.actionCardTertiary]}>
              <View style={[styles.actionIconContainer, styles.actionIconTertiary]}>
                <MaterialCommunityIcons name="book-open-variant" size={28} color="#27ae60" />
              </View>
              <Text style={[styles.actionCardTitle, styles.actionCardTitleSecondary]}>Resources</Text>
              <Text style={[styles.actionCardText, styles.actionCardTextSecondary]}>Learn more</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionCard, styles.actionCardQuaternary]}
              onPress={() => setIsAdoptionModalOpen(true)}
            >
              <View style={[styles.actionIconContainer, styles.actionIconQuaternary]}>
                <MaterialCommunityIcons name="account-heart" size={28} color="#e74c3c" />
              </View>
              <Text style={[styles.actionCardTitle, styles.actionCardTitleSecondary]}>Adopt</Text>
              <Text style={[styles.actionCardText, styles.actionCardTextSecondary]}>Adopt now</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <MaterialCommunityIcons name="clock-outline" size={20} color="#3498db" />
          </View>
          <View style={styles.activityCard}>
            <MaterialCommunityIcons name="information-outline" size={32} color="#95a5a6" />
            <Text style={styles.activityText}>No recent activity</Text>
            <Text style={styles.activitySubtext}>Your activities will appear here</Text>
          </View>
        </View>
      </ScrollView>
      
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
    backgroundColor: '#f8f9fa',
  },
  statusBarArea: {
    backgroundColor: '#3498db',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileImageContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e8f4f8',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImageText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    letterSpacing: 0.2,
    maxWidth: 150,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2c3e50',
    letterSpacing: 0.3,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    minHeight: 140,
    justifyContent: 'center',
  },
  actionCardPrimary: {
    backgroundColor: '#3498db',
  },
  actionCardSecondary: {
    backgroundColor: '#fff',
  },
  actionCardTertiary: {
    backgroundColor: '#fff',
  },
  actionCardQuaternary: {
    backgroundColor: '#fff',
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIconSecondary: {
    backgroundColor: '#e3f2fd',
  },
  actionIconTertiary: {
    backgroundColor: '#e8f5e9',
  },
  actionIconQuaternary: {
    backgroundColor: '#ffebee',
  },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionCardTitlePrimary: {
    color: '#fff',
  },
  actionCardTitleSecondary: {
    color: '#2c3e50',
  },
  actionCardText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  actionCardTextPrimary: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  actionCardTextSecondary: {
    color: '#7f8c8d',
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  activityText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  activitySubtext: {
    fontSize: 13,
    color: '#95a5a6',
    textAlign: 'center',
  },
});

