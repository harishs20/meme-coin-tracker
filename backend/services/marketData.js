const axios = require('axios');

// Map internal internal tickers to CoinGecko URL path parameters
const COINGECKO_IDS = {
  "DOGE": "dogecoin",
  "PEPE": "pepe",
  "SHIB": "shiba-inu",
  "FLOKI": "floki",
  "BONK": "bonk",
  "WIF": "dogwifcoin"
};

const COINS = Object.keys(COINGECKO_IDS);
const coinData = {};
const priceHistory = {};

let fetchCounter = 0;

async function fetchRealMarketData() {
  try {
    const ids = Object.values(COINGECKO_IDS).join(',');
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true`;
    
    // Make actual API request to CoinGecko
    const response = await axios.get(url);
    const data = response.data;

    COINS.forEach(id => {
      const cgId = COINGECKO_IDS[id];
      if (data[cgId]) {
        const currentPrice = data[cgId].usd;
        
        // Populate real coin data
        coinData[id] = {
            id: id,
            prevPrice: coinData[id] ? coinData[id].price : currentPrice,
            price: currentPrice,
            volume: (data[cgId].usd_24h_vol / 1000000).toFixed(1) + "M",
            change24h: data[cgId].usd_24h_change || 0,
        };

        // Initialize mock price history shape on first load
        if (!priceHistory[id]) {
            priceHistory[id] = Array.from({ length: 30 }, () => currentPrice * (1 + (Math.random() - 0.5) * 0.05));
        }
        
        // Push actual live price onto the end of the history array
        if (fetchCounter % 4 === 0) {
            priceHistory[id] = [...priceHistory[id].slice(-29), currentPrice];
        }
      }
    });

    fetchCounter++;
    
    console.log("✅ Fetched live CoinGecko market data at", new Date().toLocaleTimeString());
  } catch (error) {
    console.error("❌ Error fetching CoinGecko data:", error.message);
  }
}

function startMarketSimulation() {
  // Fetch real data immediately
  fetchRealMarketData();
  
  // Poll every 15 seconds to respect free-tier rate limits (~30 requests/min maximum)
  setInterval(fetchRealMarketData, 15000);
}

function getCoinData() {
  return coinData;
}

function getPriceHistory() {
  return priceHistory;
}

module.exports = {
  startMarketSimulation, // exported the exact same function name so server.js doesn't break
  getCoinData,
  getPriceHistory
};
