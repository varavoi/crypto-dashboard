// Импортируем React, useState, useEffect и useCrypto
import React, { useState, useEffect } from 'react';
import { useCrypto } from '../../contexts/CryptoContext';
// Импортируем базовый компонент Card
import Card from '../Card/Card';
// Импортируем CSS-модуль для стилей
import styles from './NewsWidget.module.css';

// Заглушка для новостей (в реальном приложении здесь был бы API)
const mockNews = [
  {
    id: 1,
    title: 'Bitcoin ETF Approval Expected Soon',
    source: 'Crypto News',
    date: '2024-01-15',
    url: '#',
    image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=300'
  },
  {
    id: 2,
    title: 'Ethereum Upgrade Boosts Network Efficiency',
    source: 'Blockchain Daily',
    date: '2024-01-14',
    url: '#',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=300'
  },
  {
    id: 3,
    title: 'Regulatory Changes Impact Crypto Markets',
    source: 'Finance Times',
    date: '2024-01-13',
    url: '#',
    image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=300'
  }
];

// Компонент для отображения новостей о криптовалютах
const NewsWidget = () => {
  const { selectedCrypto } = useCrypto();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  // В реальном приложении здесь был бы вызов API
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      // Имитация загрузки данных
      setTimeout(() => {
        setNews(mockNews);
        setLoading(false);
      }, 1000);
    };

    fetchNews();
  }, [selectedCrypto]);

  // Функция для форматирования даты
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className={styles.newsWidget}>
        <div className={styles.header}>
          <h3>Crypto News</h3>
        </div>
        <div className={styles.skeletonNews}>
          {[...Array(3)].map((_, index) => (
            <div key={index} className={styles.skeletonItem}>
              <div className={styles.skeletonImage}></div>
              <div className={styles.skeletonContent}>
                <div className={styles.skeletonTitle}></div>
                <div className={styles.skeletonMeta}></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className={styles.newsWidget}>
      <div className={styles.header}>
        <h3>Crypto News</h3>
        <span className={styles.newsCount}>{news.length} articles</span>
      </div>
      
      <div className={styles.newsList}>
        {news.map((article) => (
          <a 
            key={article.id} 
            href={article.url} 
            className={styles.newsItem}
            target="_blank" 
            rel="noopener noreferrer"
          >
            <img 
              src={article.image} 
              alt={article.title}
              className={styles.newsImage}
            />
            <div className={styles.newsContent}>
              <h4 className={styles.newsTitle}>{article.title}</h4>
              <div className={styles.newsMeta}>
                <span className={styles.newsSource}>{article.source}</span>
                <span className={styles.newsDate}>{formatDate(article.date)}</span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {news.length === 0 && (
        <div className={styles.noNews}>
          No news articles available at the moment.
        </div>
      )}
    </Card>
  );
};

// Экспортируем компонент NewsWidget по умолчанию
export default NewsWidget;