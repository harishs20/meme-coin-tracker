
import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// CONSTANTS & DATA
// ============================================================
const COINS = [
  { id: "DOGE", name: "Dogecoin", symbol: "🐶", color: "#C8A951", bg: "#2A1F00" },
  { id: "PEPE", name: "Pepe", symbol: "🐸", color: "#4CAF50", bg: "#001A00" },
  { id: "SHIB", name: "Shiba Inu", symbol: "🐕", color: "#FF6B35", bg: "#1A0A00" },
  { id: "FLOKI", name: "Floki", symbol: "⚡", color: "#FFD700", bg: "#1A1500" },
  { id: "BONK", name: "Bonk", symbol: "🔨", color: "#FF4081", bg: "#1A0010" },
  { id: "WIF", name: "Dogwifhat", symbol: "🎩", color: "#7C4DFF", bg: "#0D0020" },
];

const PLATFORMS = ["Twitter/X", "Reddit", "Telegram", "Discord", "4chan"];
const MOODS = ["euphoric", "bullish", "neutral", "bearish", "panic"];

function generatePrice(base, volatility = 0.03) {
  return base * (1 + (Math.random() - 0.5) * volatility);
}

function generateSentiment() {
  return Math.floor(Math.random() * 100);
}

function generateMentions(base) {
  return Math.floor(base * (0.8 + Math.random() * 0.4));
}

