// import React, { useEffect, useRef } from "react";
// import { ActivityIndicator, View, StyleSheet, ImageBackground, Text, Dimensions, Animated, PermissionsAndroid, StatusBar, Alert, Image } from "react-native";
// // import { AppColors } from "./src/constants/AppColors";
// import DeviceInfo from "react-native-device-info";
// import { AppColors } from "./src/constants/Color";
// import { useDispatch } from 'react-redux';
// import { setDeviceId, setLoginTime } from './src/store/slices/deviceSlice';
// // import { createTables, seedDatabase } from "./src/services/DatabaseService";
// import DatabaseService from "./src/services/DataService";
// import { scheduleNotification } from "./src/services/DailyVerseService";
// import AnimatedSplashScreen from "./AnimatedSplash";
// import { fileDownloadService } from "./src/services/FileDownloadService";
// import { AppUrls } from "./src/constants/Urls";

// const SplashScreen = ({ navigation }: any) => {
//     const progress = useRef(new Animated.Value(0)).current;
//     const currentYear = new Date().getFullYear();
//     const dispatch = useDispatch();

//     useEffect(() => {
//         const animateProgress = (value: number) => {
//             Animated.timing(progress, {
//                 toValue: value,
//                 duration: 250,
//                 useNativeDriver: false,
//             }).start();
//         };

//         const initializeApp = async () => {
//             try {
//                 const deviceId = await DeviceInfo.getUniqueId();
//                 dispatch(setDeviceId(deviceId));
//                 dispatch(setLoginTime(new Date().toISOString()));
//                 animateProgress(20);
//             } catch (error) {
//                 console.error('Error getting device info:', error);
//             }
//         };

//         const initDB = async () => {
//             const db = DatabaseService.getInstance();
//             try {
//                 await db.init().then((result: any) => {
//                     console.log('db init result', result);
//                 }).catch((error: any) => {
//                     console.log('db init error', error);
//                 });
//                 animateProgress(40);

//                 try {
//                     const data = await db.getRandomVerse(10);
//                     console.log('random verse', data);
//                     // db.addNotificati`on(data[9].verse_id);
//                     scheduleNotification(data);
//                 } catch (error) {
//                     console.log('random verse error', error);
//                 }
//                 // navigation.reset({
//                 //     index: 0,
//                 //     routes: [{ name: 'Main' }],
//                 // });
//             } catch (error) {
//                 Alert.alert('Error', 'Failed to initialize database');
//                 console.log('db error', error);
//             }
//         };

//         const downloadAssets = async () => {
//             try {
//                 const result = await fileDownloadService.downloadFile(
//                     AppUrls.audioUrl,
//                     undefined,
//                     ({ progress: downloadProgress }) => {
//                         const pct = 40 + downloadProgress * 55;
//                         animateProgress(Math.min(95, pct));
//                     },
//                 );
//                 console.log('Splash download result:', result);
//                 animateProgress(100);
//             } catch (error) {
//                 console.error('Failed to download initial assets:', error);
//             }
//         };

//         const bootstrap = async () => {
//             animateProgress(5);
//             await initializeApp();
//             await initDB();
//             await downloadAssets();
//         };

//         bootstrap();

//         // setTimeout(() => {
//         //     navigation.reset({
//         //         index: 0,
//         //         routes: [{ name: 'Main' }],
//         //     });
//         // }, 2500);
//     }, [dispatch, progress]);

//     const initDb1 = async () => {
//         // await createTables().then(async (data) => {
//         //     console.log('createTables', data);
//         //     const res = await seedDatabase()
//         //     console.log('seedDatabase', res);
//         //     if (res) {
//         //         navigation.reset({
//         //             index: 0,
//         //             routes: [{ name: 'Main' }],
//         //         });
//         //     }
//         // }).catch((error) => {
//         //     console.log('createTables error', error);
//         // });

//     }

//     const requestStoragePermission = async () => {
//         try {
//             const granted = await PermissionsAndroid.request(
//                 PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
//                 {
//                     title: "Storage Permission Required",
//                     message: "This app needs access to your storage to download files",
//                     buttonNeutral: "Ask Me Later",
//                     buttonNegative: "Cancel",
//                     buttonPositive: "OK"
//                 }
//             );
//             return granted === PermissionsAndroid.RESULTS.GRANTED;
//         } catch (err) {
//             console.warn(err);
//             return false;
//         }
//     };

//     return (
//         <View style={SplashScreenStyle.mainWrapper}>
//             <StatusBar translucent backgroundColor="transparent" />
//             {/* <ImageBackground source={require('./src/assets/images/splash1.png')} resizeMode="cover" style={SplashScreenStyle.image}></ImageBackground> */}
//             <AnimatedSplashScreen />
//             <View style={SplashScreenStyle.iconContainer}>
//                 <Image source={require('./src/assets/images/icon.png')} style={SplashScreenStyle.icon} resizeMode="contain" />
//             </View>
//             <View style={SplashScreenStyle.bottomView}>
//                 <Text style={SplashScreenStyle.text}>v.{DeviceInfo.getVersion()}</Text>
//                 <View style={{ width: 100 }}>
//                     <Animated.View style={[SplashScreenStyle.bar, { width: progress }]} />
//                     <View style={SplashScreenStyle.barI}></View>
//                 </View>
//                 <Text style={SplashScreenStyle.text}>{`Copyrightⓒ ${currentYear} Gathengpu Dlo. All rights reserved.`}</Text>
//             </View>
//         </View>
//     );
// };
// const SplashScreenStyle = StyleSheet.create({
//     mainWrapper: {
//         flex: 1,
//         justifyContent: "center",
//         backgroundColor: 'white',
//     },
//     image: {
//         flex: 1,
//         justifyContent: 'center',
//     },
//     text: {
//         fontFamily: "Pretendard-Regular",
//         color: AppColors.appTextBlack,
//         fontSize: 10,
//         lineHeight: 34,
//         textAlign: 'center',
//     },
//     bottomView: {
//         position: 'absolute',
//         bottom: 42,
//         width: Dimensions.get("window").width,
//         alignItems: 'center',
//     },
//     bar: {
//         height: 2,
//         backgroundColor: AppColors.primary,
//         borderRadius: 10,
//         position: 'absolute',
//         bottom: 0,
//         zIndex: 1000
//     },
//     barI: {
//         height: 2,
//         backgroundColor: AppColors.appTextGrey,
//         borderRadius: 10,
//         width: 100,
//     },
//     iconContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         gap: 12,
//     },
//     icon: {
//         width: 96,
//         height: 96,
//     },
//     nameText: {
//         fontSize: 22,
//         fontWeight: '700',
//         letterSpacing: 0.3,
//         color: '#111',
//         // marginTop: 12,
//     },
// });
// export default SplashScreen;
