'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';

const SUBJECT_META = {
  history:          { name: 'History',          icon: '🏛️', color: '#f59e0b' },
  constitution:     { name: 'Polity',            icon: '⚖️', color: '#6366f1' },
  geography:        { name: 'Geography',         icon: '🌍', color: '#10b981' },
  economics:        { name: 'Economy',           icon: '💹', color: '#ec4899' },
  science:          { name: 'Science',           icon: '🔬', color: '#14b8a6' },
  maths:            { name: 'Maths',             icon: '➕', color: '#8b5cf6' },
  gujarati:         { name: 'Gujarati',          icon: '📜', color: '#f97316' },
  gk:               { name: 'GK',                icon: '🌐', color: '#06b6d4' },
  reasoning:        { name: 'Reasoning',         icon: '🧩', color: '#a855f7' },
  computer:         { name: 'Computer',          icon: '💻', color: '#0ea5e9' },
  english:          { name: 'English',           icon: '🔤', color: '#3b82f6' },
  current_affairs:  { name: 'Current Affairs',   icon: '📰', color: '#ef4444' },
  gujarati_sahitya: { name: 'Gujarati Sahitya',  icon: '✍️', color: '#d97706' },
  gujarati_vyakran: { name: 'Gujarati Vyakran',  icon: '📚', color: '#7c3aed' },
  law:              { name: 'Law',               icon: '⚖️', color: '#0891b2' },
  heritage:         { name: 'Cultural Heritage', icon: '🏺', color: '#b45309' },
  pub_ad:           { name: 'Public Admin',      icon: '🏛️', color: '#059669' },
};

const TYPE_META = {
  notes:         { label: 'Notes',     icon: '📖', color: '#6366f1' },
  mind_maps:     { label: 'Mind Map',  icon: '🧠', color: '#8b5cf6' },
  previous_year: { label: 'Prev Year', icon: '📊', color: '#f59e0b' },
  practice_set:  { label: 'Practice',  icon: '📝', color: '#10b981' },
};

const FILTERS = [
  { key: 'all',           label: 'All' },
  { key: 'free',          label: '🆓 Free' },
  { key: 'paid',          label: '💎 Paid' },
  { key: 'notes',         label: '📖 Notes' },
  { key: 'mind_maps',     label: '🧠 Mind Maps' },
  { key: 'previous_year', label: '📊 Prev Year' },
  { key: 'practice_set',  label: '✏️ Practice' },
];

// Marketplace access check — Premium OR Marketplace plan
function hasMarketplaceAccess(plan) {
  return ['marketplace', 'monthly', 'halfyearly', 'yearly'].includes(plan);
}

