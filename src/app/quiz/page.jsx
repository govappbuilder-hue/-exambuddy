'use client';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../context/ThemeContext';

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
  // New subjects
  { id: 'reasoning', icon: '🧠', name: 'તર્કશક્તિ', color: '#a855f7' },
  { id: 'gujarati_sahitya', icon: '✍️', name: 'ગુ. સાહિત્ય', color: '#f43f5e' },
  { id: 'gujarati_vyakran', icon: '📝', name: 'ગુ. વ્યાકરણ', color: '#ec4899' },
  { id: 'law', icon: '⚖️', name: 'કાયદો', color: '#0ea5e9' },
  { id: 'heritage', icon: '🏰', name: 'વારસો & સંસ્કૃતિ', color: '#d97706' },
  { id: 'pub_ad', icon: '🏛️', name: 'જાહેર વહીવટ', color: '#10b981' },
];

export default function QuizPage() {
  const router = useRouter();
  const { dark } = useTheme();

  const bg = dark ? '#0f0f13' : '#f0f4ff';
  const cardBg = dark ? '#1a1a24' : 'white';
  const textPrimary = dark ? '#f1f5f9' : '#1e293b';
  const textSecondary = dark ? '#94a3b8' : '#64748b';

  return (
    <div style={{ minHeight: '100vh', background: bg, paddingBottom: '80px', fontFamily: 'Inter, system-ui', transition: 'background 0.3s' }}>
      
      <div style={{ background: '#6366f1', padding: '20px 16px 16px', color: 'white' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 4px' }}>📝 Quiz</h1>
        <p style={{ fontSize: '13px', opacity: 0.85, margin: 0 }}>Subject select karo ane quiz shuru karo</p>
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: textSecondary, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          📚 Subject-wise Quiz
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {subjects.map((sub) => (
            <button key={sub.id} onClick={() => router.push(`/quiz/${sub.id}`)} style={{
              background: cardBg,
              border: `2px solid ${sub.color}30`,
              borderRadius: '16px', padding: '20px 12px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
              cursor: 'pointer',
              boxShadow: dark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              <div style={{ width: '52px', height: '52px', background: `${sub.color}20`, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>
                {sub.icon}
              </div>
              <span style={{ fontSize: '13px', fontWeight: '700', color: textPrimary, textAlign: 'center' }}>{sub.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
