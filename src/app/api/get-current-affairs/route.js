import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// Helper: Groq call
async function callGroq(prompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY missing");

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
          content: "You are a JSON API. Respond ONLY with a raw JSON array. No markdown, no explanation."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 2000,
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "Groq error");
  return data.choices?.[0]?.message?.content || "";
}

// Helper: JSON extract
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

    // 1. Supabase ma check karo
    const { data, error } = await supabase
      .from("daily_current_affairs")
      .select("*")
      .eq("date", date)
      .single();

    if (!error && data?.articles?.length > 0) {
      return Response.json({ articles: data.articles, source: "cache" });
    }

    // 2. Generate=true hoy to Groq thi banavo
    if (generate) {
      const today = new Date().toLocaleDateString("en-IN", {
        year: "numeric", month: "long", day: "numeric"
      });

      const prompt = `Generate 8 important current affairs for ${today} for GPSC/UPSC exam preparation.
Return ONLY this JSON array:
[
  {
    "title": "News headline in Gujarati",
    "summary": "2-3 sentence explanation in Gujarati relevant for GPSC exam",
    "category": "National",
    "importance": "High",
    "gujarati_keywords": ["keyword1", "keyword2"]
  }
]
Categories must be one of: National, International, Economy, Science, Sports, Gujarat
Importance must be: High or Medium`;

      const raw = await callGroq(prompt);
      const articles = extractJson(raw);

      if (articles && articles.length > 0) {
        // Supabase ma save karo
        await supabase.from("daily_current_affairs").upsert({
          date,
          articles,
          created_at: new Date().toISOString()
        });
        return Response.json({ articles, source: "generated" });
      }
    }

    return Response.json({ articles: [], source: "empty" });
  } catch (err) {
    console.error("Current affairs error:", err);
    return Response.json({ articles: [], error: err.message });
  }
}