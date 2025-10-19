import React from 'react';
import { useLocale } from '../../contexts/LocaleContext';
import styles from './Header.module.css';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import ConnectionStatus from '../ConnectionStatus/ConnectionStatus';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';

const Header = () => {
  const { t } = useLocale();

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>{t('header.title')}</h1>
          <p className={styles.subtitle}>
            {t('header.subtitle')}
            <ConnectionStatus />
          </p>
        </div>
        <div className={styles.controls}>
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;