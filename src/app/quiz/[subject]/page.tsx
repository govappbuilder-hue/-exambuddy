'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// તારા સુપાબેઝ ડેટાબેઝમાં જે નામ છે તેની સાથે લિંકનું મેપિંગ
const SUBJECT_MAP: Record<string, { dbName: string; displayName: string }> = {
  gujarati_sahitya: { dbName: 'ગુજરાતી સાહિત્ય', displayName: '✍️ ગુજરાતી સાહિત્ય' },
  gujarati_vyakran: { dbName: 'ગુજરાતી વ્યાકરણ', displayName: '📝 ગુજરાતી વ્યાકરણ' },
  maths: { dbName: 'ગણિત', displayName: '🔢 ગણિત' },
  constitution: { dbName: 'બંધારણ', displayName: '📜 બંધારણ' },
  history: { dbName: 'ઇતિહાસ', displayName: '🏛️ ઇતિહાસ' },
  geography: { dbName: 'ભૂગોળ', displayName: '🌍 ભૂગોળ' },
  science: { dbName: 'વિજ્ઞાન', displayName: '🔬 વિજ્ઞાન' },
  computer: { dbName: 'કમ્પ્યૂટર', displayName: '💻 કમ્પ્યૂટર' },
  reasoning: { dbName: 'રીઝનિંગ', displayName: '🧩 રીઝનિંગ' },
  english: { dbName: 'English', displayName: '🔤 English' },
  law: { dbName: 'કાયદો', displayName: '⚖️ કાયદો' },
  gk: { dbName: 'સામાન્ય જ્ઞાન', displayName: '💡 સામાન્ય જ્ઞાન' },
  current_affairs: { dbName: 'કરંટ અફેર્સ', displayName: '📰 કરંટ અફેર્સ' },
  heritage: { dbName: 'સાંસ્કૃતિક વારસો', displayName: '🏛️ સાંસ્કૃતિક વારસો' },
  economics: { dbName: 'અર્થશાસ્ત્ર', displayName: '📈 અર્થશાસ્ત્ર' },
  pub_ad: { dbName: 'જાહેર વહીવટ', displayName: '🏢 જાહેર વહીવટ' }
};

interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation?: string;
}

type ScreenType = 'setup' | 'quiz' | 'result';

