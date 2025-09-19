import { Device } from 'react-native-ble-plx';

// 各画面に渡すパラメータの型を定義
export type RootStackParamList = {
  Home: undefined;
  Mic: undefined;
  Detail: undefined;
  Ble: undefined;
  Debug: undefined;
};

export type analyzeType = {
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number; // 0.0 - 1.0
  ths: [number, number, number]; // [time, hue, saturation]
};

export type TranscriptionResponse = {
  text: string;
  analyze: analyzeType;
};

export type useBleType = {
  devices: Device[];
  scanning: boolean;
  connectedDevice: Device | null;
  startScan: () => Promise<void>;
  connectToDevice: (device: Device) => Promise<void>;
  disconnect: () => Promise<void>;
  floatData: {
    val1: number;
    val2: number;
    val3: number;
  };
  setFloatData: React.Dispatch<
    React.SetStateAction<{
      val1: number;
      val2: number;
      val3: number;
    }>
  >;
};
