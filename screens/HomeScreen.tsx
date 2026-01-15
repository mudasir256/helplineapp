import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import AdoptionModal from '../components/AdoptionModal';
import {
  useListHealthItemsQuery,
  useListHigherEducationItemsQuery,
  useListSchoolItemsQuery,
  useListWelfareItemsQuery,
  useGetMyHealthAdoptionsQuery,
  useGetMyHigherEducationAdoptionsQuery,
  useGetMySchoolAdoptionsQuery,
  useGetMyWelfareAdoptionsQuery,
} from '../store/api/adoptionApi';

export default function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [isAdoptionModalOpen, setIsAdoptionModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { 
    data: healthData, 
    refetch: refetchHealth 
  } = useListHealthItemsQuery();
  
  const { 
    data: higherEducationData, 
    refetch: refetchHigherEducation 
  } = useListHigherEducationItemsQuery();
  
  const { 
    data: schoolData, 
    refetch: refetchSchool 
  } = useListSchoolItemsQuery();
  
  const { 
    data: welfareData, 
    refetch: refetchWelfare 
  } = useListWelfareItemsQuery();

  const { 
    data: myHealthAdoptions, 
    refetch: refetchMyHealth 
  } = useGetMyHealthAdoptionsQuery(
    { email: user?.email, userId: user?.id },
    { 
      skip: !user?.email && !user?.id,
    }
  );
  
  const { 
    data: myHigherEducationAdoptions, 
    refetch: refetchMyHigherEducation 
  } = useGetMyHigherEducationAdoptionsQuery(
    { email: user?.email, userId: user?.id },
    { 
      skip: !user?.email && !user?.id,
    }
  );
  
  const { 
    data: mySchoolAdoptions, 
    refetch: refetchMySchool 
  } = useGetMySchoolAdoptionsQuery(
    { email: user?.email, userId: user?.id },
    { 
      skip: !user?.email && !user?.id,
    }
  );
  
  const { 
    data: myWelfareAdoptions, 
    refetch: refetchMyWelfare 
  } = useGetMyWelfareAdoptionsQuery(
    { email: user?.email, userId: user?.id },
    { 
      skip: !user?.email && !user?.id,
    }
  );

  useFocusEffect(
    useCallback(() => {
      refetchHealth();
      refetchHigherEducation();
      refetchSchool();
      refetchWelfare();
      
      if (user?.email || user?.id) {
        refetchMyHealth();
        refetchMyHigherEducation();
        refetchMySchool();
        refetchMyWelfare();
      }
    }, [user?.email, user?.id, refetchHealth, refetchHigherEducation, refetchSchool, refetchWelfare, refetchMyHealth, refetchMyHigherEducation, refetchMySchool, refetchMyWelfare])
  );

  const totalApplications = useMemo(() => {
    const healthCount = healthData?.data?.length || 0;
    const higherEducationCount = higherEducationData?.data?.length || 0;
    const schoolCount = schoolData?.data?.length || 0;
    const welfareCount = welfareData?.data?.length || 0;
    return healthCount + higherEducationCount + schoolCount + welfareCount;
  }, [healthData, higherEducationData, schoolData, welfareData]);

  const totalAdopted = useMemo(() => {
    const healthAdopted = myHealthAdoptions?.data?.length || 0;
    const higherEducationAdopted = myHigherEducationAdoptions?.data?.length || 0;
    const schoolAdopted = mySchoolAdoptions?.data?.length || 0;
    const welfareAdopted = myWelfareAdoptions?.data?.length || 0;
    return healthAdopted + higherEducationAdopted + schoolAdopted + welfareAdopted;
  }, [myHealthAdoptions, myHigherEducationAdoptions, mySchoolAdoptions, myWelfareAdoptions]);

  const totalCampaigns = 4;

  const recentItems = useMemo(() => {
    const allItems: Array<{ item: any; domain: string; category: string }> = [];

    if (healthData?.data) {
      healthData.data.forEach((item: any) => {
        allItems.push({ item, domain: 'health', category: 'Health' });
      });
    }

    if (higherEducationData?.data) {
      higherEducationData.data.forEach((item: any) => {
        allItems.push({ item, domain: 'higher-education', category: 'Higher Education' });
      });
    }

    if (schoolData?.data) {
      schoolData.data.forEach((item: any) => {
        allItems.push({ item, domain: 'school-student', category: 'School Student' });
      });
    }

    if (welfareData?.data) {
      welfareData.data.forEach((item: any) => {
        allItems.push({ item, domain: 'welfare', category: 'Welfare' });
      });
    }

    allItems.sort((a, b) => {
      const dateA = a.item.createdAt ? new Date(a.item.createdAt).getTime() : 0;
      const dateB = b.item.createdAt ? new Date(b.item.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return allItems.slice(0, 2);
  }, [healthData, higherEducationData, schoolData, welfareData]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  const handleItemPress = (item: any, domain: string) => {
    (navigation as any).navigate('AdoptionList', { domain });
  };

  const handleSelectDomain = (domain: string) => {
    (navigation as any).navigate('AdoptionList', { domain });
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchHealth(),
        refetchHigherEducation(),
        refetchSchool(),
        refetchWelfare(),
        ...(user?.email || user?.id ? [
          refetchMyHealth(),
          refetchMyHigherEducation(),
          refetchMySchool(),
          refetchMyWelfare(),
        ] : []),
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [user?.email, user?.id, refetchHealth, refetchHigherEducation, refetchSchool, refetchWelfare, refetchMyHealth, refetchMyHigherEducation, refetchMySchool, refetchMyWelfare]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.statusBarArea} />
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
        </View>
        <View style={styles.userInfoContainer}>
          <View style={styles.profileImageContainer}>
            {(user?.profile_image || user?.picture || user?.avatar) ? (
              <Image
                source={{ uri: (user.profile_image || user.picture || user.avatar) as string }}
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.profileImageText}>
                {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3498db']}
            tintColor="#3498db"
          />
        }
      >
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="bullhorn" size={24} color="#3498db" />
            <Text style={styles.statNumber}>{totalCampaigns}</Text>
            <Text style={styles.statLabel}>Campaigns</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="hand-heart" size={24} color="#27ae60" />
            <Text style={styles.statNumber}>{totalAdopted}</Text>
            <Text style={styles.statLabel}>Adopted</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="book-check" size={24} color="#e74c3c" />
            <Text style={styles.statNumber}>{totalApplications}</Text>
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
          {recentItems.length > 0 ? (
            <View style={styles.recentItemsContainer}>
              {recentItems.map(({ item, domain, category }, index) => {
                const itemName = item.name || item.title || item.patientName || item.studentName || item.projectName || 'New Item';
                const itemDescription = item.description || 'No description available';
                const truncatedDescription = itemDescription.length > 60 
                  ? itemDescription.substring(0, 60) + '...' 
                  : itemDescription;

                return (
                  <TouchableOpacity
                    key={`${domain}-${item.id || item._id || index}`}
                    style={styles.recentItemCard}
                    onPress={() => handleItemPress(item, domain)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.recentItemHeader}>
                      <View style={styles.recentItemIconContainer}>
                        <MaterialCommunityIcons 
                          name={
                            domain === 'health' ? 'hospital' :
                            domain === 'higher-education' ? 'school' :
                            domain === 'school-student' ? 'book-open-variant' :
                            'hand-heart'
                          } 
                          size={20} 
                          color={
                            domain === 'health' ? '#e74c3c' :
                            domain === 'higher-education' ? '#3498db' :
                            domain === 'school-student' ? '#27ae60' :
                            '#9b59b6'
                          } 
                        />
                      </View>
                      <View style={styles.recentItemContent}>
                        <View style={styles.recentItemTitleRow}>
                          <Text style={styles.recentItemTitle} numberOfLines={1}>
                            {itemName}
                          </Text>
                          <View style={[styles.recentItemBadge, {
                            backgroundColor: 
                              domain === 'health' ? '#e74c3c15' :
                              domain === 'higher-education' ? '#3498db15' :
                              domain === 'school-student' ? '#27ae6015' :
                              '#9b59b615'
                          }]}>
                            <Text style={[styles.recentItemBadgeText, {
                              color: 
                                domain === 'health' ? '#e74c3c' :
                                domain === 'higher-education' ? '#3498db' :
                                domain === 'school-student' ? '#27ae60' :
                                '#9b59b6'
                            }]}>
                              {category}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.recentItemDescription} numberOfLines={2}>
                          {truncatedDescription}
                        </Text>
                        <Text style={styles.recentItemDate}>
                          {formatDate(item.createdAt)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.activityCard}>
              <MaterialCommunityIcons name="information-outline" size={32} color="#95a5a6" />
              <Text style={styles.activityText}>No recent activity</Text>
              <Text style={styles.activitySubtext}>New items will appear here</Text>
            </View>
          )}
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
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
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
  recentItemsContainer: {
    gap: 12,
  },
  recentItemCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  recentItemHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  recentItemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentItemContent: {
    flex: 1,
  },
  recentItemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    gap: 8,
  },
  recentItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    flex: 1,
  },
  recentItemBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  recentItemBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recentItemDescription: {
    fontSize: 13,
    color: '#7f8c8d',
    lineHeight: 18,
    marginBottom: 8,
  },
  recentItemDate: {
    fontSize: 11,
    color: '#95a5a6',
    fontWeight: '500',
  },
});

