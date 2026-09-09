import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View, Text, Platform, PermissionsAndroid, Linking, Alert } from 'react-native';
import DeviceInfo from "react-native-device-info";
import { useDispatch, useSelector } from 'react-redux';
import { setDeviceId, setLoginTime } from './src/store/slices/deviceSlice';
import DatabaseService from "./src/services/DatabaseService";
import DailyVerseService from "./src/services/DailyVerseService";
import permissionService from './src/services/PermissionService';
import ProgressBar from './src/components/ProgressBar';
import useInternetStatus from './src/hooks/useInternetStatus';

const SplashScreen = ({ navigation }: any) => {
    const [progress, setProgress] = useState(new Animated.Value(0));
    const iconTranslateX = useRef(new Animated.Value(0)).current;
    const textTranslateX = useRef(new Animated.Value(100)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;
    const device = useSelector((state: any) => state.device);
    const [finish, setFinish] = useState(false);
    const networkStatus = useInternetStatus();

    useEffect(() => {
        console.log('downloaded in splash screen...', device.downloaded);
        if (device.downloaded && finish) {
            // setTimeout(() => {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
            });
            // }, 2500)
        }
    }, [device.downloaded, finish]);

    useEffect(() => {
        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(iconTranslateX, {
                    toValue: -100,
                    duration: 700,
                    useNativeDriver: true,
                }),
                Animated.timing(textTranslateX, {
                    toValue: 0,
                    duration: 700,
                    useNativeDriver: true,
                }),
                Animated.timing(textOpacity, {
                    toValue: 1,
                    duration: 700,
                    useNativeDriver: true,
                }),
            ]).start()
            setTimeout(() => {
                setFinish(true)
            }, 1000);
        }, 1000); // Initial 1-second delay

        return () => clearTimeout(timer);
    }, []);

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
            console.log('inside initDB');

            const db = DatabaseService.getInstance();
            await db.init(dispatch).then(async () => {
                console.log('inside db.init');
                db.getRandomVerses(10).then(async (data) => {
                    // console.log('random verse', data);
                    // await checkDatabaseUpdate();
                    const notificationsGranted = await permissionService.checkPermission('notifications');
                    if (notificationsGranted) {
                        await DailyVerseService.checkAndScheduleNotifications();
                    }
                    const deviceId = await DeviceInfo.getUniqueId();
                    const deviceName = await DeviceInfo.getDeviceName();
                    const deviceType = Platform.OS;
                    console.log('[Splash] deviceId', deviceId, 'deviceName', deviceName, 'deviceType', deviceType);
                }).catch((error) => {
                    console.log('[Splash] random verse error', error);
                });
            }).catch((error) => {
                Alert.alert('Error', 'Failed to initialize database');
                console.log('[Splash] db error', error);
            });
        };

        // Request permissions first, then initialize app
        // requestPermissions().then(() => {
        initDB();
        initializeApp();
        // });

        Animated.timing(progress, {
            toValue: 100,
            duration: 2000,
            useNativeDriver: false
        }).start();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Animated.Image
                    source={require('./src/assets/images/icon.png')} // Replace with your icon's path
                    style={[
                        styles.icon,
                        { transform: [{ translateX: iconTranslateX }] },
                    ]}
                />
                <Animated.Text
                    style={[
                        styles.text,
                        {
                            transform: [{ translateX: textTranslateX }],
                            opacity: textOpacity,
                        },
                    ]}
                >
                    GATHENGPU DLO
                </Animated.Text>
            </View>
            <View style={styles.footer}>
                {device.startDownload && <ProgressBar progress={device.downloadProgress} />}
                <Text style={styles.version}>Version {DeviceInfo.getVersion()}</Text>
                <Text style={styles.copyright}>Copyright © 2026 Gathengpu Dlo. All rights reserved.</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        top: '40%', // Adjust vertical position as needed
    },
    icon: {
        width: 65,
        height: 65,
        position: 'absolute',
        left: '40%',
        transform: [{ translateX: '0%' }],
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        paddingLeft: '25%',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        alignItems: 'center',
    },
    version: {
        fontSize: 16,
        marginBottom: 5,
        color: '#777',
    },
    copyright: {
        fontSize: 12,
        color: '#999',
    },
});

export default SplashScreen;