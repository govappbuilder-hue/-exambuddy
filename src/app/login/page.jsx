'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setMsg('❌ Email અને Password ભરો!'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setMsg('❌ ' + error.message);
    else router.push('/');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'system-ui' }}>
      <div style={{ background: 'white', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '48px' }}>🎓</div>
          <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', margin: '10px 0 5px' }}>ExamBuddy</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Login કરો અને આગળ વધો!</p>
        </div>

        {msg && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', fontWeight: '600' }}>{msg}</div>}

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: '700', color: '#374151', marginBottom: '6px', fontSize: '14px' }}>📧 Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontWeight: '700', color: '#374151', marginBottom: '6px', fontSize: '14px' }}>🔑 Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
        </div>

        <button onClick={handleLogin} disabled={loading}
          style={{ width: '100%', padding: '14px', background: loading ? '#94a3b8' : 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? '⏳ Login થઈ રહ્યો છે...' : '🚀 Login'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#64748b', fontSize: '14px' }}>
          Account નથી?{' '}
          <span onClick={() => router.push('/register')} style={{ color: '#667eea', fontWeight: '700', cursor: 'pointer' }}>Register કરો</span>
        </p>
      </div>
    </div>
  );
}