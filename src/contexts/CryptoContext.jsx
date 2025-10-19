// Импортируем необходимые функции из React
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
// Импортируем наш API-сервис
import cryptoApi from '../services/cryptoApi';

// Создаем Context с помощью createContext()
const CryptoContext = createContext(null);

// Создаем провайдер, который будет оборачивать наше приложение
export const CryptoProvider = ({ children }) => {
  // Состояние для хранения списка криптовалют
  const [cryptoList, setCryptoList] = useState([]);
  // Состояние для отслеживания процесса загрузки
  const [loading, setLoading] = useState(true);
  // Состояние для хранения ошибок (если они возникнут)
  const [error, setError] = useState(null);
  // Состояние для хранения выбранной криптовалюты (для графика)
  const [selectedCrypto, setSelectedCrypto] = useState('bitcoin');
  // Состояние для исторических данных (для графика)
  const [historicalData, setHistoricalData] = useState([]);
  // Состояние для автоматического обновления
  const [autoRefresh, setAutoRefresh] = useState(true);
  // Состояние для интервала обновления (в секундах)
  const [refreshInterval, setRefreshInterval] = useState(60);

  // Функция для очистки ошибок
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Функция для загрузки списка криптовалют с обработкой ошибок
  const fetchCryptoList = useCallback(async () => {
    try {
      setLoading(true);
      clearError();
      
      const response = await cryptoApi.get('/coins/markets', {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 10,
          page: 1,
          sparkline: false,
        },
      });
      
      setCryptoList(response.data);
    } catch (err) {
      // Более детальная обработка ошибок
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch cryptocurrency data';
      setError(errorMessage);
      console.error('Error fetching crypto list:', err);
    } finally {
      setLoading(false);
    }
  }, [clearError]);

  // Функция для загрузки исторических данных с обработкой ошибок
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
      }));
      
      setHistoricalData(formattedData);
    } catch (err) {
      console.error('Error fetching historical data:', err);
      // Не устанавливаем ошибку в состояние, чтобы не перекрывать основные данные
    }
  }, []);

  // Функция для ручного обновления данных
  const refreshData = useCallback(async () => {
    if (selectedCrypto) {
      await fetchCryptoList();
      await fetchHistoricalData(selectedCrypto);
    }
  }, [selectedCrypto, fetchCryptoList, fetchHistoricalData]);

  // Функция для переключения автоматического обновления
  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(prev => !prev);
  }, []);

  // Используем useEffect для загрузки данных при монтировании компонента
  useEffect(() => {
    fetchCryptoList();
    if (selectedCrypto) {
      fetchHistoricalData(selectedCrypto);
    }
  }, [selectedCrypto, fetchCryptoList, fetchHistoricalData]);

  // Используем useEffect для автоматического обновления данных
  useEffect(() => {
    let intervalId;
    
    if (autoRefresh && refreshInterval > 0) {
      intervalId = setInterval(() => {
        refreshData();
      }, refreshInterval * 1000);
    }
    
    // Очищаем интервал при размонтировании или изменении зависимостей
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh, refreshInterval, refreshData]);

  // Подготавливаем значение, которое будет доступно через Context
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
  };

  // Возвращаем провайдер с переданным значением
  return (
    <CryptoContext.Provider value={value}>
      {children}
    </CryptoContext.Provider>
  );
};

// Создаем кастомный хук для удобного использования контекста
export const useCrypto = () => {
  const context = useContext(CryptoContext);
  
  if (!context) {
    throw new Error('useCrypto must be used within a CryptoProvider');
  }
  
  return context;
};