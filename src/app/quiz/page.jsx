'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function QuizPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [timer, setTimer] = useState(30);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load questions from Supabase
  useEffect(() => {
    const loadQuestions = async () => {
      const { data, error } = await supabase.from('questions').select('*').limit(10);
      if (error) console.error(error);
      else setQuestions(data);
      setLoading(false);
    };
    loadQuestions();
  }, []);

  // Timer Countdown
  useEffect(() => {
    if (finished || loading || questions.length === 0) return;
    if (timer === 0) {
      handleNext(null);
      return;
    }
    const t = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, finished, loading, questions]);

  const handleAnswer = (opt) => {
    if (selected !== null) return;
    setSelected(opt);
    const correct = questions[current].correct_answer;
    if (opt === correct) setScore(s => s + 1);
    setAnswers(prev => [...prev, { question: questions[current].question, selected: opt, correct, isCorrect: opt === correct }]);
  };

  // સ્કોર ડેટાબેઝમાં સેવ કરવાનું ફંક્શન
  const saveQuizResult = async (finalScore) => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from('quiz_attempts').insert({
        user_id: user.id,
        subject: questions[0]?.subject || 'General',
        score: finalScore,
        total_questions: questions.length
      });
      if (error) console.error("Error saving score:", error);
    }
    setSaving(false);
    setFinished(true);
  };

  const handleNext = (opt) => {
    if (opt !== null && selected === null) {
      handleAnswer(opt);
      return;
    }
    if (current + 1 >= questions.length) {
      // છેલ્લો પ્રશ્ન હોય ત્યારે સ્કોર સેવ કરવાનું ફંક્શન કોલ થશે
      const finalScore = selected === questions[current].correct_answer ? score + 1 : score;
      saveQuizResult(finalScore);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setTimer(30);
    }
  };

  const optionLabels = ['A', 'B', 'C', 'D'];
  const optionValues = (q) => [q.option_a, q.option_b, q.option_c, q.option_d];

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: 'sans-serif' }}>
      <p style={{ fontSize: '20px', color: '#6b7280' }}>⏳ Questions load thay che...</p>
    </div>
  );

  if (finished) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'sans-serif', padding: '20px' }}>
      <div style={{ maxWidth: '600px', margin: '40px auto' }}>
        <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', borderRadius: '20px', padding: '40px', textAlign: 'center', color: 'white', marginBottom: '24px' }}>
          <div style={{ fontSize: '60px', marginBottom: '16px' }}>{score >= 8 ? '🏆' : score >= 6 ? '🎯' : '💪'}</div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0' }}>Quiz Complete!</h2>
          <p style={{ fontSize: '14px', opacity: 0.8 }}>{saving ? '⚡ Score save thay che...' : '✅ Score saved in database!'}</p>
          <div style={{ fontSize: '48px', fontWeight: '800', margin: '16px 0' }}>{score} / {questions.length}</div>
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>📋 Review</h3>
        {answers.map((a, i) => (
          <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '12px', border: `2px solid ${a.isCorrect ? '#86efac' : '#fca5a5'}` }}>
            <p style={{ fontWeight: '600', color: '#0f172a', margin: '0 0 8px 0' }}>{i + 1}. {a.question}</p>
            <p style={{ margin: '4px 0', fontSize: '13px', color: a.isCorrect ? '#16a34a' : '#dc2626' }}>{a.isCorrect ? '✅' : '❌'} Taro jawab: Option {a.selected}</p>
            {!a.isCorrect && <p style={{ margin: '4px 0', fontSize: '13px', color: '#16a34a' }}>✅ Sahi jawab: Option {a.correct}</p>}
          </div>
        ))}

        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <button onClick={() => { setCurrent(0); setScore(0); setFinished(false); setSelected(null); setTimer(30); setAnswers([]); }} style={{ flex: 1, padding: '14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>🔄 Again Play</button>
          <button onClick={() => router.push('/dashboard')} style={{ flex: 1, padding: '14px', background: '#f1f5f9', color: '#0f172a', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>🏠 Dashboard</button>
        </div>
      </div>
    </div>
  );

  if (questions.length === 0) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p>No questions found!</p></div>;

  const q = questions[current];
  const opts = optionValues(q);
  const timerColor = timer <= 10 ? '#ef4444' : timer <= 20 ? '#f59e0b' : '#16a34a';

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'sans-serif', padding: '20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', fontSize: '14px', color: '#6b7280', cursor: 'pointer', fontWeight: '600' }}>← Dashboard</button>
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{current + 1} / {questions.length}</span>
          <div style={{ background: timerColor, color: 'white', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>{timer}</div>
        </div>

        <div style={{ background: '#e2e8f0', borderRadius: '99px', height: '6px', marginBottom: '24px' }}>
          <div style={{ background: '#2563eb', height: '100%', borderRadius: '99px', width: `${((current + 1) / questions.length) * 100}%`, transition: 'width 0.3s' }} />
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#2563eb', textTransform: 'uppercase', marginBottom: '12px' }}>{q.subject} • {q.language}</div>
          <p style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>{q.question}</p>
        </div>

        {opts.map((opt, i) => {
          const label = optionLabels[i];
          const isSelected = selected === label;
          const isCorrect = q.correct_answer === label;
          let bg = 'white'; let border = '#e2e8f0'; let color = '#0f172a';
          if (selected !== null) {
            if (isCorrect) { bg = '#dcfce7'; border = '#86efac'; color = '#16a34a'; }
            else if (isSelected) { bg = '#fee2e2'; border = '#fca5a5'; color = '#dc2626'; }
          }
          return (
            <button key={i} onClick={() => handleAnswer(label)} disabled={selected !== null} style={{ width: '100%', padding: '16px', marginBottom: '12px', background: bg, border: `2px solid ${border}`, borderRadius: '12px', cursor: selected !== null ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ background: selected !== null ? border : '#f1f5f9', color, borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>{label}</span>
              <span style={{ fontSize: '15px', fontWeight: '600', color }}>{opt}</span>
            </button>
          );
        })}

        {selected !== null && (
          <button onClick={() => handleNext(null)} style={{ width: '100%', padding: '16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginTop: '8px' }}>
            {current + 1 >= questions.length ? '🏁 Results Juo' : 'Aaglu Sawal →'}
          </button>
        )}
      </div>
    </div>
  );
}