import message from './message'

type directory = {
  name: string
  subdirectory: directory
  messages: message[]
}

export default directory
