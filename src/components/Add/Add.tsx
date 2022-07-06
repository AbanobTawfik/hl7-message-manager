import React, { FC } from 'react';
import styles from './Add.module.scss';

interface AddProps {}

const Add: FC<AddProps> = () => (
  <div className={styles.Add} data-testid="Add">
    Add Component
  </div>
);

export default Add;
