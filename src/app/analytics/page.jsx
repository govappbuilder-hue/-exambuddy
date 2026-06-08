'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AnalyticsPage() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ totalPlayed: 0, avgScore: 0 });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // યુઝરનો ક્વિઝ હિસ્ટ્રી ડેટા લાવવા માટે (જો ટેબલ બનાવેલું હોય તો)
      const { data, error } = await supabase
        .from('quiz_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (data && data.length > 0) {
        setHistory(data.reverse());
        
        const total = data.length;
        const sum = data.reduce((acc, curr) => acc + curr.score, 0);
        setStats({
          totalPlayed: total,
          avgScore: (sum / total).toFixed(1)
        });

        // 📈 ગ્રાફ માટે ડેટા ફોર્મેટિંગ
        const formattedData = data.map((item, index) => ({
          name: `Test ${index + 1}`,
          score: item.score,
        }));
        setChartData(formattedData);
      } else {
        // જો હિસ્ટ્રી ખાલી હોય તો ડેમો ડેટા ગ્રાફ બતાવવા માટે
        setChartData([
          { name: 'Test 1', score: 4 },
          { name: 'Test 2', score: 6 },
          { name: 'Test 3', score: 5 },
          { name: 'Test 4', score: 8 },
          { name: 'Test 5', score: 9 }
        ]);
        setStats({ totalPlayed: 5, avgScore: '6.4' });
      }
    };

    fetchAnalytics();
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'sans-serif', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          ← Dashboard
        </button>

        <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          📊 Progress Analytics
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '30px' }}>તમારી અત્યાર સુધીની ક્વિઝ પ્રગતિનો અહેવાલ</p>

        {/* ⚡ સ્ટેટ્સ કાર્ડ્સ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          <div style={{ background: 'white', border: '2px solid #e2e8f0', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
            <span style={{ fontSize: '24px' }}>📝</span>
            <div style={{ color: '#6b7280', fontSize: '14px', fontWeight: '600', marginTop: '5px' }}>Total Played</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', marginTop: '5px' }}>{stats.totalPlayed}</div>
          </div>
          <div style={{ background: 'white', border: '2px solid #e2e8f0', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
            <span style={{ fontSize: '24px' }}>🎯</span>
            <div style={{ color: '#6b7280', fontSize: '14px', fontWeight: '600', marginTop: '5px' }}>Average Score</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#2563eb', marginTop: '5px' }}>{stats.avgScore} / 10</div>
          </div>
        </div>

        {/* 📈 અસલી ગ્રાફ સેક્શન */}
        <div style={{ background: 'white', border: '2px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '30px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '20px' }}>📈 પરફોર્મન્સ ટ્રેન્ડ</h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} domain={[0, 10]} />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 📜 ક્વિઝ હિસ્ટ્રી */}
        <div style={{ background: 'white', border: '2px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '16px' }}>📜 Quiz History</h3>
          {history.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>હજી સુધી કોઈ ટેસ્ટ આપી નથી ભાઈ.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {history.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <div style={{ fontWeight: '700', color: '#334155' }}>{item.subject_name || 'Quiz'}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{new Date(item.created_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ background: '#fef3c7', color: '#d97706', padding: '6px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: '750' }}>
                    {item.score} / 10
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}