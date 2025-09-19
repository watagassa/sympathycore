import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/types';
import { ScreenLayout } from '../components/ScreenLayout';
import { PieChart } from 'react-native-chart-kit';
import { getEmotions } from '../utils/sqlite/sqlite';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const screenWidth = Dimensions.get('window').width;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [pieData, setPieData] = useState<
    {
      name: string;
      population: number;
      color: string;
      legendFontColor: string;
      legendFontSize: number;
    }[]
  >([]);

  const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']; // 感情種類ごとの色

  // DBからデータを取得して PieChart 用に整形
  const loadPieData = async () => {
    const emotions = await getEmotions();

    // 感情種類ごとの件数を集計
    const countMap: Record<string, number> = {};
    emotions.forEach(e => {
      countMap[e.emotion_type] = (countMap[e.emotion_type] || 0) + 1;
    });

    const data = Object.entries(countMap).map(([emotion, count], idx) => ({
      name: emotion,
      population: count,
      color: colors[idx % colors.length],
      legendFontColor: 'white',
      legendFontSize: 14,
    }));

    setPieData(data);
  };

  useEffect(() => {
    loadPieData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ScreenLayout activeScreen="Home" navigation={navigation}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leafony Dashboard</Text>
        <Text style={styles.headerSubtitle}>感情分析データ統計</Text>
      </View>

      {/* 感情統計（円グラフ） */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>感情統計</Text>
        <View style={styles.card}>
          {pieData.length > 0 && (
            <PieChart
              data={pieData}
              width={screenWidth - 32}
              height={300}
              chartConfig={{
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          )}
          {pieData.length === 0 && (
            <Text style={styles.noDataText}>データがありません</Text>
          )}
        </View>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
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
    alignItems: 'center',
  },
  noDataText: {
    color: 'white',
  },
});

export default HomeScreen;
