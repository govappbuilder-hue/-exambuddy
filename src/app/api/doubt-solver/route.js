// src/app/api/doubt-solver/route.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
);

export async function POST(request) {
  try {
    const { question, history = [] } = await request.json();
    if (!question) return Response.json({ error: "No question" }, { status: 400 });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Build conversation context from history
    const contextLines = history
      .slice(-4)
      .map(m => `${m.role === 'user' ? 'Student' : 'Teacher'}: ${m.text}`)
      .join('\n');

    const systemContext = `તું ExamBuddy નો AI Doubt Solver Teacher છે. 
તારો role: Gujarat ના government exam students (GPSC, UPSC, TET, TAT, Police, Constable, Clerk) ના doubts clear કરવા.

Rules:
- Gujarati ભાષા માં સ્પષ્ટ, simple explanation આપ
- Examples અને mnemonics use કર
- Important points bold style (caps) માં highlight કર
- Exam-relevant tips include કર
- Maximum 300-400 words
- Student English માં પૂછે તો English + Gujarati mix કરી શકો`;

    const prompt = contextLines
      ? `${systemContext}\n\nPrevious conversation:\n${contextLines}\n\nStudent's current question: ${question}`
      : `${systemContext}\n\nStudent's question: ${question}`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    return Response.json({ answer });
  } catch (error) {
    console.error("Doubt solver error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}