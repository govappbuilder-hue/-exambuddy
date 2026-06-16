'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

const PLANS = [
  {
    id: 'adfree',
    label: 'Ad-Free',
    emoji: '🚫',
    price: 20,
    per: 'month',
    tag: null,
    amount: 2000,
    color: '#0ea5e9',
    gradient: 'linear-gradient(135deg, #0369a1, #0ea5e9)',
    description: 'Ads band — baaki sab free jem j',
    features: [
      'Badha ads completely band',
      'Free plan na tamam features',
      'Quiz thi diamonds kamao',
      'Diamond thi PDF unlock karo',
    ],
    notIncluded: ['Marketplace free access', 'AI Features', 'Unlimited Quiz'],
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    emoji: '📚',
    price: 49,
    per: 'month',
    tag: '⭐ Popular',
    amount: 4900,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
    description: 'Tamam PDFs ne free ma download karo',
    features: [
      'Marketplace na badha PDFs free',
      'Unlimited PDF downloads',
      'Diamond thi bhi unlock karo',
      'Free plan na tamam features',
      'Ads nathi hatati (Ad-Free levo)',
    ],
    notIncluded: ['AI Features', 'Unlimited Quiz'],
  },
  {
    id: 'monthly',
    label: 'Premium',
    emoji: '👑',
    price: 99,
    per: 'month',
    tag: null,
    amount: 9900,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #d97706, #f59e0b)',
    description: 'Badhu unlock — full taiyari',
    features: [
      'Marketplace na badha PDFs free',
      'Unlimited quizzes',
      'AI Doubt Solver',
      'AI Flashcards',
      'Full Analytics',
      'Current Affairs daily',
      'Mock Tests (GPSC, GSSSB, Police)',
      'Ads completely band',
      'Priority support',
    ],
    notIncluded: [],
  },
  {
    id: 'halfyearly',
    label: 'Premium',
    emoji: '👑',
    price: 499,
    per: '6 months',
    tag: '💰 Save ₹95',
    amount: 49900,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #d97706, #f59e0b)',
    description: '6 mahina full premium',
    features: [
      'Marketplace na badha PDFs free',
      'Unlimited quizzes',
      'AI Doubt Solver',
      'AI Flashcards',
      'Full Analytics',
      'Current Affairs daily',
      'Mock Tests (GPSC, GSSSB, Police)',
      'Ads completely band',
      'Priority support',
    ],
    notIncluded: [],
  },
  {
    id: 'yearly',
    label: 'Premium',
    emoji: '👑',
    price: 799,
    per: 'year',
    tag: '🔥 Best Value — Save ₹389',
    amount: 79900,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #d97706, #f59e0b)',
    description: '1 varis full premium — save karo',
    features: [
      'Marketplace na badha PDFs free',
      'Unlimited quizzes',
      'AI Doubt Solver',
      'AI Flashcards',
      'Full Analytics',
      'Current Affairs daily',
      'Mock Tests (GPSC, GSSSB, Police)',
      'Ads completely band',
      'Priority support',
    ],
    notIncluded: [],
  },
];

const PLAN_GROUPS = [
  { label: '🚫 Ad-Free', plans: ['adfree'] },
  { label: '📚 Marketplace', plans: ['marketplace'] },
  { label: '👑 Premium', plans: ['monthly', 'halfyearly', 'yearly'] },
];

