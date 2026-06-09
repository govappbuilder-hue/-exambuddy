import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
);

export async function generateQuizAI(topic) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Generate 5 multiple choice questions about "${topic}" for Gujarat government exam students.
Return ONLY a valid JSON array, no markdown, no explanation:
[
  {
    "question": "question in Gujarati",
    "a": "option A",
    "b": "option B", 
    "c": "option C",
    "d": "option D",
    "correct_option": "a",
    "subject": "${topic}",
    "explanation": "brief explanation in Gujarati"
  }
]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonMatch = clean.match(/\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
}