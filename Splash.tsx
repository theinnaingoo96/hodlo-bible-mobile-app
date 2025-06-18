import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, StyleSheet, ImageBackground, Text, Dimensions, ProgressBarAndroidComponent, Animated, ProgressBarAndroidBase, StatusBar } from "react-native";
// import { AppColors } from "./src/constants/AppColors";
import DeviceInfo from "react-native-device-info";
import { AppColors } from "./src/constants/Color";
import { useDispatch } from 'react-redux';
import { setDeviceId, setLoginTime } from './src/store/slices/deviceSlice';
import { createTables, openDatabase, seedDatabase, seedDatabase2 } from "./src/services/DatabaseService";

const SplashScreen = ({ navigation }: any) => {
    const [progress, setProgress] = useState(new Animated.Value(0));
    const currentYear = new Date().getFullYear();
    const dispatch = useDispatch();

    useEffect(() => {
        const initializeApp = async () => {
            try {
                const deviceId = await DeviceInfo.getUniqueId();
                dispatch(setDeviceId(deviceId));
                dispatch(setLoginTime(new Date().toISOString()));
            } catch (error) {
                console.error('Error getting device info:', error);
            }
        };

        initializeApp();
        initDb();

        Animated.timing(progress, {
            toValue: 100,
            duration: 2000,
            useNativeDriver: false
        }).start();

        // setTimeout(() => {
        //     navigation.reset({
        //         index: 0,
        //         routes: [{ name: 'Main' }],
        //     });
        // }, 2500);
    }, []);

    const initDb = async () => {
        await createTables();
        // const isDbReady = await openDatabase();
        // if (isDbReady) {
        const res = await seedDatabase()
        console.log('seedDatabase', res);
        if (res) {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
            });
        }

        // }
    }

    return (
        <View style={SplashScreenStyle.mainWrapper}>
            <StatusBar translucent backgroundColor="transparent" />
            <ImageBackground source={require('./src/assets/images/splash1.png')} resizeMode="cover" style={SplashScreenStyle.image}></ImageBackground>
            <View style={SplashScreenStyle.bottomView}>
                <Text style={SplashScreenStyle.text}>v.{DeviceInfo.getVersion()}</Text>
                <View style={{ width: 100 }}>
                    <Animated.View style={[SplashScreenStyle.bar, { width: progress }]} />
                    <View style={SplashScreenStyle.barI}></View>
                </View>
                <Text style={SplashScreenStyle.text}>{`Copyrightⓒ ${currentYear} Gathanpu Dlo. All rights reserved.`}</Text>
            </View>
        </View>
    );
};
const SplashScreenStyle = StyleSheet.create({
    mainWrapper: {
        flex: 1,
        justifyContent: "center",
    },
    image: {
        flex: 1,
        justifyContent: 'center',
    },
    text: {
        fontFamily: "Pretendard-Regular",
        color: AppColors.appTextBlack,
        fontSize: 10,
        lineHeight: 34,
        textAlign: 'center',
    },
    bottomView: {
        position: 'absolute',
        bottom: 42,
        width: Dimensions.get("window").width,
        alignItems: 'center',
    },
    bar: {
        height: 2,
        backgroundColor: AppColors.primary,
        borderRadius: 10,
        position: 'absolute',
        bottom: 0,
        zIndex: 1000
    },
    barI: {
        height: 2,
        backgroundColor: AppColors.appTextGrey,
        borderRadius: 10,
        width: 100,
    }
});
export default SplashScreen;
