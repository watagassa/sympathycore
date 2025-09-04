import RNFS from 'react-native-fs';
import { TranscriptionResponse } from '../utils/types';

export default async function transcribeAudioFile() {
  const filePath = RNFS.DocumentDirectoryPath + '/sound.mp4';

  const formData = new FormData();
  formData.append('file', {
    uri: 'file://' + filePath,
    type: 'video/mp4',
    name: 'sound3.mp4',
  });
  // PCのローカルIPを指定すること  192.168.11.25
  const res = await fetch('http://10.14.5.163:8000/transcribe', {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const data: TranscriptionResponse = await res.json();
  console.log(data.text);
  console.log(data.analyze);
  return data.text;
}
