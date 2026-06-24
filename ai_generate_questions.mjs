import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// ⚠️ Tamari LIVE Vercel URL niche nakho (https:// sahit, last ma / nahi)
const LIVE_URL = "https://exambuddy-ochre.vercel.app";

const SUBJECTS = [
  { key: 'geography', name: 'ભૂગોળ (Gujarat & India Geography)' },
  { key: 'science', name: 'સામાન્ય વિજ્ઞાન (General Science)' },
  { key: 'constitution', name: 'ભારતીય બંધારણ (Indian Constitution)' },
  { key: 'economics', name: 'અર્થશાસ્ત્ર (Indian Economy)' },
  { key: 'gujarati', name: 'ગુજરાતી ભાષા-વ્યાકરણ (Gujarati Grammar)' },
  { key: 'english', name: 'English Grammar' },
  { key: 'gk', name: 'સામાન્ય જ્ઞાન (General Knowledge - Gujarat focus)' },
  { key: 'polity', name: 'રાજ્યશાસ્ત્ર (Indian Polity)' },
  { key: 'computer', name: 'કોમ્પ્યુટર (Basic Computer Knowledge)' },
  { key: 'reasoning', name: 'તર્કશક્તિ (Logical Reasoning)' },
  { key: 'gujarati_sahitya', name: 'ગુજરાતી સાહિત્ય (Gujarati Literature)' },
  { key: 'gujarati_vyakran', name: 'ગુજરાતી વ્યાકરણ (Gujarati Grammar Advanced)' },
  { key: 'law', name: 'કાયદો (Basic Law & Acts)' },
  { key: 'heritage', name: 'વારસો અને સંસ્કૃતિ (Gujarat Heritage & Culture)' },
  { key: 'pub_ad', name: 'જાહેર વહીવટ (Public Administration)' },
  { key: 'history', name: 'ઇતિહાસ (Gujarat & India History)' },
];

const TOTAL_PER_SUBJECT = 200;
const BATCH_SIZE = 10;
const BATCHES_PER_SUBJECT = TOTAL_PER_SUBJECT / BATCH_SIZE; // 20 batches
const GEMINI_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const ADMIN_TOKEN = process.env.ADMIN_SECRET_TOKEN;

if (!GEMINI_KEY || !ADMIN_TOKEN)
 {
  console.error("❌ GROQ_API_KEY ya ADMIN_SECRET_TOKEN .env.local ma nathi malta!");
  process.exit(1);
}

function extractJson(raw) {
  let clean = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  let slice = clean.slice(start, end + 1);
  try { return JSON.parse(slice); } catch {}
  try {
    const fixed = slice.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
    return JSON.parse(fixed);
  } catch {}
  return null;
}

async function generateBatch(subject, batchNum) {
  const prompt = `તમે ગુજરાત સ્પર્ધાત્મક પરીક્ષા (GPSC/GSSSB/Talati/PSI) માટે MCQ નિષ્ણાત છો.
વિષય: ${subject.name}
ફક્ત ${BATCH_SIZE} અલગ-અલગ, ઉચ્ચ ગુણવત્તાવાળા MCQ બનાવો (batch ${batchNum}, અલગ ટોપિક રાખો, repeat ના થાય).
ફક્ત આ JSON ફોર્મેટમાં જવાબ આપો, બીજું કંઈ નહીં, markdown નહીં, કોઈ વધારાનું ટેક્સ્ટ નહીં:
{
  "questions": [
    {
      "question": "ગુજરાતીમાં પ્રશ્ન",
      "a": "વિકલ્પ A",
      "b": "વિકલ્પ B",
      "c": "વિકલ્પ C",
      "d": "વિકલ્પ D",
      "correct_option": "a",
      "explanation": "ટૂંકી સમજૂતી ગુજરાતીમાં"
    }
  ]
}`;

  async function callGroq(prompt) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (res.status === 429) {
    console.log('⏳ Rate limit — 30 second rahi ne retry...');
    await new Promise(r => setTimeout(r, 30000));
    return callGroq(prompt);
  }
  if (!res.ok) {
    console.error(`❌ Gemini API error: ${res.status}`);
    return null;
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content?.trim() || '';
  const parsed = extractJson(raw);

  if (!parsed?.questions) {
    console.error(`❌ JSON parse fail batch ${batchNum} for ${subject.key}`);
    return [];
  }

  return parsed.questions.map(q => ({ ...q, subject: subject.key, exam_tag: 'GPSC, GSSSB, Talati' }));
}

async function generateForSubject(subject) {
  console.log(`\n⏳ "${subject.name}" mate questions generate thay che (${BATCHES_PER_SUBJECT} batches)...`);
  let all = [];
  for (let i = 1; i <= BATCHES_PER_SUBJECT; i++) {
    const batch = await generateBatch(subject, i);
    console.log(`  ✅ Batch ${i}: ${batch.length} questions`);
    all = [...all, ...batch];
    await new Promise(r => setTimeout(r, 8000));
  }
  return all;
}

async function uploadQuestions(questions) {
  const res = await fetch(`${LIVE_URL}/api/bulk-upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questions, adminToken: ADMIN_TOKEN }),
  });
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { return { success: false, error: `Non-JSON response (status ${res.status}): ${text.slice(0, 200)}` }; }
}

async function main() {
  let allQuestions = [];

  for (const subject of SUBJECTS) {
    const qs = await generateForSubject(subject);
    allQuestions = [...allQuestions, ...qs];
    await new Promise(r => setTimeout(r, 10000));
  }

  fs.writeFileSync('./ai_questions_backup.json', JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log(`\n📂 Total ${allQuestions.length} questions "ai_questions_backup.json" ma save thaya (backup mate).`);

  if (allQuestions.length === 0) {
    console.error('\n❌ Koi questions generate na thaya, upload skip kari che.');
    return;
  }

  console.log(`\n🚀 Have Supabase ma upload thay che (${LIVE_URL})...`);
  const result = await uploadQuestions(allQuestions);

  if (result.success) {
    console.log(`\n🥳 DHAMAKA! ${result.inserted} questions live thai gaya!`);
  } else {
    console.error(`\n❌ Upload error: ${result.error}`);
  }
}

main();