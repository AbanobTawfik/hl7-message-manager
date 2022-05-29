import * as map from "./services/dictionary.ts"
import {read_file } from "./services/database.ts"
function Appt() {
    let dictionary = map.get_dictionary();
    map.load_dictionary_from_storage(read_file())
    // map.create_root()
    console.log(map.get_all_directory_names())
    // let root = get_directory_by_name('root')
    // add_directory(root, 'test')
    // let test = get_directory_by_name('root/test')
    // add_message(test, 'MH_MERLIN_RDS_ESI', ["MH_MONASH_ADT", "MH_MERLIN_RDS_ESI"], "testing dispense outbound message", "DISPENSED 10 || MSH||| BLA BLA BLA")
    // console.log(test)
    // console.log(get_directory_by_name('root'))
    // console.log(dictionary)
}

export default Appt
