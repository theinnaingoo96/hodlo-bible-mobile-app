import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Toast } from '../../types/data';

interface DeviceState {
  deviceId: string;
  theme: boolean;
  loginTime: string | null;
  loading: boolean;
  language: string;
  toast: Toast;
  downloaded: boolean;
  startDownload: boolean;
  downloadProgress: number;
  databaseVersion: string;
}

const initialState: DeviceState = {
  deviceId: '',
  theme: true,  // true: light, false: dark
  loginTime: null,
  loading: false,
  language: 'hodlo',
  toast: {
    show: false,
    message: '',
    type: 'success',
    duration: 3000,
  },
  downloaded: false,
  startDownload: false,
  downloadProgress: 0,
  databaseVersion: '0',
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
    setDatabaseVersion: (state, action: PayloadAction<string>) => {
      console.log('setDatabaseVersion', action.payload);
      state.databaseVersion = action.payload;
      AsyncStorage.setItem("ho-dlo-database-version", action.payload);
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
      state.toast = {
        show: false,
        message: '',
        type: 'success',
        duration: 3000,
      };
      state.downloaded = false;
      state.startDownload = false;
      state.downloadProgress = 0;
      state.databaseVersion = '0';
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
      AsyncStorage.setItem("ho-dlo-language", action.payload);
    },
    setToast: (state, action: PayloadAction<Toast>) => {
      state.toast = action.payload;
    },
    setDownloaded: (state, action: PayloadAction<boolean>) => {
      state.downloaded = action.payload;
      AsyncStorage.setItem("ho-dlo-downloaded", action.payload.toString());
    },
    setStartDownload: (state, action: PayloadAction<boolean>) => {
      state.startDownload = action.payload;
    },
    setDownloadProgress: (state, action: PayloadAction<number>) => {
      state.downloadProgress = action.payload;
    },

  },
});

export const {
  setDeviceId,
  setTheme,
  setLoginTime,
  clearDeviceInfo,
  setLoading,
  setLanguage,
  setToast,
  setDownloaded,
  setStartDownload,
  setDownloadProgress,
  setDatabaseVersion
} = deviceSlice.actions;
export default deviceSlice.reducer;