import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, StyleSheet, ImageBackground, Text, Dimensions, ProgressBarAndroidComponent, Animated, ProgressBarAndroidBase, StatusBar } from "react-native";
import { AppColors } from "./src/constants/Color";
import DeviceInfo from "react-native-device-info";

const SplashScreen = ({ navigation }: any) => {
    const [progress, setProgress] = useState(new Animated.Value(0));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 3000);
    }, []);
}