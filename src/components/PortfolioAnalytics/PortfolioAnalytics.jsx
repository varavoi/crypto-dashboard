import React, { useMemo } from 'react';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { useCrypto } from '../../contexts/CryptoContext';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import Card from '../Card/Card';
import styles from './PortfolioAnalytics.module.css';

// Регистрием необходимые компоненты Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const PortfolioAnalytics = () => {
  const { portfolio, calculatePortfolioStats } = usePortfolio();
  const { cryptoList } = useCrypto();

  // Расчет расширенной статистики
  const analytics = useMemo(() => {
    if (portfolio.length === 0) {
      return {
        distribution: [],
        performance: [],
        riskMetrics: {
          volatility: 0,
          sharpeRatio: 0,
          maxDrawdown: 0
        }
      };
    }

    // Распределение по активам
    const distribution = portfolio.map(asset => ({
      name: asset.name,
      value: asset.currentValue,
      percentage: 0 // Будет вычислено ниже
    }));

    const totalValue = distribution.reduce((sum, asset) => sum + asset.value, 0);
    
    // Вычисляем проценты
    distribution.forEach(asset => {
      asset.percentage = totalValue > 0 ? (asset.value / totalValue) * 100 : 0;
    });

    // Сортируем по убыванию стоимости
    distribution.sort((a, b) => b.value - a.value);

    // Метрики производительности
    const performance = portfolio.map(asset => ({
      name: asset.name,
      profit: asset.profit,
      profitPercentage: asset.profitPercentage,
      roi: asset.investment > 0 ? (asset.profit / asset.investment) * 100 : 0
    }));

    // Простые метрики риска (в реальном приложении здесь были бы более сложные расчеты)
    const riskMetrics = {
      volatility: Math.random() * 20 + 10, // Заглушка
      sharpeRatio: Math.random() * 2 + 0.5, // Заглушка
      maxDrawdown: Math.random() * 15 + 5 // Заглушка
    };

    return { distribution, performance, riskMetrics };
  }, [portfolio]);

  // Данные для круговой диаграммы распределения
  const distributionData = {
    labels: analytics.distribution.map(item => item.name),
    datasets: [
      {
        data: analytics.distribution.map(item => item.value),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
          '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  // Данные для столбчатой диаграммы производительности
  const performanceData = {
    labels: analytics.performance.map(item => item.name),
    datasets: [
      {
        label: 'Profit/Loss (%)',
        data: analytics.performance.map(item => item.profitPercentage),
        backgroundColor: analytics.performance.map(item => 
          item.profitPercentage >= 0 ? '#28a745' : '#dc3545'
        ),
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          font: {
            size: 11
          }
        }
      }
    }
  };

  const performanceOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Performance by Asset (%)'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  };

  if (portfolio.length === 0) {
    return (
      <Card className={styles.portfolioAnalytics}>
        <div className={styles.header}>
          <h3>Portfolio Analytics</h3>
        </div>
        <div className={styles.emptyState}>
          <p>No portfolio data available for analysis</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={styles.portfolioAnalytics}>
      <div className={styles.header}>
        <h3>Portfolio Analytics</h3>
      </div>

      <div className={styles.analyticsGrid}>
        {/* Круговая диаграмма распределения */}
        <div className={styles.chartContainer}>
          <h4>Asset Distribution</h4>
          <div className={styles.chartWrapper}>
            <Doughnut data={distributionData} options={options} />
          </div>
        </div>

        {/* Столбчатая диаграмма производительности */}
        <div className={styles.chartContainer}>
          <h4>Performance Analysis</h4>
          <div className={styles.chartWrapper}>
            <Bar data={performanceData} options={performanceOptions} />
          </div>
        </div>
      </div>

      {/* Метрики риска */}
      <div className={styles.riskMetrics}>
        <h4>Risk Metrics</h4>
        <div className={styles.metricsGrid}>
          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>Volatility</span>
            <span className={styles.metricValue}>
              {analytics.riskMetrics.volatility.toFixed(1)}%
            </span>
          </div>
          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>Sharpe Ratio</span>
            <span className={styles.metricValue}>
              {analytics.riskMetrics.sharpeRatio.toFixed(2)}
            </span>
          </div>
          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>Max Drawdown</span>
            <span className={styles.metricValue}>
              {analytics.riskMetrics.maxDrawdown.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Детали распределения */}
      <div className={styles.distributionDetails}>
        <h4>Portfolio Composition</h4>
        <div className={styles.distributionList}>
          {analytics.distribution.map((asset, index) => (
            <div key={index} className={styles.distributionItem}>
              <div className={styles.assetInfo}>
                <span 
                  className={styles.colorIndicator}
                  style={{ 
                    backgroundColor: distributionData.datasets[0].backgroundColor[index] 
                  }}
                ></span>
                <span className={styles.assetName}>{asset.name}</span>
              </div>
              <div className={styles.assetValues}>
                <span className={styles.assetPercentage}>
                  {asset.percentage.toFixed(1)}%
                </span>
                <span className={styles.assetValue}>
                  ${asset.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default PortfolioAnalytics;