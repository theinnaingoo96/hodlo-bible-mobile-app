import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, StyleSheet, ImageBackground, Text, Dimensions, ProgressBarAndroidComponent, Animated, ProgressBarAndroidBase, StatusBar, Alert, Image } from "react-native";
// import { AppColors } from "./src/constants/AppColors";
import DeviceInfo from "react-native-device-info";
import { AppColors } from "./src/constants/Color";
import { useDispatch } from 'react-redux';
import { setDeviceId, setLoginTime } from './src/store/slices/deviceSlice';
// import { createTables, seedDatabase } from "./src/services/DatabaseService";
import DatabaseService from "./src/services/DataService";
import { scheduleNotification } from "./src/services/DailyVerseService";
import AnimatedSplashScreen from "./AnimatedSplash";

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

        const initDB = async () => {
            const db = DatabaseService.getInstance();
            await db.init().then(() => {
                db.getRandomVerse(10).then((data) => {
                    console.log('random verse', data);
                    // db.addNotificati`on(data[9].verse_id);
                    scheduleNotification(data);
                }).catch((error) => {
                    console.log('random verse error', error);
                });
                // navigation.reset({
                //     index: 0,
                //     routes: [{ name: 'Main' }],
                // });
            }).catch((error) => {
                Alert.alert('Error', 'Failed to initialize database');
                console.log('db error', error);
            });
            // const verses = await db.getVersesByChapter(3).then((data) => {
            //     console.log('verses', data);
            //     if (data) {
            //         navigation.reset({
            //             index: 0,
            //             routes: [{ name: 'Main' }],
            //         });
            //     } else {
            //         console.log('verses not found');
            //         // seedDatabase()
            //     }       
            // }).catch((error) => {
            //     console.log('verses error', error);
            // });
            // console.log(verses);
        };

        initDB();

        initializeApp();

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

    const initDb1 = async () => {
        // await createTables().then(async (data) => {
        //     console.log('createTables', data);
        //     const res = await seedDatabase()
        //     console.log('seedDatabase', res);
        //     if (res) {
        //         navigation.reset({
        //             index: 0,
        //             routes: [{ name: 'Main' }],
        //         });
        //     }
        // }).catch((error) => {
        //     console.log('createTables error', error);
        // });

    }

    return (
        <View style={SplashScreenStyle.mainWrapper}>
            <StatusBar translucent backgroundColor="transparent" />
            {/* <ImageBackground source={require('./src/assets/images/splash1.png')} resizeMode="cover" style={SplashScreenStyle.image}></ImageBackground> */}
            <AnimatedSplashScreen />
            <View style={SplashScreenStyle.iconContainer}>
                <Image source={require('./src/assets/images/icon.png')} style={SplashScreenStyle.icon} resizeMode="contain" />
                {/* <Text style={SplashScreenStyle.nameText}>GATHANGPU DLO</Text> */}
            </View>
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
        backgroundColor: 'white',
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
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    icon: {
        width: 96,
        height: 96,
    },
    nameText: {
        fontSize: 22,
        fontWeight: '700',
        letterSpacing: 0.3,
        color: '#111',
        // marginTop: 12,
    },
});
export default SplashScreen;
