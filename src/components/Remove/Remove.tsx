import React, { FC } from 'react';
import styles from './Remove.module.scss';

interface RemoveProps {}

const Remove: FC<RemoveProps> = () => (
  <div className={styles.Remove} data-testid="Remove">
    Remove Component
  </div>
);

export default Remove;
