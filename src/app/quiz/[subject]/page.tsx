'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter, useParams } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

const SUBJECT_NAMES: Record<string, string> = {
  maths: '🔢 ગણિત', constitution: '📜 બંધારણ',
  history: '🏛️ ઇતિહાસ', geography: '🌍 ભૂગોળ',
  science: '🔬 વિજ્ઞાન', gujarati: '✍️ ગુજરાતી',
  computer: '💻 કમ્પ્યૂટર', reasoning: '🧩 રીઝનિંગ',
  english: '🔤 English', 'current-affairs': '📰 કરંટ અફેર્સ',
  gujarati_sahitya: '📖 ગુજ. સાહિત્ય', gujarati_vyakran: '📝 ગુજ. વ્યાકરણ',
  law: '⚖️ કાયદો', gk: '💡 સામાન્ય જ્ઞાન',
  economics: '📈 અર્થશાસ્ત્ર', heritage: '🏺 વારસો',
  pub_ad: '🏢 જાહેર વહીવટ',
};

type Question = {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation?: string;
};

type Screen = 'setup' | 'quiz' | 'result';

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const subject = params?.subject as string;

  const [screen, setScreen] = useState<Screen>('setup');
  const [totalMarks, setTotalMarks] = useState(50);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);

  const score = questions.reduce((acc, q, i) =>
    selected[i] === q.correct_answer ? acc + 1 : acc, 0);
  const percent = questions.length ? Math.round((score / questions.length) * 100) : 0;

  // ✅ Score Save Function
  const saveScore = useCallback(async (finalScore: number, totalQ: number) => {
    if (scoreSaved) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('user_scores').insert({
        user_id: user.id,
        score: finalScore,
        total_questions: totalQ,
        topic: SUBJECT_NAMES[subject] || subject,
      });
      setScoreSaved(true);
    } catch (e) {
      console.error('Score save error:', e);
    }
  }, [subject, scoreSaved]);

  const startQuiz = async () => {
    setLoading(true);
    const fetchLimit = Math.min(totalMarks * 3, 300);
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('subject', subject)
      .limit(fetchLimit);

    setLoading(false);

    if (error || !data?.length) {
      alert('સવાલ મળ્યા નહીં! Admin થી ઉમેરો.');
      return;
    }

    // Fisher-Yates shuffle
    const arr = [...data];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    setQuestions(arr.slice(0, totalMarks));
    setTimeLeft(totalMarks * 60);
    setCurrent(0);
    setSelected({});
    setScoreSaved(false);
    setScreen('quiz');
  };

  const submitQuiz = useCallback(() => {
    const finalScore = questions.reduce((acc, q, i) =>
      selected[i] === q.correct_answer ? acc + 1 : acc, 0);
    saveScore(finalScore, questions.length);
    setScreen('result');
  }, [questions, selected, saveScore]);

  useEffect(() => {
    if (screen !== 'quiz') return;
    const t = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) { clearInterval(t); submitQuiz(); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [screen, submitQuiz]);

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');
  const timerRed = timeLeft < 60;

  // ── SETUP ──
  if (screen === 'setup') return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'system-ui' }}>
      <div style={{ background: 'white', borderRadius: '24px', padding: '36px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
        <div style={{ fontSize: '56px', marginBottom: '12px' }}>📝</div>
        <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#1e1b4b', marginBottom: '6px' }}>
          {SUBJECT_NAMES[subject] || subject}
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '28px', fontSize: '14px' }}>કેટલા માર્ક્સ નો ટેસ્ટ?</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
          {[
            { marks: 50, label: '50 માર્ક્સ', sub: '50 સવાલ • 50 મિનિટ', color: '#10b981' },
            { marks: 100, label: '100 માર્ક્સ', sub: '100 સવાલ • 100 મિનિટ', color: '#3b82f6' },
            { marks: 200, label: '200 માર્ક્સ', sub: '200 સવાલ • 200 મિનિટ', color: '#8b5cf6' },
          ].map(opt => (
            <button key={opt.marks} onClick={() => setTotalMarks(opt.marks)}
              style={{ padding: '14px', borderRadius: '12px', border: `3px solid ${totalMarks === opt.marks ? opt.color : '#e5e7eb'}`, background: totalMarks === opt.marks ? opt.color + '15' : 'white', cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ fontWeight: '800', fontSize: '17px', color: totalMarks === opt.marks ? opt.color : '#374151' }}>{opt.label}</div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{opt.sub}</div>
            </button>
          ))}
        </div>

        <button onClick={startQuiz} disabled={loading}
          style={{ width: '100%', padding: '15px', background: loading ? '#94a3b8' : 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '17px', fontWeight: '900', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '10px' }}>
          {loading ? '⏳ લોડ...' : '🚀 ક્વિઝ શરૂ કરો'}
        </button>
        <button onClick={() => router.push('/')}
          style={{ width: '100%', padding: '12px', background: 'transparent', color: '#6b7280', border: '2px solid #e5e7eb', borderRadius: '12px', cursor: 'pointer', fontSize: '14px' }}>
          ← પાછા જાઓ
        </button>
      </div>
    </div>
  );

  // ── QUIZ ──
  const q = questions[current];
  if (screen === 'quiz' && q) {
    const answered = selected[current];
    const OPTIONS = ['A', 'B', 'C', 'D'] as const;

    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: 'system-ui', color: 'white' }}>
        <div style={{ background: '#1e293b', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid #334155' }}>
          <button onClick={() => router.push('/')}
            style={{ background: '#334155', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '13px' }}>← Home</button>
          <div style={{ fontWeight: '800', fontSize: '14px' }}>{SUBJECT_NAMES[subject] || subject}</div>
          <div style={{ background: timerRed ? '#ef444420' : '#10b98120', border: `2px solid ${timerRed ? '#ef4444' : '#10b981'}`, borderRadius: '10px', padding: '5px 12px', color: timerRed ? '#ef4444' : '#10b981', fontWeight: '900', fontSize: '17px' }}>
            ⏱ {mm}:{ss}
          </div>
        </div>

        <div style={{ background: '#1e293b', padding: '8px 16px', display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
          <span>પ્રશ્ન {current + 1} / {questions.length}</span>
          <span style={{ color: '#10b981', fontWeight: '700' }}>Score: {score}</span>
        </div>
        <div style={{ height: '3px', background: '#334155' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg,#667eea,#764ba2)', width: `${((current + 1) / questions.length) * 100}%`, transition: 'width 0.3s' }} />
        </div>

        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '18px 16px' }}>
          <div style={{ background: '#1e293b', borderRadius: '14px', padding: '20px', marginBottom: '14px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '11px', color: '#818cf8', fontWeight: '700', letterSpacing: '1px', marginBottom: '10px', textTransform: 'uppercase' }}>
              {subject} • Q{current + 1}
            </div>
            <p style={{ fontSize: '16px', fontWeight: '600', margin: 0, lineHeight: 1.7, color: 'white' }}>{q.question}</p>
          </div>

          {OPTIONS.map(opt => {
            const val = q[`option_${opt.toLowerCase()}` as keyof Question] as string;
            const isSelected = answered === opt;
            const isCorrect = opt === q.correct_answer;
            const showResult = !!answered;
            let bg = '#1e293b', border = '#334155', rightIcon = null as string | null;
            if (showResult) {
              if (isCorrect) { bg = '#064e3b'; border = '#10b981'; rightIcon = '✅'; }
              else if (isSelected) { bg = '#450a0a'; border = '#ef4444'; rightIcon = '❌'; }
            } else if (isSelected) { bg = '#1e3a5f'; border = '#3b82f6'; }
            return (
              <button key={opt}
                onClick={() => { if (!answered) setSelected(p => ({ ...p, [current]: opt })); }}
                style={{ width: '100%', marginBottom: '10px', padding: '14px 16px', borderRadius: '12px', border: `2px solid ${border}`, background: bg, cursor: answered ? 'default' : 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.15s' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: showResult && isCorrect ? '#10b981' : showResult && isSelected ? '#ef4444' : '#334155', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '14px', flexShrink: 0 }}>{opt}</div>
                <span style={{ fontSize: '15px', color: '#e2e8f0', flex: 1, lineHeight: 1.4 }}>{val}</span>
                {rightIcon && <span style={{ fontSize: '18px', flexShrink: 0 }}>{rightIcon}</span>}
              </button>
            );
          })}

          {answered && (
            <div style={{ marginBottom: '12px' }}>
              {q.explanation ? (
                <div style={{ background: '#1c1a00', border: '2px solid #ca8a04', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ color: '#fbbf24', fontWeight: '800', fontSize: '13px', marginBottom: '6px' }}>💡 સ્પષ્ટીકરણ:</div>
                  <div style={{ color: '#fef3c7', fontSize: '14px', lineHeight: 1.7 }}>{q.explanation}</div>
                </div>
              ) : (
                <div style={{ background: '#064e3b', border: '2px solid #10b981', borderRadius: '12px', padding: '12px', color: '#6ee7b7', fontSize: '14px', fontWeight: '700' }}>
                  ✅ સાચો જવાબ: વિકલ્પ {q.correct_answer} — {q[`option_${q.correct_answer.toLowerCase()}` as keyof Question] as string}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button onClick={() => setCurrent(p => Math.max(0, p - 1))} disabled={current === 0}
              style={{ flex: 1, padding: '13px', borderRadius: '12px', border: '2px solid #334155', background: current === 0 ? '#0f172a' : '#1e293b', color: current === 0 ? '#475569' : '#e2e8f0', fontWeight: '700', cursor: current === 0 ? 'not-allowed' : 'pointer', fontSize: '14px' }}>← પાછળ</button>
            {current < questions.length - 1 ? (
              <button onClick={() => setCurrent(p => p + 1)}
                style={{ flex: 2, padding: '13px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', fontWeight: '800', cursor: 'pointer', fontSize: '15px' }}>આગળ →</button>
            ) : (
              <button onClick={submitQuiz}
                style={{ flex: 2, padding: '13px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', fontWeight: '800', cursor: 'pointer', fontSize: '15px' }}>✅ સબમિટ</button>
            )}
          </div>

          {current < questions.length - 1 && (
            <button onClick={submitQuiz}
              style={{ width: '100%', marginTop: '10px', padding: '10px', background: 'transparent', border: '2px solid #334155', borderRadius: '10px', color: '#94a3b8', fontSize: '13px', cursor: 'pointer' }}>
              🏁 હવે સબમિટ ({Object.keys(selected).length}/{questions.length} answered)
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── RESULT ──
  if (screen === 'result') {
    const wrong = questions.length - score;
    const unanswered = questions.length - Object.keys(selected).length;
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#667eea,#764ba2)', padding: '20px', fontFamily: 'system-ui' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '32px', textAlign: 'center', marginBottom: '16px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: '60px', marginBottom: '10px' }}>
              {percent >= 80 ? '🏆' : percent >= 60 ? '👍' : percent >= 40 ? '📚' : '💪'}
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#1e1b4b', marginBottom: '4px' }}>
              {percent >= 80 ? 'શ્રેષ્ઠ!' : percent >= 60 ? 'સારું!' : percent >= 40 ? 'ઠીક છે' : 'વધુ પ્રેક્ટિસ!'}
            </h2>
            <div style={{ fontSize: '44px', fontWeight: '900', color: percent >= 60 ? '#10b981' : '#ef4444', margin: '14px 0 6px' }}>
              {score}/{questions.length}
            </div>
            <div style={{ fontSize: '18px', color: '#6b7280', marginBottom: '20px' }}>{percent}% સાચા</div>

            {scoreSaved && (
              <div style={{ background: '#dcfce7', color: '#166534', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', marginBottom: '16px' }}>
                ✅ Score saved to your progress!
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '22px' }}>
              {[
                { val: score, label: '✅ સાચા', bg: '#dcfce7', color: '#166534' },
                { val: wrong, label: '❌ ખોટા', bg: '#fee2e2', color: '#991b1b' },
                { val: unanswered, label: '⏭ છોડ્યા', bg: '#fef9c3', color: '#854d0e' },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, borderRadius: '12px', padding: '12px' }}>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: '11px', color: s.color, fontWeight: '600' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <button onClick={() => { setScreen('setup'); setSelected({}); setCurrent(0); setScoreSaved(false); }}
              style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', marginBottom: '10px' }}>
              🔄 ફરીથી આપો
            </button>
            <button onClick={() => router.push('/my-progress')}
              style={{ width: '100%', padding: '12px', background: '#f0fdf4', color: '#166534', border: '2px solid #86efac', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', marginBottom: '10px' }}>
              📊 My Progress જુઓ
            </button>
            <button onClick={() => router.push('/')}
              style={{ width: '100%', padding: '12px', background: 'transparent', color: '#6b7280', border: '2px solid #e5e7eb', borderRadius: '12px', cursor: 'pointer', fontSize: '14px' }}>
              ← ઘર
            </button>
          </div>

          <div style={{ background: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e1b4b', marginBottom: '14px' }}>📋 જવાબ સમીક્ષા</h3>
            {questions.map((q, i) => {
              const userAns = selected[i];
              const correct = userAns === q.correct_answer;
              const correctText = q[`option_${q.correct_answer.toLowerCase()}` as keyof Question] as string;
              return (
                <div key={i} style={{ marginBottom: '12px', padding: '12px', borderRadius: '10px', background: correct ? '#f0fdf4' : userAns ? '#fef2f2' : '#fafafa', border: `1px solid ${correct ? '#86efac' : userAns ? '#fca5a5' : '#e5e7eb'}` }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>Q{i + 1}</div>
                  <div style={{ fontSize: '13px', color: '#1e1b4b', fontWeight: '600', marginBottom: '6px', lineHeight: 1.5 }}>
                    {q.question.substring(0, 90)}{q.question.length > 90 ? '...' : ''}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: q.explanation && !correct ? '6px' : '0' }}>
                    <span style={{ fontSize: '12px', background: correct ? '#dcfce7' : userAns ? '#fee2e2' : '#f1f5f9', color: correct ? '#166534' : userAns ? '#dc2626' : '#64748b', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>
                      તમારો: {userAns || 'છોડ્યો'} {correct ? '✅' : userAns ? '❌' : ''}
                    </span>
                    {!correct && (
                      <span style={{ fontSize: '12px', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>
                        સાચો: {q.correct_answer} — {correctText?.substring(0, 30)}
                      </span>
                    )}
                  </div>
                  {q.explanation && !correct && (
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', fontStyle: 'italic', lineHeight: 1.5 }}>
                      💡 {q.explanation.substring(0, 120)}{q.explanation.length > 120 ? '...' : ''}
                    </div>
                  )}
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