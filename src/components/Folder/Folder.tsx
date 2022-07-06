import React, { FC } from 'react';
import styles from './Folder.module.scss';

interface FolderProps {}

const Folder: FC<FolderProps> = () => (
  <div className={styles.Folder} data-testid="Folder">
    Folder Component
  </div>
);

export default Folder;
