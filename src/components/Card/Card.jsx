// Импортируем React
import React from 'react';
// Импортируем CSS-модуль для стилей
import styles from './Card.module.css';

// Базовый компонент Card - переиспользуемый контейнер для контента
// Принимает children (вложенное содержимое) и дополнительные классы через className
const Card = ({ children, className = '' }) => {
  // Объединяем классы карточки и переданные извне классы
  const cardClasses = `${styles.card} ${className}`;

  return (
    <div className={cardClasses}>
      {children}
    </div>
  );
};

// Экспортируем компонент Card по умолчанию
export default Card;