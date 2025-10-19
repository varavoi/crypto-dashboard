// Импортируем React и необходимые компоненты из Chart.js
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useCrypto } from '../../contexts/CryptoContext';
// Импортируем базовый компонент Card
import Card from '../Card/Card';
// Импортируем CSS-модуль для стилей
import styles from './PriceChart.module.css';

// Регистрируем необходимые компоненты Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Компонент для отображения графика цен
const PriceChart = () => {
  // Используем кастомный хук для доступа к данным
  const { historicalData, loading, selectedCrypto, cryptoList } = useCrypto();

  // Находим выбранную криптовалюту в списке
  const selectedCryptoData = cryptoList.find(crypto => crypto.id === selectedCrypto);

  // Настройки для графика
  const chartOptions = {
    // Адаптивный размер
    responsive: true,
    // Поддержка перетаскивания и масштабирования
    interaction: {
      mode: 'index',
      intersect: false,
    },
    // Настройки плагинов
    plugins: {
      // Легенда (подпись графика)
      legend: {
        position: 'top',
      },
      // Заголовок графика
      title: {
        display: true,
        text: selectedCryptoData 
          ? `${selectedCryptoData.name} Price Chart (7 Days)`
          : 'Price Chart',
      },
      // Всплывающая подсказка
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
      },
    },
    // Настройки осей
    scales: {
      y: {
        // Настройки для оси Y
        ticks: {
          callback: function(value) {
            // Форматируем цену в долларах
            return '$' + value.toLocaleString();
          },
        },
      },
    },
  };

  // Подготавливаем данные для графика
  const chartData = {
    // Метки по оси X (даты)
    labels: historicalData.map(data => data.date),
    // Наборы данных
    datasets: [
      {
        // Метка набора данных
        label: 'Price (USD)',
        // Данные для графика (цены)
        data: historicalData.map(data => data.price),
        // Цвет линии
        borderColor: 'rgb(75, 192, 192)',
        // Цвет фона под линией
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        // Толщина линии
        borderWidth: 2,
        // Сглаживание линии
        tension: 0.1,
        // Стиль точек
        pointBackgroundColor: 'rgb(75, 192, 192)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  // Если данные загружаются, показываем скелетон
  if (loading) {
    return (
      <Card className={styles.chartContainer}>
        <div className={styles.skeletonChart}></div>
      </Card>
    );
  }

  // Если нет исторических данных, показываем сообщение
  if (historicalData.length === 0) {
    return (
      <Card className={styles.chartContainer}>
        <div className={styles.noData}>
          No historical data available for the selected cryptocurrency.
        </div>
      </Card>
    );
  }

  return (
    <Card className={styles.chartContainer}>
      {/* Компонент Line из react-chartjs-2 для отображения линейного графика */}
      <Line data={chartData} options={chartOptions} />
    </Card>
  );
};

// Экспортируем компонент PriceChart по умолчанию
export default PriceChart;