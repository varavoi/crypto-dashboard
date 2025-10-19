// Импортируем React
import React from 'react';
// Импортируем CSS-модуль для стилей
import styles from './LoadingSpinner.module.css';

// Компонент спиннера для отображения процесса загрузки
const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  // Определяем класс размера на основе пропса
  const sizeClass = styles[size] || styles.medium;

  return (
    <div className={styles.spinnerContainer}>
      {/* Контейнер спиннера с анимацией */}
      <div className={`${styles.spinner} ${sizeClass}`}></div>
      
      {/* Текст загрузки */}
      {text && <div className={styles.loadingText}>{text}</div>}
    </div>
  );
};

// Экспортируем компонент LoadingSpinner по умолчанию
export default LoadingSpinner;