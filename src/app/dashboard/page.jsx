'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

const SUBJECTS = [
  { value: 'history',          label: 'ઇતિહાસ',       icon: '🏛',  exam: 'GPSC',   color: '#6366f1', count: '200+' },
  { value: 'geography',        label: 'ભૂગોળ',         icon: '🌍',  exam: 'GPSC',   color: '#0ea5e9', count: '150+' },
  { value: 'constitution',     label: 'બંધારણ',        icon: '📋',  exam: 'GPSC',   color: '#8b5cf6', count: '180+' },
  { value: 'economics',        label: 'અર્થશાસ્ત્ર',   icon: '📈',  exam: 'GPSC',   color: '#10b981', count: '120+' },
  { value: 'science',          label: 'વિજ્ઞાન',       icon: '🔬',  exam: 'GSSSB',  color: '#f59e0b', count: '160+' },
  { value: 'maths',            label: 'ગણિત',          icon: '🔢',  exam: 'GSSSB',  color: '#ef4444', count: '200+' },
  { value: 'reasoning',        label: 'રીઝનિંગ',       icon: '🧩',  exam: 'GSSSB',  color: '#ec4899', count: '180+' },
  { value: 'gujarati',         label: 'ગુજરાતી',       icon: '✍️',  exam: 'GSSSB',  color: '#14b8a6', count: '150+' },
  { value: 'gk',               label: 'સામાન્ય જ્ઞાન', icon: '💡',  exam: 'Police', color: '#f97316', count: '200+' },
  { value: 'current-affairs',  label: 'કરંટ અફેર્સ',   icon: '📰',  exam: 'Police', color: '#84cc16', count: '100+' },
  { value: 'gujarati_sahitya', label: 'ગુજ. સાહિત્ય',  icon: '📖',  exam: 'GSSSB',  color: '#a78bfa', count: '130+' },
  { value: 'gujarati_vyakran', label: 'ગુજ. વ્યાકરણ',  icon: '📝',  exam: 'GSSSB',  color: '#34d399', count: '140+' },
  { value: 'computer',         label: 'કમ્પ્યૂટર',     icon: '💻',  exam: 'GSSSB',  color: '#60a5fa', count: '110+' },
  { value: 'law',              label: 'કાયદો',         icon: '⚖️',  exam: 'PSI',    color: '#fb7185', count: '120+' },
  { value: 'polity',           label: 'રાજ્યશાસ્ત્ર',  icon: '🏢',  exam: 'PSI',    color: '#fbbf24', count: '130+' },
  { value: 'english',          label: 'English',       icon: '🔤',  exam: 'Police', color: '#4ade80', count: '90+'  },
];

const EXAM_TAGS = ['All', 'GPSC', 'GSSSB', 'Police', 'PSI'];

