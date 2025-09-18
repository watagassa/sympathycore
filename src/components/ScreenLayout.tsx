// components/ScreenLayout.tsx
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Navigation } from './Navigation';
import { RootStackParamList } from '../utils/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type ScreenLayoutProps = {
  children: React.ReactNode;
  activeScreen: keyof RootStackParamList;
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  children,
  activeScreen,
  navigation,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>{children}</ScrollView>
      <Navigation
        activeScreen={activeScreen}
        onScreenChange={screen => navigation.navigate(screen)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B1E27',
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
