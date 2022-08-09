// @ts-ignore
import directory, {
  get_directory_name,
  get_path_from_root,
  get_parent_path_from_root
} from '../types/directory'
// @ts-ignore
import message from '../types/message.ts'
// @ts-ignore
import return_status from '../types/return_status.ts'
// @ts-ignore
import hasher from './hash.ts'
// @ts-ignore
import {
  write_file,
  write_keys,
  write_messages,
  read_messages
} from '../services/database.ts'
import { stringify, parse } from 'circular-json'
import { uid } from 'uid'
import Fuse from 'fuse.js'
import global_variables from '../globals/global_variables'
import { DRAFTABLE } from 'immer/dist/internal'

// passive
export function get_directory_by_name (
  dictionary: Map<number, directory>,
  path: string
): directory {
  let h: number = hasher.hash(path)
  return dictionary.get(h)
}

// passive
export function get_directory_path (directory: directory): string {
  return get_path_from_root(directory)
}

// passive
export function get_all_directory_names (
  dictionary: Map<number, directory>
): string[] {
  let directory_names: string[] = []
  for (let [key, value] of dictionary.entries()) {
    directory_names.push(get_path_from_root(value))
  }
  return directory_names
}

// modifiying
export function create_root (
  dictionary: Map<number, directory>
): return_status {
  let root: directory = {
    parent_directory: '',
    sub_directories: [],
    name: 'root',
    messages: [],
    type: 'directory',
    search_result: false,
    id: uid(32)
  }
  let hash_value: number = hasher.hash(root)
  if (dictionary.has(hash_value)) {
    return { map: dictionary, status: false, message: 'Root already exists' }
  }
  dictionary.set(hash_value, root)
  write_file(dictionary)
  write_messages([])
  return { map: dictionary, status: true, message: 'Root created' }
}

// modifying
export function add_directory (
  dictionary: Map<number, directory>,
  parent_directory_path: string,
  name: string
): return_status {
  let parent_directory = get_directory_by_name(
    dictionary,
    parent_directory_path
  )
  let add: directory = {
    parent_directory: parent_directory_path,
    sub_directories: [],
    name: name,
    messages: [],
    type: 'directory',
    search_result: false,
    id: uid(32)
  }

  let hash_value: number = hasher.hash(add)
  if (dictionary.has(hash_value)) {
    return {
      map: dictionary,
      status: false,
      message: 'Directory path already exists'
    }
  }
  // set the subdirectory of the parent to the new directory
  parent_directory.sub_directories.push(get_path_from_root(add))
  dictionary = dictionary.set(hash_value, add)
  // update parent too
  dictionary = dictionary.set(hasher.hash(parent_directory), parent_directory)
  write_file(dictionary)
  let messages_search = get_all_messages_global_searchable(dictionary)
  write_messages(messages_search)
  return { map: dictionary, status: true, message: 'Success' }
}

// modifying
export function add_message (
  dictionary: Map<number, directory>,
  directory_path: string,
  comserver: string = '',
  scripts: string[] = [],
  description: string = '',
  raw_message: string,
  notes: string = ''
): return_status {
  // check if directory exists
  let directory: directory = get_directory_by_name(dictionary, directory_path)

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
    type: 'message',
    notes: notes,
    id: uid(36)
  }
  // check if this message exists in this instance of the map

  if (
    directory_copy.messages.filter(
      m => m.description === message_to_add.description
    ).length > 0
  ) {
    return {
      map: dictionary,
      status: false,
      message: 'value already exists in this directory!'
    }
  }

  // add the message to the directory
  dictionary.get(hash_value_directory).messages.push(message_to_add)
  write_file(dictionary)
  let messages_search = get_all_messages_global_searchable(dictionary)
  write_messages(messages_search)
  return {
    map: dictionary,
    status: true,
    message: 'value has been added into the directory!'
  }
}

