// Импортируем React, useEffect для анимаций и useCrypto для доступа к ошибкам
import React, { useEffect, useState } from 'react';
import { useCrypto } from '../../contexts/CryptoContext';
// Импортируем CSS-модуль для стилей
import styles from './Notification.module.css';

// Компонент для отображения уведомлений об ошибках и успешных операциях
const Notification = () => {
  // Используем кастомный хук для доступа к ошибкам
  const { error, clearError } = useCrypto();
  // Состояние для контроля видимости уведомления
  const [isVisible, setIsVisible] = useState(false);

  // Эффект для показа/скрытия уведомления при изменении ошибки
  useEffect(() => {
    if (error) {
      // Показываем уведомление, если есть ошибка
      setIsVisible(true);
      // Автоматически скрываем через 5 секунд
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Через анимацию скрытия очищаем ошибку
        setTimeout(() => clearError(), 300);
      }, 5000);

      // Очищаем таймер при размонтировании или изменении ошибки
      return () => clearTimeout(timer);
    } else {
      // Скрываем уведомление, если ошибки нет
      setIsVisible(false);
    }
  }, [error, clearError]);

  // Функция для ручного закрытия уведомления
  const handleClose = () => {
    setIsVisible(false);
    // Через анимацию скрытия очищаем ошибку
    setTimeout(() => clearError(), 300);
  };

  // Если нет ошибки или уведомление не видимо, не рендерим ничего
  if (!error || !isVisible) {
    return null;
  }

  return (
    <div className={`${styles.notification} ${styles.error} ${isVisible ? styles.show : ''}`}>
      {/* Иконка ошибки */}
      <div className={styles.icon}>⚠️</div>
      
      {/* Содержимое уведомления */}
      <div className={styles.content}>
        <div className={styles.title}>Error</div>
        <div className={styles.message}>{error}</div>
      </div>
      
      {/* Кнопка закрытия */}
      <button className={styles.closeButton} onClick={handleClose} aria-label="Close notification">
        ×
      </button>
    </div>
  );
};

// Экспортируем компонент Notification по умолчанию
export default Notification;