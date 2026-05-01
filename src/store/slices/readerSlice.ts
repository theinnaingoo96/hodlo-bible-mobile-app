import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { CurrentRead, ReaderSetting } from '../../types/reader';
import { AudioPlayerState } from '../../services/AudioPlayerService';

interface ReaderState {
  currentRead: CurrentRead;
  readerSetting: ReaderSetting;
  audioPlayer: AudioPlayerState;
}


const initialState: ReaderState = {
  currentRead: {
    bookName: '',
    bookId: 0,
    chapterId: 0,
    chapterNumber: 0,
    verseId: 0,
    verseNumber: 0,
    maxChapter: 0,
    progress: 0
  },
  readerSetting: {
    fontSize: 16,
    fontFamily: 1,
    theme: 1,
  },
  audioPlayer: {
    isPlaying: false,
    isPaused: false,
    isStopped: true,
    duration: 0,
    currentTime: 0,
    volume: 1.0,
    isLoading: false,
    error: null,
  }
};

const readerSlice = createSlice({
  name: 'reader',
  initialState,
  reducers: {
    setCurrent: (state, action: PayloadAction<CurrentRead>) => {
      console.log('set current read ', action.payload)
      state.currentRead = action.payload;
      AsyncStorage.setItem("ho-dlo-current-read", JSON.stringify(state.currentRead));
    },
    setCurrentVerse: (state, action: PayloadAction<any>) => {
      // console.log('current reading set current verse => ', action.payload);

      state.currentRead.verseId = action.payload.verseId;
      state.currentRead.verseNumber = action.payload.verseNumber
      AsyncStorage.setItem("ho-dlo-current-read", JSON.stringify(state.currentRead));
    },
    setReadingProgress: (state, action: PayloadAction<number>) => {
      state.currentRead.progress = action.payload;
      AsyncStorage.setItem("ho-dlo-current-read", JSON.stringify(state.currentRead));
    },
    clearCurrent: (state) => {
      state.currentRead = {
        bookName: '',
        bookId: 0,
        chapterId: 0,
        chapterNumber: 0,
        verseId: 0,
        verseNumber: 0,
        maxChapter: 0,
        progress: 0
      };
      state.readerSetting = {
        fontSize: 16,
        fontFamily: 1,
        theme: 1,
      }
    },
    setReaderSetting: (state, action: PayloadAction<ReaderSetting>) => {
      state.readerSetting = action.payload;
      AsyncStorage.setItem("ho-dlo-reader-setting", JSON.stringify(state.readerSetting));
    },
    setReaderFontSize: (state, action: PayloadAction<number>) => {
      state.readerSetting.fontSize = action.payload;
      AsyncStorage.setItem("ho-dlo-reader-setting", JSON.stringify(state.readerSetting));
    },
    setReaderFontFamily: (state, action: PayloadAction<number>) => {
      state.readerSetting.fontFamily = action.payload;
      AsyncStorage.setItem("ho-dlo-reader-setting", JSON.stringify(state.readerSetting));
    },
    setReaderTheme: (state, action: PayloadAction<number>) => {
      state.readerSetting.theme = action.payload;
      AsyncStorage.setItem("ho-dlo-reader-setting", JSON.stringify(state.readerSetting));
    },
    // Audio Player Reducers
    setAudioPlayerState: (state, action: PayloadAction<Partial<AudioPlayerState>>) => {
      state.audioPlayer = { ...state.audioPlayer, ...action.payload };
    },
    setAudioPlayerPlaying: (state, action: PayloadAction<boolean>) => {
      state.audioPlayer.isPlaying = action.payload;
      if (action.payload) {
        state.audioPlayer.isPaused = false;
        state.audioPlayer.isStopped = false;
      }
    },
    setAudioPlayerPaused: (state, action: PayloadAction<boolean>) => {
      state.audioPlayer.isPaused = action.payload;
      if (action.payload) {
        state.audioPlayer.isPlaying = false;
        state.audioPlayer.isStopped = false;
      }
    },
    setAudioPlayerStopped: (state, action: PayloadAction<boolean>) => {
      state.audioPlayer.isStopped = action.payload;
      if (action.payload) {
        state.audioPlayer.isPlaying = false;
        state.audioPlayer.isPaused = false;
        state.audioPlayer.currentTime = 0;
      }
    },
    setAudioPlayerDuration: (state, action: PayloadAction<number>) => {
      state.audioPlayer.duration = action.payload;
    },
    setAudioPlayerCurrentTime: (state, action: PayloadAction<number>) => {
      state.audioPlayer.currentTime = action.payload;
    },
    setAudioPlayerVolume: (state, action: PayloadAction<number>) => {
      state.audioPlayer.volume = action.payload;
    },
    setAudioPlayerLoading: (state, action: PayloadAction<boolean>) => {
      state.audioPlayer.isLoading = action.payload;
    },
    setAudioPlayerError: (state, action: PayloadAction<string | null>) => {
      state.audioPlayer.error = action.payload;
    },
    resetAudioPlayer: (state) => {
      state.audioPlayer = {
        isPlaying: false,
        isPaused: false,
        isStopped: true,
        duration: 0,
        currentTime: 0,
        volume: 1.0,
        isLoading: false,
        error: null,
      };
    }
  },
});

export const {
  setCurrent,
  setCurrentVerse,
  setReadingProgress,
  clearCurrent,
  setReaderSetting,
  setReaderFontSize,
  setReaderFontFamily,
  setReaderTheme,
  setAudioPlayerState,
  setAudioPlayerPlaying,
  setAudioPlayerPaused,
  setAudioPlayerStopped,
  setAudioPlayerDuration,
  setAudioPlayerCurrentTime,
  setAudioPlayerVolume,
  setAudioPlayerLoading,
  setAudioPlayerError,
  resetAudioPlayer
} = readerSlice.actions;
export default readerSlice.reducer; 