'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';

const COLORS = ['#f59e0b','#6366f1','#10b981','#ec4899','#3b82f6','#f97316','#8b5cf6','#14b8a6'];

export default function DashboardPage() {
  const router = useRouter();
  const { dark } = useTheme();
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
  const [exams, setExams] = useState([]);
  const [showAddExam, setShowAddExam] = useState(false);
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');

  // Dark mode colors
  const bg = dark ? '#0f0f13' : '#f0f4ff';
  const cardBg = dark ? '#1a1a24' : 'white';
  const textPrimary = dark ? '#f1f5f9' : '#1e293b';
  const textSecondary = dark ? '#94a3b8' : '#64748b';
  const borderColor = dark ? '#2d3748' : '#f1f5f9';
  const inputBg = dark ? '#0f172a' : 'white';

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setTimeOfDay('Morning');
    else if (h < 17) setTimeOfDay('Afternoon');
    else setTimeOfDay('Evening');
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });
    const saved = localStorage.getItem('eb_exams');
    if (saved) {
      setExams(JSON.parse(saved));
    } else {
      const defaults = [
        { id: 1, name: 'GSSSB Junior Clerk 2026', date: '2026-07-12' },
        { id: 2, name: 'IBPS PO 2026', date: '2026-08-10' },
      ];
      setExams(defaults);
      localStorage.setItem('eb_exams', JSON.stringify(defaults));
    }

    // Load stats from supabase
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data?.user) return;
      const { data: history } = await supabase
        .from('quiz_history')
        .select('score, total, created_at')
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false });
      if (history && history.length > 0) {
        const total = history.length;
        const avgAcc = Math.round(history.reduce((a, h) => a + (h.score / h.total) * 100, 0) / total);
        const dates = [...new Set(history.map(h => new Date(h.created_at).toDateString()))];
        let streak = 0;
        const today2 = new Date();
        for (let i = 0; i < dates.length; i++) {
          const d = new Date(today2); d.setDate(today2.getDate() - i);
          if (dates.includes(d.toDateString())) streak++; else break;
        }
        setStats({ quizzes: total, accuracy: avgAcc, streak, rank: '-' });
      }
    });
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

  const greetingEmoji = timeOfDay === 'Morning' ? '\u{1F31E}' : timeOfDay === 'Afternoon' ? '\u{1F31D}' : '\u{1F319}';
  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{ minHeight: '100vh', background: bg, fontFamily: 'Inter, system-ui', paddingBottom: '90px', transition: 'background 0.3s' }}>
      
      {/* Header */}
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

        {/* Quick Actions */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: textSecondary, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {'\u{26A1}'} Quick Actions
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {quickActions.map((a, i) => (
              <button key={i} onClick={() => router.push(a.href)} style={{ background: cardBg, border: 'none', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', boxShadow: dark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'left' }}>
                <div style={{ width: '44px', height: '44px', background: a.color + '20', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>{a.icon}</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: textPrimary }}>{a.label}</div>
                  <div style={{ fontSize: '11px', color: textSecondary, marginTop: '2px' }}>{a.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Today's Targets */}
        <div style={{ background: cardBg, borderRadius: '20px', padding: '16px', marginBottom: '16px', boxShadow: dark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: textPrimary }}>{'\u{1F3AF}'} Today&apos;s Targets</div>
              <div style={{ fontSize: '12px', color: textSecondary, marginTop: '2px' }}>{doneCnt}/{targets.length} done {'\u{1F4A7}'} {pct}% complete</div>
            </div>
            <button onClick={() => setShowAddTarget(!showAddTarget)} style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: '10px', padding: '6px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>+ Add</button>
          </div>
          <div style={{ background: dark ? '#2d3748' : '#f1f5f9', borderRadius: '10px', height: '6px', marginBottom: '12px' }}>
            <div style={{ width: pct + '%', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', height: '100%', borderRadius: '10px', transition: 'width 0.3s' }} />
          </div>
          {showAddTarget && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input value={newTarget} onChange={e => setNewTarget(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTarget()} placeholder="Navo target type karo..." style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', border: `1.5px solid ${borderColor}`, fontSize: '13px', outline: 'none', background: inputBg, color: textPrimary }} />
              <button onClick={addTarget} style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: '10px', padding: '8px 14px', fontWeight: '700', cursor: 'pointer' }}>{'\u{2713}'}</button>
            </div>
          )}
          {targets.map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: `1px solid ${borderColor}` }}>
              <button onClick={() => toggleTarget(t.id)} style={{ width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0, border: t.done ? 'none' : `2px solid ${dark ? '#4a5568' : '#cbd5e1'}`, background: t.done ? '#6366f1' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px' }}>{t.done ? '\u{2713}' : ''}</button>
              <span style={{ flex: 1, fontSize: '13px', color: t.done ? textSecondary : textPrimary, textDecoration: t.done ? 'line-through' : 'none' }}>{t.text}</span>
              <button onClick={() => removeTarget(t.id)} style={{ background: 'none', border: 'none', color: dark ? '#4a5568' : '#cbd5e1', cursor: 'pointer', fontSize: '16px', padding: '0' }}>x</button>
            </div>
          ))}
        </div>

        {/* Exam Countdown */}
        <div style={{ background: cardBg, borderRadius: '20px', padding: '16px', marginBottom: '16px', boxShadow: dark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '15px', fontWeight: '800', color: textPrimary }}>📅 Exam Countdown</div>
            <button onClick={() => setShowAddExam(!showAddExam)} style={{ background: dark ? '#1e2d4a' : '#f0f4ff', color: '#6366f1', border: 'none', borderRadius: '8px', padding: '5px 10px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>+ Add Exam</button>
          </div>

          {showAddExam && (
            <div style={{ background: dark ? '#0f172a' : '#f8fafc', borderRadius: '12px', padding: '12px', marginBottom: '12px', border: `1.5px solid ${borderColor}` }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: textSecondary, marginBottom: '8px' }}>📝 Navo Exam Umero</div>
              <input value={examName} onChange={e => setExamName(e.target.value)} placeholder="Exam name (e.g. GPSC Class 1-2)"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1.5px solid ${borderColor}`, fontSize: '13px', outline: 'none', marginBottom: '8px', boxSizing: 'border-box', color: textPrimary, background: inputBg }} />
              <div style={{ fontSize: '12px', color: textSecondary, marginBottom: '4px' }}>📅 Exam date select karo:</div>
              <input type="date" value={examDate} min={today} onChange={e => setExamDate(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1.5px solid ${borderColor}`, fontSize: '13px', outline: 'none', marginBottom: '10px', boxSizing: 'border-box', cursor: 'pointer', color: textPrimary, background: inputBg }} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={addExam} disabled={!examName.trim() || !examDate} style={{ flex: 1, background: examName.trim() && examDate ? '#6366f1' : '#4a5568', color: 'white', border: 'none', borderRadius: '8px', padding: '8px', fontSize: '13px', fontWeight: '700', cursor: examName.trim() && examDate ? 'pointer' : 'not-allowed' }}>
                  ✅ Save Exam
                </button>
                <button onClick={() => { setShowAddExam(false); setExamName(''); setExamDate(''); }} style={{ background: dark ? '#1e293b' : '#f1f5f9', color: textSecondary, border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {exams.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px 0', color: textSecondary, fontSize: '13px' }}>
              Koi exam nathi. &quot;+ Add Exam&quot; thi umero!
            </div>
          )}

          {exams.map((exam, i) => {
            const days = Math.max(0, Math.ceil((new Date(exam.date) - new Date()) / (1000 * 60 * 60 * 24)));
            const color = COLORS[i % COLORS.length];
            const urgency = days <= 7 ? '#ef4444' : days <= 30 ? '#f59e0b' : color;
            return (
              <div key={exam.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < exams.length - 1 ? `1px solid ${borderColor}` : 'none' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: textPrimary }}>{exam.name}</div>
                  <div style={{ fontSize: '11px', color: textSecondary, marginTop: '2px' }}>
                    {new Date(exam.date).toLocaleDateString('gu-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {days <= 7 && days > 0 && <span style={{ color: '#ef4444', fontWeight: '700', marginLeft: '6px' }}>⚠️ Jaldi!</span>}
                    {days === 0 && <span style={{ color: '#ef4444', fontWeight: '700', marginLeft: '6px' }}>🔴 Aaj!</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ background: urgency + '20', color: urgency, borderRadius: '10px', padding: '6px 12px', textAlign: 'center', minWidth: '56px' }}>
                    <div style={{ fontSize: '18px', fontWeight: '800' }}>{days}</div>
                    <div style={{ fontSize: '10px', fontWeight: '600' }}>DAYS</div>
                  </div>
                  <button onClick={() => removeExam(exam.id)} style={{ background: 'none', border: 'none', color: dark ? '#4a5568' : '#cbd5e1', cursor: 'pointer', fontSize: '16px', padding: '4px' }}>×</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}