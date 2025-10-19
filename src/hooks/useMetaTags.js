import { useEffect } from 'react';

export const useMetaTags = (title, description, keywords) => {
  useEffect(() => {
    // Обновляем title
    if (title) {
      document.title = `${title} - Crypto Dashboard`;
    }

    // Обновляем meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && description) {
      metaDescription.setAttribute('content', description);
    }

    // Обновляем meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords && keywords) {
      metaKeywords.setAttribute('content', keywords);
    }

    // Обновляем Open Graph теги
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && title) {
      ogTitle.setAttribute('content', title);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription && description) {
      ogDescription.setAttribute('content', description);
    }

    // Восстанавливаем оригинальные значения при размонтировании
    return () => {
      document.title = 'Crypto Dashboard - Real-time Cryptocurrency Tracking';
      
      if (metaDescription) {
        metaDescription.setAttribute('content', 'Real-time cryptocurrency dashboard with live price updates, interactive charts, and comprehensive market data. Track Bitcoin, Ethereum, and other cryptocurrencies.');
      }
      
      if (metaKeywords) {
        metaKeywords.setAttribute('content', 'cryptocurrency, bitcoin, ethereum, crypto prices, market data, trading, blockchain');
      }
      
      if (ogTitle) {
        ogTitle.setAttribute('content', 'Crypto Dashboard - Real-time Cryptocurrency Tracking');
      }
      
      if (ogDescription) {
        ogDescription.setAttribute('content', 'Track cryptocurrency prices in real-time with interactive charts and comprehensive market data.');
      }
    };
  }, [title, description, keywords]);
};