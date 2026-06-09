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
};

type Question = {
  id: string; question: string;
  option_a: string; option_b: string; option_c: string; option_d: string;
  correct_answer: string; explanation?: string; subject?: string;
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

  const questionCount = totalMarks === 50 ? 50 : totalMarks === 100 ? 100 : 200;
  const timeSeconds = totalMarks * 60;

  const startQuiz = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('questions').select('*')
      .eq('subject', subject).limit(questionCount);
    setLoading(false);
    if (error || !data?.length) {
      alert('સવાલ મળ્યા નહીં! Admin થી ઉમેરો.');
      return;
    }
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setTimeLeft(timeSeconds);
    setCurrent(0);
    setSelected({});
    setScreen('quiz');
  };

  const submitQuiz = useCallback(() => setScreen('result'), []);

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

  const score = questions.reduce((acc, q, i) =>
    selected[i] === q.correct_answer ? acc + 1 : acc, 0);
  const percent = questions.length ? Math.round((score / questions.length) * 100) : 0;

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');
  const timerRed = timeLeft < 60;

  // ── SETUP ──────────────────────────────────────────
  if (screen === 'setup') return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#667eea,#764ba2)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', fontFamily:'system-ui' }}>
      <div style={{ background:'white', borderRadius:'24px', padding:'40px', maxWidth:'400px', width:'100%', textAlign:'center', boxShadow:'0 25px 50px rgba(0,0,0,0.2)' }}>
        <div style={{ fontSize:'60px', marginBottom:'16px' }}>📝</div>
        <h1 style={{ fontSize:'26px', fontWeight:'900', color:'#1e1b4b', marginBottom:'8px' }}>
          {SUBJECT_NAMES[subject] || subject}
        </h1>
        <p style={{ color:'#6b7280', marginBottom:'32px' }}>કેટલા માર્ક્સ નો ટેસ્ટ?</p>
        <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'32px' }}>
          {[
            { marks:50,  label:'50 માર્ક્સ',  sub:'50 સવાલ • 50 મિનિટ',   color:'#10b981' },
            { marks:100, label:'100 માર્ક્સ', sub:'100 સવાલ • 100 મિનિટ', color:'#3b82f6' },
            { marks:200, label:'200 માર્ક્સ', sub:'200 સવાલ • 200 મિનિટ', color:'#8b5cf6' },
          ].map(opt => (
            <button key={opt.marks} onClick={() => setTotalMarks(opt.marks)}
              style={{ padding:'16px', borderRadius:'14px', border:`3px solid ${totalMarks===opt.marks ? opt.color : '#e5e7eb'}`, background: totalMarks===opt.marks ? opt.color+'15' : 'white', cursor:'pointer' }}>
              <div style={{ fontWeight:'800', fontSize:'18px', color: totalMarks===opt.marks ? opt.color : '#374151' }}>{opt.label}</div>
              <div style={{ fontSize:'13px', color:'#6b7280' }}>{opt.sub}</div>
            </button>
          ))}
        </div>
        <button onClick={startQuiz} disabled={loading}
          style={{ width:'100%', padding:'16px', background: loading ? '#94a3b8' : 'linear-gradient(135deg,#667eea,#764ba2)', color:'white', border:'none', borderRadius:'14px', fontSize:'18px', fontWeight:'900', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? '⏳ લોડ...' : '🚀 ક્વિઝ શરૂ કરો'}
        </button>
        <button onClick={() => router.push('/')}
          style={{ width:'100%', marginTop:'12px', padding:'12px', background:'transparent', color:'#6b7280', border:'2px solid #e5e7eb', borderRadius:'12px', cursor:'pointer' }}>
          ← પાછા જાઓ
        </button>
      </div>
    </div>
  );

  // ── QUIZ ───────────────────────────────────────────
  const q = questions[current];
  if (screen === 'quiz' && q) {
    const answered = selected[current];
    return (
      <div style={{ minHeight:'100vh', background:'#0f172a', fontFamily:'system-ui', color:'white' }}>

        {/* Top Bar */}
        <div style={{ background:'#1e293b', padding:'14px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:100, borderBottom:'1px solid #334155' }}>
          <button onClick={() => router.push('/')} style={{ background:'#334155', color:'white', border:'none', borderRadius:'8px', padding:'6px 12px', cursor:'pointer', fontSize:'13px' }}>← Home</button>
          <div style={{ fontWeight:'800', fontSize:'15px' }}>{SUBJECT_NAMES[subject] || subject}</div>
          <div style={{ background: timerRed ? '#ef444420' : '#10b98120', border:`2px solid ${timerRed ? '#ef4444' : '#10b981'}`, borderRadius:'10px', padding:'6px 14px', color: timerRed ? '#ef4444' : '#10b981', fontWeight:'900', fontSize:'18px' }}>
            ⏱ {mm}:{ss}
          </div>
        </div>

        {/* Progress */}
        <div style={{ background:'#1e293b', padding:'10px 20px', display:'flex', justifyContent:'space-between', fontSize:'13px', color:'#94a3b8' }}>
          <span>પ્રશ્ન {current+1} / {questions.length}</span>
          <span style={{ color:'#10b981', fontWeight:'700' }}>Score: {score}</span>
        </div>
        <div style={{ height:'4px', background:'#334155' }}>
          <div style={{ height:'100%', background:'linear-gradient(90deg,#667eea,#764ba2)', width:`${((current+1)/questions.length)*100}%`, transition:'width 0.3s' }} />
        </div>

        <div style={{ maxWidth:'640px', margin:'0 auto', padding:'20px 16px' }}>

          {/* Question */}
          <div style={{ background:'#1e293b', borderRadius:'16px', padding:'20px', marginBottom:'16px', border:'1px solid #334155' }}>
            <div style={{ fontSize:'11px', color:'#818cf8', fontWeight:'700', letterSpacing:'1px', marginBottom:'10px' }}>
              {(subject||'').toUpperCase()} • QUESTION {current+1}
            </div>
            <p style={{ fontSize:'17px', fontWeight:'600', margin:0, lineHeight:1.7, color:'white' }}>{q.question}</p>
          </div>

          {/* Options */}
          {(['A','B','C','D'] as const).map(opt => {
            const val = q[`option_${opt.toLowerCase()}` as keyof Question] as string;
            const isSelected = answered === opt;
            const isCorrect = opt === q.correct_answer;
            const showResult = !!answered;

            let bg = '#1e293b';
            let border = '#334155';
            let iconRight = null;

            if (showResult) {
              if (isCorrect) { bg = '#064e3b'; border = '#10b981'; iconRight = '✅'; }
              else if (isSelected && !isCorrect) { bg = '#450a0a'; border = '#ef4444'; iconRight = '❌'; }
            } else if (isSelected) {
              bg = '#1e3a5f'; border = '#3b82f6';
            }

            return (
              <button key={opt}
                onClick={() => { if (!answered) setSelected(p => ({...p, [current]: opt})); }}
                style={{ width:'100%', marginBottom:'10px', padding:'14px 18px', borderRadius:'12px', border:`2px solid ${border}`, background:bg, cursor: answered ? 'default' : 'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:'12px', transition:'all 0.2s' }}>
                <div style={{ width:'34px', height:'34px', borderRadius:'8px', background: showResult && isCorrect ? '#10b981' : showResult && isSelected ? '#ef4444' : '#334155', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', fontSize:'14px', flexShrink:0 }}>
                  {opt}
                </div>
                <span style={{ fontSize:'15px', color:'#e2e8f0', flex:1 }}>{val}</span>
                {iconRight && <span style={{ fontSize:'18px' }}>{iconRight}</span>}
              </button>
            );
          })}

          {/* Explanation - auto show after answer */}
          {answered && q.explanation && (
            <div style={{ background:'#1c1a00', border:'2px solid #ca8a04', borderRadius:'12px', padding:'16px', marginBottom:'12px' }}>
              <div style={{ color:'#fbbf24', fontWeight:'700', fontSize:'13px', marginBottom:'6px' }}>💡 સ્પષ્ટીકરણ:</div>
              <div style={{ color:'#fef3c7', fontSize:'14px', lineHeight:1.7 }}>{q.explanation}</div>
            </div>
          )}

          {/* If no explanation, show correct answer */}
          {answered && !q.explanation && (
            <div style={{ background:'#064e3b', border:'2px solid #10b981', borderRadius:'12px', padding:'12px', marginBottom:'12px', color:'#6ee7b7', fontSize:'14px', fontWeight:'700' }}>
              ✅ સાચો જવાબ: વિકલ્પ {q.correct_answer} છે.
            </div>
          )}

          {/* Navigation */}
          <div style={{ display:'flex', gap:'12px', marginTop:'8px' }}>
            <button onClick={() => setCurrent(p => Math.max(0,p-1))} disabled={current===0}
              style={{ flex:1, padding:'14px', borderRadius:'12px', border:'2px solid #334155', background: current===0 ? '#0f172a' : '#1e293b', color: current===0 ? '#475569' : '#e2e8f0', fontWeight:'700', cursor: current===0 ? 'not-allowed' : 'pointer' }}>
              ← પાછળ
            </button>
            {current < questions.length-1 ? (
              <button onClick={() => setCurrent(p => p+1)}
                style={{ flex:2, padding:'14px', borderRadius:'12px', border:'none', background:'linear-gradient(135deg,#667eea,#764ba2)', color:'white', fontWeight:'800', cursor:'pointer', fontSize:'15px' }}>
                આગળ →
              </button>
            ) : (
              <button onClick={submitQuiz}
                style={{ flex:2, padding:'14px', borderRadius:'12px', border:'none', background:'linear-gradient(135deg,#10b981,#059669)', color:'white', fontWeight:'800', cursor:'pointer', fontSize:'15px' }}>
                ✅ સબમિટ
              </button>
            )}
          </div>

          {/* Submit anytime */}
          {current < questions.length-1 && (
            <button onClick={submitQuiz}
              style={{ width:'100%', marginTop:'10px', padding:'10px', background:'transparent', border:'2px solid #334155', borderRadius:'10px', color:'#94a3b8', fontSize:'13px', cursor:'pointer' }}>
              🏁 હવે સબમિટ કરો ({Object.keys(selected).length}/{questions.length} answered)
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── RESULT ─────────────────────────────────────────
  if (screen === 'result') {
    const wrong = questions.length - score;
    const unanswered = questions.length - Object.keys(selected).length;
    return (
      <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#667eea,#764ba2)', padding:'20px', fontFamily:'system-ui' }}>
        <div style={{ maxWidth:'480px', margin:'0 auto' }}>

          {/* Score Card */}
          <div style={{ background:'white', borderRadius:'24px', padding:'32px', textAlign:'center', marginBottom:'16px', boxShadow:'0 25px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize:'64px', marginBottom:'12px' }}>
              {percent>=80?'🏆':percent>=60?'👍':percent>=40?'📚':'💪'}
            </div>
            <h2 style={{ fontSize:'26px', fontWeight:'900', color:'#1e1b4b', marginBottom:'4px' }}>
              {percent>=80?'શ્રેષ્ઠ!':percent>=60?'સારું!':percent>=40?'ઠીક છે':'વધુ પ્રેક્ટિસ!'}
            </h2>
            <div style={{ fontSize:'48px', fontWeight:'900', color: percent>=60?'#10b981':'#ef4444', margin:'16px 0' }}>
              {score}/{questions.length}
            </div>
            <div style={{ fontSize:'20px', color:'#6b7280' }}>{percent}% સાચા</div>

            {/* Stats */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px', margin:'20px 0' }}>
              {[
                { val:score, label:'✅ સાચા', bg:'#dcfce7', color:'#166534' },
                { val:wrong, label:'❌ ખોટા', bg:'#fee2e2', color:'#991b1b' },
                { val:unanswered, label:'⏭ છોડ્યા', bg:'#fef9c3', color:'#854d0e' },
              ].map(s => (
                <div key={s.label} style={{ background:s.bg, borderRadius:'12px', padding:'12px' }}>
                  <div style={{ fontSize:'22px', fontWeight:'900', color:s.color }}>{s.val}</div>
                  <div style={{ fontSize:'11px', color:s.color, fontWeight:'600' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <button onClick={() => { setScreen('setup'); setSelected({}); setCurrent(0); }}
              style={{ width:'100%', padding:'14px', background:'linear-gradient(135deg,#667eea,#764ba2)', color:'white', border:'none', borderRadius:'12px', fontSize:'16px', fontWeight:'800', cursor:'pointer', marginBottom:'10px' }}>
              🔄 ફરીથી આપો
            </button>
            <button onClick={() => router.push('/')}
              style={{ width:'100%', padding:'12px', background:'transparent', color:'#6b7280', border:'2px solid #e5e7eb', borderRadius:'12px', cursor:'pointer' }}>
              ← ઘર
            </button>
          </div>

          {/* Answer Review */}
          <div style={{ background:'white', borderRadius:'20px', padding:'20px', boxShadow:'0 10px 30px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize:'16px', fontWeight:'800', color:'#1e1b4b', marginBottom:'16px' }}>📋 જવાબ સમીક્ષા</h3>
            {questions.map((q, i) => {
              const userAns = selected[i];
              const correct = userAns === q.correct_answer;
              return (
                <div key={i} style={{ marginBottom:'12px', padding:'12px', borderRadius:'10px', background: correct ? '#f0fdf4' : '#fef2f2', border:`1px solid ${correct?'#86efac':'#fca5a5'}` }}>
                  <div style={{ fontSize:'12px', fontWeight:'700', color:'#64748b', marginBottom:'4px' }}>Q{i+1}</div>
                  <div style={{ fontSize:'13px', color:'#1e1b4b', fontWeight:'600', marginBottom:'6px' }}>{q.question.substring(0,80)}...</div>
                  <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                    <span style={{ fontSize:'12px', background: correct?'#dcfce7':'#fee2e2', color: correct?'#166534':'#dc2626', padding:'2px 8px', borderRadius:'6px', fontWeight:'700' }}>
                      તમારો: {userAns || 'છોડ્યો'} {correct?'✅':'❌'}
                    </span>
                    {!correct && (
                      <span style={{ fontSize:'12px', background:'#dcfce7', color:'#166534', padding:'2px 8px', borderRadius:'6px', fontWeight:'700' }}>
                        સાચો: {q.correct_answer}
                      </span>
                    )}
                  </div>
                  {q.explanation && !correct && (
                    <div style={{ fontSize:'12px', color:'#6b7280', marginTop:'6px', fontStyle:'italic' }}>💡 {q.explanation.substring(0,100)}</div>
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