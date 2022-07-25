// @ts-ignore
import directory, { get_directory_name, get_path_from_root } from '../types/directory.ts'
// @ts-ignore
import message from '../types/message.ts'
// @ts-ignore
import return_status from '../types/return_status.ts'
// @ts-ignore
import hasher from './hash.ts'
// @ts-ignore
import { write_file } from "../services/database.ts"
import { stringify, parse } from 'circular-json'

// passive
export function get_directory_by_name(dictionary: Map<number, directory>, path: string): directory {
    // console.log("DICTDICTDICT", dictionary, "\n\n\n")
    let h: number = hasher.hash(path)
    return dictionary.get(h)
}

// passive
export function get_directory_path(directory: directory): string {
    return get_path_from_root(directory);
}

// passive
export function get_all_directory_names(dictionary: Map<number, directory>): string[] {
    let directory_names: string[] = []
    for (let [key, value] of dictionary.entries()) {
        directory_names.push(get_path_from_root(value))
    }
    return directory_names;
}

// modifiying
export function create_root(dictionary: Map<number, directory>): return_status {
    let root: directory = {
        parent_directory: null,
        sub_directories: [],
        name: "root",
        messages: [],
        type: 'directory'
    }
    let hash_value: number = hasher.hash(root)
    if (dictionary.has(hash_value)) {
        return { map: dictionary, status: false, message: 'Root already exists' }
    }
    let map_copy = new Map<number, directory>(dictionary)
    map_copy.set(hash_value, root)
    write_file(map_copy)
    return { map: map_copy, status: true, message: 'Root created' }
}

// modifying
export function add_directory(
    dictionary: Map<number, directory>,
    parent_directory: directory,
    name: string
): return_status {
    let parent_directory_copy = parse(stringify(parent_directory))
    let add: directory = {
        parent_directory: parent_directory_copy,
        sub_directories: [],
        name: name,
        messages: [],
        type: 'directory'
    }

    let hash_value: number = hasher.hash(add)
    if (dictionary.has(hash_value)) {
        return { map: dictionary, status: false, message: 'Directory path already exists' }
    }
    let map_copy = new Map<number, directory>(dictionary)
    // set the subdirectory of the parent to the new directory
    parent_directory_copy.sub_directories.push(add)

    map_copy = map_copy.set(hash_value, add)
    write_file(map_copy)
    return { map: map_copy, status: true, message: 'Success' }
}

// modifying
export function add_message(
    dictionary: Map<number, directory>,
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
            map: dictionary,
            status: false,
            message: 'attempting to add into an invalid directory!'
        }
    }
    let directory_copy = parse(stringify(directory))

    let path: string = get_path_from_root(directory_copy)
    let message_to_add: message = {
        raw_message: raw_message,
        comserver: comserver,
        description: description,
        scripts: scripts,
        directory_path: path,
        type: 'message'
    }
    // check if this message exists in this instance of the map
    if (directory_copy.messages.filter(m => m.raw_message === message_to_add.raw_message).length > 0) {
        return { map: dictionary, status: false, message: 'value already exists in this directory!' }
    }
    let map_copy = new Map<number, directory>(dictionary)

    // add the message to the directory
    map_copy.get(hash_value_directory).messages.push(message_to_add)
    write_file(map_copy)
    return { map: map_copy, status: true, message: 'value has been added into the directory!' }
}

// modifying
export function remove_directory(dictionary: Map<number, directory>, directory: directory): return_status {
    let hash_value_directory: number = hasher.hash(directory)
    if (!dictionary.has(hash_value_directory)) {
        return { map: dictionary, status: false, message: "directory doesn't exist!" }
    }
    let directory_copy = parse(stringify(directory))
    let directory_index: number = directory_copy.sub_directories.indexOf(directory_copy)
    directory_copy.messages = null
    // remove it from parent directory
    directory_copy.parent_directory.sub_directories.splice(directory_index, 1)
    // remove it from all sub directories as parent
    directory_copy.sub_directories.forEach(d => d.parent_directory = null)
    directory_copy.sub_directories = null
    let map_copy = new Map<number, directory>(dictionary)
    map_copy.delete(hash_value_directory)
    write_file(map_copy)
    return { map: map_copy, status: true, message: 'directory has been removed!' }
}

