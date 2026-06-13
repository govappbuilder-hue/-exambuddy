'use client';
import { useRouter } from 'next/navigation';

const subjects = [
  { id: 'maths', icon: '🔢', name: 'ગણિત', color: '#6366f1' },
  { id: 'constitution', icon: '📜', name: 'બંધારણ', color: '#8b5cf6' },
  { id: 'history', icon: '🏛️', name: 'ઇતિહાસ', color: '#ec4899' },
  { id: 'geography', icon: '🌍', name: 'ભૂગોળ', color: '#14b8a6' },
  { id: 'science', icon: '🔬', name: 'વિજ્ઞાન', color: '#f59e0b' },
  { id: 'gujarati', icon: '🗣️', name: 'ગુજરાતી', color: '#10b981' },
  { id: 'english', icon: '📖', name: 'English', color: '#3b82f6' },
  { id: 'current-affairs', icon: '📰', name: 'કરંટ અફેર્સ', color: '#ef4444' },
  { id: 'gk', icon: '💡', name: 'સામાન્ય જ્ઞાન', color: '#f97316' },
  { id: 'polity', icon: '🏛️', name: 'રાજ્યશાસ્ત્ર', color: '#6366f1' },
  { id: 'economics', icon: '📊', name: 'અર્થશાસ્ત્ર', color: '#84cc16' },
  { id: 'computer', icon: '💻', name: 'કોમ્પ્યુટર', color: '#06b6d4' },
];

export default function QuizPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', paddingBottom: '80px', fontFamily: 'Inter, system-ui' }}>
      {/* Header */}
      <div style={{ background: '#6366f1', padding: '20px 16px 16px', color: 'white' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 4px' }}>📝 Quiz</h1>
        <p style={{ fontSize: '13px', opacity: 0.85, margin: 0 }}>Subject select karo ane quiz shuru karo</p>
      </div>

      {/* Subject Grid */}
      <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {subjects.map((sub) => (
          <button
            key={sub.id}
            onClick={() => router.push(`/quiz/${sub.id}`)}
            style={{
              background: 'white',
              border: `2px solid ${sub.color}20`,
              borderRadius: '16px',
              padding: '20px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              transition: 'transform 0.1s',
            }}
          >
            <div style={{
              width: '52px', height: '52px',
              background: `${sub.color}15`,
              borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '26px'
            }}>
              {sub.icon}
            </div>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', textAlign: 'center' }}>
              {sub.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}