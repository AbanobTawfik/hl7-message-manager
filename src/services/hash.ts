import directory, { get_path_from_root } from '../types/directory'
import message from '../types/message'



function hash(value: directory): number {
  let h: number = 0
  let path: string = get_path_from_root(value)

  for (let i = 0; i < path.length; i++) {
    h = 31 * h + parseInt(value.name.charAt(i))
  }

  return h
}

const hasher = {
  hash
}

export default hasher
