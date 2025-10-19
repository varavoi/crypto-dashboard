import React from 'react';
import { useCrypto } from '../../contexts/CryptoContext';
import { useLocale } from '../../contexts/LocaleContext';
import CryptoSelector from '../CryptoSelector/CryptoSelector';
import DataCard from '../DataCard/DataCard';
import PriceChart from '../PriceChart/PriceChart';
import RefreshControls from '../RefreshControls/RefreshControls';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import CryptoList from '../CryptoList/CryptoList';
import NewsWidget from '../NewsWidget/NewsWidget';
import PortfolioWidget from '../PortfolioWidget/PortfolioWidget';
import PriceAlerts from '../PriceAlerts/PriceAlerts';
import PortfolioAnalytics from '../PortfolioAnalytics/PortfolioAnalytics';
import ExportManager from '../ExportManager/ExportManager';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const { cryptoList, selectedCrypto, loading, error } = useCrypto();
  const { t } = useLocale();
  
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
          <LoadingSpinner size="large" text={t('dashboard.loadingData')} />
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
          <h2>{t('common.error')}</h2>
          <p>{error}</p>
        </div>
      )}

      <div className={styles.dashboardGrid}>
        <div className={styles.mainColumn}>
          {selectedCryptoData ? (
            <>
              <div className={styles.cardsGrid}>
                <DataCard
                  title={t('dataCards.currentPrice')}
                  value={formatPrice(selectedCryptoData.current_price)}
                  change={selectedCryptoData.price_change_percentage_24h}
                  isLoading={loading}
                />
                <DataCard
                  title={t('dataCards.marketCap')}
                  value={formatLargeNumber(selectedCryptoData.market_cap)}
                  additionalInfo={`${t('common.rank')} #${selectedCryptoData.market_cap_rank}`}
                  isLoading={loading}
                />
                <DataCard
                  title={t('dataCards.volume24h')}
                  value={formatLargeNumber(selectedCryptoData.total_volume)}
                  isLoading={loading}
                />
                <DataCard
                  title={t('dataCards.change24h')}
                  value={formatPrice(selectedCryptoData.price_change_24h)}
                  change={selectedCryptoData.price_change_percentage_24h}
                  isLoading={loading}
                />
              </div>
              
              <div className={styles.chartSection}>
                <PriceChart />
              </div>

              <PortfolioAnalytics />
            </>
          ) : (
            !loading && cryptoList.length > 0 && (
              <div className={styles.welcomeMessage}>
                <h2>{t('dashboard.welcome')}</h2>
                <p>{t('dashboard.selectCrypto')}</p>
              </div>
            )
          )}
        </div>

        <div className={styles.sidebar}>
          <PortfolioWidget />
          <PriceAlerts />
          <ExportManager />
          <CryptoList />
          <NewsWidget />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;