'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

const subjects = [
  { id: 'history', name: 'History', icon: '🏛️', color: '#f59e0b', topics: [
    { id: '1', title: 'Ancient India', chapters: 12, completed: 4 },
    { id: '2', title: 'Medieval India', chapters: 10, completed: 2 },
    { id: '3', title: 'Modern India', chapters: 15, completed: 7 },
    { id: '4', title: 'World History', chapters: 8, completed: 0 },
  ]},
  { id: 'polity', name: 'Polity', icon: '⚖️', color: '#6366f1', topics: [
    { id: '5', title: 'Constitution', chapters: 14, completed: 5 },
    { id: '6', title: 'Parliament', chapters: 8, completed: 3 },
    { id: '7', title: 'Judiciary', chapters: 6, completed: 6 },
    { id: '8', title: 'Local Governance', chapters: 5, completed: 0 },
  ]},
  { id: 'geography', name: 'Geography', icon: '🌍', color: '#10b981', topics: [
    { id: '9', title: 'Physical Geography', chapters: 10, completed: 2 },
    { id: '10', title: 'Indian Geography', chapters: 12, completed: 4 },
    { id: '11', title: 'World Geography', chapters: 8, completed: 1 },
    { id: '12', title: 'Environment', chapters: 7, completed: 0 },
  ]},
  { id: 'economy', name: 'Economy', icon: '💹', color: '#ec4899', topics: [
    { id: '13', title: 'Basics of Economy', chapters: 8, completed: 3 },
    { id: '14', title: 'Indian Economy', chapters: 11, completed: 1 },
    { id: '15', title: 'Budget & Finance', chapters: 6, completed: 0 },
  ]},
  { id: 'science', name: 'Science', icon: '🔬', color: '#14b8a6', topics: [
    { id: '16', title: 'Physics', chapters: 10, completed: 4 },
    { id: '17', title: 'Chemistry', chapters: 9, completed: 2 },
    { id: '18', title: 'Biology', chapters: 11, completed: 5 },
  ]},
  { id: 'maths', name: 'Maths', icon: '➕', color: '#8b5cf6', topics: [
    { id: '19', title: 'Number System', chapters: 6, completed: 6 },
    { id: '20', title: 'Algebra', chapters: 8, completed: 3 },
    { id: '21', title: 'Geometry', chapters: 7, completed: 1 },
    { id: '22', title: 'Data Interpretation', chapters: 5, completed: 0 },
  ]},
];

const tabConfig = [
  { key: 'notes', label: 'Notes', icon: '📖', color: '#6366f1' },
  { key: 'mind_maps', label: 'Mind Maps', icon: '🧠', color: '#8b5cf6' },
  { key: 'previous_year', label: 'Previous Year', icon: '📊', color: '#f59e0b' },
  { key: 'practice_set', label: 'Practice Set', icon: '📝', color: '#10b981' },
];

