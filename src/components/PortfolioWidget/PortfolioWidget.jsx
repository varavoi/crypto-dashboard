import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { useCrypto } from '../../contexts/CryptoContext';
import Card from '../Card/Card';
import AddToPortfolio from '../AddToPortfolio/AddToPortfolio';
import styles from './PortfolioWidget.module.css';
import { useLocale } from '../../contexts/LocaleContext';

const PortfolioWidget = () => {
   const { t } = useLocale();
  const { portfolio, removeFromPortfolio, calculatePortfolioStats } = usePortfolio();
  const { cryptoList, realTimePrices, getBinanceSymbol } = useCrypto();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState(null);

  // Создаем маппинг текущих цен
  const currentPrices = useMemo(() => {
    const prices = {};
    cryptoList.forEach(crypto => {
      prices[crypto.id] = crypto.current_price;
    });
    return prices;
  }, [cryptoList]);

  // Расчет статистики портфеля
  const stats = useMemo(() => {
    return calculatePortfolioStats(currentPrices);
  }, [calculatePortfolioStats, currentPrices]);

  // Данные портфеля с актуальными ценами
  const portfolioWithPrices = useMemo(() => {
    return portfolio.map(item => {
      const currentPrice = currentPrices[item.cryptoId] || 0;
      const currentValue = item.amount * currentPrice;
      const investment = item.amount * item.purchasePrice;
      const profit = currentValue - investment;
      const profitPercentage = investment > 0 ? (profit / investment) * 100 : 0;

      return {
        ...item,
        currentPrice,
        currentValue,
        investment,
        profit,
        profitPercentage
      };
    });
  }, [portfolio, currentPrices]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const handleAddClick = (cryptoId = null) => {
    setSelectedCrypto(cryptoId);
    setShowAddForm(true);
  };

  if (showAddForm) {
    return (
      <AddToPortfolio 
        cryptoId={selectedCrypto} 
        onClose={() => {
          setShowAddForm(false);
          setSelectedCrypto(null);
        }} 
      />
    );
  }

  return (
    <Card className={styles.portfolioWidget}>
      <div className={styles.header}>
        <h3>{t('portfolio.title')}</h3>
        <button 
          className={styles.addButton}
          onClick={() => handleAddClick()}
        >
          {t('portfolio.addAsset')}
        </button>
      </div>

      {portfolio.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>💼</div>
          <h4>{t('portfolio.emptyTitle')}</h4>
          <p>{t('portfolio.emptyDescription')}</p>
          <button 
            className={styles.ctaButton}
            onClick={() => handleAddClick()}
          >
            {t('portfolio.addFirstAsset')}
          </button>
        </div>
      ) : (
        <>
          {/* Статистика портфеля */}
          <div className={styles.portfolioStats}>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>Total Value</div>
              <div className={styles.statValue}>{formatCurrency(stats.totalValue)}</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>{t('portfolio.totalValue')}</div>
              <div className={`${styles.statValue} ${
                stats.totalProfit >= 0 ? styles.positive : styles.negative
              }`}>
                {formatCurrency(stats.totalProfit)} ({formatPercentage(stats.profitPercentage)})
              </div>
            </div>
          </div>

          {/* Список активов */}
          <div className={styles.assetsList}>
            {portfolioWithPrices.map((asset) => (
              <div key={asset.id} className={styles.assetItem}>
                <div className={styles.assetHeader}>
                  <div className={styles.assetInfo}>
                    <div className={styles.assetName}>{asset.name}</div>
                    <div className={styles.assetAmount}>
                      {asset.amount} {asset.symbol.toUpperCase()}
                    </div>
                  </div>
                  <div className={styles.assetValue}>
                    {formatCurrency(asset.currentValue)}
                  </div>
                </div>

                <div className={styles.assetDetails}>
                  <div className={styles.detailRow}>
                    <span>Avg. Price:</span>
                    <span>{formatCurrency(asset.purchasePrice)}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>{t('portfolio.currentPrice')}</span>
                    <span>{formatCurrency(asset.currentPrice)}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>{t('portfolio.profitLoss')}:</span>
                    <span className={`${styles.profitLoss} ${
                      asset.profit >= 0 ? styles.positive : styles.negative
                    }`}>
                      {formatCurrency(asset.profit)} ({formatPercentage(asset.profitPercentage)})
                    </span>
                  </div>
                </div>

                <div className={styles.assetActions}>
                  <button 
                    className={styles.actionButton}
                    onClick={() => handleAddClick(asset.cryptoId)}
                  >
                    {t('portfolio.addMore')}
                  </button>
                  <button 
                    className={styles.removeButton}
                    onClick={() => removeFromPortfolio(asset.id)}
                  >
                    {t('portfolio.remove')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
};

export default PortfolioWidget;