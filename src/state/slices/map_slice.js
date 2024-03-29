import { createSlice, current } from "@reduxjs/toolkit"
import * as mapper from "../../services/dictionary.ts"
import * as dba from "../../services/database.ts"
import { enableMapSet } from 'immer';
import { stringify, parse } from 'circular-json'
import {toast} from 'react-toastify'
import global_variables from '../../globals/global_variables'

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
let project_map = window.localStorage.getItem(global_variables.project_map)
if(project_map === undefined || project_map === null){
    project_map = "{}"
}
function replacer(key, value) {
  if (value instanceof Map) {
    return {
      dataType: "Map",
      value: Array.from(value.entries()), 
    };
  } else {
    return value;
  }
}


const slice = createSlice({
    name: "map",
    initialState: {
        map_string: initial_map,
        project_map_string: project_map
    },
    reducers: {
        add_directory: (state, action) => {
            let map_to_use = new Map(parse(state.map_string))
            let check = mapper.add_directory(map_to_use, action.payload.parent_directory_path, action.payload.name);
            if(check.status){
                toast.dismiss()
                toast.success('Directory was added!', toast_settings);
                state.map_string = stringify(Array.from(check.map.entries()));
                state.project_map_string = JSON.stringify(Array.from(mapper.map_project_to_script_comserver(check.map).entries()), replacer);
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
                state.project_map_string = JSON.stringify(Array.from(mapper.map_project_to_script_comserver(check.map).entries()), replacer);
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
                state.project_map_string = JSON.stringify(Array.from(mapper.map_project_to_script_comserver(check.map).entries()), replacer);
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
                state.project_map_string = JSON.stringify(Array.from(mapper.map_project_to_script_comserver(check.map).entries()), replacer);
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
                state.project_map_string = JSON.stringify(Array.from(mapper.map_project_to_script_comserver(check.map).entries()), replacer);
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
                state.project_map_string = JSON.stringify(Array.from(mapper.map_project_to_script_comserver(check.map).entries()), replacer);
            }else{
                toast.dismiss()
                toast.error(check.message, toast_settings)
            }
        },
        
        search_map: (state, action) => {
            let map_to_use = new Map(parse(state.map_string))
            let check = mapper.search(map_to_use, action.payload.search_query, action.payload.parent_directory);
            if(check.status){
                state.map_string = stringify(Array.from(check.map.entries()))
            }
        },
        
        search_filtered: (state, action) => {
            let map_to_use = new Map(parse(state.map_string))
            let check = mapper.search_filtered(map_to_use, action.payload.search_query,action.payload.comservers, action.payload.scripts, action.payload.parent_directory, action.payload.project);
            if(check.status){
                state.map_string = stringify(Array.from(check.map.entries())) 
            }
        },
        import_dictionary: (state, action) => {
            state.map_string = window.localStorage.getItem('dictionary')
        },
        move_message(state, action){
            let map_to_use = new Map(parse(state.map_string))
            let check = mapper.move_message(map_to_use, action.payload.message, action.payload.target);
            if(check.status){
                toast.dismiss()
                toast.success('Message was moved to ' + action.payload.target +'!', toast_settings);
                state.map_string = stringify(Array.from(check.map.entries()));
                state.project_map_string = JSON.stringify(Array.from(mapper.map_project_to_script_comserver(check.map).entries()), replacer);
            }else{
                toast.dismiss()
                toast.error(check.message, toast_settings)
            }
        },
        move_directory(state, action){
            let map_to_use = new Map(parse(state.map_string))
            let check = mapper.move_directory(map_to_use, action.payload.directory, action.payload.target);
            if(check.status){
                toast.dismiss()
                toast.success('Directory was moved to ' + action.payload.target +'!', toast_settings);
                state.map_string = stringify(Array.from(check.map.entries()));
                state.project_map_string = JSON.stringify(Array.from(mapper.map_project_to_script_comserver(check.map).entries()), replacer);
            }else{
                toast.dismiss()
                toast.error(check.message, toast_settings)
            }
        },
        copy_message(state, action){
            mapper.copy_message(action.payload.message);
            toast.dismiss()
            toast.success('Message is now copied, ready to be pasted!', toast_settings);
        },
        copy_directory(state, action){
            mapper.copy_directory(action.payload.directory);
            toast.dismiss()
            toast.success('Directory is now copied, ready to be pasted!', toast_settings);
        },
        paste_general(state, action){
            let map_to_use = new Map(parse(state.map_string))
            let check = mapper.paste_general(map_to_use);
            if(check.status){
                toast.dismiss()
                toast.success('Pasted!', toast_settings);
                state.map_string = stringify(Array.from(check.map.entries()));
                state.project_map_string = JSON.stringify(Array.from(mapper.map_project_to_script_comserver(check.map).entries()), replacer);
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
                state.comserver_script_map_string = stringify(Array.from(mapper.map_comserver_to_scripts(check.map).entries()));
                state.script_comserver_map_string = stringify(Array.from(mapper.map_scripts_to_comserver(check.map).entries())); 
            }else{
                toast.dismiss()
                toast.error(check.message, toast_settings)
            }
        },
    }
});

export const { load_ids, add_directory, add_message, remove_directory, 
               remove_message, modify_directory, modify_message, search_map, 
               search_filtered, import_dictionary, move_message, move_directory, 
               copy_message, copy_directory, paste_general } = slice.actions;

export default slice.reducer;