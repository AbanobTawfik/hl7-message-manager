import React, { FC, useState, useMemo } from 'react';
// @ts-ignore
import styles from './Dictionary.module.scss';
// @ts-ignore
import Folder from '../Folder/Folder.tsx'
// @ts-ignore
import * as dba from "../../services/database.ts"
// @ts-ignore
import * as map from "../../services/dictionary.ts"
// @ts-ignore
import Window from "../Window/Window.tsx"
import {useSelector, useDispatch} from 'react-redux'
import {change_current_directory} from '../../state/slices/current_directory_slice.js'

interface DictionaryProps { }



export function Dictionary(DictionaryProps) {
  const global_state = useSelector((state) => state);
  // @ts-ignore
  const current_directory_path = global_state.current_directory
  // @ts-ignore
  const dictionary = global_state.map
  const dispatch = useDispatch();
  const current_directory = useMemo(() => map.get_directory_by_name(current_directory_path.path, dictionary.map), [dictionary, current_directory_path])
  return (<div className={styles.Dictionary} style={{cursor: 'pointer'}} data-testid="Dictionary">
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
