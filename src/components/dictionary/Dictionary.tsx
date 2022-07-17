import React, { FC } from 'react';
import styles from './Dictionary.module.scss';
import Folder from '../Folder/Folder.tsx'
import { read_file } from "../../services/database.ts"
import * as map from "../../services/dictionary.ts"


interface DictionaryProps { }

let dict = map.get_dictionary();
map.load_dictionary_from_storage(read_file())
let dirs:directory[] = map.get_all_directories_from_current('root')

let mapped_folders = dirs.map((dir) => <Folder className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2" folder={dir} />)
// 5 folders per row
let all_folders:HTMLDivElement[] = []
let count = 0
// start a row, add x amount of children with col whatever to it
// start a new row
let div = React.createElement('div', {className : "row"});

dirs.forEach(element => {
  div.appendChild(<Folder className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2" folder={dir}/>);
  if (count == 5 || count == dirs.length) {
    all_folders.push(div)
    div = document.createElement('div');
    div.className = "Row"
  }
  count = count + 1;
});

///
console.log(mapped_folders)
const Dictionary: FC<DictionaryProps> = () => (

  <div className={styles.Dictionary} data-testid="Dictionary">
    <div className='container'>
      <div className='row'>
        {mapped_folders}
      </div>
    </div>
  </div>
);

export default Dictionary;
