import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";

import { useBle } from "../utils/useBle";
import BleScanButton from "../components/BleScanButton";
import BleDeviceList from "../components/BleDeviceList";

const BleScreen: React.FC = () => {
  const {
    devices,
    scanning,
    connectedDevice,
    startScan,
    connectToDevice,
    disconnect,
    // floatData,      // ここを返す
    // setFloatData,   // これで他のファイルから更新可能
  } = useBle();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leafony BLE Scanner</Text>

      <BleScanButton scanning={scanning} onScanPress={startScan} />

      <Text style={styles.status}>
        接続状況: {connectedDevice ? `接続中 (${connectedDevice.name})` : "未接続"}
      </Text>

      <BleDeviceList devices={devices} onDevicePress={connectToDevice} />

      {connectedDevice && (
        <Button title="切断" onPress={disconnect} color="red" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
  status: { marginVertical: 8, fontSize: 16, textAlign: "center" },
});

export default BleScreen;
