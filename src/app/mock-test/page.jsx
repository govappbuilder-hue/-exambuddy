'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

const EXAMS = [
  {
    id: 'gpsc',
    name: 'GPSC Class 1-2',
    icon: '👑',
    color: '#6366f1',
    totalMarks: 200,
    timeMin: 120,
    subjects: [
      { key: 'history', label: 'ઇતિહાસ', count: 30 },
      { key: 'geography', label: 'ભૂગોળ', count: 30 },
      { key: 'constitution', label: 'બંધારણ', count: 40 },
      { key: 'economics', label: 'અર્થશાસ્ત્ર', count: 30 },
      { key: 'science', label: 'વિજ્ઞાન', count: 30 },
      { key: 'current_affairs', label: 'Current Affairs', count: 40 },
    ]
  },
  {
    id: 'gsssb',
    name: 'GSSSB / Bin Sachivalay',
    icon: '📝',
    color: '#8b5cf6',
    totalMarks: 200,
    timeMin: 120,
    subjects: [
      { key: 'maths', label: 'ગણિત', count: 50 },
      { key: 'reasoning', label: 'રીઝનિંગ', count: 40 },
      { key: 'gujarati_sahitya', label: 'ગુજ. સાહિત્ય', count: 30 },
      { key: 'gujarati_vyakran', label: 'ગુજ. વ્યાકરણ', count: 30 },
      { key: 'english', label: 'English', count: 25 },
      { key: 'computer', label: 'Computer', count: 25 },
    ]
  },
  {
    id: 'police',
    name: 'Police Constable / PSI',
    icon: '👮',
    color: '#10b981',
    totalMarks: 100,
    timeMin: 60,
    subjects: [
      { key: 'gk', label: 'સામાન્ય જ્ઞાન', count: 25 },
      { key: 'law', label: 'કાયદો', count: 25 },
      { key: 'science', label: 'વિજ્ઞાન', count: 20 },
      { key: 'maths', label: 'ગણિત', count: 15 },
      { key: 'reasoning', label: 'રીઝનિંગ', count: 15 },
    ]
  },
  {
    id: 'revenue',
    name: 'Revenue Talati / Mantri',
    icon: '🏢',
    color: '#f59e0b',
    totalMarks: 100,
    timeMin: 60,
    subjects: [
      { key: 'maths', label: 'ગણિત', count: 30 },
      { key: 'reasoning', label: 'રીઝનિંગ', count: 25 },
      { key: 'gujarati_vyakran', label: 'ગુજ. વ્યાકરણ', count: 25 },
      { key: 'gk', label: 'સામાન્ય જ્ઞાન', count: 20 },
    ]
  },
];

