'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';

const SUBJECTS = [
  { id: 'history', name: 'History', icon: '🏛️', color: '#f59e0b' },
  { id: 'constitution', name: 'Polity', icon: '⚖️', color: '#6366f1' },
  { id: 'geography', name: 'Geography', icon: '🌍', color: '#10b981' },
  { id: 'economics', name: 'Economy', icon: '💹', color: '#ec4899' },
  { id: 'science', name: 'Science', icon: '🔬', color: '#14b8a6' },
  { id: 'maths', name: 'Maths', icon: '➕', color: '#8b5cf6' },
  { id: 'gujarati', name: 'Gujarati', icon: '📜', color: '#f97316' },
  { id: 'gk', name: 'GK', icon: '🌐', color: '#06b6d4' },
  { id: 'reasoning', name: 'Reasoning', icon: '🧩', color: '#a855f7' },
  { id: 'computer', name: 'Computer', icon: '💻', color: '#0ea5e9' },
  { id: 'english', name: 'English', icon: '🔤', color: '#3b82f6' },
  { id: 'current_affairs', name: 'Current Affairs', icon: '📰', color: '#ef4444' },
  { id: 'gujarati_sahitya', name: 'Gujarati Sahitya', icon: '✍️', color: '#d97706' },
  { id: 'gujarati_vyakran', name: 'Gujarati Vyakran', icon: '📚', color: '#7c3aed' },
  { id: 'law', name: 'Law', icon: '⚖️', color: '#0891b2' },
  { id: 'gk', name: 'GK', icon: '🌐', color: '#06b6d4' },
  { id: 'heritage', name: 'Cultural Heritage', icon: '🏺', color: '#b45309' },
  { id: 'pub_ad', name: 'Public Admin', icon: '🏛️', color: '#059669' },
];

const TAB_CONFIG = [
  { key: 'notes', label: 'Notes', icon: '📖', color: '#6366f1' },
  { key: 'mind_maps', label: 'Mind Maps', icon: '🧠', color: '#8b5cf6' },
  { key: 'previous_year', label: 'Prev Year', icon: '📊', color: '#f59e0b' },
  { key: 'practice_set', label: 'Practice', icon: '📝', color: '#10b981' },
];

