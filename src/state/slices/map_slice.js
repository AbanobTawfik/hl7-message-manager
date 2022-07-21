import { createSlice } from "@reduxjs/toolkit"
import * as map from "../../services/dictionary.ts"
import * as dba from "../../services/database.ts"
import { enableMapSet } from 'immer';

enableMapSet();
map.load_dictionary_from_storage(dba.read_file());
let initial_map = map.get_dictionary();
const slice = createSlice({
    name: "map",
    initialState: {
        map: initial_map
    },
    reducers: {
        add_directory: (state, action) => {
            let check = map.add_directory(action.payload.parent_directory, action.payload.name);
            if(check.status){
                state.map = map.get_dictionary();
            }
        },

        add_message: (state, action) => {
            let check = map.add_message(action.payload.directory, action.payload.comserver, action.scripts, action.payload.description, action.payload.raw_message)
            if(check.status){
                state.map = map.get_dictionary();
            }
        },
        
        remove_directory: (state, action) => {
            let check = map.remove_directory(action.payload.directory);
            if(check.status){
                state.map = map.get_dictionary();
            }
        },
        
        remove_message: (state, action) => {
            let check = map.remove_message(action.payload.directory, action.payload.message);
            if(check.status){
                state.map = map.get_dictionary();
            }
        },
        
        modify_directory: (state, action) => {
            let check = map.modify_directory(action.payload.directory, action.payload.name);
            if(check.status){
                state.map = map.get_dictionary();
            }
        },
        
        modify_message: (state, action) => {
            let check = map.modify_message(action.payload.directory, action.payload.message, action.payload.raw_message, action.payload.comserver, action.payload.scripts, action.payload.description);
            if(check.status){
                state.map = map.get_dictionary();
            }
        },
    }
});

export const { add_directory, add_message, remove_directory, remove_message, modify_directory, modify_message } = slice.actions;

export default slice.reducer;