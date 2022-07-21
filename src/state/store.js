import { configureStore } from "@reduxjs/toolkit"
import current_directory_reducer from "./slices/current_directory_slice.js"
import map_reducer from "./slices/map_slice.js"
import { getDefaultMiddleware } from '@reduxjs/toolkit';

const customizedMiddleware = getDefaultMiddleware({
  serializableCheck: false
})
const store = configureStore({
    reducer: {
        map: map_reducer,
        current_directory: current_directory_reducer
    },
    middleware: customizedMiddleware
    
})

export default store;