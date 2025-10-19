import React from 'react';
import { useCrypto } from '../../contexts/CryptoContext';
import styles from './ConnectionStatus.module.css';

const ConnectionStatus = () => {
  const { connectionStatus, isRealtimeConnected } = useCrypto();

  const getStatusInfo = () => {
    switch (connectionStatus) {
      case 'connected':
        return { text: 'Real-time', className: styles.connected, icon: '🟢' };
      case 'connecting':
        return { text: 'Connecting...', className: styles.connecting, icon: '🟡' };
      case 'disconnected':
        return { text: 'Offline', className: styles.disconnected, icon: '🔴' };
      case 'error':
        return { text: 'Connection Error', className: styles.error, icon: '🔴' };
      default:
        return { text: 'Unknown', className: styles.disconnected, icon: '⚫' };
    }
  };

  const statusInfo = getStatusInfo();

  if (!isRealtimeConnected) {
    return null;
  }

  return (
    <div className={`${styles.connectionStatus} ${statusInfo.className}`}>
      <span className={styles.icon}>{statusInfo.icon}</span>
      <span className={styles.text}>{statusInfo.text}</span>
    </div>
  );
};

export default ConnectionStatus;