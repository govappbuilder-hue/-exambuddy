'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

const SUBJECT_NAMES = {
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
  gk: '💡 સામાન્ય જ્ઞાન',
  law: '⚖️ કાયદો',
  economics: '📈 અર્થશાસ્ત્ર',
};

export default function MyProgressPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    total: 0, avgScore: 0, bestScore: 0,
    totalQuestions: 0, streak: 0, thisWeek: 0,
  });
  const [subjectStats, setSubjectStats] = useState([]);
  const [calendarDays, setCalendarDays] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data } = await supabase
        .from('quiz_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!data || data.length === 0) { setLoading(false); return; }

      setHistory(data);

      // Overall stats
      const total = data.length;
      const avgScore = Math.round(data.reduce((a, b) => a + (b.score / b.total) * 100, 0) / total);
      const bestScore = Math.max(...data.map(d => Math.round((d.score / d.total) * 100)));
      const totalQuestions = data.reduce((a, b) => a + b.total, 0);

      // This week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const thisWeek = data.filter(d => new Date(d.created_at) > weekAgo).length;

      // Streak
      let streak = 0;
      const uniqueDates = [...new Set(data.map(d => new Date(d.created_at).toDateString()))];
      for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        if (uniqueDates.includes(d.toDateString())) streak++;
        else break;
      }

      setStats({ total, avgScore, bestScore, totalQuestions, streak, thisWeek });

      // Subject wise stats
      const subMap = {};
      data.forEach(d => {
        const key = d.subject_name || 'other';
        if (!subMap[key]) subMap[key] = { total: 0, correct: 0, count: 0 };
        subMap[key].total += d.total;
        subMap[key].correct += d.score;
        subMap[key].count++;
      });
      const subArr = Object.entries(subMap).map(([name, s]) => ({
        name,
        avg: Math.round((s.correct / s.total) * 100),
        count: s.count,
        total: s.total,
        correct: s.correct,
      })).sort((a, b) => b.avg - a.avg);
      setSubjectStats(subArr);

      // Calendar — last 30 days
      const dateMap = {};
      data.forEach(d => {
        const key = new Date(d.created_at).toDateString();
        if (!dateMap[key]) dateMap[key] = [];
        dateMap[key].push(Math.round((d.score / d.total) * 100));
      });
      const days = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toDateString();
        const scores = dateMap[key] || [];
        days.push({
          date: d.getDate(),
          day: d.toLocaleDateString('en', { weekday: 'short' }),
          active: scores.length > 0,
          avg: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
          count: scores.length,
        });
      }
      setCalendarDays(days);
      setLoading(false);
    };
    fetchData();
  }, [router]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#030712', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#38bdf8', fontSize: '20px', fontWeight: '700' }}>⏳ લોડ થઈ રહ્યું છે...</div>
    </div>
  );

  if (history.length === 0) return (
    <div style={{ minHeight: '100vh', background: '#030712', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', padding: '20px', fontFamily: 'system-ui' }}>
      <div style={{ fontSize: '64px' }}>📊</div>
      <h2 style={{ color: 'white', fontSize: '22px', fontWeight: '800', textAlign: 'center' }}>હજી કોઈ ટેસ્ટ આપ્યો નથી!</h2>
      <p style={{ color: '#64748b', textAlign: 'center', fontSize: '14px' }}>Quiz આપો અને progress અહીં દેખાશે</p>
      <button onClick={() => router.push('/')}
        style={{ padding: '14px 28px', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '15px', cursor: 'pointer' }}>
        🚀 Quiz શરૂ કરો
      </button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#030712', fontFamily: 'system-ui', color: 'white', paddingBottom: '30px' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)', padding: '20px 16px', borderBottom: '1px solid #312e81' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => router.push('/')}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '10px', padding: '8px 14px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }}>
            ← Home
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '900' }}>📊 My Progress</h1>
            <p style={{ margin: '2px 0 0', color: '#a5b4fc', fontSize: '13px' }}>
              કુલ {stats.total} ટેસ્ટ • {stats.totalQuestions} સવાલ
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px 16px' }}>

        {/* Top Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { icon: '🎯', label: 'સરેરાશ', value: `${stats.avgScore}%`, color: stats.avgScore >= 60 ? '#10b981' : '#f59e0b' },
            { icon: '🏆', label: 'બેસ્ટ', value: `${stats.bestScore}%`, color: '#f59e0b' },
            { icon: '🔥', label: 'Streak', value: `${stats.streak} દિવસ`, color: '#ef4444' },
            { icon: '📝', label: 'ટેસ્ટ', value: stats.total, color: '#3b82f6' },
            { icon: '❓', label: 'સવાલ', value: stats.totalQuestions, color: '#8b5cf6' },
            { icon: '📅', label: 'આ Week', value: stats.thisWeek, color: '#06b6d4' },
          ].map(s => (
            <div key={s.label} style={{ background: '#0f172a', borderRadius: '16px', padding: '16px', textAlign: 'center', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>{s.icon}</div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[
            { key: 'overview', label: '📈 Overview' },
            { key: 'subjects', label: '📚 Subjects' },
            { key: 'history', label: '📜 History' },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              style={{ flex: 1, padding: '11px', borderRadius: '12px', border: 'none', background: activeTab === t.key ? 'linear-gradient(135deg,#667eea,#764ba2)' : '#0f172a', color: activeTab === t.key ? 'white' : '#64748b', fontWeight: '800', cursor: 'pointer', fontSize: '13px', border: activeTab === t.key ? 'none' : '1px solid #1e293b' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            {/* Activity Calendar */}
            <div style={{ background: '#0f172a', borderRadius: '20px', padding: '20px', marginBottom: '20px', border: '1px solid #1e293b' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '800', color: '#e2e8f0' }}>
                📅 છેલ્લા 30 દિવસ
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '5px' }}>
                {calendarDays.map((day, i) => (
                  <div key={i}
                    title={day.active ? `${day.day} ${day.date}: ${day.count} tests, avg ${day.avg}%` : `${day.day} ${day.date}: no activity`}
                    style={{
                      aspectRatio: '1', borderRadius: '6px',
                      background: day.active
                        ? day.avg >= 80 ? '#065f46'
                          : day.avg >= 60 ? '#047857'
                          : day.avg >= 40 ? '#059669'
                          : '#10b981'
                        : '#1e293b',
                      border: day.active ? '1px solid #10b98140' : '1px solid #334155',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '9px', color: day.active ? '#6ee7b7' : '#475569',
                      fontWeight: '700', cursor: 'default',
                    }}>
                    {day.date}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px', justifyContent: 'flex-end' }}>
                {[
                  { color: '#1e293b', label: 'No activity' },
                  { color: '#10b981', label: '< 60%' },
                  { color: '#047857', label: '60-80%' },
                  { color: '#065f46', label: '> 80%' },
                ].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: l.color }} />
                    <span style={{ fontSize: '10px', color: '#64748b' }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Score Trend - simple bar chart */}
            <div style={{ background: '#0f172a', borderRadius: '20px', padding: '20px', border: '1px solid #1e293b' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '800', color: '#e2e8f0' }}>
                📈 છેલ્લા 10 ટેસ્ટ
              </h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '120px' }}>
                {history.slice(0, 10).reverse().map((item, i) => {
                  const pct = Math.round((item.score / item.total) * 100);
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                      <div style={{ fontSize: '9px', color: '#64748b', fontWeight: '700' }}>{pct}%</div>
                      <div style={{
                        width: '100%', borderRadius: '6px 6px 0 0',
                        height: `${pct}%`,
                        background: pct >= 80 ? 'linear-gradient(180deg,#10b981,#059669)'
                          : pct >= 60 ? 'linear-gradient(180deg,#3b82f6,#2563eb)'
                          : pct >= 40 ? 'linear-gradient(180deg,#f59e0b,#d97706)'
                          : 'linear-gradient(180deg,#ef4444,#dc2626)',
                        minHeight: '4px',
                      }} />
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                <span style={{ fontSize: '11px', color: '#475569' }}>જૂનો</span>
                <span style={{ fontSize: '11px', color: '#475569' }}>નવો</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB: SUBJECTS */}
        {activeTab === 'subjects' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {subjectStats.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                હજી data નથી
              </div>
            ) : subjectStats.map((s, i) => (
              <div key={i} style={{ background: '#0f172a', borderRadius: '16px', padding: '16px 18px', border: '1px solid #1e293b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '15px', color: '#e2e8f0' }}>{s.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      {s.count} ટેસ્ટ • {s.correct}/{s.total} સાચા
                    </div>
                  </div>
                  <div style={{
                    background: s.avg >= 80 ? '#065f46' : s.avg >= 60 ? '#1e3a5f' : s.avg >= 40 ? '#431407' : '#450a0a',
                    color: s.avg >= 80 ? '#6ee7b7' : s.avg >= 60 ? '#93c5fd' : s.avg >= 40 ? '#fdba74' : '#fca5a5',
                    padding: '6px 14px', borderRadius: '20px', fontWeight: '900', fontSize: '16px',
                  }}>
                    {s.avg}%
                  </div>
                </div>
                <div style={{ height: '8px', background: '#1e293b', borderRadius: '4px' }}>
                  <div style={{
                    height: '100%', borderRadius: '4px', transition: 'width 0.5s',
                    width: `${s.avg}%`,
                    background: s.avg >= 80 ? 'linear-gradient(90deg,#10b981,#059669)'
                      : s.avg >= 60 ? 'linear-gradient(90deg,#3b82f6,#2563eb)'
                      : s.avg >= 40 ? 'linear-gradient(90deg,#f59e0b,#d97706)'
                      : 'linear-gradient(90deg,#ef4444,#dc2626)',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#475569' }}>
                    {s.avg >= 80 ? '🏆 Excellent' : s.avg >= 60 ? '👍 Good' : s.avg >= 40 ? '📚 Average' : '💪 Needs Work'}
                  </span>
                  <span style={{ fontSize: '11px', color: '#475569' }}>
                    Rank: #{i + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: HISTORY */}
        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {history.map((item, i) => {
              const pct = Math.round((item.score / item.total) * 100);
              const date = new Date(item.created_at);
              return (
                <div key={i} style={{ background: '#0f172a', borderRadius: '14px', padding: '14px 16px', border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '700', color: '#e2e8f0', fontSize: '14px' }}>
                      {item.subject_name || 'Quiz'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569', marginTop: '3px' }}>
                      {date.toLocaleDateString('gu-IN')} • {date.toLocaleTimeString('gu-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      background: pct >= 60 ? '#064e3b' : '#450a0a',
                      color: pct >= 60 ? '#34d399' : '#f87171',
                      padding: '5px 12px', borderRadius: '20px', fontWeight: '800', fontSize: '14px',
                    }}>
                      {item.score}/{item.total}
                    </div>
                    <div style={{ fontSize: '12px', marginTop: '3px', color: pct >= 60 ? '#10b981' : '#ef4444', fontWeight: '700' }}>
                      {pct}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}