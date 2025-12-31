import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import Toast from 'react-native-toast-message';
import { store } from './store/store';
import { AuthProvider } from './contexts/AuthContext';
import { AdoptionProvider } from './contexts/AdoptionContext';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <AdoptionProvider>
            <StatusBar 
              barStyle="light-content" 
              backgroundColor="#3498db" 
              translucent={false}
              hidden={false}
            />
            <AppNavigator />
            <Toast />
          </AdoptionProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}

