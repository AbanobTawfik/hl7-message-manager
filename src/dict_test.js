import dictionary, { add_directory } from "./services/dictionary.ts"
function Appt() {
    console.log(dictionary)
    let x = add_directory("", "root")
    console.log(dictionary)
}

export default Appt
