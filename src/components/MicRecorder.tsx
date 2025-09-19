import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import RNFS from 'react-native-fs';
import { requestMicPermission } from '../utils/permission';
import transcribeAudioFile from '../api/wisper';
import Sound from 'react-native-nitro-sound';
import { useBleType } from '../utils/types';

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
  ble: useBleType;
  setShowConnectionModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MicRecorder: React.FC<MicRecorderProps> = ({
  isAnalyzing,
  ble,
  setShowConnectionModal,
}: MicRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const audioPath = `${RNFS.DocumentDirectoryPath}/sound.wav`;

  useEffect(() => {
    let countInterval: number | null = null;

    if (isRecording) {
      let elapsed = 0;

      countInterval = setInterval(async () => {
        elapsed += 1;
        setRecordingTime(elapsed);

        if (elapsed % 10 === 0) {
          try {
            // 一時ファイルにコピーして安全に送信
            const tempPath = `${RNFS.DocumentDirectoryPath}/temp_sound.wav`;
            await RNFS.copyFile(audioPath, tempPath);

            const transcribeData = await transcribeAudioFile({
              filePath: tempPath,
            });
            console.log('Partial Transcription:', transcribeData.text);

            ble.setFloatData({
              val1: transcribeData.analyze.ths[0],
              val2: transcribeData.analyze.ths[1],
              val3: transcribeData.analyze.ths[2],
            });

            // 必要に応じて UI 更新
          } catch (e) {
            console.error('Partial transcription error:', e);
          }
        }
      }, 1000);
    }

    return () => {
      if (countInterval) clearInterval(countInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      await Sound.startRecorder(audioPath);
      console.log('録音開始: ', audioPath);
      setIsRecording(true);
    } catch (e) {
      console.error(e);
    }
  };

  const stopRecording = async () => {
    try {
      const result = await Sound.stopRecorder();
      setIsRecording(false);
      console.log('録音終了: ', result);
      setRecordingTime(0);

      // 最後の解析
      const transcribeData = await transcribeAudioFile({ filePath: audioPath });
      console.log('Final Transcription:', transcribeData.text);
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
        onPress={() => {
          if (!ble.connectedDevice) {
            setShowConnectionModal(true);
            return;
          }
          handleRecord();
        }}
        disabled={isAnalyzing}
        style={[
          styles.recordButton,
          isRecording ? styles.recordButtonActive : styles.recordButtonInactive,
          isAnalyzing && styles.recordButtonDisabled,
        ]}
      >
        <Text style={styles.buttonText}>
          {ble.connectedDevice
            ? isAnalyzing
              ? '分析中...'
              : isRecording
              ? '録音停止'
              : '録音開始'
            : '未接続'}
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
