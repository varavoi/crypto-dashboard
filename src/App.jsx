import React from 'react';
import styles from './App.module.css';
import { CryptoProvider } from './contexts/CryptoContext';
import { ThemeProvider } from './components/ThemeToggle/ThemeToggle';
import Header from './components/Header/Header';
import Dashboard from './components/Dashboard/Dashboard';
import Notification from './components/Notification/Notification';

function App() {
  return (
    <ThemeProvider>
      <CryptoProvider>
        <div className={styles.app}>
          <Notification />
          <Header />
          <main>
            <Dashboard />
          </main>
        </div>
      </CryptoProvider>
    </ThemeProvider>
  );
}

export default App;