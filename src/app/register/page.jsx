'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleRegister = async () => {
    if (!email || !password || !name) { setMsg('❌ બધા ફીલ્ડ ભरो!'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
    setLoading(false);
    if (error) setMsg('❌ ' + error.message);
    else { setMsg('✅ Account બની ગયો! Email verify કરો.'); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'system-ui' }}>
      <div style={{ background: 'white', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '48px' }}>🎓</div>
          <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', margin: '10px 0 5px' }}>ExamBuddy</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>નવો Account બनावो!</p>
        </div>

        {msg && <div style={{ background: msg.includes('✅') ? '#dcfce7' : '#fee2e2', color: msg.includes('✅') ? '#166534' : '#dc2626', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', fontWeight: '600' }}>{msg}</div>}

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: '700', color: '#374151', marginBottom: '6px', fontSize: '14px' }}>👤 પૂरु નામ</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="તારું નામ"
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: '700', color: '#374151', marginBottom: '6px', fontSize: '14px' }}>📧 Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontWeight: '700', color: '#374151', marginBottom: '6px', fontSize: '14px' }}>🔑 Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
        </div>

        <button onClick={handleRegister} disabled={loading}
          style={{ width: '100%', padding: '14px', background: loading ? '#94a3b8' : 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? '⏳ Account બनी રહ્યો છે...' : '✨ Register'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#64748b', fontSize: '14px' }}>
          Account છे?{' '}
          <span onClick={() => router.push('/login')} style={{ color: '#667eea', fontWeight: '700', cursor: 'pointer' }}>Login કરો</span>
        </p>
      </div>
    </div>
  );
}