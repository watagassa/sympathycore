/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
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
  setIsAnalyzing,
  ble,
  setShowConnectionModal,
}: MicRecorderProps) => {
  const isRecordingRef = useRef(false);
  const pathIndexRef = useRef(0);
  const audioPathRef = useRef(
    `${RNFS.DocumentDirectoryPath}/sound${pathIndexRef.current}.mp4`,
  );

  const [isRecording, setIsRecording] = useState(false); // UI 表示用
  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    let countInterval: number | null = null;

    if (isRecordingRef.current) {
      let elapsed = 0;

      const handleTick = async () => {
        elapsed += 1;
        setRecordingTime(elapsed);

        if (elapsed % 10 === 0) {
          try {
            // 直前の録音をストップしてファイルを確定
            const stoppedPath = audioPathRef.current;
            console.log('isRecordingRef.current', isRecordingRef.current);
            if (isRecordingRef.current) {
              await Sound.stopRecorder();
            }
            isRecordingRef.current = false;
            console.log('Partial recording stopped:', stoppedPath);

            // そのファイルを解析
            setIsAnalyzing(true);
            const transcribeData = await transcribeAudioFile({
              filePath: stoppedPath,
            });
            setIsAnalyzing(false);
            console.log('bleの値・・・・：', transcribeData.analyze.ths);
            ble.setFloatData({
              val1: transcribeData.analyze.ths[0],
              val2: transcribeData.analyze.ths[1],
              val3: transcribeData.analyze.ths[2],
            });

            // 次の録音用のファイルパスを用意
            pathIndexRef.current += 1;
            const nextPath = `${RNFS.DocumentDirectoryPath}/sound${pathIndexRef.current}.mp4`;
            audioPathRef.current = nextPath;
            if (isRecording) {
              // 録音再開
              await Sound.startRecorder(nextPath);
              isRecordingRef.current = true;
            }
          } catch (e) {
            console.error('Error in partial process:', e);
          }
        }
      };

      countInterval = setInterval(() => {
        handleTick();
      }, 1000);
    }

    return () => {
      if (countInterval) clearInterval(countInterval);
    };
  }, [isRecording]); // UI のトグルで start/stop

  useEffect(() => {
    console.log('ble.floatData changed:', ble.floatData);
  }, [ble.floatData]);

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
      await Sound.startRecorder(audioPathRef.current);
      console.log('録音開始: ', audioPathRef.current);
      isRecordingRef.current = true;
      setIsRecording(true);
    } catch (e) {
      console.error(e);
    }
  };

  const stopRecording = async () => {
    try {
      if (isRecordingRef.current) {
        const result = await Sound.stopRecorder();
        console.log('録音終了: ', result);
      }
      isRecordingRef.current = false;
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

  // const buttonUI = () => {
  //   // if (!ble.connectedDevice) {
  //   //   return '未接続';
  //   // } else
  //   if (isAnalyzing) {
  //     return '分析中...';
  //   } else if (isRecording) {
  //     return '録音中...';
  //   } else {
  //     return '録音開始';
  //   }
  // };
  const buttonUI = () => {
    if (!ble.connectedDevice) {
      return '未接続';
    } else if (isRecording) {
      if (isAnalyzing) {
        return '分析中...';
      }
      return '録音中...';
    }
    return '録音開始';
  };

  return (
    <View style={styles.recordingControl}>
      <TouchableOpacity
        onPress={() => {
          if (!ble.connectedDevice) {
            setShowConnectionModal(true);
            return;
          }
          console.log('Record button pressed');
          console.log('isAnalyzing:', isAnalyzing);
          console.log('isRecording:', isRecording);
          console.log('ble.connectedDevice:', ble.connectedDevice);
          console.log('isRecordingRef.current:', isRecordingRef.current);
          handleRecord();
        }}
        style={[
          styles.recordButton,
          isRecording ? styles.recordButtonActive : styles.recordButtonInactive,
          // isAnalyzing && styles.recordButtonDisabled,
        ]}
      >
        <Text style={styles.buttonText}>{buttonUI()}</Text>
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
