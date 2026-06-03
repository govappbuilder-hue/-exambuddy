'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const EXAM_CONFIGS = {
  gpsc: { name: 'GPSC', totalTime: 3600, questions: 10, color: '#2563eb' },
  upsc: { name: 'UPSC', totalTime: 3600, questions: 10, color: '#7c3aed' },
  ssc:  { name: 'SSC',  totalTime: 1800, questions: 10, color: '#16a34a' },
};

export default function MockTestPage() {
  const router = useRouter();
  const [phase, setPhase] = useState('select'); // select | test | result
  const [examType, setExamType] = useState('');
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Timer
  useEffect(() => {
    if (phase !== 'test') return;
    if (timeLeft <= 0) { submitTest(); return; }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, phase]);

  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
      : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  const startTest = async (type) => {
    setLoading(true);
    setExamType(type);
    const config = EXAM_CONFIGS[type];

    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .limit(config.questions);

    if (error || !data.length) {
      alert('Questions load nahi thaya!');
      setLoading(false);
      return;
    }

    setQuestions(data);
    setTimeLeft(config.totalTime);
    setAnswers({});
    setCurrent(0);
    setPhase('test');
    setLoading(false);
  };

  const submitTest = useCallback(async () => {
    if (phase === 'result') return;
    setPhase('result');

    const config = EXAM_CONFIGS[examType];
    let correct = 0, wrong = 0;

    questions.forEach((q, i) => {
      if (answers[i] === q.correct_answer) correct++;
      else if (answers[i]) wrong++;
    });

    const unattempted = questions.length - correct - wrong;
    const score = Math.round((correct / questions.length) * 100);
    const timeTaken = config.totalTime - timeLeft;

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.from('mock_tests').insert({
        user_id: session.user.id,
        exam_type: examType.toUpperCase(),
        total_questions: questions.length,
        correct_answers: correct,
        wrong_answers: wrong,
        score,
        time_taken: timeTaken,
      });
    }

    setResult({ correct, wrong, unattempted, score, timeTaken });
  }, [phase, examType, questions, answers, timeLeft]);

  const timerColor = timeLeft < 300 ? '#ef4444' : timeLeft < 600 ? '#f59e0b' : '#16a34a';

  // ─── PHASE: SELECT ───────────────────────────────────
  if (phase === 'select') return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'sans-serif', padding: '20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>

        <button onClick={() => router.push('/dashboard')}
          style={{ background: 'none', border: 'none', fontSize: '14px', color: '#6b7280', cursor: 'pointer', fontWeight: '600', marginBottom: '24px', display: 'block' }}>
          ← Dashboard
        </button>

        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>🏆 Mock Test</h1>
        <p style={{ color: '#6b7280', marginBottom: '32px' }}>Exam select karo ane full test apao</p>

        {Object.entries(EXAM_CONFIGS).map(([key, cfg]) => (
          <div key={key} onClick={() => !loading && startTest(key)}
            style={{ background: 'white', border: `2px solid ${cfg.color}20`, borderRadius: '16px', padding: '24px', marginBottom: '16px', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = cfg.color}
            onMouseLeave={e => e.currentTarget.style.borderColor = `${cfg.color}20`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: cfg.color }}>{cfg.name} Exam</div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                  {cfg.questions} questions • {Math.floor(cfg.totalTime / 60)} minutes
                </div>
              </div>
              <div style={{ background: cfg.color, color: 'white', padding: '10px 20px', borderRadius: '10px', fontWeight: '700', fontSize: '14px' }}>
                {loading ? '...' : 'Start →'}
              </div>
            </div>
          </div>
        ))}

        <div style={{ background: '#fef3c7', borderRadius: '12px', padding: '16px', marginTop: '8px' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#92400e' }}>
            ⚠️ Test sharu thay pachhi band nahi kari shakay. Timer automatically submit karse.
          </p>
        </div>
      </div>
    </div>
  );

  // ─── PHASE: TEST ───────────────────────────────────
  if (phase === 'test') {
    const q = questions[current];
    const opts = [
      { label: 'A', val: q.option_a },
      { label: 'B', val: q.option_b },
      { label: 'C', val: q.option_c },
      { label: 'D', val: q.option_d },
    ];
    const cfg = EXAM_CONFIGS[examType];

    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'sans-serif' }}>

        {/* Top Bar */}
        <div style={{ background: '#0f172a', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0 }}>
          <span style={{ color: 'white', fontWeight: '800', fontSize: '16px' }}>{cfg.name} Mock Test</span>
          <div style={{ background: timerColor, color: 'white', padding: '8px 16px', borderRadius: '8px', fontWeight: '800', fontSize: '18px', fontFamily: 'monospace' }}>
            ⏱ {formatTime(timeLeft)}
          </div>
          <button onClick={submitTest}
            style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
            Submit Test
          </button>
        </div>

        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>

          {/* Progress */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>
            <span>Question {current + 1} of {questions.length}</span>
            <span>{Object.keys(answers).length} answered</span>
          </div>
          <div style={{ background: '#e2e8f0', borderRadius: '99px', height: '6px', marginBottom: '20px' }}>
            <div style={{ background: cfg.color, height: '100%', borderRadius: '99px', width: `${((current + 1) / questions.length) * 100}%` }} />
          </div>

          {/* Question */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: cfg.color, textTransform: 'uppercase', marginBottom: '10px' }}>
              {q.subject} • {q.language}
            </div>
            <p style={{ fontSize: '17px', fontWeight: '700', color: '#0f172a', margin: 0, lineHeight: 1.6 }}>{q.question}</p>
          </div>

          {/* Options */}
          {opts.map(({ label, val }) => {
            const selected = answers[current] === label;
            return (
              <button key={label}
                onClick={() => setAnswers(prev => ({ ...prev, [current]: label }))}
                style={{ width: '100%', padding: '14px 16px', marginBottom: '10px', background: selected ? `${cfg.color}15` : 'white', border: `2px solid ${selected ? cfg.color : '#e2e8f0'}`, borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
                <span style={{ background: selected ? cfg.color : '#f1f5f9', color: selected ? 'white' : '#64748b', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px', flexShrink: 0 }}>
                  {label}
                </span>
                <span style={{ fontSize: '15px', fontWeight: '600', color: selected ? cfg.color : '#374151' }}>{val}</span>
              </button>
            );
          })}

          {/* Navigation */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
              style={{ flex: 1, padding: '12px', background: current === 0 ? '#f1f5f9' : 'white', border: '2px solid #e2e8f0', borderRadius: '10px', fontWeight: '700', cursor: current === 0 ? 'not-allowed' : 'pointer', color: current === 0 ? '#94a3b8' : '#0f172a' }}>
              ← Prev
            </button>
            <button onClick={() => current + 1 < questions.length ? setCurrent(c => c + 1) : submitTest()}
              style={{ flex: 1, padding: '12px', background: cfg.color, color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
              {current + 1 < questions.length ? 'Next →' : '🏁 Submit'}
            </button>
          </div>

          {/* Question Grid */}
          <div style={{ marginTop: '24px', background: 'white', borderRadius: '12px', padding: '16px' }}>
            <p style={{ fontSize: '13px', fontWeight: '700', color: '#6b7280', margin: '0 0 12px 0' }}>Question Navigator</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {questions.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  style={{ width: '36px', height: '36px', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer', background: i === current ? cfg.color : answers[i] ? '#dcfce7' : '#f1f5f9', color: i === current ? 'white' : answers[i] ? '#16a34a' : '#64748b' }}>
                  {i + 1}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '12px' }}>
              <span>🟦 Current</span>
              <span>🟩 Answered</span>
              <span>⬜ Pending</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── PHASE: RESULT ───────────────────────────────────
  if (phase === 'result' && result) {
    const cfg = EXAM_CONFIGS[examType];
    const grade = result.score >= 80 ? 'A' : result.score >= 60 ? 'B' : result.score >= 40 ? 'C' : 'D';
    const emoji = result.score >= 80 ? '🏆' : result.score >= 60 ? '🎯' : result.score >= 40 ? '📚' : '💪';

    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'sans-serif', padding: '20px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>

          {/* Score Banner */}
          <div style={{ background: `linear-gradient(135deg, #0f172a, ${cfg.color})`, borderRadius: '20px', padding: '36px', textAlign: 'center', color: 'white', marginBottom: '24px' }}>
            <div style={{ fontSize: '56px', marginBottom: '12px' }}>{emoji}</div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 8px 0' }}>{cfg.name} Mock Test Complete!</h2>
            <div style={{ fontSize: '56px', fontWeight: '900', margin: '12px 0' }}>{result.score}%</div>
            <div style={{ fontSize: '20px', fontWeight: '700', opacity: 0.9 }}>Grade: {grade}</div>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            {[
              { label: '✅ Correct', val: result.correct, color: '#dcfce7', text: '#16a34a' },
              { label: '❌ Wrong', val: result.wrong, color: '#fee2e2', text: '#dc2626' },
              { label: '⬜ Skipped', val: result.unattempted, color: '#f1f5f9', text: '#6b7280' },
              { label: '⏱ Time', val: formatTime(result.timeTaken), color: '#dbeafe', text: '#2563eb' },
            ].map(s => (
              <div key={s.label} style={{ background: s.color, borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: '800', color: s.text }}>{s.val}</div>
                <div style={{ fontSize: '13px', color: s.text, marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Feedback */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <p style={{ margin: 0, fontSize: '15px', color: '#374151', lineHeight: 1.6 }}>
              {result.score >= 80 ? '🌟 Excellent! Tame bahuj saru karyu! Keep it up!' :
               result.score >= 60 ? '👍 Good performance! Thodi ane practice karso to score improve thase.' :
               result.score >= 40 ? '📖 Average score. Important topics revise karo ane ek vaar vanchjo.' :
               '💪 Don\'t give up! Regular practice thi improve thase. Aaje thi sharu karo!'}
            </p>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => { setPhase('select'); setResult(null); }}
              style={{ flex: 1, padding: '14px', background: cfg.color, color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '15px' }}>
              🔄 Again
            </button>
            <button onClick={() => router.push('/analytics')}
              style={{ flex: 1, padding: '14px', background: 'white', color: '#0f172a', border: '2px solid #e2e8f0', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '15px' }}>
              📊 Analytics
            </button>
            <button onClick={() => router.push('/dashboard')}
              style={{ flex: 1, padding: '14px', background: '#f1f5f9', color: '#0f172a', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '15px' }}>
              🏠 Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}