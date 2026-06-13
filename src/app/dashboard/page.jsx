'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [timeOfDay, setTimeOfDay] = useState('Morning');
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [targets, setTargets] = useState([
    { id: 1, text: 'Complete History Quiz – Ch. 5', done: false },
    { id: 2, text: 'Read Current Affairs', done: false },
    { id: 3, text: 'Revise 20 Polity Flashcards', done: false },
    { id: 4, text: 'Practice Negative Marking Set', done: false },
  ]);
  const [newTarget, setNewTarget] = useState('');
  const [showAddTarget, setShowAddTarget] = useState(false);
  const [stats, setStats] = useState({ quizzes: 0, accuracy: 0, streak: 0, rank: '-' });

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setTimeOfDay('Morning');
    else if (h < 17) setTimeOfDay('Afternoon');
    else setTimeOfDay('Evening');

    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });
  }, []);

  const toggleTarget = (id) => {
    setTargets(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const addTarget = () => {
    if (!newTarget.trim()) return;
    setTargets(prev => [...prev, { id: Date.now(), text: newTarget, done: false }]);
    setNewTarget('');
    setShowAddTarget(false);
  };

  const removeTarget = (id) => {
    setTargets(prev => prev.filter(t => t.id !== id));
  };

  const doneCnt = targets.filter(t => t.done).length;
  const pct = targets.length ? Math.round((doneCnt / targets.length) * 100) : 0;

  const quickActions = [
    { icon: '⚡', label: 'Generate Quiz', sub: 'AI-powered MCQs', color: '#6366f1', href: '/quiz' },
    { icon: '🤖', label: 'AI Doubt', sub: 'Instant answers', color: '#8b5cf6', href: '/doubt-solver' },
    { icon: '🎴', label: 'Flashcards', sub: 'Study & Review', color: '#14b8a6', href: '/flashcards' },
    { icon: '📰', label: "Today's News", sub: 'Current Affairs', color: '#f59e0b', href: '/current-affairs' },
  ];

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'Student';

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', fontFamily: 'Inter, system-ui', paddingBottom: '90px' }}>

      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%)',
        padding: '20px 16px 24px', color: 'white', position: 'relative', overflow: 'hidden'
      }}>
        {/* bg decoration */}
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '13px', opacity: 0.85, marginBottom: '4px' }}>
              Good {timeOfDay} 👋
            </div>
            <div style={{ fontSize: '22px', fontWeight: '800', lineHeight: 1.2 }}>
              Ready to crack<br />today's exam? 🎯
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{
              background: 'rgba(255,255,255,0.15)', borderRadius: '12px',
              padding: '8px 12px', textAlign: 'center'
            }}>
              <div style={{ fontSize: '20px', fontWeight: '800' }}>🔥 {stats.streak}</div>
              <div style={{ fontSize: '10px', opacity: 0.8 }}>DAY STREAK</div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          {[
            { label: 'Quizzes Done', value: stats.quizzes, icon: '📝' },
            { label: 'Accuracy', value: `${stats.accuracy}%`, icon: '🎯' },
            { label: 'Your Rank', value: stats.rank, icon: '🏆' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.12)', borderRadius: '12px',
              padding: '10px 8px', textAlign: 'center', backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '16px' }}>{s.icon}</div>
              <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '2px' }}>{s.value}</div>
              <div style={{ fontSize: '10px', opacity: 0.8 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px', maxWidth: '640px', margin: '0 auto' }}>

        {/* Quick Actions */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            ⚡ Quick Actions
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {quickActions.map((a, i) => (
              <button key={i} onClick={() => router.push(a.href)} style={{
                background: 'white', border: 'none', borderRadius: '16px',
                padding: '16px', display: 'flex', alignItems: 'center', gap: '12px',
                cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                textAlign: 'left', transition: 'transform 0.1s',
              }}>
                <div style={{
                  width: '44px', height: '44px', background: `${a.color}15`,
                  borderRadius: '12px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '22px', flexShrink: 0
                }}>{a.icon}</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{a.label}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{a.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Today's Targets */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '16px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b' }}>🎯 Today's Targets</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{doneCnt}/{targets.length} done · {pct}% complete</div>
            </div>
            <button onClick={() => setShowAddTarget(!showAddTarget)} style={{
              background: '#6366f1', color: 'white', border: 'none',
              borderRadius: '10px', padding: '6px 12px', fontSize: '12px',
              fontWeight: '700', cursor: 'pointer'
            }}>+ Add</button>
          </div>

          {/* Progress Bar */}
          <div style={{ background: '#f1f5f9', borderRadius: '10px', height: '6px', marginBottom: '12px' }}>
            <div style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', height: '100%', borderRadius: '10px', transition: 'width 0.3s' }} />
          </div>

          {showAddTarget && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                value={newTarget}
                onChange={e => setNewTarget(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTarget()}
                placeholder="Navo target type karo..."
                style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', outline: 'none' }}
              />
              <button onClick={addTarget} style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: '10px', padding: '8px 14px', fontWeight: '700', cursor: 'pointer' }}>✓</button>
            </div>
          )}

          {targets.map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
              <button onClick={() => toggleTarget(t.id)} style={{
                width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                border: t.done ? 'none' : '2px solid #cbd5e1',
                background: t.done ? '#6366f1' : 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '12px'
              }}>{t.done ? '✓' : ''}</button>
              <span style={{ flex: 1, fontSize: '13px', color: t.done ? '#94a3b8' : '#1e293b', textDecoration: t.done ? 'line-through' : 'none' }}>{t.text}</span>
              <button onClick={() => removeTarget(t.id)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '16px', padding: '0' }}>×</button>
            </div>
          ))}
        </div>

        {/* Exam Countdown */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '16px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b' }}>⏳ Exam Countdown</div>
            <button onClick={() => router.push('/my-progress')} style={{
              background: '#f0f4ff', color: '#6366f1', border: 'none',
              borderRadius: '8px', padding: '5px 10px', fontSize: '11px', fontWeight: '700', cursor: 'pointer'
            }}>+ Add Exam</button>
          </div>
          {[
            { name: 'GSSSB Junior Clerk 2026', date: '2026-07-12', color: '#f59e0b' },
            { name: 'IBPS PO 2026', date: '2026-08-10', color: '#6366f1' },
          ].map((exam, i) => {
            const days = Math.max(0, Math.ceil((new Date(exam.date) - new Date()) / (1000 * 60 * 60 * 24)));
            return (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i === 0 ? '1px solid #f1f5f9' : 'none' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{exam.name}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{exam.date}</div>
                </div>
                <div style={{ background: `${exam.color}15`, color: exam.color, borderRadius: '10px', padding: '6px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800' }}>{days}</div>
                  <div style={{ fontSize: '10px', fontWeight: '600' }}>DAYS</div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}