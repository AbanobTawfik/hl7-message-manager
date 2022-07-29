import { createSlice, current } from "@reduxjs/toolkit"
import * as mapper from "../../services/dictionary.ts"
import * as dba from "../../services/database.ts"
import { enableMapSet } from 'immer';
import { stringify, parse } from 'circular-json'
import {toast} from 'react-toastify'
enableMapSet();
const toast_settings = {
    position: "top-center",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: 'dark'
  }
let initial_map = stringify(Array.from(dba.read_file().entries()));
const slice = createSlice({
    name: "map",
    initialState: {
        map_string: initial_map
    },
    reducers: {
        add_directory: (state, action) => {
            let map_to_use = new Map(parse(state.map_string))
            let check = mapper.add_directory(map_to_use, action.payload.parent_directory_path, action.payload.name);
            if(check.status){
                toast.dismiss()
                toast.success('Directory was added!', toast_settings);
                state.map_string = stringify(Array.from(check.map.entries()));
            }else{
                toast.dismiss()
                toast.error(check.message, toast_settings)
            }
        },

        add_message: (state, action) => {
            let map_to_use = new Map(parse(state.map_string))
            let check = mapper.add_message(map_to_use, action.payload.directory_path, action.payload.comserver, action.payload.scripts, action.payload.description, action.payload.raw_message, action.payload.notes)
            
            if(check.status){
                state.map_string = stringify(Array.from(check.map.entries()));
                toast.dismiss()
                toast.success('Message was added!', toast_settings);
            }else{
                toast.dismiss()
                toast.error(check.message, toast_settings)
            }
        },
        
        remove_directory: (state, action) => {
            let map_to_use = new Map(parse(state.map_string))
            let check = mapper.remove_directory(map_to_use, action.payload.directory_string);
            if(check.status){
                toast.dismiss()
                toast.success('Directory was removed!', toast_settings);
                state.map_string = stringify(Array.from(check.map.entries()));
            }else{
                toast.dismiss()
                toast.error(check.message, toast_settings)
            }
        },
        
        remove_message: (state, action) => {
            let map_to_use = new Map(parse(state.map_string))
            let check = mapper.remove_message(map_to_use, action.payload.message);
            if(check.status){
                toast.dismiss()
                toast.success('Message was removed!', toast_settings);
                state.map_string = stringify(Array.from(check.map.entries()));
            }else{
                toast.dismiss()
                toast.error(check.message, toast_settings)
            }
        },
        
        modify_directory: (state, action) => {
            let map_to_use = new Map(parse(state.map_string))
            console.log("BEFORE",map_to_use)
            console.log(action.payload)
            let check = mapper.modify_directory(map_to_use, action.payload.directory_string, action.payload.name);
            console.log("AFTER",check.map)
            if(check.status){
                toast.dismiss()
                toast.success('Directory changes saved!', toast_settings);
                state.map_string = stringify(Array.from(check.map.entries()));
            }else{
                toast.dismiss()
                toast.error(check.message, toast_settings)
            }
        },
        
        modify_message: (state, action) => {
            let map_to_use = new Map(parse(state.map_string))
            console.log(action.payload)
            let check = mapper.modify_message(map_to_use, action.payload.message, action.payload.raw_message, action.payload.comserver, action.payload.scripts, action.payload.description, action.payload.notes);
            if(check.status){
                toast.dismiss()
                toast.success('Message changes saved!', toast_settings);
                state.map_string = stringify(Array.from(check.map.entries()));
            }else{
                toast.dismiss()
                toast.error(check.message, toast_settings)
            }
        },
        
        load_ids: (state, action) => {
            let map_to_use = new Map(parse(state.map_string))
            let check = mapper.add_uids_to_everything(map_to_use);
            if(check.status){
                toast.dismiss()
                toast.warning('YOU SHOULD NOT BE USING THIS NAUGHTY!', toast_settings);
                state.map_string = stringify(Array.from(check.map.entries()));
            }else{
                toast.dismiss()
                toast.error(check.message, toast_settings)
            }
        },
    }
});

export const { load_ids, add_directory, add_message, remove_directory, remove_message, modify_directory, modify_message } = slice.actions;

export default slice.reducer;