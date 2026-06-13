'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

const EXAM_TARGETS = [
  { value: 'gpsc', label: '👑 GPSC Class 1-2' },
  { value: 'gsssb', label: '📝 GSSSB / Bin Sachivalay' },
  { value: 'police', label: '👮 Police / PSI' },
  { value: 'talati', label: '🏢 Revenue Talati' },
  { value: 'tet', label: '📚 TET / TAT' },
  { value: 'htat', label: '🏫 HTAT' },
  { value: 'other', label: '💼 અન્ય' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1 = account, 2 = profile
  const [dark, setDark] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    email: '', password: '', confirm: '',
    full_name: '', phone: '', exam_target: '',
  });

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
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleStep1 = () => {
    setMsg('');
    if (!form.email) { setMsg('Email ભરો!'); return; }
    if (!form.password || form.password.length < 6) { setMsg('Password ઓછામાં ઓછો 6 characters નો હોવો જોઈએ!'); return; }
    if (form.password !== form.confirm) { setMsg('Passwords match નથી થતા!'); return; }
    setStep(2);
  };

  const handleRegister = async () => {
    setMsg('');
    if (!form.full_name.trim()) { setMsg('નામ ભરો!'); return; }
    if (!form.exam_target) { setMsg('Exam target select કરો!'); return; }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name } },
    });
    if (error) { setMsg(error.message); setLoading(false); return; }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        exam_target: form.exam_target,
        created_at: new Date().toISOString(),
      });
    }
    setLoading(false);
    setMsg('success');
  };

  const inputStyle = (border) => ({
    width: '100%', padding: '13px 16px', background: t.input,
    border: `1.5px solid ${border || t.inputBorder}`, borderRadius: '12px',
    fontSize: '15px', color: t.inputText, outline: 'none', boxSizing: 'border-box',
  });

  if (msg === 'success') return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'Inter, system-ui' }}>
      <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: '24px', padding: '48px 32px', width: '100%', maxWidth: '420px', textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: t.text, marginBottom: '12px' }}>Account બની ગઈ!</h2>
        <p style={{ color: t.sub, fontSize: '14px', marginBottom: '28px', lineHeight: 1.7 }}>
          {form.email} પર verification email મોકલ્યો છે.<br />Email verify કરો પછી login કરો.
        </p>
        <button onClick={() => router.push('/login')}
          style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer' }}>
          Login પર જાઓ →
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'Inter, system-ui', transition: 'background 0.3s' }}>

      {/* Theme Toggle */}
      <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 100 }}>
        <button onClick={() => setDark(d => !d)}
          style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: '50px', padding: '8px 14px', cursor: 'pointer', fontSize: '18px', color: t.text }}>
          {dark ? '☀️' : '🌙'}
        </button>
      </div>

      <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: '24px', padding: '40px 32px', width: '100%', maxWidth: '420px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: '28px' }}>
            🎓
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: t.text, margin: '0 0 4px' }}>
            {step === 1 ? 'Account બનાવો' : 'Profile Setup'}
          </h1>
          <p style={{ color: t.sub, fontSize: '13px', margin: 0 }}>
            {step === 1 ? 'Step 1 of 2 — Login details' : 'Step 2 of 2 — Tari info'}
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: '#6366f1' }} />
          <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: step >= 2 ? '#6366f1' : t.border }} />
        </div>

        {/* Error */}
        {msg && msg !== 'success' && (
          <div style={{ background: '#450a0a', border: '1px solid #7f1d1d', color: '#fca5a5', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px', textAlign: 'center' }}>
            ❌ {msg}
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: t.label, marginBottom: '8px' }}>📧 Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="your@email.com" style={inputStyle()}
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = t.inputBorder} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: t.label, marginBottom: '8px' }}>🔑 Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="ઓછામાં ઓછો 6 characters"
                  style={{ ...inputStyle(), paddingRight: '48px' }}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = t.inputBorder} />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: t.sub }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: t.label, marginBottom: '8px' }}>🔑 Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showConfirm ? 'text' : 'password'} value={form.confirm}
                  onChange={e => set('confirm', e.target.value)}
                  placeholder="Password ફરીથી ભરો"
                  style={{ ...inputStyle(), paddingRight: '48px' }}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = t.inputBorder} />
                <button type="button" onClick={() => setShowConfirm(s => !s)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: t.sub }}>
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button onClick={handleStep1}
              style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginBottom: '16px' }}>
              આગળ વધો →
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: t.label, marginBottom: '8px' }}>👤 પૂરું નામ *</label>
              <input type="text" value={form.full_name} onChange={e => set('full_name', e.target.value)}
                placeholder="તમારું પૂરું નામ..."
                style={inputStyle()}
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = t.inputBorder} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: t.label, marginBottom: '8px' }}>📱 Phone (optional)</label>
              <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder="9876543210" maxLength={10}
                style={inputStyle()}
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = t.inputBorder} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: t.label, marginBottom: '10px' }}>🎯 Exam Target *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {EXAM_TARGETS.map(ex => (
                  <button key={ex.value} onClick={() => set('exam_target', ex.value)}
                    style={{ padding: '11px 10px', borderRadius: '10px', cursor: 'pointer', textAlign: 'left', fontSize: '12px', fontWeight: '600',
                      border: `2px solid ${form.exam_target === ex.value ? '#6366f1' : t.inputBorder}`,
                      background: form.exam_target === ex.value ? '#6366f120' : t.input,
                      color: form.exam_target === ex.value ? '#818cf8' : t.sub,
                      transition: 'all 0.15s' }}>
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleRegister} disabled={loading}
              style={{ width: '100%', padding: '14px', background: loading ? '#334155' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '12px' }}>
              {loading ? '⏳ Account બની રહ્યી છે...' : '🎉 Account બનાવો'}
            </button>

            <button onClick={() => { setStep(1); setMsg(''); }}
              style={{ width: '100%', padding: '11px', background: 'transparent', border: `1px solid ${t.border}`, borderRadius: '12px', color: t.sub, fontSize: '14px', cursor: 'pointer' }}>
              ← પાછળ જાઓ
            </button>
          </>
        )}

        <p style={{ textAlign: 'center', marginTop: '20px', color: t.sub, fontSize: '14px' }}>
          Account છે?{' '}
          <span onClick={() => router.push('/login')}
            style={{ color: '#6366f1', fontWeight: '700', cursor: 'pointer' }}>
            Login કરો
          </span>
        </p>
      </div>
    </div>
  );
}