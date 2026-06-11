'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AnalyticsPage() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ totalPlayed: 0, avgScore: 0 });
  const [chartData, setChartData] = useState([]);
  const [weakSubjects, setWeakSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data } = await supabase
        .from('quiz_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (data && data.length > 0) {
        setHistory([...data].reverse());

        const total = data.length;
        const sum = data.reduce((acc, curr) => acc + ((curr.score / curr.total) * 100), 0);
        setStats({
          totalPlayed: total,
          avgScore: (sum / total).toFixed(1)
        });

        const formattedData = data.map((item, index) => ({
          name: `Test ${index + 1}`,
          score: Math.round((item.score / item.total) * 100),
        }));
        setChartData(formattedData);

        // Weakness analytics — subject wise avg score
        const subMap = {};
        data.forEach(item => {
          const sub = item.subject_name || 'other';
          if (!subMap[sub]) subMap[sub] = { total: 0, correct: 0, count: 0 };
          subMap[sub].correct += item.score;
          subMap[sub].total += item.total;
          subMap[sub].count += 1;
        });
        const subList = Object.entries(subMap).map(([name, v]) => ({
          name,
          avg: Math.round((v.correct / v.total) * 100),
          attempts: v.count,
        })).sort((a, b) => a.avg - b.avg); // weakest first
        setWeakSubjects(subList);
        setChartData([
          { name: 'Test 1', score: 40 },
          { name: 'Test 2', score: 60 },
          { name: 'Test 3', score: 55 },
          { name: 'Test 4', score: 75 },
          { name: 'Test 5', score: 85 },
        ]);
        setStats({ totalPlayed: 0, avgScore: '0' });
      }
      setLoading(false);
    };

    fetchAnalytics();
  }, [router]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '20px', fontWeight: '700', color: '#6b7280' }}>⏳ લોડ થઈ રહ્યું છે...</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'sans-serif', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        <button onClick={() => router.push('/')}
          style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          ← Dashboard
        </button>

        <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', marginBottom: '8px' }}>
          📊 Progress Analytics
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '30px' }}>તમારી અત્યાર સુધીની ક્વિઝ પ્રગતિનો અહેવાલ</p>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          <div style={{ background: 'white', border: '2px solid #e2e8f0', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
            <span style={{ fontSize: '24px' }}>📝</span>
            <div style={{ color: '#6b7280', fontSize: '14px', fontWeight: '600', marginTop: '5px' }}>Total Played</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', marginTop: '5px' }}>
              {stats.totalPlayed}
            </div>
          </div>
          <div style={{ background: 'white', border: '2px solid #e2e8f0', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
            <span style={{ fontSize: '24px' }}>🎯</span>
            <div style={{ color: '#6b7280', fontSize: '14px', fontWeight: '600', marginTop: '5px' }}>Average Score</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#2563eb', marginTop: '5px' }}>
              {stats.avgScore}%
            </div>
          </div>
        </div>

        {/* Chart */}
        <div style={{ background: 'white', border: '2px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '20px' }}>
            📈 પરફોર્મન્સ ટ્રેન્ડ
            {stats.totalPlayed === 0 && (
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500', marginLeft: '10px' }}>
                (Demo data — quiz આપ્યા પછી real data આવશે)
              </span>
            )}
          </h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} domain={[0, 100]} unit="%" />
                <Tooltip formatter={(val) => [`${val}%`, 'Score']} />
                <Area type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weakness Analytics */}
        {weakSubjects.length > 0 && (
          <div style={{ background: 'white', border: '2px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '30px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>
              🎯 Weakness Analytics
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px' }}>
              નીચેના વિષયોમાં સૌથી ઓછો સ્કોર — વધારે practice કરો
            </p>
            {weakSubjects.map((s, i) => {
              const color = s.avg < 40 ? '#ef4444' : s.avg < 60 ? '#f59e0b' : '#10b981';
              const label = s.avg < 40 ? '🔴 નબળું' : s.avg < 60 ? '🟡 સુધારો' : '🟢 સારું';
              return (
                <div key={s.name} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <span style={{ fontWeight: '700', fontSize: '14px', color: '#334155' }}>
                      {i + 1}. {s.name}
                    </span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>{s.attempts} attempts</span>
                      <span style={{ fontSize: '12px', fontWeight: '700', color }}>{label}</span>
                      <span style={{ fontSize: '14px', fontWeight: '800', color }}>{s.avg}%</span>
                    </div>
                  </div>
                  <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px' }}>
                    <div style={{ height: '100%', width: `${s.avg}%`, background: color, borderRadius: '4px', transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quiz History */}
        <div style={{ background: 'white', border: '2px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '16px' }}>
            📜 Quiz History
          </h3>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎯</div>
              <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                હજી સુધી કોઈ ટેસ્ટ આપ્યો નથી.<br />
                Quiz આપો અને history અહીં દેખાશે!
              </p>
              <button onClick={() => router.push('/')}
                style={{ marginTop: '16px', padding: '10px 24px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>
                🚀 Quiz શરૂ કરો
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {history.map((item, idx) => {
                const pct = Math.round((item.score / item.total) * 100);
                return (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <div style={{ fontWeight: '700', color: '#334155', fontSize: '14px' }}>
                        {item.subject_name || 'Quiz'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                        {new Date(item.created_at).toLocaleDateString('gu-IN')}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ background: pct >= 60 ? '#dcfce7' : '#fee2e2', color: pct >= 60 ? '#166534' : '#dc2626', padding: '6px 14px', borderRadius: '20px', fontSize: '14px', fontWeight: '800' }}>
                        {item.score}/{item.total}
                      </div>
                      <div style={{ fontSize: '12px', color: pct >= 60 ? '#10b981' : '#ef4444', fontWeight: '700', marginTop: '3px' }}>
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
    </div>
  );
}