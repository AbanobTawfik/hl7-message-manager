import React, { FC } from 'react';
import styles from './Nav.module.scss';

interface NavProps {}

const Nav: FC<NavProps> = () => (
  <div className={styles.Nav} data-testid="Nav">
    Nav Component
  </div>
);

export default Nav;
