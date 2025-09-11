import { useEffect, useState, useRef } from "react";
import { BleManager, Device } from "react-native-ble-plx";
import { Platform, PermissionsAndroid } from "react-native";
import * as base64 from "base64-js";
import BackgroundTimer from "react-native-background-timer";

const bleManager = new BleManager();


export function useBle() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [scanning, setScanning] = useState(false);

 const floatData = useRef({ val1: 5.0, val2: 0.1, val3: 1.0 });
  const sendIntervalId = useRef<number | null>(null);

  const CUSTOM_SERVICE_UUID = "442f1570-8a00-9a28-cbe1-e1d4212d53eb";
  const CUSTOM_CHAR_UUID = "442f1572-8a00-9a28-cbe1-e1d4212d53eb";

  // Android権限
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

  // -------------------------------
  // float3つをLeafonyに送信
  // -------------------------------
  const sendData = async (device: Device) => {
    if (!device) return;

    try {
      const buffer = new ArrayBuffer(12);
      const view = new DataView(buffer);
      view.setFloat32(0, floatData.current.val1, true);
      view.setFloat32(4, floatData.current.val2, true);
      view.setFloat32(8, floatData.current.val3, true);

      const uint8Array = new Uint8Array(buffer);
      const base64Data = base64.fromByteArray(uint8Array);

      try {
        await device.writeCharacteristicWithResponseForService(
          CUSTOM_SERVICE_UUID,
          CUSTOM_CHAR_UUID,
          base64Data
        );
        console.log("Sent float data (withResponse):", floatData.current);
      } catch (e) {
        console.warn("withResponse失敗、withoutResponseで送信:", e);
        await device.writeCharacteristicWithoutResponseForService(
          CUSTOM_SERVICE_UUID,
          CUSTOM_CHAR_UUID,
          base64Data
        );
        console.log("Sent float data (withoutResponse):", floatData.current);
      }

      // val2を循環更新
      floatData.current.val2 += 0.1;
      if (floatData.current.val2 > 1.0) floatData.current.val2 = 0.0;
    } catch (err) {
      console.error("送信エラー:", err);
    }
  };

  // 接続
  const connectToDevice = async (device: Device) => {
    try {
      const connected = await bleManager.connectToDevice(device.id);
      await connected.discoverAllServicesAndCharacteristics();
      setConnectedDevice(connected);
      console.log("接続成功:", connected.name);

      // 5秒ごとに送信開始
      if (sendIntervalId.current) BackgroundTimer.clearInterval(sendIntervalId.current);
      sendIntervalId.current = BackgroundTimer.setInterval(() => {
        sendData(connected);
      }, 5000);
    } catch (err) {
      console.error("接続失敗:", err);
    }
  };

  // 切断
  const disconnect = async () => {
    if (connectedDevice) {
      await bleManager.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);

      if (sendIntervalId.current) {
        BackgroundTimer.clearInterval(sendIntervalId.current);
        sendIntervalId.current = null;
      }
    }
  };

  // クリーンアップ
  useEffect(() => {
    return () => {
      bleManager.destroy();
      if (sendIntervalId.current) BackgroundTimer.clearInterval(sendIntervalId.current);
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
