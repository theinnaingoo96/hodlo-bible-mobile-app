import React, { useEffect, useRef } from 'react';
import {
  AppState,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View, PermissionsAndroid,
  Alert
} from 'react-native';
import { useSelector } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import permissionService from './src/services/PermissionService';
import DailyVerseService from './src/services/DailyVerseService';

import { setDownloaded, setLanguage, setTheme } from './src/store/slices/deviceSlice';
import { setCurrent, setReaderSetting } from './src/store/slices/readerSlice';
import PsalmAudioExample from './src/components/PsalmAudioExample';
import { CurrentRead, ReaderSetting } from './src/types/reader';
import ChangeLanguage from './src/pages/reader/ChangeLanguage';
import { useAudioPlayer } from './src/hooks/useAudioPlayer';
import { navigationRef } from './src/utils/RootNavigation';
import CustomLoading from './src/components/CustomLoading';
import { CustomToast } from './src/components/CustomToast';
import DatabaseViewer from './src/pages/DatabaseViewer';
import Notification from './src/pages/Notification';
import { AppColors } from './src/constants/Color';
import Reader from './src/pages/reader/Reader';
import { store } from './src/store/store';
import SplashScreen from './SplashAni';
import Main from './src/pages/Main';
import TermsAndConditions from './src/pages/TermsAndConditions';
import AboutUs from './src/pages/AboutUs';
import ReadingHistory from './src/pages/ReadingHistory';
import Highlight from './src/pages/Highlight';

function App(): React.JSX.Element {
  const device = useSelector((state: any) => state.device);
  const appState = useRef(AppState.currentState);
  const Stack = createStackNavigator();
  const { stop } = useAudioPlayer();

  useEffect(() => {
    AsyncStorage.getItem("ho-dlo-downloaded").then((value: any) => {
      if (value) {
        store.dispatch(setDownloaded(value == "true" ? true : false));
      } else {
        store.dispatch(setDownloaded(false));
      }
    });
    AsyncStorage.getItem("ho-dlo-theme").then((value: any) => {
      if (value) {
        store.dispatch(setTheme(value == "true" ? true : false));
      }
    });
    AsyncStorage.getItem("ho-dlo-language").then((value: any) => {
      if (value) {
        store.dispatch(setLanguage(value));
      }
    });
    AsyncStorage.getItem("ho-dlo-reader-setting").then((readerSetting: any) => {
      // console.log('reader setting', readerSetting);
      if (readerSetting) {
        const readerSettingData = JSON.parse(readerSetting);
        store.dispatch(setReaderSetting(readerSettingData));
      } else {
        const readerSetting: ReaderSetting = {
          fontSize: 16,
          fontFamily: 1,
          theme: 1,
        }
        store.dispatch(setReaderSetting(readerSetting));
      }
    });
    AsyncStorage.getItem("ho-dlo-current-read").then((current: any) => {
      if (current) {
        const currentReading: CurrentRead = JSON.parse(current);
        store.dispatch(setCurrent(currentReading))
      } else {
        const readerInitial: CurrentRead = {
          bookName: "Genesis",
          bookId: 1,
          chapterId: 1,
          chapterNumber: 1,
          verseId: 1,
          verseNumber: 1,
          maxChapter: 50,
          progress: 0
        }
        store.dispatch(setCurrent(readerInitial));
      }
    })
    initialPermissionSetup()
  }, []);

  const initialPermissionSetup = async () => {
    const results = await permissionService.requestEssentialPermissions();
    await DailyVerseService.checkAndScheduleNotifications();
  }

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      console.log('App state changed ... ', nextAppState);

      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        if (Platform.OS === "ios") {
          // setAppStateVisible(false);
        }

        const currentTime = Date.now();

        // if (
        //   lastBackgroundTime.current &&
        //   currentTime - lastBackgroundTime.current > backgroundTimer
        // ) {
        //   // setActive(false);
        // } else {
        //   // setActive(true);
        // }
        // lastBackgroundTime.current = null;
      }

      if (
        appState.current === "active" &&
        nextAppState.match(/inactive|background/)
      ) {
        if (Platform.OS === "ios") {
          // setAppStateVisible(true);
        }

        console.log("App has come to the foreground!");
        stop();
        // navigationRef.navigate("FaceScan")
        // lastBackgroundTime.current = Date.now();

        // }, 10 * 60 * 1000);
      }

      appState.current = nextAppState;

      console.log("AppState", appState.current);
    });

    return () => {
      subscription.remove();
      // };
    };
  }, []);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <StatusBar
          backgroundColor={device.theme ? AppColors.appTextWhite : AppColors.appBackgroundDark}
          barStyle={device.theme ? "dark-content" : "light-content"}
          showHideTransition="fade" animated={true}
        />
        {/* <GestureHandlerRootView style={{ flex: 1 }}> */}
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator initialRouteName="Splash" screenOptions={{ gestureEnabled: false }}>
            <Stack.Screen
              name="Splash"
              component={SplashScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Main"
              component={Main}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Reader"
              component={Reader}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ChangeLanguage"
              component={ChangeLanguage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Notification"
              component={Notification}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="DatabaseViewer"
              component={DatabaseViewer}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AudioPlayer"
              component={PsalmAudioExample}
              options={{ title: 'Psalm Audio' }}
            />
            <Stack.Screen
              name="TermsAndConditions"
              component={TermsAndConditions}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AboutUs"
              component={AboutUs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ReadingHistory"
              component={ReadingHistory}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Highlight"
              component={Highlight}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
        {/* </GestureHandlerRootView> */}
        <CustomLoading visible={device.loading} />
        <CustomToast visible={device.toast.show} message={device.toast.message} type={device.toast.type} duration={device.toast.duration} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
