import { createSlice, current } from "@reduxjs/toolkit"
import * as mapper from "../../services/dictionary.ts"
import * as dba from "../../services/database.ts"
import { enableMapSet } from 'immer';
import { stringify, parse } from 'circular-json'

enableMapSet();
mapper.load_dictionary_from_storage(dba.read_file());
let initial_map = mapper.get_dictionary();
const slice = createSlice({
    name: "map",
    initialState: {
        map: initial_map
    },
    reducers: {
        add_directory: (state, action) => {
            let check = mapper.add_directory(action.payload.parent_directory, action.payload.name);
            if(check.status){
                state.map = parse(stringify(mapper.get_dictionary()));
            }
        },

        add_message: (state, action) => {
            let check = mapper.add_message(action.payload.directory, action.payload.comserver, action.scripts, action.payload.description, action.payload.raw_message)
            if(check.status){
                state.map = parse(stringify(mapper.get_dictionary()));
            }
        },
        
        remove_directory: (state, action) => {
            let check = mapper.remove_directory(action.payload.directory);
            if(check.status){
                state.map = mapper.get_dictionary();
            }
        },
        
        remove_message: (state, action) => {
            let check = mapper.remove_message(action.payload.directory, action.payload.message);
            if(check.status){
                state.map = mapper.get_dictionary();
            }
        },
        
        modify_directory: (state, action) => {
            let check = mapper.modify_directory(action.payload.directory, action.payload.name);
            if(check.status){
                return mapper.get_dictionary();
            }
        },
        
        modify_message: (state, action) => {
            console.log(mapper)
            console.log(current(state))
            console.log(state)
            let check = mapper.modify_message(action.payload.message, action.payload.raw_message, action.payload.comserver, action.payload.scripts, action.payload.description);
            if(check.status){
                return mapper.get_dictionary();
            }
        },
    }
});

export const { add_directory, add_message, remove_directory, remove_message, modify_directory, modify_message } = slice.actions;

export default slice.reducer;