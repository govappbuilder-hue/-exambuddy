'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('subjects'); // subjects, current_affairs, materials

  const subjects = [
    { id: 'maths', name: 'ગણિત', icon: '🔢', color: '#eff6ff', border: '#bfdbfe' },
    { id: 'constitution', name: 'ભારતનું બંધારણ', icon: '📜', color: '#fef2f2', border: '#fecaca' },
    { id: 'history', name: 'ગુજરાતનો ઇતિહાસ', icon: '🛡️', color: '#fffbeb', border: '#fde68a' },
    { id: 'geography', name: 'ભૂગોળ', icon: '🌍', color: '#f5f3ff', border: '#ddd6fe' },
    { id: 'science', name: 'સામાન્ય વિજ્ઞાન', icon: '🧪', color: '#ecfeff', border: '#a5f3fc' },
    { id: 'guj_sahitya', name: 'ગુજરાતી સાહિત્ય', icon: '✍️', color: '#fff1f2', border: '#fecdd3' },
    { id: 'computer', name: 'કમ્પ્યુટર જ્ઞાન', icon: '💻', color: '#f8fafc', border: '#e2e8f0' },
    { id: 'reasoning', name: 'રીઝનિંગ', icon: '🧩', color: '#fdf4ff', border: '#f5d0fe' },
    { id: 'english', name: 'English Grammar', icon: '🔤', color: '#f0f9ff', border: '#bae6fd' },
    { id: 'guj_vyakaran', name: 'ગુજરાતી વ્યાકરણ', icon: '🗣️', color: '#fafaf9', border: '#e7e5e4' },
    { id: 'panchayati_raj', name: 'પંચાયતી રાજ', icon: '🏛️', color: '#fff7ed', border: '#ffedd5' },
    { id: 'kaydo', name: 'કાયદો (Law)', icon: '⚖️', color: '#fef3c7', border: '#fcd34d' },
    { id: 'jaher_vahivat', name: 'જાહેર વહીવટ', icon: '👔', color: '#ecfdf5', border: '#a7f3d0' },
    { id: 'art_culture', name: 'સાંસ્કૃતિક વારસો', icon: '🎨', color: '#fff5f5', border: '#fed7d7' },
    { id: 'general_knowledge', name: 'સામાન્ય જ્ઞાન (GK)', icon: '💡', color: '#f0fdfa', border: '#99f6e4' }
  ];

  // 📰 વીકલી અને ડેઇલી કરંટ અફેર્સ ટાઈમલાઈન ડેટા
  const timelines = [
    { id: 'daily', title: 'આજનો ડેઇલી AI ક્લાસ', desc: 'રોજ સવારના તાજા સમાચાર વીડિયો અને ટેસ્ટ', icon: '🎙️', route: '/current-affairs' },
    { id: 'weekly-1', title: 'જૂન વીક ૧ કરંટ અફેર્સ', desc: 'આખા અઠવાડિયાનો નીચોડ અને સ્પેશિયલ ૧૦૦ MCQ', icon: '📅', route: '/quiz?subject=current_affairs_w1' },
    { id: 'weekly-2', title: 'મે વીક ૪ કરંટ અફેર્સ', desc: 'મે મહિનાના છેલ્લા અઠવાડિયાની મોક ટેસ્ટ', icon: '📆', route: '/quiz?subject=current_affairs_w4' }
  ];

  // 📚 ICE રાજકોટ અને સ્પેશિયલ PDF મટીરિયલ્સ ડેટા
  const materials = [
    { title: 'ICE Magic કરંટ અફેર્સ વીકલી PDF', size: '4.2 MB', date: 'જૂન ૨૦૨૬', link: '#' },
    { title: 'ગુજરાતનો સંપૂર્ણ ઇતિહાસ બુકલેટ', size: '12.5 MB', date: 'લેટેસ્ટ એડિશન', link: '#' },
    { title: 'બંધારણના મોસ્ટ ઈમ્પોર્ટન્ટ વન-લાઇનર', size: '2.8 MB', date: '૨૦૨૬ સ્પેશિયલ', link: '#' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'sans-serif', padding: '30px 15px' }}>
      
      {/* 🔝 પ્રીમિયમ નેવિગેશન બાર */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1100px', margin: '0 auto 40px auto', background: 'white', padding: '15px 25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
        <h2 onClick={() => router.push('/')} style={{ fontSize: '22px', fontWeight: '900', color: '#2563eb', cursor: 'pointer' }}>🎓 ExamBuddy</h2>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={() => router.push('/analytics')} style={{ padding: '8px 16px', borderRadius: '10px', background: '#f1f5f9', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>📊 મારો પ્રોગ્રેસ</button>
        </div>
      </div>

      {/* 🎯 ટેબ્સ કંટ્રોલ (સેક્શન બદલવા માટે) */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '40px' }}>
        <button onClick={() => setActiveTab('subjects')} style={{ padding: '12px 24px', borderRadius: '14px', border: 'none', fontWeight: '800', cursor: 'pointer', background: activeTab === 'subjects' ? '#2563eb' : 'white', color: activeTab === 'subjects' ? 'white' : '#6b7280', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>📚 વિષયો ({subjects.length})</button>
        <button onClick={() => setActiveTab('current_affairs')} style={{ padding: '12px 24px', borderRadius: '14px', border: 'none', fontWeight: '800', cursor: 'pointer', background: activeTab === 'current_affairs' ? '#2563eb' : 'white', color: activeTab === 'current_affairs' ? 'white' : '#6b7280', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>📰 કરંટ અફેર્સ ટાઈમલાઈન</button>
        <button onClick={() => setActiveTab('materials')} style={{ padding: '12px 24px', borderRadius: '14px', border: 'none', fontWeight: '800', cursor: 'pointer', background: activeTab === 'materials' ? '#2563eb' : 'white', color: activeTab === 'materials' ? 'white' : '#6b7280', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>📥 Study Material (PDF)</button>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* 1️⃣ વિષયોની ગ્રીડ */}
        {activeTab === 'subjects' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
            {subjects.map((sub) => (
              <div key={sub.id} onClick={() => router.push(`/quiz?subject=${sub.id}`)} style={{ background: sub.color, border: `2px solid ${sub.border}`, borderRadius: '20px', padding: '24px', cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{sub.icon}</div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>{sub.name}</h3>
                <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: '700' }}>ટેસ્ટ આપો ➔</span>
              </div>
            ))}
          </div>
        )}

        {/* 2️⃣ કરંટ અફેર્સ ટાઈમલાઈન */}
        {activeTab === 'current_affairs' && (
          <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {timelines.map((line) => (
              <div key={line.id} onClick={() => router.push(line.route)} style={{ background: 'white', border: '2px solid #e2e8f0', borderRadius: '20px', padding: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ fontSize: '36px', background: '#f1f5f9', padding: '12px', borderRadius: '16px' }}>{line.icon}</div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{line.title}</h3>
                  <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>{line.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3️⃣ સ્ટડી મટીરિયલ ડાઉનલોડ */}
        {activeTab === 'materials' && (
          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ background: '#f0fdf4', border: '1px dashed #22c55e', padding: '15px', borderRadius: '15px', color: '#16a34a', fontWeight: '700', fontSize: '14px', textAlign: 'center', marginBottom: '10px' }}>
              📥 ICE રાજકોટ ઓફિશિયલ ચેનલ ડેટા અપડેટ દર અઠવાડિયે કરવામાં આવે છે ભાઈ!
            </div>
            {materials.map((mat, index) => (
              <div key={index} style={{ background: 'white', border: '2px solid #e2e8f0', borderRadius: '20px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>📄 {mat.title}</h4>
                  <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>સાઇઝ: {mat.size} • અપડેટ: {mat.date}</p>
                </div>
                <button onClick={() => alert('PDF ડાઉનલોડ લિંક ટૂંક સમયમાં સેટ થશે!')} style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>ડાઉનલોડ ⬇️</button>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* 🤫 સિક્રેટ એડમિન કંટ્રોલ */}
      <div style={{ marginTop: '8px', textAlign: 'center' }}><span onClick={() => router.push('/admin')} style={{ color: '#cbd5e1', cursor: 'pointer', fontSize: '11px' }}>• 🧭 System Controls</span></div>
    </div>
  );
}