// ============================================================
// ANIMATED CHARACTER COMPONENT
// ============================================================
function CoinCharacter({ sentiment, trend, coinSymbol, coinColor }) {
  const mood = sentiment > 75 ? "euphoric" : sentiment > 55 ? "bullish" : sentiment > 40 ? "neutral" : sentiment > 25 ? "bearish" : "panic";
  const isRising = trend > 0;

  const expressions = {
    euphoric: { eyes: "^^", mouth: "D", bodyAnim: "bounce", bg: "#00FF88" },
    bullish: { eyes: "^o", mouth: ")", bodyAnim: "sway", bg: "#88FF00" },
    neutral: { eyes: "--", mouth: "-", bodyAnim: "idle", bg: "#FFAA00" },
    bearish: { eyes: ";;", mouth: "(", bodyAnim: "droop", bg: "#FF6600" },
    panic: { eyes: "TT", mouth: "O", bodyAnim: "shake", bg: "#FF0044" },
  };

  const expr = expressions[mood];

  const styles = {
    euphoric: `
      @keyframes bounce {
        0%,100% { transform: translateY(0) rotate(0deg); }
        25% { transform: translateY(-20px) rotate(-5deg); }
        75% { transform: translateY(-20px) rotate(5deg); }
      }
    `,
    bullish: `
      @keyframes sway {
        0%,100% { transform: rotate(-3deg); }
        50% { transform: rotate(3deg); }
      }
    `,
    idle: `
      @keyframes idle {
        0%,100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
      }
    `,
    droop: `
      @keyframes droop {
        0%,100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(3px) rotate(-2deg); }
      }
    `,
    shake: `
      @keyframes shake {
        0%,100% { transform: translateX(0) rotate(0deg); }
        20% { transform: translateX(-6px) rotate(-3deg); }
        40% { transform: translateX(6px) rotate(3deg); }
        60% { transform: translateX(-4px) rotate(-2deg); }
        80% { transform: translateX(4px) rotate(2deg); }
      }
    `,
  };

  const animName = expr.bodyAnim === "idle" ? "idle" : expr.bodyAnim;
  const animDur = mood === "panic" ? "0.3s" : mood === "euphoric" ? "0.6s" : "1.2s";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <style>{styles[animName] || styles.idle}</style>

      {/* Floating arrows */}
      {mood === "euphoric" && (
        <div style={{ display: "flex", gap: 3, marginBottom: 2 }}>
          {[0,1,2].map(i => (
            <span key={i} style={{
              fontSize: 10, color: "#00FF88",
              animation: `floatUp 1s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
              "@keyframes floatUp": "0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-20px)}"
            }}>▲</span>
          ))}
        </div>
      )}
      {mood === "panic" && (
        <div style={{ display: "flex", gap: 3, marginBottom: 2 }}>
          {[0,1,2].map(i => (
            <span key={i} style={{ fontSize: 10, color: "#FF0044" }}>▼</span>
          ))}
        </div>
      )}

      {/* Character body */}
      <div style={{
        width: 60, height: 70,
        borderRadius: "50% 50% 40% 40%",
        background: `radial-gradient(circle at 40% 35%, ${coinColor}44, ${coinColor}22)`,
        border: `2px solid ${coinColor}88`,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        animation: `${animName} ${animDur} ease-in-out infinite`,
        position: "relative",
        boxShadow: `0 0 20px ${coinColor}44`,
        cursor: "pointer",
        transition: "transform 0.2s",
      }}>
        {/* Symbol */}
        <div style={{ fontSize: 22, lineHeight: 1 }}>{coinSymbol}</div>
        {/* Face */}
        <div style={{ fontSize: 9, color: "#fff", fontFamily: "monospace", marginTop: 2, letterSpacing: 2 }}>
          {expr.eyes[0]}{expr.eyes[1]}
        </div>
        <div style={{ fontSize: 7, color: "#fff", fontFamily: "monospace" }}>
          {expr.mouth}
        </div>
        {/* Tears for panic/bearish */}
        {(mood === "panic" || mood === "bearish") && (
          <>
            <div style={{
              position: "absolute", bottom: 10, left: 10,
              width: 4, height: mood === "panic" ? 16 : 8,
              background: "linear-gradient(#88CCFF, transparent)",
              borderRadius: "0 0 4px 4px",
              animation: mood === "panic" ? "tearDrop 0.5s ease-in infinite" : "tearDrop 1.5s ease-in infinite",
            }} />
            <div style={{
              position: "absolute", bottom: 10, right: 10,
              width: 4, height: mood === "panic" ? 16 : 8,
              background: "linear-gradient(#88CCFF, transparent)",
              borderRadius: "0 0 4px 4px",
              animation: mood === "panic" ? "tearDrop 0.5s ease-in infinite 0.25s" : "tearDrop 1.5s ease-in infinite 0.75s",
            }} />
          </>
        )}
        {/* Stars for euphoric */}
        {mood === "euphoric" && [0,1,2].map(i => (
          <div key={i} style={{
            position: "absolute",
            top: -5 + i*3, left: i%2===0 ? -10 : 55,
            fontSize: 10,
            animation: `spin${i} 1s linear infinite`,
          }}>✦</div>
        ))}
      </div>

      {/* Mood badge */}
      <div style={{
        fontSize: 9, fontFamily: "'Rajdhani', sans-serif",
        color: expr.bg, fontWeight: 700,
        textTransform: "uppercase", letterSpacing: 1,
        background: `${expr.bg}22`,
        border: `1px solid ${expr.bg}44`,
        padding: "1px 6px", borderRadius: 10,
      }}>
        {mood}
      </div>

      <style>{`
        @keyframes tearDrop {
          0% { opacity:1; transform: scaleY(0); transform-origin: top; }
          60% { opacity:1; transform: scaleY(1); }
          100% { opacity:0; transform: scaleY(1) translateY(5px); }
        }
      `}</style>
    </div>
  );
}

// ============================================================
// MINI SPARKLINE
// ============================================================
function Sparkline({ data, color, width = 120, height = 40 }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  const isUp = data[data.length - 1] >= data[0];

  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Last point dot */}
      <circle
        cx={(data.length - 1) / (data.length - 1) * width}
        cy={height - ((data[data.length - 1] - min) / range) * height}
        r="3"
        fill={color}
      />
    </svg>
  );
}

// ============================================================
// SENTIMENT GAUGE
// ============================================================
function SentimentGauge({ value, color }) {
  const angle = (value / 100) * 180 - 90;
  const r = 40;
  const cx = 55, cy = 55;

  const getArcPath = (startDeg, endDeg, radius, innerR) => {
    const toRad = d => (d * Math.PI) / 180;
    const x1 = cx + radius * Math.cos(toRad(startDeg));
    const y1 = cy + radius * Math.sin(toRad(startDeg));
    const x2 = cx + radius * Math.cos(toRad(endDeg));
    const y2 = cy + radius * Math.sin(toRad(endDeg));
    const ix1 = cx + innerR * Math.cos(toRad(endDeg));
    const iy1 = cy + innerR * Math.sin(toRad(endDeg));
    const ix2 = cx + innerR * Math.cos(toRad(startDeg));
    const iy2 = cy + innerR * Math.sin(toRad(startDeg));
    return `M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 0 0 ${ix2} ${iy2} Z`;
  };

  const needleX = cx + r * Math.cos(((angle) * Math.PI) / 180);
  const needleY = cy + r * Math.sin(((angle) * Math.PI) / 180);

  return (
    <svg width="110" height="65" viewBox="0 0 110 70">
      {/* BG arcs */}
      <path d={getArcPath(180, 216, 46, 32)} fill="#FF0044" opacity="0.7" />
      <path d={getArcPath(216, 252, 46, 32)} fill="#FF6600" opacity="0.7" />
      <path d={getArcPath(252, 288, 46, 32)} fill="#FFCC00" opacity="0.7" />
      <path d={getArcPath(288, 324, 46, 32)} fill="#88FF00" opacity="0.7" />
      <path d={getArcPath(324, 360, 46, 32)} fill="#00FF88" opacity="0.7" />
      {/* Needle */}
      <line
        x1={cx} y1={cy}
        x2={needleX} y2={needleY}
        stroke="#fff" strokeWidth="2.5" strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r="4" fill="#fff" />
      {/* Value */}
      <text x={cx} y={cy + 15} textAnchor="middle" fill="#fff" fontSize="10" fontFamily="'Rajdhani',sans-serif" fontWeight="700">
        {value}%
      </text>
    </svg>
  );
}

// ============================================================
// HYPE CYCLE VISUALIZER
// ============================================================
function HypeCycle({ phase }) {
  // phase: 0-100
  const phases = [
    { label: "Stealth", x: 10 },
    { label: "Awareness", x: 25 },
    { label: "Mania", x: 45 },
    { label: "Blow-off", x: 60 },
    { label: "Despair", x: 78 },
    { label: "Recovery", x: 90 },
  ];

  const W = 200, H = 60;
  const curve = `M 0,${H} C 20,${H} 20,${H-10} 40,${H-30} S 70,5 90,5 S 115,${H} 135,${H-5} S 160,${H+10} 180,${H-20} S ${W},${H-15} ${W},${H-25}`;

  const curPhase = phases[Math.floor(phase / (100 / phases.length))] || phases[phases.length - 1];

  return (
    <div style={{ width: "100%", padding: "8px 0" }}>
      <div style={{ fontSize: 9, color: "#888", fontFamily: "'Rajdhani',sans-serif", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
        Hype Cycle — <span style={{ color: "#FFD700" }}>{curPhase.label}</span>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H+10}`} preserveAspectRatio="none" height={50}>
        <defs>
          <linearGradient id="hypeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7C4DFF" />
            <stop offset="50%" stopColor="#FF4081" />
            <stop offset="100%" stopColor="#00BCD4" />
          </linearGradient>
        </defs>
        <path d={curve} fill="none" stroke="#ffffff22" strokeWidth="2" />
        {/* Position dot */}
        <circle cx={curPhase.x * 2} cy={H/2} r={4} fill="#FFD700">
          <animate attributeName="r" values="4;6;4" dur="1s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}

// ============================================================
// VIRAL VELOCITY METER
// ============================================================
function ViralMeter({ velocity }) {
  const bars = 12;
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 30 }}>
      {Array.from({ length: bars }).map((_, i) => {
        const filled = (i / bars) * 100 < velocity;
        const h = 8 + (i / bars) * 22;
        return (
          <div key={i} style={{
            width: 7, height: h,
            borderRadius: 2,
            background: filled
              ? `hsl(${velocity > 70 ? 0 : velocity > 40 ? 45 : 120}, 90%, 55%)`
              : "#ffffff11",
            transition: "background 0.5s",
            boxShadow: filled ? `0 0 6px hsl(${velocity > 70 ? 0 : velocity > 40 ? 45 : 120}, 90%, 55%)` : "none",
          }} />
        );
      })}
    </div>
  );
}

// ============================================================
// LIVE FEED TICKER
// ============================================================
const FEED_TEMPLATES = [
  (c) => `🚀 "${c}" to the moon!! just bought the dip`,
  (c) => `💀 ${c} is dead, sell everything now`,
  (c) => `👀 Dev just moved ${c} tokens... rug incoming?`,
  (c) => `🔥 ${c} trending #1 on CT right now`,
  (c) => `😭 Lost my savings on ${c} why did I listen`,
  (c) => `💎 Diamond hands on ${c} see you at 10x`,
  (c) => `🐳 Whale wallet just accumulated 420M ${c}`,
  (c) => `📈 ${c} breaking ATH resistance rn`,
  (c) => `🤝 Partnership announcement ${c} x Binance??`,
  (c) => `⚠️ ${c} looks like a pump and dump pattern`,
];

function LiveFeed({ coinId }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const gen = () => {
      const tmpl = FEED_TEMPLATES[Math.floor(Math.random() * FEED_TEMPLATES.length)];
      const platforms = ["🐦 X", "🤖 Reddit", "📱 Telegram", "🎮 Discord"];
      return {
        id: Date.now() + Math.random(),
        text: tmpl(coinId),
        platform: platforms[Math.floor(Math.random() * platforms.length)],
        time: new Date().toLocaleTimeString(),
        sentiment: Math.random() > 0.5 ? "positive" : "negative",
      };
    };

    setMessages([gen(), gen(), gen()]);
    const interval = setInterval(() => {
      setMessages(prev => [gen(), ...prev.slice(0, 4)]);
    }, 2500);
    return () => clearInterval(interval);
  }, [coinId]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {messages.map((msg, i) => (
        <div key={msg.id} style={{
          padding: "6px 10px",
          background: "#ffffff08",
          border: `1px solid ${msg.sentiment === "positive" ? "#00FF8822" : "#FF004422"}`,
          borderRadius: 6,
          fontSize: 10,
          color: "#ccc",
          fontFamily: "'Rajdhani', sans-serif",
          borderLeft: `3px solid ${msg.sentiment === "positive" ? "#00FF88" : "#FF0044"}`,
          opacity: i === 0 ? 1 : 1 - i * 0.15,
          transition: "opacity 0.5s",
          animation: i === 0 ? "slideIn 0.3s ease" : "none",
        }}>
          <span style={{ color: "#888" }}>{msg.platform} · {msg.time}</span>
          <div style={{ marginTop: 2 }}>{msg.text}</div>
        </div>
      ))}
      <style>{`@keyframes slideIn { from { opacity:0; transform: translateY(-8px); } to { opacity:1; transform: translateY(0); } }`}</style>
    </div>
  );
}

// ============================================================
// WHALE ALERT COMPONENT
// ============================================================
function WhaleAlert({ coinColor }) {
  const [alerts, setAlerts] = useState([]);
  const whaleActions = ["🐋 BOUGHT", "🔴 SOLD", "🚚 MOVED"];

  useEffect(() => {
    const gen = () => ({
      id: Date.now(),
      action: whaleActions[Math.floor(Math.random() * whaleActions.length)],
      amount: (Math.random() * 500 + 50).toFixed(0) + "M tokens",
      wallet: "0x" + Math.random().toString(16).slice(2,8).toUpperCase() + "...",
      impact: Math.random() > 0.5 ? "HIGH" : "MEDIUM",
    });

    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        setAlerts(prev => [gen(), ...prev.slice(0, 2)]);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div style={{ fontSize: 9, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, fontFamily: "'Rajdhani',sans-serif" }}>
        🐋 Whale Tracker
      </div>
      {alerts.length === 0 ? (
        <div style={{ fontSize: 10, color: "#444", fontFamily: "'Rajdhani',sans-serif" }}>Monitoring wallets...</div>
      ) : alerts.map((a, i) => (
        <div key={a.id} style={{
          padding: "5px 8px", marginBottom: 4,
          background: "#ffffff08", borderRadius: 5,
          fontSize: 10, fontFamily: "'Rajdhani',sans-serif",
          border: `1px solid ${coinColor}33`,
          animation: i === 0 ? "slideIn 0.3s ease" : "none",
        }}>
          <span style={{ color: coinColor }}>{a.action}</span>
          <span style={{ color: "#fff", margin: "0 6px" }}>{a.amount}</span>
          <span style={{ color: "#555" }}>{a.wallet}</span>
          <span style={{
            float: "right", fontSize: 8,
            color: a.impact === "HIGH" ? "#FF4081" : "#FFCC00",
            fontWeight: 700,
          }}>{a.impact}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// FEAR & GREED METER
// ============================================================
function FearGreedMeter({ value }) {
  const label = value < 20 ? "EXTREME FEAR" : value < 40 ? "FEAR" : value < 60 ? "NEUTRAL" : value < 80 ? "GREED" : "EXTREME GREED";
  const color = value < 20 ? "#FF0044" : value < 40 ? "#FF6600" : value < 60 ? "#FFCC00" : value < 80 ? "#88FF00" : "#00FF88";

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ position: "relative", width: "100%", height: 8, background: "linear-gradient(to right, #FF0044, #FF6600, #FFCC00, #88FF00, #00FF88)", borderRadius: 4, marginBottom: 6 }}>
        <div style={{
          position: "absolute", top: -3, left: `${value}%`,
          transform: "translateX(-50%)",
          width: 14, height: 14,
          background: "#fff", borderRadius: "50%",
          border: `3px solid ${color}`,
          boxShadow: `0 0 10px ${color}`,
          transition: "left 1s ease",
        }} />
      </div>
      <div style={{ fontSize: 11, color, fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, letterSpacing: 2 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "'Rajdhani',sans-serif" }}>{value}</div>
    </div>
  );
}

// ============================================================
// CROSS-PLATFORM HEATMAP
// ============================================================
function PlatformHeatmap({ data, coinColor }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {PLATFORMS.map(p => {
        const val = data[p] || 0;
        return (
          <div key={p} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 70, fontSize: 10, color: "#888", fontFamily: "'Rajdhani',sans-serif" }}>{p}</div>
            <div style={{ flex: 1, height: 12, background: "#ffffff08", borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 4,
                width: `${val}%`,
                background: `linear-gradient(to right, ${coinColor}88, ${coinColor})`,
                transition: "width 1s ease",
                boxShadow: `0 0 6px ${coinColor}`,
              }} />
            </div>
            <div style={{ width: 28, fontSize: 10, color: coinColor, fontFamily: "'Rajdhani',sans-serif", textAlign: "right" }}>{val}%</div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// PREDICTION ORACLE
// ============================================================
function PredictionOracle({ coin, sentiment, velocity }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState("");

  const getPrediction = useCallback(async () => {
    setLoading(true);
    setPrediction(null);
    let d = 0;
    const dotTimer = setInterval(() => { d++; setDots(".".repeat((d % 3) + 1)); }, 400);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are CryptoOracle, an AI analyst for meme coin trends. Analyze this data and give a SHORT, punchy prediction (3-4 sentences max). Be bold. Use emojis. Sound like a crypto analyst.

Coin: ${coin.name} (${coin.id})
Sentiment Score: ${sentiment}/100
Viral Velocity: ${velocity}/100
Trend: ${sentiment > 60 ? "BULLISH" : sentiment > 40 ? "NEUTRAL" : "BEARISH"}

Give: 1) Price direction prediction 2) Key risk/opportunity 3) Social signal strength rating (X/10)
Keep it under 80 words. Be specific.`
          }]
        })
      });
      const data = await response.json();
      const text = data.content?.find(b => b.type === "text")?.text || "Unable to generate prediction.";
      setPrediction(text);
    } catch (e) {
      setPrediction("⚡ Oracle offline. Markets are too volatile for prediction systems!");
    } finally {
      clearInterval(dotTimer);
      setLoading(false);
    }
  }, [coin, sentiment, velocity]);

  return (
    <div style={{
      background: "linear-gradient(135deg, #0D001A, #1A0033)",
      border: `1px solid ${coin.color}44`,
      borderRadius: 12, padding: 16,
      boxShadow: `0 0 30px ${coin.color}22`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: coin.color, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
          🔮 AI Oracle Prediction
        </div>
        <button onClick={getPrediction} disabled={loading} style={{
          background: loading ? "#ffffff11" : `${coin.color}22`,
          border: `1px solid ${coin.color}66`,
          color: coin.color, padding: "4px 12px",
          borderRadius: 6, cursor: loading ? "not-allowed" : "pointer",
          fontSize: 10, fontFamily: "'Rajdhani',sans-serif",
          fontWeight: 700, letterSpacing: 1,
          transition: "all 0.2s",
        }}>
          {loading ? `ANALYZING${dots}` : "⚡ ANALYZE"}
        </button>
      </div>
      {prediction ? (
        <div style={{
          fontSize: 12, color: "#ddd", fontFamily: "'Rajdhani',sans-serif",
          lineHeight: 1.7, padding: "10px 12px",
          background: "#ffffff06", borderRadius: 8,
          borderLeft: `3px solid ${coin.color}`,
          animation: "fadeIn 0.5s ease",
        }}>
          {prediction}
        </div>
      ) : (
        <div style={{ fontSize: 11, color: "#555", fontFamily: "'Rajdhani',sans-serif", textAlign: "center", padding: "10px 0" }}>
          Click ANALYZE for AI-powered prediction
        </div>
      )}
      <style>{`@keyframes fadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function MemeCoinDashboard() {
  const [selectedCoin, setSelectedCoin] = useState(COINS[0]);
  const [coinData, setCoinData] = useState({});
  const [globalFG, setGlobalFG] = useState(42);
  const [activeTab, setActiveTab] = useState("overview");
  const [priceHistory, setPriceHistory] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Initialize data
  useEffect(() => {
    const initData = {};
    const initHistory = {};
    COINS.forEach(c => {
      const basePrice = Math.random() * 0.05 + 0.0001;
      const baseMentions = Math.floor(Math.random() * 50000 + 5000);
      initData[c.id] = {
        price: basePrice,
        prevPrice: basePrice,
        sentiment: generateSentiment(),
        mentions: baseMentions,
        velocity: Math.floor(Math.random() * 100),
        hypePhase: Math.floor(Math.random() * 100),
        platforms: Object.fromEntries(PLATFORMS.map(p => [p, Math.floor(Math.random() * 100)])),
        volume: (Math.random() * 100 + 10).toFixed(1) + "M",
        change24h: (Math.random() - 0.5) * 40,
        fearGreed: Math.floor(Math.random() * 100),
        score: Math.floor(Math.random() * 100),
      };
      initHistory[c.id] = Array.from({ length: 30 }, () => generatePrice(basePrice, 0.1));
    });
    setCoinData(initData);
    setPriceHistory(initHistory);

    // Build leaderboard
    const lb = COINS.map(c => ({ ...c, score: initData[c.id]?.score || 0 })).sort((a, b) => b.score - a.score);
    setLeaderboard(lb);
  }, []);

  // Live updates
  useEffect(() => {
    if (Object.keys(coinData).length === 0) return;
    const interval = setInterval(() => {
      setCoinData(prev => {
        const next = { ...prev };
        COINS.forEach(c => {
          if (!next[c.id]) return;
          const p = next[c.id];
          const newPrice = generatePrice(p.price, 0.04);
          const newSentiment = Math.max(0, Math.min(100, p.sentiment + (Math.random() - 0.5) * 10));
          const newVelocity = Math.max(0, Math.min(100, p.velocity + (Math.random() - 0.5) * 15));
          next[c.id] = {
            ...p,
            prevPrice: p.price,
            price: newPrice,
            sentiment: Math.floor(newSentiment),
            velocity: Math.floor(newVelocity),
            mentions: generateMentions(p.mentions),
            hypePhase: Math.max(0, Math.min(100, p.hypePhase + (Math.random() - 0.4) * 5)),
            score: Math.floor((newSentiment + newVelocity) / 2),
            platforms: Object.fromEntries(PLATFORMS.map(pl => [pl, Math.max(0, Math.min(100, (p.platforms[pl] || 50) + (Math.random() - 0.5) * 15))])),
            change24h: p.change24h + (Math.random() - 0.5) * 2,
          };
        });
        return next;
      });

      setPriceHistory(prev => {
        const next = { ...prev };
        COINS.forEach(c => {
          if (!next[c.id]) return;
          next[c.id] = [...next[c.id].slice(-29), coinData[c.id]?.price || 0];
        });
        return next;
      });

      setGlobalFG(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 5)));
    }, 3000);
    return () => clearInterval(interval);
  }, [coinData]);

  // Update leaderboard
  useEffect(() => {
    const lb = COINS.map(c => ({ ...c, score: coinData[c.id]?.score || 0 })).sort((a, b) => b.score - a.score);
    setLeaderboard(lb);
  }, [coinData]);

  const selected = coinData[selectedCoin.id] || {};
  const trend = (selected.price || 0) - (selected.prevPrice || 0);
  const pct = selected.price && selected.prevPrice ? ((selected.price - selected.prevPrice) / selected.prevPrice * 100) : 0;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#050508",
      fontFamily: "'Rajdhani', sans-serif",
      color: "#e0e0e0",
      position: "relative",
      overflow: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet" />

      {/* Background grid */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
        zIndex: 0,
      }} />

      {/* Glowing orbs */}
      <div style={{ position: "fixed", top: "10%", left: "5%", width: 400, height: 400, borderRadius: "50%", background: `${selectedCoin.color}08`, filter: "blur(100px)", pointerEvents: "none", transition: "background 1s" }} />
      <div style={{ position: "fixed", bottom: "10%", right: "5%", width: 300, height: 300, borderRadius: "50%", background: "#7C4DFF0A", filter: "blur(80px)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1400, margin: "0 auto", padding: "0 20px" }}>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0 16px" }}>
          <div>
            <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 22, fontWeight: 900, letterSpacing: 4, background: `linear-gradient(135deg, #fff, ${selectedCoin.color})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", transition: "all 1s" }}>
              MEME·RADAR
            </div>
            <div style={{ fontSize: 10, color: "#555", letterSpacing: 3, marginTop: 2 }}>CRYPTO SOCIAL INTELLIGENCE SYSTEM v2.0</div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00FF88", boxShadow: "0 0 8px #00FF88", animation: "pulse 1.5s infinite" }} />
            <div style={{ fontSize: 10, color: "#00FF88", letterSpacing: 2 }}>LIVE</div>
            <div style={{ fontSize: 10, color: "#555", letterSpacing: 1, marginLeft: 12 }}>
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* GLOBAL FEAR & GREED */}
        <div style={{
          background: "linear-gradient(135deg, #0A0A0F, #12121A)",
          border: "1px solid #ffffff0A",
          borderRadius: 12, padding: "12px 20px", marginBottom: 16,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div>
              <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Global Fear & Greed</div>
              <FearGreedMeter value={Math.floor(globalFG)} />
            </div>
            <div style={{ width: 1, height: 50, background: "#ffffff0A" }} />
            <div>
              <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Trending Signals</div>
              <div style={{ display: "flex", gap: 6 }}>
                {leaderboard.slice(0, 3).map((c, i) => (
                  <div key={c.id} style={{
                    padding: "3px 8px",
                    background: `${c.color}15`,
                    border: `1px solid ${c.color}33`,
                    borderRadius: 6,
                    fontSize: 11, color: c.color,
                    fontWeight: 700,
                  }}>
                    #{i+1} {c.symbol} {c.id}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            {[
              { label: "Total Mentions", value: "2.4M", icon: "💬" },
              { label: "Active Traders", value: "847K", icon: "👥" },
              { label: "Hype Score", value: "8.7/10", icon: "🔥" },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 16 }}>{stat.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{stat.value}</div>
                <div style={{ fontSize: 9, color: "#555" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* COIN SELECTOR */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
          {COINS.map(coin => {
            const d = coinData[coin.id] || {};
            const isActive = selectedCoin.id === coin.id;
            const chg = d.change24h || 0;
            return (
              <button key={coin.id} onClick={() => setSelectedCoin(coin)} style={{
                flex: "0 0 auto",
                padding: "10px 16px",
                background: isActive ? `${coin.color}15` : "#0A0A0F",
                border: `1px solid ${isActive ? coin.color : "#ffffff0A"}`,
                borderRadius: 10, cursor: "pointer",
                color: "#fff", minWidth: 130,
                transition: "all 0.3s",
                boxShadow: isActive ? `0 0 20px ${coin.color}33` : "none",
                position: "relative",
                overflow: "hidden",
              }}>
                {isActive && <div style={{ position: "absolute", inset: 0, background: `${coin.color}08`, pointerEvents: "none" }} />}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                  <div style={{ fontSize: 18 }}>{coin.symbol}</div>
                  <div style={{ fontSize: 10, color: chg >= 0 ? "#00FF88" : "#FF0044", fontWeight: 700 }}>
                    {chg >= 0 ? "▲" : "▼"} {Math.abs(chg).toFixed(1)}%
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? coin.color : "#fff", textAlign: "left" }}>{coin.id}</div>
                <div style={{ fontSize: 9, color: "#555", textAlign: "left" }}>{coin.name}</div>
                <div style={{ marginTop: 4 }}>
                  <Sparkline data={priceHistory[coin.id] || []} color={coin.color} width={100} height={25} />
                </div>
              </button>
            );
          })}
        </div>

        {/* MAIN CONTENT */}
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr 260px", gap: 16 }}>

          {/* LEFT PANEL - Character + Stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Character Card */}
            <div style={{
              background: `linear-gradient(135deg, ${selectedCoin.bg}, #0A0A0F)`,
              border: `1px solid ${selectedCoin.color}33`,
              borderRadius: 16, padding: 20,
              textAlign: "center",
              boxShadow: `0 0 40px ${selectedCoin.color}22`,
            }}>
              <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 12 }}>COIN SPIRIT</div>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                <CoinCharacter
                  sentiment={selected.sentiment || 50}
                  trend={trend}
                  coinSymbol={selectedCoin.symbol}
                  coinColor={selectedCoin.color}
                />
              </div>
              <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 20, fontWeight: 900, color: selectedCoin.color, letterSpacing: 2 }}>
                {selectedCoin.id}
              </div>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 12 }}>{selectedCoin.name}</div>

              {/* Price */}
              <div style={{
                padding: "10px 16px",
                background: "#ffffff05",
                borderRadius: 10, marginBottom: 8,
              }}>
                <div style={{ fontSize: 10, color: "#555", marginBottom: 2 }}>CURRENT PRICE</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: "'Orbitron',sans-serif" }}>
                  ${(selected.price || 0).toFixed(6)}
                </div>
                <div style={{ fontSize: 12, color: pct >= 0 ? "#00FF88" : "#FF0044", fontWeight: 700 }}>
                  {pct >= 0 ? "▲" : "▼"} {Math.abs(pct).toFixed(2)}%
                </div>
              </div>

              {/* Sentiment gauge */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 4 }}>SENTIMENT</div>
                <SentimentGauge value={selected.sentiment || 50} color={selectedCoin.color} />
              </div>
            </div>

            {/* Viral Velocity */}
            <div style={{
              background: "#0A0A0F",
              border: "1px solid #ffffff0A",
              borderRadius: 12, padding: 16,
            }}>
              <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 10 }}>⚡ VIRAL VELOCITY</div>
              <ViralMeter velocity={selected.velocity || 0} />
              <div style={{ marginTop: 6, fontSize: 11, color: "#888" }}>
                Velocity: <span style={{ color: selected.velocity > 70 ? "#FF0044" : selected.velocity > 40 ? "#FFCC00" : "#00FF88", fontWeight: 700 }}>{selected.velocity || 0}/100</span>
              </div>
            </div>

            {/* Hype Cycle */}
            <div style={{ background: "#0A0A0F", border: "1px solid #ffffff0A", borderRadius: 12, padding: 16 }}>
              <HypeCycle phase={selected.hypePhase || 0} />
            </div>

            {/* Key Metrics */}
            <div style={{ background: "#0A0A0F", border: "1px solid #ffffff0A", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 10 }}>KEY METRICS</div>
              {[
                { label: "Mentions (24h)", value: (selected.mentions || 0).toLocaleString() },
                { label: "Volume", value: selected.volume || "—" },
                { label: "Hype Score", value: `${selected.score || 0}/100` },
              ].map(m => (
                <div key={m.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 11 }}>
                  <span style={{ color: "#666" }}>{m.label}</span>
                  <span style={{ color: "#fff", fontWeight: 700 }}>{m.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CENTER PANEL */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Price Chart Area */}
            <div style={{ background: "#0A0A0F", border: "1px solid #ffffff0A", borderRadius: 12, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "#888", letterSpacing: 2 }}>PRICE + SOCIAL SIGNAL CHART</div>
                <div style={{ display: "flex", gap: 4 }}>
                  {["1H","4H","1D","1W"].map(t => (
                    <button key={t} style={{ background: t === "1H" ? `${selectedCoin.color}22` : "transparent", border: `1px solid ${t === "1H" ? selectedCoin.color : "#ffffff0A"}`, color: t === "1H" ? selectedCoin.color : "#555", padding: "2px 8px", borderRadius: 4, cursor: "pointer", fontSize: 10 }}>{t}</button>
                  ))}
                </div>
              </div>
              {/* Chart SVG */}
              <svg width="100%" height="140" viewBox="0 0 600 140" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={selectedCoin.color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={selectedCoin.color} stopOpacity="0" />
                  </linearGradient>
                </defs>
                {(() => {
                  const hist = priceHistory[selectedCoin.id] || [];
                  if (hist.length < 2) return null;
                  const min = Math.min(...hist);
                  const max = Math.max(...hist);
                  const range = max - min || 1;
                  const W = 600, H = 120;
                  const pts = hist.map((v, i) => {
                    const x = (i / (hist.length - 1)) * W;
                    const y = H - ((v - min) / range) * H;
                    return `${x},${y}`;
                  });
                  const linePts = pts.join(" ");
                  const areaPts = `0,${H} ${linePts} ${W},${H}`;
                  return (
                    <>
                      <polygon points={areaPts} fill="url(#priceGrad)" />
                      <polyline points={linePts} fill="none" stroke={selectedCoin.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx={pts[pts.length-1]?.split(",")[0]} cy={pts[pts.length-1]?.split(",")[1]} r="5" fill={selectedCoin.color}>
                        <animate attributeName="r" values="4;7;4" dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
                      </circle>
                    </>
                  );
                })()}
              </svg>
              {/* Sentiment overlay bars */}
              <div style={{ display: "flex", gap: 2, marginTop: 8 }}>
                {Array.from({ length: 30 }).map((_, i) => {
                  const h = Math.floor(Math.random() * 30 + 5);
                  const isPos = Math.random() > 0.4;
                  return (
                    <div key={i} style={{
                      flex: 1, height: h,
                      background: isPos ? "#00FF8844" : "#FF004444",
                      borderRadius: 1,
                      alignSelf: "flex-end",
                    }} />
                  );
                })}
              </div>
              <div style={{ fontSize: 9, color: "#444", marginTop: 4 }}>▲ Bullish mentions  ▼ Bearish mentions</div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #ffffff0A", paddingBottom: 0 }}>
              {["Live Feed", "Platform Heat", "Whale Track", "Leaderboard"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab.toLowerCase().replace(" ", "_"))} style={{
                  background: "transparent", border: "none",
                  borderBottom: `2px solid ${activeTab === tab.toLowerCase().replace(" ", "_") ? selectedCoin.color : "transparent"}`,
                  color: activeTab === tab.toLowerCase().replace(" ", "_") ? selectedCoin.color : "#555",
                  padding: "8px 14px", cursor: "pointer",
                  fontSize: 11, fontFamily: "'Rajdhani',sans-serif",
                  fontWeight: 700, letterSpacing: 1,
                  transition: "all 0.2s",
                }}>
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ background: "#0A0A0F", border: "1px solid #ffffff0A", borderRadius: 12, padding: 16, minHeight: 180 }}>
              {activeTab === "live_feed" && <LiveFeed coinId={selectedCoin.id} />}
              {activeTab === "platform_heat" && (
                <div>
                  <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 12 }}>PLATFORM ENGAGEMENT HEATMAP</div>
                  <PlatformHeatmap data={selected.platforms || {}} coinColor={selectedCoin.color} />
                </div>
              )}
              {activeTab === "whale_track" && <WhaleAlert coinColor={selectedCoin.color} />}
              {activeTab === "leaderboard" && (
                <div>
                  <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 12 }}>TREND LEADERBOARD</div>
                  {leaderboard.map((c, i) => {
                    const d = coinData[c.id] || {};
                    return (
                      <div key={c.id} onClick={() => setSelectedCoin(c)} style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                        background: selectedCoin.id === c.id ? `${c.color}11` : "#ffffff05",
                        borderRadius: 8, marginBottom: 6, cursor: "pointer",
                        border: `1px solid ${selectedCoin.id === c.id ? c.color+"33" : "transparent"}`,
                        transition: "all 0.2s",
                      }}>
                        <div style={{ fontSize: 16, fontWeight: 900, color: i < 3 ? ["#FFD700","#C0C0C0","#CD7F32"][i] : "#444", width: 24, fontFamily: "'Orbitron',sans-serif" }}>#{i+1}</div>
                        <div style={{ fontSize: 20 }}>{c.symbol}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: c.color }}>{c.id}</div>
                          <div style={{ fontSize: 9, color: "#555" }}>Score: {d.score || 0}/100</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 11, color: (d.change24h || 0) >= 0 ? "#00FF88" : "#FF0044", fontWeight: 700 }}>
                            {(d.change24h || 0) >= 0 ? "▲" : "▼"} {Math.abs(d.change24h || 0).toFixed(1)}%
                          </div>
                          <Sparkline data={priceHistory[c.id] || []} color={c.color} width={60} height={20} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* AI Oracle */}
            <PredictionOracle coin={selectedCoin} sentiment={selected.sentiment || 50} velocity={selected.velocity || 0} />
          </div>

          {/* RIGHT PANEL */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* All Coins Characters - Mini */}
            <div style={{ background: "#0A0A0F", border: "1px solid #ffffff0A", borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 10 }}>ALL SPIRITS</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {COINS.map(c => {
                  const d = coinData[c.id] || {};
                  return (
                    <div key={c.id} onClick={() => setSelectedCoin(c)} style={{ cursor: "pointer", textAlign: "center", padding: 6, borderRadius: 8, background: selectedCoin.id === c.id ? `${c.color}11` : "transparent", border: `1px solid ${selectedCoin.id === c.id ? c.color + "44" : "transparent"}`, transition: "all 0.2s" }}>
                      <div style={{ transform: "scale(0.65)", transformOrigin: "center top", marginBottom: -10 }}>
                        <CoinCharacter sentiment={d.sentiment || 50} trend={0} coinSymbol={c.symbol} coinColor={c.color} />
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: c.color }}>{c.id}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Narrative AI Engine */}
            <div style={{ background: "#0A0A0F", border: "1px solid #ffffff0A", borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 10 }}>📰 NARRATIVE TRACKER</div>
              {[
                { tag: "#MOONSOON", strength: 87, trend: "↑" },
                { tag: "#RUGINCOMING", strength: 34, trend: "↓" },
                { tag: "#DIAMONDHANDS", strength: 71, trend: "↑" },
                { tag: "#WENMOON", strength: 93, trend: "↑" },
                { tag: "#SELLSIGNAL", strength: 22, trend: "↓" },
              ].map(n => (
                <div key={n.tag} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ flex: 1, fontSize: 10, color: n.trend === "↑" ? "#00FF88" : "#FF4444", fontWeight: 700 }}>{n.tag}</div>
                  <div style={{ width: 60, height: 4, background: "#ffffff0A", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${n.strength}%`, background: n.trend === "↑" ? "#00FF88" : "#FF4444", borderRadius: 2 }} />
                  </div>
                  <div style={{ fontSize: 9, color: "#555", width: 20 }}>{n.strength}</div>
                </div>
              ))}
            </div>

            {/* FOMO-O-METER */}
            <div style={{ background: "#0A0A0F", border: "1px solid #ffffff0A", borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 10 }}>😰 FOMO-O-METER</div>
              {COINS.map(c => {
                const d = coinData[c.id] || {};
                const fomo = Math.floor((d.sentiment || 50) * 0.7 + (d.velocity || 50) * 0.3);
                return (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <div style={{ fontSize: 12 }}>{c.symbol}</div>
                    <div style={{ flex: 1, height: 6, background: "#ffffff0A", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 3,
                        width: `${fomo}%`,
                        background: `linear-gradient(to right, ${c.color}88, ${c.color})`,
                        transition: "width 1s ease",
                      }} />
                    </div>
                    <div style={{ fontSize: 10, color: c.color, width: 24, textAlign: "right" }}>{fomo}</div>
                  </div>
                );
              })}
            </div>

            {/* Smart Money Signal */}
            <div style={{ background: "#0A0A0F", border: "1px solid #ffffff0A", borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 10 }}>💡 SMART MONEY SIGNALS</div>
              {[
                { label: "Dev Activity", icon: "⚙️", val: Math.floor(Math.random()*100) },
                { label: "Exchange Flow", icon: "🏦", val: Math.floor(Math.random()*100) },
                { label: "New Wallets", icon: "👛", val: Math.floor(Math.random()*100) },
                { label: "Liquidity", icon: "💧", val: Math.floor(Math.random()*100) },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ fontSize: 14 }}>{s.icon}</div>
                  <div style={{ flex: 1, fontSize: 10, color: "#888" }}>{s.label}</div>
                  <div style={{
                    fontSize: 11, fontWeight: 700,
                    color: s.val > 60 ? "#00FF88" : s.val > 40 ? "#FFCC00" : "#FF0044",
                  }}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ textAlign: "center", padding: "20px 0", fontSize: 9, color: "#333", letterSpacing: 2, marginTop: 10 }}>
          MEME·RADAR — POWERED BY SOCIAL INTELLIGENCE AI — DATA IS SIMULATED FOR DEMO — NOT FINANCIAL ADVICE
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;box-shadow:0 0 8px #00FF88} 50%{opacity:0.5;box-shadow:0 0 16px #00FF88} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background: #050508; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius:2px; }
        button:hover { opacity: 0.9; }
      `}</style>
    </div>
  );
}
