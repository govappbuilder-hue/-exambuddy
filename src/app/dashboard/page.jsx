'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
      }
    };
    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const cards = [
    { icon: '🎓', title: 'Exam Buddy', desc: 'Prepare for exams', color: '#dbeafe', border: '#93c5fd', link: '#' },
    { icon: '📝', title: 'Quiz Practice', desc: 'Test your knowledge', color: '#dcfce7', border: '#86efac', link: '/quiz' },
    { icon: '📚', title: 'Study Material', desc: 'Notes and resources', color: '#fee2e2', border: '#fca5a5', link: '#' },
    { icon: '📊', title: 'Analytics', desc: 'Track your progress', color: '#fef3c7', border: '#fcd34d', link: '/analytics' }, // લિંક અપડેટ થઈ ગઈ
  ];

  if (!user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: 'sans-serif' }}>
      <p style={{ fontSize: '18px', color: '#6b7280' }}>⏳ Loading Dashboard...</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'sans-serif' }}>
      {/* Navbar */}
      <nav style={{ background: 'white', borderBottom: '2px solid #e2e8f0', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '28px' }}>🎓</span>
          <span style={{ fontSize: '22px', fontWeight: '800', color: '#1e3a8a', letterSpacing: '-0.5px' }}>ExamBuddy</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#475569', background: '#f1f5f9', padding: '8px 16px', borderRadius: '99px' }}>
            👋 {user.email}
          </span>
          <button onClick={handleLogout} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '10px', fontSize: '14px', fontWeight: '750', cursor: 'pointer', transition: 'background 0.2s' }}>
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ maxWidht: '1200px', margin: '0 auto', padding: '40px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>વેલકમ બેક, સ્ટુડન્ટ! ✨</h2>
        <p style={{ fontSize: '15px', color: '#6b7280', marginBottom: '40px' }}>આજે તમે શું શીખવા માંગો છો? તમારો વિકલ્પ પસંદ કરો:</p>

        {/* Dashboard Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
          {cards.map((card, index) => {
            const isHovered = hoveredCard === index;
            return (
              <div
                key={index}
                onClick={() => card.link !== '#' && router.push(card.link)}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  background: 'white',
                  border: `2px solid ${card.border}`,
                  borderRadius: '20px',
                  padding: '30px',
                  cursor: card.link !== '#' ? 'pointer' : 'default',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isHovered && card.link !== '#' ? 'translateY(-8px)' : 'none',
                  boxShadow: isHovered && card.link !== '#' ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                }}
              >
                <div style={{ background: card.color, width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '20px' }}>
                  {card.icon}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '750', color: '#0f172a', margin: '0 0 6px 0' }}>{card.title}</h3>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, lineHeight: '1.5' }}>{card.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}