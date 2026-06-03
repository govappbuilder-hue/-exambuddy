'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

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
        <p style={{ color: '#6b7280', marginBottom: '28px', fontSize: '14px' }}>
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

        <button onClick={handleLogin} disabled={loading} style={{
          width: '100%', padding: '14px',
          background: loading ? '#93c5fd' : '#2563eb',
          color: 'white', border: 'none', borderRadius: '8px',
          fontSize: '16px', fontWeight: '700',
          cursor: loading ? 'not-allowed' : 'pointer'
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