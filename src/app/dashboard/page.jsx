'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
        setLoading(false);
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: 'sans-serif' }}>
      <p style={{ color: '#6b7280', fontSize: '18px' }}>⏳ Loading...</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#0f172a', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: 'white', fontSize: '22px', fontWeight: '800', margin: 0 }}>🎓 ExamBuddy</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#94a3b8', fontSize: '14px' }}>{user?.email}</span>
          <button onClick={handleLogout} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', borderRadius: '16px', padding: '28px 32px', marginBottom: '28px', color: 'white' }}>
          <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '0 0 6px 0' }}>Welcome back! 👋</h2>
          <p style={{ margin: 0, opacity: 0.8 }}>Aaje pan study karva tayar cho? Exam crack karva baaki nathi! 💪</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[
            { icon: '📝', title: 'Quiz Practice', desc: 'GPSC/UPSC questions', color: '#dbeafe', border: '#93c5fd' },
            { icon: '🏆', title: 'Mock Test', desc: 'Full exam simulation', color: '#dcfce7', border: '#86efac' },
            { icon: '📚', title: 'Flashcards', desc: 'Quick revision cards', color: '#ede9fe', border: '#c4b5fd' },
            { icon: '📊', title: 'Analytics', desc: 'Track your progress', color: '#fef3c7', border: '#fcd34d' },
          ].map((item) => (
            <div key={item.title} style={{ background: item.color, border: `2px solid ${item.border}`, borderRadius: '14px', padding: '24px', cursor: 'pointer' }}>
              <div style={{ fontSize: '34px', marginBottom: '10px' }}>{item.icon}</div>
              <div style={{ fontWeight: '700', fontSize: '16px', color: '#0f172a' }}>{item.title}</div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}