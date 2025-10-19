// Импортируем React, useMemo для оптимизации и useCrypto для доступа к данным
import React, { useMemo, useState } from 'react';
import { useCrypto } from '../../contexts/CryptoContext';
// Импортируем базовый компонент Card
import Card from '../Card/Card';
// Импортируем CSS-модуль для стилей
import styles from './CryptoList.module.css';

// Компонент для отображения списка криптовалют с поиском и сортировкой
const CryptoList = () => {
  // Используем кастомный хук для доступа к данным
  const { cryptoList, loading, setSelectedCrypto } = useCrypto();
  // Состояние для поискового запроса
  const [searchQuery, setSearchQuery] = useState('');
  // Состояние для сортировки
  const [sortBy, setSortBy] = useState('market_cap');
  // Состояние для направления сортировки
  const [sortDirection, setSortDirection] = useState('desc');

  // Функция для обработки выбора криптовалюты
  const handleCryptoSelect = (cryptoId) => {
    setSelectedCrypto(cryptoId);
  };

  // Функция для изменения сортировки
  const handleSort = (field) => {
    if (sortBy === field) {
      // Если уже сортируем по этому полю, меняем направление
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Если новое поле, устанавливаем его и направление по умолчанию
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  // Функция для форматирования цены
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  };

  // Функция для форматирования процентов
  const formatPercent = (percent) => {
    return `${percent >= 0 ? '+' : ''}${percent?.toFixed(2)}%`;
  };

  // Мемоизированный список с фильтрацией и сортировкой
  const filteredAndSortedList = useMemo(() => {
    if (!cryptoList) return [];

    // Фильтрация по поисковому запросу
    let filtered = cryptoList.filter(crypto =>
      crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Сортировка
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Для строкового сравнения (например, имени)
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [cryptoList, searchQuery, sortBy, sortDirection]);

  // Если данные загружаются, показываем скелетон
  if (loading && cryptoList.length === 0) {
    return (
      <Card className={styles.cryptoList}>
        <div className={styles.header}>
          <h3>Cryptocurrencies</h3>
        </div>
        <div className={styles.skeletonList}>
          {[...Array(5)].map((_, index) => (
            <div key={index} className={styles.skeletonRow}>
              <div className={styles.skeletonCell}></div>
              <div className={styles.skeletonCell}></div>
              <div className={styles.skeletonCell}></div>
              <div className={styles.skeletonCell}></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className={styles.cryptoList}>
      {/* Заголовок и поиск */}
      <div className={styles.header}>
        <h3>Cryptocurrencies</h3>
        <div className={styles.controls}>
          <input
            type="text"
            placeholder="Search cryptocurrencies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Таблица криптовалют */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th 
                className={styles.sortableHeader}
                onClick={() => handleSort('market_cap_rank')}
              >
                Rank {sortBy === 'market_cap_rank' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th>Name</th>
              <th 
                className={styles.sortableHeader}
                onClick={() => handleSort('current_price')}
              >
                Price {sortBy === 'current_price' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className={styles.sortableHeader}
                onClick={() => handleSort('price_change_percentage_24h')}
              >
                24h % {sortBy === 'price_change_percentage_24h' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className={styles.sortableHeader}
                onClick={() => handleSort('market_cap')}
              >
                Market Cap {sortBy === 'market_cap' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedList.map((crypto) => (
              <tr 
                key={crypto.id} 
                className={styles.tableRow}
                onClick={() => handleCryptoSelect(crypto.id)}
              >
                <td className={styles.rankCell}>#{crypto.market_cap_rank}</td>
                <td className={styles.nameCell}>
                  <img 
                    src={crypto.image} 
                    alt={crypto.name}
                    className={styles.cryptoIcon}
                  />
                  <div>
                    <div className={styles.cryptoName}>{crypto.name}</div>
                    <div className={styles.cryptoSymbol}>{crypto.symbol.toUpperCase()}</div>
                  </div>
                </td>
                <td className={styles.priceCell}>{formatPrice(crypto.current_price)}</td>
                <td className={`${styles.changeCell} ${
                  crypto.price_change_percentage_24h >= 0 ? styles.positive : styles.negative
                }`}>
                  {formatPercent(crypto.price_change_percentage_24h)}
                </td>
                <td className={styles.marketCapCell}>
                  ${(crypto.market_cap / 1e9).toFixed(2)}B
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Сообщение, если ничего не найдено */}
        {filteredAndSortedList.length === 0 && searchQuery && (
          <div className={styles.noResults}>
            No cryptocurrencies found for "{searchQuery}"
          </div>
        )}
      </div>
    </Card>
  );
};

// Экспортируем компонент CryptoList по умолчанию
export default CryptoList;