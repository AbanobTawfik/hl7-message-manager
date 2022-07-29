import React, { FC, useState, useMemo } from 'react';
// @ts-ignore
import styles from './Dictionary.module.scss';
// @ts-ignore
import Folder from '../Folder/Folder'
// @ts-ignore
import * as dba from "../../services/database"
// @ts-ignore
import * as mapper from "../../services/dictionary"
// @ts-ignore
import Window from "../Window/Window"
import {useSelector, useDispatch} from 'react-redux'
import {change_current_directory} from '../../state/slices/current_directory_slice.js'
import { stringify, parse } from 'circular-json'

interface DictionaryProps { }



export function Dictionary(DictionaryProps) {
  const global_state = useSelector((state) => state);
  // @ts-ignore
  const current_directory_path = global_state.current_directory
  // @ts-ignore
  const dictionary:Map<number, directory> = new Map(parse(global_state.map.map_string))
  const dispatch = useDispatch();
  const current_directory = mapper.get_directory_by_name(dictionary, current_directory_path.path)
  return (<div className={styles.Dictionary} data-testid="Dictionary">
    {<div className='container'>
        {current_directory_path.path}
        
        {<Window current_directory={current_directory}/>}
    </div>}
  </div>);
}


export default Dictionary;
