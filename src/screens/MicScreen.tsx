import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/types';
import { ScreenLayout } from '../components/ScreenLayout';
import { initialAnalysis } from '../test/mock-emotions';
import { ConnectionModal } from '../components/ConnectionModal';
import { Wifi } from 'lucide-react-native';
import { MicRecorder } from '../components/MicRecorder';
import { useBle } from '../utils/useBle';
import { getLatestEmotion } from '../utils/sqlite/sqlite';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export const MicScreen: React.FC<Props> = ({ navigation }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState(initialAnalysis);
  const ble = useBle();
  useEffect(() => {
    const setting = async () => {
      const data = await getLatestEmotion();
      console.log('data??', data);
      if (data) {
        setLastAnalysis({
          sentiment: data.sentiment,
          score: data.score,
          timestamp: data.timestamp,
        });
      }
    };
    setting();
  }, []);

  return (
    <ScreenLayout activeScreen="Mic" navigation={navigation}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>音声録音・分析</Text>
          <Text style={styles.headerSubtitle}>
            感情分析とLeafonyへのデータ送信
          </Text>
        </View>
        <TouchableOpacity
          style={styles.connectButton}
          onPress={() => setShowConnectionModal(true)}
        >
          <Wifi color="white" size={32} />
        </TouchableOpacity>
      </View>
      {/* 分析結果の挿入はあとでこのコンポーネントに追記する */}
      {/* 何秒かに一度音声ファイルを送るように変更が必要 */}
      <MicRecorder
        isAnalyzing={isAnalyzing}
        setIsAnalyzing={setIsAnalyzing}
        setLastAnalysis={setLastAnalysis}
        ble={ble}
        setShowConnectionModal={setShowConnectionModal}
      />

      {/* 最新分析結果 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>最新の分析結果</Text>
        <Text style={styles.emotionText}>{lastAnalysis.sentiment}</Text>
        <Text style={styles.emotionLabel}>検出された感情</Text>
        <Text>{}</Text>
        <View style={styles.confidenceRow}>
          <Text style={styles.statusLabel}>信頼度</Text>
          <Text style={styles.confidenceText}>{lastAnalysis.score * 100}%</Text>
        </View>
      </View>

      {/* Connection Modal */}
      <ConnectionModal
        isOpen={showConnectionModal}
        onClose={() => setShowConnectionModal(false)}
        ble={ble}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  headerTextContainer: { flex: 1, alignItems: 'center' },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: { color: '#B0B0B0' },
  connectButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingControl: { alignItems: 'center', marginVertical: 24 },
  recordButton: {
    width: 160,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonActive: { backgroundColor: '#FF6961' },
  recordButtonInactive: { backgroundColor: '#4A90E2' },
  recordButtonDisabled: { opacity: 0.5 },
  buttonText: { color: 'white', fontWeight: 'bold' },
  recordingTimeContainer: { alignItems: 'center', marginTop: 12 },
  recordingTimeText: { fontSize: 24, color: 'white', fontFamily: 'monospace' },
  recordingTimeLabel: { color: '#B0B0B0', fontSize: 12 },
  card: {
    backgroundColor: '#3A3F4A',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  emotionText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  emotionLabel: { color: '#B0B0B0', textAlign: 'center', marginTop: 4 },
  confidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statusLabel: { color: '#B0B0B0' },
  confidenceText: { color: 'white' },
});
