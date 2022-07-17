import React, { FC } from 'react';
import styles from './Folder.module.scss';
import folder_icon from '../../resources/Icons/folder.png'
import directory from '../../types/directory.ts'

interface FolderProps { folder: directory }
// folder component, takes in directory and shows just the name of the current directory 
const Folder: FC<FolderProps> = ({folder}) => (

  <div className={styles.Folder} data-testid="Folder">
    {
    
      <div>
        <img className="img-fluid" src={folder_icon} />
        <div>
        {folder.name}
        </div>
      </div>
    }

  </div>
);

export default Folder;
