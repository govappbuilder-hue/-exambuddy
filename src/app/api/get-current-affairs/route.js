import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

function extractJson(text) {
  if (!text) return null;
  try { return JSON.parse(text.trim()); } catch {}
  let clean = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = clean.indexOf("[");
  const end = clean.lastIndexOf("]");
  if (start === -1 || end === -1) return null;
  const slice = clean.slice(start, end + 1);
  try { return JSON.parse(slice); } catch {}
  try {
    const fixed = slice.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
    return JSON.parse(fixed);
  } catch {}
  return null;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const generate = searchParams.get("generate") === "true";

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

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return Response.json({ articles: [], error: "No GROQ API key" });

    const today = new Date().toLocaleDateString("en-IN", {
      year: "numeric", month: "long", day: "numeric"
    });

    const prompt = `Generate 8 important current affairs for ${today} for GPSC/UPSC exam preparation in Gujarati language.
Respond with ONLY this JSON array format, nothing else:
[{"title":"headline in Gujarati","summary":"2-3 line summary in Gujarati","category":"National","importance":"High"}]
Categories must be one of: National, International, Economy, Science, Sports
Importance must be one of: High, Medium`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
        temperature: 0.5,
        max_tokens: 2000,
      }),
    });

    const groqData = await res.json();
    const text = groqData.choices?.[0]?.message?.content || "";
    const articles = extractJson(text);

    if (!articles || articles.length === 0) {
      return Response.json({ articles: [], source: "empty", error: "Parse failed", raw: text.substring(0, 300) });
    }

    await supabase.from("daily_current_affairs").upsert(
      { date, articles, generated_at: new Date().toISOString() },
      { onConflict: "date" }
    );

    return Response.json({ articles, source: "generated" });

  } catch (err) {
    console.error("Current affairs error:", err);
    return Response.json({ articles: [], error: err.message });
  }
}