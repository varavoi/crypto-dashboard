// Сервис для экспорта данных в различные форматы
class ExportService {
  // Экспорт портфеля в CSV
  exportPortfolioToCSV(portfolio, portfolioStats) {
    const headers = [
      'Asset',
      'Symbol',
      'Amount',
      'Average Price',
      'Current Price',
      'Investment',
      'Current Value',
      'Profit/Loss',
      'Profit/Loss %',
      'Last Updated'
    ];

    const rows = portfolio.map(asset => [
      asset.name,
      asset.symbol.toUpperCase(),
      asset.amount,
      `$${asset.purchasePrice.toFixed(2)}`,
      `$${asset.currentPrice.toFixed(2)}`,
      `$${asset.investment.toFixed(2)}`,
      `$${asset.currentValue.toFixed(2)}`,
      `$${asset.profit.toFixed(2)}`,
      `${asset.profitPercentage.toFixed(2)}%`,
      new Date(asset.lastUpdated || asset.addedAt).toLocaleDateString()
    ]);

    // Добавляем итоговую строку
    rows.push([
      'TOTAL',
      '',
      '',
      '',
      '',
      `$${portfolioStats.totalInvestment.toFixed(2)}`,
      `$${portfolioStats.totalValue.toFixed(2)}`,
      `$${portfolioStats.totalProfit.toFixed(2)}`,
      `${portfolioStats.profitPercentage.toFixed(2)}%`,
      new Date().toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  }

  // Экспорт портфеля в JSON
  exportPortfolioToJSON(portfolio, portfolioStats) {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        totalAssets: portfolio.length,
        totalValue: portfolioStats.totalValue,
        totalInvestment: portfolioStats.totalInvestment,
        totalProfit: portfolioStats.totalProfit,
        profitPercentage: portfolioStats.profitPercentage
      },
      portfolio: portfolio.map(asset => ({
        id: asset.id,
        cryptoId: asset.cryptoId,
        name: asset.name,
        symbol: asset.symbol,
        amount: asset.amount,
        purchasePrice: asset.purchasePrice,
        currentPrice: asset.currentPrice,
        investment: asset.investment,
        currentValue: asset.currentValue,
        profit: asset.profit,
        profitPercentage: asset.profitPercentage,
        addedAt: asset.addedAt,
        lastUpdated: asset.lastUpdated,
        notes: asset.notes
      }))
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Экспорт исторических данных в CSV
  exportHistoricalDataToCSV(historicalData, cryptoName) {
    const headers = [
      'Date',
      'Price (USD)',
      'Timestamp'
    ];

    const rows = historicalData.map(data => [
      data.date,
      data.price.toFixed(2),
      data.timestamp
    ]);

    const csvContent = [
      `Cryptocurrency: ${cryptoName}`,
      `Export Date: ${new Date().toLocaleDateString()}`,
      '',
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  }

  // Экспорт уведомлений в CSV
  exportAlertsToCSV(alerts, cryptoList) {
    const headers = [
      'Cryptocurrency',
      'Target Price',
      'Condition',
      'Current Price',
      'Status',
      'Created Date',
      'Enabled'
    ];

    const getCryptoName = (cryptoId) => {
      const crypto = cryptoList.find(c => c.id === cryptoId);
      return crypto ? crypto.name : 'Unknown';
    };

    const getCurrentPrice = (cryptoId) => {
      const crypto = cryptoList.find(c => c.id === cryptoId);
      return crypto ? crypto.current_price : 0;
    };

    const getAlertStatus = (alert, currentPrice) => {
      if (!currentPrice) return 'Unknown';
      
      if ((alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
          (alert.condition === 'below' && currentPrice <= alert.targetPrice)) {
        return 'Active';
      }
      return 'Inactive';
    };

    const rows = alerts.map(alert => {
      const currentPrice = getCurrentPrice(alert.cryptoId);
      return [
        getCryptoName(alert.cryptoId),
        `$${alert.targetPrice.toFixed(2)}`,
        alert.condition,
        `$${currentPrice.toFixed(2)}`,
        getAlertStatus(alert, currentPrice),
        new Date(alert.createdAt).toLocaleDateString(),
        alert.enabled ? 'Yes' : 'No'
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  }

  // Скачивание файла
  downloadFile(content, filename, mimeType = 'text/csv') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Экспорт данных портфеля
  exportPortfolio(portfolio, portfolioStats, format = 'csv') {
    let content, filename, mimeType;

    if (format === 'csv') {
      content = this.exportPortfolioToCSV(portfolio, portfolioStats);
      filename = `crypto-portfolio-${new Date().toISOString().split('T')[0]}.csv`;
      mimeType = 'text/csv';
    } else {
      content = this.exportPortfolioToJSON(portfolio, portfolioStats);
      filename = `crypto-portfolio-${new Date().toISOString().split('T')[0]}.json`;
      mimeType = 'application/json';
    }

    this.downloadFile(content, filename, mimeType);
  }

  // Экспорт исторических данных
  exportHistoricalData(historicalData, cryptoName) {
    const content = this.exportHistoricalDataToCSV(historicalData, cryptoName);
    const filename = `${cryptoName.toLowerCase().replace(/\s+/g, '-')}-history-${new Date().toISOString().split('T')[0]}.csv`;
    
    this.downloadFile(content, filename);
  }

  // Экспорт уведомлений
  exportAlerts(alerts, cryptoList) {
    const content = this.exportAlertsToCSV(alerts, cryptoList);
    const filename = `price-alerts-${new Date().toISOString().split('T')[0]}.csv`;
    
    this.downloadFile(content, filename);
  }

  // Импорт портфеля из JSON
  importPortfolioFromJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          
          // Валидация структуры данных
          if (!data.portfolio || !Array.isArray(data.portfolio)) {
            throw new Error('Invalid portfolio file format');
          }

          // Преобразование данных для импорта
          const importedPortfolio = data.portfolio.map(item => ({
            ...item,
            // Убеждаемся, что все числовые значения корректны
            amount: parseFloat(item.amount) || 0,
            purchasePrice: parseFloat(item.purchasePrice) || 0,
            // Генерируем новый ID для избежания конфликтов
            id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            // Устанавливаем текущую дату добавления
            addedAt: item.addedAt || new Date().toISOString()
          }));

          resolve(importedPortfolio);
        } catch (error) {
          reject(new Error('Failed to parse portfolio file: ' + error.message));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
}

// Создаем и экспортируем singleton экземпляр
const exportService = new ExportService();
export default exportService;