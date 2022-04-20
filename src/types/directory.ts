import message from './message'

type directory = {
  name: string
  parent_directory: directory
  sub_directories: directory[]
  messages: message[]
}

export default directory

export function get_path_from_root(directory: directory): string {
  if (directory.parent_directory.name !== "root") {
    return directory.name
  }
  return "/" + get_path_from_root(directory)
}


export function get_messages(directory: directory): message[]{
  return directory.messages
}

export function get_directory_name(directory:directory): string{
  return directory.name
}
