import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

// Создаем контекст для портфеля
const PortfolioContext = createContext(null);

// Провайдер портфеля
export const PortfolioProvider = ({ children }) => {
  // Состояние портфеля
  const [portfolio, setPortfolio] = useState([]);
  // Состояние уведомлений
  const [notifications, setNotifications] = useState([]);
  // Состояние настроек уведомлений
  const [notificationSettings, setNotificationSettings] = useState({
    enabled: true,
    sound: true,
    browserAlerts: false
  });

  // Загрузка портфеля из localStorage при монтировании
  useEffect(() => {
    const savedPortfolio = localStorage.getItem('cryptoPortfolio');
    const savedNotifications = localStorage.getItem('portfolioNotifications');
    const savedSettings = localStorage.getItem('notificationSettings');

    if (savedPortfolio) {
      try {
        setPortfolio(JSON.parse(savedPortfolio));
      } catch (error) {
        console.error('Error loading portfolio:', error);
      }
    }

    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications));
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }

    if (savedSettings) {
      try {
        setNotificationSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    }
  }, []);

  // Сохранение портфеля в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('cryptoPortfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  useEffect(() => {
    localStorage.setItem('portfolioNotifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  // Добавление актива в портфель
  const addToPortfolio = useCallback((asset) => {
    setPortfolio(prev => {
      // Проверяем, есть ли уже такой актив
      const existingIndex = prev.findIndex(item => 
        item.cryptoId === asset.cryptoId && item.purchasePrice === asset.purchasePrice
      );

      if (existingIndex >= 0) {
        // Обновляем существующий актив
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          amount: parseFloat(updated[existingIndex].amount) + parseFloat(asset.amount)
        };
        return updated;
      } else {
        // Добавляем новый актив
        return [...prev, {
          ...asset,
          id: Date.now().toString(),
          amount: parseFloat(asset.amount),
          purchasePrice: parseFloat(asset.purchasePrice)
        }];
      }
    });
  }, []);

  // Обновление актива в портфеле
  const updatePortfolioItem = useCallback((id, updates) => {
    setPortfolio(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  }, []);

  // Удаление актива из портфеля
  const removeFromPortfolio = useCallback((id) => {
    setPortfolio(prev => prev.filter(item => item.id !== id));
  }, []);

  // Очистка всего портфеля
  const clearPortfolio = useCallback(() => {
    setPortfolio([]);
  }, []);

  // Добавление уведомления о цене
  const addPriceAlert = useCallback((cryptoId, targetPrice, condition = 'above') => {
    const newAlert = {
      id: Date.now().toString(),
      cryptoId,
      targetPrice: parseFloat(targetPrice),
      condition,
      enabled: true,
      createdAt: new Date().toISOString()
    };

    setNotifications(prev => [...prev, newAlert]);
    return newAlert.id;
  }, []);

  // Обновление уведомления
  const updateAlert = useCallback((id, updates) => {
    setNotifications(prev => prev.map(alert => 
      alert.id === id ? { ...alert, ...updates } : alert
    ));
  }, []);

  // Удаление уведомления
  const removeAlert = useCallback((id) => {
    setNotifications(prev => prev.filter(alert => alert.id !== id));
  }, []);

  // Переключение статуса уведомления
  const toggleAlert = useCallback((id) => {
    setNotifications(prev => prev.map(alert => 
      alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
    ));
  }, []);

  // Обновление настроек уведомлений
  const updateNotificationSettings = useCallback((newSettings) => {
    setNotificationSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Проверка срабатывания уведомлений
  const checkPriceAlerts = useCallback((cryptoId, currentPrice) => {
    if (!notificationSettings.enabled) return [];

    const triggeredAlerts = notifications.filter(alert => 
      alert.enabled && 
      alert.cryptoId === cryptoId && 
      (
        (alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
        (alert.condition === 'below' && currentPrice <= alert.targetPrice)
      )
    );

    return triggeredAlerts;
  }, [notifications, notificationSettings.enabled]);

  // Расчет статистики портфеля
  const calculatePortfolioStats = useCallback((currentPrices) => {
    if (portfolio.length === 0) {
      return {
        totalValue: 0,
        totalInvestment: 0,
        totalProfit: 0,
        profitPercentage: 0,
        dailyChange: 0
      };
    }

    let totalValue = 0;
    let totalInvestment = 0;
    let dailyChange = 0;

    portfolio.forEach(asset => {
      const currentPrice = currentPrices[asset.cryptoId] || 0;
      const assetValue = asset.amount * currentPrice;
      const assetInvestment = asset.amount * asset.purchasePrice;

      totalValue += assetValue;
      totalInvestment += assetInvestment;
    });

    const totalProfit = totalValue - totalInvestment;
    const profitPercentage = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0;

    return {
      totalValue,
      totalInvestment,
      totalProfit,
      profitPercentage,
      dailyChange
    };
  }, [portfolio]);

  // Значение контекста
  const value = {
    portfolio,
    notifications,
    notificationSettings,
    addToPortfolio,
    updatePortfolioItem,
    removeFromPortfolio,
    clearPortfolio,
    addPriceAlert,
    updateAlert,
    removeAlert,
    toggleAlert,
    updateNotificationSettings,
    checkPriceAlerts,
    calculatePortfolioStats
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};

// Хук для использования контекста портфеля
export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};