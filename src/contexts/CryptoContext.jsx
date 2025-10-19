import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import cryptoApi from '../services/cryptoApi';
import websocketService from '../services/websocketService';
import { getBinanceSymbol } from '../utils/cryptoMapping';

const CryptoContext = createContext(null);

export const CryptoProvider = ({ children }) => {
  const [cryptoList, setCryptoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCrypto, setSelectedCrypto] = useState('bitcoin');
  const [historicalData, setHistoricalData] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(60);
  const [realTimePrices, setRealTimePrices] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Функция для обновления цены в реальном времени
  const updateRealTimePrice = useCallback((symbol, priceData) => {
    setRealTimePrices(prev => ({
      ...prev,
      [symbol]: {
        price: parseFloat(priceData.c),
        change: parseFloat(priceData.P),
        changePercent: parseFloat(priceData.p),
        high: parseFloat(priceData.h),
        low: parseFloat(priceData.l),
        volume: parseFloat(priceData.v),
        lastUpdate: new Date().toISOString()
      }
    }));
  }, []);

  // Функция для обновления списка криптовалют с реальными ценами
  const updateCryptoListWithRealtime = useCallback((list) => {
    return list.map(crypto => {
      const binanceSymbol = getBinanceSymbol(crypto.id);
      const realTimeData = realTimePrices[binanceSymbol];
      
      if (realTimeData) {
        return {
          ...crypto,
          current_price: realTimeData.price,
          price_change_24h: realTimeData.change,
          price_change_percentage_24h: realTimeData.changePercent,
          high_24h: realTimeData.high,
          low_24h: realTimeData.low,
          total_volume: realTimeData.volume,
          last_updated: realTimeData.lastUpdate
        };
      }
      return crypto;
    });
  }, [realTimePrices]);

  const fetchCryptoList = useCallback(async () => {
    try {
      setLoading(true);
      clearError();
      
      const response = await cryptoApi.get('/coins/markets', {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 15,
          page: 1,
          sparkline: false,
        },
      });
      
      // Обновляем список с реальными ценами, если они есть
      const updatedList = updateCryptoListWithRealtime(response.data);
      setCryptoList(updatedList);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch cryptocurrency data';
      setError(errorMessage);
      console.error('Error fetching crypto list:', err);
    } finally {
      setLoading(false);
    }
  }, [clearError, updateCryptoListWithRealtime]);

  const fetchHistoricalData = useCallback(async (cryptoId, days = 7) => {
    try {
      const response = await cryptoApi.get(`/coins/${cryptoId}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days: days,
        },
      });
      
      const formattedData = response.data.prices.map(([timestamp, price]) => ({
        date: new Date(timestamp).toLocaleDateString(),
        price: price,
        timestamp: timestamp
      }));
      
      setHistoricalData(formattedData);
    } catch (err) {
      console.error('Error fetching historical data:', err);
    }
  }, []);

  const refreshData = useCallback(async () => {
    if (selectedCrypto) {
      await fetchCryptoList();
      await fetchHistoricalData(selectedCrypto);
    }
  }, [selectedCrypto, fetchCryptoList, fetchHistoricalData]);

  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(prev => !prev);
  }, []);

  // Обработчик WebSocket сообщений
  const handleWebSocketMessage = useCallback((data) => {
    if (data.e === '24hrTicker') {
      const symbol = data.s.toLowerCase();
      updateRealTimePrice(symbol, data);
      
      // Обновляем список криптовалют с новой ценой
      setCryptoList(prevList => {
        return prevList.map(crypto => {
          const binanceSymbol = getBinanceSymbol(crypto.id);
          if (binanceSymbol === symbol) {
            return {
              ...crypto,
              current_price: parseFloat(data.c),
              price_change_24h: parseFloat(data.P),
              price_change_percentage_24h: parseFloat(data.p),
              high_24h: parseFloat(data.h),
              low_24h: parseFloat(data.l),
              total_volume: parseFloat(data.v),
              last_updated: new Date().toISOString()
            };
          }
          return crypto;
        });
      });
    }
  }, [updateRealTimePrice]);

  // Обработчик статуса соединения WebSocket
  const handleConnectionStatus = useCallback((data) => {
    setConnectionStatus(data.type);
    
    if (data.type === 'connected') {
      // Переподписываемся на обновления для текущего списка криптовалют
      cryptoList.forEach(crypto => {
        const binanceSymbol = getBinanceSymbol(crypto.id);
        if (binanceSymbol) {
          websocketService.subscribeToTicker(binanceSymbol);
        }
      });
    }
  }, [cryptoList]);

  // Инициализация WebSocket при монтировании
  useEffect(() => {
    // Подписываемся на события WebSocket
    websocketService.on('ticker', handleWebSocketMessage);
    websocketService.on('connection', handleConnectionStatus);
    
    // Подключаемся к WebSocket
    websocketService.connect();

    // Отписка при размонтировании
    return () => {
      websocketService.off('ticker', handleWebSocketMessage);
      websocketService.off('connection', handleConnectionStatus);
      websocketService.disconnect();
    };
  }, [handleWebSocketMessage, handleConnectionStatus]);

  // Подписка на обновления при изменении списка криптовалют
  useEffect(() => {
    if (websocketService.getConnectionStatus() === 'connected' && cryptoList.length > 0) {
      // Отписываемся от всех предыдущих подписок
      const currentSubscriptions = websocketService.getSubscriptions();
      currentSubscriptions.forEach(symbol => {
        websocketService.unsubscribeFromTicker(symbol);
      });

      // Подписываемся на обновления для текущего списка
      cryptoList.forEach(crypto => {
        const binanceSymbol = getBinanceSymbol(crypto.id);
        if (binanceSymbol) {
          websocketService.subscribeToTicker(binanceSymbol);
        }
      });
    }
  }, [cryptoList]);

  // Подписка на обновления при выборе новой криптовалюты
  useEffect(() => {
    if (selectedCrypto && websocketService.getConnectionStatus() === 'connected') {
      const binanceSymbol = getBinanceSymbol(selectedCrypto);
      if (binanceSymbol) {
        websocketService.subscribeToTicker(binanceSymbol);
      }
    }
  }, [selectedCrypto]);

  useEffect(() => {
    fetchCryptoList();
    if (selectedCrypto) {
      fetchHistoricalData(selectedCrypto);
    }
  }, [selectedCrypto, fetchCryptoList, fetchHistoricalData]);

  useEffect(() => {
    let intervalId;
    
    if (autoRefresh && refreshInterval > 0) {
      intervalId = setInterval(() => {
        refreshData();
      }, refreshInterval * 1000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh, refreshInterval, refreshData]);

  const value = {
    cryptoList,
    loading,
    error,
    selectedCrypto,
    setSelectedCrypto,
    historicalData,
    refreshData,
    autoRefresh,
    toggleAutoRefresh,
    refreshInterval,
    setRefreshInterval,
    clearError,
    realTimePrices,
    connectionStatus,
    isRealtimeConnected: connectionStatus === 'connected'
  };

  return (
    <CryptoContext.Provider value={value}>
      {children}
    </CryptoContext.Provider>
  );
};

export const useCrypto = () => {
  const context = useContext(CryptoContext);
  
  if (!context) {
    throw new Error('useCrypto must be used within a CryptoProvider');
  }
  
  return context;
};