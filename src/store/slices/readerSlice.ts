import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ReaderState {
    book: string;
    chapter: number;
    verse_id: number;
    verse: any;
}

const initialState: ReaderState = {
    book: '',
    chapter: 0,
    verse_id: 0,
    verse: null,
};

const readerSlice = createSlice({
  name: 'reader',
  initialState,
  reducers: {
    setVerse: (state, action: PayloadAction<any>) => {
      state.verse = action.payload;
    },
    clearVerse: (state) => {
      state.verse = null;
    },
  },
});

export const { setVerse, clearVerse } = readerSlice.actions;
export default readerSlice.reducer; 