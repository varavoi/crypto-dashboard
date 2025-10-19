import React, {useState} from 'react';
import styles from './App.module.css'

function App() {
  const [message] = useState('Crypto Dashboard is initializing...')
  return (
     <div className={styles.app}>
      {/* Заголовок первого уровня */}
      <h1>Crypto Dashboard</h1>
      {/* Отображаем значение из состояния message */}
      <p>{message}</p>
    </div>
  );
}

export default App;
