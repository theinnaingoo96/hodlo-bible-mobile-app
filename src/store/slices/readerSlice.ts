import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CurrentRead, ReaderSetting } from '../../types/reader';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    maxChapter: 0
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
      console.log('current reading set current verse => ', action.payload);
      
      state.currentRead.verseId = action.payload.verseId;
      state.currentRead.verseNumber = action.payload.verseNumber
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
        maxChapter: 0
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
    }
  },
});

export const { setCurrent, setCurrentVerse, clearCurrent, setReaderSetting, setReaderFontSize, setReaderFontFamily, setReaderTheme } = readerSlice.actions;
export default readerSlice.reducer; 