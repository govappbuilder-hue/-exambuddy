'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AnalyticsPage() {
  const router = useRouter();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) console.error(error);
      else setAttempts(data);
      setLoading(false);
    };
    fetchAnalytics();
  }, [router]);

  const totalQuizzes = attempts.length;
  const avgScore = totalQuizzes > 0 
    ? (attempts.reduce((sum, item) => sum + item.score, 0) / totalQuizzes).toFixed(1) 
    : 0;

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: 'sans-serif' }}>
      <p style={{ fontSize: '18px', color: '#6b7280' }}>⏳ Analytics load thay che...</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'sans-serif', padding: '24px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', fontSize: '14px', color: '#6b7280', cursor: 'pointer', fontWeight: '600', marginBottom: '20px' }}>← Dashboard</button>
        
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>📊 Progress Analytics</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '30px' }}>તમારી અત્યાર સુધીની ક્વિઝ પ્રગતિનો અહેવાલ</p>

        {/* Stats Cards */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '30px' }}>
          <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '16px', border: '2px solid #e2e8f0', textAlign: 'center' }}>
            <span style={{ fontSize: '28px' }}>📝</span>
            <h3 style={{ fontSize: '14px', color: '#6b7280', margin: '10px 0 4px 0' }}>Total Played</h3>
            <p style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>{totalQuizzes}</p>
          </div>
          <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '16px', border: '2px solid #e2e8f0', textAlign: 'center' }}>
            <span style={{ fontSize: '28px' }}>🎯</span>
            <h3 style={{ fontSize: '14px', color: '#6b7280', margin: '10px 0 4px 0' }}>Average Score</h3>
            <p style={{ fontSize: '24px', fontWeight: '800', color: '#2563eb', margin: 0 }}>{avgScore} / 10</p>
          </div>
        </div>

        {/* History List */}
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>📜 Quiz History</h2>
        {totalQuizzes === 0 ? (
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
            <p style={{ color: '#6b7280', margin: 0 }}>હજી સુધી તમે એક પણ ક્વિઝ નથી રમી!</p>
          </div>
        ) : (
          attempts.map((item, index) => (
            <div key={item.id} style={{ background: 'white', padding: '16px 20px', borderRadius: '12px', border: '2px solid #e2e8f0', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', textTransform: 'capitalize', color: '#0f172a' }}>{item.subject} Quiz</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>{new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}</p>
              </div>
              <div style={{ background: item.score >= 7 ? '#dcfce7' : item.score >= 4 ? '#fef3c7' : '#fee2e2', color: item.score >= 7 ? '#15803d' : item.score >= 4 ? '#b45309' : '#b91c1c', padding: '6px 14px', borderRadius: '99px', fontWeight: '800', fontSize: '15px' }}>
                {item.score} / {item.total_questions}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}