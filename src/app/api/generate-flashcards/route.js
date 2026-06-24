import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

function extractJsonArray(text) {
  if (!text) return null;
  let clean = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = clean.indexOf("[");
  const end = clean.lastIndexOf("]");
  if (start === -1 || end === -1 || end < start) return null;
  try {
    return JSON.parse(clean.slice(start, end + 1));
  } catch {
    return null;
  }
}

const SUBJECT_NAMES = {
  maths: "ગણિત", constitution: "ભારતનું બંધારણ",
  history: "ગુજરાતનો ઇતિહાસ", geography: "ભૂગોળ",
  science: "સામાન્ય વિજ્ઞાન", gujarati: "ગુજરાતી સાહિત્ય",
  computer: "કમ્પ્યૂટર જ્ઞાન", reasoning: "રીઝનિંગ",
  english: "English Grammar", "current-affairs": "કરંટ અફેર્સ",
  gujarati_sahitya: "ગુજરાતી સાહિત્ય", gujarati_vyakran: "ગુજરાતી વ્યાકરણ",
  law: "કાયદો", gk: "સામાન્ય જ્ઞાન", economics: "અર્થશાસ્ત્ર",
  heritage: "સાંસ્કૃતિક વારસો", pub_ad: "જાહેર વહીવટ",
};

export async function POST(request) {
  try {
    const { subject } = await request.json();
    if (!subject) {
      return Response.json({ error: "Subject required" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "API key missing" }, { status: 500 });
    }

    const subjectName = SUBJECT_NAMES[subject] || subject;

    const prompt = `Generate 20 important flashcards for "${subjectName}" topic for Gujarat government exam preparation (GPSC, GSSSB, Police).
Each flashcard should have a short question/term on front and a concise answer/definition on back, in Gujarati language.
Respond with ONLY this JSON array format, nothing else:
[{"front":"પ્રશ્ન અથવા ટર્મ","back":"જવાબ અથવા સમજૂતી"}]`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a JSON API. You ONLY respond with a raw JSON array. No markdown, no code fences, no explanation."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 3000,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || "Groq API error");
    }

    const text = data.choices?.[0]?.message?.content || "";
    const parsed = extractJsonArray(text);

    if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("Invalid JSON response from AI");
    }

    // Date-wise cache key — har divas navi cards generate thay
    const today = new Date().toISOString().slice(0, 10);
    const cacheKey = `${subject}_${today}`;

    const { error: dbError } = await supabase
      .from("flashcards")
      .upsert(
        { subject: cacheKey, cards: parsed, generated_at: new Date().toISOString() },
        { onConflict: "subject" }
      );

    if (dbError) console.error("Flashcard save error:", dbError.message);

    // Shuffle order before sending
    const shuffled = [...parsed].sort(() => Math.random() - 0.5);
    return Response.json({ success: true, cards: shuffled });

  } catch (error) {
    console.error("Flashcard Error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get("subject");

    const today = new Date().toISOString().slice(0, 10);
    const cacheKey = `${subject}_${today}`;

    const { data, error } = await supabase
      .from("flashcards")
      .select("*")
      .eq("subject", cacheKey)
      .single();

    if (error || !data) {
      return Response.json({ cards: [] });
    }

    // Shuffle order every time so it feels fresh
    const shuffled = [...(data.cards || [])].sort(() => Math.random() - 0.5);
    return Response.json({ cards: shuffled });
  } catch (error) {
    return Response.json({ cards: [] });
  }
}