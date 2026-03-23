const { Anthropic } = require('@anthropic-ai/sdk');

// Ensure you have ANTHROPIC_API_KEY in your .env
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy_key',
});

async function getAIPrediction(coinName, coinId, sentiment, velocity, trend) {
  
  // If no real API key is provided, return a simulated prediction
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'dummy_key') {
     return simulatePrediction(coinName, sentiment, velocity, trend);
  }

  try {
    const msg = await anthropic.messages.create({
      model: "claude-3-haiku-20240307", 
      max_tokens: 1000,
      system: "You are CryptoOracle, an AI analyst for meme coin trends. Be concise, punchy, bold, use emojis, and sound like a native crypto trader.",
      messages: [
        {
          role: "user",
          content: `Analyze this data and give a SHORT prediction (3 sentences max).
Coin: ${coinName} (${coinId})
Sentiment Score: ${sentiment}/100
Viral Velocity: ${velocity}/100
Trend: ${trend}

Give: 1) Price direction prediction 2) Key risk/opportunity 3) Social signal strength rating (X/10). Keep it under 60 words.`
        }
      ]
    });
    return msg.content[0].text;
  } catch (error) {
    console.error("AI Oracle Error:", error.message);
    return simulatePrediction(coinName, sentiment, velocity, trend);
  }
}

function simulatePrediction(coinName, sentiment, velocity, trend) {
    const directions = sentiment > 60 ? ["🚀 Sending it higher!", "🔥 Melting faces next week."] : ["💀 Looks dead.", "🔻 Dump incoming."];
    const risk = velocity > 70 ? "High FOMO, risk of rug is elevated." : "Steady accumulation, decent entry.";
    const rating = Math.floor((sentiment + velocity) / 20); // 1-10
    
    return `${directions[Math.floor(Math.random() * directions.length)]} ${risk} Social signal strength: ${rating}/10. (Simulated Output without API Key)`;
}

module.exports = {
  getAIPrediction
};
