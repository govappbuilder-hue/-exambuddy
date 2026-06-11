'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

const EXAM_TARGETS = [
  { value: 'gpsc', label: '👑 GPSC Class 1-2', color: '#6366f1' },
  { value: 'gsssb', label: '📝 GSSSB / Bin Sachivalay', color: '#8b5cf6' },
  { value: 'police', label: '👮 Police Constable / PSI', color: '#10b981' },
  { value: 'talati', label: '🏢 Revenue Talati / Mantri', color: '#f59e0b' },
  { value: 'tet', label: '📚 TET / TAT', color: '#3b82f6' },
  { value: 'htat', label: '🏫 HTAT', color: '#ec4899' },
  { value: 'other', label: '💼 અન્ય', color: '#64748b' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    exam_target: '',
  });

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      // Already profile છે?
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setForm({
          full_name: data.full_name || '',
          phone: data.phone || '',
          exam_target: data.exam_target || '',
        });
      } else if (user.user_metadata?.full_name) {
        setForm(f => ({ ...f, full_name: user.user_metadata.full_name }));
      }
      setLoading(false);
    };
    init();
  }, [router]);

  const handleSave = async () => {
    if (!form.full_name.trim()) { setMsg('❌ નામ ભરવું જરૂરી છે!'); return; }
    if (!form.exam_target) { setMsg('❌ Exam target select કરો!'); return; }

    setSaving(true);
    setMsg('');

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        exam_target: form.exam_target,
        created_at: new Date().toISOString(),
      });

    setSaving(false);

    if (error) {
      setMsg('❌ Error: ' + error.message);
    } else {
      setMsg('✅ Profile સેવ થઈ ગઈ!');
      setTimeout(() => router.push('/'), 1500);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#030712', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#38bdf8', fontSize: '18px', fontWeight: '700' }}>⏳ લોડ થઈ રહ્યું છે...</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top, #1e1b4b, #030712)', fontFamily: 'system-ui', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ maxWidth: '480px', width: '100%' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '56px', marginBottom: '12px' }}>🎓</div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', background: 'linear-gradient(to right, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 8px' }}>
            Profile Setup
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            એક વખત fill કરો — forever ready!
          </p>
        </div>

        {/* Form Card */}
        <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid #1e293b', borderRadius: '24px', padding: '32px', backdropFilter: 'blur(10px)' }}>

          {msg && (
            <div style={{
              padding: '12px 16px', borderRadius: '12px', marginBottom: '20px',
              background: msg.includes('✅') ? '#064e3b' : '#450a0a',
              color: msg.includes('✅') ? '#6ee7b7' : '#fca5a5',
              fontWeight: '700', fontSize: '14px', textAlign: 'center',
            }}>
              {msg}
            </div>
          )}

          {/* Email (readonly) */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
              📧 Email
            </label>
            <input
              type="text"
              value={user?.email || ''}
              disabled
              style={{ width: '100%', padding: '13px 16px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#475569', fontSize: '15px', boxSizing: 'border-box', cursor: 'not-allowed' }}
            />
          </div>

          {/* Full Name */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
              👤 પૂરું નામ *
            </label>
            <input
              type="text"
              value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              placeholder="તમારું પૂરું નામ..."
              style={{ width: '100%', padding: '13px 16px', background: '#0f172a', border: '2px solid #1e293b', borderRadius: '12px', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = '#1e293b'}
            />
          </div>

          {/* Phone */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
              📱 Phone Number
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="9876543210"
              maxLength={10}
              style={{ width: '100%', padding: '13px 16px', background: '#0f172a', border: '2px solid #1e293b', borderRadius: '12px', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = '#1e293b'}
            />
          </div>

          {/* Exam Target */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: '700', marginBottom: '12px' }}>
              🎯 Exam Target * — કઈ પરીક્ષાની તૈયારી?
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {EXAM_TARGETS.map(exam => (
                <button
                  key={exam.value}
                  onClick={() => setForm(f => ({ ...f, exam_target: exam.value }))}
                  style={{
                    padding: '12px', borderRadius: '12px', cursor: 'pointer',
                    border: `2px solid ${form.exam_target === exam.value ? exam.color : '#1e293b'}`,
                    background: form.exam_target === exam.value ? exam.color + '20' : '#0f172a',
                    color: form.exam_target === exam.value ? 'white' : '#64748b',
                    fontWeight: '700', fontSize: '13px', textAlign: 'left',
                    transition: 'all 0.2s',
                  }}>
                  {exam.label}
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%', padding: '15px',
              background: saving ? '#334155' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white', border: 'none', borderRadius: '14px',
              fontSize: '17px', fontWeight: '900', cursor: saving ? 'not-allowed' : 'pointer',
              marginBottom: '12px',
            }}>
            {saving ? '⏳ Save થઈ રહ્યું છે...' : '💾 Profile Save કરો'}
          </button>

          <button
            onClick={() => router.push('/')}
            style={{ width: '100%', padding: '12px', background: 'transparent', color: '#475569', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '14px', cursor: 'pointer' }}>
            ← Home
          </button>
        </div>

        <p style={{ textAlign: 'center', color: '#334155', fontSize: '12px', marginTop: '16px' }}>
          🔒 તમારી information સુરક્ષિત છે
        </p>
      </div>
    </div>
  );
}