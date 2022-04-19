import directory from '../types/directory'
import message from '../types/message'

function hash_message (value: message): number {
  let h: number = 0
  for (let i = 0; i < value.raw_message.length; i++) {
    h = 31 * h + parseInt(value.raw_message.charAt(i))
  }

  for (let i = 0; i < value.comserver.length; i++) {
    h = 31 * h + parseInt(value.comserver.charAt(i))
  }

  for (let i = 0; i < value.scripts.length; i++) {
    for (let j = 0; i < value.scripts[i].length; j++) {
      h = 31 * h + parseInt(value.scripts[i].charAt(j))
    }
  }

  return h
}

function hash_directory (value: directory): number {
  let h: number = 0

  for (let i = 0; i < value.name.length; i++) {
    h = 31 * h + parseInt(value.name.charAt(i))
  }

  for (let i = 0; i < value.name.length; i++) {
    h = 31 * h + parseInt(value.name.charAt(i))
  }

  for (let i = 0; i < value.messages.length; i++) {
    h += hash_message(value.messages[i])
  }
  if (value.subdirectory != null) {
    h += hash_directory(value.subdirectory)
  }
  return h
}

function hash (value: any): number {
  if (value as message) {
    return hash_message(value)
  }
  if (value as directory) {
    return hash_directory(value)
  }
  return -1
}

const hasher = {
  hash
}

export default hasher
