'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
      }
      setLoading(false);
    };
    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // આ આપણું નવું મેનુ લિસ્ટ છે જેમાં Quiz Practice પર ક્લિક કરતાં '/quiz' પેજ ખુલશે
  const cards = [
    { icon: '📝', title: 'Quiz Practice', desc: 'GPSC/UPSC questions', color: '#dbeafe', border: '#93c5fd', link: '/quiz' },
    { icon: '🏆', title: 'Mock Test', desc: 'Full exam simulation', color: '#dcfce7', border: '#86efac', link: '#' },
    { icon: '📚', title: 'Flashcards', desc: 'Quick revision cards', color: '#ede9fe', border: '#c4b5fd', link: '#' },
    { icon: '📊', title: 'Analytics', desc: 'Track your progress', color: '#fef3c7', border: '#fcd34d', link: '#' }
  ];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: 'sans-serif' }}>
        <p style={{ fontSize: '18px', color: '#6b7280' }}>⏳ Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'sans-serif', padding: '24px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', background: 'white', padding: '16px 24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>ExamBuddy 🎓</h1>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Welcome, {user?.email?.split('@')[0]}</p>
          </div>
          <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
            Logout 🚪
          </button>
        </div>

        {/* Features Grid */}
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '20px' }}>તમારો અભ્યાસ શરૂ કરો 👇</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          {cards.map((item, index) => (
            <div 
              key={index} 
              onClick={() => item.link !== '#' && router.push(item.link)}
              style={{ 
                background: 'white', 
                border: `2px solid ${item.border}`, 
                borderRadius: '16px', 
                padding: '24px', 
                cursor: item.link !== '#' ? 'pointer' : 'not-allowed', 
                transition: 'transform 0.2s, box-shadow 0.2s',
                opacity: item.link === '#' ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if(item.link !== '#') {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.box-shadow = '0 12px 20px rgba(0,0,0,0.05)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.box-shadow = 'none';
              }}
            >
              <div style={{ fontSize: '32px', background: item.color, width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', marginBottom: '16px' }}>
                {item.icon}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '750', color: '#0f172a', margin: '0 0 8px 0' }}>{item.title}</h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, lineHeight: '1.4' }}>{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}