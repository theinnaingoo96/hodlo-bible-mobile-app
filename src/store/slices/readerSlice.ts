import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CurrentRead } from '../../types/reader';

interface ReaderState {
  currentRead: CurrentRead;
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
};

const readerSlice = createSlice({
  name: 'reader',
  initialState,
  reducers: {
    setCurrent: (state, action: PayloadAction<CurrentRead>) => {
      state.currentRead = action.payload;
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
    },
  },
});

export const { setCurrent, clearCurrent } = readerSlice.actions;
export default readerSlice.reducer; 