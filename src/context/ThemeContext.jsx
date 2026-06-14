'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  dark: true,
  toggleDark: () => {},
});

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(true); // default dark

  useEffect(() => {
    const saved = localStorage.getItem('eb_dark_mode');
    // Pehli vaar open: dark=true (app dark by default)
    const isDark = saved === null ? true : saved === 'true';
    setDark(isDark);
    applyTheme(isDark);
  }, []);

  const applyTheme = (isDark) => {
    if (isDark) {
      // Dark mode: data-theme attribute remove karo
      document.documentElement.removeAttribute('data-theme');
    } else {
      // Light mode: data-theme="light" set karo
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