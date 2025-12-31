import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image as ExpoImage } from 'expo-image';

export default function GoogleLogo({ size = 20 }: { size?: number }) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <ExpoImage
        source={require('../assets/images/Google__G__logo.svg.png')}
        style={[styles.logo, { width: size, height: size }]}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    resizeMode: 'contain',
  },
});
