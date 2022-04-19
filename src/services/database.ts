import fs from 'fs'
import global_variables from '../globals/global_variables'
import directory from '../types/directory'
import message from '../types/message'

let database: string
let database_object: any

// only used on start up
export function read_file (): any {
  // if file doesnt exist we will create it
  if (!fs.existsSync(global_variables.database_path)) {
    let dictionary_name = global_variables.dictionary_name
    let translation_name = global_variables.translation_name
    let write_object: any = {
      dictionary_name: new Map<number, Map<number, message>>(),
      translation_name: new Map<number, directory>()
    }

    fs.writeFileSync(global_variables.database_path, JSON.parse(write_object))
    return write_object
  }
  let data: string = fs.readFileSync(global_variables.database_path, 'utf-8')
  database_object = JSON.parse(data)

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
export function write_file (
  dictionary: Map<number, Map<number, message>>,
  translation: Map<number, directory>
): boolean {
  let translation_name = global_variables.translation_name
  let dictionary_name = global_variables.dictionary_name

  let write_object = {
    dictionary_name: dictionary,
    translation_name: translation
  }

  let write_output = JSON.stringify(write_object)
  // write to a temp file first
  try {
    fs.writeFileSync(global_variables.tmp_database_path, write_output)
    // delete old file
    fs.unlinkSync(global_variables.database_path)
    // rename to new file
    fs.renameSync(
      global_variables.tmp_database_path,
      global_variables.database_path
    )
  } catch (err) {
    console.error(err)
  }

  return true
}

export default database_object
