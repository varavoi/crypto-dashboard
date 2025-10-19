import React from 'react';
import { usePWA } from '../../hooks/usePWA';
import styles from './InstallPrompt.module.css';

const InstallPrompt = () => {
  const { isInstallable, setIsInstallable,installApp, isStandalone } = usePWA();

  if (!isInstallable || isStandalone) {
    return null;
  }

  return (
    <div className={styles.installPrompt}>
      <div className={styles.content}>
        <div className={styles.text}>
          <strong>Install Crypto Dashboard</strong>
          <span>Get real-time crypto prices on your home screen</span>
        </div>
        <div className={styles.actions}>
          <button className={styles.installButton} onClick={installApp}>
            Install
          </button>
          <button 
            className={styles.dismissButton} 
            onClick={() => setIsInstallable(false)}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;