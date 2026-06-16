import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      plan,
    } = await request.json();

    // Signature verify
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Plan expiry calculate karo
    const now = Date.now();
    const expiryMap = {
      adfree:      30  * 24 * 60 * 60 * 1000,
      marketplace: 30  * 24 * 60 * 60 * 1000,
      monthly:     30  * 24 * 60 * 60 * 1000,
      halfyearly:  180 * 24 * 60 * 60 * 1000,
      yearly:      365 * 24 * 60 * 60 * 1000,
    };

    const expiresAt = new Date(now + (expiryMap[plan] || expiryMap.monthly));

    // Supabase ma save karo
    await supabase.from('user_premium').upsert({
      user_id: userId,
      plan,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      expires_at: expiresAt.toISOString(),
      is_active: true,
    }, { onConflict: 'user_id' });

    return NextResponse.json({ success: true, expiresAt: expiresAt.toISOString() });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}