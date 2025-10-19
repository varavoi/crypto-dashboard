// Импортируем React
import React from 'react';
// Импортируем CSS-модуль для стилей
import styles from './App.module.css';
// Импортируем наш провайдер для состояния криптовалют
import { CryptoProvider } from './contexts/CryptoContext';
// Импортируем компонент Header (создадим его следующим)
import Header from './components/Header/Header';

// Главный компонент приложения
function App() {
  return (
    // Оборачиваем все приложение в CryptoProvider для доступа к состоянию криптовалют
    <CryptoProvider>
      <div className={styles.app}>
        {/* Компонент заголовка */}
        <Header />
        {/* Основное содержимое будет добавляться здесь */}
        <main>
          <p>Dashboard content will be added in the next steps...</p>
        </main>
      </div>
    </CryptoProvider>
  );
}

// Экспортируем компонент App по умолчанию
export default App;