export default function PremiumPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [loading, setLoading] = useState(false);
  const [currentSub, setCurrentSub] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      const { data } = await supabase
        .from('user_premium')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (data && new Date(data.expires_at) > new Date()) {
        setCurrentSub(data);
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

      const plan = PLANS.find(p => p.id === selectedPlan);
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'ExamBuddy',
        description: `${plan?.label} - ${plan?.per}`,
        order_id: order.orderId,
        handler: async (response) => {
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
            setCurrentSub({ plan: selectedPlan, expires_at: result.expiresAt });
            alert('🎉 Plan activate thayun! Welcome!');
          } else {
            alert('Payment verify thayun nahi. Support ne contact karo.');
          }
        },
        prefill: { email: user.email || '' },
        theme: { color: plan?.color || '#6366f1' },
        modal: { ondismiss: () => setLoading(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert('Koi error aavyo. Fari try karo.');
      setLoading(false);
    }
  };

  const getPlanLabel = (planId) => {
    const labels = {
      adfree: 'Ad-Free',
      marketplace: 'Marketplace',
      monthly: 'Premium Monthly',
      halfyearly: 'Premium 6-Month',
      yearly: 'Premium Yearly',
    };
    return labels[planId] || planId;
  };

  if (pageLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#020817', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#6366f1', fontSize: '18px' }}>Loading...</div>
      </div>
    );
  }

  if (currentSub) {
    const expiry = new Date(currentSub.expires_at).toLocaleDateString('gu-IN');
    const planInfo = PLANS.find(p => p.id === currentSub.plan) || PLANS[2];
    return (
      <div style={{ minHeight: '100vh', background: '#020817', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif', padding: '24px 16px', paddingBottom: '90px' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '14px', cursor: 'pointer', marginBottom: '24px' }}>← Back</button>
        <div style={{ maxWidth: '420px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>{planInfo.emoji}</div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', background: planInfo.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' }}>
            {getPlanLabel(currentSub.plan)} Active Chhe!
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '28px' }}>Expiry: {expiry}</p>
          <div style={{ background: '#0f172a', borderRadius: '20px', padding: '24px', border: `1px solid ${planInfo.color}44`, marginBottom: '20px' }}>
            {planInfo.features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: i < planInfo.features.length - 1 ? '1px solid #1e293b' : 'none' }}>
                <span style={{ color: '#10b981' }}>✓</span>
                <span style={{ fontSize: '14px', color: '#cbd5e1' }}>{f}</span>
              </div>
            ))}
          </div>
          <button onClick={() => router.push('/dashboard')} style={{ width: '100%', padding: '16px', background: planInfo.gradient, border: 'none', borderRadius: '14px', color: '#fff', fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginBottom: '12px' }}>
            Dashboard par Jao
          </button>
          <button onClick={() => setCurrentSub(null)} style={{ background: 'none', border: 'none', color: '#475569', fontSize: '13px', cursor: 'pointer' }}>
            Upgrade / Badlo →
          </button>
        </div>
      </div>
    );
  }

  const selectedPlanData = PLANS.find(p => p.id === selectedPlan);

  return (
    <div style={{ minHeight: '100vh', background: '#020817', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif', paddingBottom: '90px' }}>
      <div style={{ padding: '20px 16px 0', maxWidth: '500px', margin: '0 auto' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '14px', cursor: 'pointer', marginBottom: '20px' }}>← Back</button>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '44px', marginBottom: '10px' }}>🚀</div>
          <h1 style={{ fontSize: '26px', fontWeight: '900', background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '6px' }}>
            ExamBuddy Plans
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>GPSC, GSSSB, Police — tamam exam ni taiyari</p>
        </div>

        {PLAN_GROUPS.map((group) => (
          <div key={group.label} style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#475569', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>
              {group.label}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {group.plans.map((planId) => {
                const plan = PLANS.find(p => p.id === planId);
                const isSelected = selectedPlan === planId;
                return (
                  <button
                    key={planId}
                    onClick={() => setSelectedPlan(planId)}
                    style={{
                      width: '100%', padding: '16px 18px',
                      background: isSelected ? '#0f172a' : '#0a0a14',
                      border: isSelected ? `2px solid ${plan.color}` : '1px solid #1e293b',
                      borderRadius: '16px', cursor: 'pointer',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      textAlign: 'left', transition: 'all 0.2s', position: 'relative',
                    }}
                  >
                    {plan.tag && (
                      <div style={{
                        position: 'absolute', top: '-10px', left: '16px',
                        background: plan.gradient, color: 'white',
                        fontSize: '10px', fontWeight: '800', padding: '3px 10px', borderRadius: '20px',
                      }}>
                        {plan.tag}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '12px',
                        background: plan.gradient,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                      }}>
                        {plan.emoji}
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: isSelected ? '#fff' : '#94a3b8' }}>
                          {plan.id === 'monthly' ? 'Monthly' : plan.id === 'halfyearly' ? '6 Months' : plan.id === 'yearly' ? 'Yearly' : plan.label}
                        </div>
                        <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>{plan.description}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '20px', fontWeight: '900', color: isSelected ? plan.color : '#64748b' }}>₹{plan.price}</div>
                      <div style={{ fontSize: '10px', color: '#475569' }}>/{plan.per}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {selectedPlanData && (
          <div style={{ background: '#0f172a', borderRadius: '20px', padding: '20px', border: `1px solid ${selectedPlanData.color}33`, marginBottom: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: '800', color: selectedPlanData.color, marginBottom: '14px' }}>
              {selectedPlanData.emoji} {selectedPlanData.id === 'monthly' ? 'Monthly' : selectedPlanData.id === 'halfyearly' ? '6 Months' : selectedPlanData.id === 'yearly' ? 'Yearly' : selectedPlanData.label} ma su malse:
            </div>
            {selectedPlanData.features.map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ color: '#10b981', fontSize: '14px' }}>✓</span>
                <span style={{ fontSize: '13px', color: '#cbd5e1' }}>{f}</span>
              </div>
            ))}
            {selectedPlanData.notIncluded.length > 0 && (
              <>
                <div style={{ borderTop: '1px solid #1e293b', margin: '12px 0' }} />
                {selectedPlanData.notIncluded.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ color: '#475569', fontSize: '14px' }}>✗</span>
                    <span style={{ fontSize: '13px', color: '#475569' }}>{f}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={loading}
          style={{
            width: '100%', padding: '18px',
            background: loading ? '#334155' : (selectedPlanData?.gradient || 'linear-gradient(135deg, #6366f1, #8b5cf6)'),
            border: 'none', borderRadius: '16px', color: '#fff',
            fontSize: '17px', fontWeight: '800',
            cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '14px',
          }}
        >
          {loading ? 'Processing...' : `${selectedPlanData?.emoji} ₹${selectedPlanData?.price}/${selectedPlanData?.per} — Abhi Levo`}
        </button>

        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <button onClick={() => router.push('/marketplace')} style={{ background: 'none', border: 'none', color: '#475569', fontSize: '13px', cursor: 'pointer' }}>
            💎 Free ma PDF unlock karvani rite → Marketplace
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '16px' }}>
          {[['🔒', 'Secure'], ['↩️', '7-day refund'], ['⚡', 'Instant']].map(([icon, label]) => (
            <div key={label} style={{ textAlign: 'center', fontSize: '11px', color: '#475569' }}>
              <div style={{ fontSize: '18px' }}>{icon}</div>
              {label}
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: '11px', color: '#334155', marginBottom: '20px' }}>
          Razorpay dwara secure payment. Kabhi bhi cancel kari shakay.
        </p>
      </div>
    </div>
  );
}