import { createSlice } from "@reduxjs/toolkit"
import * as dba from "../../services/database.ts"

let current_directory_path = dba.read_current_directory();


const slice = createSlice({
    name:"current_directory",
    initialState: {
        path: current_directory_path
    },
    reducers:{
        change_current_directory: (state, action) => {
            dba.write_current_directory(action.payload);
            state.path = action.payload
        },
        change_current_directory_no_save:  (state, action) => {
            state.path = action.payload
        },
    }
});

export const {change_current_directory, change_current_directory_no_save} = slice.actions;

export default slice.reducer;