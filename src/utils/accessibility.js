// Утилиты для улучшения доступности
export const focusManagement = {
  // Сохраняет фокус при закрытии модальных окон
  saveFocus: () => {
    return document.activeElement;
  },

  // Восстанавливает фокус
  restoreFocus: (element) => {
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  },

  // Ловушка фокуса для модальных окон
  createFocusTrap: (element) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    element.addEventListener('keydown', handleKeyDown);

    // Возвращаем функцию очистки
    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }
};

// Утилиты для клавиатурной навигации
export const keyboardNavigation = {
  // Обработчик для навигации стрелками
  handleArrowNavigation: (event, items, currentIndex, setIndex) => {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        setIndex((prevIndex) => (prevIndex + 1) % items.length);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        setIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
        break;
      case 'Home':
        event.preventDefault();
        setIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setIndex(items.length - 1);
        break;
      default:
        break;
    }
  },

  // Генератор уникальных ID для accessibility
  generateId: (prefix = 'id') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }
};

// Утилиты для обработки ошибок
export const errorHandling = {
  // Graceful degradation для API ошибок
  handleApiError: (error, fallbackData = null) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 429:
          return { error: 'Rate limit exceeded. Please try again later.' };
        case 500:
          return { error: 'Server error. Please try again later.' };
        default:
          return { error: 'An error occurred while fetching data.' };
      }
    } else if (error.request) {
      // Network error
      return { error: 'Network error. Please check your connection.' };
    } else {
      // Other errors
      return { error: 'An unexpected error occurred.' };
    }
  },

  // Retry mechanism с экспоненциальной backoff
  retryWithBackoff: async (fn, retries = 3, delay = 1000) => {
    try {
      return await fn();
    } catch (error) {
      if (retries === 0) throw error;
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
  }
};