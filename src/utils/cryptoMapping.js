// Утилита для преобразования символов криптовалют между CoinGecko и Binance
export const cryptoMapping = {
  'bitcoin': 'btcusdt',
  'ethereum': 'ethusdt',
  'ripple': 'xrpusdt',
  'litecoin': 'ltcusdt',
  'cardano': 'adausdt',
  'polkadot': 'dotusdt',
  'bitcoin-cash': 'bchusdt',
  'stellar': 'xlmusdt',
  'chainlink': 'linkusdt',
  'binancecoin': 'bnbusdt',
  'dogecoin': 'dogeusdt',
  'monero': 'xmusdt',
  'uniswap': 'uniusdt',
  'solana': 'solusdt',
  'avalanche-2': 'avaxusdt',
  'cosmos': 'atomusdt',
  'matic-network': 'maticusdt',
  'filecoin': 'filusdt',
  'internet-computer': 'icpusdt'
};

// Функция для получения символа Binance по ID CoinGecko
export const getBinanceSymbol = (coinGeckoId) => {
  return cryptoMapping[coinGeckoId] || null;
};

// Функция для получения ID CoinGecko по символу Binance
export const getCoinGeckoId = (binanceSymbol) => {
  for (const [coinGeckoId, symbol] of Object.entries(cryptoMapping)) {
    if (symbol === binanceSymbol.toLowerCase()) {
      return coinGeckoId;
    }
  }
  return null;
};

// Функция для извлечения базового символа из пары Binance
export const getBaseSymbol = (binanceSymbol) => {
  return binanceSymbol.replace('usdt', '').toUpperCase();
};