// Импортируем React и хук useCrypto
import React from 'react';
import { useCrypto } from '../../contexts/CryptoContext';
// Импортируем созданные компоненты
import CryptoSelector from '../CryptoSelector/CryptoSelector';
import DataCard from '../DataCard/DataCard';
import PriceChart from '../PriceChart/PriceChart';
// Импортируем CSS-модуль для стилей
import styles from './Dashboard.module.css';

// Основной компонент Dashboard, который собирает все виджеты вместе
const Dashboard = () => {
  // Используем кастомный хук для доступа к данным
  const { cryptoList, selectedCrypto, loading } = useCrypto();

  // Находим выбранную криптовалюту в списке
  const selectedCryptoData = cryptoList.find(crypto => crypto.id === selectedCrypto);

  // Функция для форматирования цены в долларах
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  };

  // Функция для форматирования больших чисел (рыночная капитализация, объем)
  const formatLargeNumber = (number) => {
    if (number >= 1e9) {
      return `$${(number / 1e9).toFixed(2)}B`;
    }
    if (number >= 1e6) {
      return `$${(number / 1e6).toFixed(2)}M`;
    }
    return `$${number.toLocaleString()}`;
  };

  return (
    <div className={styles.dashboard}>
      {/* Компонент выбора криптовалюты */}
      <CryptoSelector />
      
      {/* Если выбрана криптовалюта, показываем дашборд */}
      {selectedCryptoData && (
        <>
          {/* Сетка для карточек с данными */}
          <div className={styles.cardsGrid}>
            {/* Карточка с текущей ценой */}
            <DataCard
              title="Current Price"
              value={formatPrice(selectedCryptoData.current_price)}
              change={selectedCryptoData.price_change_percentage_24h}
              isLoading={loading}
            />
            
            {/* Карточка с рыночной капитализацией */}
            <DataCard
              title="Market Cap"
              value={formatLargeNumber(selectedCryptoData.market_cap)}
              additionalInfo={`Rank #${selectedCryptoData.market_cap_rank}`}
              isLoading={loading}
            />
            
            {/* Карточка с объемом торгов за 24 часа */}
            <DataCard
              title="24h Volume"
              value={formatLargeNumber(selectedCryptoData.total_volume)}
              isLoading={loading}
            />
            
            {/* Карточка с изменением цены за 24 часа */}
            <DataCard
              title="24h Change"
              value={formatPrice(selectedCryptoData.price_change_24h)}
              change={selectedCryptoData.price_change_percentage_24h}
              isLoading={loading}
            />
          </div>
          
          {/* Секция с графиком */}
          <div className={styles.chartSection}>
            <PriceChart />
          </div>
        </>
      )}
      
      {/* Если криптовалюта не выбрана, показываем приветственное сообщение */}
      {!selectedCrypto && !loading && (
        <div className={styles.welcomeMessage}>
          <h2>Welcome to Crypto Dashboard</h2>
          <p>Select a cryptocurrency from the dropdown above to view its data and price chart.</p>
        </div>
      )}
    </div>
  );
};

// Экспортируем компонент Dashboard по умолчанию
export default Dashboard;