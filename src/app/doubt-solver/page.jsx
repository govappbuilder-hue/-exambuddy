'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const QUICK_TOPICS = [
  '📜 બંધારણ ના Article 356 સમજાવો',
  '🔢 LCM અને HCF ની ટ્રિક',
  '🌍 ભારત ની નદીઓ ની યાદી',
  '📰 Lok Sabha vs Rajya Sabha તફાવત',
  '🧩 Syllogism solve કેવી રીતે?',
  '🏛️ ગુપ્ત સામ્રાજ્ય ક્યારે હતું?',
];

export default function DoubtSolverPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'નમસ્તે! 👋 હું ExamBuddy AI Doubt Solver છું.\n\nGPSC, UPSC, TET, TAT, Police, Constable — કોઈ પણ exam ના doubt પૂછો. Gujarati અથવા English — બંને ચાલે! 🎯',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const question = (text || input).trim();
    if (!question) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: question }]);
    setLoading(true);

    try {
      const res = await fetch('/api/doubt-solver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          history: messages.slice(-6), // last 6 messages for context
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', text: data.answer || 'જવાબ મળ્યો નહીં, ફરી try કરો.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: '⚠️ Error આવ્યો. Internet connection check કરો.' }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', fontFamily: 'system-ui', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ background: '#1e293b', borderBottom: '1px solid #334155', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px', position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '20px', padding: '0 4px' }}>←</button>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🤖</div>
        <div>
          <div style={{ fontWeight: '800', fontSize: '15px' }}>AI Doubt Solver</div>
          <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '600' }}>● Online — Gemini AI</div>
        </div>
      </div>

      {/* Quick Topics */}
      {messages.length <= 1 && (
        <div style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px', fontWeight: '600' }}>QUICK TOPICS</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {QUICK_TOPICS.map((t, i) => (
              <button key={i} onClick={() => sendMessage(t)}
                style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '20px', padding: '6px 14px', color: '#a5b4fc', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '750px', width: '100%', margin: '0 auto' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {m.role === 'assistant' && (
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0, marginTop: '2px' }}>🤖</div>
            )}
            <div style={{
              maxWidth: '80%',
              background: m.role === 'user' ? 'linear-gradient(135deg,#6366f1,#0ea5e9)' : 'rgba(255,255,255,0.06)',
              border: m.role === 'assistant' ? '1px solid rgba(255,255,255,0.08)' : 'none',
              borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
              padding: '12px 16px',
              fontSize: '14px',
              lineHeight: '1.7',
              whiteSpace: 'pre-wrap',
            }}>
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🤖</div>
            <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px 18px 18px 18px', padding: '12px 20px' }}>
              <span style={{ display: 'inline-flex', gap: '4px' }}>
                {[0,1,2].map(j => (
                  <span key={j} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1', animation: `bounce 1s ${j * 0.2}s infinite` }} />
                ))}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ background: '#1e293b', borderTop: '1px solid #334155', padding: '14px 20px', position: 'sticky', bottom: 0 }}>
        <div style={{ maxWidth: '750px', margin: '0 auto', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Doubt પૂછો... (Gujarati / English)"
            rows={1}
            style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', padding: '12px 16px', color: 'white', fontSize: '14px', resize: 'none', outline: 'none', fontFamily: 'system-ui', lineHeight: '1.5' }}
          />
          <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
            style={{ width: '44px', height: '44px', borderRadius: '50%', background: input.trim() && !loading ? 'linear-gradient(135deg,#6366f1,#0ea5e9)' : '#334155', border: 'none', color: 'white', fontSize: '18px', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ↑
          </button>
        </div>
        <div style={{ maxWidth: '750px', margin: '6px auto 0', fontSize: '11px', color: '#475569', textAlign: 'center' }}>
          Enter = Send • Shift+Enter = New line
        </div>
      </div>

      <style>{`@keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }`}</style>
    </div>
  );
}