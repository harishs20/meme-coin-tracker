import { useState, useEffect, createContext } from 'react';
import MemeCoinDashboard from './components/MemeCoinDashboard';
import './index.css';

export const ThemeContext = createContext();

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('memeradar-theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('memeradar-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <MemeCoinDashboard />
    </ThemeContext.Provider>
  );
}

export default App;