// modifying
export function remove_directory (
  dictionary: Map<number, directory>,
  directory_string: string
): return_status {
  let directory: directory = get_directory_by_name(dictionary, directory_string)
  let parent: directory = get_directory_by_name(
    dictionary,
    get_parent_path_from_root(directory)
  )
  let hash_value_directory: number = hasher.hash(directory)
  if (!dictionary.has(hash_value_directory)) {
    return {
      map: dictionary,
      status: false,
      message: "directory doesn't exist!"
    }
  }
  // deletion needs to occur downstream so first find out all directories to delete and remove from map
  let search_queue = [get_path_from_root(directory)]
  let visited = new Map<string, boolean>()
  while (search_queue.length > 0) {
    let curr_node = search_queue.pop()
    let curr_node_dir = get_directory_by_name(dictionary, curr_node)
    visited.set(curr_node, true)
    for (let i = 0; i < curr_node_dir.sub_directories.length; i++) {
      if (visited.has(curr_node_dir.sub_directories[i])) {
        continue
      }
      search_queue.push(curr_node_dir.sub_directories[i])
    }
  }
  // remove all directories we have visited
  // remove from parents sub directories list
  for (let [key, value] of visited) {
    let hash_key = hasher.hash(key)
    dictionary.get(hash_key).messages = null
    dictionary.delete(hash_key)
  }
  let directory_index: number = parent.sub_directories.indexOf(
    get_path_from_root(directory)
  )
  parent.sub_directories.splice(directory_index, 1)
  dictionary.set(hasher.hash(parent), parent)
  write_file(dictionary)
  let messages_search = get_all_messages_global_searchable(dictionary)
  write_messages(messages_search)
  return {
    map: dictionary,
    status: true,
    message: 'directory has been removed!'
  }
}

