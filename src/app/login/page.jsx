'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // 📧 ઈમેલ-પાસવર્ડ લોગિન લોજિક
  const handleLogin = async () => {
    if (!email || !password) {
      setMsg({ text: 'Email ane password bharjo!', type: 'error' });
      return;
    }
    setLoading(true);
    setMsg({ text: '', type: '' });

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setLoading(false);

    if (error) {
      setMsg({ text: error.message, type: 'error' });
    } else {
      setMsg({ text: '✅ Login successful!', type: 'success' });
      router.push('/dashboard');
    }
  };

  // 🌐 ગૂગલ લોગિન લોજિક
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setMsg({ text: '', type: '' });

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setMsg({ text: error.message, type: 'error' });
      setGoogleLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
      fontFamily: 'sans-serif', padding: '20px'
    }}>
      <div style={{
        background: 'white', borderRadius: '16px', padding: '40px',
        width: '100%', maxWidth: '400px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
          🎓 ExamBuddy
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '14px' }}>
          Login to continue your preparation
        </p>

        {msg.text && (
          <div style={{
            background: msg.type === 'error' ? '#fee2e2' : '#dcfce7',
            color: msg.type === 'error' ? '#dc2626' : '#16a34a',
            padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px'
          }}>
            {msg.type === 'error' ? '❌' : '✅'} {msg.text}
          </div>
        )}

        {/* 🌐 ગૂગલ લોગિન બટન */}
        <button 
          onClick={handleGoogleLogin} 
          disabled={googleLoading || loading} 
          style={{
            width: '100%', padding: '12px',
            background: 'white', color: '#374151', 
            border: '2px solid #e2e8f0', borderRadius: '8px',
            fontSize: '15px', fontWeight: '700',
            cursor: (googleLoading || loading) ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            marginBottom: '20px', transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="google" style={{ width: '18px', height: '18px' }} />
          {googleLoading ? '⏳ Connecting...' : 'Google સાથે લોગિન કરો'}
        </button>

        {/* ➖ અથવા (OR) લાઇન ➖ */}
        <div style={{ display: 'flex', alignItems: 'center', textAlign: 'center', color: '#9ca3af', fontSize: '12px', marginBottom: '20px' }}>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
          <span style={{ padding: '0 10px', fontWeight: '650' }}>અથવા</span>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
        </div>

        {/* 📧 ઈમેલ ઇનપુટ */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
            Email
          </label>
          <input
            type="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* 🔑 પાસવર્ડ ઇનપુટ */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
            Password
          </label>
          <input
            type="password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* 🚀 મેઈન સબમિટ બટન */}
        <button onClick={handleLogin} disabled={loading || googleLoading} style={{
          width: '100%', padding: '14px',
          background: (loading || googleLoading) ? '#93c5fd' : '#2563eb',
          color: 'white', border: 'none', borderRadius: '8px',
          fontSize: '16px', fontWeight: '700',
          cursor: (loading || googleLoading) ? 'not-allowed' : 'pointer'
        }}>
          {loading ? '⏳ Logging in...' : '🚀 Login'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6b7280' }}>
          Account નથી?{' '}
          <a href="/register" style={{ color: '#2563eb', fontWeight: '600' }}>Register here</a>
        </p>
      </div>
    </div>
  );
}