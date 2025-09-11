import React from 'react';
import { View, Text, Button } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/types';

// Home画面のナビゲーションの型を定義
// 画面遷移するscreenにはこれを改造して使うこと
type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Debug'
>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

const DebugHomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text>メインページ</Text>
      <Button
        title="遷移先ページへ"
        onPress={() => navigation.navigate('Detail')}
      />
      <Button title="BLEページへ" onPress={() => navigation.navigate('Ble')} />
      <Recorder />
    </View>
  );
};

import { StyleSheet } from 'react-native';
import Recorder from '../components/Recorder';

export default DebugHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
