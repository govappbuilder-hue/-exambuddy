'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  dark: false,
  toggleDark: () => {},
});

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(false);

  // App open thay tyare localStorage thi restore karo
  useEffect(() => {
    const saved = localStorage.getItem('eb_dark_mode');
    // Default: user e pehla set karyu hoy to e use karo, nahi to dark=true (taro app dark by default)
    const isDark = saved === null ? true : saved === 'true';
    setDark(isDark);
    applyTheme(isDark);
  }, []);

  const applyTheme = (isDark) => {
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      document.body.style.backgroundColor = '#0f0f13';
      document.body.style.color = '#f1f5f9';
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.style.backgroundColor = '#f0f4ff';
      document.body.style.color = '#0f172a';
    }
  };

  const toggleDark = () => {
    const newDark = !dark;
    setDark(newDark);
    localStorage.setItem('eb_dark_mode', String(newDark));
    applyTheme(newDark);
  };

  return (
    <ThemeContext.Provider value={{ dark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Badhaj pages ama import karva mate
export const useTheme = () => useContext(ThemeContext);