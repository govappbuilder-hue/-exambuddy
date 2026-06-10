'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

const SUBJECTS = [
  { value: 'maths', label: '🔢 ગણિત', color: '#6366f1' },
  { value: 'constitution', label: '📜 બંધારણ', color: '#8b5cf6' },
  { value: 'history', label: '🏛️ ઇતિહાસ', color: '#ec4899' },
  { value: 'geography', label: '🌍 ભૂગોળ', color: '#10b981' },
  { value: 'science', label: '🔬 વિજ્ઞાન', color: '#f59e0b' },
  { value: 'gujarati', label: '✍️ ગુજરાતી', color: '#3b82f6' },
  { value: 'computer', label: '💻 કમ્પ્યૂટર', color: '#14b8a6' },
  { value: 'reasoning', label: '🧩 રીઝનિંગ', color: '#f97316' },
  { value: 'english', label: '🔤 English', color: '#84cc16' },
  { value: 'current-affairs', label: '📰 કરંટ અફેર્સ', color: '#ef4444' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [counts, setCounts] = useState({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      const results = {};
      let t = 0;
      for (const s of SUBJECTS) {
        const { count } = await supabase
          .from('questions').select('*', { count: 'exact', head: true })
          .eq('subject', s.value);
        results[s.value] = count || 0;
        t += count || 0;
      }
      setCounts(results);
      setTotal(t);
      setLoading(false);
    };
    init();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'white', fontSize: '20px', fontWeight: '700' }}>⏳ લોડ થઈ રહ્યું છે...</div>
    </div>
  );

  const maxCount = Math.max(...Object.values(counts), 1);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui' }}>
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px', color: 'white' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '900' }}>📚 ExamBuddy</h1>
            <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: '13px' }}>
              નમસ્તે, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}! 👋
            </p>
          </div>
          <button onClick={handleLogout}
            style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '10px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer', fontWeight: '700' }}>
            લૉગ આઉટ
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { icon: '❓', label: 'કુલ સવાલ', value: total, color: '#6366f1' },
            { icon: '📚', label: 'વિષયો', value: SUBJECTS.length, color: '#8b5cf6' },
            { icon: '🎯', label: 'તૈયાર', value: SUBJECTS.filter(s => (counts[s.value] || 0) > 0).length, color: '#10b981' },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'white', borderRadius: '16px', padding: '16px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '28px' }}>{stat.icon}</div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e1b4b', marginBottom: '16px' }}>🎯 વિષય પ્રમાણે ક્વિઝ</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {SUBJECTS.map(s => {
            const count = counts[s.value] || 0;
            const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
            const ready = count >= 10;
            return (
              <button key={s.value}
                onClick={() => ready ? router.push(`/quiz/${s.value}`) : null}
                style={{ background: 'white', borderRadius: '16px', padding: '16px', border: `2px solid ${ready ? s.color + '30' : '#f1f5f9'}`, cursor: ready ? 'pointer' : 'default', textAlign: 'left', boxShadow: '0 4px 15px rgba(0,0,0,0.06)', opacity: ready ? 1 : 0.6 }}>
                <div style={{ fontSize: '22px', marginBottom: '6px' }}>{s.label.split(' ')[0]}</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                  {s.label.split(' ').slice(1).join(' ')}
                </div>
                <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', marginBottom: '6px' }}>
                  <div style={{ height: '100%', width: `${barWidth}%`, background: s.color, borderRadius: '3px' }} />
                </div>
                <div style={{ fontSize: '12px', color: ready ? s.color : '#94a3b8', fontWeight: '700' }}>
                  {ready ? `${count} સવાલ ✓` : `${count} સવાલ (ઓછા)`}
                </div>
              </button>
            );
          })}
        </div>

        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e1b4b', marginBottom: '16px' }}>⚡ ઝડપી કામ</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {[
            { icon: '🛡️', label: 'Admin Panel', sub: 'સવાલ ઉમેરો', path: '/admin', color: '#6366f1' },
            { icon: '📰', label: 'કરંટ અફેર્સ', sub: 'આજના સમાચાર', path: '/current-affairs', color: '#ef4444' },
            { icon: '📊', label: 'Analytics', sub: 'પ્રગતિ જુઓ', path: '/analytics', color: '#10b981' },
            { icon: '🎓', label: 'Mock Test', sub: 'ફૂલ ટેસ્ટ', path: '/mock-test', color: '#f59e0b' },
          ].map(action => (
            <button key={action.path} onClick={() => router.push(action.path)}
              style={{ background: 'white', borderRadius: '16px', padding: '16px', border: `2px solid ${action.color}20`, cursor: 'pointer', textAlign: 'left', boxShadow: '0 4px 15px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '32px' }}>{action.icon}</div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '14px', color: '#1e1b4b' }}>{action.label}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{action.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}