'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';

const tabConfig = [
  { key: 'notes', label: 'Notes', icon: '📖', color: '#6366f1' },
  { key: 'mind_maps', label: 'Mind Maps', icon: '🧠', color: '#8b5cf6' },
  { key: 'previous_year', label: 'Previous Year', icon: '📊', color: '#f59e0b' },
  { key: 'practice_set', label: 'Practice Set', icon: '📝', color: '#10b981' },
];

export default function TopicMaterialsPage() {
  const { subject, topicId } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('notes');
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, [activeTab, subject, topicId]);

  const fetchMaterials = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('study_materials')
      .select('*')
      .eq('subject', subject)
      .eq('topic_id', topicId)
      .eq('material_type', activeTab)
      .order('created_at', { ascending: false });

    setMaterials(data || []);
    setLoading(false);
  };

  const activeTabConfig = tabConfig.find(t => t.key === activeTab);

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', fontFamily: 'Inter, system-ui', paddingBottom: '90px' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', padding: '20px 16px', color: 'white' }}>
        <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '10px', padding: '6px 12px', color: 'white', fontSize: '13px', cursor: 'pointer', marginBottom: '12px' }}>
          ← Back
        </button>
        <div style={{ fontSize: '22px', fontWeight: '800', textTransform: 'capitalize' }}>
          {subject} Materials
        </div>
        <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '4px' }}>Topic ID: {topicId}</div>
      </div>

      {/* 4 Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', padding: '16px' }}>
        {tabConfig.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            background: activeTab === tab.key ? tab.color : 'white',
            color: activeTab === tab.key ? 'white' : '#475569',
            border: 'none', borderRadius: '14px', padding: '12px 6px',
            textAlign: 'center', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            transition: 'all 0.2s',
          }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>{tab.icon}</div>
            <div style={{ fontSize: '10px', fontWeight: '700' }}>{tab.label}</div>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '0 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading...</div>
        ) : materials.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '20px', padding: '40px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>{activeTabConfig?.icon}</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '6px' }}>
              {activeTabConfig?.label} upload nathi thaya
            </div>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>Admin panel thi PDF upload karo</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {materials.map((mat, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '48px', height: '48px', background: activeTabConfig?.color + '15', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
                  📄
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{mat.title}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{mat.file_type?.toUpperCase()} • {new Date(mat.created_at).toLocaleDateString('en-IN')}</div>
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