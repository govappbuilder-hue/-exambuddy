'use client';
import { useEffect, useState, useCallback, use } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';

const SUBJECT_NAMES: Record<string, string> = {
  maths: '🔢 ગણિત',
  constitution: '📜 બંધારણ',
  history: '🏛️ ઇતિહાસ',
  geography: '🌍 ભૂગોળ',
  science: '🔬 વિજ્ઞાન',
  gujarati: '✍️ ગુજરાતી',
  computer: '💻 કમ્પ્યૂટર',
  reasoning: '🧩 રીઝનિંગ',
  english: '🔤 English',
  'current-affairs': '📰 કરંટ અફેર્સ',
  gujarati_sahitya: '📖 ગુજ. સાહિત્ય',
  gujarati_vyakran: '📝 ગુજ. વ્યાકરણ',
  law: '⚖️ કાયદો',
  gk: '💡 સામાન્ય જ્ઞાન',
  economics: '📈 અર્થશાસ્ત્ર',
  heritage: '🏺 વારસો',
  pub_ad: '🏢 જાહેર વહીવટ',
  general: '💡 સામાન્ય જ્ઞાન',
  polity: '🏛️ રાજ્યશાસ્ત્ર',
  current_affairs: '📰 Current Affairs',
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

interface PageProps {
  params: Promise<{ subject: string }>;
}

export default function QuizPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const subject = resolvedParams?.subject || '';

  const [screen, setScreen] = useState<Screen>('setup');
  const [totalMarks, setTotalMarks] = useState(50);
  const [negativeMarking, setNegativeMarking] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);

  // ── BOOKMARK STATE ──
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);

  // ── GET USER ID ON MOUNT ──
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  // ── TOGGLE BOOKMARK ──
  const toggleBookmark = async (questionId: string) => {
    if (!userId) return;
    if (bookmarked.has(questionId)) {
      await supabase.from('bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('question_id', questionId);
      setBookmarked(p => { const n = new Set(p); n.delete(questionId); return n; });
    } else {
      await supabase.from('bookmarks')
        .insert({ user_id: userId, question_id: questionId });
      setBookmarked(p => new Set(p).add(questionId));
    }
  };

  const startQuiz = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('subject', subject)
      .limit(500);
    setLoading(false);

    if (error || !data?.length) {
      alert('સવાલ મળ્યા નહીં! Admin થી ઉમેરો.');
      return;
    }

    const arr = [...data];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    setQuestions(arr.slice(0, totalMarks));
    setTimeLeft(totalMarks * 60);
    setCurrent(0);
    setSelected({});
    setScreen('quiz');
  };

  const submitQuiz = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const rawScore = questions.reduce((acc, q, i) => {
        if (selected[i] === q.correct_answer) return acc + 1;
        if (negativeMarking && selected[i] !== undefined) return acc - 0.25;
        return acc;
      }, 0);
      const finalScore = Math.max(0, Math.round(rawScore * 100) / 100);
      await supabase.from('quiz_history').insert({
        user_id: user.id,
        subject_name: SUBJECT_NAMES[subject] || subject,
        score: finalScore,
        total: questions.length,
        created_at: new Date().toISOString(),
      });
    }
    setScreen('result');
  }, [questions, selected, subject]);

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

  const score = questions.reduce((acc, q, i) => {
    if (selected[i] === q.correct_answer) return acc + 1;
    if (negativeMarking && selected[i] !== undefined) return acc - 0.25;
    return acc;
  }, 0);
  const finalDisplayScore = Math.max(0, Math.round(score * 100) / 100);
  const percent = questions.length
    ? Math.round((score / questions.length) * 100)
    : 0;
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');
  const timerRed = timeLeft < 60;
  const subjectName = SUBJECT_NAMES[subject] || subject;

  /* ═══ SETUP SCREEN ═══ */
  if (screen === 'setup') return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'system-ui' }}>
      <div style={{ background: 'white', borderRadius: '24px', padding: '36px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
        <div style={{ fontSize: '56px', marginBottom: '12px' }}>📝</div>
        <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#1e1b4b', margin: '0 0 6px' }}>
          {subjectName}
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '28px', fontSize: '14px' }}>
          કેટલા માર્ક્સ નો ટેસ્ટ?
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
          {[
            { marks: 50, label: '50 માર્ક્સ', sub: '50 સવાલ • 50 મિનિટ', color: '#10b981' },
            { marks: 100, label: '100 માર્ક્સ', sub: '100 સવાલ • 100 મિનિટ', color: '#3b82f6' },
            { marks: 200, label: '200 માર્ક્સ', sub: '200 સવાલ • 200 મિનિટ', color: '#8b5cf6' },
          ].map(opt => (
            <button key={opt.marks} onClick={() => setTotalMarks(opt.marks)}
              style={{ padding: '14px', borderRadius: '12px', border: `3px solid ${totalMarks === opt.marks ? opt.color : '#e5e7eb'}`, background: totalMarks === opt.marks ? opt.color + '18' : 'white', cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ fontWeight: '800', fontSize: '17px', color: totalMarks === opt.marks ? opt.color : '#374151' }}>{opt.label}</div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{opt.sub}</div>
            </button>
          ))}
        </div>

        {/* Negative Marking Toggle */}
        <div onClick={() => setNegativeMarking((p: boolean) => !p)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '12px', border: `2px solid ${negativeMarking ? '#ef4444' : '#e5e7eb'}`, background: negativeMarking ? '#fef2f2' : '#f8fafc', cursor: 'pointer', marginBottom: '16px', transition: 'all 0.2s' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: '800', fontSize: '15px', color: negativeMarking ? '#ef4444' : '#374151' }}>⚠️ Negative Marking</div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>ખોટા જવાબ પર -0.25 marks</div>
          </div>
          <div style={{ width: '44px', height: '24px', borderRadius: '12px', background: negativeMarking ? '#ef4444' : '#cbd5e1', position: 'relative', transition: 'background 0.2s' }}>
            <div style={{ position: 'absolute', top: '2px', left: negativeMarking ? '22px' : '2px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
          </div>
        </div>

        <button onClick={startQuiz} disabled={loading} style={{ width: '100%', padding: '15px', background: loading ? '#94a3b8' : 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '17px', fontWeight: '900', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '10px' }}>
          {loading ? '⏳ લોડ...' : '🚀 ક્વિઝ શરૂ કરો'}
        </button>

        <button onClick={() => router.push('/')} style={{ width: '100%', padding: '12px', background: 'transparent', color: '#6b7280', border: '2px solid #e5e7eb', borderRadius: '12px', cursor: 'pointer', fontSize: '14px' }}>
          ← પાછા જાઓ
        </button>
      </div>
    </div>
  );

  /* ═══ QUIZ SCREEN ═══ */
  const q = questions[current];
  if (screen === 'quiz' && q) {
    const answered = selected[current];
    const OPTIONS = ['A', 'B', 'C', 'D'] as const;

    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: 'system-ui', color: 'white' }}>

        <div style={{ background: '#1e293b', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid #334155' }}>
          <button onClick={() => router.push('/')} style={{ background: '#334155', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '13px' }}>← Home</button>
          <div style={{ fontWeight: '800', fontSize: '14px' }}>{subjectName}</div>
          <div style={{ background: timerRed ? '#ef444420' : '#10b98120', border: `2px solid ${timerRed ? '#ef4444' : '#10b981'}`, borderRadius: '10px', padding: '5px 12px', color: timerRed ? '#ef4444' : '#10b981', fontWeight: '900', fontSize: '17px' }}>
            ⏱ {mm}:{ss}
          </div>
        </div>

        <div style={{ background: '#1e293b', padding: '8px 16px', display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
          <span>પ્રશ્ન {current + 1} / {questions.length}</span>
          <span style={{ color: '#10b981', fontWeight: '700' }}>Score: {finalDisplayScore}{negativeMarking ? " (–0.25/wrong)" : ""}</span>
        </div>
        <div style={{ height: '3px', background: '#334155' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg,#667eea,#764ba2)', width: `${((current + 1) / questions.length) * 100}%`, transition: 'width 0.3s' }} />
        </div>

        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '18px 16px' }}>
          <div style={{ background: '#1e293b', borderRadius: '14px', padding: '20px', marginBottom: '14px', border: '1px solid #334155' }}>

            {/* ── SUBJECT LABEL + BOOKMARK BUTTON ── */}
            <div style={{ fontSize: '11px', color: '#818cf8', fontWeight: '700', letterSpacing: '1px', marginBottom: '10px', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{subject.toUpperCase()} • QUESTION {current + 1}</span>
              <button
                onClick={() => toggleBookmark(q.id)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '20px', padding: '2px 0', lineHeight: 1 }}
              >
                {bookmarked.has(q.id) ? '❤️' : '🤍'}
              </button>
            </div>

            <p style={{ fontSize: '16px', fontWeight: '600', margin: 0, lineHeight: 1.7, color: 'white' }}>{q.question}</p>
          </div>

          {OPTIONS.map(opt => {
            const val = q[`option_${opt.toLowerCase()}` as keyof Question] as string;
            const isSelected = answered === opt;
            const isCorrect = opt === q.correct_answer;
            const showResult = !!answered;
            let bg = '#1e293b', border = '#334155', icon: string | null = null;
            if (showResult) {
              if (isCorrect) { bg = '#064e3b'; border = '#10b981'; icon = '✅'; }
              else if (isSelected) { bg = '#450a0a'; border = '#ef4444'; icon = '❌'; }
            } else if (isSelected) { bg = '#1e3a5f'; border = '#3b82f6'; }

            return (
              <button key={opt}
                onClick={() => { if (!answered) setSelected(p => ({ ...p, [current]: opt })); }}
                style={{ width: '100%', marginBottom: '10px', padding: '14px 16px', borderRadius: '12px', border: `2px solid ${border}`, background: bg, cursor: answered ? 'default' : 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.15s' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: showResult && isCorrect ? '#10b981' : showResult && isSelected ? '#ef4444' : '#334155', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '14px', flexShrink: 0 }}>{opt}</div>
                <span style={{ fontSize: '15px', color: '#e2e8f0', flex: 1, lineHeight: 1.4 }}>{val}</span>
                {icon && <span style={{ fontSize: '18px', flexShrink: 0 }}>{icon}</span>}
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
              style={{ flex: 1, padding: '13px', borderRadius: '12px', border: '2px solid #334155', background: current === 0 ? '#0f172a' : '#1e293b', color: current === 0 ? '#475569' : '#e2e8f0', fontWeight: '700', cursor: current === 0 ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
              ← પાછળ
            </button>
            {current < questions.length - 1 ? (
              <button onClick={() => setCurrent(p => p + 1)}
                style={{ flex: 2, padding: '13px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', fontWeight: '800', cursor: 'pointer', fontSize: '15px' }}>
                આગળ →
              </button>
            ) : (
              <button onClick={submitQuiz}
                style={{ flex: 2, padding: '13px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', fontWeight: '800', cursor: 'pointer', fontSize: '15px' }}>
                ✅ સબમિટ
              </button>
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

  /* ═══ RESULT SCREEN ═══ */
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
            <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#1e1b4b', margin: '0 0 4px' }}>
              {percent >= 80 ? 'શ્રેષ્ઠ!' : percent >= 60 ? 'સારું!' : percent >= 40 ? 'ઠીક છે' : 'વધુ પ્રેક્ટિસ!'}
            </h2>
            <div style={{ fontSize: '44px', fontWeight: '900', color: percent >= 60 ? '#10b981' : '#ef4444', margin: '14px 0 6px' }}>
              {finalDisplayScore}/{questions.length}
            </div>
            <div style={{ fontSize: '18px', color: '#6b7280', marginBottom: '20px' }}>{percent}% સાચા</div>

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

            <button onClick={() => { setScreen('setup'); setSelected({}); setCurrent(0); }}
              style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', marginBottom: '10px' }}>
              🔄 ફરીથી આપો
            </button>
            <button onClick={() => router.push('/')}
              style={{ width: '100%', padding: '12px', background: 'transparent', color: '#6b7280', border: '2px solid #e5e7eb', borderRadius: '12px', cursor: 'pointer', fontSize: '14px' }}>
              ← ઘર
            </button>
          </div>

          <div style={{ background: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e1b4b', margin: '0 0 14px' }}>📋 જવાબ સમીક્ષા</h3>
            {questions.map((ques, i) => {
              const userAns = selected[i];
              const correct = userAns === ques.correct_answer;
              const correctText = ques[`option_${ques.correct_answer.toLowerCase()}` as keyof Question] as string;
              return (
                <div key={i} style={{ marginBottom: '12px', padding: '12px', borderRadius: '10px', background: correct ? '#f0fdf4' : userAns ? '#fef2f2' : '#fafafa', border: `1px solid ${correct ? '#86efac' : userAns ? '#fca5a5' : '#e5e7eb'}` }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>Q{i + 1}</div>
                  <div style={{ fontSize: '13px', color: '#1e1b4b', fontWeight: '600', marginBottom: '6px', lineHeight: 1.5 }}>
                    {ques.question.substring(0, 90)}{ques.question.length > 90 ? '...' : ''}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', background: correct ? '#dcfce7' : userAns ? '#fee2e2' : '#f1f5f9', color: correct ? '#166534' : userAns ? '#dc2626' : '#64748b', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>
                      તમારો: {userAns || 'છોડ્યો'} {correct ? '✅' : userAns ? '❌' : ''}
                    </span>
                    {!correct && (
                      <span style={{ fontSize: '12px', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>
                        સાચો: {ques.correct_answer} — {correctText?.substring(0, 30)}
                      </span>
                    )}
                  </div>
                  {ques.explanation && !correct && (
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px', fontStyle: 'italic', lineHeight: 1.5 }}>
                      💡 {ques.explanation.substring(0, 120)}{ques.explanation.length > 120 ? '...' : ''}
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