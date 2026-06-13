'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

const EXAMS = ['GPSC Class 1-2', 'PSI', 'Talati', 'GSSSB', 'UPSC', 'Bin Sachivalay', 'Constable', 'TET', 'TAT', 'HTAT', 'Junior Clerk', 'Other'];

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [examTarget, setExamTarget] = useState('GPSC Class 1-2');
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([]);
  const [dark, setDark] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [editName, setEditName] = useState(false);
  const [stats] = useState({ quizzes: 0, accuracy: '0%', streak: 0, badges: 0 });
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
        setName(data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Student');
      }
    });
    const saved = localStorage.getItem('eb_notes');
    if (saved) setNotes(JSON.parse(saved));
    const savedExam = localStorage.getItem('eb_exam_target');
    if (savedExam) setExamTarget(savedExam);
  }, []);

  const saveNote = () => {
    if (!note.trim()) return;
    const updated = [{ id: Date.now(), text: note, date: new Date().toLocaleDateString('gu-IN') }, ...notes];
    setNotes(updated);
    localStorage.setItem('eb_notes', JSON.stringify(updated));
    setNote('');
  };

  const deleteNote = (id) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    localStorage.setItem('eb_notes', JSON.stringify(updated));
  };

  const saveExamTarget = (val) => {
    setExamTarget(val);
    localStorage.setItem('eb_exam_target', val);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const avatar = name?.charAt(0)?.toUpperCase() || 'S';

  const tabs = [
    { id: 'profile', label: '👤 Profile' },
    { id: 'notes', label: '📝 Notes' },
    { id: 'settings', label: '⚙️ Settings' },
    { id: 'premium', label: '👑 Premium' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', fontFamily: 'Inter, system-ui', paddingBottom: '90px' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', padding: '24px 16px 20px', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '20px',
            background: 'rgba(255,255,255,0.2)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', fontWeight: '800', border: '3px solid rgba(255,255,255,0.4)'
          }}>{avatar}</div>
          <div style={{ flex: 1 }}>
            {editName ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.5)', borderRadius: '8px', padding: '6px 10px', color: 'white', fontSize: '15px', fontWeight: '700', outline: 'none', flex: 1 }}
                />
                <button onClick={() => setEditName(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', padding: '6px 12px', color: 'white', fontWeight: '700', cursor: 'pointer' }}>✓</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ fontSize: '18px', fontWeight: '800' }}>{name}</div>
                <button onClick={() => setEditName(true)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '6px', padding: '3px 8px', color: 'white', fontSize: '11px', cursor: 'pointer' }}>✏️ Edit</button>
              </div>
            )}
            <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '4px' }}>{user?.email}</div>
            <div style={{ display: 'inline-block', background: isPremium ? '#f59e0b' : 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '3px 10px', fontSize: '11px', fontWeight: '700', marginTop: '6px' }}>
              {isPremium ? '👑 Premium' : '🆓 Free Plan'}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', marginTop: '16px' }}>
          {[
            { label: 'Quizzes', value: stats.quizzes },
            { label: 'Accuracy', value: stats.accuracy },
            { label: 'Streak', value: `${stats.streak}🔥` },
            { label: 'Badges', value: stats.badges },
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '10px', padding: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: '800' }}>{s.value}</div>
              <div style={{ fontSize: '10px', opacity: 0.8 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: 'white', borderBottom: '1px solid #e2e8f0', overflowX: 'auto' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            flex: 1, padding: '12px 8px', border: 'none', background: 'none',
            fontSize: '12px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap',
            color: activeTab === t.id ? '#6366f1' : '#94a3b8',
            borderBottom: activeTab === t.id ? '2px solid #6366f1' : '2px solid transparent',
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: '16px', maxWidth: '640px', margin: '0 auto' }}>

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div>
            {/* Exam Target */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '16px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', marginBottom: '12px' }}>🎯 Exam Target</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {EXAMS.map(e => (
                  <button key={e} onClick={() => saveExamTarget(e)} style={{
                    padding: '10px', borderRadius: '10px', border: '2px solid',
                    borderColor: examTarget === e ? '#6366f1' : '#e2e8f0',
                    background: examTarget === e ? '#ede9fe' : 'white',
                    color: examTarget === e ? '#6366f1' : '#64748b',
                    fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                  }}>{e}</button>
                ))}
              </div>
            </div>

            {/* Weakness Analytics */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', marginBottom: '12px' }}>📊 Weakness Analytics</div>
              {[
                { subject: 'Modern History', pct: 45, color: '#ef4444', label: 'Needs Work' },
                { subject: 'Geography – Maps', pct: 58, color: '#f59e0b', label: 'Average' },
                { subject: 'Economics Basics', pct: 63, color: '#f59e0b', label: 'Average' },
                { subject: 'Science & Tech', pct: 81, color: '#10b981', label: 'Good' },
              ].map((w, i) => (
                <div key={i} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{w.subject}</span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: w.color, background: `${w.color}15`, padding: '2px 8px', borderRadius: '6px' }}>{w.label}</span>
                  </div>
                  <div style={{ background: '#f1f5f9', borderRadius: '10px', height: '6px' }}>
                    <div style={{ width: `${w.pct}%`, background: w.color, height: '100%', borderRadius: '10px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NOTES TAB */}
        {activeTab === 'notes' && (
          <div>
            <div style={{ background: 'white', borderRadius: '16px', padding: '16px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', marginBottom: '12px' }}>📝 Personal Notes</div>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Note lakhoo..."
                rows={3}
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', resize: 'none', outline: 'none', fontFamily: 'Inter, system-ui', boxSizing: 'border-box' }}
              />
              <button onClick={saveNote} style={{ marginTop: '8px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', width: '100%' }}>
                Save Note
              </button>
            </div>
            {notes.length === 0 && (
              <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '20px' }}>Koi note nathi — upar thi add karo!</div>
            )}
            {notes.map(n => (
              <div key={n.id} style={{ background: 'white', borderRadius: '14px', padding: '14px', marginBottom: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', color: '#1e293b', lineHeight: 1.5 }}>{n.text}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>{n.date}</div>
                </div>
                <button onClick={() => deleteNote(n.id)} style={{ background: '#fee2e2', border: 'none', borderRadius: '8px', padding: '6px 10px', color: '#ef4444', cursor: 'pointer', fontSize: '14px', flexShrink: 0 }}>🗑️</button>
              </div>
            ))}
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div>
            <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              {[
                {
                  icon: '🌙', label: 'Dark Mode', sub: 'Theme toggle',
                  right: (
                    <button onClick={() => setDark(!dark)} style={{
                      width: '44px', height: '24px', borderRadius: '12px', border: 'none',
                      background: dark ? '#6366f1' : '#e2e8f0', cursor: 'pointer', position: 'relative', transition: 'background 0.2s'
                    }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: dark ? '23px' : '3px', transition: 'left 0.2s' }} />
                    </button>
                  )
                },
                { icon: '🔔', label: 'Notifications', sub: 'Exam reminders', right: <span style={{ color: '#94a3b8', fontSize: '18px' }}>›</span> },
                { icon: '🔒', label: 'Change Password', sub: 'Security settings', right: <span style={{ color: '#94a3b8', fontSize: '18px' }}>›</span> },
                { icon: '📱', label: 'App Version', sub: 'v1.0.0', right: <span style={{ color: '#94a3b8', fontSize: '12px' }}>Latest</span> },
              ].map((item, i, arr) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <div style={{ width: '38px', height: '38px', background: '#f0f4ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{item.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{item.label}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{item.sub}</div>
                  </div>
                  {item.right}
                </div>
              ))}
            </div>

            <button onClick={handleLogout} style={{
              marginTop: '16px', width: '100%', background: '#fee2e2', color: '#ef4444',
              border: 'none', borderRadius: '14px', padding: '14px', fontSize: '14px',
              fontWeight: '800', cursor: 'pointer'
            }}>🚪 Logout</button>
          </div>
        )}

        {/* PREMIUM TAB */}
        {activeTab === 'premium' && (
          <div>
            {/* Current Plan */}
            <div style={{ background: isPremium ? 'linear-gradient(135deg,#f59e0b,#ef4444)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: '20px', padding: '20px', color: 'white', marginBottom: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>{isPremium ? '👑' : '🆓'}</div>
              <div style={{ fontSize: '18px', fontWeight: '800' }}>{isPremium ? 'Premium Plan' : 'Free Plan'}</div>
              <div style={{ fontSize: '13px', opacity: 0.85, marginTop: '4px' }}>{isPremium ? 'Badhi features unlock che!' : 'Upgrade karo — badhu unlock karo!'}</div>
            </div>

            {/* Plans */}
            {[
              {
                name: 'Free', price: '₹0', period: 'forever', color: '#64748b',
                features: ['5 quizzes per day', '10 flashcards', 'Basic doubt solver', 'Current affairs (limited)'],
                current: !isPremium
              },
              {
                name: 'Premium', price: '₹199', period: '/month', color: '#6366f1',
                features: ['Unlimited quizzes', 'All flashcards', 'AI doubt solver (unlimited)', 'Full current affairs', 'Mock tests (all patterns)', 'Leaderboard + Badges', 'PDF Marketplace access', 'Priority support'],
                current: isPremium
              },
            ].map((plan, i) => (
              <div key={i} style={{
                background: 'white', borderRadius: '16px', padding: '16px', marginBottom: '12px',
                border: `2px solid ${plan.current ? plan.color : '#e2e8f0'}`,
                boxShadow: plan.current ? `0 4px 16px ${plan.color}25` : '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>{plan.name}</div>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: plan.color }}>{plan.price}<span style={{ fontSize: '12px', fontWeight: '400', color: '#94a3b8' }}>{plan.period}</span></div>
                  </div>
                  {plan.current && <div style={{ background: `${plan.color}15`, color: plan.color, fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '10px' }}>Current</div>}
                </div>
                {plan.features.map((f, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', fontSize: '13px', color: '#64748b' }}>
                    <span style={{ color: plan.color }}>✓</span> {f}
                  </div>
                ))}
                {!plan.current && (
                  <button onClick={() => setIsPremium(true)} style={{
                    marginTop: '14px', width: '100%', background: `linear-gradient(135deg, ${plan.color}, #8b5cf6)`,
                    color: 'white', border: 'none', borderRadius: '12px', padding: '12px',
                    fontSize: '14px', fontWeight: '800', cursor: 'pointer'
                  }}>🚀 Upgrade to Premium</button>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}