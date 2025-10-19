// Импортируем необходимые функции из React
import React, { createContext, useState, useContext, useEffect } from 'react';
// Импортируем наш API-сервис
import cryptoApi from '../services/cryptoApi';

// Создаем Context с помощью createContext()
// Начальное значение - null, но будет установлено в Provider
const CryptoContext = createContext(null);

// Создаем провайдер, который будет оборачивать наше приложение
// и предоставлять состояние всем дочерним компонентам
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

  // Функция для загрузки списка криптовалют
  const fetchCryptoList = async () => {
    try {
      setLoading(true); // Устанавливаем состояние загрузки
      setError(null); // Сбрасываем ошибки
      
      // Выполняем GET-запрос к API для получения списка криптовалют
      const response = await cryptoApi.get('/coins/markets', {
        params: {
          vs_currency: 'usd', // Валюта для отображения цен (доллар США)
          order: 'market_cap_desc', // Сортировка по рыночной капитализации (по убыванию)
          per_page: 10, // Количество результатов на странице
          page: 1, // Номер страницы
          sparkline: false, // Не включать sparkline данные (для экономии трафика)
        },
      });
      
      // Обновляем состояние с полученными данными
      setCryptoList(response.data);
    } catch (err) {
      // В случае ошибки сохраняем ее в состояние
      setError(err.message || 'An error occurred while fetching data');
      console.error('Error fetching crypto list:', err);
    } finally {
      // В любом случае снимаем состояние загрузки
      setLoading(false);
    }
  };

  // Функция для загрузки исторических данных для графика
  const fetchHistoricalData = async (cryptoId, days = 7) => {
    try {
      // Выполняем GET-запрос для получения исторических данных
      const response = await cryptoApi.get(`/coins/${cryptoId}/market_chart`, {
        params: {
          vs_currency: 'usd', // Валюта - доллар США
          days: days, // Количество дней для отображения (по умолчанию 7)
        },
      });
      
      // Преобразуем данные в формат, удобный для Chart.js
      const formattedData = response.data.prices.map(([timestamp, price]) => ({
        date: new Date(timestamp).toLocaleDateString(), // Форматируем дату
        price: price, // Цена на данный момент времени
      }));
      
      // Обновляем состояние исторических данных
      setHistoricalData(formattedData);
    } catch (err) {
      console.error('Error fetching historical data:', err);
      setError('Failed to load historical data');
    }
  };

  // Используем useEffect для загрузки данных при монтировании компонента
  useEffect(() => {
    fetchCryptoList(); // Загружаем список криптовалют
    fetchHistoricalData(selectedCrypto); // Загружаем исторические данные для выбранной криптовалюты
  }, [selectedCrypto]); // Зависимость - при изменении selectedCrypto перезагружаем исторические данные

  // Подготавливаем значение, которое будет доступно через Context
  const value = {
    cryptoList, // Список криптовалют
    loading, // Состояние загрузки
    error, // Ошибка (если есть)
    selectedCrypto, // Выбранная криптовалюта
    setSelectedCrypto, // Функция для изменения выбранной криптовалюты
    historicalData, // Исторические данные для графика
    refetchData: fetchCryptoList, // Функция для перезагрузки данных
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
  // Используем useContext для доступа к значению контекста
  const context = useContext(CryptoContext);
  
  // Проверяем, используется ли хук внутри провайдера
  if (!context) {
    throw new Error('useCrypto must be used within a CryptoProvider');
  }
  
  // Возвращаем значение контекста
  return context;
};