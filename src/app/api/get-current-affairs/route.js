import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

function extractJson(text) {
  if (!text) return null;
  
  // Try direct parse
  try { return JSON.parse(text.trim()); } catch {}
  
  // Remove markdown
  let clean = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  
  // Find array
  const start = clean.indexOf("[");
  const end = clean.lastIndexOf("]");
  if (start === -1 || end === -1) return null;
  
  const slice = clean.slice(start, end + 1);
  try { return JSON.parse(slice); } catch {}
  
  // Fix common issues
  try {
    const fixed = slice
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']')
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ');
    return JSON.parse(fixed);
  } catch {}
  
  return null;
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

    const prompt = `Generate 8 current affairs news for GPSC exam. Today: ${today}.
Respond with ONLY a JSON array. No explanation. No markdown.
Format: [{"title":"Gujarati headline","summary":"2-3 sentences in Gujarati","category":"National","importance":"High","gujarati_keywords":["word1","word2"]}]
Categories: National, International, Economy, Science, Sports, Gujarat`;

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