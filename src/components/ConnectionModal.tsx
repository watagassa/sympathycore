import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

// モックデバイス（仮）
const bleDevices = [
  { id: '1', name: 'Device A', rssi: -45, status: 'disconnected' },
  { id: '2', name: 'Device B', rssi: -60, status: 'disconnected' },
  { id: '3', name: 'Device C', rssi: -70, status: 'connected' },
];

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectionModal: React.FC<ConnectionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<string | null>(null);
  const [devices, setDevices] = useState(bleDevices);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 3000);
  };

  const handleConnect = (deviceId: string) => {
    setConnectedDevice(deviceId);
    setDevices(prev =>
      prev.map(d =>
        d.id === deviceId
          ? { ...d, status: 'connected' }
          : { ...d, status: 'disconnected' },
      ),
    );
  };

  const handleDisconnect = () => {
    if (!connectedDevice) return;
    setDevices(prev =>
      prev.map(d =>
        d.id === connectedDevice ? { ...d, status: 'disconnected' } : d,
      ),
    );
    setConnectedDevice(null);
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={isOpen}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.card}>
          <View style={styles.cardContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>BLE接続</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Svg
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="#B0B0B0"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <Path d="M6 18L18 6M6 6l12 12" />
                </Svg>
              </TouchableOpacity>
            </View>

            {/* Connection Status */}
            <View style={styles.statusSection}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>接続状態</Text>
                <View
                  style={[
                    styles.badge,
                    connectedDevice
                      ? styles.badgeConnected
                      : styles.badgeDisconnected,
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {connectedDevice ? '接続済み' : '未接続'}
                  </Text>
                </View>
              </View>
              {connectedDevice && (
                <Text style={styles.connectedDeviceText}>
                  接続中: {devices.find(d => d.id === connectedDevice)?.name}
                </Text>
              )}
            </View>

            {/* Scan Button */}
            <TouchableOpacity
              onPress={handleScan}
              disabled={isScanning}
              style={[
                styles.scanButton,
                isScanning && styles.scanButtonDisabled,
              ]}
            >
              {isScanning ? (
                <View style={styles.scanButtonContent}>
                  <ActivityIndicator color="#FFFFFF" />
                  <Text style={styles.buttonText}>スキャン中...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>デバイススキャン</Text>
              )}
            </TouchableOpacity>

            {/* Device List */}
            <View style={styles.deviceListContainer}>
              <Text style={styles.deviceListTitle}>検出されたデバイス</Text>
              <ScrollView style={styles.deviceList}>
                {devices.map(device => (
                  <View key={device.id} style={styles.deviceItem}>
                    <View style={styles.deviceInfo}>
                      <Text style={styles.deviceName}>{device.name}</Text>
                      <Text style={styles.deviceRssi}>
                        RSSI: {device.rssi} dBm
                      </Text>
                    </View>
                    <View style={styles.deviceActions}>
                      <View
                        style={[
                          styles.badge,
                          device.status === 'connected'
                            ? styles.badgeConnected
                            : styles.badgeDisconnected,
                        ]}
                      >
                        <Text style={styles.badgeText}>
                          {device.status === 'connected'
                            ? '接続中'
                            : '利用可能'}
                        </Text>
                      </View>
                      {device.status === 'connected' ? (
                        <TouchableOpacity
                          onPress={handleDisconnect}
                          style={styles.disconnectButton}
                        >
                          <Text style={styles.smallButtonText}>切断</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          onPress={() => handleConnect(device.id)}
                          style={styles.connectButton}
                        >
                          <Text style={styles.smallButtonText}>接続</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 8,
    backgroundColor: '#141F79',
  },
  cardContent: { padding: 24 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusSection: { marginBottom: 24 },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: { color: '#B0B0B0' },
  connectedDeviceText: { fontSize: 14, color: 'white' },
  badge: { borderRadius: 16, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { color: 'white', fontSize: 12 },
  badgeConnected: { backgroundColor: '#4A90E2' },
  badgeDisconnected: { backgroundColor: '#B0B0B0' },
  scanButton: {
    width: '100%',
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFB347',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  scanButtonDisabled: { opacity: 0.7 },
  scanButtonContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttonText: { color: 'white', fontWeight: '600' },
  deviceListContainer: { maxHeight: 192 },
  deviceListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  deviceList: { flexGrow: 0 },
  deviceItem: {
    backgroundColor: '#3A3F4A',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deviceInfo: { flex: 1 },
  deviceName: { color: 'white', fontWeight: '500', fontSize: 14 },
  deviceRssi: { color: '#B0B0B0', fontSize: 12 },
  deviceActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  smallButtonText: { color: 'white', fontSize: 12 },
  disconnectButton: {
    height: 24,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    backgroundColor: '#FF6961',
  },
  connectButton: {
    height: 24,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    backgroundColor: '#4A90E2',
  },
});
