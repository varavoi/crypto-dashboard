import React, { useState } from 'react';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { useCrypto } from '../../contexts/CryptoContext';
import Card from '../Card/Card';
import styles from './PriceAlerts.module.css';

const PriceAlerts = () => {
  const { 
    notifications, 
    addPriceAlert, 
    removeAlert, 
    toggleAlert,
    notificationSettings,
    updateNotificationSettings 
  } = usePortfolio();
  
  const { cryptoList } = useCrypto();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState('above');

  const handleAddAlert = (e) => {
    e.preventDefault();
    
    if (!selectedCrypto || !targetPrice) {
      alert('Please select a cryptocurrency and set a target price');
      return;
    }

    addPriceAlert(selectedCrypto, parseFloat(targetPrice), condition);
    
    // Сброс формы
    setSelectedCrypto('');
    setTargetPrice('');
    setCondition('above');
    setShowAddForm(false);
  };

  const getCryptoName = (cryptoId) => {
    const crypto = cryptoList.find(c => c.id === cryptoId);
    return crypto ? crypto.name : 'Unknown';
  };

  const getCurrentPrice = (cryptoId) => {
    const crypto = cryptoList.find(c => c.id === cryptoId);
    return crypto ? crypto.current_price : 0;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <Card className={styles.priceAlerts}>
      <div className={styles.header}>
        <h3>Price Alerts</h3>
        <button 
          className={styles.addButton}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : '+ Add Alert'}
        </button>
      </div>

      {/* Форма добавления уведомления */}
      {showAddForm && (
        <form onSubmit={handleAddAlert} className={styles.alertForm}>
          <div className={styles.formGroup}>
            <label htmlFor="cryptoSelect">Cryptocurrency</label>
            <select 
              id="cryptoSelect"
              value={selectedCrypto}
              onChange={(e) => setSelectedCrypto(e.target.value)}
              required
            >
              <option value="">Select cryptocurrency</option>
              {cryptoList.map(crypto => (
                <option key={crypto.id} value={crypto.id}>
                  {crypto.name} ({crypto.symbol.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="condition">Alert when price is</label>
            <select 
              id="condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            >
              <option value="above">Above</option>
              <option value="below">Below</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="targetPrice">Target Price (USD)</label>
            <input
              type="number"
              id="targetPrice"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
            {selectedCrypto && (
              <div className={styles.priceInfo}>
                Current price: {formatCurrency(getCurrentPrice(selectedCrypto))}
              </div>
            )}
          </div>

          <button type="submit" className={styles.submitButton}>
            Create Alert
          </button>
        </form>
      )}

      {/* Настройки уведомлений */}
      <div className={styles.settings}>
        <h4>Notification Settings</h4>
        <div className={styles.settingItem}>
          <label className={styles.switch}>
            <input 
              type="checkbox" 
              checked={notificationSettings.enabled}
              onChange={(e) => updateNotificationSettings({ enabled: e.target.checked })}
            />
            <span className={styles.slider}></span>
            Enable notifications
          </label>
        </div>
        <div className={styles.settingItem}>
          <label className={styles.switch}>
            <input 
              type="checkbox" 
              checked={notificationSettings.sound}
              onChange={(e) => updateNotificationSettings({ sound: e.target.checked })}
              disabled={!notificationSettings.enabled}
            />
            <span className={styles.slider}></span>
            Play sound
          </label>
        </div>
        <div className={styles.settingItem}>
          <label className={styles.switch}>
            <input 
              type="checkbox" 
              checked={notificationSettings.browserAlerts}
              onChange={(e) => updateNotificationSettings({ browserAlerts: e.target.checked })}
              disabled={!notificationSettings.enabled}
            />
            <span className={styles.slider}></span>
            Browser notifications
          </label>
        </div>
      </div>

      {/* Список уведомлений */}
      <div className={styles.alertsList}>
        {notifications.length === 0 ? (
          <div className={styles.emptyState}>
            No price alerts set up yet
          </div>
        ) : (
          notifications.map(alert => {
            const currentPrice = getCurrentPrice(alert.cryptoId);
            const isActive = currentPrice && (
              (alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
              (alert.condition === 'below' && currentPrice <= alert.targetPrice)
            );

            return (
              <div key={alert.id} className={`${styles.alertItem} ${isActive ? styles.active : ''}`}>
                <div className={styles.alertInfo}>
                  <div className={styles.alertHeader}>
                    <span className={styles.cryptoName}>{getCryptoName(alert.cryptoId)}</span>
                    <span className={styles.alertStatus}>
                      {isActive ? '🔔 Active' : '💤 Inactive'}
                    </span>
                  </div>
                  <div className={styles.alertCondition}>
                    Alert when price is {alert.condition} {formatCurrency(alert.targetPrice)}
                  </div>
                  <div className={styles.currentPrice}>
                    Current: {formatCurrency(currentPrice)}
                  </div>
                </div>
                
                <div className={styles.alertActions}>
                  <button 
                    className={styles.toggleButton}
                    onClick={() => toggleAlert(alert.id)}
                    title={alert.enabled ? 'Disable alert' : 'Enable alert'}
                  >
                    {alert.enabled ? '⏸️' : '▶️'}
                  </button>
                  <button 
                    className={styles.deleteButton}
                    onClick={() => removeAlert(alert.id)}
                    title="Delete alert"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};

export default PriceAlerts;