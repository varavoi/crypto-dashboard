import React from 'react';
import { useCrypto } from '../../contexts/CryptoContext';
import { useLocale } from '../../contexts/LocaleContext';
import styles from './ConnectionStatus.module.css';

const ConnectionStatus = () => {
  const { connectionStatus } = useCrypto();
  const { t } = useLocale();

  const getStatusInfo = () => {
    switch (connectionStatus) {
      case 'connected':
        return { text: t('connection.connected'), className: styles.connected, icon: '🟢' };
      case 'connecting':
        return { text: t('connection.connecting'), className: styles.connecting, icon: '🟡' };
      case 'disconnected':
        return { text: t('connection.disconnected'), className: styles.disconnected, icon: '🔴' };
      case 'error':
        return { text: t('connection.error'), className: styles.error, icon: '🔴' };
      default:
        return { text: 'Unknown', className: styles.disconnected, icon: '⚫' };
    }
  };

  const statusInfo = getStatusInfo();

  if (connectionStatus === 'disconnected') {
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