import { configureStore } from "@reduxjs/toolkit";
import testReducer from './testSlice'
import themeReducer from './themeSlice'

export const store = configureStore({
    reducer: {
        test: testReducer,
        theme: themeReducer,
    },
});

