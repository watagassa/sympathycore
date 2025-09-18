import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/types';
import { emotionTimeSeriesData } from '../test/mock-emotions';
import { LineChart } from 'react-native-chart-kit';
import { ScreenLayout } from '../components/ScreenLayout';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const screenWidth = Dimensions.get('window').width;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const chartConfig = {
    backgroundGradientFrom: '#4A5568',
    backgroundGradientTo: '#4A5568',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 2,
  };

  // グラフデータ（とりあえずHappyのみ）
  const getChartData = () => {
    const happyData = emotionTimeSeriesData.map(d => d.Happy);
    const labels = emotionTimeSeriesData.map(d => d.time);

    return {
      labels,
      datasets: [
        {
          data: happyData,
          color: (opacity = 1) => `rgba(0, 255, 224, ${opacity})`,
          strokeWidth: 2,
        },
      ],
      legend: ['Happy'],
    };
  };

  return (
    <ScreenLayout activeScreen="Home" navigation={navigation}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leafony Dashboard</Text>
        <Text style={styles.headerSubtitle}>感情分析データ監視</Text>
      </View>

      {/* 感情分析推移 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>感情分析推移</Text>
        <View style={styles.card}>
          <LineChart
            data={getChartData()}
            width={screenWidth - 32}
            height={300}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B1E27',
    padding: 16,
  },
  header: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: '#C7CCD6',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#4A5568',
    borderRadius: 8,
    padding: 24,
  },
  chart: {
    marginVertical: 8,
  },
});

export default HomeScreen;