export default function MarketplacePage() {
  const router = useRouter();
  const { dark } = useTheme();
  const [activeSubject, setActiveSubject] = useState('history');
  const [activeTab, setActiveTab] = useState('notes');
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({});
  const [search, setSearch] = useState('');

  const bg = dark ? '#0f0f13' : '#f0f4ff';
  const cardBg = dark ? '#1a1a24' : 'white';
  const textPrimary = dark ? '#f1f5f9' : '#1e293b';
  const textSecondary = dark ? '#94a3b8' : '#64748b';
  const borderColor = dark ? '#2d3748' : '#f1f5f9';

  const currentSubject = SUBJECTS.find(s => s.id === activeSubject);

  // Load material counts per subject
  useEffect(() => {
    const loadCounts = async () => {
      const { data } = await supabase
        .from('study_materials')
        .select('subject');
      if (data) {
        const c = {};
        data.forEach(r => { c[r.subject] = (c[r.subject] || 0) + 1; });
        setCounts(c);
      }
    };
    loadCounts();
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [activeSubject, activeTab]);

  const fetchMaterials = async () => {
    setLoading(true);
    let query = supabase
      .from('study_materials')
      .select('*')
      .eq('subject', activeSubject)
      .eq('material_type', activeTab)
      .order('created_at', { ascending: false });
    if (search.trim()) query = query.ilike('title', `%${search.trim()}%`);
    const { data } = await query;
    setMaterials(data || []);
    setLoading(false);
  };

  const handleSearch = async (val) => {
    setSearch(val);
    setLoading(true);
    let query = supabase
      .from('study_materials')
      .select('*')
      .eq('subject', activeSubject)
      .eq('material_type', activeTab)
      .order('created_at', { ascending: false });
    if (val.trim()) query = query.ilike('title', `%${val.trim()}%`);
    const { data } = await query;
    setMaterials(data || []);
    setLoading(false);
  };

  const activeTabCfg = TAB_CONFIG.find(t => t.key === activeTab);
  const totalMaterials = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div style={{ minHeight: '100vh', background: bg, fontFamily: 'Inter, system-ui', paddingBottom: '90px' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', padding: '20px 16px 24px', color: 'white' }}>
        <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '4px' }}>Study Materials</div>
        <div style={{ fontSize: '22px', fontWeight: '800', marginBottom: '4px' }}>Marketplace 📚</div>
        <div style={{ fontSize: '13px', opacity: 0.8 }}>{totalMaterials} materials available</div>
      </div>

      <div style={{ padding: '16px', maxWidth: '640px', margin: '0 auto' }}>

        {/* Tab buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
          {TAB_CONFIG.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              background: activeTab === tab.key ? tab.color : cardBg,
              color: activeTab === tab.key ? 'white' : textSecondary,
              border: 'none', borderRadius: '14px', padding: '12px 4px',
              textAlign: 'center', cursor: 'pointer',
              boxShadow: dark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
              transition: 'all 0.2s',
            }}>
              <div style={{ fontSize: '18px', marginBottom: '4px' }}>{tab.icon}</div>
              <div style={{ fontSize: '10px', fontWeight: '700' }}>{tab.label}</div>
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ background: cardBg, borderRadius: '14px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', boxShadow: dark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)' }}>
          <span>🔍</span>
          <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Material search karo..."
            style={{ border: 'none', outline: 'none', flex: 1, fontSize: '14px', color: textPrimary, background: 'transparent' }} />
        </div>

        {/* Subject pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '16px', scrollbarWidth: 'none' }}>
          {SUBJECTS.map(s => (
            <button key={s.id} onClick={() => setActiveSubject(s.id)} style={{
              background: activeSubject === s.id ? s.color : cardBg,
              color: activeSubject === s.id ? 'white' : textSecondary,
              border: 'none', borderRadius: '20px', padding: '7px 14px',
              fontSize: '12px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap',
              boxShadow: dark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              {s.icon} {s.name} {counts[s.id] ? `(${counts[s.id]})` : ''}
            </button>
          ))}
        </div>

        {/* Materials list */}
        <div style={{ background: cardBg, borderRadius: '20px', overflow: 'hidden', boxShadow: dark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)' }}>
          {/* Subject header */}
          <div style={{ background: (currentSubject?.color || '#6366f1') + '20', padding: '14px 16px', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>{currentSubject?.icon}</span>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: textPrimary }}>{currentSubject?.name} — {activeTabCfg?.label}</div>
              <div style={{ fontSize: '12px', color: textSecondary }}>{materials.length} materials</div>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: textSecondary }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
              Loading...
            </div>
          ) : materials.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>{activeTabCfg?.icon}</div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: textPrimary, marginBottom: '6px' }}>
                Koi material nathi
              </div>
              <div style={{ fontSize: '13px', color: textSecondary }}>Admin panel thi PDF upload karo</div>
            </div>
          ) : (
            <div>
              {materials.map((mat, i) => (
                <div key={mat.id || i} style={{ padding: '14px 16px', borderBottom: i < materials.length - 1 ? `1px solid ${borderColor}` : 'none', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '48px', height: '48px', background: (activeTabCfg?.color || '#6366f1') + '20', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                    {activeTabCfg?.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: textPrimary, marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mat.title}</div>
                    <div style={{ fontSize: '11px', color: textSecondary }}>
                      {mat.topic && <span style={{ marginRight: '8px' }}>🏷️ {mat.topic}</span>}
                      {mat.is_free ? <span style={{ color: '#10b981', fontWeight: '700' }}>✅ Free</span> : <span style={{ color: '#f59e0b', fontWeight: '700' }}>💎 ₹{mat.price}</span>}
                    </div>
                  </div>
                  {mat.is_free ? (
                    <a href={mat.file_url} target="_blank" rel="noreferrer"
                      style={{ background: activeTabCfg?.color, color: 'white', border: 'none', borderRadius: '10px', padding: '8px 14px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                      Open
                    </a>
                  ) : (
                    <button onClick={() => router.push('/premium')}
                      style={{ background: '#f59e0b', color: 'white', border: 'none', borderRadius: '10px', padding: '8px 14px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      💎 Buy
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}