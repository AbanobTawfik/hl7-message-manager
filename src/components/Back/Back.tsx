import React, { FC } from 'react';
import styles from './Back.module.scss';
import { FaBackward } from 'react-icons/fa'
import { useSelector, useDispatch } from 'react-redux'
import { change_current_directory } from '../../state/slices/current_directory_slice.js'
import * as mapper from "../../services/dictionary"
import * as directory from "../../types/directory"
import { stringify, parse } from 'circular-json'

export function Back() {
  const global_state = useSelector((state) => state);
  // @ts-ignore
  const current_directory_path = global_state.current_directory
  // @ts-ignore
  const dictionary: Map<number, directory> = new Map(parse(global_state.map.map_string))
  const dispatch = useDispatch();
  let dir_name = "root"
  if (current_directory_path.path !== "root") {
    const current_directory = mapper.get_directory_by_name(dictionary, current_directory_path.path)

    dir_name = directory.get_parent_path_from_root(current_directory)
  }
  return (<div className={styles.Back} data-testid="Back" style={{ cursor: 'pointer' }} onClick={() => { dispatch(change_current_directory(dir_name)) }}>
    <FaBackward />
  </div>)
}

export default Back;
