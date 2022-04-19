import fs from 'fs'
import global_variables from '../globals/global_variables'

let database: string
let database_object: any

export function read_file (path: string): boolean {
  fs.readFile('/Users/joe/test.txt', 'utf8', (err, data) => {
    if (err) {
      console.error(err)
      return false
    }
    database = data
    database_object = JSON.parse(database)
  })
  return true
}

// everytime you add soemthing you need to recreate our database object
export function write_file (path: string, json_object: any) {}

export default database_object
