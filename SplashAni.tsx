import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View, Text } from 'react-native';
import DeviceInfo from "react-native-device-info";
import { AppColors } from "./src/constants/Color";
import { useDispatch } from 'react-redux';
import { setDeviceId, setLoginTime } from './src/store/slices/deviceSlice';
import DatabaseService from "./src/services/DataService";
import { scheduleNotification } from "./src/services/DailyVerseService";
import { Alert } from 'react-native';

const SplashScreen = ({ navigation }: any) => {
    // Animated values for the icon's horizontal position and the text's properties
    const [progress, setProgress] = useState(new Animated.Value(0));
    const iconTranslateX = useRef(new Animated.Value(0)).current;
    const textTranslateX = useRef(new Animated.Value(100)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;

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
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Main' }],
                });
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
                    GATHANGPU DLO
                </Animated.Text>
            </View>
            <View style={styles.footer}>
                <Text style={styles.version}>v.1.0</Text>
                <Text style={styles.copyright}>Copyright © 2025 Gathanpu Dlo. All rights reserved.</Text>
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