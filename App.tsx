import React, { useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View
} from 'react-native';
import { useSelector } from 'react-redux';
import PushNotification from 'react-native-push-notification';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { setLanguage, setTheme } from './src/store/slices/deviceSlice';
import { setCurrent, setReaderSetting } from './src/store/slices/readerSlice';
import ChangeLanguage from './src/pages/reader/ChangeLanguage';
import { navigationRef } from './src/utils/RootNavigation';
import CustomLoading from './src/components/CustomLoading';
import { CustomToast } from './src/components/CustomToast';
import DatabaseViewer from './src/pages/DatabaseViewer';
import Notification from './src/pages/Notification';
import { CurrentRead, ReaderSetting } from './src/types/reader';
import { AppColors } from './src/constants/Color';
import Reader from './src/pages/reader/Reader';
import { store } from './src/store/store';
import SplashScreen from './Splash';
import Main from './src/pages/Main';
function App(): React.JSX.Element {
  const device = useSelector((state: any) => state.device);

  const Stack = createStackNavigator();

  useEffect(() => {
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
      console.log('reader setting', readerSetting);
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
          bookName: "Exodus",
          bookId: 1,
          chapterId: 1,
          chapterNumber: 1,
          verseId: 1,
          verseNumber: 1,
          maxChapter: 0,
        }
        store.dispatch(setCurrent(readerInitial));
      }
    })
    PushNotification.createChannel(
      {
        channelId: 'ho-dlo-channel',
        channelName: 'Ho Dlo Notifications',
        importance: 4,
      },
      (created) => console.log(`createChannel returned '${created}'`)
    );
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
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
          </Stack.Navigator>
        </NavigationContainer>
        {/* </GestureHandlerRootView> */}
        <CustomLoading visible={device.loading} />
        <CustomToast visible={device.toast.show} message={device.toast.message} type={device.toast.type} duration={device.toast.duration} />
      </View>
    </SafeAreaView>
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
