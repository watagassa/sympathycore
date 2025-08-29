import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RootStackParamList } from './utils/types';
import HomeScreen from './screens/HomeScreen';
import DetailScreen from './screens/DetailScreen';

// Stack Navigatorの型を指定
// 新しい画面を追加する時は、RootStackParamListに追加すること
const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      {/* 最初はHomeを映す */}
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'メインページ' }}
        />
        <Stack.Screen
          name="Detail"
          component={DetailScreen}
          options={{ title: '遷移先ページ' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
