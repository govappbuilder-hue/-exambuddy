import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function GET() {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;

    const today = new Date().toLocaleDateString("gu-IN", {
      year: "numeric", month: "long", day: "numeric",
    });

    const prompt = `Aaj na ${today} na GPSC/UPSC exam mate 8 important current affairs Gujarati ma generate karo.
Return ONLY valid JSON array, no markdown:
[{"title":"headline","summary":"2-3 line summary","category":"National","importance":"High"}]`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error?.message || "Groq API error");

    const text = data.choices?.[0]?.message?.content || "[]";
    const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonMatch = clean.match(/\[[\s\S]*\]/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    const todayDate = new Date().toISOString().split("T")[0];

    const { error } = await supabase
      .from("daily_current_affairs")
      .upsert(
        { date: todayDate, articles: parsed, generated_at: new Date().toISOString() },
        { onConflict: "date" }
      );

    if (error) throw error;

    return Response.json({ success: true, count: parsed.length });
  } catch (error) {
    console.error("CA Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}