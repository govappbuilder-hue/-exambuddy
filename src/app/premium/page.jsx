'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

const FEATURES_FREE = [
  '10 quiz per day',
  '3 subjects only',
  'Basic analytics',
  'No AI features',
];

const FEATURES_PREMIUM = [
  'Unlimited quizzes',
  'All 16+ subjects',
  'AI Doubt Solver',
  'AI Flashcards',
  'Photo/PDF Quiz',
  'Full Analytics',
  'Current Affairs daily',
  'Mock Tests (GPSC, GSSSB, Police)',
  'Priority support',
];

const PLANS = [
  {
    id: 'monthly',
    label: 'Monthly',
    price: 99,
    per: 'month',
    tag: null,
    amount: 9900,
  },
  {
    id: 'yearly',
    label: 'Yearly',
    price: 799,
    per: 'year',
    tag: '🔥 Best Value — Save ₹389',
    amount: 79900,
  },
];

export default function PremiumPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumExpiry, setPremiumExpiry] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      // Check existing premium
      const { data } = await supabase
        .from('user_premium')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (data && new Date(data.expires_at) > new Date()) {
        setIsPremium(true);
        setPremiumExpiry(new Date(data.expires_at).toLocaleDateString('gu-IN'));
      }

      setPageLoading(false);
    };
    init();
  }, []);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        alert('Razorpay load thayun nahi. Internet check karo.');
        setLoading(false);
        return;
      }

      // Create order
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan }),
      });
      const order = await res.json();

      if (!order.orderId) {
        alert('Order create thayun nahi. Fari try karo.');
        setLoading(false);
        return;
      }

      // Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'ExamBuddy',
        description: selectedPlan === 'yearly' ? 'Premium - 1 Year' : 'Premium - 1 Month',
        order_id: order.orderId,
        handler: async (response) => {
          // Verify payment
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: user.id,
              plan: selectedPlan,
            }),
          });
          const result = await verifyRes.json();

          if (result.success) {
            setIsPremium(true);
            setPremiumExpiry(new Date(result.expiresAt).toLocaleDateString('gu-IN'));
            alert('🎉 Premium activate thayun! Welcome to ExamBuddy Premium!');
          } else {
            alert('Payment verify thayun nahi. Support ne contact karo.');
          }
        },
        prefill: {
          email: user.email || '',
        },
        theme: { color: '#6366f1' },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Payment error:', err);
      alert('Koi error aavyo. Fari try karo.');
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#020817', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#6366f1', fontSize: '18px' }}>Loading...</div>
      </div>
    );
  }

  // Already premium — show status
  if (isPremium) {
    return (
      <div style={{ minHeight: '100vh', background: '#020817', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif', padding: '24px 16px' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '14px', cursor: 'pointer', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          ← Back
        </button>

        <div style={{ maxWidth: '420px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>👑</div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#fbbf24', marginBottom: '8px' }}>
            Tame Premium Member Cho!
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '32px' }}>
            Expiry: {premiumExpiry}
          </p>

          <div style={{ background: '#0f172a', borderRadius: '20px', padding: '24px', border: '1px solid #1e3a5f', marginBottom: '24px' }}>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px', textAlign: 'left' }}>Premium Features Active:</div>
            {FEATURES_PREMIUM.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: i < FEATURES_PREMIUM.length - 1 ? '1px solid #1e293b' : 'none' }}>
                <span style={{ color: '#10b981', fontSize: '16px' }}>✓</span>
                <span style={{ fontSize: '14px', color: '#cbd5e1' }}>{f}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '14px', color: '#fff', fontSize: '16px', fontWeight: '700', cursor: 'pointer' }}
          >
            Dashboard par Jao
          </button>
        </div>
      </div>
    );
  }

  // Main premium page
  return (
    <div style={{ minHeight: '100vh', background: '#020817', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ padding: '20px 16px 0', maxWidth: '480px', margin: '0 auto' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '14px', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          ← Back
        </button>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>👑</div>
          <h1 style={{ fontSize: '26px', fontWeight: '900', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' }}>
            ExamBuddy Premium
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            GPSC, GSSSB, Police — tamam exam ni full taiyari
          </p>
        </div>

        {/* Free vs Premium compare */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '28px' }}>
          {/* Free */}
          <div style={{ background: '#0f172a', borderRadius: '16px', padding: '16px', border: '1px solid #1e293b' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', marginBottom: '12px' }}>Free</div>
            {FEATURES_FREE.map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ color: '#ef4444', fontSize: '14px', marginTop: '1px' }}>✗</span>
                <span style={{ fontSize: '12px', color: '#475569' }}>{f}</span>
              </div>
            ))}
          </div>

          {/* Premium */}
          <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #1e3a5f)', borderRadius: '16px', padding: '16px', border: '1px solid #4338ca' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#a5b4fc', marginBottom: '12px' }}>Premium 👑</div>
            {FEATURES_PREMIUM.slice(0, 6).map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ color: '#10b981', fontSize: '14px', marginTop: '1px' }}>✓</span>
                <span style={{ fontSize: '12px', color: '#cbd5e1' }}>{f}</span>
              </div>
            ))}
            <div style={{ fontSize: '12px', color: '#6366f1', marginTop: '4px' }}>+ 3 more features...</div>
          </div>
        </div>

        {/* Plan selector */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '10px' }}>Plan pasand karo:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {PLANS.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                style={{
                  width: '100%',
                  padding: '16px 18px',
                  background: selectedPlan === plan.id ? 'linear-gradient(135deg, #1e1b4b, #1e3a5f)' : '#0f172a',
                  border: selectedPlan === plan.id ? '2px solid #6366f1' : '1px solid #1e293b',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
              >
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: selectedPlan === plan.id ? '#a5b4fc' : '#cbd5e1' }}>
                    {plan.label}
                  </div>
                  {plan.tag && (
                    <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: '3px' }}>{plan.tag}</div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: selectedPlan === plan.id ? '#fff' : '#94a3b8' }}>
                    ₹{plan.price}
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569' }}>/{plan.per}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={handlePayment}
          disabled={loading}
          style={{
            width: '100%',
            padding: '18px',
            background: loading ? '#334155' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none',
            borderRadius: '16px',
            color: '#fff',
            fontSize: '17px',
            fontWeight: '800',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '14px',
            transition: 'opacity 0.2s',
          }}
        >
          {loading ? 'Processing...' : `Premium Levo — ₹${PLANS.find(p => p.id === selectedPlan)?.price}/${PLANS.find(p => p.id === selectedPlan)?.per}`}
        </button>

        {/* Trust badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '16px' }}>
          <div style={{ textAlign: 'center', fontSize: '11px', color: '#475569' }}>
            <div style={{ fontSize: '18px' }}>🔒</div>
            Secure Payment
          </div>
          <div style={{ textAlign: 'center', fontSize: '11px', color: '#475569' }}>
            <div style={{ fontSize: '18px' }}>↩️</div>
            7-day refund
          </div>
          <div style={{ textAlign: 'center', fontSize: '11px', color: '#475569' }}>
            <div style={{ fontSize: '18px' }}>⚡</div>
            Instant access
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '11px', color: '#334155', marginBottom: '40px' }}>
          Razorpay dwara secure payment. Kabhi bhi cancel kari shakay.
        </p>
      </div>
    </div>
  );
}