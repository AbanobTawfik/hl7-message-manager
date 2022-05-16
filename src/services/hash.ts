import directory, { get_path_from_root } from '../types/directory.ts'
import message from '../types/message.ts'

function hash_message (value: message): number {
  let h: number = 0
  for (let i = 0; i < value.raw_message.length; i++) {
    h = 31 * h + parseInt(value.raw_message.charAt(i))
  }

  for (let i = 0; i < value.comserver.length; i++) {
    h = 31 * h + parseInt(value.comserver.charAt(i))
  }

  let path: string = value.directory_path
  for (let i = 0; i < path.length; i++) {
    h = 31 * h + parseInt(path.charAt(i))
  }

  return h
}

function hash_directory (value: directory): number {
  let h: number = 0
  let path: string = get_path_from_root(value)

  for (let i = 0; i < path.length; i++) {
    h = 31 * h + parseInt(value.name.charAt(i))
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

