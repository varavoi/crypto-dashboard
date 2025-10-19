import React, { lazy, Suspense } from 'react';
import styles from './App.module.css';
import { CryptoProvider } from './contexts/CryptoContext';
import { PortfolioProvider } from './contexts/PortfolioContext';
import { ThemeProvider } from './components/ThemeToggle/ThemeToggle';
import { PerformanceMonitor } from './components/PerformanceOptimizer/PerformanceOptimizer';
import { useMetaTags } from './hooks/useMetaTags';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';

// Ленивая загрузка компонентов для оптимизации
const Header = lazy(() => import('./components/Header/Header'));
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const Notification = lazy(() => import('./components/Notification/Notification'));
const InstallPrompt = lazy(() => import('./components/InstallPrompt/InstallPrompt'));

function App() {
  // Устанавливаем мета-теги для SEO
  useMetaTags(
    'Real-time Cryptocurrency Dashboard',
    'Track cryptocurrency prices in real-time with interactive charts, portfolio management, and price alerts.',
    'crypto, cryptocurrency, bitcoin, ethereum, portfolio, trading, alerts, dashboard'
  );

  return (
    <ThemeProvider>
      <CryptoProvider>
        <PortfolioProvider>
          <div className={styles.app}>
            {/* Монитор производительности (только в development) */}
            {process.env.NODE_ENV === 'development' && <PerformanceMonitor />}
            
            <Suspense fallback={<LoadingSpinner size="large" text="Loading Dashboard..." />}>
              <Notification />
              <InstallPrompt />
              <Header />
              <main>
                <Dashboard />
              </main>
            </Suspense>
          </div>
        </PortfolioProvider>
      </CryptoProvider>
    </ThemeProvider>
  );
}

export default App;