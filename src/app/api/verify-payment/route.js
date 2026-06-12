import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, plan } = await request.json();

    // Signature verify kariye
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Premium expiry set kariye
    const expiresAt = new Date();
    if (plan === 'yearly') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    // Supabase ma premium status save kariye
    const { error } = await supabaseAdmin
      .from('user_premium')
      .upsert({
        user_id: userId,
        plan,
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        expires_at: expiresAt.toISOString(),
        is_active: true,
        created_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('Supabase error:', error);
      // Payment verify thayeli che, DB error hoy to pan success return kariye
    }

    return NextResponse.json({ success: true, expiresAt: expiresAt.toISOString() });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}