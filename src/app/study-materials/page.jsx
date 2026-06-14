'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function StudyMaterialsPage() {
  const router = useRouter();
  const [mode, setMode] = useState('select');
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const fileRef = useRef();
  const cameraRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    setFileName(file.name);
    setError('');
    setUploading(true);
    setMode('uploading');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/generate-quiz', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setCurrent(0); setSelected(null); setScore(0); setAnswers([]);
        setMode('quiz');
      } else {
        setError('Quiz generate na thayo. Bijo file try karo.');
        setMode('select');
      }
    } catch (e) {
      setError('Error: ' + e.message);
      setMode('select');
    } finally {
      setUploading(false);
    }
  };

  const handleAnswer = (opt) => {
    if (selected !== null) return;
    setSelected(opt);
    const q = questions[current];
    const isCorrect = opt === q.correct_option;
    if (isCorrect) setScore(s => s + 1);
    setAnswers(a => [...a, { question: q.question, selected: opt, correct: q.correct_option, isCorrect }]);
  };

  const handleNext = () => {
    if (current + 1 < questions.length) { setCurrent(c => c + 1); setSelected(null); }
    else setMode('result');
  };

  const reset = () => {
    setMode('select'); setQuestions([]); setCurrent(0); setSelected(null);
    setScore(0); setAnswers([]); setError(''); setFileName('');
  };

  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  if (mode === 'select') return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: 'system-ui', color: 'white', padding: '20px', paddingBottom: '90px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <button onClick={() => router.back()} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '8px 14px', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}>← પાછળ</button>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>📄 PDF / Photo Quiz</h1>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Upload karo, AI quiz banave!</p>
          </div>
        </div>
        {error && <div style={{ background: '#450a0a', border: '1px solid #7f1d1d', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: '#fca5a5' }}>⚠️ {error}</div>}
        <div style={{ display: 'grid', gap: '14px' }}>
          <div onClick={() => fileRef.current.click()} style={{ background: '#1e293b', border: '2px dashed #334155', borderRadius: '16px', padding: '32px 20px', textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📄</div>
            <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>PDF Upload karo</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Exam paper, notes, syllabus</div>
            <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
          </div>
          <div onClick={() => cameraRef.current.click()} style={{ background: '#1e293b', border: '2px dashed #334155', borderRadius: '16px', padding: '32px 20px', textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📸</div>
            <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>Photo / Image Upload karo</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Book page, handwritten notes, question paper</div>
            <input ref={cameraRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
          </div>
        </div>
        <div style={{ marginTop: '24px', background: '#1e293b', borderRadius: '12px', padding: '14px 16px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>💡 Kevi rite kaam kare?</div>
          <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.6' }}>1. PDF ya photo select karo<br/>2. AI content read kari 10 MCQ banave<br/>3. Quiz solve karo ane score juo!</div>
        </div>
      </div>
    </div>
  );

  if (mode === 'uploading') return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui', color: 'white' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '60px', marginBottom: '20px' }}>🤖</div>
        <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>AI Quiz Banavi Rayo Che...</div>
        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>"{fileName}" — reading ane MCQ generate kari rayo</div>
        <div style={{ width: '200px', height: '4px', background: '#1e293b', borderRadius: '2px', margin: '0 auto', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '60%', background: '#6366f1', borderRadius: '2px' }} />
        </div>
      </div>
    </div>
  );

  if (mode === 'result') return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: 'system-ui', color: 'white', padding: '20px', paddingBottom: '90px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '60px', marginBottom: '12px' }}>{pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '💪'}</div>
        <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '4px' }}>Quiz Puro Thayo!</h2>
        <div style={{ fontSize: '40px', fontWeight: '900', color: pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444', marginBottom: '4px' }}>{pct}%</div>
        <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>{score} / {questions.length} correct</div>
        <div style={{ display: 'grid', gap: '10px', marginBottom: '24px', textAlign: 'left' }}>
          {answers.map((a, i) => (
            <div key={i} style={{ background: a.isCorrect ? '#052e16' : '#450a0a', border: `1px solid ${a.isCorrect ? '#166534' : '#7f1d1d'}`, borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Q{i+1}: {a.question}</div>
              <div style={{ fontSize: '12px' }}>
                <span style={{ color: a.isCorrect ? '#4ade80' : '#f87171' }}>Taro: {a.selected}</span>
                {!a.isCorrect && <span style={{ color: '#4ade80', marginLeft: '10px' }}>✓ Sahi: {a.correct}</span>}
              </div>
            </div>
          ))}
        </div>
        <button onClick={reset} style={{ width: '100%', padding: '14px', background: '#6366f1', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '800', cursor: 'pointer', fontSize: '15px' }}>🔄 Navo Quiz Karo</button>
        <button onClick={() => router.push('/')} style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid #334155', borderRadius: '12px', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', marginTop: '10px' }}>🏠 Dashboard</button>
      </div>
    </div>
  );

  const q = questions[current];
  const opts = ['a', 'b', 'c', 'd'];
  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: 'system-ui', color: 'white', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#1e293b', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155' }}>
        <button onClick={reset} style={{ background: '#334155', border: 'none', borderRadius: '8px', padding: '6px 12px', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}>✕ Chhod</button>
        <div style={{ fontSize: '13px', color: '#94a3b8' }}>{current + 1} / {questions.length}</div>
        <div style={{ fontSize: '13px', color: '#10b981', fontWeight: '700' }}>Score: {score}</div>
      </div>
      <div style={{ height: '3px', background: '#1e293b' }}>
        <div style={{ height: '100%', width: `${((current + 1) / questions.length) * 100}%`, background: '#6366f1', transition: 'width 0.3s' }} />
      </div>
      <div style={{ flex: 1, padding: '20px 16px', maxWidth: '480px', margin: '0 auto', width: '100%' }}>
        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>📄 {fileName}</div>
        <div style={{ fontSize: '17px', fontWeight: '700', lineHeight: '1.5', marginBottom: '24px', minHeight: '60px' }}>{q.question}</div>
        <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
          {opts.map(opt => {
            const val = q[opt];
            if (!val) return null;
            let bg = '#1e293b', border = '#334155', color = 'white';
            if (selected !== null) {
              if (opt === q.correct_option) { bg = '#052e16'; border = '#16a34a'; color = '#4ade80'; }
              else if (opt === selected) { bg = '#450a0a'; border = '#dc2626'; color = '#f87171'; }
            }
            return (
              <button key={opt} onClick={() => handleAnswer(opt)} disabled={selected !== null}
                style={{ background: bg, border: `1px solid ${border}`, borderRadius: '12px', padding: '14px 16px', color, textAlign: 'left', cursor: selected ? 'default' : 'pointer', fontSize: '14px', transition: 'all 0.2s' }}>
                <span style={{ color: '#64748b', marginRight: '10px', fontSize: '12px' }}>{opt.toUpperCase()}.</span>{val}
              </button>
            );
          })}
        </div>
        {selected && <div style={{ background: '#1e293b', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', fontSize: '12px', color: '#94a3b8', lineHeight: '1.5' }}>💡 {q.explanation || 'Aage vadho!'}</div>}
        {selected && (
          <button onClick={handleNext} style={{ width: '100%', padding: '14px', background: '#6366f1', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '800', cursor: 'pointer', fontSize: '15px' }}>
            {current + 1 < questions.length ? 'Aage →' : '🏁 Result Juo'}
          </button>
        )}
      </div>
    </div>
  );
}