const BOTTOM_TABS = [
  { icon: '🏠', label: 'Home',    path: '/dashboard' },
  { icon: '📰', label: 'Affairs', path: '/current-affairs' },
  { icon: '🎓', label: 'Mock',    path: '/mock-test' },
  { icon: '📅', label: 'Exams',   path: '/analytics' },
  { icon: '👤', label: 'Profile', path: '/my-progress' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ quizzes: 0, avgScore: 0, streak: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      // Fetch quiz stats
      const { data: history } = await supabase
        .from('quiz_history')
        .select('score, total, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (history && history.length > 0) {
        const avg = Math.round(
          history.reduce((a, b) => a + (b.score / b.total) * 100, 0) / history.length
        );

        // streak calculation
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 30; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const dateStr = d.toDateString();
          const hasQuiz = history.some(h => new Date(h.created_at).toDateString() === dateStr);
          if (hasQuiz) streak++;
          else if (i > 0) break;
        }

        setStats({ quizzes: history.length, avgScore: avg, streak });
      }

      setLoading(false);
    };
    init();
  }, [router]);

  const filtered = activeTab === 'All'
    ? SUBJECTS
    : SUBJECTS.filter(s => s.exam === activeTab);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#6366f1', fontSize: '18px', fontWeight: '700' }}>⏳ લોડ થઈ રહ્યું છે...</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', fontFamily: 'system-ui', paddingBottom: '80px', color: 'white' }}>

      {/* ── TOP NAV ── */}
      <div style={{ background: '#0d1117', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>📚</span>
          <span style={{ fontSize: '18px', fontWeight: '900', background: 'linear-gradient(90deg,#6366f1,#0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ExamBuddy</span>
        </div>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}
          style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '6px 14px', color: '#94a3b8', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
          ⚡ Free
        </button>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 16px' }}>

        {/* ── WELCOME CARD ── */}
        <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#1e293b)', borderRadius: '20px', padding: '20px', margin: '16px 0', border: '1px solid #334155' }}>
          <div style={{ fontSize: '20px', fontWeight: '800', marginBottom: '4px' }}>
            નમસ્તે! 👋
          </div>
          <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>
            આજે ક્યા વિષયની પ્રેક્ટિસ કરીએ?
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
            {[
              { val: stats.quizzes, label: 'કુલ ટેસ્ટ' },
              { val: `${stats.avgScore}%`, label: 'સરેરાશ' },
              { val: `${stats.streak}d`, label: 'Streak' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#6366f1' }}>{s.val}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── EXAM FILTER TABS ── */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
          {EXAM_TAGS.map(tag => (
            <button key={tag} onClick={() => setActiveTab(tag)}
              style={{ flexShrink: 0, padding: '6px 18px', borderRadius: '20px', border: `1px solid ${activeTab === tag ? '#6366f1' : '#334155'}`, background: activeTab === tag ? '#6366f1' : 'transparent', color: activeTab === tag ? 'white' : '#94a3b8', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s' }}>
              {tag}
            </button>
          ))}
        </div>

        {/* ── SUBJECTS GRID ── */}
        <div style={{ fontSize: '14px', fontWeight: '700', color: '#64748b', marginBottom: '12px' }}>
          📚 વિષયો — Quiz Practice
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px', marginBottom: '24px' }}>
          {filtered.map(s => (
            <button key={s.value}
              onClick={() => router.push(`/quiz/${s.value}`)}
              style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '16px', padding: '18px 16px', textAlign: 'left', cursor: 'pointer', transition: 'border-color 0.15s', display: 'flex', flexDirection: 'column', gap: '8px' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = s.color + '60'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1e293b'}>
              <div style={{ fontSize: '28px' }}>{s.icon}</div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: 'white' }}>{s.label}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{s.count} સવાલ</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', background: s.color + '22', border: `1px solid ${s.color}44`, borderRadius: '6px', padding: '2px 10px', width: 'fit-content' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: s.color }}>{s.exam}</span>
              </div>
            </button>
          ))}
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div style={{ fontSize: '14px', fontWeight: '700', color: '#64748b', marginBottom: '12px' }}>⚡ ઝડપી કામ</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px' }}>
          {[
            { icon: '🤖', label: 'Doubt Solver', sub: 'AI Teacher',     path: '/doubt-solver', color: '#6366f1' },
            { icon: '🃏', label: 'Flashcards',   sub: 'AI Cards',       path: '/flashcards',   color: '#0ea5e9' },
            { icon: '🛡️', label: 'Admin Panel',  sub: 'સવાલ ઉમેરો',    path: '/admin',        color: '#8b5cf6' },
            { icon: '📊', label: 'Analytics',    sub: 'Weakness Check', path: '/analytics',    color: '#10b981' },
          ].map(a => (
            <button key={a.path} onClick={() => router.push(a.path)}
              style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '14px', padding: '14px', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: a.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>{a.icon}</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'white' }}>{a.label}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{a.sub}</div>
              </div>
            </button>
          ))}
        </div>

      </div>

      {/* ── BOTTOM NAV ── */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#0d1117', borderTop: '1px solid #1e293b', display: 'flex', zIndex: 100 }}>
        {BOTTOM_TABS.map(tab => {
          const active = typeof window !== 'undefined' && window.location.pathname === tab.path;
          return (
            <button key={tab.path} onClick={() => router.push(tab.path)}
              style={{ flex: 1, padding: '10px 4px 12px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
              <span style={{ fontSize: '20px' }}>{tab.icon}</span>
              <span style={{ fontSize: '10px', fontWeight: '600', color: active ? '#6366f1' : '#64748b' }}>{tab.label}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
}