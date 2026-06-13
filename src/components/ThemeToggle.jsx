'use client';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const isDark = saved !== 'light';
    setDark(isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <button onClick={toggle} style={{
      background: 'transparent',
      border: '2px solid #334155',
      borderRadius: '20px',
      padding: '6px 14px',
      cursor: 'pointer',
      fontSize: '16px',
      color: 'inherit'
    }}>
      {dark ? '☀️' : '🌙'}
    </button>
  );
}