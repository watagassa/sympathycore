import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import { MicScreen } from './screens/MicScreen';
import { RootStackParamList } from './utils/types';
import DebugHomeScreen from './screens/DebugHomeScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

// 共通レイアウト
const ScreenWithFooter: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
};

const HomeWithFooter = (props: any) => (
  <ScreenWithFooter>
    <HomeScreen {...props} />
  </ScreenWithFooter>
);

const MicWithFooter = (props: any) => (
  <ScreenWithFooter>
    <MicScreen {...props} />
  </ScreenWithFooter>
);

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            component={HomeWithFooter}
            // options={{ title: 'メインページ' }}
          />
          <Stack.Screen
            name="Mic"
            component={MicWithFooter}
            // options={{ title: 'Micページ' }}
          />
          <Stack.Screen
            name="Debug"
            component={DebugHomeScreen}
            // options={{ title: 'debugページ' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  footer: { padding: 16, backgroundColor: '#eee', alignItems: 'center' },
});
