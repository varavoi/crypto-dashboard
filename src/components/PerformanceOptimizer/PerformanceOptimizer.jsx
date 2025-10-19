import React, { memo, useMemo, useCallback, useEffect, useState } from 'react';

// Оптимизированный компонент карточки
export const OptimizedDataCard = memo(({ title, value, change, additionalInfo, isLoading }) => {
  const changeClass = change >= 0 ? 'positive' : 'negative';
  const formattedChange = change >= 0 ? `+${change}%` : `${change}%`;

  if (isLoading) {
    return (
      <div className="card">
        <div className="skeleton-title"></div>
        <div className="skeleton-value"></div>
        <div className="skeleton-change"></div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3>{title}</h3>
      <div className="value">{value}</div>
      <div className="info-container">
        <span className={`change ${changeClass}`}>{formattedChange}</span>
        {additionalInfo && <span className="additional-info">{additionalInfo}</span>}
      </div>
    </div>
  );
});

// Хук для троттлинга
export const useThrottle = (value, delay) => {
  const [throttledValue, setThrottledValue] = useState(value);
  const [lastExecuted, setLastExecuted] = useState(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      const now = Date.now();
      if (now - lastExecuted >= delay) {
        setThrottledValue(value);
        setLastExecuted(now);
      }
    }, delay - (Date.now() - lastExecuted));

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay, lastExecuted]);

  return throttledValue;
};

// Хук для дебаунсинга
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Компонент для мониторинга производительности
export const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memory: 0,
    components: 0
  });

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        setMetrics(prev => ({
          ...prev,
          fps: Math.round((frameCount * 1000) / (currentTime - lastTime))
        }));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationFrameId = requestAnimationFrame(measureFPS);
    };

    // Мониторинг использования памяти (только в браузерах с поддержкой)
    const measureMemory = () => {
      if ('memory' in performance) {
        setMetrics(prev => ({
          ...prev,
          memory: Math.round(performance.memory.usedJSHeapSize / 1048576) // MB
        }));
      }
    };

    measureFPS();
    const memoryInterval = setInterval(measureMemory, 2000);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(memoryInterval);
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 10000,
      fontFamily: 'monospace'
    }}>
      <div>FPS: {metrics.fps}</div>
      <div>Memory: {metrics.memory}MB</div>
      <div>Components: {metrics.components}</div>
    </div>
  );
};

// HOC для логирования рендеров (только для разработки)
export const withRenderLog = (WrappedComponent, componentName) => {
  return function WithRenderLog(props) {
    useEffect(() => {
      console.log(`%c${componentName} rendered`, 'color: #4CAF50; font-weight: bold;');
    });

    return <WrappedComponent {...props} />;
  };
};