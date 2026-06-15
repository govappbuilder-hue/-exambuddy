'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

const TABS = ['Overall', 'GPSC', 'GSSSB', 'Police'];
const PAGE_SIZE = 20;

const SUBJECT_EXAM = {
  history: 'GPSC', geography: 'GPSC', constitution: 'GPSC', economics: 'GPSC', polity: 'GPSC',
  science: 'GSSSB', maths: 'GSSSB', reasoning: 'GSSSB', gujarati: 'GSSSB',
  gujarati_sahitya: 'GSSSB', gujarati_vyakran: 'GSSSB', computer: 'GSSSB',
  gk: 'Police', 'current-affairs': 'Police', english: 'Police', law: 'Police',
};

export default function LeaderboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('Overall');
  const [leaders, setLeaders] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [myStats, setMyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [profiles, setProfiles] = useState({});

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      // Load profiles for display names
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, full_name, email');
      if (profileData) {
        const map = {};
        profileData.forEach(p => { map[p.id] = p.full_name || p.email?.split('@')[0] || 'User'; });
        setProfiles(map);
      }

      await fetchLeaderboard(user, 'Overall', 0);
    };
    init();
  }, []);

  const fetchLeaderboard = async (currentUser, tab, pageNum) => {
    setLoading(true);

    // Fetch limited records with offset for pagination
    const from = pageNum * PAGE_SIZE * 5; // fetch extra for aggregation
    const { data: allHistory } = await supabase
      .from('quiz_history')
      .select('user_id, score, total, subject_name')
      .order('created_at', { ascending: false })
      .range(0, 5000); // max 5000 records

    if (!allHistory || allHistory.length === 0) {
      setLeaders([]); setLoading(false); return;
    }

    const filtered = tab === 'Overall'
      ? allHistory
      : allHistory.filter(h => {
          const key = (h.subject_name || '').toLowerCase().replace(/ /g, '_');
          return SUBJECT_EXAM[key] === tab;
        });

    const userMap = {};
    filtered.forEach(h => {
      if (!userMap[h.user_id]) userMap[h.user_id] = { user_id: h.user_id, totalTests: 0, totalScore: 0, totalQuestions: 0 };
      userMap[h.user_id].totalTests++;
      userMap[h.user_id].totalScore += h.score;
      userMap[h.user_id].totalQuestions += h.total;
    });

    const sorted = Object.values(userMap)
      .map(u => ({
        ...u,
        avg: u.totalQuestions > 0 ? Math.round((u.totalScore / u.totalQuestions) * 100) : 0,
        displayName: u.user_id === currentUser.id ? (currentUser.user_metadata?.full_name || 'You') : null,
        isMe: u.user_id === currentUser.id,
      }))
      .sort((a, b) => b.avg - a.avg || b.totalTests - a.totalTests);

    sorted.forEach((u, i) => { u.rank = i + 1; });

    const me = sorted.find(u => u.isMe);
    if (me) { setMyRank(me.rank); setMyStats(me); }

    const pageSlice = sorted.slice(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE);
    setHasMore(sorted.length > (pageNum + 1) * PAGE_SIZE);
    setLeaders(pageNum === 0 ? pageSlice : prev => [...prev, ...pageSlice]);
    setPage(pageNum);
    setLoading(false);
  };

  const handleTab = (tab) => {
    setActiveTab(tab);
    setLeaders([]);
    setPage(0);
    if (user) fetchLeaderboard(user, tab, 0);
  };

  const loadMore = () => { if (user) fetchLeaderboard(user, activeTab, page + 1); };

  const getName = (entry) => {
    if (entry.isMe) return entry.displayName || 'You';
    return profiles[entry.user_id] || `User ${entry.user_id.slice(0, 6)}`;
  };

  const rankIcon = (r) => r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : `#${r}`;
  const rankColor = (r) => r === 1 ? '#fbbf24' : r === 2 ? '#94a3b8' : r === 3 ? '#f97316' : '#475569';

  return (
    <div style={{ minHeight: '100vh', background: '#020817', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif', paddingBottom: '80px' }}>
      <div style={{ background: '#0d1117', borderBottom: '1px solid #1e293b', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}>←</button>
        <div>
          <div style={{ fontSize: '18px', fontWeight: '900' }}>🏆 Leaderboard</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Top performers — ExamBuddy</div>
        </div>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '20px 16px' }}>
        {myStats && (
          <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#1e3a5f)', border: '1px solid #4338ca', borderRadius: '20px', padding: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Taro Rank</div>
              <div style={{ fontSize: '32px', fontWeight: '900', color: rankColor(myRank) }}>{rankIcon(myRank)}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Average</div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#6366f1' }}>{myStats.avg}%</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Tests</div>
              <div style={{ fontSize: '28px', fontWeight: '900' }}>{myStats.totalTests}</div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto' }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => handleTab(tab)} style={{
              flexShrink: 0, padding: '6px 18px', borderRadius: '20px',
              border: `1px solid ${activeTab === tab ? '#6366f1' : '#334155'}`,
              background: activeTab === tab ? '#6366f1' : 'transparent',
              color: activeTab === tab ? '#fff' : '#94a3b8',
              fontSize: '13px', fontWeight: '700', cursor: 'pointer'
            }}>{tab}</button>
          ))}
        </div>

        {loading && leaders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>Loading...</div>
        ) : leaders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
            <div style={{ color: '#64748b', fontSize: '14px' }}>Haji koi data nathi.<br />Quiz ramo — pehla tame j rahesho! 😄</div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {leaders.map((entry) => (
                <div key={entry.user_id} style={{
                  background: entry.isMe ? 'linear-gradient(135deg,#1e1b4b,#1e293b)' : '#0f172a',
                  border: `1px solid ${entry.isMe ? '#4338ca' : '#1e293b'}`,
                  borderRadius: '16px', padding: '14px 16px',
                  display: 'flex', alignItems: 'center', gap: '14px',
                }}>
                  <div style={{ minWidth: '36px', textAlign: 'center', fontSize: entry.rank <= 3 ? '22px' : '14px', fontWeight: '900', color: rankColor(entry.rank) }}>
                    {rankIcon(entry.rank)}
                  </div>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: entry.isMe ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '800', color: entry.isMe ? '#fff' : '#64748b', flexShrink: 0 }}>
                    {getName(entry)[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: entry.isMe ? '#a5b4fc' : '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {getName(entry)} {entry.isMe && <span style={{ fontSize: '11px', background: '#6366f1', color: '#fff', borderRadius: '6px', padding: '1px 6px', marginLeft: '4px' }}>You</span>}
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>{entry.totalTests} tests</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: entry.avg >= 80 ? '#10b981' : entry.avg >= 60 ? '#3b82f6' : entry.avg >= 40 ? '#f59e0b' : '#ef4444' }}>{entry.avg}%</div>
                    <div style={{ fontSize: '11px', color: '#475569' }}>avg</div>
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <button onClick={loadMore} disabled={loading} style={{
                width: '100%', marginTop: '16px', padding: '12px',
                background: '#1e293b', border: '1px solid #334155',
                borderRadius: '12px', color: '#94a3b8', fontSize: '13px',
                fontWeight: '700', cursor: 'pointer'
              }}>
                {loading ? 'Loading...' : 'Load More ↓'}
              </button>
            )}
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: '28px', padding: '20px', background: '#0f172a', borderRadius: '16px', border: '1px solid #1e293b' }}>
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>💪</div>
          <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>
            Roj practice karo — rank apne aap sudharshe!<br />
            <span style={{ color: '#6366f1', fontWeight: '700' }}>Top 3 ma aavvu che?</span>
          </div>
        </div>
      </div>
    </div>
  );
}