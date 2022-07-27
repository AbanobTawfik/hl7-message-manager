import message from './message'

type directory = {
  name: string
  parent_directory: directory
  sub_directories: directory[]
  messages: message[]
  type: string
  id: string
}

export default directory

export function get_path_from_root(directory: directory): string {
  if (directory.name === "root") {
    return directory.name
  }
  // return get_path_from_root(directory.parent_directory, directory.name + "/" + current_path)
  return  get_path_from_root(directory.parent_directory) + "/" + directory.name;
}


export function get_messages(directory: directory): message[]{
  return directory.messages
}

export function get_directory_name(directory:directory): string{
  return directory.name
}
