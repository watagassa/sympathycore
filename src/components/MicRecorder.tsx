/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import RNFS from 'react-native-fs';
import { requestMicPermission } from '../utils/permission';
import transcribeAudioFile from '../api/wisper';
import Sound from 'react-native-nitro-sound';
import { Analysis, useBleType } from '../utils/types';
import characterReactions from '../api/character_reactions';
import { getLatestEmotion } from '../utils/sqlite/sqlite';

interface MicRecorderProps {
  isAnalyzing: boolean;
  setIsAnalyzing: React.Dispatch<React.SetStateAction<boolean>>;
  setLastAnalysis: React.Dispatch<Analysis>;
  ble: useBleType;
  setShowConnectionModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MicRecorder: React.FC<MicRecorderProps> = ({
  isAnalyzing,
  setIsAnalyzing,
  setLastAnalysis,
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
  const [mode, setMode] = useState('transcribe'); // 'transcribe' or 'character_reactions'
  const [backgroundSetting, setBackgroundSetting] = useState(''); // テキストボックスの内容
  useEffect(() => {
    if (!isRecordingRef.current) return;

    let elapsed = 0; // 10秒判定用
    let timeCount = 0; // 録音時間表示用
    let isProcessing = false; // 解析中の重複防止

    const tick = async () => {
      if (!isRecordingRef.current) return;
      elapsed += 1;
      timeCount += 1;
      setRecordingTime(timeCount);

      if (elapsed >= 10 && !isProcessing) {
        elapsed = 0;
        isProcessing = true;

        try {
          const stoppedPath = audioPathRef.current;
          await Sound.stopRecorder();
          isRecordingRef.current = false;

          setIsAnalyzing(true);

          let transcribeData;
          const exists = await RNFS.exists(stoppedPath);
          if (exists) {
            if (mode === 'transcribe') {
              transcribeData = await transcribeAudioFile({
                filePath: stoppedPath,
              });
            } else {
              transcribeData = await characterReactions({
                filePath: stoppedPath,
                backgroundSetting,
              });
            }
          } else {
            transcribeData = {
              text: '音声が短すぎて認識できませんでした。',
              analyze: { score: 0, ths: [0, 0, 0] },
            };
          }

          setIsAnalyzing(false);

          if (
            transcribeData.text !== '音声が短すぎて認識できませんでした。' &&
            transcribeData.analyze.score !== 0
          ) {
            ble.setFloatData({
              val1: transcribeData.analyze.ths[0],
              val2: transcribeData.analyze.ths[1],
              val3: transcribeData.analyze.ths[2],
            });
          }

          pathIndexRef.current += 1;
          const nextPath = `${RNFS.DocumentDirectoryPath}/sound${pathIndexRef.current}.mp4`;
          audioPathRef.current = nextPath;

          if (isRecording) {
            await Sound.startRecorder(nextPath);
            isRecordingRef.current = true;
          }

          const data = await getLatestEmotion();
          if (data) {
            setLastAnalysis({
              sentiment: data.sentiment,
              score: data.score,
              timestamp: data.timestamp,
            });
          }
        } catch (e) {
          console.error('Error in partial process:', e);
          setIsAnalyzing(false);
        } finally {
          isProcessing = false;
        }
      }

      setTimeout(tick, 1000);
    };

    tick();

    // クリーンアップ
    return () => {
      isRecordingRef.current = false;
    };
  }, [isRecording]);

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
    const setting = async () => {
      const data = await getLatestEmotion();
      if (data) {
        setLastAnalysis({
          sentiment: data.sentiment,
          score: data.score,
          timestamp: data.timestamp,
        });
      }
    };
    setting();
  };

  const handleRecord = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

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
  useEffect(() => {
    if (!ble.connectedDevice) {
      ble.setFloatData({ val1: 0, val2: 0, val3: 0 });
      ble.disconnect();
      stopRecording();
    }
  }, [ble.connectedDevice]);
  const handleModeSwitch = () => {
    setMode(prevMode =>
      prevMode === 'transcribe' ? 'character_reactions' : 'transcribe',
    );
  };

  return (
    <View style={styles.recordingControl}>
      <TouchableOpacity
        onPress={() => {
          // if (!ble.connectedDevice) {
          //   setShowConnectionModal(true);
          //   return;
          // }
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
      <TouchableOpacity
        disabled={isRecording}
        onPress={handleModeSwitch}
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          marginTop: 16,
          backgroundColor: isRecording
            ? '#95A5A6' // 押せない時のグレー
            : mode === 'transcribe'
            ? '#8E44AD'
            : '#27AE60',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 8,
          opacity: isRecording ? 0.6 : 1, // 見た目で「押せない」感を出す
        }}
      >
        <Text style={styles.buttonText}>
          モード切替: {mode === 'transcribe' ? '文字起こし' : 'キャラ反応'}
        </Text>
      </TouchableOpacity>
      {/* テキストボックス */}
      <TextInput
        style={styles.textBox}
        placeholder={`ここにキャラクターの背景設定を入力してください\n「モード切替:キャラ反応」のときに送信され、感情応対に影響します`}
        maxLength={1000} // 最大文字数を1000に制限
        value={backgroundSetting}
        onChangeText={setBackgroundSetting}
        multiline={true}
        textAlignVertical="top"
        editable={!isRecording} // 録音中は入力も禁止にしたい場合
      />
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
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    margin: 8,
  },
  recordingTimeContainer: { alignItems: 'center', marginTop: 12 },
  recordingTimeText: { fontSize: 24, color: 'white', fontFamily: 'monospace' },
  recordingTimeLabel: { color: '#B0B0B0', fontSize: 12 },
  textBox: {
    marginTop: 20,
    width: '85%',
    height: 300,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
});
