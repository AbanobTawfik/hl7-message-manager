// @ts-ignore
import global_variables from '../globals/global_variables.ts'
import directory from '../types/directory'
import { stringify, parse } from 'circular-json'
import * as mapper from '../services/dictionary.ts'
let database_object: Map<number, directory>

// only used on start up
export function read_file(): Map<number, directory> {
  // if file doesnt exist we will create it
  // @ts-ignore
  let data: string = window.localStorage.getItem(global_variables.dictionary_name)
  if (data == null || data ==="" || data === "[]") {
    let write_object: any = new Map<number, directory>()
    let check = mapper.create_root(write_object)
    console.log(check.map)
    window.localStorage.setItem(global_variables.dictionary_name, stringify(Array.from(check.map)))
    window.localStorage.setItem(global_variables.current_directory, "root")
    return write_object
  }

  database_object = new Map(parse(data))
  // console.log(database_object)

  return database_object
}

// everytime you add/remove soemthing you need to recreate our database object
// link database object -> map, our map should store 2 json objects
// object 1. translation map
// object 2. dictionary map

// when we load the program on start up we want to INITIALISE our 2 json objects
// using this file, then any modification on these objects are WRITTEN into this database
// this is the safest way to write and not lose anything on an unfortunate crash!
// all calls of add/remove to dictionary should invoke this function absolutely
export function write_file(
  dictionary: Map<number, directory>
): boolean {
  let object: any = {}
  object[global_variables.dictionary_name] = dictionary
  console.log(dictionary)
  let write_output = stringify(Array.from(dictionary.entries()))
  window.localStorage.setItem(global_variables.dictionary_name, write_output)
  return true
}

export function write_current_directory(directory: string) {
  window.localStorage.setItem(global_variables.current_directory, directory)
}

export function read_current_directory() {
  if (window.localStorage.getItem(global_variables.current_directory) == "" || window.localStorage.getItem(global_variables.current_directory) == null) {
    window.localStorage.setItem(global_variables.current_directory, "root")
  }
  return window.localStorage.getItem(global_variables.current_directory)
}
