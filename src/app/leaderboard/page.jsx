'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

const TABS = ['Overall', 'GPSC', 'GSSSB', 'Police'];

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

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);
      await fetchLeaderboard(user, 'Overall');
    };
    init();
  }, []);

  const fetchLeaderboard = async (currentUser, tab) => {
    setLoading(true);

    // Fetch all quiz history
    const { data: allHistory } = await supabase
  .from('quiz_history')
  .select('user_id, score, total, subject_name')
  .order('created_at', { ascending: false })
  .limit(500);

    if (!allHistory || allHistory.length === 0) {
      setLeaders([]);
      setLoading(false);
      return;
    }

    // Filter by exam category if needed
    const filtered = tab === 'Overall'
      ? allHistory
      : allHistory.filter(h => {
          const subjectKey = (h.subject_name || '').toLowerCase().replace(/ /g, '_');
          return SUBJECT_EXAM[subjectKey] === tab;
        });

    // Aggregate by user
    const userMap = {};
    filtered.forEach(h => {
      if (!userMap[h.user_id]) {
        userMap[h.user_id] = { user_id: h.user_id, totalTests: 0, totalScore: 0, totalQuestions: 0 };
      }
      userMap[h.user_id].totalTests++;
      userMap[h.user_id].totalScore += h.score;
      userMap[h.user_id].totalQuestions += h.total;
    });

    // Sort by avg %
    const sorted = Object.values(userMap)
      .map(u => ({
        ...u,
        avg: u.totalQuestions > 0 ? Math.round((u.totalScore / u.totalQuestions) * 100) : 0,
        displayName: u.user_id === currentUser.id
          ? (currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'You')
          : `User ${u.user_id.slice(0, 6)}`,
        isMe: u.user_id === currentUser.id,
      }))
      .sort((a, b) => b.avg - a.avg || b.totalTests - a.totalTests);

    // Assign ranks
    sorted.forEach((u, i) => { u.rank = i + 1; });

    setLeaders(sorted.slice(0, 20));

    const me = sorted.find(u => u.isMe);
    if (me) {
      setMyRank(me.rank);
      setMyStats(me);
    } else {
      setMyRank(null);
      setMyStats(null);
    }

    setLoading(false);
  };

  const handleTab = (tab) => {
    setActiveTab(tab);
    if (user) fetchLeaderboard(user, tab);
  };

  const rankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const rankColor = (rank) => {
    if (rank === 1) return '#fbbf24';
    if (rank === 2) return '#94a3b8';
    if (rank === 3) return '#f97316';
    return '#475569';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#020817', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif', paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{ background: '#0d1117', borderBottom: '1px solid #1e293b', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer', lineHeight: 1 }}>←</button>
        <div>
          <div style={{ fontSize: '18px', fontWeight: '900', color: '#e2e8f0' }}>🏆 Leaderboard</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Top performers — ExamBuddy</div>
        </div>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '20px 16px' }}>

        {/* My rank card */}
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
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#e2e8f0' }}>{myStats.totalTests}</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => handleTab(tab)}
              style={{ flexShrink: 0, padding: '6px 18px', borderRadius: '20px', border: `1px solid ${activeTab === tab ? '#6366f1' : '#334155'}`, background: activeTab === tab ? '#6366f1' : 'transparent', color: activeTab === tab ? '#fff' : '#94a3b8', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Leaderboard list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b', fontSize: '14px' }}>
            Loading...
          </div>
        ) : leaders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
            <div style={{ color: '#64748b', fontSize: '14px' }}>Haji koi data nathi.<br />Quiz ramo — pehla tame j rahesho! 😄</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {leaders.map((entry, i) => (
              <div key={entry.user_id}
                style={{
                  background: entry.isMe ? 'linear-gradient(135deg,#1e1b4b,#1e293b)' : '#0f172a',
                  border: `1px solid ${entry.isMe ? '#4338ca' : entry.rank <= 3 ? '#334155' : '#1e293b'}`,
                  borderRadius: '16px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  transition: 'all 0.15s',
                }}
              >
                {/* Rank */}
                <div style={{ minWidth: '36px', textAlign: 'center', fontSize: entry.rank <= 3 ? '22px' : '14px', fontWeight: '900', color: rankColor(entry.rank) }}>
                  {rankIcon(entry.rank)}
                </div>

                {/* Avatar */}
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: entry.isMe ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '800', color: entry.isMe ? '#fff' : '#64748b', flexShrink: 0 }}>
                  {entry.displayName[0]?.toUpperCase() || '?'}
                </div>

                {/* Name + tests */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: entry.isMe ? '#a5b4fc' : '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {entry.displayName} {entry.isMe && <span style={{ fontSize: '11px', background: '#6366f1', color: '#fff', borderRadius: '6px', padding: '1px 6px', marginLeft: '4px' }}>You</span>}
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                    {entry.totalTests} tests
                  </div>
                </div>

                {/* Score */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: entry.avg >= 80 ? '#10b981' : entry.avg >= 60 ? '#3b82f6' : entry.avg >= 40 ? '#f59e0b' : '#ef4444' }}>
                    {entry.avg}%
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569' }}>avg</div>
                </div>
              </div>
            ))}
          </div>
        )}

       {/* Motivational footer */}
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