export default function MockTestPage() {
  const router = useRouter();
  const [screen, setScreen] = useState('select'); // select | loading | quiz | result
  const [selectedExam, setSelectedExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loadMsg, setLoadMsg] = useState('');

  const submitTest = useCallback(() => setScreen('result'), []);

  useEffect(() => {
    if (screen !== 'quiz') return;
    const t = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) { clearInterval(t); submitTest(); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [screen, submitTest]);

  const startExam = async (exam) => {
    setSelectedExam(exam);
    setScreen('loading');
    setLoadMsg('Questions fetch karya che...');

    const allQ = [];
    for (const sub of exam.subjects) {
      setLoadMsg(`${sub.label} na questions laavi rahya che...`);
      const { data } = await supabase
        .from('questions')
        .select('*')
        .eq('subject', sub.key)
        .limit(sub.count * 3);

      if (data?.length) {
        // Shuffle
        const arr = [...data];
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        const picked = arr.slice(0, Math.min(sub.count, arr.length));
        picked.forEach(q => allQ.push({ ...q, _subject: sub.label }));
      }
    }

    if (!allQ.length) {
      alert('Questions nathi! Pehla Admin thi questions add karo.');
      setScreen('select');
      return;
    }

    // Final shuffle
    for (let i = allQ.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allQ[i], allQ[j]] = [allQ[j], allQ[i]];
    }

    setQuestions(allQ);
    setTimeLeft(exam.timeMin * 60);
    setCurrent(0);
    setSelected({});
    setScreen('quiz');
  };

  const score = questions.reduce((acc, q, i) =>
    selected[i] === q.correct_answer ? acc + 1 : acc, 0);
  const percent = questions.length ? Math.round((score / questions.length) * 100) : 0;
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');
  const timerRed = timeLeft < 120;

  /* ── SELECT SCREEN ── */
  if (screen === 'select') return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: 'system-ui', color: 'white', padding: '20px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <button onClick={() => router.push('/')}
            style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '8px 14px', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}>
            ← Home
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '900' }}>🏆 Mock Test</h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Real exam pattern sathe practice karo</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {EXAMS.map(exam => (
            <button key={exam.id} onClick={() => startExam(exam)}
              style={{ background: '#1e293b', border: `2px solid ${exam.color}30`, borderRadius: '18px', padding: '20px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = exam.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = exam.color + '30'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                <div style={{ fontSize: '36px' }}>{exam.icon}</div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: 'white' }}>{exam.name}</div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                    {exam.totalMarks} marks • {exam.timeMin} minutes
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', background: exam.color + '20', color: exam.color, padding: '8px 16px', borderRadius: '10px', fontWeight: '800', fontSize: '13px' }}>
                  Start →
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {exam.subjects.map(s => (
                  <span key={s.key} style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                    {s.label} ({s.count})
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  /* ── LOADING SCREEN ── */
  if (screen === 'loading') return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <div style={{ fontSize: '56px', marginBottom: '20px' }}>⏳</div>
        <h2 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '10px' }}>
          {selectedExam?.name}
        </h2>
        <p style={{ color: '#64748b', fontSize: '14px' }}>{loadMsg}</p>
        <div style={{ width: '200px', height: '4px', background: '#334155', borderRadius: '2px', margin: '20px auto 0' }}>
          <div style={{ height: '100%', background: selectedExam?.color, borderRadius: '2px', animation: 'pulse 1s ease-in-out infinite', width: '60%' }} />
        </div>
      </div>
    </div>
  );

  /* ── QUIZ SCREEN ── */
  const q = questions[current];
  if (screen === 'quiz' && q) {
    const answered = selected[current];
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: 'system-ui', color: 'white' }}>

        {/* Top Bar */}
        <div style={{ background: '#1e293b', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid #334155' }}>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '700' }}>
            {selectedExam?.icon} {selectedExam?.name}
          </div>
          <div style={{ background: timerRed ? '#ef444420' : '#1e293b', border: `2px solid ${timerRed ? '#ef4444' : '#334155'}`, borderRadius: '10px', padding: '5px 12px', color: timerRed ? '#ef4444' : '#10b981', fontWeight: '900', fontSize: '16px', fontVariantNumeric: 'tabular-nums' }}>
            ⏱ {mm}:{ss}
          </div>
          <button onClick={submitTest}
            style={{ background: '#ef444420', border: '1px solid #ef4444', borderRadius: '8px', padding: '6px 12px', color: '#ef4444', fontSize: '12px', cursor: 'pointer', fontWeight: '700' }}>
            Submit
          </button>
        </div>

        {/* Progress */}
        <div style={{ background: '#1e293b', padding: '8px 16px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', borderBottom: '1px solid #334155' }}>
          <span>{current + 1} / {questions.length} • {q._subject}</span>
          <span style={{ color: '#10b981', fontWeight: '700' }}>Score: {score}</span>
        </div>
        <div style={{ height: '3px', background: '#334155' }}>
          <div style={{ height: '100%', background: selectedExam?.color || '#667eea', width: `${((current + 1) / questions.length) * 100}%`, transition: 'width 0.3s' }} />
        </div>

        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '16px' }}>

          {/* Question */}
          <div style={{ background: '#1e293b', borderRadius: '14px', padding: '20px', marginBottom: '14px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '11px', color: '#818cf8', fontWeight: '700', letterSpacing: '1px', marginBottom: '10px' }}>
              {q._subject?.toUpperCase()} • Q{current + 1}
            </div>
            <p style={{ fontSize: '16px', fontWeight: '600', margin: 0, lineHeight: 1.7 }}>{q.question}</p>
          </div>

          {/* Options */}
          {['A','B','C','D'].map(opt => {
            const val = q[`option_${opt.toLowerCase()}`];
            const isSelected = answered === opt;
            const isCorrect = opt === q.correct_answer;
            const showRes = !!answered;
            let bg = '#1e293b', border = '#334155', icon = null;
            if (showRes) {
              if (isCorrect) { bg = '#064e3b'; border = '#10b981'; icon = '✅'; }
              else if (isSelected) { bg = '#450a0a'; border = '#ef4444'; icon = '❌'; }
            } else if (isSelected) { bg = '#1e3a5f'; border = '#3b82f6'; }
            return (
              <button key={opt}
                onClick={() => { if (!answered) setSelected(p => ({ ...p, [current]: opt })); }}
                style={{ width: '100%', marginBottom: '10px', padding: '13px 16px', borderRadius: '12px', border: `2px solid ${border}`, background: bg, cursor: answered ? 'default' : 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.15s' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: showRes && isCorrect ? '#10b981' : showRes && isSelected ? '#ef4444' : '#334155', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '13px', flexShrink: 0 }}>
                  {opt}
                </div>
                <span style={{ fontSize: '14px', color: '#e2e8f0', flex: 1 }}>{val}</span>
                {icon && <span>{icon}</span>}
              </button>
            );
          })}

          {/* Solution */}
          {answered && q.explanation && (
            <div style={{ background: '#1c1a00', border: '2px solid #ca8a04', borderRadius: '12px', padding: '12px', marginBottom: '12px' }}>
              <div style={{ color: '#fbbf24', fontWeight: '800', fontSize: '12px', marginBottom: '4px' }}>💡 સ્પષ્ટીકરણ:</div>
              <div style={{ color: '#fef3c7', fontSize: '13px', lineHeight: 1.6 }}>{q.explanation}</div>
            </div>
          )}
          {answered && !q.explanation && (
            <div style={{ background: '#064e3b', border: '2px solid #10b981', borderRadius: '10px', padding: '10px', marginBottom: '10px', color: '#6ee7b7', fontSize: '13px', fontWeight: '700' }}>
              ✅ સાચો: {q.correct_answer} — {q[`option_${q.correct_answer?.toLowerCase()}`]}
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setCurrent(p => Math.max(0, p - 1))} disabled={current === 0}
              style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid #334155', background: current === 0 ? '#0f172a' : '#1e293b', color: current === 0 ? '#475569' : '#e2e8f0', fontWeight: '700', cursor: current === 0 ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
              ← પાછળ
            </button>
            {current < questions.length - 1 ? (
              <button onClick={() => setCurrent(p => p + 1)}
                style={{ flex: 2, padding: '12px', borderRadius: '12px', border: 'none', background: `linear-gradient(135deg, ${selectedExam?.color}, ${selectedExam?.color}bb)`, color: 'white', fontWeight: '800', cursor: 'pointer', fontSize: '14px' }}>
                આગળ →
              </button>
            ) : (
              <button onClick={submitTest}
                style={{ flex: 2, padding: '12px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', fontWeight: '800', cursor: 'pointer', fontSize: '14px' }}>
                ✅ સબમિટ
              </button>
            )}
          </div>

          <button onClick={submitTest}
            style={{ width: '100%', marginTop: '10px', padding: '10px', background: 'transparent', border: '1px solid #334155', borderRadius: '10px', color: '#64748b', fontSize: '12px', cursor: 'pointer' }}>
            🏁 હવે Submit ({Object.keys(selected).length}/{questions.length})
          </button>
        </div>
      </div>
    );
  }

  /* ── RESULT SCREEN ── */
  if (screen === 'result') {
    const wrong = questions.length - score;
    const unanswered = questions.length - Object.keys(selected).length;

    // Subject wise breakdown
    const subjectStats = {};
    questions.forEach((q, i) => {
      const sub = q._subject || 'Other';
      if (!subjectStats[sub]) subjectStats[sub] = { total: 0, correct: 0 };
      subjectStats[sub].total++;
      if (selected[i] === q.correct_answer) subjectStats[sub].correct++;
    });

    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: 'system-ui', color: 'white', padding: '20px' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>

          {/* Main Score */}
          <div style={{ background: '#1e293b', borderRadius: '24px', padding: '32px', textAlign: 'center', marginBottom: '16px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '56px', marginBottom: '10px' }}>
              {percent >= 80 ? '🏆' : percent >= 60 ? '🎯' : percent >= 40 ? '📚' : '💪'}
            </div>
            <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '700', marginBottom: '4px' }}>
              {selectedExam?.icon} {selectedExam?.name}
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'white', margin: '0 0 16px' }}>
              {percent >= 80 ? 'Excellent!' : percent >= 60 ? 'Good Job!' : percent >= 40 ? 'Average' : 'Keep Practicing!'}
            </h2>
            <div style={{ fontSize: '48px', fontWeight: '900', color: percent >= 60 ? '#10b981' : '#ef4444', marginBottom: '6px' }}>
              {score}/{questions.length}
            </div>
            <div style={{ fontSize: '20px', color: '#64748b', marginBottom: '20px' }}>{percent}%</div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '20px' }}>
              {[
                { val: score, label: '✅ સાચા', bg: '#064e3b', color: '#34d399' },
                { val: wrong, label: '❌ ખોટા', bg: '#450a0a', color: '#f87171' },
                { val: unanswered, label: '⏭ છોડ્યા', bg: '#1c1a00', color: '#fbbf24' },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, borderRadius: '12px', padding: '12px', border: `1px solid ${s.color}30` }}>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: '11px', color: s.color, fontWeight: '600' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <button onClick={() => startExam(selectedExam)}
              style={{ width: '100%', padding: '14px', background: `linear-gradient(135deg, ${selectedExam?.color}, ${selectedExam?.color}bb)`, color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', marginBottom: '10px' }}>
              🔄 ફરીથી આપો
            </button>
            <button onClick={() => setScreen('select')}
              style={{ width: '100%', padding: '12px', background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#94a3b8', fontSize: '14px', cursor: 'pointer' }}>
              ← Exam Select
            </button>
          </div>

          {/* Subject Breakdown */}
          <div style={{ background: '#1e293b', borderRadius: '20px', padding: '20px', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: '800' }}>📊 Subject Wise Performance</h3>
            {Object.entries(subjectStats).map(([sub, stat]) => {
              const pct = Math.round((stat.correct / stat.total) * 100);
              return (
                <div key={sub} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>
                    <span style={{ color: '#e2e8f0' }}>{sub}</span>
                    <span style={{ color: pct >= 60 ? '#10b981' : '#ef4444' }}>
                      {stat.correct}/{stat.total} ({pct}%)
                    </span>
                  </div>
                  <div style={{ height: '6px', background: '#334155', borderRadius: '3px' }}>
                    <div style={{ height: '100%', background: pct >= 60 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444', borderRadius: '3px', width: `${pct}%`, transition: 'width 0.5s' }} />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    );
  }

  return null;
}