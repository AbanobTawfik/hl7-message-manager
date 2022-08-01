import React, { FC } from 'react';
import styles from './Search.module.scss';

interface SearchProps {}

const Search: FC<SearchProps> = () => (
  <div className={styles.Search} data-testid="Search">
    Search Component
  </div>
);

export default Search;
