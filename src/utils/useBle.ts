import { useEffect, useState } from "react";
import { BleManager, Device } from "react-native-ble-plx";
import { Platform, PermissionsAndroid } from "react-native";

const bleManager = new BleManager();

export function useBle() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [scanning, setScanning] = useState(false);

  // Android用権限
  const requestPermissions = async () => {
    if (Platform.OS === "android" && Platform.Version >= 23) {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
    }
  };

  // デバイス追加（重複回避）
  const addDevice = (device: Device) => {
    setDevices((prev) => {
      if (prev.find((d) => d.id === device.id)) return prev;
      return [...prev, device];
    });
  };

  // スキャン開始
  const startScan = async () => {
    await requestPermissions();
    setDevices([]);
    setScanning(true);

    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error("スキャンエラー:", error);
        setScanning(false);
        return;
      }
      if (device) addDevice(device);
    });

    // 10秒後にスキャン停止
    setTimeout(() => {
      bleManager.stopDeviceScan();
      setScanning(false);
    }, 10000);
  };

  // 接続
  const connectToDevice = async (device: Device) => {
    try {
      const connected = await bleManager.connectToDevice(device.id);
      await connected.discoverAllServicesAndCharacteristics();
      setConnectedDevice(connected);
      console.log("接続成功:", connected.name);
    } catch (err) {
      console.error("接続失敗:", err);
    }
  };

  // 切断
  const disconnect = async () => {
    if (connectedDevice) {
      await bleManager.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
    }
  };

  // クリーンアップ
  useEffect(() => {
    return () => {
      bleManager.destroy();
    };
  }, []);

  return {
    devices,
    scanning,
    connectedDevice,
    startScan,
    connectToDevice,
    disconnect,
  };
}
