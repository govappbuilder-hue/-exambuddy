'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SUBJECTS = [
  { key: 'maths', label: '🔢 ગણિત' },
  { key: 'constitution', label: '📜 બંધારણ' },
  { key: 'history', label: '🏛️ ઇતિહાસ' },
  { key: 'geography', label: '🌍 ભૂગોળ' },
  { key: 'science', label: '🔬 વિજ્ઞાન' },
  { key: 'gujarati_sahitya', label: '📖 ગુજ. સાહિત્ય' },
  { key: 'gujarati_vyakran', label: '📝 ગુજ. વ્યાકરણ' },
  { key: 'computer', label: '💻 કમ્પ્યૂટર' },
  { key: 'reasoning', label: '🧩 રીઝનિંગ' },
  { key: 'english', label: '🔤 English' },
  { key: 'law', label: '⚖️ કાયદો' },
  { key: 'gk', label: '💡 સામાન્ય જ્ઞાન' },
  { key: 'economics', label: '📈 અર્થશાસ્ત્ર' },
  { key: 'heritage', label: '🏺 વારસો' },
  { key: 'pub_ad', label: '🏢 જાહેર વહીવટ' },
  { key: 'current-affairs', label: '📰 કરંટ અફેર્સ' },
];

export default function FlashcardsPage() {
  const router = useRouter();
  const [screen, setScreen] = useState('select');
  const [subject, setSubject] = useState(null);
  const [cards, setCards] = useState([]);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState({});
  const [animating, setAnimating] = useState(false);

  const startFlashcards = async (sub) => {
    setSubject(sub);
    setScreen('loading');
    setFlipped(false);
    setCurrent(0);
    setKnown({});

    try {
      const cachedRes = await fetch(`/api/generate-flashcards?subject=${sub.key}`);
      const cachedData = await cachedRes.json();

      if (cachedData.cards?.length > 0) {
        setCards(cachedData.cards);
        setScreen('cards');
        return;
      }

      const res = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: sub.key }),
      });
      const data = await res.json();

      if (data.success && data.cards?.length > 0) {
        setCards(data.cards);
        setScreen('cards');
      } else {
        alert('Flashcards generate na thaya. Pachi try karo.');
        setScreen('select');
      }
    } catch (e) {
      alert('Error: ' + e.message);
      setScreen('select');
    }
  };

  // FIX: Pehla flip reset karo, pachhi next card
  const goToNext = (mark) => {
    if (animating) return;
    if (mark) setKnown(p => ({ ...p, [current]: mark }));
    
    if (current + 1 < cards.length) {
      setAnimating(true);
      setFlipped(false);
      setTimeout(() => {
        setCurrent(c => c + 1);
        setAnimating(false);
      }, 250);
    } else {
      // Last card - mark karo ane done screen
      if (mark) setKnown(p => ({ ...p, [current]: mark }));
    }
  };

  const goPrev = () => {
    if (animating || current === 0) return;
    setAnimating(true);
    setFlipped(false);
    setTimeout(() => {
      setCurrent(c => c - 1);
      setAnimating(false);
    }, 250);
  };

  const knownCount = Object.values(known).filter(v => v === 'known').length;
  const reviewCount = Object.values(known).filter(v => v === 'review').length;
  const isLastCard = current === cards.length - 1;
  const allDone = isLastCard && Object.keys(known).length === cards.length && cards.length > 0;

  /* SELECT */
  if (screen === 'select') return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: 'system-ui', color: 'white', padding: '20px', paddingBottom: '90px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => router.push('/')}
            style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '8px 14px', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}>
            ← Home
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '900' }}>🎴 AI Flashcards</h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Subject pasand karo - AI 10 cards banavshe</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {SUBJECTS.map(s => (
            <button key={s.key} onClick={() => startFlashcards(s)}
              style={{ background: '#1e293b', border: '2px solid #334155', borderRadius: '14px', padding: '18px 14px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#334155'}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: 'white' }}>{s.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  /* LOADING */
  if (screen === 'loading') return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎴</div>
        <h2 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '8px' }}>{subject?.label}</h2>
        <p style={{ color: '#64748b', fontSize: '14px' }}>AI flashcards બનાવી રહ્યું છે...</p>
        <div style={{ width: '180px', height: '4px', background: '#334155', borderRadius: '2px', margin: '20px auto 0', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '50%', background: 'linear-gradient(90deg,#6366f1,#0ea5e9)', borderRadius: '2px', animation: 'loadbar 1.2s ease-in-out infinite' }} />
        </div>
        <style>{`@keyframes loadbar { 0%{transform:translateX(-100%)} 100%{transform:translateX(300%)} }`}</style>
      </div>
    </div>
  );

  /* CARDS */
  if (screen === 'cards') {
    const card = cards[current];

    // All done screen
    if (allDone) return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui', padding: '20px' }}>
        <div style={{ background: '#1e293b', borderRadius: '24px', padding: '36px', maxWidth: '400px', width: '100%', textAlign: 'center', border: '1px solid #334155' }}>
          <div style={{ fontSize: '60px', marginBottom: '12px' }}>🎉</div>
          <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'white', marginBottom: '20px' }}>Flashcards Done!</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: '#064e3b', borderRadius: '12px', padding: '16px', border: '1px solid #10b98140' }}>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#34d399' }}>{knownCount}</div>
              <div style={{ fontSize: '12px', color: '#34d399', fontWeight: '700' }}>✅ Aavde Che</div>
            </div>
            <div style={{ background: '#1c1a00', borderRadius: '12px', padding: '16px', border: '1px solid #ca8a0440' }}>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#fbbf24' }}>{reviewCount}</div>
              <div style={{ fontSize: '12px', color: '#fbbf24', fontWeight: '700' }}>🔁 Revise Karo</div>
            </div>
          </div>
          <button onClick={() => { setCurrent(0); setKnown({}); setFlipped(false); }}
            style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#6366f1,#0ea5e9)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '800', cursor: 'pointer', marginBottom: '10px', fontSize: '15px' }}>
            🔄 ફરીથી જુઓ
          </button>
          <button onClick={() => setScreen('select')}
            style={{ width: '100%', padding: '12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#94a3b8', cursor: 'pointer', fontSize: '14px' }}>
            ← બીજો વિષય
          </button>
        </div>
      </div>
    );

    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: 'system-ui', color: 'white', display: 'flex', flexDirection: 'column' }}>

        {/* Top Bar */}
        <div style={{ background: '#1e293b', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155' }}>
          <button onClick={() => setScreen('select')}
            style={{ background: '#334155', border: 'none', borderRadius: '8px', padding: '6px 12px', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}>
            ← Subjects
          </button>
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#818cf8' }}>{subject?.label}</div>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '700' }}>{current + 1} / {cards.length}</div>
        </div>

        {/* Progress Bar */}
        <div style={{ height: '3px', background: '#334155' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg,#6366f1,#0ea5e9)', width: `${((current + 1) / cards.length) * 100}%`, transition: 'width 0.3s' }} />
        </div>

        {/* Card */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div
            onClick={() => !animating && setFlipped(f => !f)}
            style={{
              width: '100%', maxWidth: '440px', minHeight: '260px',
              background: flipped ? 'linear-gradient(135deg,#0ea5e9,#6366f1)' : 'linear-gradient(135deg,#1e293b,#334155)',
              borderRadius: '24px', padding: '32px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: animating ? 'default' : 'pointer',
              border: '1px solid #475569', textAlign: 'center',
              opacity: animating ? 0 : 1,
              transform: animating ? 'scale(0.95)' : 'scale(1)',
              transition: 'opacity 0.2s, transform 0.2s, background 0.3s',
            }}>
            <div style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '2px', color: flipped ? 'rgba(255,255,255,0.7)' : '#818cf8', marginBottom: '16px', textTransform: 'uppercase' }}>
              {flipped ? '💡 જવાબ' : '❓ પ્રશ્ન'}
            </div>
            <p style={{ fontSize: '19px', fontWeight: '700', lineHeight: 1.7, margin: 0 }}>
              {flipped ? card.back : card.front}
            </p>
            <div style={{ marginTop: '20px', fontSize: '12px', color: flipped ? 'rgba(255,255,255,0.6)' : '#64748b' }}>
              👆 Tap to flip
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #334155', background: '#1e293b' }}>
          <div style={{ maxWidth: '440px', margin: '0 auto' }}>
            {flipped ? (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => goToNext('review')} disabled={animating}
                  style={{ flex: 1, padding: '14px', background: '#1c1a00', border: '2px solid #ca8a04', borderRadius: '12px', color: '#fbbf24', fontWeight: '800', cursor: 'pointer', fontSize: '14px', opacity: animating ? 0.5 : 1 }}>
                  🔁 Revise Karu
                </button>
                <button onClick={() => goToNext('known')} disabled={animating}
                  style={{ flex: 1, padding: '14px', background: '#064e3b', border: '2px solid #10b981', borderRadius: '12px', color: '#34d399', fontWeight: '800', cursor: 'pointer', fontSize: '14px', opacity: animating ? 0.5 : 1 }}>
                  ✅ Aavde Che
                </button>
              </div>
            ) : (
              <button onClick={() => setFlipped(true)} disabled={animating}
                style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#6366f1,#0ea5e9)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '800', cursor: 'pointer', fontSize: '15px' }}>
                👁️ જવાબ જુઓ
              </button>
            )}

            {/* Prev / Skip row */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              {current > 0 && (
                <button onClick={goPrev} disabled={animating}
                  style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid #334155', borderRadius: '10px', color: '#64748b', fontSize: '12px', cursor: 'pointer' }}>
                  ← Prev
                </button>
              )}
              {!isLastCard && (
                <button onClick={() => goToNext(null)} disabled={animating}
                  style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid #334155', borderRadius: '10px', color: '#64748b', fontSize: '12px', cursor: 'pointer' }}>
                  Skip →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}