import React from 'react';
import styles from './Header.module.css';
import ThemeToggle from '../ThemeToggle/ThemeToggle';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div>
          <h1 className={styles.title}>Crypto Dashboard</h1>
          <p className={styles.subtitle}>Real-time cryptocurrency tracking</p>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;