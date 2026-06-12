import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request) {
  try {
    // Try all possible env variable names
    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      "";

    const { question, history } = await request.json();

    if (!question) {
      return Response.json({ error: "No question provided" }, { status: 400 });
    }

    // Return exact error so we can debug
    if (!apiKey) {
      return Response.json({
        error: "API key missing. Available env vars: " +
          Object.keys(process.env)
            .filter(k => k.includes("GEMINI") || k.includes("GOOGLE") || k.includes("API"))
            .join(", ")
      }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const contextLines = history
      ? history.slice(-4).map((m) =>
          `${m.role === "user" ? "Student" : "Teacher"}: ${m.text}`
        ).join("\n")
      : "";

    const prompt = `You are ExamBuddy AI Doubt Solver for Indian competitive exam students (UPSC, SSC, IBPS, GPSC). Answer clearly in simple English or Gujarati based on the question. Keep it concise and exam-focused.

Previous conversation:
${contextLines}

Student question: ${question}`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    return Response.json({ answer });
  } catch (error) {
    console.error("Doubt solver error:", error.message);
    // Return full error for debugging
    return Response.json({
      error: error.message || "Internal Server Error",
      stack: error.stack?.split('\n')[0]
    }, { status: 500 });
  }
}