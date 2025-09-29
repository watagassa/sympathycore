import RNFS from 'react-native-fs';
import { TranscriptionResponse } from '../utils/types';
import { saveEmotion } from '../utils/sqlite/sqlite';
import { IP_ADDRESS } from './address';

type Props = {
  filePath?: string;
  backgroundSetting?: string;
};
export default async function characterReactions(props?: Props) {
  let filePath;
  if (props?.filePath) {
    filePath = props.filePath;
  } else {
    filePath = RNFS.DocumentDirectoryPath + '/sound.m4a';
  }
  const formData = new FormData();
  formData.append('backgroundSetting', props?.backgroundSetting || 'default');
  formData.append('file', {
    uri: 'file://' + filePath,
    type: 'audio/m4a',
    name: 'sound3.m4a',
  });
  // PCのローカルIPを指定すること  192.168.11.25
  const res = await fetch(`http://${IP_ADDRESS}:8000/character_reactions`, {
    method: 'POST',
    body: formData,
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
