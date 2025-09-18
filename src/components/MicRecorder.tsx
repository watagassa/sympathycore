import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import { requestMicPermission } from '../utils/permission';
import transcribeAudioFile from '../api/wisper';

const audioRecorderPlayer = AudioRecorderPlayer;

interface MicRecorderProps {
  isAnalyzing: boolean;
  setIsAnalyzing: React.Dispatch<React.SetStateAction<boolean>>;
  setLastAnalysis: React.Dispatch<
    React.SetStateAction<{
      emotion: string;
      confidence: number;
      timestamp: string;
    }>
  >;
}

export const MicRecorder: React.FC<MicRecorderProps> = ({ isAnalyzing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const audioPath = `${RNFS.DocumentDirectoryPath}/sound.mp4`;

  // 録音時間のカウント
  useEffect(() => {
    let interval: number | null = null;
    if (isRecording) {
      interval = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    const hasPermission = await requestMicPermission();
    if (!hasPermission) {
      console.log('マイク権限がありません');
      return;
    }

    try {
      const uri = await audioRecorderPlayer.startRecorder(audioPath);
      console.log('録音開始: ', uri);
      setIsRecording(true);
    } catch (e) {
      console.error(e);
    }
  };

  const stopRecording = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      console.log('録音終了: ', result);
      const soundText = await transcribeAudioFile();
      console.log('Transcription: ', soundText);
      setIsRecording(false);
      setRecordingTime(0);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRecord = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  return (
    <View style={styles.recordingControl}>
      <TouchableOpacity
        onPress={handleRecord}
        disabled={isAnalyzing}
        style={[
          styles.recordButton,
          isRecording ? styles.recordButtonActive : styles.recordButtonInactive,
          isAnalyzing && styles.recordButtonDisabled,
        ]}
      >
        <Text style={styles.buttonText}>
          {isAnalyzing ? '分析中...' : isRecording ? '録音停止' : '録音開始'}
        </Text>
      </TouchableOpacity>

      {isRecording && (
        <View style={styles.recordingTimeContainer}>
          <Text style={styles.recordingTimeText}>
            {formatTime(recordingTime)}
          </Text>
          <Text style={styles.recordingTimeLabel}>録音時間</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
});
