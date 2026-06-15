'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

const QUICK_TOPICS = [
  '📜 GPSC Mukhya Pariksha Syllabus શું છે?',
  '🔢 Talati ની ગણિત ની Short Tricks',
  '🌍 ગુજરાત ના જિલ્લા અને તેમની વિશેષતા',
  '📰 GSSSB Junior Clerk ની તૈયારી',
  '🧩 Reasoning Series Question Solve',
  '🏛️ ગુજરાત નો ઇતિહાસ — સોલંકી વંશ',
  '⚖️ ભારતીય બંધારણ — Fundamental Rights',
  '💻 Computer — MS Excel Shortcuts',
];

const INITIAL_MESSAGE = {
  role: 'assistant',
  text: 'નમસ્તે! 👋 હું ExamBuddy AI Doubt Solver છું.\n\nGPSC, PSI, Talati, Police — કોઈ પણ exam ના doubt પૂછો. Gujarati અથવા English — બંને ચાલે! 🎯',
};

const FREE_LIMIT = 5; // Free users: 5 questions per day

export default function DoubtSolverPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [usedToday, setUsedToday] = useState(0);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      // Check premium
      const { data: premium } = await supabase
        .from('user_premium')
        .select('is_active, expires_at')
        .eq('user_id', user.id)
        .single();

      const active = premium?.is_active && new Date(premium.expires_at) > new Date();
      setIsPremium(active);

      // Check today's usage from localStorage
      const today = new Date().toDateString();
      const stored = JSON.parse(localStorage.getItem('doubt_usage') || '{}');
      if (stored.date === today) setUsedToday(stored.count || 0);
      else localStorage.setItem('doubt_usage', JSON.stringify({ date: today, count: 0 }));

      // Load chat history
      const saved = localStorage.getItem('exambuddy_chat_history');
      if (saved) { try { setMessages(JSON.parse(saved)); } catch (e) {} }

      setCheckingAuth(false);
    };
    init();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length > 1) localStorage.setItem('exambuddy_chat_history', JSON.stringify(messages));
  }, [messages]);

  const incrementUsage = () => {
    const today = new Date().toDateString();
    const newCount = usedToday + 1;
    localStorage.setItem('doubt_usage', JSON.stringify({ date: today, count: newCount }));
    setUsedToday(newCount);
  };

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;

    // Free limit check
    if (!isPremium && usedToday >= FREE_LIMIT) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: `⚠️ Aaj na ${FREE_LIMIT} free questions vaaprya!\n\n💎 Premium lo ane unlimited doubts puchho:\n→ ₹99/month ya ₹799/year`,
        isLimit: true,
      }]);
      return;
    }

    const userMsg = { role: 'user', text };
    const updatedMsgs = [...messages, userMsg];
    setMessages(updatedMsgs);
    setInput('');
    setLoading(true);
    incrementUsage();

    try {
      const res = await fetch('/api/doubt-solver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          history: messages.slice(-6),
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', text: data.answer || 'Error aayo, try karo.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: '❌ Network error. Internet check karo.' }]);
    }
    setLoading(false);
  };

  if (checkingAuth) return (
    <div style={{ minHeight: '100vh', background: '#0f0f13', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '14px' }}>
      Loading...
    </div>
  );

  const remaining = FREE_LIMIT - usedToday;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f0f13', fontFamily: 'Inter, system-ui', paddingBottom: '70px' }}>

      {/* Header */}
      <div style={{ background: '#1a1a24', borderBottom: '1px solid #2d3748', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}>←</button>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#f1f5f9' }}>🤖 AI Doubt Solver</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Powered by Groq AI</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isPremium ? (
            <span style={{ background: '#fef3c7', color: '#d97706', fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '8px' }}>💎 Premium</span>
          ) : (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Today</div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: remaining > 1 ? '#10b981' : '#ef4444' }}>
                {remaining}/{FREE_LIMIT} left
              </div>
            </div>
          )}
          <button onClick={() => { setMessages([INITIAL_MESSAGE]); localStorage.removeItem('exambuddy_chat_history'); }} style={{ background: '#2d3748', border: 'none', borderRadius: '8px', padding: '6px 10px', color: '#94a3b8', fontSize: '11px', cursor: 'pointer' }}>
            Clear
          </button>
        </div>
      </div>

      {/* Quick topics — show only if no chat yet */}
      {messages.length <= 1 && (
        <div style={{ padding: '12px 16px', display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none', flexShrink: 0 }}>
          {QUICK_TOPICS.map((t, i) => (
            <button key={i} onClick={() => sendMessage(t)} style={{
              flexShrink: 0, background: '#1a1a24', border: '1px solid #2d3748',
              borderRadius: '20px', padding: '8px 14px', color: '#94a3b8',
              fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap'
            }}>{t}</button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {m.role === 'assistant' && (
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>🤖</div>
            )}
            <div style={{
              maxWidth: '80%',
              background: m.role === 'user' ? 'linear-gradient(135deg,#6366f1,#0ea5e9)' : m.isLimit ? '#fee2e2' : '#1a1a24',
              color: m.role === 'user' ? 'white' : m.isLimit ? '#dc2626' : '#e2e8f0',
              borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
              padding: '12px 16px', fontSize: '14px', lineHeight: '1.6',
              whiteSpace: 'pre-wrap', border: m.isLimit ? '1px solid #fca5a5' : 'none',
            }}>
              {m.text}
              {m.isLimit && (
                <button onClick={() => router.push('/premium')} style={{
                  display: 'block', marginTop: '10px', background: '#dc2626',
                  color: 'white', border: 'none', borderRadius: '8px',
                  padding: '8px 16px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', width: '100%'
                }}>
                  💎 Premium lo — ₹99/month
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🤖</div>
            <div style={{ background: '#1a1a24', borderRadius: '4px 18px 18px 18px', padding: '12px 16px' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[0,1,2].map(j => (
                  <div key={j} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1', animation: `bounce 1s ${j * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ background: '#1a1a24', borderTop: '1px solid #2d3748', padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'flex-end', flexShrink: 0, position: 'fixed', bottom: '60px', left: 0, right: 0 }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
          placeholder="Taro doubt type karo... (Enter = send)"
          rows={1}
          style={{
            flex: 1, background: '#0f0f13', border: '1px solid #2d3748', borderRadius: '12px',
            padding: '10px 14px', color: '#f1f5f9', fontSize: '14px', resize: 'none',
            outline: 'none', fontFamily: 'inherit', lineHeight: '1.5', maxHeight: '120px'
          }}
        />
        <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()} style={{
          background: loading || !input.trim() ? '#2d3748' : 'linear-gradient(135deg,#6366f1,#4f46e5)',
          border: 'none', borderRadius: '12px', padding: '10px 16px',
          color: 'white', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer',
          flexShrink: 0,
        }}>
          {loading ? '⏳' : '↑'}
        </button>
      </div>

      <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }`}</style>
    </div>
  );
}