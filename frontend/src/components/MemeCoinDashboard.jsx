import { useState, useEffect, useCallback, useContext } from "react";
import io from "socket.io-client";
import { ThemeContext } from "../App";

const socket = io("http://localhost:5000");

const COINS = [
  { id: "DOGE", name: "Dogecoin", symbol: "🐶", color: "#eab308" },
  { id: "PEPE", name: "Pepe", symbol: "🐸", color: "#22c55e" },
  { id: "SHIB", name: "Shiba Inu", symbol: "🐕", color: "#f97316" },
  { id: "FLOKI", name: "Floki", symbol: "⚡", color: "#eab308" },
  { id: "BONK", name: "Bonk", symbol: "🔨", color: "#ec4899" },
  { id: "WIF", name: "Dogwifhat", symbol: "🎩", color: "#8b5cf6" },
];
const PLATFORMS = ["Twitter/X", "Reddit", "Telegram", "Discord", "4chan"];

/* ===== SPARKLINE ===== */
function Sparkline({ data, color, w = 120, h = 36 }) {
  if (!data || data.length < 2) return <div style={{ width: w, height: h }} />;
  const mn = Math.min(...data), mx = Math.max(...data), rg = mx - mn || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - mn) / rg) * (h - 4) - 2}`).join(" ");
  const area = `0,${h} ${pts} ${w},${h}`;
  const uid = `sp-${color.replace("#", "")}`;
  return (
    <svg width={w} height={h} style={{ overflow: "visible", display: "block" }}>
      <defs><linearGradient id={uid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.2" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      <polygon points={area} fill={`url(#${uid})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={parseFloat(pts.split(" ").pop().split(",")[1])} r="3" fill={color}><animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" /></circle>
    </svg>
  );
}

/* ===== COIN MASCOT ===== */
function CoinMascot({ sentiment, coinSymbol, coinColor, size = 56 }) {
  const mood = sentiment > 75 ? "euphoric" : sentiment > 55 ? "bullish" : sentiment > 40 ? "neutral" : sentiment > 25 ? "bearish" : "panic";
  const faces = { euphoric: { eyes: "✨", mouth: "😆" }, bullish: { eyes: "👀", mouth: "😊" }, neutral: { eyes: "😐", mouth: "" }, bearish: { eyes: "😟", mouth: "" }, panic: { eyes: "😱", mouth: "" } };
  const anims = { euphoric: "bounce", bullish: "sway", neutral: "idle", bearish: "droop", panic: "shake" };
  const dur = mood === "panic" ? "0.4s" : mood === "euphoric" ? "0.7s" : "1.5s";
  const moodColors = { euphoric: "#34d399", bullish: "#34d399", neutral: "#fbbf24", bearish: "#f87171", panic: "#f87171" };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: `linear-gradient(135deg, ${coinColor}20, ${coinColor}08)`,
        border: `2px solid ${coinColor}40`, display: "flex", alignItems: "center", justifyContent: "center",
        animation: `${anims[mood]} ${dur} ease-in-out infinite`,
        fontSize: size * 0.45, boxShadow: `0 4px 20px ${coinColor}20`,
        transition: "all 0.4s",
      }}>{faces[mood].eyes || coinSymbol}</div>
      <span style={{
        fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
        color: moodColors[mood], background: `${moodColors[mood]}15`,
        padding: "2px 8px", borderRadius: 99, border: `1px solid ${moodColors[mood]}30`,
      }}>{mood}</span>
    </div>
  );
}

