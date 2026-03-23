const axios = require('axios');

// Map internal tickers to CoinGecko URL path parameters
const COINGECKO_IDS = {
  "DOGE": "dogecoin",
  "PEPE": "pepe",
  "SHIB": "shiba-inu",
  "FLOKI": "floki",
  "BONK": "bonk",
  "WIF": "dogwifcoin"
};

// Fallback base prices when API is unavailable
const FALLBACK_PRICES = {
  "DOGE": 0.165,
  "PEPE": 0.0000089,
  "SHIB": 0.0000135,
  "FLOKI": 0.000142,
  "BONK": 0.0000198,
  "WIF": 1.72
};

const COINS = Object.keys(COINGECKO_IDS);
const coinData = {};
const priceHistory = {};
let apiAvailable = false;
let fetchCounter = 0;

// Initialize with simulated data immediately so dashboard always has data
function initFallbackData() {
  COINS.forEach(id => {
    const basePrice = FALLBACK_PRICES[id];
    coinData[id] = {
      id: id,
      prevPrice: basePrice,
      price: basePrice,
      volume: (Math.random() * 500 + 50).toFixed(1) + "M",
      change24h: (Math.random() - 0.5) * 10,
    };
    priceHistory[id] = Array.from({ length: 30 }, () =>
      basePrice * (1 + (Math.random() - 0.5) * 0.06)
    );
  });
  console.log("📊 Initialized fallback simulated market data.");
}

// Simulate small random price movements (used when CoinGecko is unavailable)
function simulatePriceMovements() {
  COINS.forEach(id => {
    if (coinData[id]) {
      const prev = coinData[id].price;
      const volatility = 0.015; // 1.5% max movement per tick
      const newPrice = prev * (1 + (Math.random() - 0.48) * volatility);
      coinData[id].prevPrice = prev;
      coinData[id].price = newPrice;
      coinData[id].change24h += (Math.random() - 0.5) * 0.3;
      priceHistory[id] = [...(priceHistory[id] || []).slice(-29), newPrice];
    }
  });
}

async function fetchRealMarketData() {
  try {
    const ids = Object.values(COINGECKO_IDS).join(',');
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true`;
    
    const response = await axios.get(url, { timeout: 8000 });
    const data = response.data;

    COINS.forEach(id => {
      const cgId = COINGECKO_IDS[id];
      if (data[cgId]) {
        const currentPrice = data[cgId].usd;
        coinData[id] = {
          id: id,
          prevPrice: coinData[id] ? coinData[id].price : currentPrice,
          price: currentPrice,
          volume: (data[cgId].usd_24h_vol / 1000000).toFixed(1) + "M",
          change24h: data[cgId].usd_24h_change || 0,
        };
        if (!priceHistory[id]) {
          priceHistory[id] = Array.from({ length: 30 }, () => currentPrice * (1 + (Math.random() - 0.5) * 0.05));
        }
        if (fetchCounter % 4 === 0) {
          priceHistory[id] = [...priceHistory[id].slice(-29), currentPrice];
        }
      }
    });

    apiAvailable = true;
    fetchCounter++;
    console.log("✅ Fetched live CoinGecko market data at", new Date().toLocaleTimeString());
  } catch (error) {
    console.error("❌ Error fetching CoinGecko data:", error.message);
    // Use simulated price movements when API fails
    simulatePriceMovements();
    console.log("📊 Used simulated price movement at", new Date().toLocaleTimeString());
  }
}

function startMarketSimulation() {
  // Always init fallback data first so there's never empty data
  initFallbackData();
  
  // Try fetching real data
  fetchRealMarketData();
  
  // Poll every 15 seconds for real data, simulate in between
  setInterval(fetchRealMarketData, 15000);
  
  // Simulate price movements every 3 seconds for smooth live updates
  setInterval(() => {
    if (!apiAvailable) {
      simulatePriceMovements();
    }
  }, 3000);
}

function getCoinData() {
  return coinData;
}

function getPriceHistory() {
  return priceHistory;
}

module.exports = {
  startMarketSimulation,
  getCoinData,
  getPriceHistory
};