export default function MarketplacePage() {
  const router = useRouter();
  const { dark } = useTheme();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [diamonds, setDiamonds] = useState(0);
  const [userId, setUserId] = useState(null);
  const [unlocked, setUnlocked] = useState(new Set());
  const [unlocking, setUnlocking] = useState(null);
  const [toast, setToast] = useState(null);
  const [marketplacePlan, setMarketplacePlan] = useState(false); // has paid marketplace access

  const bg          = dark ? '#0f0f13' : '#f0f4ff';
  const cardBg      = dark ? '#1a1a24' : 'white';
  const textPrimary = dark ? '#f1f5f9' : '#1e293b';
  const textSec     = dark ? '#94a3b8' : '#64748b';

  useEffect(() => {
  fetchAll();
  loadUser();
}, []);

// Tab switch પછી પાછા આવો ત્યારે re-fetch
useEffect(() => {
  const handleVisibility = () => {
    if (document.visibilityState === 'visible') {
      loadUser();
    }
  };
  document.addEventListener('visibilitychange', handleVisibility);
  return () => document.removeEventListener('visibilitychange', handleVisibility);
}, []);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);

      // Diamond balance
      const { data: dData } = await supabase
        .from('user_diamonds')
        .select('diamonds')
        .eq('user_id', user.id)
        .single();
      setDiamonds(dData?.diamonds || 0);

      // Unlocked materials
      const { data: unlockedData } = await supabase
        .from('unlocked_materials')
        .select('material_id')
        .eq('user_id', user.id);
      if (unlockedData) setUnlocked(new Set(unlockedData.map(u => u.material_id)));

      // Check premium/marketplace subscription
      const { data: sub } = await supabase
        .from('user_premium')
        .select('plan, expires_at, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (sub && new Date(sub.expires_at) > new Date() && hasMarketplaceAccess(sub.plan)) {
        setMarketplacePlan(true);
      }
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('study_materials')
      .select('*')
      .order('created_at', { ascending: false });
    setMaterials(data || []);
    setLoading(false);
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUnlockWithDiamonds = async (mat) => {
    if (!userId) { showToast('Pehla login karo!', 'error'); return; }
    const cost = mat.price || 30;
    if (diamonds < cost) {
      showToast(`Diamonds ochha che! Tamara: 💎${diamonds}, Jaruri: 💎${cost}`, 'error');
      return;
    }
    setUnlocking(mat.id);
    try {
      await supabase.from('user_diamonds').upsert({ user_id: userId, diamonds: diamonds - cost });
      await supabase.from('unlocked_materials').insert({ user_id: userId, material_id: mat.id });
      setDiamonds(d => d - cost);
      setUnlocked(u => new Set(u).add(mat.id));
      showToast(`✅ Unlock thayo! -💎${cost} diamonds`);
    } catch (e) {
      showToast('Error aayo, try karo', 'error');
    }
    setUnlocking(null);
  };

  const filtered = materials.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      m.title?.toLowerCase().includes(q) ||
      m.topic?.toLowerCase().includes(q) ||
      (SUBJECT_META[m.subject]?.name || '').toLowerCase().includes(q);
    let matchFilter = true;
    if (filter === 'free') matchFilter = m.is_free;
    else if (filter === 'paid') matchFilter = !m.is_free;
    else if (['notes','mind_maps','previous_year','practice_set'].includes(filter))
      matchFilter = m.material_type === filter;
    return matchSearch && matchFilter;
  });

  const getSubj = (key) => SUBJECT_META[key] || { name: key, icon: '📄', color: '#6366f1' };
  const getType = (key) => TYPE_META[key]    || { label: key, icon: '📄', color: '#6366f1' };

  return (
    <div style={{ minHeight: '100vh', background: bg, fontFamily: 'Inter, system-ui', paddingBottom: '90px' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'error' ? '#fee2e2' : '#dcfce7',
          color: toast.type === 'error' ? '#dc2626' : '#16a34a',
          padding: '12px 20px', borderRadius: '14px', fontWeight: '700', fontSize: '13px',
          zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', whiteSpace: 'nowrap',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', padding: '20px 16px 28px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '4px' }}>Study Materials</div>
            <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>Marketplace 📚</div>
            <div style={{ fontSize: '13px', opacity: 0.8 }}>{materials.length} materials available</div>
          </div>
          {/* Right side — Premium badge OR diamond count */}
          {marketplacePlan ? (
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '14px', padding: '10px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: '22px' }}>👑</div>
              <div style={{ fontSize: '11px', fontWeight: '800' }}>Premium</div>
              <div style={{ fontSize: '10px', opacity: 0.8 }}>Free Access</div>
            </div>
          ) : (
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '14px', padding: '10px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: '22px' }}>💎</div>
              <div style={{ fontSize: '16px', fontWeight: '900' }}>{diamonds}</div>
              <div style={{ fontSize: '10px', opacity: 0.8 }}>Diamonds</div>
            </div>
          )}
        </div>

        {/* Marketplace plan banner OR diamond earn hint */}
        {marketplacePlan ? (
          <div style={{ marginTop: '12px', background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>🎉</span>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '800' }}>Tamam PDFs tara mate Free chhe!</div>
              <div style={{ fontSize: '11px', opacity: 0.8 }}>Marketplace / Premium plan active chhe</div>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: '12px' }}>
            <div onClick={() => router.push('/quiz')} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '8px' }}>
              <span style={{ fontSize: '18px' }}>🎯</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: '800' }}>Quiz ramo → Diamonds kamao!</div>
                <div style={{ fontSize: '11px', opacity: 0.8 }}>Correct answer = 💎1, 80%+ = +💎5 bonus</div>
              </div>
              <span style={{ fontSize: '16px', opacity: 0.7 }}>›</span>
            </div>
            <div onClick={() => router.push('/premium')} style={{ background: 'rgba(251,191,36,0.2)', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', border: '1px solid rgba(251,191,36,0.3)' }}>
              <span style={{ fontSize: '18px' }}>📚</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: '800' }}>₹49/month ma badha PDFs free!</div>
                <div style={{ fontSize: '11px', opacity: 0.8 }}>Marketplace plan levo → unlimited downloads</div>
              </div>
              <span style={{ fontSize: '16px', opacity: 0.7 }}>›</span>
            </div>
          </div>
        )}

        {/* Search */}
        <div style={{ marginTop: '12px', background: 'rgba(255,255,255,0.15)', borderRadius: '14px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Subject, topic, title search karo..."
            style={{ border: 'none', outline: 'none', flex: 1, fontSize: '14px', color: 'white', background: 'transparent' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px' }}>✕</button>
          )}
        </div>
      </div>

      <div style={{ padding: '16px', maxWidth: '640px', margin: '0 auto' }}>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '14px', scrollbarWidth: 'none' }}>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              background: filter === f.key ? '#4f46e5' : cardBg,
              color: filter === f.key ? 'white' : textSec,
              border: 'none', borderRadius: '20px', padding: '7px 14px',
              fontSize: '12px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap',
              boxShadow: dark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ fontSize: '13px', color: textSec, marginBottom: '12px', fontWeight: '600' }}>
          {loading ? 'Loading...' : `${filtered.length} materials`}
          {search && <span style={{ color: '#6366f1' }}> for "{search}"</span>}
        </div>

        {/* Cards */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: textSec }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
            <div>Loading materials...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: textPrimary, marginBottom: '6px' }}>Koi material nathi</div>
            <div style={{ fontSize: '13px', color: textSec }}>Admin panel thi PDF upload karo</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map((mat, i) => {
              const s = getSubj(mat.subject);
              const t = getType(mat.material_type);
              // Premium/Marketplace plan wala ne badhu free
              const isUnlocked = mat.is_free || marketplacePlan || unlocked.has(mat.id);
              const cost = mat.price || 30;
              const canAfford = diamonds >= cost;

              return (
                <div key={mat.id || i} style={{
                  background: cardBg,
                  borderRadius: '18px',
                  padding: '16px',
                  boxShadow: dark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.07)',
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'center',
                }}>
                  {/* Icon */}
                  <div style={{
                    width: '52px', height: '52px', flexShrink: 0,
                    background: s.color + '22', borderRadius: '14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                  }}>
                    {s.icon}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '14px', fontWeight: '800', color: textPrimary, marginBottom: '7px',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {mat.title}
                    </div>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      <span style={{ background: s.color + '22', color: s.color, fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px' }}>
                        {s.icon} {s.name}
                      </span>
                      <span style={{ background: t.color + '22', color: t.color, fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px' }}>
                        {t.icon} {t.label}
                      </span>
                      {mat.is_free ? (
                        <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px' }}>🆓 Free</span>
                      ) : marketplacePlan ? (
                        <span style={{ background: '#fef3c7', color: '#d97706', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px' }}>👑 Premium</span>
                      ) : unlocked.has(mat.id) ? (
                        <span style={{ background: '#ede9fe', color: '#7c3aed', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px' }}>🔓 Unlocked</span>
                      ) : (
                        <span style={{ background: '#fef3c7', color: '#d97706', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px' }}>💎 {cost}</span>
                      )}
                    </div>
                    {mat.topic && (
                      <div style={{ fontSize: '11px', color: textSec, marginTop: '5px' }}>🏷️ {mat.topic}</div>
                    )}
                  </div>

                  {/* Action Button */}
                  {isUnlocked ? (
                    <a href={mat.file_url} target="_blank" rel="noreferrer" style={{
                      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                      color: 'white', borderRadius: '12px',
                      padding: '10px 16px', fontSize: '12px', fontWeight: '800',
                      textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
                    }}>
                      Open
                    </a>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                      <button
                        onClick={() => handleUnlockWithDiamonds(mat)}
                        disabled={unlocking === mat.id}
                        style={{
                          background: canAfford ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : '#94a3b8',
                          color: 'white', border: 'none', borderRadius: '10px',
                          padding: '8px 12px', fontSize: '11px', fontWeight: '800',
                          cursor: canAfford ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap',
                        }}
                      >
                        {unlocking === mat.id ? '⏳' : `💎 ${cost}`}
                      </button>
                      <button onClick={() => router.push('/premium')} style={{
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        color: 'white', border: 'none', borderRadius: '10px',
                        padding: '8px 12px', fontSize: '11px', fontWeight: '800',
                        cursor: 'pointer', whiteSpace: 'nowrap',
                      }}>
                        📚 ₹49
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}