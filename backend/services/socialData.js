const axios = require('axios');
const Sentiment = require('sentiment');

const sentimentAnalyzer = new Sentiment();

const COINS = ["DOGE", "PEPE", "SHIB", "FLOKI", "BONK", "WIF"];

// Search terms to find relevant Reddit posts
const SEARCH_TERMS = {
  "DOGE": "dogecoin OR doge",
  "PEPE": "pepecoin OR $PEPE",
  "SHIB": "shibainu OR shib",
  "FLOKI": "floki",
  "BONK": "bonk AND solana",
  "WIF": "dogwifhat OR wif"
};

const PLATFORMS = ["Reddit"];
const socialData = {};

function initData() {
  COINS.forEach(id => {
    socialData[id] = {
      sentiment: 50,
      mentions: 5000,
      velocity: 50,
      hypePhase: 20,
      platforms: { "Reddit": 50 }
    };
  });
}

async function scrapeRedditForCoin(coinId) {
  try {
    const q = encodeURIComponent(SEARCH_TERMS[coinId]);
    const url = `https://www.reddit.com/search.json?q=${q}&sort=new&limit=20`;
    
    // Reddit requires a custom User-Agent to avoid immediate blocking
    const response = await axios.get(url, {
      headers: { "User-Agent": "MemeRadarBot/1.0 (script by User)" },
      timeout: 10000
    });
    
    const posts = response.data.data.children;
    let totalScore = 0;
    let postCount = posts.length;
    let recentMessages = [];
    
    posts.forEach(post => {
      const title = post.data.title || "";
      const text = `${title} ${post.data.selftext || ''}`;
      // Run NLP tokenization and scoring
      const result = sentimentAnalyzer.analyze(text);
      totalScore += result.score;
      
      if (recentMessages.length < 5 && title.length > 5) {
        recentMessages.push({
          id: post.data.id || Date.now() + Math.random(),
          text: title.substring(0, 100) + (title.length > 100 ? "..." : ""),
          platform: "🤖 Reddit",
          time: new Date((post.data.created_utc || (Date.now()/1000)) * 1000).toLocaleTimeString(),
          sentiment: result.score > 0 ? "positive" : result.score < 0 ? "negative" : "neutral",
        });
      }
    });

    // Normalize sentiment into a 0-100 scale
    // Avg score per post. Let's say -2 is extremely negative, +2 is extremely positive.
    const avgScore = postCount > 0 ? totalScore / postCount : 0;
    
    // Convert -2 / +2 to 0 / 100 scale (where 0 is 50)
    let normalizedSentiment = 50 + (avgScore * 25);
    normalizedSentiment = Math.max(0, Math.min(100, Math.floor(normalizedSentiment)));
    
    // Velocity is proportional to how many recent posts we found
    const velocity = Math.min(100, postCount * 5); 

    return { sentiment: normalizedSentiment, velocity, messages: recentMessages };
    
  } catch (err) {
    if (err.response && err.response.status === 429) {
      console.warn(`⚠️ Reddit Rate Limit hit for ${coinId}. Preserving existing data.`);
    } else {
      console.error(`❌ Reddit scraping error for ${coinId}:`, err.message);
    }
    return null; // Return null on error to keep existing data steady
  }
}

async function fetchLiveSocialData() {
  console.log("🔍 Running social sentiment analysis via Reddit...");
  
  // To avoid hitting Reddit's rate limit too fast, we'll process 1 coin per 2 seconds
  for (let i = 0; i < COINS.length; i++) {
    const id = COINS[i];
    const data = await scrapeRedditForCoin(id);
    
    if (data) {
      const prev = socialData[id] || { mentions: 0, hypePhase: 50, messages: [] };
      
      socialData[id] = {
        sentiment: data.sentiment,
        velocity: data.velocity,
        mentions: prev.mentions + data.velocity, 
        hypePhase: Math.max(0, Math.min(100, prev.hypePhase + (data.sentiment > 60 ? 1 : -1))),
        platforms: { "Reddit": Math.floor((data.sentiment + data.velocity) / 2) },
        messages: [...data.messages, ...(prev.messages || [])].slice(0, 5)
      };
    }
    
    // Pause for 2 seconds to respect rate limits
    await new Promise(r => setTimeout(r, 2000));
  }
  console.log("✅ Finished social intelligence pass at", new Date().toLocaleTimeString());
}

function startSocialSimulation() {
  initData();
  
  // Run immediately, then run every 60 seconds
  fetchLiveSocialData();
  setInterval(fetchLiveSocialData, 60000);
}

function getSocialData() {
  return socialData;
}

module.exports = {
  startSocialSimulation, // Same export name so backend runs without changes
  getSocialData
};
