import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { useCrypto } from '../../contexts/CryptoContext';
import Card from '../Card/Card';
import styles from './AddToPortfolio.module.css';

const AddToPortfolio = ({ cryptoId, onClose }) => {
  const { addToPortfolio } = usePortfolio();
  const { cryptoList } = useCrypto();
  
  const [amount, setAmount] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [notes, setNotes] = useState('');

  // Находим данные о криптовалюте
  const cryptoData = cryptoList.find(crypto => crypto.id === cryptoId);

  useEffect(() => {
    if (cryptoData) {
      setCurrentPrice(cryptoData.current_price);
      setPurchasePrice(cryptoData.current_price.toFixed(2));
    }
  }, [cryptoData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!amount || !purchasePrice) {
      alert('Please fill in all required fields');
      return;
    }

    addToPortfolio({
      cryptoId,
      name: cryptoData?.name || 'Unknown',
      symbol: cryptoData?.symbol || '???',
      amount: parseFloat(amount),
      purchasePrice: parseFloat(purchasePrice),
      notes,
      addedAt: new Date().toISOString()
    });

    // Сброс формы и закрытие
    setAmount('');
    setNotes('');
    if (onClose) onClose();
  };

  const calculateTotal = () => {
    return (parseFloat(amount) || 0) * (parseFloat(purchasePrice) || 0);
  };

  if (!cryptoData) {
    return (
      <Card className={styles.container}>
        <div className={styles.error}>Cryptocurrency data not available</div>
      </Card>
    );
  }

  return (
    <Card className={styles.container}>
      <div className={styles.header}>
        <h3>Add {cryptoData.name} to Portfolio</h3>
        {onClose && (
          <button className={styles.closeButton} onClick={onClose}>×</button>
        )}
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="amount">Amount ({cryptoData.symbol.toUpperCase()})</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.000001"
            min="0"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="purchasePrice">Purchase Price (USD)</label>
          <input
            type="number"
            id="purchasePrice"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />
          <div className={styles.priceInfo}>
            Current price: ${currentPrice.toLocaleString()}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="notes">Notes (Optional)</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this purchase..."
            rows="3"
          />
        </div>

        <div className={styles.summary}>
          <div className={styles.total}>
            Total Investment: <strong>${calculateTotal().toLocaleString()}</strong>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={styles.addButton}>
            Add to Portfolio
          </button>
        </div>
      </form>
    </Card>
  );
};

export default AddToPortfolio;