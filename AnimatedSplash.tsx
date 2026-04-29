import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  StatusBar,
  Easing,
  Dimensions,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import { AppColors } from "./src/constants/Color";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AnimatedSplashScreenProps {
  iconSource?: any;
  appName?: string;
  holdTime?: number;
  duration?: number;
  onFinish?: () => void;
  showVersion?: boolean;
  showCopyright?: boolean;
}

export default function AnimatedSplashScreen({
  iconSource = require('./src/assets/images/icon.png'),
  appName = "GATHENGPU DLO",
  holdTime = 1500, // 🕒 hold icon for 1.5s
  duration = 800,
  onFinish = () => { },
  showVersion = true,
  showCopyright = true,
}: AnimatedSplashScreenProps) {
  const iconScale = useRef(new Animated.Value(0.8)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const currentYear = new Date().getFullYear();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Initial icon animation
    Animated.parallel([
      Animated.timing(iconScale, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(iconOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Main animation sequence
    Animated.sequence([
      Animated.delay(holdTime), // ⏸ hold icon before title animation
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: duration * 0.8,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(progressWidth, {
          toValue: 100,
          duration: duration * 1.5,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]),
      Animated.delay(800), // Hold for a bit
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(onFinish);
  }, [duration, holdTime, onFinish]);

  return (
    <Animated.View style={[styles.fullscreen, { opacity: containerOpacity }]}>
      <StatusBar
        translucent={true}
        backgroundColor="transparent" />
      <View style={styles.center}>
        <Animated.Image
          source={iconSource}
          style={[
            styles.icon,
            {
              transform: [{ scale: iconScale }],
              opacity: iconOpacity,
            },
          ]}
          resizeMode="contain"
        />
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslateY }],
            },
          ]}
        >
          <Text style={styles.title}>{appName}</Text>
        </Animated.View>
      </View>

      <View style={styles.bottomView}>
        {showVersion && (
          <Text style={styles.versionText}>v.{DeviceInfo.getVersion()}</Text>
        )}
        <View style={styles.progressContainer}>
          <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
          <View style={styles.progressBarBackground} />
        </View>
        {showCopyright && (
          <Text style={styles.copyrightText}>
            {`Copyrightⓒ ${currentYear} Gathengpu Dlo. All rights reserved.`}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  icon: {
    width: 96,
    height: 96,
    marginBottom: 20,
  },
  titleContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
    fontFamily: "Pretendard-SemiBold",
    letterSpacing: 0.5,
  },
  bottomView: {
    position: 'absolute',
    bottom: 42,
    width: Dimensions.get("window").width,
    alignItems: 'center',
  },
  versionText: {
    fontFamily: "Pretendard-Regular",
    color: AppColors.appTextBlack,
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  progressContainer: {
    width: 100,
    height: 2,
    marginBottom: 8,
    position: 'relative',
  },
  progressBar: {
    height: 2,
    backgroundColor: AppColors.primary,
    borderRadius: 10,
    position: 'absolute',
    bottom: 0,
    zIndex: 1000,
  },
  progressBarBackground: {
    height: 2,
    backgroundColor: AppColors.appTextGrey,
    borderRadius: 10,
    width: 100,
  },
  copyrightText: {
    fontFamily: "Pretendard-Regular",
    color: AppColors.appTextBlack,
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
  },
});