interface PageProps {
  params: Promise<{ subject: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function QuizPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const routeSubject = resolvedParams?.subject || "";

  // જો મેપિંગ મળે તો ડેટાબેઝનું સાચું નામ લેશે, નહીંતર રાઉટનું નામ રાખશે
  const subjectConfig = SUBJECT_MAP[routeSubject] || { dbName: routeSubject, displayName: routeSubject };

  const [screen, setScreen] = useState<ScreenType>('setup');
  const [totalMarks, setTotalMarks] = useState(50);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const questionCount = totalMarks;
  const timeSeconds = totalMarks * 60;

  const startQuiz = async () => {
    if (!subjectConfig.dbName) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('subject', subjectConfig.dbName) // અહીં ડેટાબેઝનું ગુજરાતી નામ જશે
        .limit(questionCount);

      if (error) throw error;

      if (!data || data.length === 0) {
        alert(`"${subjectConfig.dbName}" વિષયના પ્રશ્નો ડેટાબેઝમાં મળ્યા નથી!`);
        return;
      }

      const shuffled = [...data].sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
      setTimeLeft(timeSeconds);
      setCurrent(0);
      setSelected({});
      setScreen('quiz');
    } catch (err) {
      console.error(err);
      alert('ડેટા લોડ કરવામાં ભૂલ આવી!');
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = useCallback(() => setScreen('result'), []);

  useEffect(() => {
    if (screen !== 'quiz') return;
    const t = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) {
          clearInterval(t);
          submitQuiz();
          return 0;
        }
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
  const timerColor = timeLeft < 60 ? '#ef4444' : timeLeft < 300 ? '#f59e0b' : '#10b981';

  // SETUP SCREEN
  if (screen === 'setup') return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'system-ui' }}>
      <div style={{ background: 'white', borderRadius: '24px', padding: '40px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
        <div style={{ fontSize: '60px', marginBottom: '16px' }}>📝</div>
        <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#1e1b4b', marginBottom: '8px' }}>
          {subjectConfig.displayName}
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '32px', fontSize: '15px' }}>કેટલા માર્ક્સ નો ટેસ્ટ આપવો છે?</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          {[
            { marks: 50, label: '50 માર્ક્સ', sub: '50 સવાલ • 50 મિનિટ', color: '#10b981' },
            { marks: 100, label: '100 માર્ક્સ', sub: '100 સવાલ • 100 મિનિટ', color: '#3b82f6' },
            { marks: 200, label: '200 માર્ક્સ', sub: '200 સવાલ • 200 મિનિટ', color: '#8b5cf6' },
          ].map(opt => (
            <button key={opt.marks} onClick={() => setTotalMarks(opt.marks)}
              style={{ padding: '16px', borderRadius: '14px', border: `3px solid ${totalMarks === opt.marks ? opt.color : '#e5e7eb'}`, background: totalMarks === opt.marks ? opt.color + '15' : 'white', cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ fontWeight: '800', fontSize: '18px', color: totalMarks === opt.marks ? opt.color : '#374151' }}>{opt.label}</div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{opt.sub}</div>
            </button>
          ))}
        </div>

        <button onClick={startQuiz} disabled={loading}
          style={{ width: '100%', padding: '16px', background: loading ? '#94a3b8' : 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '18px', fontWeight: '900', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? '⏳ લોડ થઈ રહ્યું છે...' : '🚀 ક્વિઝ શરૂ કરો'}
        </button>

        <button onClick={() => router.push('/')}
          style={{ width: '100%', marginTop: '12px', padding: '12px', background: 'transparent', color: '#6b7280', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '14px', cursor: 'pointer' }}>
          ← પાછા જાઓ
        </button>
      </div>
    </div>
  );

  // QUIZ SCREEN
  const q = questions[current];
  if (screen === 'quiz' && q) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui' }}>
      <div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>
          {current + 1} / {questions.length}
        </div>
        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '20px', padding: '8px 20px', color: timerColor === '#ef4444' ? '#fca5a5' : 'white', fontWeight: '900', fontSize: '20px', fontVariantNumeric: 'tabular-nums' }}>
          ⏱ {mm}:{ss}
        </div>
        <button onClick={submitQuiz}
          style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '10px', padding: '8px 14px', fontSize: '13px', cursor: 'pointer', fontWeight: '700' }}>
          સબમિટ
        </button>
      </div>

      <div style={{ height: '4px', background: '#e2e8f0' }}>
        <div style={{ height: '100%', background: 'linear-gradient(90deg, #667eea, #764ba2)', width: `${((current + 1) / questions.length) * 100}%`, transition: 'width 0.3s' }} />
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '24px', marginBottom: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: '13px', color: '#8b5cf6', fontWeight: '700', marginBottom: '10px' }}>
            પ્રશ્ન {current + 1}
          </div>
          <p style={{ fontSize: '17px', fontWeight: '600', color: '#1e1b4b', margin: 0, lineHeight: 1.6 }}>{q.question}</p>
        </div>

        {['A','B','C','D'].map(opt => {
          const optKey = `option_${opt.toLowerCase()}` as keyof Question;
          const val = q[optKey] as string;
          const isSelected = selected[current] === opt;
          return (
            <button key={opt} onClick={() => { if (!selected[current]) setSelected(p => ({...p, [current]: opt})); setShowExplanation(false); }}
              style={{ width: '100%', marginBottom: '10px', padding: '16px 20px', borderRadius: '14px', border: `2px solid ${isSelected ? '#667eea' : '#e2e8f0'}`, background: isSelected ? 'linear-gradient(135deg, #667eea15, #764ba215)' : 'white', cursor: selected[current] ? 'default' : 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: isSelected ? '0 4px 15px rgba(102,126,234,0.2)' : 'none', transition: 'all 0.2s' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: isSelected ? '#667eea' : '#f1f5f9', color: isSelected ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '15px', flexShrink: 0 }}>
                {opt}
              </div>
              <span style={{ fontSize: '15px', fontWeight: '500', color: '#1e1b4b' }}>{val}</span>
            </button>
          );
        })}

        {selected[current] && q.explanation && (
          <button onClick={() => setShowExplanation(p => !p)}
            style={{ width: '100%', padding: '12px', background: '#fffbeb', border: '2px solid #fbbf24', borderRadius: '12px', color: '#92400e', fontWeight: '700', cursor: 'pointer', marginBottom: '12px', fontSize: '14px' }}>
            💡 {showExplanation ? 'સ્પષ્ટીકરણ છુપાવો' : 'સ્પષ્ટીકરણ જુઓ'}
          </button>
        )}
        {showExplanation && q.explanation && (
          <div style={{ background: '#fffbeb', border: '2px solid #fbbf24', borderRadius: '12px', padding: '16px', marginBottom: '12px', color: '#78350f', fontSize: '14px', lineHeight: 1.6 }}>
            {q.explanation}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button onClick={() => { setCurrent(p => Math.max(0, p-1)); setShowExplanation(false); }} disabled={current === 0}
            style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '2px solid #e2e8f0', background: current === 0 ? '#f8fafc' : 'white', color: current === 0 ? '#cbd5e1' : '#374151', fontWeight: '700', cursor: current === 0 ? 'not-allowed' : 'pointer', fontSize: '15px' }}>
            ← પાછળ
          </button>
          {current < questions.length - 1 ? (
            <button onClick={() => { setCurrent(p => p+1); setShowExplanation(false); }}
              style={{ flex: 2, padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', fontWeight: '800', cursor: 'pointer', fontSize: '15px' }}>
              આગળ →
            </button>
          ) : (
            <button onClick={submitQuiz}
              style={{ flex: 2, padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontWeight: '800', cursor: 'pointer', fontSize: '15px' }}>
              ✅ સબમિટ કરો
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // RESULT SCREEN
  if (screen === 'result') return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'system-ui' }}>
      <div style={{ background: 'white', borderRadius: '24px', padding: '40px', maxWidth: '420px', width: '100%', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
        <div style={{ fontSize: '70px', marginBottom: '16px' }}>
          {percent >= 80 ? '🏆' : percent >= 60 ? '👍' : percent >= 40 ? '📚' : '💪'}
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#1e1b4b', marginBottom: '8px' }}>
          {percent >= 80 ? 'શ્રેષ્ઠ!' : percent >= 60 ? 'સારું!' : percent >= 40 ? 'ઠીક છે' : 'વધુ પ્રેક્ટિસ કરો'}
        </h2>

        <div style={{ background: 'linear-gradient(135deg, #667eea15, #764ba215)', borderRadius: '20px', padding: '24px', margin: '24px 0' }}>
          <div style={{ fontSize: '52px', fontWeight: '900', color: percent >= 60 ? '#10b981' : '#ef4444' }}>
            {score}/{questions.length}
          </div>
          <div style={{ fontSize: '18px', color: '#6b7280', marginTop: '4px' }}>{percent}% સાચા</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          <div style={{ background: '#dcfce7', borderRadius: '14px', padding: '16px' }}>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#166534' }}>{score}</div>
            <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>✅ સાચા</div>
          </div>
          <div style={{ background: '#fee2e2', borderRadius: '14px', padding: '16px' }}>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#991b1b' }}>{questions.length - score}</div>
            <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: '600' }}>❌ ખોટા</div>
          </div>
        </div>

        <button onClick={() => setScreen('setup')}
          style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', marginBottom: '12px' }}>
          🔄 ફરીથી આપો
        </button>
        <button onClick={() => router.push('/')}
          style={{ width: '100%', padding: '14px', background: 'transparent', color: '#6b7280', border: '2px solid #e5e7eb', borderRadius: '14px', fontSize: '15px', cursor: 'pointer' }}>
          ← ઘર પર જાઓ
        </button>
      </div>
    </div>
  );

  return null;
}