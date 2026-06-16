import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
  try {
    const { plan } = await request.json();

    const plans = {
      adfree:      { amount: 2000,  description: 'ExamBuddy Ad-Free - 1 Month' },
      marketplace: { amount: 4900,  description: 'ExamBuddy Marketplace - 1 Month' },
      monthly:     { amount: 9900,  description: 'ExamBuddy Premium - 1 Month' },
      halfyearly:  { amount: 49900, description: 'ExamBuddy Premium - 6 Months' },
      yearly:      { amount: 79900, description: 'ExamBuddy Premium - 1 Year' },
    };

    const selected = plans[plan] || plans.monthly;

    const order = await razorpay.orders.create({
      amount: selected.amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: { plan, description: selected.description },
    });

    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    console.error('Razorpay order error:', error);
    return NextResponse.json({ error: 'Order creation failed' }, { status: 500 });
  }
}