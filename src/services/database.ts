import global_variables from '../globals/global_variables.ts'
import directory from '../types/directory'
import {stringify, parse} from 'circular-json'

let database_object:  Map<number, directory>

// only used on start up
export function read_file(): Map<number, directory> {
  // if file doesnt exist we will create it
  let data: string = window.localStorage.getItem(global_variables.dictionary_name)
  if (data == null) {
    let write_object: any = new Map<number, directory>()
    
    window.localStorage.setItem(global_variables.dictionary_name, stringify(Array.from(write_object)))
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
  let object:any = {}
  object[global_variables.dictionary_name] = dictionary
  let write_output = stringify(Array.from(dictionary.entries()))
  console.log(dictionary)
  window.localStorage.setItem(global_variables.dictionary_name, write_output)
  return true
}

export default database_object
