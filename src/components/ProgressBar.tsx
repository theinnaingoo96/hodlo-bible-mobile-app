import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { useSelector } from "react-redux";
import { AppColors } from "../constants/Color";

type ProgressBarProps = {
  progress: number;   // 0 → 1 (e.g., 0.4 = 40%)
  label?: string;     // optional text above bar
  color?: string;     // custom color (default red)
  fullsize?: boolean;
};

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label, color = AppColors.primaryDark, fullsize = false }) => {
  const device = useSelector((state: any) => state.device);

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: device.theme ? '#000' : '#fff' }]}>{label}</Text>}
      {
        fullsize ? (
          <View style={styles.fullsizeBarBackground}>
            <View
              style={[
                styles.barFill,
                { width: `${progress * 100}%`, backgroundColor: color },
              ]}
            />
          </View>
        ) : (
          <>
            <View style={styles.barBackground}>
              <View
                style={[
                  styles.barFill,
                  { width: `${progress * 100}%`, backgroundColor: color },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: device.theme ? '#000' : '#fff' }]}>{Math.round(progress * 100)}% completed</Text>
          </>
        )
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  fullsizeBarBackground: {
    height: 5,
    width: Dimensions.get("window").width,
    borderRadius: 6,
    backgroundColor: "#eee",
    overflow: "hidden",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  barBackground: {
    height: 10,
    borderRadius: 6,
    backgroundColor: "#eee",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    marginTop: 6,
    color: "#444",
  },
});

export default ProgressBar;
