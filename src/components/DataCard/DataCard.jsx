// Импортируем React
import React from 'react';
// Импортируем базовый компонент Card
import Card from '../Card/Card';
// Импортируем CSS-модуль для стилей DataCard
import styles from './DataCard.module.css';

// Компонент DataCard для отображения статистических данных
// Принимает заголовок, значение, изменение (в процентах) и дополнительную информацию
const DataCard = ({ title, value, change, additionalInfo, isLoading = false }) => {
  // Определяем класс для цвета изменения (зеленый для положительного, красный для отрицательного)
  const changeClass = change >= 0 ? styles.positive : styles.negative;
  // Форматируем значение изменения с знаком +/-
  const formattedChange = change >= 0 ? `+${change}%` : `${change}%`;

  // Если данные загружаются, показываем скелетон
  if (isLoading) {
    return (
      <Card className={styles.dataCard}>
        <div className={styles.skeletonTitle}></div>
        <div className={styles.skeletonValue}></div>
        <div className={styles.skeletonChange}></div>
      </Card>
    );
  }

  return (
    <Card className={styles.dataCard}>
      {/* Заголовок карточки */}
      <h3 className={styles.title}>{title}</h3>
      
      {/* Основное значение */}
      <div className={styles.value}>{value}</div>
      
      {/* Блок с изменением и дополнительной информацией */}
      <div className={styles.infoContainer}>
        {/* Изменение в процентах */}
        <span className={`${styles.change} ${changeClass}`}>
          {formattedChange}
        </span>
        
        {/* Дополнительная информация (если есть) */}
        {additionalInfo && (
          <span className={styles.additionalInfo}>{additionalInfo}</span>
        )}
      </div>
    </Card>
  );
};

// Экспортируем компонент DataCard по умолчанию
export default DataCard;