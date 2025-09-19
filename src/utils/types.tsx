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
  tsv: [number, number, number]; // [time, hue, saturation]
};

export type TranscriptionResponse = {
  text: string;
  analyze: analyzeType;
};
