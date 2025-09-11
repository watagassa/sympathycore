declare module 'react-native-background-timer' {
  export function setInterval(callback: () => void, interval: number): number;
  export function clearInterval(id: number): void;
  export function setTimeout(callback: () => void, timeout: number): number;
  export function clearTimeout(id: number): void;
}
