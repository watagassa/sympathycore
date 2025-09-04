import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs'; // ← 追加

import { checkPermissions } from './checkPermissions';
import { requestMicPermission } from '../utils/permission';
import transcribeAudioFile from '../api/wisper';

const audioRecorderPlayer = AudioRecorderPlayer;

const Recorder = () => {
  const [recording, setRecording] = useState(false);
  const [filePath, setFilePath] = useState('');

  // 保存先のパスを DocumentDirectoryPath に指定
  const audioPath = `${RNFS.DocumentDirectoryPath}/sound.mp4`;

  // 録音開始
  const startRecording = async () => {
    const hasPermission = await requestMicPermission();
    if (!hasPermission) {
      console.log('マイク権限がありません');
      return;
    }

    try {
      const uri = await audioRecorderPlayer.startRecorder(audioPath);
      console.log('録音開始: ', uri);
      setFilePath(uri);
      setRecording(true);
    } catch (e) {
      console.error(e);
    }
  };

  // 録音停止
  const stopRecording = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      console.log('録音終了: ', result);
      setRecording(false);
    } catch (e) {
      console.error(e);
    }
  };

  // 再生
  const playRecording = async () => {
    if (!filePath) {
      console.log('録音ファイルがありません');
      return;
    }
    await audioRecorderPlayer.startPlayer(filePath);
    console.log('再生開始: ', filePath);
    const soundText = await transcribeAudioFile();
    console.log('Transcription: ', soundText);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎤 録音デモ</Text>
      <Button
        title={recording ? '録音停止' : '録音開始'}
        onPress={recording ? stopRecording : startRecording}
      />
      <Button title={'マイク権限確認'} onPress={checkPermissions} />

      <View style={styles.space} />
      <Button title="録音を再生" onPress={playRecording} />
      <Text style={styles.path}>保存先: {filePath || 'なし'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  space: {
    height: 20,
  },
  path: {
    marginTop: 20,
    fontSize: 12,
    color: '#555',
  },
});

export default Recorder;
