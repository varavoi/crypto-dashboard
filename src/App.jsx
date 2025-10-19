import React from 'react';
import styles from './App.module.css';
import { CryptoProvider } from './contexts/CryptoContext';
import { PortfolioProvider } from './contexts/PortfolioContext';
import { ThemeProvider } from './components/ThemeToggle/ThemeToggle';
import Header from './components/Header/Header';
import Dashboard from './components/Dashboard/Dashboard';
import Notification from './components/Notification/Notification';
import InstallPrompt from './components/InstallPrompt/InstallPrompt';

function App() {
  return (
    <ThemeProvider>
      <CryptoProvider>
        <PortfolioProvider>
          <div className={styles.app}>
            <Notification />
            <InstallPrompt />
            <Header />
            <main>
              <Dashboard />
            </main>
          </div>
        </PortfolioProvider>
      </CryptoProvider>
    </ThemeProvider>
  );
}

export default App;