// modifying
export function remove_message (
  dictionary: Map<number, directory>,
  message: message
): return_status {
  let directory: directory = parse(
    stringify(get_directory_by_name(dictionary, message.directory_path))
  )
  let hash_value_directory: number = hasher.hash(directory)
  if (!dictionary.has(hash_value_directory)) {
    return {
      map: dictionary,
      status: false,
      message: "directory doesn't exist!"
    }
  }

  let new_messages = []
  let found = false
  for (let i = 0; i < directory.messages.length; i++) {
    if (
      directory.messages[i].comserver === message.comserver &&
      directory.messages[i].description === message.description &&
      JSON.stringify(directory.messages[i].scripts) ===
        JSON.stringify(message.scripts) &&
      directory.messages[i].raw_message === message.raw_message
    ) {
      found = true
      continue
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
  dictionary.set(hash_value_directory, directory)

  write_file(dictionary)
  let messages_search = get_all_messages_global_searchable(dictionary)
  write_messages(messages_search)
  return {
    map: dictionary,
    status: true,
    message: 'message was deleted from the directory!'
  }
}

// modifying
export function modify_directory (
  dictionary: Map<number, directory>,
  directory_path: string,
  name: string
): return_status {
  let directory: directory = get_directory_by_name(dictionary, directory_path)
  let parent: directory = get_directory_by_name(
    dictionary,
    get_parent_path_from_root(directory)
  )
  const old_path = get_path_from_root(directory)
  let hash_value_directory: number = hasher.hash(directory)
  if (!dictionary.has(hash_value_directory)) {
    return {
      map: dictionary,
      status: false,
      message: "Directory doesn't exist!"
    }
  }
  let hash_value_parent: number = hasher.hash(parent)
  directory.name = name
  let new_value_hash: number = hasher.hash(directory)
  const new_path = get_path_from_root(directory)
  if (dictionary.has(new_value_hash)) {
    return {
      map: dictionary,
      status: false,
      message: 'Name you are changing to already exists!'
    }
  }
  // since we are modifying (all dirs have only 1 parent we want to update the parents sub_directory list)
  let new_subs: directory[] = []
  for (let i = 0; i < parent.sub_directories.length; i++) {
    if (
      !dictionary.has(hasher.hash(parent.sub_directories[i])) ||
      hasher.hash(parent.sub_directories[i]) === hash_value_directory
    ) {
      continue
    }
    new_subs.push(parent.sub_directories[i])
  }

  new_subs.push(get_path_from_root(directory))

  parent.sub_directories = new_subs
  dictionary.set(hash_value_parent, parent)

  // fix all subdirectories downstream from CURRENT directory
  let search_queue = [old_path]
  let visited = new Map<string, boolean>()
  while (search_queue.length > 0) {
    let curr_node = search_queue.pop()
    let curr_node_dir = get_directory_by_name(dictionary, curr_node)
    let curr_node_dir_hash = hasher.hash(curr_node_dir)
    curr_node_dir.parent_directory = curr_node_dir.parent_directory.replace(
      old_path,
      new_path
    )
    // fix the messages path
    for (let i = 0; i < curr_node_dir.messages.length; i++) {
      curr_node_dir.messages[i].directory_path = curr_node_dir.messages[
        i
      ].directory_path.replace(old_path, new_path)
    }
    visited.set(curr_node, true)
    for (let i = 0; i < curr_node_dir.sub_directories.length; i++) {
      if (visited.has(curr_node_dir.sub_directories[i])) {
        continue
      }
      search_queue.push(curr_node_dir.sub_directories[i])
    }
    // fix subs
    for (let i = 0; i < curr_node_dir.sub_directories.length; i++) {
      curr_node_dir.sub_directories[i] = curr_node_dir.sub_directories[
        i
      ].replace(old_path, new_path)
    }
    // recompute hash for the curr_node_dir since its changed parent
    dictionary.delete(curr_node_dir_hash)
    dictionary.set(hasher.hash(curr_node_dir), curr_node_dir)
  }

  dictionary.delete(hash_value_directory)
  dictionary.set(new_value_hash, directory)

  write_file(dictionary)
  let messages_search = get_all_messages_global_searchable(dictionary)
  write_messages(messages_search)
  return {
    map: dictionary,
    status: true,
    message: 'changed name successfully!'
  }
}

// modifying
export function modify_message (
  dictionary: Map<number, directory>,
  message: message,
  raw_message: string = '',
  comserver: string = '',
  scripts: string[] = [],
  description: string = '',
  notes: string = ''
): return_status {
  let message_copy: message = parse(stringify(message))
  let directory: directory = parse(
    stringify(get_directory_by_name(dictionary, message_copy.directory_path))
  )
  let hash_value_directory: number = hasher.hash(directory)
  if (!dictionary.has(hash_value_directory)) {
    return {
      map: dictionary,
      status: false,
      message: "directory doesn't exist!"
    }
  }
  // try retrieve this message
  let new_messages = []
  let found = false
  for (let i = 0; i < directory.messages.length; i++) {
    if (
      directory.messages[i].comserver === message.comserver &&
      directory.messages[i].description === message.description &&
      JSON.stringify(directory.messages[i].scripts) ===
        JSON.stringify(message.scripts) &&
      directory.messages[i].raw_message === message.raw_message &&
      directory.messages[i].notes === message.notes
    ) {
      found = true
      continue
    }
    if (directory.messages[i].description === description) {
      return {
        map: dictionary,
        status: false,
        message: 'Cannot rename to exisiting directory name!'
      }
    }
    // @ts-ignore
    new_messages.push(directory.messages[i])
  }
  if (!found) {
    return {
      map: dictionary,
      status: false,
      message:
        "message you are trying to modify doesn't exist in the directory!"
    }
  }
  // remove old unmodified message
  directory.messages = [...new_messages]
  message_copy.comserver = comserver == '' ? message.comserver : comserver
  message_copy.raw_message =
    raw_message == '' ? message.raw_message : raw_message
  message_copy.scripts = scripts.length === 0 ? message.scripts : scripts
  message_copy.notes = '' ? message.notes : notes
  message_copy.description =
    description == '' ? message.description : description
  message_copy.id = message.id
  directory.messages.push(message_copy)
  dictionary.set(hash_value_directory, directory)
  write_file(dictionary)
  let messages_search = get_all_messages_global_searchable(dictionary)
  write_messages(messages_search)
  return {
    map: dictionary,
    status: true,
    message: 'message has been modified!'
  }
}

// modifying
export function search (
  dictionary: Map<number, directory>,
  search_query: string,
  parent_directory: string
): return_status {
  // step 1 need to get all messages
  let search_dir: directory = {
    parent_directory: parent_directory,
    sub_directories: [],
    name: 'Search Results',
    messages: [],
    type: 'directory',
    id: uid(32),
    search_result: true
  }

  let hash_value: number = hasher.hash(search_dir)
  let all_messages = JSON.parse(read_messages())
  const options = {
    keys: ['combined_keys'],
    includeScore: true,
    ignoreLocation: true,
    threshold: 0.35,
    distance: search_query.length + 20
  }
  console.log(all_messages)
  const fuse = new Fuse(all_messages, options)
  let results = fuse.search(search_query)
  let item_results: message[] = []
  for (let i = 0; i < results.length; i++) {
    let message_item = results[i].item
    item_results.push({
      comserver: message_item.comserver,
      description: message_item.description,
      scripts: message_item.scripts,
      raw_message: message_item.raw_message,
      notes: message_item.notes,
      directory_path: message_item.directory_path,
      type: message_item.type,
      id: message_item.id
    })
  }
  console.log(item_results)
  // step 3 create new "Search Result Directory"
  search_dir.messages = item_results
  console.log(search_dir)
  dictionary.set(hash_value, search_dir)

  return {
    map: dictionary,
    status: true,
    message: 'search returned!'
  }
}

// modifying
export function search_filtered (
  dictionary: Map<number, directory>,
  search_query: string,
  comserver: string,
  scripts: string
): return_status {
  // step 1 need to get all messages qualified on this filter!!!!!!!!!!!!
}

// passive
export function get_all_messages (
  dictionary: Map<number, directory>,
  directory: directory
): message[] {
  let hash_value_directory: number = hasher.hash(directory)
  if (!dictionary.has(hash_value_directory)) {
    return []
  }
  return directory.messages
}

// passive
export function get_all_directories_from_current (
  dictionary: Map<number, directory>,
  name: string
): directory[] {
  let hash_value_directory: number = hasher.hash(name)
  if (!dictionary.has(hash_value_directory)) {
    return []
  }
  let all_dirs_from_current: directory[] = []
  let subs = dictionary.get(hash_value_directory).sub_directories
  for (let i = 0; i < subs.length; i++) {
    all_dirs_from_current.push(get_directory_by_name(dictionary, subs[i]))
  }
  return all_dirs_from_current
}

// add uids only need to ever do this once and now
export function add_uids_to_everything (dictionary: Map<number, directory>) {
  for (let [key, value] of dictionary) {
    let entry_copy: directory = parse(stringify(value))
    entry_copy.id = uid(32)

    for (let i = 0; i < entry_copy.messages.length; i++) {
      entry_copy.messages[i].id = uid(32)
    }
    dictionary.set(key, entry_copy)
  }

  write_file(dictionary)
  return {
    map: dictionary,
    status: true,
    message: 'message has been modified!'
  }
}

// passive
export function map_scripts_to_comserver (
  dictionary: Map<string, directory>
): Map<string, string[]> {
  let ret: Map<string, string[]> = new Map<string, string[]>()
  for (let [key, value] of dictionary) {
    for (let i = 0; i < value.messages.length; i++) {
      for (let j = 0; j < value.messages[i].scripts.length; j++) {
        if (value.messages[i].scripts[j].trim() === '') {
          continue
        }
        if (ret.has(value.messages[i].scripts[j].trim())) {
          let new_vals = ret.get(value.messages[i].scripts[j].trim())
          if (new_vals?.indexOf(value.messages[i].comserver.trim()) === -1) {
            new_vals.push(value.messages[i].comserver.trim())
            ret.set(value.messages[i].scripts[j].trim(), new_vals)
          }
        } else {
          ret.set(value.messages[i].scripts[j].trim(), [
            value.messages[i].comserver.trim()
          ])
        }
      }
    }
  }
  write_keys(
    global_variables.script_comserver_map,
    stringify(Array.from(ret.entries()))
  )
  return ret
}

// passive
export function map_comserver_to_scripts (
  dictionary: Map<string, directory>
): Map<string, string[]> {
  let ret: Map<string, string[]> = new Map<string, string[]>()
  for (let [key, value] of dictionary) {
    for (let i = 0; i < value.messages.length; i++) {
      if (value.messages[i].comserver.trim() === '') {
        continue
      }
      if (ret.has(value.messages[i].comserver.trim())) {
        let new_vals = ret.get(value.messages[i].comserver.trim())
        for (let j = 0; j < value.messages[i].scripts.length; j++) {
          if (
            value.messages[i].scripts[j].trim() === '' ||
            new_vals.indexOf(value.messages[i].scripts[j].trim()) !== -1
          ) {
            continue
          }
          new_vals?.push(value.messages[i].scripts[j].trim())
        }
        ret.set(value.messages[i].comserver.trim(), new_vals)
      } else {
        let new_vals = []
        for (let j = 0; j < value.messages[i].scripts.length; j++) {
          if (
            value.messages[i].scripts[j].trim() === '' ||
            new_vals.indexOf(value.messages[i].scripts[j].trim()) !== -1
          ) {
            continue
          }
          new_vals?.push(value.messages[i].scripts[j].trim())
        }
        ret.set(value.messages[i].comserver.trim(), new_vals)
      }
    }
  }
  write_keys(
    global_variables.comserver_script_map,
    stringify(Array.from(ret.entries()))
  )
  return ret
}

// passive
export function get_all_messages_global_searchable (
  dictionary: Map<number, directory>
): message[] {
  let all_messages: message[] = []
  console.log('HI')
  for (let [key, value] of dictionary) {
    if (value.search_result !== undefined && value.search_result !== true)
      all_messages.push(...value.messages)
  }
  all_messages = all_messages.map(elm => ({
    ...elm,
    combined_keys:
      elm.raw_message +
      ' ' +
      elm.notes +
      ' ' +
      elm.scripts.toString() +
      ' ' +
      elm.comserver +
      ' ' +
      elm.description
  }))
  console.log(all_messages)
  return all_messages
}

// modifying
export function fix_directories (
  dictionary: Map<number, directory>
): Map<number, directory> {
  for (let [key, value] of dictionary) {
    let new_val = value
    new_val.search_result = false
    dictionary.set(key, new_val)
  }
  return dictionary
}
