// Импортируем React и хук useCrypto из нашего контекста
import React from 'react';
import { useCrypto } from '../../contexts/CryptoContext';
// Импортируем CSS-модуль для стилей
import styles from './CryptoSelector.module.css';
import { useLocale } from '../../contexts/LocaleContext';
// Компонент для выбора криптовалюты из списка
const CryptoSelector = () => {
  const { t } = useLocale();
  // Используем кастомный хук для доступа к состоянию криптовалют
  const { cryptoList, selectedCrypto, setSelectedCrypto, loading } = useCrypto();

  // Обработчик изменения выбора в select
  const handleCryptoChange = (event) => {
    // Обновляем выбранную криптовалюту в контексте
    setSelectedCrypto(event.target.value);
  };

  // Если данные загружаются, показываем скелетон
  if (loading) {
    return (
      <div className={styles.selectorContainer}>
        <div className={styles.skeletonSelect}></div>
      </div>
    );
  }

  return (
    <div className={styles.selectorContainer}>
      {/* Лейбл для select */}
      <label htmlFor="crypto-select" className={styles.label}>
        {t('cryptoSelector.label')}
      </label>
      
      {/* Select элемент для выбора криптовалюты */}
      <select
        id="crypto-select"
        value={selectedCrypto}
        onChange={handleCryptoChange}
        className={styles.select}
      >
        {/* Опция по умолчанию */}
        <option value="">{t('cryptoSelector.placeholder')}</option>
        
        {/* Мапим список криптовалют в option элементы */}
        {cryptoList.map((crypto) => (
          <option key={crypto.id} value={crypto.id}>
            {/* Отображаем название и символ криптовалюты */}
            {crypto.name} ({crypto.symbol.toUpperCase()})
          </option>
        ))}
      </select>
    </div>
  );
};

// Экспортируем компонент CryptoSelector по умолчанию
export default CryptoSelector;