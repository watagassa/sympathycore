// フッターのナビゲーションコンポーネント
// components/Navigation.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RootStackParamList } from '../utils/types';

type NavigationProps = {
  activeScreen: keyof RootStackParamList;
  onScreenChange: (screen: keyof RootStackParamList) => void;
};

export const Navigation: React.FC<NavigationProps> = ({
  activeScreen,
  onScreenChange,
}) => {
  const navItems: { id: keyof RootStackParamList; label: string }[] = [
    { id: 'Home', label: 'ホーム' },
    { id: 'Mic', label: 'マイク' },
    // { id: 'Detail', label: '詳細' },
    // { id: 'Ble', label: 'BLE' },
    { id: 'Debug', label: 'デバッグ' },
  ];

  return (
    <View style={styles.container}>
      {navItems.map(item => (
        <TouchableOpacity
          key={item.id}
          onPress={() => onScreenChange(item.id)}
          style={[
            styles.button,
            activeScreen === item.id && styles.activeButton,
          ]}
        >
          <Text
            style={[styles.text, activeScreen === item.id && styles.activeText]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 24,
    backgroundColor: '#2D2F3A',
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  activeButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#00FFE0',
  },
  text: {
    color: '#C7CCD6',
    fontWeight: 'bold',
  },
  activeText: {
    color: '#00FFE0',
  },
});
