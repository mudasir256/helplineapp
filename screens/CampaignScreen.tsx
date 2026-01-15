import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SLIDER_INTERVAL = 3000;
const SLIDER_HEIGHT = SCREEN_HEIGHT * 0.35; // Reduced height for smaller display
const SLIDER_HORIZONTAL_PADDING = 16; // Space on both sides of images

const campaignImages = [
  { image: require('../assets/images/MASJID.jpg'), title: 'Masjid Construction', description: 'Building mosques for communities' },
  { image: require('../assets/images/student.png'), title: 'Student Support', description: 'Education and scholarship programs' },
  { image: require('../assets/images/Vocational.png'), title: 'Vocational Training', description: 'Skills development and training' },
  { image: require('../assets/images/Grocery.png'), title: 'Food Assistance', description: 'Grocery and food distribution' },
];

export default function CampaignScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    React.useCallback(() => {
      StatusBar.setBarStyle('light-content');
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('#3498db');
      }
    }, [])
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % campaignImages.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, SLIDER_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const slideWidth = SCREEN_WIDTH - (SLIDER_HORIZONTAL_PADDING * 2);
    const index = Math.round(scrollPosition / slideWidth);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const handleDonate = () => {
    WebBrowser.openBrowserAsync('https://www.helplinewelfaretrust.org/donation');
  };

  const handleDetails = () => {
    WebBrowser.openBrowserAsync('https://www.helplinewelfaretrust.org');
  };

  const renderImageItem = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.slideContainer}>
      <Image source={item.image} style={styles.campaignImage} resizeMode="contain" />
      <View style={styles.imageInfo}>
        <Text style={styles.imageTitle}>{item.title}</Text>
        <Text style={styles.imageDescription}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#3498db" barStyle="light-content" translucent={false} />
      <View style={[styles.statusBarBackground, { height: insets.top }]} />
      <SafeAreaView style={styles.safeArea} edges={[]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>MAWAKHAT-E-MADINA</Text>
        </View>

      <View style={styles.content}>
        {/* Image Slider */}
        <View style={styles.sliderContainer}>
          <FlatList
            ref={flatListRef}
            data={campaignImages}
            renderItem={renderImageItem}
            keyExtractor={(item, index) => `image-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onScrollToIndexFailed={(info) => {
              // Handle scroll to index failure
              const wait = new Promise((resolve) => setTimeout(resolve, 500));
              wait.then(() => {
                flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
              });
            }}
          />
          
          {/* Pagination Dots */}
          <View style={styles.paginationContainer}>
            {campaignImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === activeIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Urdu Slogan */}
        <View style={styles.sloganContainer}>
          <Text style={styles.sloganText}>ہمت رکھو ہم ساتھ کھڑے ہیں</Text>
        </View>

        {/* Campaign Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>About Our Campaigns</Text>
          <Text style={styles.descriptionText}>
            We are committed to serving communities through various welfare programs including education, 
            food assistance, vocational training, and infrastructure development. Your support helps us 
            make a meaningful difference in people's lives.
          </Text>
        </View>

        {/* Campaign Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="account-group" size={24} color="#3498db" />
            <Text style={styles.statNumber}>10K+</Text>
            <Text style={styles.statLabel}>Beneficiaries</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="hand-heart" size={24} color="#e74c3c" />
            <Text style={styles.statNumber}>500+</Text>
            <Text style={styles.statLabel}>Projects</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="map-marker" size={24} color="#3498db" />
            <Text style={styles.statNumber}>50+</Text>
            <Text style={styles.statLabel}>Locations</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={[styles.actionButtonsContainer, { paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.detailsButton]} 
            onPress={handleDetails}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="information" size={16} color="#3498db" />
            <Text style={styles.detailsButtonText}>Details</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.donateButtonContainer]} 
            onPress={handleDonate} 
            activeOpacity={0.8}
          >
            <View style={styles.donateButton}>
              <MaterialCommunityIcons name="heart" size={18} color="#fff" />
              <Text style={styles.donateButtonText}>DONATE NOW</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3498db',
  },
  statusBarBackground: {
    backgroundColor: '#3498db',
    width: '100%',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#3498db',
    padding: 12,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  sliderContainer: {
    height: SLIDER_HEIGHT,
    marginTop: 4,
    marginBottom: 8,
    backgroundColor: 'transparent',
    paddingHorizontal: SLIDER_HORIZONTAL_PADDING,
  },
  slideContainer: {
    width: SCREEN_WIDTH - (SLIDER_HORIZONTAL_PADDING * 2),
    height: SLIDER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  campaignImage: {
    width: '100%',
    height: '75%',
  },
  imageInfo: {
    paddingTop: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  imageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  imageDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 2,
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#bdc3c7',
  },
  paginationDotActive: {
    width: 18,
    backgroundColor: '#3498db',
  },
  sloganContainer: {
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
  },
  sloganText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  descriptionContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 13,
    color: '#34495e',
    lineHeight: 20,
    textAlign: 'justify',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 4,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 4,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  detailsButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#3498db',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsButtonText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  donateButtonContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  donateButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  donateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
