import React from 'react';
import { useCrypto } from '../../contexts/CryptoContext';
import CryptoSelector from '../CryptoSelector/CryptoSelector';
import DataCard from '../DataCard/DataCard';
import PriceChart from '../PriceChart/PriceChart';
import RefreshControls from '../RefreshControls/RefreshControls';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import CryptoList from '../CryptoList/CryptoList';
import NewsWidget from '../NewsWidget/NewsWidget';
import PortfolioWidget from '../PortfolioWidget/PortfolioWidget';
import PriceAlerts from '../PriceAlerts/PriceAlerts';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const { cryptoList, selectedCrypto, loading, error } = useCrypto();
  const selectedCryptoData = cryptoList.find(crypto => crypto.id === selectedCrypto);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  };

  const formatLargeNumber = (number) => {
    if (number >= 1e9) return `$${(number / 1e9).toFixed(2)}B`;
    if (number >= 1e6) return `$${(number / 1e6).toFixed(2)}M`;
    return `$${number.toLocaleString()}`;
  };

  if (loading && cryptoList.length === 0) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loadingContainer}>
          <LoadingSpinner size="large" text="Loading cryptocurrency data..." />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <CryptoSelector />
      <RefreshControls />

      {error && cryptoList.length === 0 && (
        <div className={styles.errorState}>
          <h2>Unable to Load Data</h2>
          <p>{error}</p>
        </div>
      )}

      {/* Основная сетка с виджетами */}
      <div className={styles.dashboardGrid}>
        {/* Левая колонка - основной дашборд */}
        <div className={styles.mainColumn}>
          {selectedCryptoData ? (
            <>
              <div className={styles.cardsGrid}>
                <DataCard
                  title="Current Price"
                  value={formatPrice(selectedCryptoData.current_price)}
                  change={selectedCryptoData.price_change_percentage_24h}
                  isLoading={loading}
                />
                <DataCard
                  title="Market Cap"
                  value={formatLargeNumber(selectedCryptoData.market_cap)}
                  additionalInfo={`Rank #${selectedCryptoData.market_cap_rank}`}
                  isLoading={loading}
                />
                <DataCard
                  title="24h Volume"
                  value={formatLargeNumber(selectedCryptoData.total_volume)}
                  isLoading={loading}
                />
                <DataCard
                  title="24h Change"
                  value={formatPrice(selectedCryptoData.price_change_24h)}
                  change={selectedCryptoData.price_change_percentage_24h}
                  isLoading={loading}
                />
              </div>
              
              <div className={styles.chartSection}>
                <PriceChart />
              </div>
            </>
          ) : (
            !loading && cryptoList.length > 0 && (
              <div className={styles.welcomeMessage}>
                <h2>Welcome to Crypto Dashboard</h2>
                <p>Select a cryptocurrency to view detailed analytics and charts.</p>
              </div>
            )
          )}
        </div>

        {/* Правая колонка - дополнительные виджеты */}
        <div className={styles.sidebar}>
          <PortfolioWidget />
          <PriceAlerts />
          <CryptoList />
          <NewsWidget />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;