import React from 'react';
import { Button, Alert } from 'react-native';
import RNFS from 'react-native-fs';
import { pick, types } from '@react-native-documents/picker';

type Props = {
  buttonTitle?: string; // ボタンの表示名
  onSaved?: (path: string) => void; // 保存完了後のコールバック
};

export const AudioFilePicker: React.FC<Props> = ({
  buttonTitle = '音声ファイルを選択して保存',
  onSaved,
}) => {
  const pickAndSaveFile = async () => {
    try {
      // 1. ユーザーに音声ファイルを選ばせる
      const result = await pick({
        type: [types.audio],
      });

      // キャンセル時は空配列
      if (result.length === 0) {
        console.log('キャンセルされました');
        return;
      }

      const fileUri = result[0].uri;
      const fileName = result[0].name ?? 'selected_audio.mp3';

      // 2. 保存先パスを生成
      const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      // 3. コピーして保存
      await RNFS.copyFile(fileUri, destPath);

      Alert.alert('保存完了', `ファイルを保存しました:\n${destPath}`);

      // 4. 親コンポーネントに通知
      if (onSaved) onSaved(destPath);
    } catch (err) {
      console.error(err);
      Alert.alert('エラー', 'ファイルの保存に失敗しました');
    }
  };

  return <Button title={buttonTitle} onPress={pickAndSaveFile} />;
};