// modifying
export function remove_message(
    dictionary: Map<number, directory>,
    directory: directory,
    message: message
): return_status {
    let hash_value_directory: number = hasher.hash(directory)
    if (!dictionary.has(hash_value_directory)) {
        return { map: dictionary, status: false, message: "directory doesn't exist!" }
    }

    let message_index: number = directory.messages.indexOf(message)
    if (message_index === -1) {
        return {
            map: dictionary,
            status: false,
            message:
                "message you are trying to delete doesn't exist in the directory!"
        }
    }
    let directory_copy = parse(stringify(directory))
    let map_copy = new Map<number, directory>(dictionary)

    directory_copy.messages.splice(message_index, 1)
    map_copy[hash_value_directory] = directory_copy
    write_file(map_copy)
    return {
        map: map_copy,
        status: true,
        message: 'message was deleted from the directory!'
    }
}

// modifying
export function modify_directory(
    dictionary: Map<number, directory>,
    directory: directory,
    name: string
): return_status {
    let hash_value_directory: number = hasher.hash(directory)
    if (!dictionary.has(hash_value_directory)) {
        return { map: dictionary, status: false, message: "directory doesn't exist!" }
    }
    let directory_copy: directory = parse(stringify(directory))
    directory_copy.name = name
    let map_copy = new Map<number, directory>(dictionary)

    // delete them since the hash will change!!!
    map_copy.delete(hash_value_directory)
    // compute new hash
    hash_value_directory = hasher.hash(directory_copy)
    map_copy.set(hash_value_directory, directory_copy)
    write_file(map_copy)
    return { map: map_copy, status: true, message: 'changed name successfully!' }
}

// modifying
export function modify_message(
    dictionary: Map<number, directory>,
    message: message,
    raw_message: string = "",
    comserver: string = "",
    scripts: string[] = [],
    description: string = ""
): return_status {
    console.log(dictionary)
    let map_copy = new Map<number, directory>(dictionary)
    let message_copy: message = parse(stringify(message))
    let directory: directory = parse(stringify(get_directory_by_name(map_copy, message_copy.directory_path)))
    console.log(directory)
    let hash_value_directory: number = hasher.hash(directory)
    if (!map_copy.has(hash_value_directory)) {
        return { map: dictionary, status: false, message: "directory doesn't exist!" }
    }
    let same_message = (message.comserver === comserver) 
    // try retrieve this message
    let new_messages = []
    let found = false;
    for (let i = 0; i < directory.messages.length; i++) {
        if (directory.messages[i].comserver === message.comserver &&
            directory.messages[i].description === message.description &&
            JSON.stringify(directory.messages[i].scripts) === JSON.stringify(message.scripts) &&
            directory.messages[i].raw_message === message.raw_message) {
            found = true
            continue;
        }
        // @ts-ignore
        new_messages.push(directory.messages[i])
    }
    if (!found) {
        return {
            map: dictionary,
            status: false,
            message:
                "message you are trying to delete doesn't exist in the directory!"
        }
    }
    // remove old unmodified message
    directory.messages = [...new_messages]
    message_copy.comserver = comserver == null ? message.comserver : comserver
    message_copy.raw_message =
        raw_message == null ? message.raw_message : raw_message
    message_copy.scripts = scripts == null ? message.scripts : scripts
    message_copy.description =
        description == null ? message.description : description
    directory.messages.push(message_copy)
    map_copy.set(hash_value_directory, directory) 
    write_file(map_copy)
    return { map: map_copy, status: true, message: 'message has been modified!' }
}

// passive
export function get_all_messages(dictionary: Map<number, directory>, directory: directory): message[] {
    let hash_value_directory: number = hasher.hash(directory)
    if (!dictionary.has(hash_value_directory)) {
        return []
    }
    return directory.messages
}

// passive
export function get_all_directories_from_current(dictionary: Map<number, directory>, name: string): directory[] {
    let hash_value_directory: number = hasher.hash(name)
    if (!dictionary.has(hash_value_directory)) {
        return [];
    }
    return dictionary.get(hash_value_directory).sub_directories;
}