// Сервис для управления WebSocket соединением и реальными обновлениями цен
class WebSocketService {
  constructor() {
    // WebSocket соединение
    this.socket = null;
    // Колбэки для обработки сообщений
    this.messageHandlers = new Map();
    // Статус соединения
    this.isConnected = false;
    // Таймер переподключения
    this.reconnectTimer = null;
    // Максимальное количество попыток переподключения
    this.maxReconnectAttempts = 5;
    // Текущее количество попыток переподключения
    this.reconnectAttempts = 0;
    // ID подписок для отмены
    this.subscriptions = new Set();
  }

  // Подключение к WebSocket
  connect() {
    // Используем WebSocket от Binance для реальных данных о криптовалютах
    this.socket = new WebSocket('wss://stream.binance.com:9443/ws');
    
    // Обработчик открытия соединения
    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Восстанавливаем подписки после переподключения
      this.restoreSubscriptions();
      
      // Уведомляем обработчики о подключении
      this.notifyHandlers('connection', { type: 'connected' });
    };

    // Обработчик входящих сообщений
    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    // Обработчик закрытия соединения
    this.socket.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      this.isConnected = false;
      this.notifyHandlers('connection', { 
        type: 'disconnected', 
        code: event.code, 
        reason: event.reason 
      });
      
      // Пытаемся переподключиться, если это не было преднамеренным отключением
      if (event.code !== 1000) {
        this.attemptReconnect();
      }
    };

    // Обработчик ошибок
    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.notifyHandlers('connection', { type: 'error', error });
    };
  }

  // Попытка переподключения с экспоненциальной задержкой
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`Attempting reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  // Восстановление подписок после переподключения
  restoreSubscriptions() {
    if (this.subscriptions.size > 0) {
      console.log('Restoring subscriptions:', this.subscriptions);
      this.subscriptions.forEach(symbol => {
        this.subscribeToTicker(symbol);
      });
    }
  }

  // Обработка входящих сообщений
  handleMessage(data) {
    // Обрабатываем разные типы сообщений от Binance WebSocket
    if (data.e === '24hrTicker') {
      // Обновление тикера за 24 часа
      this.notifyHandlers('ticker', data);
    } else if (data.e === 'kline') {
      // Данные свечного графика
      this.notifyHandlers('kline', data);
    } else if (data.id === 1) {
      // Подтверждение подписки
      this.notifyHandlers('subscription', data);
    }
  }

  // Подписка на обновления тикера для конкретной криптовалюты
  subscribeToTicker(symbol) {
    if (!this.isConnected) {
      console.warn('WebSocket not connected, caching subscription:', symbol);
      this.subscriptions.add(symbol);
      return;
    }

    const subscribeMessage = {
      method: 'SUBSCRIBE',
      params: [`${symbol}@ticker`],
      id: 1
    };

    this.socket.send(JSON.stringify(subscribeMessage));
    this.subscriptions.add(symbol);
    console.log('Subscribed to:', symbol);
  }

  // Отписка от обновлений тикера
  unsubscribeFromTicker(symbol) {
    if (!this.isConnected) {
      this.subscriptions.delete(symbol);
      return;
    }

    const unsubscribeMessage = {
      method: 'UNSUBSCRIBE',
      params: [`${symbol}@ticker`],
      id: 2
    };

    this.socket.send(JSON.stringify(unsubscribeMessage));
    this.subscriptions.delete(symbol);
    console.log('Unsubscribed from:', symbol);
  }

  // Регистрация обработчика сообщений
  on(eventType, handler) {
    if (!this.messageHandlers.has(eventType)) {
      this.messageHandlers.set(eventType, new Set());
    }
    this.messageHandlers.get(eventType).add(handler);
  }

  // Удаление обработчика сообщений
  off(eventType, handler) {
    if (this.messageHandlers.has(eventType)) {
      this.messageHandlers.get(eventType).delete(handler);
    }
  }

  // Уведомление всех обработчиков определенного типа события
  notifyHandlers(eventType, data) {
    if (this.messageHandlers.has(eventType)) {
      this.messageHandlers.get(eventType).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error('Error in WebSocket handler:', error);
        }
      });
    }
  }

  // Закрытие соединения
  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.close(1000, 'Manual disconnect');
      this.socket = null;
    }

    this.isConnected = false;
    this.subscriptions.clear();
  }

  // Получение статуса соединения
  getConnectionStatus() {
    return this.isConnected;
  }

  // Получение текущих подписок
  getSubscriptions() {
    return Array.from(this.subscriptions);
  }
}

// Создаем и экспортируем singleton экземпляр
const websocketService = new WebSocketService();
export default websocketService;