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

      <div style={{ padding: '16px' }}>

        {/* AI Quiz Generator Banner */}
        <button
          onClick={() => router.push('/ai-quiz')}
          style={{
            width: '100%', marginBottom: '20px',
            background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
            border: '2px solid #4338ca',
            borderRadius: '18px', padding: '18px 20px',
            display: 'flex', alignItems: 'center', gap: '16px',
            cursor: 'pointer', textAlign: 'left',
          }}>
          <div style={{ width: '52px', height: '52px', background: 'rgba(99,102,241,0.3)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', flexShrink: 0 }}>
            🤖
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#c7d2fe', marginBottom: '4px' }}>
              AI Quiz Generator
            </div>
            <div style={{ fontSize: '12px', color: '#818cf8' }}>
              PDF or Photo upload karo → AI questions banavshe
            </div>
          </div>
          <div style={{ color: '#6366f1', fontSize: '20px' }}>›</div>
        </button>

        {/* Section Label */}
        <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          📚 Subject-wise Quiz
        </div>

        {/* Subject Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
              }}>
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
    </div>
  );
}