import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function GET() {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;

    if (!apiKey) {
      return Response.json({ error: "API key missing" }, { status: 500 });
    }

    const today = new Date().toLocaleDateString("en-IN", {
      year: "numeric", month: "long", day: "numeric",
    });

    const prompt = `Generate 8 important current affairs for ${today} for GPSC/UPSC exam preparation in Gujarati language.
Return ONLY a valid JSON array with no markdown, no explanation, just the array:
[{"title":"headline in Gujarati","summary":"2-3 line summary in Gujarati","category":"National","importance":"High"}]
Categories must be one of: National, International, Economy, Science, Sports
Importance must be one of: High, Medium`;

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
            content: "You are a helpful assistant that generates current affairs for exam preparation. Always respond with valid JSON only, no markdown."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq error:", data);
      throw new Error(data.error?.message || "Groq API error");
    }

    const text = data.choices?.[0]?.message?.content || "[]";
    const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonMatch = clean.match(/\[[\s\S]*\]/);
    
    if (!jsonMatch) {
      throw new Error("Invalid JSON response from AI");
    }
    
    const parsed = JSON.parse(jsonMatch[0]);

    const todayDate = new Date().toISOString().split("T")[0];

    const { error } = await supabase
      .from("daily_current_affairs")
      .upsert(
        { date: todayDate, articles: parsed, generated_at: new Date().toISOString() },
        { onConflict: "date" }
      );

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    return Response.json({ success: true, count: parsed.length });
  } catch (error) {
    console.error("CA Error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}