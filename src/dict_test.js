import * as map from "./services/dictionary.ts"
import {read_file } from "./services/database.ts"
function Appt() {
    let dictionary = map.get_dictionary();
    map.load_dictionary_from_storage(read_file())
    // map.create_root()
    // console.log(map.get_all_directory_names())
    // let root = map.get_directory_by_name('root')
    // map.add_directory(root, 'test')
    // let test = map.get_directory_by_name('root/test')
    // map.add_message(test, 'MH_MERLIN_RDS_ESI', ["MH_MONASH_ADT", "MH_MERLIN_RDS_ESI"], "testing dispense outbound message", "DISPENSED 10 || MSH||| BLA BLA BLA")
    // // console.log(test)
    // console.log(map.get_directory_by_name('root'))
    // // console.log(dictionary)
    // let messages = map.get_all_messages(test)
    // // console.log(messages[0])
    // map.modify_message(test, messages[0], "MODIFIED HL7 MESSAGE", "MODIFIED_MH_MERLIN_RDS_ESI", [], "MODIFIED DESCRIPOTION")
    // // map.remove_message(test, messages[0])
    // console.log(map.get_all_messages(test).length)
    // map.remove_directory(test)
    console.log(map.get_all_directory_names())
    console.log(map.get_dictionary())
}

export default Appt
