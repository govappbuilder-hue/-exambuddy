'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  dark: true,
  toggleDark: () => {},
});

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('eb_dark_mode');
    const isDark = saved === null ? true : saved === 'true';
    setDark(isDark);
    applyTheme(isDark);
  }, []);

  const applyTheme = (isDark) => {
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
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

export const useTheme = () => useContext(ThemeContext);