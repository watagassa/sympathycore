// 各画面に渡すパラメータの型を定義
export type RootStackParamList = {
  Home: undefined;
  Detail: undefined;
  Ble: undefined;
};

export type analyzeType = {
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number; // 0.0 - 1.0
  hsv: [number, number, number]; // [hue, saturation, value]
};

export type TranscriptionResponse = {
  text: string;
  analyze: analyzeType;
};
