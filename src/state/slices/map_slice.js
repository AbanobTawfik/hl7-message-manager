import { createSlice, current } from "@reduxjs/toolkit"
import * as mapper from "../../services/dictionary.ts"
import * as dba from "../../services/database.ts"
import { enableMapSet } from 'immer';
import { stringify, parse } from 'circular-json'

enableMapSet();
let initial_map = stringify(Array.from(dba.read_file().entries()));
console.log("map",initial_map)
const slice = createSlice({
    name: "map",
    initialState: {
        map_string: initial_map
    },
    reducers: {
        add_directory: (state, action) => {
            let check = mapper.add_directory(parse(current(state.map)), action.payload.parent_directory, action.payload.name);
            if(check.status){
                return stringify(Array.from(check.map.entries()));
            }
        },

        add_message: (state, action) => {
            let check = mapper.add_message(parse(current(state.map)), action.payload.directory, action.payload.comserver, action.scripts, action.payload.description, action.payload.raw_message)
            if(check.status){
                return stringify(Array.from(check.map.entries()));
            }
        },
        
        remove_directory: (state, action) => {
            let check = mapper.remove_directory(parse(current(state.map)), action.payload.directory);
            if(check.status){
                return stringify(Array.from(check.map.entries()));
            }
        },
        
        remove_message: (state, action) => {
            let check = mapper.remove_message(parse(current(state.map)), action.payload.directory, action.payload.message);
            if(check.status){
                return stringify(Array.from(check.map.entries()));
            }
        },
        
        modify_directory: (state, action) => {
            let map_to_use = new Map(parse(state.map_string))
            let check = mapper.modify_directory(parse(current(state.map)), action.payload.directory, action.payload.name);
            if(check.status){
                return stringify(Array.from(check.map.entries()));
            }
        },
        
        modify_message: (state, action) => {
            let map_to_use = new Map(parse(state.map_string))
            let check = mapper.modify_message(map_to_use, action.payload.message, action.payload.raw_message, action.payload.comserver, action.payload.scripts, action.payload.description);
            if(check.status){
                console.log(check)
                state.map_string = stringify(Array.from(check.map.entries()));
            }
        },
    }
});

export const { add_directory, add_message, remove_directory, remove_message, modify_directory, modify_message } = slice.actions;

export default slice.reducer;