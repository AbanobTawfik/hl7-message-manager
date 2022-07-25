import React, { FC } from 'react';
// @ts-ignore
import directory from '../../types/directory.ts';
// @ts-ignore
import styles from './Window.module.scss';
// @ts-ignore
import Folder from '../Folder/Folder.tsx'
// @ts-ignore
import Message from '../Message/Message.tsx'
// @ts-ignore
import hasher from '../../services/hash.ts'
// @ts-ignore
import Add from '../Add/Add.tsx'

export function Window({ current_directory }) {
  let all_subs_and_messages = []
  // @ts-ignore
  all_subs_and_messages.push(...current_directory.sub_directories)
  // @ts-ignore
  all_subs_and_messages.push(...current_directory.messages)
  // @ts-ignore
  all_subs_and_messages.push("final item")
  const rows = [...Array(Math.ceil((all_subs_and_messages.length + 1) / 6))]
  const entryRows = rows.map((row, idx) => all_subs_and_messages.slice(idx * 6, idx * 6 + 6))


  let count = 0;
  let first = true;
  // now we want to create our rendered component into a grid using react
  let view = (<div className={styles.Window} data-testid="Window">
    <div id="all-items" className="container-fluid">
      {
        entryRows.map((row, index) => {
          return (
            <div className="row" key={index} id={"row".concat(index.toString())}>
              {row.map((entry) => {
                const key_value = hasher.hash(entry)
                return entry == "final item"? <div className="col-xl-1 col-lg-2 col-md-3 col-sm-6 col-12" key={"FINAL ITEM"}>
                <Add />
              </div> :(( 
                      // @ts-ignore
                      entry.type === "message" ? <div className="col-xl-1 col-lg-2 col-md-3 col-sm-6 col-12" key={key_value}>
                  <Message message={entry} />
                </div>
                  :
                  <div className="col-xl-1 col-lg-2 col-md-3 col-sm-6 col-12" key={key_value}>
                    <Folder folder={entry} />
                  </div>))
              })
              }
            </div>
          )
        })
      }
    </div>
  </div >)
  return view;
}
{/* return entry.type === "message" ? <Message key={key_value}/> : <Folder key={key_value} folder={entry} */ }
export default Window;
