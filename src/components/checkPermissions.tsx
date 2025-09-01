import { PermissionsAndroid } from 'react-native';

export async function checkPermissions() {
  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    {
      title: 'マイク権限',
      message: '音声を録音するためにマイクを使用します',
      buttonPositive: '許可',
    },
  );
  console.log('マイク権限の結果:', result);
}
