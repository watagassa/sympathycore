import React from "react";
import { FlatList, TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Device } from "react-native-ble-plx";

type Props = {
  devices: Device[];
  onDevicePress: (device: Device) => void;
};

const BleDeviceList: React.FC<Props> = ({ devices, onDevicePress }) => {
  return (
    <FlatList
      data={devices}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.deviceItem}
          onPress={() => onDevicePress(item)}
        >
          <Text style={styles.deviceName}>
            {item.name ? item.name : "不明なデバイス"}
          </Text>
          <Text style={styles.deviceId}>{item.id}</Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>デバイスが見つかりません</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  deviceItem: {
    padding: 12,
    marginVertical: 4,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#ccc",
  },
  deviceName: { fontSize: 16, fontWeight: "bold" },
  deviceId: { fontSize: 12, color: "#666" },
  emptyContainer: { padding: 20, alignItems: "center" },
  emptyText: { color: "#888" },
});

export default BleDeviceList;
