import directory from '../types/directory'
import message from '../types/message'
import return_status from '../types/return_status'
import hasher from './hash'

let translation: Map<number, directory> = new Map<number, directory>()
let dictionary: Map<number, Map<number, message>> = new Map<
  number,
  Map<number, message>
>()

export default dictionary

export function add_directory (
  subdirectory: directory = null,
  messages: message[] = null,
  name: string
): return_status {
  let add: directory = {
    subdirectory: subdirectory,
    messages: messages,
    name: name
  }
  let hash_value: number = hasher.hash(add)
  if (translation.has(hash_value)) {
    return { status: false, message: 'Directory already exists' }
  }

  translation = translation.set(hash_value, add)
  dictionary = dictionary.set(hash_value, new Map<number, message>())
  // iterate over the messages in the directory if they exist and add them to the map
  if (messages != null && messages != []) {
    for (let i = 0; i < messages.length; i++) {
      let hash = hasher.hash(messages[i])
      dictionary.get(hash_value).set(hash, messages[i])
    }
  }
  return { status: true, message: 'Success' }
}

export function add_message (
  directory: directory,
  comserver: string = null,
  scripts: string[] = null,
  raw_message: string
): return_status {
  // check if directory exists
  let hash_value_directory = hasher.hash(directory)
  if (!translation.has(hash_value_directory)) {
    return {
      status: false,
      message: 'attempting to add into an invalid directory!'
    }
  }
  let message_to_add: message = {
    raw_message: raw_message,
    comserver: comserver,
    scripts: scripts
  }
  // check if this message exists in this instance of the map
  let hash_value_message = hasher.hash(message_to_add)
  if (dictionary.get(hash_value_directory).has(hash_value_message)) {
    return { status: false, message: 'value already exists in this directory!' }
  }
  // add the message to the map
  dictionary.get(hash_value_directory).set(hash_value_message, message_to_add)
  return { status: true, message: 'value has been added into the directory!' }
}

export function remove_directory (directory: directory): return_status {
  let hash_value_directory = hasher.hash(directory)
  if (!translation.has(hash_value_directory)) {
    return { status: false, message: "directory doesn't exist!" }
  }
  translation.delete(hash_value_directory)
  dictionary.delete(hash_value_directory)
  return { status: true, message: 'directory has been removed!' }
}

export function remove_message (
  directory: directory,
  message: message
): return_status {
  let hash_value_directory = hasher.hash(directory)
  if (!translation.has(hash_value_directory)) {
    return { status: false, message: "directory doesn't exist!" }
  }
  let directory_map = dictionary.get(hash_value_directory)
  let hash_value_message = hasher.hash(message)
  if (!directory_map.get(hash_value_message)) {
    return {
      status: false,
      message:
        "message you are trying to delete doesn't exist in the directory!"
    }
  }
  dictionary.get(hash_value_message).delete(hash_value_message)
  return {
    status: true,
    message: 'message was deleted from the directory!'
  }
}

// modify the directory name, only allow name change!!!!!
export function modify_directory (
  directory: directory,
  name: string
): return_status {
  let hash_value_directory = hasher.hash(directory)
  if (!translation.has(hash_value_directory)) {
    return { status: false, message: "directory doesn't exist!" }
  }
  // keep track of old map values for this specific hash!
  let old_directory = translation.get(hash_value_directory)
  let old_message_map = dictionary.get(hash_value_directory)
  // delete them since the hash will change!!!
  translation.delete(hash_value_directory)
  dictionary.delete(hash_value_directory)
  // modify directory
  directory.name = name
  // compute new hash
  hash_value_directory = hasher.hash(directory)
  translation.set(hash_value_directory, old_directory)
  dictionary.set(hash_value_directory, old_message_map)
  return { status: true, message: 'changed name successfully!' }
}

// modify any aspect of the message you please
export function modify_message (
  directory: directory,
  message: message,
  raw_message: string = null,
  comserver: string = null,
  scripts: string[] = null
): return_status {
  let hash_value_directory = hasher.hash(directory)
  if (!translation.has(hash_value_directory)) {
    return { status: false, message: "directory doesn't exist!" }
  }
  // now we need to check the message exists in the directory
  let hash_value_message = hasher.hash(message)
  let message_map = dictionary.get(hash_value_directory)
  if (!message_map.has(hash_value_message)) {
    return {
      status: false,
      message: "message doesn't exist in the directories!"
    }
  }
  // get the old message and then remove it from the map since we modify
  let old_message = message_map.get(hash_value_message)
  message_map.delete(hash_value_message)
  old_message.comserver = comserver == null ? old_message.comserver : comserver
  old_message.raw_message =
    raw_message == null ? old_message.raw_message : raw_message
  old_message.scripts =
    old_message.scripts == null ? old_message.scripts : scripts
  // rehash to insert modifications
  hash_value_message = hasher.hash(old_message)
  message_map.set(hash_value_message, old_message)

  return { status: true, message: 'message has been modified!' }
}
