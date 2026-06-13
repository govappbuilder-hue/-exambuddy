'use client';
import { useRouter } from 'next/navigation';
import { useTheme } from '../layout';

export default function MarketplacePage() {
  const router = useRouter();
  const { dark } = useTheme();

  const bg = dark ? '#0a0f1e' : '#f0f4ff';
  const card = dark ? '#111827' : '#ffffff';
  const border = dark ? '#1e293b' : '#e2e8f0';
  const text = dark ? '#f1f5f9' : '#0f172a';
  const sub = dark ? '#64748b' : '#64748b';
  const card2 = dark ? '#0f172a' : '#f8fafc';

  const COMING = [
    { icon: '📄', title: 'PDF Notes', desc: 'GPSC, GSSSB, PSI ना handwritten notes ખરીદો' },
    { icon: '🎯', title: 'Question Banks', desc: 'Subject-wise 500+ MCQ sets' },
    { icon: '📹', title: 'Video Lectures', desc: 'Top educators ના video lectures' },
    { icon: '💰', title: 'Sell Your Notes', desc: 'તમારા notes upload કરો ane income મેળવો' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: bg, fontFamily: 'Inter, system-ui', color: text, paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{ background: card, borderBottom: `1px solid ${border}`, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg,#f59e0b,#ef4444)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🛒</div>
        <div>
          <div style={{ fontSize: '17px', fontWeight: '800', color: text }}>Marketplace</div>
          <div style={{ fontSize: '12px', color: sub }}>Study materials ખરીદો અને વેચો</div>
        </div>
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '24px 16px' }}>

        {/* Coming Soon Banner */}
        <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', border: '1px solid #4338ca', borderRadius: '20px', padding: '28px 24px', textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚀</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#c7d2fe', marginBottom: '8px' }}>Coming Soon!</div>
          <div style={{ fontSize: '14px', color: '#818cf8', lineHeight: 1.7, marginBottom: '20px' }}>
            ExamBuddy Marketplace જલ્દી launch થશે.<br />
            PDF notes, question banks, video lectures — one place!
          </div>
          <div style={{ display: 'inline-block', background: '#4338ca', color: '#c7d2fe', fontSize: '12px', fontWeight: '700', padding: '6px 16px', borderRadius: '20px' }}>
            🔔 Notify Me
          </div>
        </div>

        {/* Features preview */}
        <div style={{ fontSize: '13px', fontWeight: '700', color: sub, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          શું આવશે
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
          {COMING.map((item, i) => (
            <div key={i} style={{ background: card, border: `1px solid ${border}`, borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', background: card2, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: text, marginBottom: '3px' }}>{item.title}</div>
                <div style={{ fontSize: '12px', color: sub }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Seller CTA */}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>💡</div>
          <div style={{ fontSize: '15px', fontWeight: '700', color: text, marginBottom: '6px' }}>Notes seller બનો!</div>
          <div style={{ fontSize: '13px', color: sub, marginBottom: '16px', lineHeight: 1.6 }}>
            તમારા handwritten notes upload કરો.<br />
            દર sale પર 70% commission મળશે.
          </div>
          <button
            onClick={() => alert('Coming soon! Notification set karyo.')}
            style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)', color: 'white', border: 'none', borderRadius: '10px', padding: '12px 24px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
            🔔 Launch Par Notify Karo
          </button>
        </div>
      </div>
    </div>
  );
}