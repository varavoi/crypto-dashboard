import React, { useState, useRef, useEffect } from 'react';
import { useLocale, SUPPORTED_LANGUAGES } from '../../contexts/LocaleContext';
import styles from './LanguageSwitcher.module.css';

const LanguageSwitcher = () => {
  const { currentLanguage, currentLanguageInfo, changeLanguage, t } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Закрытие dropdown при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.languageSwitcher} ref={dropdownRef}>
      <button 
        className={styles.languageButton}
        onClick={toggleDropdown}
        aria-label={t('language.select')}
        title={t('language.select')}
      >
        <span className={styles.flag}>{currentLanguageInfo.flag}</span>
        <span className={styles.languageCode}>{currentLanguageInfo.code.toUpperCase()}</span>
        <span className={`${styles.arrow} ${isOpen ? styles.open : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          {Object.values(SUPPORTED_LANGUAGES).map((language) => (
            <button
              key={language.code}
              className={`${styles.dropdownItem} ${
                currentLanguage === language.code ? styles.active : ''
              }`}
              onClick={() => handleLanguageChange(language.code)}
            >
              <span className={styles.flag}>{language.flag}</span>
              <div className={styles.languageInfo}>
                <span className={styles.languageName}>{language.nativeName}</span>
                <span className={styles.languageEnglish}>{language.name}</span>
              </div>
              {currentLanguage === language.code && (
                <span className={styles.checkmark}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;