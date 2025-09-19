import { PermissionsAndroid, Platform } from 'react-native';

// Androidのパーミッションリクエスト
export const requestMicPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Audio Recording Permission',
          message: 'This app needs access to your microphone to record audio.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Recording permission granted');
      } else {
        console.log('Recording permission denied');
        return;
      }
    } catch (err) {
      console.warn(err);
      return;
    }
  }
  return true; // iOSは info.plist で設定
};
