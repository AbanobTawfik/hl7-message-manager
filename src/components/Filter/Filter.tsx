import React, { FC } from 'react';
import styles from './Filter.module.scss';

interface FilterProps {}

const Filter: FC<FilterProps> = () => (
  <div className={styles.Filter} data-testid="Filter">
    Filter Component
  </div>
);

export default Filter;
