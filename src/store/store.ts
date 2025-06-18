import { configureStore } from '@reduxjs/toolkit';
import deviceReducer from './slices/deviceSlice';
import readerReducer from './slices/readerSlice';

export const store = configureStore({
  reducer: {
    device: deviceReducer,
    reader: readerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 