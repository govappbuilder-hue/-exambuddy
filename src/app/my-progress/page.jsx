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
  const [stats, setStats] = useState({ quizzes: 0, accuracy: '0%', streak: 0, badges: 0 });
  const [weakSubjects, setWeakSubjects] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);
      setName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student');

      // quiz_history thi real stats fetch karo
      const { data: history } = await supabase
        .from('quiz_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (history && history.length > 0) {
        const total = history.length;
        const avgAcc = Math.round(
          history.reduce((acc, h) => acc + ((h.score / h.total) * 100), 0) / total
        );

        // Streak calculate karo (consecutive days)
        const dates = [...new Set(history.map(h =>
          new Date(h.created_at).toDateString()
        ))];
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < dates.length; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          if (dates.includes(d.toDateString())) streak++;
          else break;
        }

        // Subject-wise weakness
        const subMap = {};
        history.forEach(h => {
          const sub = h.subject_name || 'other';
          if (!subMap[sub]) subMap[sub] = { correct: 0, total: 0 };
          subMap[sub].correct += h.score;
          subMap[sub].total += h.total;
        });
        const subList = Object.entries(subMap).map(([name, v]) => ({
          name,
          pct: Math.round((v.correct / v.total) * 100),
        })).sort((a, b) => a.pct - b.pct).slice(0, 4);

        setStats({ quizzes: total, accuracy: `${avgAcc}%`, streak, badges: streak >= 7 ? 1 : 0 });
        setWeakSubjects(subList);
      }

      const saved = localStorage.getItem('eb_notes');
      if (saved) setNotes(JSON.parse(saved));
      const savedExam = localStorage.getItem('eb_exam_target');
      if (savedExam) setExamTarget(savedExam);
    };
    init();
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
    { id: 'profile', label: 'Profile' },
    { id: 'notes', label: 'Notes' },
    { id: 'settings', label: 'Settings' },
    { id: 'premium', label: 'Premium' },
  ];

  const weakColor = (pct) => pct < 50 ? '#ef4444' : pct < 70 ? '#f59e0b' : '#10b981';
  const weakLabel = (pct) => pct < 50 ? 'Needs Work' : pct < 70 ? 'Average' : 'Good';

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', fontFamily: 'Inter, system-ui', paddingBottom: '90px' }}>
      <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', padding: '24px 16px 20px', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '800', border: '3px solid rgba(255,255,255,0.4)' }}>{avatar}</div>
          <div style={{ flex: 1 }}>
            {editName ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input value={name} onChange={e => setName(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.5)', borderRadius: '8px', padding: '6px 10px', color: 'white', fontSize: '15px', fontWeight: '700', outline: 'none', flex: 1 }} />
                <button onClick={() => setEditName(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', padding: '6px 12px', color: 'white', fontWeight: '700', cursor: 'pointer' }}>OK</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ fontSize: '18px', fontWeight: '800' }}>{name}</div>
                <button onClick={() => setEditName(true)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '6px', padding: '3px 8px', color: 'white', fontSize: '11px', cursor: 'pointer' }}>Edit</button>
              </div>
            )}
            <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '4px' }}>{user?.email}</div>
            <div style={{ display: 'inline-block', background: isPremium ? '#f59e0b' : 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '3px 10px', fontSize: '11px', fontWeight: '700', marginTop: '6px' }}>
              {isPremium ? 'Premium' : 'Free Plan'}
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', marginTop: '16px' }}>
          {[
            { label: 'Quizzes', value: stats.quizzes },
            { label: 'Accuracy', value: stats.accuracy },
            { label: 'Streak', value: `${stats.streak} days` },
            { label: 'Badges', value: stats.badges },
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '10px', padding: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: '800' }}>{s.value}</div>
              <div style={{ fontSize: '10px', opacity: 0.8 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

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

        {activeTab === 'profile' && (
          <div>
            <div style={{ background: 'white', borderRadius: '16px', padding: '16px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', marginBottom: '12px' }}>Exam Target</div>
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

            <div style={{ background: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', marginBottom: '12px' }}>Weakness Analytics</div>
              {weakSubjects.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '20px' }}>
                  Quiz ramva pachhi weakness dikhashe!
                </div>
              ) : weakSubjects.map((w, i) => (
                <div key={i} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{w.name}</span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: weakColor(w.pct), background: `${weakColor(w.pct)}15`, padding: '2px 8px', borderRadius: '6px' }}>{weakLabel(w.pct)} {w.pct}%</span>
                  </div>
                  <div style={{ background: '#f1f5f9', borderRadius: '10px', height: '6px' }}>
                    <div style={{ width: `${w.pct}%`, background: weakColor(w.pct), height: '100%', borderRadius: '10px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div>
            <div style={{ background: 'white', borderRadius: '16px', padding: '16px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', marginBottom: '12px' }}>Personal Notes</div>
              <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Note lakhoo..." rows={3}
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', resize: 'none', outline: 'none', fontFamily: 'Inter, system-ui', boxSizing: 'border-box' }} />
              <button onClick={saveNote} style={{ marginTop: '8px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', width: '100%' }}>
                Save Note
              </button>
            </div>
            {notes.length === 0 && <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '20px' }}>Koi note nathi!</div>}
            {notes.map(n => (
              <div key={n.id} style={{ background: 'white', borderRadius: '14px', padding: '14px', marginBottom: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', color: '#1e293b', lineHeight: 1.5 }}>{n.text}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>{n.date}</div>
                </div>
                <button onClick={() => deleteNote(n.id)} style={{ background: '#fee2e2', border: 'none', borderRadius: '8px', padding: '6px 10px', color: '#ef4444', cursor: 'pointer', fontSize: '14px', flexShrink: 0 }}>X</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              {[
                { label: 'Dark Mode', sub: 'Theme toggle', right: (
                  <button onClick={() => setDark(!dark)} style={{ width: '44px', height: '24px', borderRadius: '12px', border: 'none', background: dark ? '#6366f1' : '#e2e8f0', cursor: 'pointer', position: 'relative' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: dark ? '23px' : '3px' }} />
                  </button>
                )},
                { label: 'Notifications', sub: 'Exam reminders', right: <span style={{ color: '#94a3b8' }}>›</span> },
                { label: 'App Version', sub: 'v1.0.0', right: <span style={{ color: '#94a3b8', fontSize: '12px' }}>Latest</span> },
              ].map((item, i, arr) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{item.label}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{item.sub}</div>
                  </div>
                  {item.right}
                </div>
              ))}
            </div>
            <button onClick={handleLogout} style={{ marginTop: '16px', width: '100%', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '14px', padding: '14px', fontSize: '14px', fontWeight: '800', cursor: 'pointer' }}>
              Logout
            </button>
          </div>
        )}

        {activeTab === 'premium' && (
          <div>
            <div style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: '20px', padding: '20px', color: 'white', marginBottom: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: '800' }}>{isPremium ? 'Premium Plan Active' : 'Upgrade to Premium'}</div>
              <div style={{ fontSize: '13px', opacity: 0.85, marginTop: '4px' }}>Badhi features unlock karo</div>
            </div>
            {[
              { name: 'Free', price: '₹0', period: 'forever', color: '#64748b', features: ['5 quizzes per day', '10 flashcards', 'Basic doubt solver'], current: !isPremium },
              { name: 'Premium', price: '₹199', period: '/month', color: '#6366f1', features: ['Unlimited quizzes', 'All flashcards', 'AI doubt solver', 'Full current affairs', 'Mock tests', 'Leaderboard + Badges', 'PDF Marketplace'], current: isPremium },
            ].map((plan, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '16px', padding: '16px', marginBottom: '12px', border: `2px solid ${plan.current ? plan.color : '#e2e8f0'}` }}>
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
                  <button onClick={() => router.push('/premium')} style={{ marginTop: '14px', width: '100%', background: `linear-gradient(135deg, ${plan.color}, #8b5cf6)`, color: 'white', border: 'none', borderRadius: '12px', padding: '12px', fontSize: '14px', fontWeight: '800', cursor: 'pointer' }}>
                    Upgrade to Premium
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}