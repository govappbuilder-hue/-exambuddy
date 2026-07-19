import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminSession } from '../../../lib/admin-auth.mjs';
import { validateSubject } from '../../../lib/input-validation.mjs';

// Service Role Key vaapriye — bulk insert mate
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function POST(request) {
  try {
    const { questions, adminToken } = await request.json();
    const headerToken = request.headers.get('x-admin-session');
    const cookie = request.headers.get('cookie') || '';
    const cookieToken = cookie.split(';').map(part => part.trim()).find(part => part.startsWith('admin_session='))?.split('=')[1];
    const effectiveToken = adminToken || headerToken || cookieToken;

    if (!verifyAdminSession(effectiveToken)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'No questions provided' }, { status: 400 });
    }

    const subjectMap = {
      'ગણિત': 'maths', 'maths': 'maths',
      'ઇતિહાસ': 'history', 'history': 'history',
      'ભૂગોળ': 'geography', 'geography': 'geography',
      'વિજ્ઞાન': 'science', 'science': 'science',
      'બંધારણ': 'constitution', 'constitution': 'constitution',
      'અર્થશાસ્ત્ર': 'economics', 'economics': 'economics',
      'ગુજરાતી': 'gujarati', 'gujarati': 'gujarati',
      'english': 'english', 'English': 'english',
      'gk': 'gk', 'સામાન્ય જ્ઞાન': 'gk',
      'reasoning': 'reasoning', 'રીઝનિંગ': 'reasoning', 'તર્કશક્તિ': 'reasoning',
      'computer': 'computer', 'કોમ્પ્યૂટર': 'computer', 'કોમ્પ્યુટર': 'computer',
      'current_affairs': 'current-affairs', 'current-affairs': 'current-affairs', 'કરંટ અફેર્સ': 'current-affairs',
      'polity': 'polity', 'રાજ્યશાસ્ત્ર': 'polity',
      'gujarati_sahitya': 'gujarati_sahitya', 'ગુ. સાહિત્ય': 'gujarati_sahitya',
      'gujarati_vyakran': 'gujarati_vyakran', 'ગુ. વ્યાકરણ': 'gujarati_vyakran',
      'law': 'law', 'કાયદો': 'law',
      'heritage': 'heritage', 'વારસો': 'heritage',
      'pub_ad': 'pub_ad', 'જાહેર વહીવટ': 'pub_ad',
    };

    const optMap = { 'a': 0, 'b': 1, 'c': 2, 'd': 3 };

    const formatted = questions.map(item => {
      const rawSubject = item.subject;
      const mappedSubject = subjectMap[rawSubject] || (typeof rawSubject === 'string' ? rawSubject.toLowerCase() : '');
      const subject = validateSubject(mappedSubject) ? mappedSubject : 'gk';

      return {
        subject,
        question: item.question || item.question_text,
      option_a: item.a || item.option_a,
      option_b: item.b || item.option_b,
      option_c: item.c || item.option_c,
      option_d: item.d || item.option_d,
      correct_answer: typeof item.correct_option === 'string' && item.correct_option.length === 1
        ? item.correct_option.toUpperCase()
        : ['A','B','C','D'][item.correct_option] || 'A',
        explanation: item.explanation || '',
        exam_tag: item.exam_tag || '',
      };
    });

    const chunkSize = 200;
    let totalInserted = 0;
    for (let i = 0; i < formatted.length; i += chunkSize) {
      const chunk = formatted.slice(i, i + chunkSize);
      const { error } = await supabaseAdmin.from('questions').insert(chunk);
      if (error) throw error;
      totalInserted += chunk.length;
    }

    return NextResponse.json({ success: true, inserted: totalInserted });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}