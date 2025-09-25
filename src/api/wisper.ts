import RNFS from 'react-native-fs';
import { TranscriptionResponse } from '../utils/types';
import { saveEmotion } from '../utils/sqlite/sqlite';

type Props = {
  filePath?: string;
};
export default async function transcribeAudioFile(props?: Props) {
  let filePath;
  if (props?.filePath) {
    filePath = props.filePath;
  } else {
    filePath = RNFS.DocumentDirectoryPath + '/sound.m4a';
  }
  const formData = new FormData();
  formData.append('file', {
    uri: 'file://' + filePath,
    type: 'video/m4a',
    name: 'sound3.m4a',
  });
  // PCのローカルIPを指定すること  192.168.11.25
  const res = await fetch('http://192.168.11.27:8000/transcribe', {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  const data: TranscriptionResponse = await res.json();
  console.log(data.text);
  console.log(data.analyze);
  // api使用時にDB保存
  await saveEmotion(data.analyze.score, data.analyze.sentiment);
  return data;
}
