import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Device } from 'react-native-ble-plx';
import { useBleType } from '../utils/types';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  ble: useBleType; // useBleの型を指定
}

export const ConnectionModal: React.FC<ConnectionModalProps> = ({
  isOpen,
  onClose,
  ble,
}) => {
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
                    ble.connectedDevice
                      ? styles.badgeConnected
                      : styles.badgeDisconnected,
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {ble.connectedDevice ? '接続済み' : '未接続'}
                  </Text>
                </View>
              </View>
              {ble.connectedDevice && (
                <Text style={styles.connectedDeviceText}>
                  接続中: {ble.connectedDevice.name ?? ble.connectedDevice.id}
                </Text>
              )}
            </View>

            {/* Scan Button */}
            <TouchableOpacity
              onPress={ble.startScan}
              disabled={ble.scanning}
              style={[
                styles.scanButton,
                ble.scanning && styles.scanButtonDisabled,
              ]}
            >
              <Text style={styles.buttonText}>
                {ble.scanning ? 'スキャン中...' : 'デバイススキャン'}
              </Text>
            </TouchableOpacity>

            {/* Device List */}
            <View style={styles.deviceListContainer}>
              <Text style={styles.deviceListTitle}>検出されたデバイス</Text>
              <ScrollView style={styles.deviceList}>
                {ble.devices.map((device: Device) => {
                  const isConnected = ble.connectedDevice?.id === device.id;
                  return (
                    <View key={device.id} style={styles.deviceItem}>
                      <View style={styles.deviceInfo}>
                        <Text style={styles.deviceName}>
                          {device.name ?? '不明なデバイス'}
                        </Text>
                        <Text style={styles.deviceRssi}>
                          RSSI: {device.rssi ?? '-'}
                        </Text>
                      </View>
                      <View style={styles.deviceActions}>
                        <View
                          style={[
                            styles.badge,
                            isConnected
                              ? styles.badgeConnected
                              : styles.badgeDisconnected,
                          ]}
                        >
                          <Text style={styles.badgeText}>
                            {isConnected ? '接続中' : '利用可能'}
                          </Text>
                        </View>
                        {isConnected ? (
                          <TouchableOpacity
                            onPress={ble.disconnect}
                            style={styles.disconnectButton}
                          >
                            <Text style={styles.smallButtonText}>切断</Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            onPress={() => ble.connectToDevice(device)}
                            style={styles.connectButton}
                          >
                            <Text style={styles.smallButtonText}>接続</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })}
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
    backgroundColor: 'rgba(27,30,39,0.7)', // #1B1E27 半透明
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 8,
    backgroundColor: '#252A36', // セカンダリ背景
  },
  cardContent: { padding: 24 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
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
  statusLabel: { color: '#C7CCD6' },
  connectedDeviceText: { fontSize: 14, color: '#FFFFFF' },
  badge: { borderRadius: 16, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { color: '#FFFFFF', fontSize: 12 },
  badgeConnected: { backgroundColor: '#00FFE0' }, // ネオングリーン光
  badgeDisconnected: { backgroundColor: '#C7CCD6' }, // 淡いグレー
  scanButton: {
    width: '100%',
    height: 40,
    borderRadius: 8,
    backgroundColor: '#3A86FF', // 深海ブルー発光
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  scanButtonDisabled: { opacity: 0.7 },
  buttonText: { color: '#FFFFFF', fontWeight: '600' },
  deviceListContainer: { maxHeight: 192 },
  deviceListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  deviceList: { flexGrow: 0 },
  deviceItem: {
    backgroundColor: '#252A36', // カード内背景に合わせる
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deviceInfo: { flex: 1 },
  deviceName: { color: '#FFFFFF', fontWeight: '500', fontSize: 14 },
  deviceRssi: { color: '#C7CCD6', fontSize: 12 },
  deviceActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  smallButtonText: { color: '#FFFFFF', fontSize: 12 },
  disconnectButton: {
    height: 24,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    backgroundColor: '#FF4FA2', // ピンク系クラゲ光
  },
  connectButton: {
    height: 24,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    backgroundColor: '#3A86FF', // 深海ブルー発光
  },
});
