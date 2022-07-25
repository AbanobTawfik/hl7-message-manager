import React, { FC } from 'react';
// @ts-ignore
import styles from './Add.module.scss';
import './Add.module.scss'
// @ts-ignore
import add_icon from '../../resources/Icons/add.png'

interface AddProps {}

const Add: FC<AddProps> = () => (
  <div className={styles.Add} style={{cursor: 'pointer'}} data-testid="Add">
    <img className="img-fluid .resize" src={add_icon} />
    Add
  </div>    
);

export default Add;
