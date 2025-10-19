// Импортируем React и создаем контекст темы
import React, { createContext, useContext, useState, useEffect } from 'react';

// Создаем контекст для темы
const ThemeContext = createContext();

// Провайдер темы
export const ThemeProvider = ({ children }) => {
  // Получаем сохраненную тему из localStorage или используем светлую по умолчанию
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('cryptoDashboardTheme');
    return savedTheme ? JSON.parse(savedTheme) : false;
  });

  // Эффект для сохранения темы в localStorage и применения к документу
  useEffect(() => {
    localStorage.setItem('cryptoDashboardTheme', JSON.stringify(isDarkMode));
    
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isDarkMode]);

  // Функция для переключения темы
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const value = {
    isDarkMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Хук для использования темы
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Компонент переключателя темы
const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button 
      className={`theme-toggle ${isDarkMode ? 'dark' : 'light'}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      {isDarkMode ? '☀️' : '🌙'}
    </button>
  );
};

export default ThemeToggle;