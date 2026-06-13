import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

function extractJson(text) {
  if (!text) return null;
  let clean = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = clean.indexOf("[");
  const end = clean.lastIndexOf("]");
  if (start === -1 || end === -1) return null;
  try { return JSON.parse(clean.slice(start, end + 1)); } catch { return null; }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const generate = searchParams.get("generate") === "true";

    // Cache check
    const { data, error } = await supabase
      .from("daily_current_affairs")
      .select("*")
      .eq("date", date)
      .single();

    if (!error && data?.articles?.length > 0 && !generate) {
      return Response.json({ articles: data.articles, source: "cache" });
    }

    if (!generate) {
      return Response.json({ articles: [], source: "empty" });
    }

    // Gemini API use karo
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return Response.json({ articles: [], error: "No API key" });

    const today = new Date().toLocaleDateString("en-IN", {
      year: "numeric", month: "long", day: "numeric"
    });

    const prompt = `Generate 8 important current affairs for ${today} for GPSC/UPSC exam preparation in Gujarat.
Return ONLY this JSON array, no other text:
[{"title":"News headline in Gujarati","summary":"2-3 sentence explanation in Gujarati relevant for GPSC exam","category":"National","importance":"High","gujarati_keywords":["keyword1","keyword2"]}]
Categories: National, International, Economy, Science, Sports, Gujarat
Importance: High or Medium`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 3000 }
        })
      }
    );

    const geminiData = await res.json();
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const articles = extractJson(text);

    if (!articles || articles.length === 0) {
      return Response.json({ articles: [], source: "empty", error: "Parse failed" });
    }

    // Save to Supabase
    await supabase.from("daily_current_affairs").upsert({
      date, articles, created_at: new Date().toISOString()
    }, { onConflict: "date" });

    return Response.json({ articles, source: "generated" });

  } catch (err) {
    console.error("Current affairs error:", err);
    return Response.json({ articles: [], error: err.message });
  }
}