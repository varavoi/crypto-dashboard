// Импортируем React
import React from 'react';
// Импортируем CSS-модуль для стилей
import styles from './Header.module.css';

// Компонент заголовка приложения
const Header = () => {
  return (
    <header className={styles.header}>
      {/* Заголовок первого уровня */}
      <h1 className={styles.title}>Crypto Dashboard</h1>
      {/* Описание панели управления */}
      <p className={styles.subtitle}>Real-time cryptocurrency tracking</p>
    </header>
  );
};

// Экспортируем компонент Header по умолчанию
export default Header;