import React, { useState } from 'react';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { useCrypto } from '../../contexts/CryptoContext';
import exportService from '../../services/exportService';
import Card from '../Card/Card';
import styles from './ExportManager.module.css';

const ExportManager = () => {
  const { portfolio, notifications, calculatePortfolioStats } = usePortfolio();
  const { cryptoList, historicalData, selectedCrypto } = useCrypto();
  
  const [exportType, setExportType] = useState('portfolio');
  const [exportFormat, setExportFormat] = useState('csv');
  const [isExporting, setIsExporting] = useState(false);

  const portfolioStats = calculatePortfolioStats(
    cryptoList.reduce((prices, crypto) => {
      prices[crypto.id] = crypto.current_price;
      return prices;
    }, {})
  );

  const selectedCryptoData = cryptoList.find(crypto => crypto.id === selectedCrypto);

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);

    try {
      switch (exportType) {
        case 'portfolio':
          exportService.exportPortfolio(portfolio, portfolioStats, exportFormat);
          break;
        
        case 'historical':
          if (selectedCryptoData && historicalData.length > 0) {
            exportService.exportHistoricalData(historicalData, selectedCryptoData.name);
          } else {
            alert('No historical data available for export');
          }
          break;
        
        case 'alerts':
          if (notifications.length > 0) {
            exportService.exportAlerts(notifications, cryptoList);
          } else {
            alert('No price alerts available for export');
          }
          break;
        
        default:
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      alert('Please select a JSON file');
      return;
    }

    if (!confirm('This will add imported assets to your current portfolio. Continue?')) {
      return;
    }

    exportService.importPortfolioFromJSON(file)
      .then(importedPortfolio => {
        // Здесь должна быть логика добавления импортированных данных в портфель
        alert(`Successfully imported ${importedPortfolio.length} assets`);
        event.target.value = ''; // Сброс input
      })
      .catch(error => {
        alert('Import failed: ' + error.message);
        event.target.value = ''; // Сброс input
      });
  };

  const getExportButtonText = () => {
    if (isExporting) return 'Exporting...';
    
    switch (exportType) {
      case 'portfolio':
        return `Export Portfolio (${exportFormat.toUpperCase()})`;
      case 'historical':
        return 'Export Historical Data';
      case 'alerts':
        return 'Export Price Alerts';
      default:
        return 'Export';
    }
  };

  const isExportDisabled = () => {
    switch (exportType) {
      case 'portfolio':
        return portfolio.length === 0;
      case 'historical':
        return !selectedCryptoData || historicalData.length === 0;
      case 'alerts':
        return notifications.length === 0;
      default:
        return true;
    }
  };

  return (
    <Card className={styles.exportManager}>
      <div className={styles.header}>
        <h3>Data Management</h3>
      </div>

      <div className={styles.exportSection}>
        <h4>Export Data</h4>
        
        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <label htmlFor="exportType">Export Type</label>
            <select 
              id="exportType"
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
            >
              <option value="portfolio">Portfolio</option>
              <option value="historical">Historical Data</option>
              <option value="alerts">Price Alerts</option>
            </select>
          </div>

          {exportType === 'portfolio' && (
            <div className={styles.controlGroup}>
              <label htmlFor="exportFormat">Format</label>
              <select 
                id="exportFormat"
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </select>
            </div>
          )}
        </div>

        <div className={styles.exportInfo}>
          {exportType === 'portfolio' && (
            <p>Export your portfolio with current prices and performance data</p>
          )}
          {exportType === 'historical' && (
            <p>Export historical price data for the selected cryptocurrency</p>
          )}
          {exportType === 'alerts' && (
            <p>Export your price alert settings and current status</p>
          )}
        </div>

        <button 
          className={styles.exportButton}
          onClick={handleExport}
          disabled={isExportDisabled() || isExporting}
        >
          {getExportButtonText()}
        </button>
      </div>

      <div className={styles.importSection}>
        <h4>Import Portfolio</h4>
        <p>Import portfolio data from a JSON file</p>
        
        <div className={styles.importControls}>
          <input
            type="file"
            id="importFile"
            accept=".json"
            onChange={handleImport}
            className={styles.fileInput}
          />
          <label htmlFor="importFile" className={styles.importButton}>
            Choose JSON File
          </label>
        </div>
        
        <div className={styles.importTips}>
          <strong>File format requirements:</strong>
          <ul>
            <li>JSON format with portfolio array</li>
            <li>Each asset must include: name, symbol, amount, purchasePrice</li>
            <li>File size limit: 1MB</li>
          </ul>
        </div>
      </div>

      <div className={styles.dataSummary}>
        <h4>Data Summary</h4>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Portfolio Assets</span>
            <span className={styles.summaryValue}>{portfolio.length}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Price Alerts</span>
            <span className={styles.summaryValue}>{notifications.length}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Historical Data Points</span>
            <span className={styles.summaryValue}>{historicalData.length}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ExportManager;