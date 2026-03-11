import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View, Text, Platform, PermissionsAndroid, Linking } from 'react-native';
import DeviceInfo from "react-native-device-info";
import { AppColors } from "./src/constants/Color";
import { useDispatch, useSelector } from 'react-redux';
import { setDeviceId, setLoginTime } from './src/store/slices/deviceSlice';
import DatabaseService from "./src/services/DatabaseService";
import { scheduleNotification } from "./src/services/DailyVerseService";
import { Alert } from 'react-native';
import permissionService from './src/services/PermissionService';
import { createUser } from './src/services/ApiService';
import ProgressBar from './src/components/ProgressBar';

const SplashScreen = ({ navigation }: any) => {
    // Animated values for the icon's horizontal position and the text's properties
    const [progress, setProgress] = useState(new Animated.Value(0));
    const iconTranslateX = useRef(new Animated.Value(0)).current;
    const textTranslateX = useRef(new Animated.Value(100)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;
    const device = useSelector((state: any) => state.device);
    const [finish, setFinish] = useState(false);
    const [isOnline, setIsOnline] = useState<any>(true);

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

    // useEffect(()=> {
    //     if (device.startDownload && !isOnline) {
    //         // dispatch(setStartDownload(true));
    //         Alert.alert('No internet connection', 'Please check your internet connection and try again',
    //             [
    //                 {
    //                   text: 'OK',
    //                   style: 'default',
    //                   onPress: () => {
                        
    //                   },
    //                 },
    //               ]
    //         );
    //     }
    // }, [device.startDownload, isOnline])

    useEffect(() => {
        // Wait for 1 second before starting the transition
        const timer = setTimeout(() => {
            // Run the animations in parallel for a smooth, synchronized effect
            Animated.parallel([
                // Animate the icon to slide left
                Animated.timing(iconTranslateX, {
                    toValue: -100, // Adjust this value to control the final icon position
                    duration: 700, // Duration of the animation in milliseconds
                    useNativeDriver: true,
                }),
                // Animate the text to slide in from the right
                Animated.timing(textTranslateX, {
                    toValue: 0,
                    duration: 700,
                    useNativeDriver: true,
                }),
                // Animate the text's opacity from 0 to 1 (fade-in)
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

        const requestPermissions = async () => {
            return new Promise(async (resolve, reject) => {
                try {
                    const notificationsGranted = await permissionService.checkPermission('notifications');
                    const mediaAudioGranted = await permissionService.checkPermission('media_audio');

                    console.log('Permission status - Notifications:', notificationsGranted, 'Audio:', mediaAudioGranted);

                    if (!notificationsGranted ) {
                        const results = await permissionService.requestEssentialPermissions();

                        Object.entries(results).forEach(([permission, result]) => {
                            if (!result.granted) {
                                console.warn(`Permission ${permission} was not granted:`, result.message);
                            } else {
                                console.log(`Permission ${permission} granted`);
                            }
                        });

                        if (!results.notifications.granted) {
                            console.warn('Notification permission is required for daily verses');
                        }
                        if (!results.media_audio.granted) {
                            console.warn('Audio permission is required for audio playback');
                        }
                        resolve(false);
                    } else {
                        console.log('All essential permissions already granted');
                        resolve(true);
                    }
                } catch (error) {
                    console.error('Error requesting permissions:', error);
                    reject(error);
                }
            });
        };

        const initDB = async () => {
            const db = DatabaseService.getInstance();
            await db.init(dispatch).then(() => {
                db.getRandomVerse(10).then(async (data) => {
                    console.log('random verse', data);
                    // db.addNotificati`on(data[9].verse_id);
                    // if (Platform.OS === "android" && Platform.Version >= 31) {
                    //     await Linking.openSettings();
                    // }
                    const notificationsGranted = await permissionService.checkPermission('notifications');
                    if (notificationsGranted) {
                        scheduleNotification(data);
                    }
                    const deviceId = await DeviceInfo.getUniqueId();
                    const deviceName = await DeviceInfo.getDeviceName();
                    const deviceType = Platform.OS;
                    console.log('[Splash] deviceId', deviceId, 'deviceName', deviceName, 'deviceType', deviceType);
                    
                    // dispatch(setDownloaded(true));

                    // const result = createUser(deviceId, deviceName, deviceType);
                    // console.log('[Splash] create user result', result);
                }).catch((error) => {
                    console.log('[Splash] random verse error', error);
                    // dispatch(setDownloaded(true));
                });
            }).catch((error) => {
                Alert.alert('Error', 'Failed to initialize database');
                console.log('[Splash] db error', error);
            });
            // const verses = await db.getVersesByChapter(3).then((data) => {
            //     console.log('verses', data);
            //     if (data) {
            //         navigation.reset({
            //             index: 0,
            //             routes: [{ name: 'M ain' }],
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

    // useEffect(() => {
    //     const netInfoSubscription = NetInfo.addEventListener(handleNetWorkChange);
    //     return () => {
    //       netInfoSubscription && netInfoSubscription();
    //     };
    //   }, [isOnline]);

    // const handleNetWorkChange = (state: any) => {
    //     setIsOnline(state.isConnected);
    // };

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
                {/* Animated text component */}
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
                <Text style={styles.version}>v.1.0</Text>
                <Text style={styles.copyright}>Copyright © 2025 Gathengpu Dlo. All rights reserved.</Text>
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