import React from "react";
import { Button, View, StyleSheet } from "react-native";

type Props = {
  scanning: boolean;
  onScanPress: () => void;
};

const BleScanButton: React.FC<Props> = ({ scanning, onScanPress }) => {
  return (
    <View style={styles.container}>
      <Button
        title={scanning ? "スキャン中..." : "スキャン開始"}
        onPress={onScanPress}
        disabled={scanning}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
});

export default BleScanButton;
