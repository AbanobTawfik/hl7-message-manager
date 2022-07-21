import React, { FC, useState, useMemo } from 'react';
import styles from './Dictionary.module.scss';
import Folder from '../Folder/Folder.tsx'
import * as dba from "../../services/database.ts"
import * as map from "../../services/dictionary.ts"
import Window from "../Window/Window.tsx"
import {useSelector, useDispatch} from 'react-redux'
import {change_current_directory} from '../../state/slices/current_directory_slice.js'

interface DictionaryProps { }



export function Dictionary(DictionaryProps) {
  const global_state = useSelector((state) => state);
  const current_directory_path = global_state.current_directory
  const dictionary = global_state.map
  const dispatch = useDispatch();
  console.log("aaa", current_directory_path)

  const current_directory = useMemo(() => map.get_directory_by_name(current_directory_path.path), [dictionary, current_directory_path])
  console.log(current_directory.sub_directories.length + current_directory.messages.length)
  
  return (<div className={styles.Dictionary} data-testid="Dictionary">
    {<div className='container'>
        {current_directory_path.path}
        <br/>
        <button onClick={() =>  {dispatch(change_current_directory("root/test"))} }></button>
        <button onClick={() => {dispatch(change_current_directory("root"))}}></button>
        {<Window current_directory={current_directory}/>}
    </div>}
  </div>);
}


export default Dictionary;
