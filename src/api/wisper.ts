import RNFS from 'react-native-fs';

export default async function transcribeAudioFile() {
  const filePath = RNFS.DocumentDirectoryPath + '/sound.mp4';

  const formData = new FormData();
  formData.append('file', {
    uri: 'file://' + filePath,
    type: 'video/mp4',
    name: 'sound3.mp4',
  });
  // PCのローカルIPを指定すること
  const res = await fetch('http://192.168.11.25:8000/transcribe', {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const data = await res.json();
  console.log(data.text);
  return data.text;
}