export default function MarketplacePage() {
  const router = useRouter();
  const [activeSubject, setActiveSubject] = useState('history');
  const [activeTopic, setActiveTopic] = useState(null);
  const [activeTab, setActiveTab] = useState('notes');
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const currentSubject = subjects.find(s => s.id === activeSubject);
  const filteredTopics = currentSubject?.topics.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const totalChapters = subjects.reduce((a, s) => a + s.topics.reduce((b, t) => b + t.chapters, 0), 0);
  const completedChapters = subjects.reduce((a, s) => a + s.topics.reduce((b, t) => b + t.completed, 0), 0);
  const overallPct = Math.round((completedChapters / totalChapters) * 100);

  useEffect(() => {
    if (activeTopic) fetchMaterials();
  }, [activeTopic, activeTab]);

  const fetchMaterials = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('study_materials')
      .select('*')
      .eq('subject', activeSubject)
      .eq('topic_id', activeTopic.id)
      .eq('material_type', activeTab)
      .order('created_at', { ascending: false });
    setMaterials(data || []);
    setLoading(false);
  };

  const activeTabConfig = tabConfig.find(t => t.key === activeTab);

  // Topic detail view
  if (activeTopic) {
    return (
      <div style={{ minHeight: '100vh', background: '#f0f4ff', fontFamily: 'Inter, system-ui', paddingBottom: '90px' }}>
        <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', padding: '20px 16px', color: 'white' }}>
          <button onClick={() => setActiveTopic(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '10px', padding: '6px 14px', color: 'white', fontSize: '13px', cursor: 'pointer', marginBottom: '12px' }}>
            Back
          </button>
          <div style={{ fontSize: '20px', fontWeight: '800' }}>{activeTopic.title}</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '4px', textTransform: 'capitalize' }}>{activeSubject} • {activeTopic.chapters} chapters</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', padding: '16px' }}>
          {tabConfig.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              background: activeTab === tab.key ? tab.color : 'white',
              color: activeTab === tab.key ? 'white' : '#475569',
              border: 'none', borderRadius: '14px', padding: '12px 4px',
              textAlign: 'center', cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.2s',
            }}>
              <div style={{ fontSize: '18px', marginBottom: '4px' }}>{tab.icon}</div>
              <div style={{ fontSize: '10px', fontWeight: '700' }}>{tab.label}</div>
            </button>
          ))}
        </div>

        <div style={{ padding: '0 16px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading...</div>
          ) : materials.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '20px', padding: '40px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>{activeTabConfig?.icon}</div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', marginBottom: '6px' }}>
                {activeTabConfig?.label} upload nathi thaya
              </div>
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>Admin panel thi PDF upload karo</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {materials.map((mat, i) => (
                <div key={i} style={{ background: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '48px', height: '48px', background: activeTabConfig?.color + '15', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>PDF</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{mat.title}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{new Date(mat.created_at).toLocaleDateString('en-IN')}</div>
                  </div>
                  <a href={mat.file_url} target="_blank" rel="noreferrer" style={{ background: activeTabConfig?.color, color: 'white', border: 'none', borderRadius: '10px', padding: '8px 14px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', textDecoration: 'none' }}>
                    Open
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main subject list view
  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', fontFamily: 'Inter, system-ui', paddingBottom: '90px' }}>
      <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', padding: '20px 16px 24px', color: 'white' }}>
        <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '4px' }}>Study Materials</div>
        <div style={{ fontSize: '22px', fontWeight: '800', marginBottom: '16px' }}>Tamara Subjects</div>
        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '14px', padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600' }}>Overall Progress</span>
            <span style={{ fontSize: '13px', fontWeight: '800' }}>{overallPct}%</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '6px', height: '8px' }}>
            <div style={{ width: overallPct + '%', background: 'white', height: '100%', borderRadius: '6px' }} />
          </div>
          <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '6px' }}>{completedChapters} / {totalChapters} chapters complete</div>
        </div>
      </div>

      <div style={{ padding: '16px', maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
          {tabConfig.map((m, i) => (
            <button key={i} style={{ background: 'white', border: 'none', borderRadius: '14px', padding: '12px 6px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '22px', marginBottom: '4px' }}>{m.icon}</div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>{m.label}</div>
            </button>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: '14px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <span>Search</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Topic search karo..." style={{ border: 'none', outline: 'none', flex: 1, fontSize: '14px', color: '#1e293b', background: 'transparent' }} />
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '16px', scrollbarWidth: 'none' }}>
          {subjects.map(s => (
            <button key={s.id} onClick={() => setActiveSubject(s.id)} style={{
              background: activeSubject === s.id ? s.color : 'white',
              color: activeSubject === s.id ? 'white' : '#475569',
              border: 'none', borderRadius: '20px', padding: '7px 14px',
              fontSize: '12px', fontWeight: '700', cursor: 'pointer',
              whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              {s.name}
            </button>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ background: currentSubject?.color + '15', padding: '14px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>{currentSubject?.icon}</span>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b' }}>{currentSubject?.name}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>{currentSubject?.topics.length} topics</div>
            </div>
          </div>

          {filteredTopics.map((topic, i) => {
            const pct = Math.round((topic.completed / topic.chapters) * 100);
            return (
              <div key={topic.id} onClick={() => { setActiveTopic(topic); setActiveTab('notes'); }}
                style={{ padding: '14px 16px', borderBottom: i < filteredTopics.length - 1 ? '1px solid #f8fafc' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ position: 'relative', width: '44px', height: '44px', flexShrink: 0 }}>
                  <svg width="44" height="44" viewBox="0 0 44 44">
                    <circle cx="22" cy="22" r="18" fill="none" stroke="#f1f5f9" strokeWidth="4"/>
                    <circle cx="22" cy="22" r="18" fill="none" stroke={currentSubject?.color} strokeWidth="4"
                      strokeDasharray={String(2 * Math.PI * 18)}
                      strokeDashoffset={String(2 * Math.PI * 18 * (1 - pct / 100))}
                      strokeLinecap="round" transform="rotate(-90 22 22)"/>
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800', color: '#475569' }}>{pct}%</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '3px' }}>{topic.title}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>{topic.completed}/{topic.chapters} chapters done</div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={e => { e.stopPropagation(); }} style={{ background: '#f0f4ff', border: 'none', borderRadius: '8px', padding: '6px 10px', fontSize: '11px', fontWeight: '700', color: '#6366f1', cursor: 'pointer' }}>Flashcard</button>
                  <button onClick={e => { e.stopPropagation(); }} style={{ background: currentSubject?.color + '15', border: 'none', borderRadius: '8px', padding: '6px 10px', fontSize: '11px', fontWeight: '700', color: currentSubject?.color, cursor: 'pointer' }}>Quiz</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}