/* ===== GAUGE (Fear/Greed or Sentiment) ===== */
function ArcGauge({ value, label, size = 100 }) {
  const pct = Math.max(0, Math.min(100, value));
  const color = pct < 25 ? "var(--negative)" : pct < 50 ? "var(--warning)" : pct < 75 ? "var(--positive)" : "var(--accent2)";
  const r = (size - 12) / 2, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const half = circ / 2;
  const offset = half - (pct / 100) * half;
  return (
    <div style={{ textAlign: "center" }}>
      <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
        <path d={`M 6 ${cy} A ${r} ${r} 0 0 1 ${size - 6} ${cy}`} fill="none" stroke="var(--border)" strokeWidth="6" strokeLinecap="round" />
        <path d={`M 6 ${cy} A ${r} ${r} 0 0 1 ${size - 6} ${cy}`} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={half} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1), stroke 0.5s" }} />
        <text x={cx} y={cy - 4} textAnchor="middle" fill="var(--text-primary)" fontSize="18" fontWeight="800" fontFamily="var(--font-mono)">{pct}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontWeight="600" letterSpacing="1">{label}</text>
      </svg>
    </div>
  );
}

/* ===== VELOCITY BAR ===== */
function VelocityBar({ value, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value}%`, borderRadius: 99, background: `linear-gradient(90deg, ${color}88, ${color})`, transition: "width 1s cubic-bezier(0.4,0,0.2,1)", boxShadow: `0 0 8px ${color}40` }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: "var(--font-mono)", minWidth: 28, textAlign: "right" }}>{value}</span>
    </div>
  );
}

/* ===== LIVE FEED ===== */
function LiveFeed({ messages = [] }) {
  if (!messages.length) return <p style={{ color: "var(--text-muted)", fontSize: 13, padding: 16 }}>Listening for social signals...</p>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {messages.map((m, i) => (
        <div key={m.id} style={{
          padding: "10px 14px", borderRadius: "var(--radius-md)", background: "var(--bg-hover)",
          borderLeft: `3px solid ${m.sentiment === "positive" ? "var(--positive)" : m.sentiment === "negative" ? "var(--negative)" : "var(--text-muted)"}`,
          animation: i === 0 ? "slideIn 0.3s ease" : "none", opacity: 1 - i * 0.12,
          transition: "opacity 0.4s",
        }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3 }}>{m.platform} · {m.time}</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{m.text}</div>
        </div>
      ))}
    </div>
  );
}

/* ===== WHALE TRACKER ===== */
function WhaleTracker({ coinColor }) {
  const [alerts, setAlerts] = useState([]);
  useEffect(() => {
    const iv = setInterval(() => {
      if (Math.random() > 0.6) {
        setAlerts(p => [{ id: Date.now(), action: ["🐋 BOUGHT","🔴 SOLD","🚚 MOVED"][Math.floor(Math.random()*3)], amount: (Math.random()*500+50).toFixed(0)+"M", wallet: "0x"+Math.random().toString(16).slice(2,8).toUpperCase(), impact: Math.random()>0.5?"HIGH":"MED" }, ...p.slice(0,3)]);
      }
    }, 4000);
    return () => clearInterval(iv);
  }, []);
  if (!alerts.length) return <p style={{ color: "var(--text-muted)", fontSize: 13, padding: 16 }}>Monitoring whale wallets...</p>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {alerts.map((a, i) => (
        <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: "var(--radius-md)", background: "var(--bg-hover)", animation: i===0?"slideIn 0.3s ease":"none" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: coinColor }}>{a.action}</span>
          <span style={{ fontSize: 13, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{a.amount}</span>
          <span style={{ fontSize: 11, color: "var(--text-muted)", flex: 1 }}>{a.wallet}...</span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, color: a.impact==="HIGH"?"var(--negative)":"var(--warning)", background: a.impact==="HIGH"?"var(--negative-bg)":"var(--warning-bg)" }}>{a.impact}</span>
        </div>
      ))}
    </div>
  );
}

/* ===== PREDICTION ORACLE ===== */
function PredictionOracle({ coin, sentiment, velocity }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState("");
  const getPrediction = useCallback(async () => {
    setLoading(true); setPrediction(null);
    let d = 0; const dt = setInterval(() => { d++; setDots(".".repeat((d%3)+1)); }, 400);
    try {
      const r = await fetch("http://localhost:5000/api/predict", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ coinName:coin.name, coinId:coin.id, sentiment, velocity, trend: sentiment>60?"BULLISH":sentiment>40?"NEUTRAL":"BEARISH" }) });
      const data = await r.json();
      setPrediction(data.prediction || "Unable to generate prediction.");
    } catch { setPrediction("⚡ Oracle offline — backend not running."); }
    finally { clearInterval(dt); setLoading(false); }
  }, [coin, sentiment, velocity]);

  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 20, boxShadow: "var(--shadow-sm)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>🔮 AI Oracle</h3>
        <button onClick={getPrediction} disabled={loading} style={{
          background: loading ? "var(--bg-hover)" : `${coin.color}18`, border: `1px solid ${coin.color}40`,
          color: coin.color, padding: "8px 20px", borderRadius: "var(--radius-full)", cursor: loading?"not-allowed":"pointer",
          fontSize: 12, fontWeight: 700, letterSpacing: 0.5, transition: "all 0.3s",
          fontFamily: "var(--font-sans)",
        }}>{loading ? `Analyzing${dots}` : "⚡ Analyze"}</button>
      </div>
      {prediction ? (
        <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.8, padding: 16, background: "var(--bg-hover)", borderRadius: "var(--radius-md)", borderLeft: `3px solid ${coin.color}`, animation: "fadeUp 0.4s ease" }}>{prediction}</div>
      ) : (
        <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: 20 }}>Click Analyze for AI-powered meme coin prediction</p>
      )}
    </div>
  );
}

/* ===== THEME TOGGLE ===== */
function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <button onClick={toggleTheme} title={`Switch to ${theme==='dark'?'light':'dark'} mode`} style={{
      width: 44, height: 24, borderRadius: 99, border: "1px solid var(--border-strong)",
      background: theme === "dark" ? "var(--bg-active)" : "var(--warning)", cursor: "pointer",
      position: "relative", transition: "all 0.3s", padding: 0, display: "flex", alignItems: "center",
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: "50%", background: "var(--bg-surface)",
        boxShadow: "var(--shadow-sm)", transition: "all 0.3s cubic-bezier(0.68,-0.55,0.27,1.55)",
        transform: `translateX(${theme === "dark" ? "3px" : "22px"})`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10,
      }}>{theme === "dark" ? "🌙" : "☀️"}</div>
    </button>
  );
}

/* ============================== */
/* ===== DASHBOARD LAYOUT ======= */
/* ============================== */

const Card = ({ children, style = {}, delay = 0 }) => (
  <div style={{
    background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)",
    padding: 20, boxShadow: "var(--shadow-sm)", transition: "all 0.3s",
    animation: `fadeUp 0.5s ease ${delay}s both`, ...style,
  }}>{children}</div>
);

const SectionTitle = ({ children, icon }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
    {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
    <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: "var(--text-muted)" }}>{children}</h3>
  </div>
);

/* ============================== */
/* ===== MAIN DASHBOARD ======== */
/* ============================== */
export default function MemeCoinDashboard() {
  const { theme } = useContext(ThemeContext);
  const [selectedCoin, setSelectedCoin] = useState(COINS[0]);
  const [coinData, setCoinData] = useState({});
  const [globalFG, setGlobalFG] = useState(42);
  const [activeView, setActiveView] = useState("feed");
  const [priceHistory, setPriceHistory] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    socket.on("dashboard_update", (data) => {
      setCoinData(data.coins || {});
      setPriceHistory(data.history || {});
      setGlobalFG(data.globalFG || 42);
      if (data.coins) {
        setLeaderboard(COINS.map(c => ({ ...c, score: data.coins[c.id]?.score || 0 })).sort((a, b) => b.score - a.score));
      }
    });
    return () => socket.off("dashboard_update");
  }, []);

  const sel = coinData[selectedCoin.id] || {};
  const pct = sel.price && sel.prevPrice ? ((sel.price - sel.prevPrice) / sel.prevPrice * 100) : 0;

  return (
    <div style={{ display: "flex", minHeight: "100vh", transition: "background 0.4s" }}>

      {/* ===== SIDEBAR ===== */}
      <aside style={{
        width: sidebarOpen ? 260 : 68, background: "var(--bg-sidebar)", borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column", transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden", flexShrink: 0, position: "relative", zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10, minHeight: 68 }}>
          <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: "linear-gradient(135deg, var(--accent), var(--accent2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>📡</div>
          {sidebarOpen && <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: 1 }}>MEME·RADAR</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: 0.5 }}>Social Intelligence</div>
          </div>}
        </div>

        {/* Coin List */}
        <div style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          {sidebarOpen && <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 2, padding: "8px 8px 10px", textTransform: "uppercase" }}>Tracked Coins</div>}
          {COINS.map((coin, i) => {
            const d = coinData[coin.id] || {};
            const active = selectedCoin.id === coin.id;
            const chg = d.change24h || 0;
            return (
              <button key={coin.id} onClick={() => setSelectedCoin(coin)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10, padding: sidebarOpen ? "10px 12px" : "10px 0",
                justifyContent: sidebarOpen ? "flex-start" : "center",
                background: active ? `${coin.color}15` : "transparent",
                border: active ? `1px solid ${coin.color}30` : "1px solid transparent",
                borderRadius: "var(--radius-md)", cursor: "pointer", marginBottom: 4,
                transition: "all 0.25s", color: "var(--text-primary)",
                animation: `slideRight 0.3s ease ${i * 0.05}s both`,
              }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{coin.symbol}</span>
                {sidebarOpen && (
                  <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: active ? coin.color : "var(--text-primary)" }}>{coin.id}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: chg >= 0 ? "var(--positive)" : "var(--negative)" }}>{chg >= 0 ? "+" : ""}{chg.toFixed(1)}%</span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{coin.name}</div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar toggle */}
        <button onClick={() => setSidebarOpen(p => !p)} style={{
          padding: 14, borderTop: "1px solid var(--border)", background: "transparent", border: "none",
          borderTop: "1px solid var(--border)", cursor: "pointer", color: "var(--text-muted)", fontSize: 16,
          transition: "all 0.3s", display: "flex", alignItems: "center", justifyContent: "center",
        }}>{sidebarOpen ? "◀" : "▶"}</button>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Top Bar */}
        <header style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "14px 28px", borderBottom: "1px solid var(--border)", background: "var(--bg-surface)",
          position: "sticky", top: 0, zIndex: 5, backdropFilter: "blur(12px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--positive)", animation: "pulse 2s infinite" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--positive)" }}>LIVE</span>
            </div>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{new Date().toLocaleTimeString()}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {leaderboard.slice(0, 3).map((c, i) => (
              <span key={c.id} style={{ fontSize: 12, fontWeight: 600, color: c.color, background: `${c.color}12`, padding: "4px 10px", borderRadius: 99, border: `1px solid ${c.color}25` }}>
                #{i+1} {c.symbol} {c.id}
              </span>
            ))}
            <ThemeToggle />
          </div>
        </header>

        {/* Content body */}
        <div style={{ flex: 1, padding: 28, overflowY: "auto" }}>

          {/* Hero Stats Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
            {[
              { label: "Fear & Greed", value: Math.floor(globalFG), suffix: "/100", icon: "🎯", color: globalFG < 40 ? "var(--negative)" : globalFG < 60 ? "var(--warning)" : "var(--positive)" },
              { label: "Total Mentions", value: "2.4M", icon: "💬", color: "var(--accent)" },
              { label: "Active Traders", value: "847K", icon: "👥", color: "var(--accent2)" },
              { label: "Hype Score", value: "8.7", suffix: "/10", icon: "🔥", color: "var(--warning)" },
            ].map((s, i) => (
              <Card key={s.label} delay={i * 0.06} style={{ padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: 0.5, marginBottom: 6 }}>{s.label}</div>
                    <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "var(--font-mono)", color: s.color, lineHeight: 1 }}>
                      {s.value}<span style={{ fontSize: 14, color: "var(--text-muted)" }}>{s.suffix || ""}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 28, opacity: 0.7 }}>{s.icon}</span>
                </div>
              </Card>
            ))}
          </div>

          {/* Two-column layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>

            {/* LEFT: Main analytics */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Selected Coin Hero */}
              <Card delay={0.25} style={{ padding: 0, overflow: "hidden" }}>
                <div style={{
                  background: `linear-gradient(135deg, ${selectedCoin.color}12, transparent)`,
                  padding: 24, display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap",
                }}>
                  <CoinMascot sentiment={sel.sentiment || 50} coinSymbol={selectedCoin.symbol} coinColor={selectedCoin.color} size={72} />
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
                      <h2 style={{ fontSize: 24, fontWeight: 800 }}>{selectedCoin.name}</h2>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-muted)" }}>{selectedCoin.id}</span>
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "var(--font-mono)", marginBottom: 4 }}>
                      ${(sel.price || 0).toFixed(6)}
                    </div>
                    <span style={{
                      fontSize: 14, fontWeight: 700, padding: "4px 12px", borderRadius: 99,
                      color: pct >= 0 ? "var(--positive)" : "var(--negative)",
                      background: pct >= 0 ? "var(--positive-bg)" : "var(--negative-bg)",
                    }}>{pct >= 0 ? "▲" : "▼"} {Math.abs(pct).toFixed(2)}%</span>
                  </div>
                  <div style={{ display: "flex", gap: 20 }}>
                    {[
                      { label: "Sentiment", val: sel.sentiment || 0 },
                      { label: "Velocity", val: sel.velocity || 0 },
                      { label: "Hype", val: sel.score || 0 },
                    ].map(m => (
                      <div key={m.label} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{m.val}</div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, letterSpacing: 0.5 }}>{m.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Chart */}
                <div style={{ padding: "8px 24px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 1 }}>PRICE CHART</span>
                    <div style={{ display: "flex", gap: 4 }}>
                      {["1H","4H","1D","1W"].map(t => (
                        <button key={t} style={{
                          background: t==="1H" ? `${selectedCoin.color}18` : "var(--bg-hover)", border: `1px solid ${t==="1H"?selectedCoin.color+"40":"var(--border)"}`,
                          color: t==="1H" ? selectedCoin.color : "var(--text-muted)", padding: "3px 10px", borderRadius: 6,
                          cursor: "pointer", fontSize: 11, fontWeight: 600, transition: "all 0.2s", fontFamily: "var(--font-sans)",
                        }}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <svg width="100%" height="120" viewBox="0 0 600 120" preserveAspectRatio="none">
                    <defs><linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={selectedCoin.color} stopOpacity="0.15" /><stop offset="100%" stopColor={selectedCoin.color} stopOpacity="0" /></linearGradient></defs>
                    {(() => {
                      const h = priceHistory[selectedCoin.id] || [];
                      if (h.length < 2) return null;
                      const mn = Math.min(...h), mx = Math.max(...h), rg = mx-mn||1;
                      const pts = h.map((v,i) => `${(i/(h.length-1))*600},${100-((v-mn)/rg)*95}`).join(" ");
                      return (<><polygon points={`0,105 ${pts} 600,105`} fill="url(#cGrad)" /><polyline points={pts} fill="none" stroke={selectedCoin.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></>);
                    })()}
                  </svg>
                  {/* Sentiment bars */}
                  <div style={{ display: "flex", gap: 2, marginTop: 10 }}>
                    {Array.from({length:30}).map((_,i) => {
                      const ht = Math.floor(Math.random()*24+4);
                      const pos = Math.random() > 0.4;
                      return <div key={i} style={{ flex: 1, height: ht, borderRadius: 2, alignSelf: "flex-end", background: pos ? "var(--positive-bg)" : "var(--negative-bg)", borderTop: `2px solid ${pos ? "var(--positive)" : "var(--negative)"}` }} />;
                    })}
                  </div>
                </div>
              </Card>

              {/* Tabs & Tab Content */}
              <Card delay={0.35}>
                <div style={{ display: "flex", gap: 2, marginBottom: 16, background: "var(--bg-hover)", borderRadius: "var(--radius-md)", padding: 3 }}>
                  {[{k:"feed",l:"📡 Live Feed"},{k:"heat",l:"🌍 Platforms"},{k:"whale",l:"🐋 Whales"},{k:"rank",l:"🏆 Leaderboard"}].map(t => (
                    <button key={t.k} onClick={() => setActiveView(t.k)} style={{
                      flex: 1, padding: "10px 8px", borderRadius: "var(--radius-sm)", border: "none",
                      background: activeView===t.k ? "var(--bg-surface)" : "transparent",
                      boxShadow: activeView===t.k ? "var(--shadow-sm)" : "none",
                      color: activeView===t.k ? "var(--text-primary)" : "var(--text-muted)",
                      fontWeight: 600, fontSize: 12, cursor: "pointer", transition: "all 0.25s",
                      fontFamily: "var(--font-sans)",
                    }}>{t.l}</button>
                  ))}
                </div>

                {activeView === "feed" && <LiveFeed messages={sel.messages || []} />}
                {activeView === "heat" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <SectionTitle icon="🌍">Platform Engagement</SectionTitle>
                    {PLATFORMS.map(p => {
                      const v = (sel.platforms || {})[p] || 0;
                      return (
                        <div key={p}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>{p}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: selectedCoin.color, fontFamily: "var(--font-mono)" }}>{v}%</span>
                          </div>
                          <VelocityBar value={v} color={selectedCoin.color} />
                        </div>
                      );
                    })}
                  </div>
                )}
                {activeView === "whale" && <WhaleTracker coinColor={selectedCoin.color} />}
                {activeView === "rank" && (
                  <div>
                    <SectionTitle icon="🏆">Trend Leaderboard</SectionTitle>
                    {leaderboard.map((c, i) => {
                      const d = coinData[c.id] || {};
                      const active = selectedCoin.id === c.id;
                      return (
                        <div key={c.id} onClick={() => setSelectedCoin(c)} style={{
                          display: "flex", alignItems: "center", gap: 14, padding: "12px 16px",
                          borderRadius: "var(--radius-md)", marginBottom: 6, cursor: "pointer",
                          background: active ? `${c.color}10` : "var(--bg-hover)",
                          border: `1px solid ${active ? c.color+"30" : "transparent"}`,
                          transition: "all 0.25s",
                        }}>
                          <span style={{ fontSize: 16, fontWeight: 900, fontFamily: "var(--font-mono)", color: i<3?["#eab308","#94a3b8","#f97316"][i]:"var(--text-muted)", width: 28 }}>#{i+1}</span>
                          <span style={{ fontSize: 22 }}>{c.symbol}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 14, color: c.color }}>{c.id}</div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Score: {d.score||0}/100</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: (d.change24h||0)>=0?"var(--positive)":"var(--negative)" }}>
                              {(d.change24h||0)>=0?"▲":"▼"} {Math.abs(d.change24h||0).toFixed(1)}%
                            </div>
                            <Sparkline data={priceHistory[c.id]||[]} color={c.color} w={60} h={18} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>

              {/* AI Oracle */}
              <PredictionOracle coin={selectedCoin} sentiment={sel.sentiment || 50} velocity={sel.velocity || 0} />
            </div>

            {/* RIGHT: Sidebar panels */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Gauges */}
              <Card delay={0.3} style={{ display: "flex", justifyContent: "space-around", padding: 16 }}>
                <ArcGauge value={sel.sentiment || 50} label="SENTIMENT" />
                <ArcGauge value={sel.velocity || 50} label="VELOCITY" />
              </Card>

              {/* Viral Velocity */}
              <Card delay={0.35}>
                <SectionTitle icon="⚡">Viral Velocity</SectionTitle>
                <VelocityBar value={sel.velocity || 0} color={selectedCoin.color} />
                <div style={{ marginTop: 8, fontSize: 11, color: "var(--text-muted)" }}>
                  {sel.velocity > 70 ? "🔥 Going viral!" : sel.velocity > 40 ? "📈 Building momentum" : "📊 Stable activity"}
                </div>
              </Card>

              {/* Narrative Tracker */}
              <Card delay={0.4}>
                <SectionTitle icon="📰">Narratives</SectionTitle>
                {[
                  { tag: "#MOONSOON", s: 87, up: true },
                  { tag: "#RUGINCOMING", s: 34, up: false },
                  { tag: "#DIAMONDHANDS", s: 71, up: true },
                  { tag: "#WENMOON", s: 93, up: true },
                  { tag: "#SELLSIGNAL", s: 22, up: false },
                ].map(n => (
                  <div key={n.tag} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: n.up ? "var(--positive)" : "var(--negative)", flex: 1 }}>{n.tag}</span>
                    <div style={{ width: 60, height: 5, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ width: `${n.s}%`, height: "100%", borderRadius: 99, background: n.up ? "var(--positive)" : "var(--negative)", transition: "width 0.6s" }} />
                    </div>
                    <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", width: 22, textAlign: "right" }}>{n.s}</span>
                  </div>
                ))}
              </Card>

              {/* FOMO Meter */}
              <Card delay={0.45}>
                <SectionTitle icon="😰">FOMO Meter</SectionTitle>
                {COINS.map(c => {
                  const d = coinData[c.id] || {};
                  const fomo = Math.floor((d.sentiment||50)*0.7 + (d.velocity||50)*0.3);
                  return (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 14 }}>{c.symbol}</span>
                      <VelocityBar value={fomo} color={c.color} />
                    </div>
                  );
                })}
              </Card>

              {/* Smart Money */}
              <Card delay={0.5}>
                <SectionTitle icon="💡">Smart Money</SectionTitle>
                {[
                  { l: "Dev Activity", ic: "⚙️", v: Math.floor(Math.random()*100) },
                  { l: "Exchange Flow", ic: "🏦", v: Math.floor(Math.random()*100) },
                  { l: "New Wallets", ic: "👛", v: Math.floor(Math.random()*100) },
                  { l: "Liquidity", ic: "💧", v: Math.floor(Math.random()*100) },
                ].map(s => (
                  <div key={s.l} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 16 }}>{s.ic}</span>
                    <span style={{ flex: 1, fontSize: 13, color: "var(--text-secondary)" }}>{s.l}</span>
                    <span style={{
                      fontSize: 12, fontWeight: 700, fontFamily: "var(--font-mono)", padding: "3px 10px", borderRadius: 99,
                      color: s.v > 60 ? "var(--positive)" : s.v > 40 ? "var(--warning)" : "var(--negative)",
                      background: s.v > 60 ? "var(--positive-bg)" : s.v > 40 ? "var(--warning-bg)" : "var(--negative-bg)",
                    }}>{s.v}</span>
                  </div>
                ))}
              </Card>
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: "center", padding: "32px 0 16px", fontSize: 11, color: "var(--text-muted)", letterSpacing: 1 }}>
            MEME·RADAR — Powered by Social Intelligence AI — Data simulated for demo — Not financial advice
          </div>
        </div>
      </main>
    </div>
  );
}
