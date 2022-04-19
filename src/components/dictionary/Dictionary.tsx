import React, { FC } from 'react';
import styles from './Dictionary.module.scss';

interface DictionaryProps {}

const Dictionary: FC<DictionaryProps> = () => (
  <div className={styles.Dictionary} data-testid="Dictionary">
    Dictionary Component
  </div>
);

export default Dictionary;
