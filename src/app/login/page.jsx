'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [dark, setDark] = useState(true);

  const t = {
    bg: dark ? '#0a0f1e' : '#f0f4ff',
    card: dark ? '#111827' : '#ffffff',
    border: dark ? '#1e293b' : '#e2e8f0',
    text: dark ? '#f1f5f9' : '#0f172a',
    sub: dark ? '#64748b' : '#64748b',
    label: dark ? '#94a3b8' : '#374151',
    input: dark ? '#0f172a' : '#f8fafc',
    inputBorder: dark ? '#1e293b' : '#d1d5db',
    inputText: dark ? '#f1f5f9' : '#0f172a',
    placeholder: dark ? '#475569' : '#9ca3af',
  };

  const handleLogin = async () => {
    if (!email || !password) { setMsg('Email અને Password ભરો!'); return; }
    setLoading(true);
    setMsg('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setMsg(error.message);
    else router.push('/');
  };

  const handleKey = (e) => { if (e.key === 'Enter') handleLogin(); };

  return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'Inter, system-ui', transition: 'background 0.3s' }}>

      {/* Theme Toggle */}
      <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 100 }}>
        <button onClick={() => setDark(d => !d)}
          style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: '50px', padding: '8px 14px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '6px', color: t.text, transition: 'all 0.2s' }}>
          {dark ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Card */}
      <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: '24px', padding: '40px 32px', width: '100%', maxWidth: '420px', transition: 'all 0.3s' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '28px' }}>
            🎓
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: t.text, margin: '0 0 6px' }}>ExamBuddy</h1>
          <p style={{ color: t.sub, fontSize: '14px', margin: 0 }}>Login કરો અને આગળ વધો!</p>
        </div>

        {/* Error */}
        {msg && (
          <div style={{ background: '#450a0a', border: '1px solid #7f1d1d', color: '#fca5a5', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px', fontWeight: '500', textAlign: 'center' }}>
            ❌ {msg}
          </div>
        )}

        {/* Email */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: t.label, marginBottom: '8px' }}>
            📧 Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={handleKey}
            placeholder="your@email.com"
            style={{ width: '100%', padding: '13px 16px', background: t.input, border: `1.5px solid ${t.inputBorder}`, borderRadius: '12px', fontSize: '15px', color: t.inputText, outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s' }}
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e => e.target.style.borderColor = t.inputBorder}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: t.label, marginBottom: '8px' }}>
            🔑 Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKey}
              placeholder="••••••••"
              style={{ width: '100%', padding: '13px 48px 13px 16px', background: t.input, border: `1.5px solid ${t.inputBorder}`, borderRadius: '12px', fontSize: '15px', color: t.inputText, outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s' }}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = t.inputBorder}
            />
            <button
              type="button"
              onClick={() => setShowPass(s => !s)}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px', color: t.sub }}>
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ width: '100%', padding: '14px', background: loading ? '#334155' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', marginBottom: '16px' }}>
          {loading ? '⏳ Login થઈ રહ્યો છે...' : '🚀 Login'}
        </button>

        {/* Register link */}
        <p style={{ textAlign: 'center', color: t.sub, fontSize: '14px', margin: 0 }}>
          Account નથી?{' '}
          <span onClick={() => router.push('/register')}
            style={{ color: '#6366f1', fontWeight: '700', cursor: 'pointer' }}>
            Register કરો
          </span>
        </p>
      </div>

      <p style={{ color: t.sub, fontSize: '12px', marginTop: '20px' }}>
        🔒 તમારી information સુરક્ષિત છે
      </p>
    </div>
  );
}