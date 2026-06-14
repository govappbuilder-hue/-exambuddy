'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const subjects = [
  {
    id: 'history',
    name: 'History',
    icon: '\u{1F3DB}',
    color: '#f59e0b',
    topics: [
      { id: 1, title: 'Ancient India', chapters: 12, completed: 4 },
      { id: 2, title: 'Medieval India', chapters: 10, completed: 2 },
      { id: 3, title: 'Modern India', chapters: 15, completed: 7 },
      { id: 4, title: 'World History', chapters: 8, completed: 0 },
    ],
  },
  {
    id: 'polity',
    name: 'Polity',
    icon: '\u{2696}',
    color: '#6366f1',
    topics: [
      { id: 5, title: 'Constitution', chapters: 14, completed: 5 },
      { id: 6, title: 'Parliament', chapters: 8, completed: 3 },
      { id: 7, title: 'Judiciary', chapters: 6, completed: 6 },
      { id: 8, title: 'Local Governance', chapters: 5, completed: 0 },
    ],
  },
  {
    id: 'geography',
    name: 'Geography',
    icon: '\u{1F30D}',
    color: '#10b981',
    topics: [
      { id: 9, title: 'Physical Geography', chapters: 10, completed: 2 },
      { id: 10, title: 'Indian Geography', chapters: 12, completed: 4 },
      { id: 11, title: 'World Geography', chapters: 8, completed: 1 },
      { id: 12, title: 'Environment', chapters: 7, completed: 0 },
    ],
  },
  {
    id: 'economy',
    name: 'Economy',
    icon: '\u{1F4B9}',
    color: '#ec4899',
    topics: [
      { id: 13, title: 'Basics of Economy', chapters: 8, completed: 3 },
      { id: 14, title: 'Indian Economy', chapters: 11, completed: 1 },
      { id: 15, title: 'Budget & Finance', chapters: 6, completed: 0 },
    ],
  },
  {
    id: 'science',
    name: 'Science',
    icon: '\u{1F52C}',
    color: '#14b8a6',
    topics: [
      { id: 16, title: 'Physics', chapters: 10, completed: 4 },
      { id: 17, title: 'Chemistry', chapters: 9, completed: 2 },
      { id: 18, title: 'Biology', chapters: 11, completed: 5 },
    ],
  },
  {
    id: 'maths',
    name: 'Maths',
    icon: '\u{2795}',
    color: '#8b5cf6',
    topics: [
      { id: 19, title: 'Number System', chapters: 6, completed: 6 },
      { id: 20, title: 'Algebra', chapters: 8, completed: 3 },
      { id: 21, title: 'Geometry', chapters: 7, completed: 1 },
      { id: 22, title: 'Data Interpretation', chapters: 5, completed: 0 },
    ],
  },
];

const materialTypes = [
  { icon: '\u{1F4D6}', label: 'Notes', color: '#6366f1' },
  { icon: '\u{1F9E0}', label: 'Mind Maps', color: '#8b5cf6' },
  { icon: '\u{1F4CA}', label: 'Previous Year', color: '#f59e0b' },
  { icon: '\u{1F4DD}', label: 'Practice Set', color: '#10b981' },
];

