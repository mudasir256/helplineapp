import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// Screens
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import AdoptionListScreen from '../screens/AdoptionListScreen';
import AdoptionDetailScreen from '../screens/AdoptionDetailScreen';
import AdoptedItemDetailScreen from '../screens/AdoptedItemDetailScreen';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {user ? (
          // Authenticated screens - Show bottom tabs
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
                  <Stack.Screen
                    name="AdoptionList"
                    component={AdoptionListScreen}
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="AdoptionDetail"
                    component={AdoptionDetailScreen}
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="AdoptedItemDetail"
                    component={AdoptedItemDetailScreen}
                    options={{
                      headerShown: false,
                    }}
                  />
          </>
        ) : (
          // Unauthenticated screens
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

