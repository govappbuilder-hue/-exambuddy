import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

function extractJsonArray(text) {
  if (!text) return null;
  const clean = text.replace(/```json/gi, "").replace(/```/g, "").trim();
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
  maths: "ગણિત",
  constitution: "ભારતનું બંધારણ",
  history: "ગુજરાતનો ઇતિહાસ",
  geography: "ભૂગોળ",
  science: "સામાન્ય વિજ્ઞાન",
  gujarati: "ગુજરાતી સાહિત્ય",
  computer: "કમ્પ્યૂટર જ્ઞાન",
  reasoning: "રીઝનિંગ",
  english: "English Grammar",
  "current-affairs": "કરંટ અફેર્સ",
  gujarati_sahitya: "ગુજરાતી સાહિત્ય",
  gujarati_vyakran: "ગુજરાતી વ્યાકરણ",
  law: "કાયદો",
  gk: "સામાન્ય જ્ઞાન",
  economics: "અર્થશાસ્ત્ર",
  heritage: "સાંસ્કૃતિક વારસો",
  pub_ad: "જાહેર વહીવટ",
};

function normalizeSubject(subject) {
  return (subject || "").toLowerCase().trim();
}

function getFallbackCards(subject) {
  const key = normalizeSubject(subject);

  const fallbackMap = {
    maths: [
      {
        front: "સંમેયનો સરવાળો શોધવા માટે શું કરવું જોઈએ?",
        back: "અલગ-અલગ સંમેયના મૂલ્યોને સમાન હૃદયમાં ફેરવીને સરવાળો કરો.",
      },
      {
        front: "જ्यामિતીમાં લંબચોરસની પરિમિતિનો સૂત્ર શું છે?",
        back: "2 × (લંબાઈ + પહોળાઈ)",
      },
      {
        front: "વર્ગમૂળના મૂળભૂત નિયમ શું છે?",
        back: "√(a × b) = √a × √b",
      },
    ],
    constitution: [
      {
        front: "ભારતનો બંધારણ ક્યારે સ્વીકૃત થયો હતો?",
        back: "26 જાન્યુઆરી 1949ના દિવસે સ્વીકૃત થયેલ અને 26 જાન્યુઆરી 1950થી અમલમાં આવ્યો.",
      },
      {
        front: "બંધારણના પ્રારંભિક ભાગને શું કહે છે?",
        back: "પ્રસ્તાવના",
      },
    ],
    history: [
      {
        front: "ગુજરાતનો સૌથી પ્રખ્યાત શાહુનુ રાજ્ય કયું હતું?",
        back: "સોલંકી અને બુદ્ધિકરણ રાજ્ય તરીકે ગુજરાતનો ઇતિહાસ મહત્વપૂર્ણ છે.",
      },
    ],
    geography: [
      {
        front: "સૂર્યના પ્રકાશથી જળવાયુ બદલાય છે?",
        back: "હા, સૂર્યપ્રકાશ અને હવા circulation દ્વારા જળવાયુ બદલાય છે.",
      },
    ],
    science: [
      {
        front: "સેલનું મુખ્ય કાર્ય શું છે?",
        back: "જીવનરક્ષણ અને વૃદ્ધિ માટે જરૂરી પjaarsણીઓ કરવી.",
      },
    ],
  };

  return (fallbackMap[key] || fallbackMap.maths).map((card) => ({ ...card }));
}

function shuffleCards(cards) {
  return [...cards].sort(() => Math.random() - 0.5);
}

function getCacheKey(subject) {
  const today = new Date().toISOString().slice(0, 10);
  return `${normalizeSubject(subject)}_${today}`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const subject = normalizeSubject(body?.subject);

    if (!subject) {
      return Response.json({ error: "Subject required" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    const subjectName = SUBJECT_NAMES[subject] || subject;
    const prompt = `Generate 20 important flashcards for "${subjectName}" topic for Gujarat government exam preparation (GPSC, GSSSB, Police).
Each flashcard should have a short question/term on front and a concise answer/definition on back, in Gujarati language.
Respond with ONLY this JSON array format, nothing else:
[{"front":"પ્રશ્ન અથવા ટર્મ","back":"જવાબ અથવા સમજૂતી"}]`;

    let parsed = [];

    if (apiKey) {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "You are a JSON API. You ONLY respond with a raw JSON array. No markdown, no code fences, no explanation.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.6,
          max_tokens: 3000,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        const text = data.choices?.[0]?.message?.content || "";
        const parsedResponse = extractJsonArray(text);
        if (Array.isArray(parsedResponse) && parsedResponse.length > 0) {
          parsed = parsedResponse;
        }
      }
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      parsed = getFallbackCards(subject);
    }

    const cacheKey = getCacheKey(subject);

    try {
      await supabase.from("flashcards").upsert(
        { subject: cacheKey, cards: parsed, generated_at: new Date().toISOString() },
        { onConflict: "subject" }
      );
    } catch (dbError) {
      console.error("Flashcard save error:", dbError);
    }

    return Response.json({ success: true, cards: shuffleCards(parsed) });
  } catch (error) {
    console.error("Flashcard Error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = normalizeSubject(searchParams.get("subject"));

    if (!subject) {
      return Response.json({ cards: [] });
    }

    const cacheKey = getCacheKey(subject);

    const { data, error } = await supabase
      .from("flashcards")
      .select("*")
      .eq("subject", cacheKey)
      .single();

    if (error || !data?.cards) {
      return Response.json({ cards: shuffleCards(getFallbackCards(subject)) });
    }

    return Response.json({ cards: shuffleCards(data.cards || []) });
  } catch (error) {
    return Response.json({ cards: [] });
  }
}