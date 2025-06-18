import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from "@react-native-async-storage/async-storage";

interface DeviceState {
  deviceId: string;
  theme: boolean;
  loginTime: string | null;
  loading: boolean;
  language: string;
}

const initialState: DeviceState = {
  deviceId: '',
  theme: true,  // true: light, false: dark
  loginTime: null,
  loading: false,
  language: 'hodlo',
};

const deviceSlice = createSlice({
  name: 'device',
  initialState,
  reducers: {
    setDeviceId: (state, action: PayloadAction<string>) => {
      state.deviceId = action.payload;
    },
    setTheme: (state, action: PayloadAction<boolean>) => {
      console.log('setTheme', action.payload);
      state.theme = action.payload;
      AsyncStorage.setItem("ho-dlo-theme", action.payload.toString());
    },
    setLoginTime: (state, action: PayloadAction<string>) => {
      state.loginTime = action.payload;
    },
    clearDeviceInfo: (state) => {
      state.deviceId = '';
      state.theme = true;
      state.loginTime = null;
      state.loading = false;
      state.language = 'hodlo';
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
  },
});

export const { setDeviceId, setTheme, setLoginTime, clearDeviceInfo, setLoading, setLanguage } = deviceSlice.actions;
export default deviceSlice.reducer; 