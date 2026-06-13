'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

const ALL_BADGES = [
  { id: 'first_quiz',  icon: '🎯', name: 'પ્રથમ ક્વિઝ',    desc: '1 quiz આપો',          check: (h) => h.length >= 1 },
  { id: 'quiz_10',     icon: '🔟', name: '10 ક્વિઝ',        desc: '10 quiz પૂર્ણ કરો',   check: (h) => h.length >= 10 },
  { id: 'quiz_50',     icon: '🏅', name: '50 ક્વિઝ',        desc: '50 quiz પૂર્ણ કરો',   check: (h) => h.length >= 50 },
  { id: 'perfect',     icon: '💯', name: 'પર્ફેક્ટ સ્કોર',  desc: '100% score મેળવો',    check: (h) => h.some(q => q.score === q.total && q.total > 0) },
  { id: 'high_score',  icon: '🌟', name: 'High Scorer',     desc: 'Average 80%+ રાખો',   check: (h) => h.length >= 5 && (h.reduce((a, b) => a + (b.score / b.total) * 100, 0) / h.length) >= 80 },
  { id: 'streak_3',    icon: '🔥', name: '3 Day Streak',    desc: '3 days study karo',   check: (h, s) => s >= 3 },
  { id: 'streak_7',    icon: '⚡', name: '7 Day Streak',    desc: '7 days study karo',   check: (h, s) => s >= 7 },
  { id: 'streak_30',   icon: '👑', name: '30 Day Streak',   desc: '30 days study karo',  check: (h, s) => s >= 30 },
  { id: 'subject_5',   icon: '📚', name: 'Multi Subject',   desc: '5 subjects cover karo', check: (h) => new Set(h.map(q => q.subject_name)).size >= 5 },
  { id: 'early_bird',  icon: '🌅', name: 'Early Bird',      desc: 'Subah 6-9 ma quiz',   check: (h) => h.some(q => { const hr = new Date(q.created_at).getHours(); return hr >= 6 && hr < 9; }) },
  { id: 'night_owl',   icon: '🦉', name: 'Night Owl',       desc: 'Raat 10 pachhi quiz',  check: (h) => h.some(q => new Date(q.created_at).getHours() >= 22) },
  { id: 'centurion',   icon: '💪', name: 'Centurion',       desc: '100 quiz complete karo', check: (h) => h.length >= 100 },
];

export default function BadgesPage() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data } = await supabase
        .from('quiz_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const h = data || [];
      setHistory(h);

      // Streak calculate
      const days = new Set(h.map(d => new Date(d.created_at).toDateString()));
      let s = 0;
      const today = new Date();
      while (days.has(new Date(today.getTime() - s * 86400000).toDateString())) s++;
      setStreak(s);

      setLoading(false);
    };
    init();
  }, []);

  const earned = ALL_BADGES.filter(b => b.check(history, streak));
  const notEarned = ALL_BADGES.filter(b => !b.check(history, streak));

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'system-ui' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏆</div>
        <div style={{ fontSize: '16px', color: '#94a3b8' }}>Badges load thay chhe...</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: 'system-ui', color: 'white', paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{ background: '#1e293b', padding: '16px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '12px', position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={() => router.push('/dashboard')} style={{ background: '#334155', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '13px' }}>← Back</button>
        <div>
          <div style={{ fontWeight: '900', fontSize: '18px' }}>🏆 Badges</div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>{earned.length}/{ALL_BADGES.length} earned • {streak} day streak</div>
        </div>
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '20px 16px' }}>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '24px' }}>
          {[
            { val: history.length, label: 'Total Quiz', icon: '📝' },
            { val: earned.length, label: 'Badges Earned', icon: '🏅' },
            { val: streak + ' days', label: 'Current Streak', icon: '🔥' },
          ].map(s => (
            <div key={s.label} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>{s.icon}</div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: 'white' }}>{s.val}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Earned Badges */}
        {earned.length > 0 && (
          <>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#10b981', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ✅ Earned ({earned.length})
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px', marginBottom: '24px' }}>
              {earned.map(b => (
                <div key={b.id} style={{ background: 'linear-gradient(135deg,#1e3a5f,#1e293b)', border: '2px solid #3b82f6', borderRadius: '16px', padding: '18px', textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', marginBottom: '8px' }}>{b.icon}</div>
                  <div style={{ fontWeight: '800', fontSize: '14px', marginBottom: '4px' }}>{b.name}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{b.desc}</div>
                  <div style={{ marginTop: '8px', fontSize: '11px', background: '#10b98120', color: '#10b981', padding: '2px 8px', borderRadius: '20px', display: 'inline-block', fontWeight: '700' }}>✅ Earned</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Locked Badges */}
        {notEarned.length > 0 && (
          <>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#64748b', marginBottom: '12px' }}>
              🔒 Locked ({notEarned.length})
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px' }}>
              {notEarned.map(b => (
                <div key={b.id} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '18px', textAlign: 'center', opacity: 0.5 }}>
                  <div style={{ fontSize: '40px', marginBottom: '8px', filter: 'grayscale(1)' }}>{b.icon}</div>
                  <div style={{ fontWeight: '800', fontSize: '14px', marginBottom: '4px' }}>{b.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{b.desc}</div>
                  <div style={{ marginTop: '8px', fontSize: '11px', background: '#33415520', color: '#64748b', padding: '2px 8px', borderRadius: '20px', display: 'inline-block', fontWeight: '700' }}>🔒 Locked</div>
                </div>
              ))}
            </div>
          </>
        )}

        {history.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📝</div>
            <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>Haju koi quiz nathi aapyo!</div>
            <div style={{ fontSize: '13px', marginBottom: '20px' }}>Quiz aapva thi badges unlock thashe</div>
            <button onClick={() => router.push('/dashboard')} style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 24px', cursor: 'pointer', fontWeight: '800' }}>
              Quiz Shuru Karo →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}