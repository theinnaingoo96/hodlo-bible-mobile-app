/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View
} from 'react-native';
import { useSelector } from 'react-redux';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { setLanguage, setTheme } from './src/store/slices/deviceSlice';
import ChangeLanguage from './src/pages/reader/ChangeLanguage';
import { navigationRef } from './src/utils/RootNavigation';
import CustomLoading from './src/components/CustomLoading';
import DatabaseViewer from './src/pages/DatabaseViewer';
import { AppColors } from './src/constants/Color';
import Reader from './src/pages/reader/Reader';
import { store } from './src/store/store';
import SplashScreen from './Splash';
import Main from './src/pages/Main';
import { CustomToast } from './src/components/CustomToast';

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
