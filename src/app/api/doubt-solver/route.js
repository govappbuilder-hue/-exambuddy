// ✅ FIX: Use new @google/genai package instead of deprecated @google/generative-ai
import { GoogleGenAI } from "@google/genai";

export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

    const { question, history } = await request.json();

    if (!question) {
      return Response.json({ error: "No question provided" }, { status: 400 });
    }
    if (!apiKey) {
      return Response.json({ error: "Gemini API key is missing on the server" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const contextLines = history
      ? history
          .slice(-4)
          .map((m) => `${m.role === "user" ? "Student" : "Teacher"}: ${m.text}`)
          .join("\n")
      : "";

    const systemContext = `તમે ExamBuddy ના AI Doubt Solver Teacher છો.
તમારો રોલ: Gujarat ના government exam students (GPSC, UPSC, TET, TAT, Police, Constable, Clerk) ના doubts clear કરવાનો છે.

Rules:
- Gujarati ભાષામાં જ સરળ, simple explanation આપવું.
- Examples અને mnemonics નો ઉપયોગ કરવો.
- Important points bold style (markdown) માં highlight કરવા.
- Exam-relevant tips include કરવી.
- Maximum 300-400 words.
- Student English માં પૂછે તો પણ English + Gujarati mix માં જ ઉત્તર આપવો.`;

    const prompt = `${systemContext}\n\nPrevious conversation:\n${contextLines}\n\nStudent's current question: ${question}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const answer = response.text;

    return Response.json({ answer });
  } catch (error) {
    console.error("Doubt solver error:", error);
    return Response.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}