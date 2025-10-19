// Импортируем React и хук useCrypto
import React from 'react';
import { useCrypto } from '../../contexts/CryptoContext';
// Импортируем CSS-модуль для стилей
import styles from './RefreshControls.module.css';

// Компонент для управления автоматическим обновлением данных
const RefreshControls = () => {
  // Используем кастомный хук для доступа к функциям обновления
  const { 
    refreshData, 
    autoRefresh, 
    toggleAutoRefresh, 
    refreshInterval, 
    setRefreshInterval,
    loading 
  } = useCrypto();

  // Обработчик изменения интервала обновления
  const handleIntervalChange = (event) => {
    const newInterval = parseInt(event.target.value);
    // Устанавливаем минимальный интервал 10 секунд
    setRefreshInterval(Math.max(10, newInterval));
  };

  // Если данные загружаются, показываем индикатор
  if (loading) {
    return (
      <div className={styles.controls}>
        <div className={styles.loadingIndicator}>Updating data...</div>
      </div>
    );
  }

  return (
    <div className={styles.controls}>
      {/* Кнопка ручного обновления */}
      <button 
        className={styles.refreshButton} 
        onClick={refreshData}
        title="Refresh data now"
      >
        🔄 Refresh
      </button>
      
      {/* Переключатель автоматического обновления */}
      <label className={styles.switch}>
        <input 
          type="checkbox" 
          checked={autoRefresh} 
          onChange={toggleAutoRefresh} 
        />
        <span className={styles.slider}></span>
        Auto-refresh
      </label>
      
      {/* Выбор интервала обновления (только при включенном автообновлении) */}
      {autoRefresh && (
        <div className={styles.intervalControl}>
          <label htmlFor="refresh-interval">Every:</label>
          <select 
            id="refresh-interval" 
            value={refreshInterval} 
            onChange={handleIntervalChange}
            className={styles.intervalSelect}
          >
            <option value="10">10 seconds</option>
            <option value="30">30 seconds</option>
            <option value="60">1 minute</option>
            <option value="300">5 minutes</option>
          </select>
        </div>
      )}
    </div>
  );
};

// Экспортируем компонент RefreshControls по умолчанию
export default RefreshControls;