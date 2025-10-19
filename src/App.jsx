// Импортируем React
import React from 'react';
// Импортируем CSS-модуль для стилей
import styles from './App.module.css';
// Импортируем наш провайдер для состояния криптовалют
import { CryptoProvider } from './contexts/CryptoContext';
// Импортируем компоненты
import Header from './components/Header/Header';
import Dashboard from './components/Dashboard/Dashboard';

// Главный компонент приложения
function App() {
  return (
    // Оборачиваем все приложение в CryptoProvider для доступа к состоянию криптовалют
    <CryptoProvider>
      <div className={styles.app}>
        {/* Компонент заголовка */}
        <Header />
        
        {/* Основное содержимое - Dashboard */}
        <main>
          <Dashboard />
        </main>
      </div>
    </CryptoProvider>
  );
}

// Экспортируем компонент App по умолчанию
export default App;