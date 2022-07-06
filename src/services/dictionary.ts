import directory, { get_directory_name, get_path_from_root } from '../types/directory.ts'
import message from '../types/message.ts'
import return_status from '../types/return_status.ts'
import hasher from './hash.ts'
import { write_file } from "../services/database.ts"


let dictionary: Map<number, directory> = new Map<number, directory>()


// export default dictionary

export function get_dictionary(): Map<number, directory> {
    return dictionary
}

export function load_dictionary_from_storage(storage_object: Map<number, directory>) {
    dictionary = storage_object
}

export function get_directory_by_name(path: string): directory {
    let h: number = hasher.hash(path)
    return dictionary.get(h)
}

export function get_all_directory_names(): string[] {
    let directory_names: string[] = []
    for (let [key, value] of dictionary.entries()) {
        directory_names.push(get_path_from_root(value))
    }
    return directory_names;
}

export function create_root(): return_status {
    let root: directory = {
        parent_directory: null,
        sub_directories: [],
        name: "root",
        messages: [],
        type: 'directory'
    }
    let hash_value: number = hasher.hash(root)
    if (dictionary.has(hash_value)) {
        return { status: false, message: 'Root already exists' }
    }
    dictionary.set(hash_value, root)
    write_file(dictionary)
    return { status: true, message: 'Root created' }
}

export function add_directory(
    parent_directory: directory,
    name: string
): return_status {
    let add: directory = {
        parent_directory: parent_directory,
        sub_directories: [],
        name: name,
        messages: [],
        type: 'directory'
    }

    let hash_value: number = hasher.hash(add)
    if (dictionary.has(hash_value)) {
        return { status: false, message: 'Directory path already exists' }
    }
    // set the subdirectory of the parent to the new directory
    parent_directory.sub_directories.push(add)

    dictionary = dictionary.set(hash_value, add)
    write_file(dictionary)
    return { status: true, message: 'Success' }
}

export function add_message(
    directory: directory,
    comserver: string = "",
    scripts: string[] = [],
    description: string = "",
    raw_message: string
): return_status {
    // check if directory exists
    let hash_value_directory: number = hasher.hash(directory)
    if (!dictionary.has(hash_value_directory)) {
        return {
            status: false,
            message: 'attempting to add into an invalid directory!'
        }
    }
    let path: string = get_path_from_root(directory)
    let message_to_add: message = {
        raw_message: raw_message,
        comserver: comserver,
        description: description,
        scripts: scripts,
        directory_path: path,
        type: 'message'
    }
    // check if this message exists in this instance of the map
    if (directory.messages.filter(m => m.raw_message === message_to_add.raw_message).length > 0) {
        return { status: false, message: 'value already exists in this directory!' }
    }
    // add the message to the directory
    dictionary.get(hash_value_directory).messages.push(message_to_add)
    write_file(dictionary)
    return { status: true, message: 'value has been added into the directory!' }
}

export function remove_directory(directory: directory): return_status {
    let hash_value_directory: number = hasher.hash(directory)
    if (!dictionary.has(hash_value_directory)) {
        return { status: false, message: "directory doesn't exist!" }
    }
    let directory_index: number = directory.sub_directories.indexOf(directory)
    directory.messages = null
    // remove it from parent directory
    directory.parent_directory.sub_directories.splice(directory_index, 1)
    // remove it from all sub directories as parent
    directory.sub_directories.forEach(d => d.parent_directory = null)
    directory.sub_directories = null
    dictionary.delete(hash_value_directory)
    write_file(dictionary)
    return { status: true, message: 'directory has been removed!' }
}

export function remove_message(
    directory: directory,
    message: message
): return_status {
    let hash_value_directory: number = hasher.hash(directory)
    if (!dictionary.has(hash_value_directory)) {
        return { status: false, message: "directory doesn't exist!" }
    }

    let message_index: number = directory.messages.indexOf(message)
    if (message_index === -1) {
        return {
            status: false,
            message:
                "message you are trying to delete doesn't exist in the directory!"
        }
    }
    directory.messages.splice(message_index, 1)
    write_file(dictionary)
    return {
        status: true,
        message: 'message was deleted from the directory!'
    }
}

// modify the directory name, only allow name change!!!!!
export function modify_directory(
    directory: directory,
    name: string
): return_status {
    let hash_value_directory: number = hasher.hash(directory)
    if (!dictionary.has(hash_value_directory)) {
        return { status: false, message: "directory doesn't exist!" }
    }
    // just update the name of the directory and update the map to reflect this

    // keep track of old map values for this specific hash!
    let old_directory: directory = dictionary.get(hash_value_directory)
    // delete them since the hash will change!!!
    dictionary.delete(hash_value_directory)
    // modify directory
    old_directory.name = name;
    // compute new hash
    hash_value_directory = hasher.hash(old_directory)
    dictionary.set(hash_value_directory, old_directory)
    write_file(dictionary)
    return { status: true, message: 'changed name successfully!' }
}

// modify any aspect of the message you please
export function modify_message(
    directory: directory,
    message: message,
    raw_message: string = "",
    comserver: string = "",
    scripts: string[] = [],
    description: string = ""
): return_status {
    let hash_value_directory: number = hasher.hash(directory)
    if (!dictionary.has(hash_value_directory)) {
        return { status: false, message: "directory doesn't exist!" }
    }
    // try retrieve this message
    let message_index: number = directory.messages.indexOf(message)
    if (message_index === -1) {
        return {
            status: false,
            message:
                "message you are trying to delete doesn't exist in the directory!"
        }
    }
    // remove old unmodified message
    directory.messages.splice(message_index, 1)

    message.comserver = comserver == null ? message.comserver : comserver
    message.raw_message =
        raw_message == null ? message.raw_message : raw_message
    message.scripts = scripts == null ? message.scripts : scripts
    message.description =
        description == null ? message.description : description

    directory.messages.push(message)
    write_file(dictionary)

    return { status: true, message: 'message has been modified!' }
}

export function get_all_messages(directory: directory): message[] {
    let hash_value_directory: number = hasher.hash(directory)
    if (!dictionary.has(hash_value_directory)) {
        return []
    }
    return directory.messages
}

