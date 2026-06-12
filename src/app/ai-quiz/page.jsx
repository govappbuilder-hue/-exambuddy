'use client';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function AIQuizPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [stage, setStage] = useState('upload'); // upload | quiz | result

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return; }
      setUser(user);
    });
  }, []);

  const handleFilePick = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(f.type)) {
      setError('Faqt JPG, PNG, WEBP ya PDF file upload karo.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File 10MB thi moti na hoy.');
      return;
    }

    setError('');
    setFile(f);

    if (f.type.startsWith('image/')) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFilePick({ target: { files: [f] } });
  };

  const generateQuiz = async () => {
    if (!file) return;
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!data.questions || data.questions.length === 0) {
        setError('Questions generate thaya nahi. Fari try karo.');
        setLoading(false);
        return;
      }

      setQuestions(data.questions);
      setStage('quiz');
      setCurrent(0);
      setSelected({});
      setSubmitted(false);
    } catch (err) {
      setError('Koi error aavyo. Internet check karo ane fari try karo.');
    }
    setLoading(false);
  };

  const handleOption = (qIdx, opt) => {
    if (submitted) return;
    setSelected(prev => ({ ...prev, [qIdx]: opt }));
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
    } else {
      // Submit
      let s = 0;
      questions.forEach((q, i) => {
        if (selected[i] === q.correct_option) s++;
      });
      setScore(s);
      setSubmitted(true);
      setStage('result');
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setQuestions([]);
    setSelected({});
    setSubmitted(false);
    setScore(0);
    setStage('upload');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const optionLabels = { a: 'A', b: 'B', c: 'C', d: 'D' };
  const optionColors = (qIdx, opt) => {
    if (!submitted) {
      return selected[qIdx] === opt
        ? { bg: '#1e1b4b', border: '#6366f1', color: '#a5b4fc' }
        : { bg: '#0f172a', border: '#1e293b', color: '#cbd5e1' };
    }
    const q = questions[qIdx];
    if (opt === q.correct_option) return { bg: '#064e3b', border: '#10b981', color: '#6ee7b7' };
    if (selected[qIdx] === opt) return { bg: '#450a0a', border: '#ef4444', color: '#fca5a5' };
    return { bg: '#0f172a', border: '#1e293b', color: '#475569' };
  };

  // ── UPLOAD STAGE ──────────────────────────────────────────────────
  if (stage === 'upload') {
    return (
      <div style={{ minHeight: '100vh', background: '#020817', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif', padding: '20px 16px' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '14px', cursor: 'pointer', marginBottom: '20px' }}>
            ← Back
          </button>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📸</div>
            <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#e2e8f0', marginBottom: '6px' }}>
              AI Quiz — Photo / PDF
            </h1>
            <p style={{ color: '#64748b', fontSize: '13px' }}>
              Koi pan chapter, notes ya question paper upload karo — AI 10 MCQ banavi aapshe
            </p>
          </div>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${file ? '#6366f1' : '#334155'}`,
              borderRadius: '20px',
              padding: '40px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              background: file ? 'rgba(99,102,241,0.06)' : '#0f172a',
              marginBottom: '16px',
              transition: 'all 0.2s',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              style={{ display: 'none' }}
              onChange={handleFilePick}
            />

            {preview ? (
              <img src={preview} alt="preview" style={{ maxHeight: '180px', maxWidth: '100%', borderRadius: '12px', marginBottom: '12px', objectFit: 'contain' }} />
            ) : (
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>{file ? '📄' : '☁️'}</div>
            )}

            {file ? (
              <>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#a5b4fc', marginBottom: '4px' }}>{file.name}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{(file.size / 1024).toFixed(0)} KB • Change karva click karo</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>Photo ya PDF yahan drop karo</div>
                <div style={{ fontSize: '12px', color: '#475569' }}>ya click karke select karo • JPG, PNG, PDF • max 10MB</div>
              </>
            )}
          </div>

          {error && (
            <div style={{ background: '#450a0a', border: '1px solid #991b1b', borderRadius: '12px', padding: '12px 16px', color: '#fca5a5', fontSize: '13px', marginBottom: '16px' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Supported types */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '24px' }}>
            {[
              { icon: '📸', label: 'Photo', sub: 'JPG / PNG' },
              { icon: '📄', label: 'PDF', sub: 'Notes / Paper' },
              { icon: '🔬', label: 'Any Subject', sub: 'GPSC ready' },
            ].map((t, i) => (
              <div key={i} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '14px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>{t.icon}</div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#cbd5e1' }}>{t.label}</div>
                <div style={{ fontSize: '11px', color: '#475569' }}>{t.sub}</div>
              </div>
            ))}
          </div>

          <button
            onClick={generateQuiz}
            disabled={!file || loading}
            style={{
              width: '100%', padding: '18px',
              background: !file || loading ? '#1e293b' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              border: 'none', borderRadius: '16px',
              color: !file || loading ? '#475569' : '#fff',
              fontSize: '16px', fontWeight: '800',
              cursor: !file || loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {loading ? '⏳ AI Questions Generate kare che...' : '✨ Quiz Generate Karo'}
          </button>

          {loading && (
            <div style={{ textAlign: 'center', marginTop: '16px', color: '#64748b', fontSize: '13px' }}>
              Gemini AI taro file analyze kare che... 10-15 seconds
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── QUIZ STAGE ────────────────────────────────────────────────────
  if (stage === 'quiz') {
    const q = questions[current];
    const progress = ((current + 1) / questions.length) * 100;
    const answered = selected[current] !== undefined;

    return (
      <div style={{ minHeight: '100vh', background: '#020817', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif', padding: '20px 16px' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>

          {/* Progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ flex: 1, height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', borderRadius: '3px', transition: 'width 0.3s' }} />
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', whiteSpace: 'nowrap' }}>{current + 1}/{questions.length}</div>
          </div>

          {/* Question */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '20px', padding: '24px', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: '#6366f1', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Question {current + 1}
            </div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#e2e8f0', lineHeight: '1.6' }}>
              {q.question}
            </div>
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {['a', 'b', 'c', 'd'].map(opt => {
              const c = optionColors(current, opt);
              return (
                <button
                  key={opt}
                  onClick={() => handleOption(current, opt)}
                  style={{
                    width: '100%', padding: '14px 16px',
                    background: c.bg, border: `1.5px solid ${c.border}`,
                    borderRadius: '14px', cursor: submitted ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    textAlign: 'left', transition: 'all 0.15s',
                  }}
                >
                  <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: c.color, flexShrink: 0 }}>
                    {optionLabels[opt]}
                  </span>
                  <span style={{ fontSize: '14px', color: c.color, lineHeight: '1.4' }}>{q[opt]}</span>
                </button>
              );
            })}
          </div>

          {/* Next button */}
          <button
            onClick={handleNext}
            disabled={!answered}
            style={{
              width: '100%', padding: '16px',
              background: answered ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#1e293b',
              border: 'none', borderRadius: '14px',
              color: answered ? '#fff' : '#475569',
              fontSize: '15px', fontWeight: '800',
              cursor: answered ? 'pointer' : 'not-allowed',
            }}
          >
            {current < questions.length - 1 ? 'Next Question →' : 'Result Juo →'}
          </button>
        </div>
      </div>
    );
  }

  // ── RESULT STAGE ──────────────────────────────────────────────────
  if (stage === 'result') {
    const pct = Math.round((score / questions.length) * 100);
    const grade = pct >= 80 ? { label: 'Excellent! 🏆', color: '#10b981', bg: '#064e3b' }
      : pct >= 60 ? { label: 'Good Job! 👍', color: '#3b82f6', bg: '#1e3a5f' }
      : pct >= 40 ? { label: 'Keep Trying 📚', color: '#f59e0b', bg: '#431407' }
      : { label: 'Fari Practice Karo 💪', color: '#ef4444', bg: '#450a0a' };

    return (
      <div style={{ minHeight: '100vh', background: '#020817', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif', padding: '20px 16px' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>

          {/* Score card */}
          <div style={{ background: grade.bg, border: `1px solid ${grade.color}`, borderRadius: '24px', padding: '32px', textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '56px', fontWeight: '900', color: grade.color, marginBottom: '8px' }}>{pct}%</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#e2e8f0', marginBottom: '4px' }}>{grade.label}</div>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>{score} / {questions.length} sawala saha</div>
          </div>

          {/* Review all questions */}
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#64748b', marginBottom: '12px' }}>📋 Review:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {questions.map((q, i) => {
              const correct = selected[i] === q.correct_option;
              return (
                <div key={i} style={{ background: '#0f172a', border: `1px solid ${correct ? '#10b981' : '#991b1b'}`, borderRadius: '16px', padding: '16px' }}>
                  <div style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '700', marginBottom: '10px', lineHeight: '1.5' }}>
                    {i + 1}. {q.question}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', background: correct ? '#064e3b' : '#450a0a', color: correct ? '#6ee7b7' : '#fca5a5', borderRadius: '8px', padding: '3px 10px' }}>
                      Taro: {selected[i] ? q[selected[i]] : 'Skip'}
                    </span>
                    {!correct && (
                      <span style={{ fontSize: '12px', background: '#064e3b', color: '#6ee7b7', borderRadius: '8px', padding: '3px 10px' }}>
                        Sahi: {q[q.correct_option]}
                      </span>
                    )}
                  </div>
                  {q.explanation && (
                    <div style={{ fontSize: '12px', color: '#64748b', background: '#0a0f1e', borderRadius: '8px', padding: '8px 10px', lineHeight: '1.6' }}>
                      💡 {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={reset}
              style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: '14px', color: '#fff', fontSize: '15px', fontWeight: '800', cursor: 'pointer' }}
            >
              📸 Navi File Upload Karo
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              style={{ width: '100%', padding: '16px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', color: '#94a3b8', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}
            >
              Dashboard par Jao
            </button>
          </div>
        </div>
      </div>
    );
  }
}