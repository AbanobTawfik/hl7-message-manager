// @ts-ignore
import global_variables from "../globals/global_variables.ts";
import directory from "../types/directory";
import { stringify, parse } from "circular-json";
import * as mapper from "../services/dictionary";
let database_object: Map<number, directory>;

// only used on start up
export function read_file(): Map<number, directory> {
  // if file doesnt exist we will create it
  // @ts-ignore
  let data: string = window.localStorage.getItem(
    global_variables.dictionary_name
  );
  if (data == null || data == undefined || data === "" || data === "[]") {
    let write_object: any = new Map<number, directory>();
    let check = mapper.create_root(write_object);
    console.log(check.map);
    window.localStorage.setItem(
      global_variables.dictionary_name,
      stringify(Array.from(check.map))
    );
    window.localStorage.setItem(global_variables.current_directory, "root");
    return write_object;
  }

  database_object = new Map(parse(data));
  // console.log(database_object)

  return database_object;
}

// everytime you add/remove soemthing you need to recreate our database object
// link database object -> map, our map should store 2 json objects
// object 1. translation map
// object 2. dictionary map

// when we load the program on start up we want to INITIALISE our 2 json objects
// using this file, then any modification on these objects are WRITTEN into this database
// this is the safest way to write and not lose anything on an unfortunate crash!
// all calls of add/remove to dictionary should invoke this function absolutely
export function write_file(dictionary: Map<number, directory>): boolean {
  let object: any = {};
  object[global_variables.dictionary_name] = dictionary;
  console.log(dictionary);
  let write_output = stringify(Array.from(dictionary.entries()));
  window.localStorage.setItem(global_variables.dictionary_name, write_output);
  return true;
}

export function write_current_directory(directory: string) {
  window.localStorage.setItem(global_variables.current_directory, directory);
}

export function write_keys(key: string, value: string) {
  window.localStorage.setItem(key, value);
}

export function read_messages(value: any) {
  if (
    window.localStorage.getItem(global_variables.messages) == null ||
    window.localStorage.getItem(global_variables.messages) == undefined ||
    window.localStorage.getItem(global_variables.messages) == ""
  ) {
    window.localStorage.setItem(global_variables.messages, "[]");
  }
  return window.localStorage.getItem(global_variables.messages);
}

export function write_messages(value: any) {
  window.localStorage.setItem(global_variables.messages, JSON.stringify(value));
}

export function read_current_directory() {
  if (
    window.localStorage.getItem(global_variables.current_directory) == null ||
    window.localStorage.getItem(global_variables.current_directory) ==
      undefined ||
    window.localStorage.getItem(global_variables.current_directory) == ""
  ) {
    window.localStorage.setItem(global_variables.current_directory, "root");
  }
  return window.localStorage.getItem(global_variables.current_directory);
}

export function export_message_manager_string(): string {
  const current_directory = window.localStorage.getItem(
    global_variables.current_directory
  );
  const map = window.localStorage.getItem(global_variables.dictionary_name);
  const all_messages = window.localStorage.getItem(global_variables.messages);
  const filters = window.localStorage.getItem(global_variables.project_map);

  return JSON.stringify(
    {
      dictionary: map !== null && map !== undefined ? map : "{}",
      current_directory:
        current_directory !== null && current_directory !== undefined
          ? current_directory
          : "",
      project_map: filters !== null && filters !== undefined ? filters : "{}",
      messages:
        all_messages !== null && all_messages !== undefined
          ? all_messages
          : "{}",
    },
    null,
    4
  );
}

export function import_message_manager(value: any) {
  let imported_manager = JSON.parse(value, reviver);
  write_current_directory(imported_manager.current_directory);
  console.log(imported_manager);
  window.localStorage.setItem(
    global_variables.messages,
    imported_manager.messages
  );
  window.localStorage.setItem(
    global_variables.project_map,
    imported_manager.project_map
  );
  window.localStorage.setItem(
    global_variables.dictionary_name,
    imported_manager.dictionary
  );
}

function reviver(key, value) {
  if (typeof value === "object" && value !== null) {
    if (value.dataType === "Map") {
      return new Map(value.value);
    }
  }
  return value;
}
