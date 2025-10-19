import React, { createContext, useState, useContext, useEffect } from 'react';

// Создаем контекст для локализации
const LocaleContext = createContext(null);

// Поддерживаемые языки
export const SUPPORTED_LANGUAGES = {
  en: { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  ru: { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  fr: { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  de: { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  zh: { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  ja: { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  ar: { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
  he: { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', rtl: true }
};

// Провайдер локализации
export const LocaleProvider = ({ children }) => {
  // Получаем сохраненный язык из localStorage или используем язык браузера
  const getInitialLanguage = () => {
    const savedLanguage = localStorage.getItem('cryptoDashboardLanguage');
    if (savedLanguage && SUPPORTED_LANGUAGES[savedLanguage]) {
      return savedLanguage;
    }
    
    // Определяем язык браузера
    const browserLang = navigator.language.split('-')[0];
    return SUPPORTED_LANGUAGES[browserLang] ? browserLang : 'en';
  };

  const [currentLanguage, setCurrentLanguage] = useState(getInitialLanguage);
  const [translations, setTranslations] = useState({});

  // Загрузка переводов для выбранного языка
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const module = await import(`../locales/${currentLanguage}.json`);
        setTranslations(module.default);
      } catch (error) {
        console.error(`Failed to load translations for ${currentLanguage}:`, error);
        // Fallback to English
        const fallback = await import('../locales/en.json');
        setTranslations(fallback.default);
      }
    };

    loadTranslations();
  }, [currentLanguage]);

  // Функция для смены языка
  const changeLanguage = (languageCode) => {
    if (SUPPORTED_LANGUAGES[languageCode]) {
      setCurrentLanguage(languageCode);
      localStorage.setItem('cryptoDashboardLanguage', languageCode);
      
      // Обновляем атрибут lang у html элемента для доступности
      document.documentElement.lang = languageCode;
    }
  };

  // Функция для получения перевода по ключу
  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations;
    
    // Рекурсивно получаем значение по ключу
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        console.warn(`Translation key "${key}" not found for language "${currentLanguage}"`);
        return key; // Возвращаем ключ, если перевод не найден
      }
    }
    
    // Заменяем параметры в строке
    if (typeof value === 'string' && params) {
      return Object.keys(params).reduce((str, param) => {
        return str.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
      }, value);
    }
    
    return value;
  };

  // Получаем информацию о текущем языке
  const currentLanguageInfo = SUPPORTED_LANGUAGES[currentLanguage];

  const value = {
    currentLanguage,
    currentLanguageInfo,
    changeLanguage,
    t,
    supportedLanguages: SUPPORTED_LANGUAGES
  };
useEffect(() => {
  // Устанавливаем направление текста
  document.documentElement.dir = currentLanguageInfo.rtl ? 'rtl' : 'ltr';
}, [currentLanguageInfo]);
  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
};

// Хук для использования контекста локализации
export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};