import React, { FC, useState, useMemo } from 'react';
import styles from './Dictionary.module.scss';
import Folder from '../Folder/Folder.tsx'
import * as dba from "../../services/database.ts"
import * as map from "../../services/dictionary.ts"
import Window from "../Window/Window.tsx"

interface DictionaryProps { }



export function Dictionary(DictionaryProps) {

  let current_directory_path = dba.read_current_directory();
  let initial_map = map.get_dictionary();
  map.load_dictionary_from_storage(dba.read_file());
  // 1 state manages global dictionary
  const [dictionary, updateDictionary] = useState(() => {
    return initial_map
  });
  // 1 state manages current directory
  const [curr_dir_path, set_current_dir_path] = useState(() => {
    return current_directory_path
  })

  const current_directory = useMemo(() => map.get_directory_by_name(curr_dir_path), [dictionary, curr_dir_path])
  console.log(current_directory.sub_directories.length + current_directory.messages.length)
  
  return (<div className={styles.Dictionary} data-testid="Dictionary">
    {<div className='container'>
        {curr_dir_path}
        <br/>
        <button onClick={() => { set_current_dir_path(curr => { return "root/test" }) }}></button>
        <button onClick={() => { set_current_dir_path(curr => { return "root" }) }}></button>
        {<Window current_directory={current_directory}/>}
    </div>}
  </div>);
}


export default Dictionary;
