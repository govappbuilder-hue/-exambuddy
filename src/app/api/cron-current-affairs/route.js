import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function GET() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const today = new Date().toLocaleDateString("gu-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const prompt = `Aaj na ${today} na GPSC/UPSC exam mate important current affairs Gujarati ma generate karo.
Return ONLY valid JSON array, no markdown:
[
  {
    "title": "headline Gujarati ma",
    "summary": "2-3 line summary Gujarati ma",
    "category": "National/International/Economy/Science/Sports",
    "importance": "High/Medium/Low"
  }
]
Exactly 8 items generate karo.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonMatch = clean.match(/\[[\s\S]*\]/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    const today2 = new Date().toISOString().split("T")[0];

    const { error } = await supabase.from("current_affairs").upsert(
      {
        date: today2,
        articles: parsed,
        generated_at: new Date().toISOString(),
      },
      { onConflict: "date" }
    );

    if (error) throw error;

    return Response.json({ success: true, count: parsed.length });
  } catch (error) {
    console.error("CA Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}