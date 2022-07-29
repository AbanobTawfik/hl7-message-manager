import message from './message'

type directory = {
  name: string
  parent_directory: string
  sub_directories: string[]
  messages: message[]
  type: string
  id: string
}

export default directory

export function get_path_from_root (directory: directory): string {
  if (directory.name === 'root') {
    return 'root'
  }
  return directory.parent_directory + '/' + directory.name
}

export function get_parent_path_from_root (directory: directory): string {
  if (directory.name === 'root') {
    return 'root'
  }
  return directory.parent_directory
}

export function get_messages (directory: directory): message[] {
  return directory.messages
}

export function get_directory_name (directory: directory): string {
  return directory.name
}
