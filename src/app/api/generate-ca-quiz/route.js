import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
);

function extractJson(text) {
  const clean = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const match = clean.match(/\[[\s\S]*\]/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
}

export async function POST(request) {
  try {
    const { articles } = await request.json();

    if (!articles || articles.length === 0) {
      return Response.json({ error: "No articles provided" }, { status: 400 });
    }

    const articleText = articles
      .map((a, i) => `${i + 1}. ${a.title} — ${a.summary}`)
      .join("\n");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `નીચે આપેલ current affairs ના આધારે GPSC/UPSC exam માટે 8 MCQ questions બનાવો.
દરેક question Gujarati માં હોવો જોઈએ. Correct answer સ્પષ્ટ હોવો જોઈએ.

Current Affairs:
${articleText}

Return ONLY valid JSON array, no markdown:
[
  {
    "question": "question in Gujarati",
    "option_a": "option A text",
    "option_b": "option B text",
    "option_c": "option C text",
    "option_d": "option D text",
    "correct_answer": "A",
    "explanation": "brief explanation in Gujarati",
    "article_title": "related article title"
  }
]
correct_answer must be exactly one of: A, B, C, D`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const questions = extractJson(text);

    if (!questions || questions.length === 0) {
      return Response.json({ error: "Could not generate questions" }, { status: 500 });
    }

    return Response.json({ questions });
  } catch (error) {
    console.error("CA Quiz error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}