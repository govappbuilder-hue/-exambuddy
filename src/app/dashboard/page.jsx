'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

const COLORS = ['#f59e0b','#6366f1','#10b981','#ec4899','#3b82f6','#f97316','#8b5cf6','#14b8a6'];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [timeOfDay, setTimeOfDay] = useState('Morning');
  const [targets, setTargets] = useState([
    { id: 1, text: 'Complete History Quiz - Ch. 5', done: false },
    { id: 2, text: 'Read Current Affairs', done: false },
    { id: 3, text: 'Revise 20 Polity Flashcards', done: false },
    { id: 4, text: 'Practice Negative Marking Set', done: false },
  ]);
  const [newTarget, setNewTarget] = useState('');
  const [showAddTarget, setShowAddTarget] = useState(false);
  const [stats, setStats] = useState({ quizzes: 0, accuracy: 0, streak: 0, rank: '-' });

  // Exam Countdown state
  const [exams, setExams] = useState([]);
  const [showAddExam, setShowAddExam] = useState(false);
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setTimeOfDay('Morning');
    else if (h < 17) setTimeOfDay('Afternoon');
    else setTimeOfDay('Evening');
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });
    // Load exams from localStorage
    const saved = localStorage.getItem('eb_exams');
    if (saved) {
      setExams(JSON.parse(saved));
    } else {
      // Default exams
      const defaults = [
        { id: 1, name: 'GSSSB Junior Clerk 2026', date: '2026-07-12' },
        { id: 2, name: 'IBPS PO 2026', date: '2026-08-10' },
      ];
      setExams(defaults);
      localStorage.setItem('eb_exams', JSON.stringify(defaults));
    }
  }, []);

  const addExam = () => {
    if (!examName.trim() || !examDate) return;
    const newExam = { id: Date.now(), name: examName.trim(), date: examDate };
    const updated = [...exams, newExam];
    setExams(updated);
    localStorage.setItem('eb_exams', JSON.stringify(updated));
    setExamName(''); setExamDate(''); setShowAddExam(false);
  };

  const removeExam = (id) => {
    const updated = exams.filter(e => e.id !== id);
    setExams(updated);
    localStorage.setItem('eb_exams', JSON.stringify(updated));
  };

  const toggleTarget = (id) => setTargets(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const addTarget = () => {
    if (!newTarget.trim()) return;
    setTargets(prev => [...prev, { id: Date.now(), text: newTarget, done: false }]);
    setNewTarget(''); setShowAddTarget(false);
  };
  const removeTarget = (id) => setTargets(prev => prev.filter(t => t.id !== id));
  const doneCnt = targets.filter(t => t.done).length;
  const pct = targets.length ? Math.round((doneCnt / targets.length) * 100) : 0;

  const quickActions = [
    { icon: '\u{1F9E0}', label: 'Generate Quiz', sub: 'AI-powered MCQs', color: '#6366f1', href: '/quiz' },
    { icon: '\u{1F916}', label: 'AI Doubt', sub: 'Instant answers', color: '#8b5cf6', href: '/doubt-solver' },
    { icon: '\u{1F4DA}', label: 'Flashcards', sub: 'Study & Review', color: '#14b8a6', href: '/flashcards' },
    { icon: '\u{1F4F0}', label: "Today's News", sub: 'Current Affairs', color: '#f59e0b', href: '/current-affairs' },
    { icon: '\u{1F4F7}', label: 'AI Quiz', sub: 'Photo/PDF thi', color: '#ec4899', href: '/ai-quiz' },
    { icon: '\u{1F3C6}', label: 'Badges', sub: 'Tara achievements', color: '#f97316', href: '/badges' },
    { icon: '\u{1F3C5}', label: 'Leaderboard', sub: 'Top rankers', color: '#10b981', href: '/leaderboard' },
    { icon: '\u{1F516}', label: 'Bookmarks', sub: 'Saved questions', color: '#3b82f6', href: '/bookmarks' },
  ];

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'Student';
  const greetingEmoji = timeOfDay === 'Morning' ? '\u{1F31E}' : timeOfDay === 'Afternoon' ? '\u{1F31D}' : '\u{1F319}';
  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', fontFamily: 'Inter, system-ui', paddingBottom: '90px' }}>
      <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%)', padding: '20px 16px 24px', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '13px', opacity: 0.85, marginBottom: '4px' }}>Good {timeOfDay} {greetingEmoji}</div>
            <div style={{ fontSize: '22px', fontWeight: '800', lineHeight: 1.2 }}>Ready to crack<br />today&apos;s exam? {'\u{1F4AA}'}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '8px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '800' }}>{'\u{1F525}'} {stats.streak}</div>
            <div style={{ fontSize: '10px', opacity: 0.8 }}>DAY STREAK</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          {[
            { label: 'Quizzes Done', value: stats.quizzes, icon: '\u{1F4DD}' },
            { label: 'Accuracy', value: stats.accuracy + '%', icon: '\u{1F3AF}' },
            { label: 'Your Rank', value: stats.rank, icon: '\u{1F3C6}' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '12px', padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: '16px' }}>{s.icon}</div>
              <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '2px' }}>{s.value}</div>
              <div style={{ fontSize: '10px', opacity: 0.8 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px', maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {'\u{26A1}'} Quick Actions
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {quickActions.map((a, i) => (
              <button key={i} onClick={() => router.push(a.href)} style={{ background: 'white', border: 'none', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'left' }}>
                <div style={{ width: '44px', height: '44px', background: a.color + '15', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>{a.icon}</div>
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
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b' }}>{'\u{1F3AF}'} Today&apos;s Targets</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{doneCnt}/{targets.length} done {'\u{1F4A7}'} {pct}% complete</div>
            </div>
            <button onClick={() => setShowAddTarget(!showAddTarget)} style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: '10px', padding: '6px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>+ Add</button>
          </div>
          <div style={{ background: '#f1f5f9', borderRadius: '10px', height: '6px', marginBottom: '12px' }}>
            <div style={{ width: pct + '%', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', height: '100%', borderRadius: '10px', transition: 'width 0.3s' }} />
          </div>
          {showAddTarget && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input value={newTarget} onChange={e => setNewTarget(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTarget()} placeholder="Navo target type karo..." style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', outline: 'none' }} />
              <button onClick={addTarget} style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: '10px', padding: '8px 14px', fontWeight: '700', cursor: 'pointer' }}>{'\u{2713}'}</button>
            </div>
          )}
          {targets.map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
              <button onClick={() => toggleTarget(t.id)} style={{ width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0, border: t.done ? 'none' : '2px solid #cbd5e1', background: t.done ? '#6366f1' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px' }}>{t.done ? '\u{2713}' : ''}</button>
              <span style={{ flex: 1, fontSize: '13px', color: t.done ? '#94a3b8' : '#1e293b', textDecoration: t.done ? 'line-through' : 'none' }}>{t.text}</span>
              <button onClick={() => removeTarget(t.id)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '16px', padding: '0' }}>x</button>
            </div>
          ))}
        </div>

        {/* Exam Countdown */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '16px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b' }}>📅 Exam Countdown</div>
            <button onClick={() => setShowAddExam(!showAddExam)} style={{ background: '#f0f4ff', color: '#6366f1', border: 'none', borderRadius: '8px', padding: '5px 10px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>+ Add Exam</button>
          </div>

          {/* Add Exam Form */}
          {showAddExam && (
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '12px', marginBottom: '12px', border: '1.5px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>📝 Navo Exam Umerо</div>
              <input
                value={examName}
                onChange={e => setExamName(e.target.value)}
                placeholder="Exam name (e.g. GPSC Class 1-2)"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', outline: 'none', marginBottom: '8px', boxSizing: 'border-box', color: '#1e293b', background: 'white' }}
              />
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>📅 Exam date select karo:</div>
              <input
                type="date"
                value={examDate}
                min={today}
                onChange={e => setExamDate(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', outline: 'none', marginBottom: '10px', boxSizing: 'border-box', cursor: 'pointer', color: '#1e293b', background: 'white' }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={addExam} disabled={!examName.trim() || !examDate} style={{ flex: 1, background: examName.trim() && examDate ? '#6366f1' : '#cbd5e1', color: 'white', border: 'none', borderRadius: '8px', padding: '8px', fontSize: '13px', fontWeight: '700', cursor: examName.trim() && examDate ? 'pointer' : 'not-allowed' }}>
                  ✅ Save Exam
                </button>
                <button onClick={() => { setShowAddExam(false); setExamName(''); setExamDate(''); }} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {exams.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8', fontSize: '13px' }}>
              Koi exam nathi. "+ Add Exam" thi umerо!
            </div>
          )}

          {exams.map((exam, i) => {
            const days = Math.max(0, Math.ceil((new Date(exam.date) - new Date()) / (1000 * 60 * 60 * 24)));
            const color = COLORS[i % COLORS.length];
            const urgency = days <= 7 ? '#ef4444' : days <= 30 ? '#f59e0b' : color;
            return (
              <div key={exam.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < exams.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{exam.name}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    {new Date(exam.date).toLocaleDateString('gu-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {days <= 7 && days > 0 && <span style={{ color: '#ef4444', fontWeight: '700', marginLeft: '6px' }}>⚠️ Jaldi!</span>}
                    {days === 0 && <span style={{ color: '#ef4444', fontWeight: '700', marginLeft: '6px' }}>🔴 Aaj!</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ background: urgency + '15', color: urgency, borderRadius: '10px', padding: '6px 12px', textAlign: 'center', minWidth: '56px' }}>
                    <div style={{ fontSize: '18px', fontWeight: '800' }}>{days}</div>
                    <div style={{ fontSize: '10px', fontWeight: '600' }}>DAYS</div>
                  </div>
                  <button onClick={() => removeExam(exam.id)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '16px', padding: '4px' }}>×</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}