export default function StudyMaterialsPage() {
  const router = useRouter();
  const [activeSubject, setActiveSubject] = useState('history');
  const [search, setSearch] = useState('');

  const currentSubject = subjects.find(s => s.id === activeSubject);
  const filteredTopics = currentSubject?.topics.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const totalChapters = subjects.reduce((a, s) => a + s.topics.reduce((b, t) => b + t.chapters, 0), 0);
  const completedChapters = subjects.reduce((a, s) => a + s.topics.reduce((b, t) => b + t.completed, 0), 0);
  const overallPct = Math.round((completedChapters / totalChapters) * 100);

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', fontFamily: 'Inter, system-ui', paddingBottom: '90px' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', padding: '20px 16px 24px', color: 'white' }}>
        <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '4px' }}>{'\u{1F4DA}'} Study Materials</div>
        <div style={{ fontSize: '22px', fontWeight: '800', marginBottom: '16px' }}>Tamara Subjects</div>

        {/* Overall Progress */}
        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '14px', padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600' }}>Overall Progress</span>
            <span style={{ fontSize: '13px', fontWeight: '800' }}>{overallPct}%</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '6px', height: '8px' }}>
            <div style={{ width: overallPct + '%', background: 'white', height: '100%', borderRadius: '6px', transition: 'width 0.4s' }} />
          </div>
          <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '6px' }}>{completedChapters} / {totalChapters} chapters complete</div>
        </div>
      </div>

      <div style={{ padding: '16px', maxWidth: '640px', margin: '0 auto' }}>

        {/* Material Type Quick Access */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
          {materialTypes.map((m, i) => (
            <button key={i} style={{ background: 'white', border: 'none', borderRadius: '14px', padding: '12px 6px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '22px', marginBottom: '4px' }}>{m.icon}</div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>{m.label}</div>
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ background: 'white', borderRadius: '14px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <span style={{ fontSize: '16px' }}>{'\u{1F50D}'}</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Topic search karo..."
            style={{ border: 'none', outline: 'none', flex: 1, fontSize: '14px', color: '#1e293b', background: 'transparent' }}
          />
        </div>

        {/* Subject Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '16px', scrollbarWidth: 'none' }}>
          {subjects.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSubject(s.id)}
              style={{
                background: activeSubject === s.id ? s.color : 'white',
                color: activeSubject === s.id ? 'white' : '#475569',
                border: 'none',
                borderRadius: '20px',
                padding: '7px 14px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'all 0.2s',
              }}
            >
              {s.icon} {s.name}
            </button>
          ))}
        </div>

        {/* Topics List */}
        <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
          {/* Subject Header */}
          <div style={{ background: currentSubject?.color + '15', padding: '14px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>{currentSubject?.icon}</span>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b' }}>{currentSubject?.name}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>{currentSubject?.topics.length} topics</div>
            </div>
          </div>

          {/* Topic Rows */}
          {filteredTopics.map((topic, i) => {
            const pct = Math.round((topic.completed / topic.chapters) * 100);
            return (
              <div
                key={topic.id}
                onClick={() => router.push(`/study-materials/${currentSubject?.id}/${topic.id}`)}
                style={{
                  padding: '14px 16px',
                  borderBottom: i < filteredTopics.length - 1 ? '1px solid #f8fafc' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                {/* Circle progress */}
                <div style={{ position: 'relative', width: '44px', height: '44px', flexShrink: 0 }}>
                  <svg width="44" height="44" viewBox="0 0 44 44">
                    <circle cx="22" cy="22" r="18" fill="none" stroke="#f1f5f9" strokeWidth="4"/>
                    <circle
                      cx="22" cy="22" r="18"
                      fill="none"
                      stroke={currentSubject?.color}
                      strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 18}`}
                      strokeDashoffset={`${2 * Math.PI * 18 * (1 - pct / 100)}`}
                      strokeLinecap="round"
                      transform="rotate(-90 22 22)"
                    />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800', color: '#475569' }}>
                    {pct}%
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '3px' }}>{topic.title}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>{topic.completed}/{topic.chapters} chapters done</div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={e => { e.stopPropagation(); router.push(`/flashcards?topic=${topic.id}`); }}
                    style={{ background: '#f0f4ff', border: 'none', borderRadius: '8px', padding: '6px 10px', fontSize: '11px', fontWeight: '700', color: '#6366f1', cursor: 'pointer' }}
                  >
                    Flashcard
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); router.push(`/quiz?topic=${topic.id}`); }}
                    style={{ background: currentSubject?.color + '15', border: 'none', borderRadius: '8px', padding: '6px 10px', fontSize: '11px', fontWeight: '700', color: currentSubject?.color, cursor: 'pointer' }}
                  >
                    Quiz
                  </button>
                </div>
              </div>
            );
          })}

          {filteredTopics.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
              {'\u{1F50D}'} Koi topic nahi malyo
            </div>
          )}
        </div>

        {/* Recently Studied */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', marginBottom: '12px' }}>{'\u{1F552}'} Recently Studied</div>
          {[
            { title: 'Modern India', subject: 'History', time: '2 hours ago', color: '#f59e0b' },
            { title: 'Constitution', subject: 'Polity', time: 'Yesterday', color: '#6366f1' },
            { title: 'Indian Economy', subject: 'Economy', time: '2 days ago', color: '#ec4899' },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: i < 2 ? '1px solid #f8fafc' : 'none' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: r.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{r.title}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{r.subject} • {r.time}</div>
              </div>
              <button style={{ background: '#f8fafc', border: 'none', borderRadius: '8px', padding: '5px 10px', fontSize: '11px', fontWeight: '700', color: '#475569', cursor: 'pointer' }}>
                Continue
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}