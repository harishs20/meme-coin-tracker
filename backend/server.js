const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const { startMarketSimulation, getCoinData, getPriceHistory } = require('./services/marketData');
const { startSocialSimulation, getSocialData } = require('./services/socialData');
const { getAIPrediction } = require('./services/aiPredictor');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// Initialize simulation
startMarketSimulation();
startSocialSimulation();

let globalFG = 42;

// Real-time broadcast loop
setInterval(() => {
  globalFG = Math.max(0, Math.min(100, globalFG + (Math.random() - 0.5) * 5));
  
  const marketData = getCoinData();
  const socialData = getSocialData();
  const history = getPriceHistory();
  
  // Combine data
  const combinedData = {};
  for (const coinId in marketData) {
    if (socialData[coinId]) {
      combinedData[coinId] = {
        ...marketData[coinId],
        ...socialData[coinId],
        score: Math.floor((socialData[coinId].sentiment + socialData[coinId].velocity) / 2)
      };
    }
  }

  io.emit('dashboard_update', {
    coins: combinedData,
    history: history,
    globalFG: globalFG,
  });
}, 3000);

// API route for AI Oracle prediction
app.post('/api/predict', async (req, res) => {
  try {
    const { coinName, coinId, sentiment, velocity, trend } = req.body;
    const prediction = await getAIPrediction(coinName, coinId, sentiment, velocity, trend);
    res.json({ prediction });
  } catch (err) {
    res.status(500).json({ error: 'Prediction failed' });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Meme Coin Intelligence Server running on port ${PORT}`);
});
