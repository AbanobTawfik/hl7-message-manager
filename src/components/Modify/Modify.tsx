import React, { FC } from 'react';
import styles from './Modify.module.scss';

interface ModifyProps {}

const Modify: FC<ModifyProps> = () => (
  <div className={styles.Modify} data-testid="Modify">
    Modify Component
  </div>
);

export default Modify;
