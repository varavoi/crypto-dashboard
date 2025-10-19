class NotificationService {
  constructor() {
    this.permission = null;
    this.checkPermission();
  }

  // Проверка разрешения на уведомления
  async checkPermission() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      this.permission = 'unsupported';
      return;
    }

    this.permission = Notification.permission;
    
    if (this.permission === 'default') {
      // Запрашиваем разрешение при первом использовании
      this.permission = await Notification.requestPermission();
    }
  }

  // Показ уведомления
  showNotification(title, options = {}) {
    if (this.permission !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    const notificationOptions = {
      icon: '/logo192.png',
      badge: '/logo192.png',
      ...options
    };

    // Показываем браузерное уведомление
    const notification = new Notification(title, notificationOptions);

    // Обработчик клика по уведомлению
    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Автоматическое закрытие через 5 секунд
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  }

  // Уведомление о достижении цены
  showPriceAlert(cryptoName, targetPrice, currentPrice, condition) {
    const title = `Price Alert: ${cryptoName}`;
    const body = `Price is ${condition} ${targetPrice}. Current: ${currentPrice}`;
    
    this.showNotification(title, {
      body,
      tag: 'price-alert',
      requireInteraction: true
    });

    // Воспроизведение звука (если разрешено)
    this.playNotificationSound();
  }

  // Воспроизведение звука уведомления
  playNotificationSound() {
    const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA');
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Audio play failed:', e));
  }

  // Проверка поддержки уведомлений
  isSupported() {
    return 'Notification' in window;
  }

  // Получение текущего разрешения
  getPermission() {
    return this.permission;
  }

  // Запрос разрешения
  async requestPermission() {
    if (!this.isSupported()) return 'unsupported';
    
    this.permission = await Notification.requestPermission();
    return this.permission;
  }
}

// Создаем и экспортируем singleton экземпляр
const notificationService = new NotificationService();
export default notificationService;