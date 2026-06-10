'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function CurrentAffairsPage() {
  const router = useRouter();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quizMode, setQuizMode] = useState(false);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchTodayNews();
  }, []);

  const fetchTodayNews = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('daily_current_affairs')
      .select('*')
      .eq('news_date', today)
      .single();
    setNews(data || null);
    setLoading(false);
  };

  const generateNews = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/cron-current-affairs');
      const data = await res.json();
      if (data.success) {
        await fetchTodayNews();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (e) {
      alert('Network error!');
    }
    setGenerating(false);
  };

  const handleAnswer = (opt) => {
    if (showResult) return;
    setSelected(opt);
    setShowResult(true);
    if (opt === news.quiz_questions[current].correct_option) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (current + 1 < news.quiz_questions.length) {
      setCurrent(c => c + 1);
      setSelected(null);
      setShowResult(false);
    } else {
      setDone(true);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📰</div>
        <p style={{ color: '#818cf8', fontWeight: '700', fontSize: '18px' }}>આજના સમાચાર લોડ થઈ રહ્યા છે...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', fontFamily: 'system-ui', color: 'white', padding: '20px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => router.push('/')}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px 14px', color: '#94a3b8', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>
            ← Back
          </button>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '900', background: 'linear-gradient(90deg, #818cf8, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            📰 આજના કરંટ અફેર્સ
          </h1>
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#475569', fontWeight: '600' }}>
            {new Date().toLocaleDateString('gu-IN')}
          </span>
        </div>

        {!news ? (
          /* No news state */
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🤖</div>
            <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'white', marginBottom: '8px' }}>
              આજના સમાચાર હજુ તૈયાર નથી
            </h2>
            <p style={{ color: '#64748b', marginBottom: '28px', lineHeight: 1.6 }}>
              AI Gemini દ્વારા આજના current affairs generate કરો - free & instant!
            </p>
            <button onClick={generateNews} disabled={generating}
              style={{ padding: '16px 32px', background: generating ? '#334155' : 'linear-gradient(135deg, #6366f1, #0ea5e9)', border: 'none', borderRadius: '14px', color: 'white', fontWeight: '800', fontSize: '16px', cursor: generating ? 'not-allowed' : 'pointer' }}>
              {generating ? '⏳ AI Generate કરી રહ્યો છે...' : '✨ આજના સમાચાર Generate કરો'}
            </button>
          </div>
        ) : !quizMode && !done ? (
          /* News view */
          <div>
            {/* News Banner */}
            <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(14,165,233,0.2))', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '20px', padding: '24px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ background: 'rgba(99,102,241,0.3)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', color: '#818cf8' }}>🔴 LIVE</span>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>AI-Generated • Today</span>
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: '900', color: 'white', margin: '0 0 16px' }}>
                📋 આજના મુખ્ય સમાચાર
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {news.bullet_points?.map((point, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '14px', borderRadius: '12px', borderLeft: '3px solid #6366f1' }}>
                    <span style={{ color: '#818cf8', fontWeight: '900', fontSize: '16px', flexShrink: 0 }}>{i + 1}.</span>
                    <p style={{ margin: 0, color: '#e2e8f0', lineHeight: 1.6, fontSize: '14px' }}>{point}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quiz CTA */}
            {news.quiz_questions?.length > 0 && (
              <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '20px', padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎯</div>
                <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'white', marginBottom: '8px' }}>
                  આ સમાચારો પર Quiz આપો!
                </h3>
                <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '14px' }}>
                  {news.quiz_questions.length} questions • Current Affairs practice
                </p>
                <button onClick={() => { setQuizMode(true); setCurrent(0); setScore(0); setSelected(null); setShowResult(false); setDone(false); }}
                  style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '14px', color: 'white', fontWeight: '800', fontSize: '16px', cursor: 'pointer' }}>
                  🚀 Quiz શરૂ કરો
                </button>
              </div>
            )}

            {/* Refresh */}
            <button onClick={generateNews} disabled={generating}
              style={{ width: '100%', marginTop: '16px', padding: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#475569', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>
              {generating ? '⏳ Refreshing...' : '🔄 નવા સમાચાર Generate કરો'}
            </button>
          </div>
        ) : !done ? (
          /* Quiz Mode */
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '8px' }}>
              <span>Question {current + 1} / {news.quiz_questions.length}</span>
              <span style={{ color: '#34d399' }}>Score: {score}</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '99px', height: '6px', marginBottom: '20px' }}>
              <div style={{ background: 'linear-gradient(90deg, #6366f1, #0ea5e9)', height: '100%', borderRadius: '99px', width: `${((current + 1) / news.quiz_questions.length) * 100}%` }} />
            </div>

            {(() => {
              const q = news.quiz_questions[current];
              return (
                <div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '24px', marginBottom: '16px' }}>
                    <p style={{ fontSize: '17px', fontWeight: '700', color: 'white', margin: 0, lineHeight: 1.6 }}>{q.question}</p>
                  </div>
                  {['a', 'b', 'c', 'd'].map(opt => {
                    const val = q[opt];
                    if (!val) return null;
                    const isSelected = selected === opt;
                    const isCorrect = opt === q.correct_option;
                    let bg = 'rgba(255,255,255,0.03)';
                    let border = 'rgba(255,255,255,0.07)';
                    let icon = null;
                    if (showResult) {
                      if (isCorrect) { bg = 'rgba(52,211,153,0.2)'; border = '#34d399'; icon = '✅'; }
                      else if (isSelected) { bg = 'rgba(248,113,113,0.2)'; border = '#f87171'; icon = '❌'; }
                    } else if (isSelected) { bg = 'rgba(99,102,241,0.2)'; border = '#6366f1'; }
                    return (
                      <button key={opt} onClick={() => handleAnswer(opt)}
                        style={{ width: '100%', marginBottom: '10px', padding: '14px 16px', borderRadius: '14px', border: `2px solid ${border}`, background: bg, cursor: showResult ? 'default' : 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: showResult && isCorrect ? '#34d399' : showResult && isSelected ? '#f87171' : 'rgba(255,255,255,0.08)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '13px', flexShrink: 0 }}>
                          {opt.toUpperCase()}
                        </span>
                        <span style={{ color: '#e2e8f0', fontSize: '15px', flex: 1 }}>{val}</span>
                        {icon && <span>{icon}</span>}
                      </button>
                    );
                  })}
                  {showResult && (
                    <button onClick={handleNext}
                      style={{ width: '100%', marginTop: '8px', padding: '14px', background: 'linear-gradient(135deg, #6366f1, #0ea5e9)', border: 'none', borderRadius: '14px', color: 'white', fontWeight: '800', fontSize: '15px', cursor: 'pointer' }}>
                      {current + 1 < news.quiz_questions.length ? 'આગળ →' : '🏁 Quiz પૂરી કરો'}
                    </button>
                  )}
                </div>
              );
            })()}
          </div>
        ) : (
          /* Result */
          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '40px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>
              {score === news.quiz_questions.length ? '🏆' : score >= news.quiz_questions.length * 0.6 ? '🎯' : '💪'}
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: '900', color: 'white', marginBottom: '8px' }}>Current Affairs Quiz Done!</h2>
            <div style={{ fontSize: '48px', fontWeight: '900', background: 'linear-gradient(90deg, #818cf8, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '16px 0' }}>
              {score}/{news.quiz_questions.length}
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={() => { setQuizMode(false); setDone(false); }}
                style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg, #6366f1, #0ea5e9)', border: 'none', borderRadius: '14px', color: 'white', fontWeight: '800', cursor: 'pointer' }}>
                📰 News જુઓ
              </button>
              <button onClick={() => router.push('/')}
                style={{ flex: 1, padding: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', color: 'white', fontWeight: '800', cursor: 'pointer' }}>
                🏠 Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}