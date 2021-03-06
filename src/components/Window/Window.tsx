import React, { FC } from 'react'
// @ts-ignore
import * as mapper from '../../services/dictionary.ts'
// @ts-ignore
import * as direct from '../../types/directory.ts'
// @ts-ignore
import styles from './Window.module.scss'
// @ts-ignore
import Folder from '../Folder/Folder.tsx'
// @ts-ignore
import Message from '../Message/Message.tsx'
// @ts-ignore
import hasher from '../../services/hash.ts'
// @ts-ignore
import Add from '../Add/Add.tsx'
import { ToastContainer } from 'react-toastify'
import { useSelector } from 'react-redux'
import { stringify, parse } from 'circular-json'

export function Window ({ current_directory }) {
  let all_subs_and_messages = []
  // @ts-ignore
  const global_state = useSelector(state => state)

  // @ts-ignore
  const dictionary: Map<number, directory> = new Map(
    parse(global_state.map.map_string)
  )

  let all_subs = mapper.get_all_directories_from_current(
    dictionary,
    direct.get_path_from_root(current_directory)
  )
  // @ts-ignore
  all_subs_and_messages.push(...all_subs)
  // @ts-ignore
  all_subs_and_messages.push(
    ...current_directory.messages.sort((a, b) =>
      a.description.localeCompare(b.description)
    )
  )
  // @ts-ignore
  all_subs_and_messages.push('final item')
  const rows = [...Array(Math.ceil((all_subs_and_messages.length + 1) / 6))]
  const entryRows = rows.map((row, idx) =>
    all_subs_and_messages.slice(idx * 6, idx * 6 + 6)
  )

  let count = 0
  let first = true
  // now we want to create our rendered component into a grid using react
  let view = (
    <div className={styles.Window} data-testid='Window'>
      <div id='all-items' className='container-fluid'>
        {entryRows.map((row, index) => {
          return (
            <div
              className='row'
              style={{ minWidth: '40rem' }}
              key={index}
              id={'row'.concat(index.toString())}
            >
              {row.map(entry => {
                return entry == 'final item' ? (
                  <div
                    className='col-xl-2 col-lg-2 col-md-2 col-sm-6 col-12'
                    key={'FINAL ITEM'}
                  >
                    <Add />
                  </div>
                ) : // @ts-ignore
                entry.type === 'message' ? (
                  <div
                    className='col-xl-2 col-lg-2 col-md-2 col-sm-6 col-12'
                    key={entry.id}
                  >
                    <Message message={entry} />
                  </div>
                ) : (
                  <div
                    className='col-xl-2 col-lg-2 col-md-2 col-sm-6 col-12'
                    key={hasher.hash(entry)}
                  >
                    <Folder folder={entry} />
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
      <ToastContainer />
    </div>
  )
  return view
}
{
  /* return entry.type === "message" ? <Message key={key_value}/> : <Folder key={key_value} folder={entry} */
}
export default Window
