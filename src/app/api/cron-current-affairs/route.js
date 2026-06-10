import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function GET() {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Gemini API key missing!' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const todayStr = new Date().toISOString().split('T')[0];

    const prompt = `
આજની તારીખ ${todayStr} છે. Gujarat ના GPSC/GSSSB/Police exam ના students માટે આજના top 5 current affairs Gujarati ma generate karo.

Return ONLY valid JSON (no markdown, no explanation):
{
  "bullet_points": [
    "સમાચાર ૧ - વિગતવાર",
    "સમાચાર ૨ - વિગતવાર", 
    "સમાચાર ૩ - વિગતવાર",
    "સમાચાર ૪ - વિગતવાર",
    "સમાચાર ૫ - વિગતવાર"
  ],
  "quiz_questions": [
    {
      "question": "પ્રશ્ન Gujarati ma?",
      "a": "વિકલ્પ A",
      "b": "વિકલ્પ B",
      "c": "વિકલ્પ C", 
      "d": "વિકલ્પ D",
      "correct_option": "a"
    }
  ]
}

Generate 5 quiz questions based on the bullet points.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(clean);

    // Delete today's old record if exists
    await supabase
      .from('daily_current_affairs')
      .delete()
      .eq('news_date', todayStr);

    // Insert new
    const { error } = await supabase
      .from('daily_current_affairs')
      .insert({
        news_date: todayStr,
        bullet_points: parsed.bullet_points,
        quiz_questions: parsed.quiz_questions
      });

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      message: 'આજના સમાચાર ready!',
      count: parsed.bullet_points.length
    });

  } catch (error) {
    console.error('CA Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}