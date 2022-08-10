import directory, { get_path_from_root } from '../types/directory'
import message from '../types/message'

function hash_message(value: message): number {
  let h: number = 5381
  for (let i = 0; i < value.raw_message.length; i++) {
    h = ((h << 5) + h) + value.raw_message.charCodeAt(i)
  }

  let path: string = value.directory_path
  for (let i = 0; i < path.length; i++) {
    h = ((h << 5) + h) + path.charCodeAt(i)
  }

  return h
}

function hash_directory(value: directory): number {
  let h: number = 5381
  let path: string = get_path_from_root(value)
  for (let i = 0; i < path.length; i++) {
    h = ((h << 5) + h) + path.charCodeAt(i)
  }
  return h
}

function hash(value: any): number {
  if (value.type === "message") {
    return hash_message(value)
  }
  if (value.type === "directory") {
    return hash_directory(value)
  }
  
  let h: number = 5381
  for (let i = 0; i < value.length; i++) {
    h = ((h << 5) + h) + value.charCodeAt(i)
  }
  return h

}

const hasher = {
  hash
}

export default hasher

