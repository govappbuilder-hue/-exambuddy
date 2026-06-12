// Using fetch directly - no package dependency issues
export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    const { question, history } = await request.json();

    if (!question) {
      return Response.json({ error: "No question provided" }, { status: 400 });
    }
    if (!apiKey) {
      return Response.json({ error: "Gemini API key is missing" }, { status: 500 });
    }

    const contextLines = history
      ? history.slice(-4).map((m) =>
          `${m.role === "user" ? "Student" : "Teacher"}: ${m.text}`
        ).join("\n")
      : "";

    const prompt = `You are ExamBuddy AI Doubt Solver for Indian competitive exam students (UPSC, SSC, IBPS, GPSC, TET, TAT). Answer clearly and concisely. Add exam tips when relevant. Keep under 300 words.

${contextLines ? `Previous conversation:\n${contextLines}\n\n` : ""}Student question: ${question}`;

    // ✅ Use v1 API directly via fetch - works with any Gemini API key
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return Response.json({ error: data.error?.message || "Gemini API error" }, { status: 500 });
    }

    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
    return Response.json({ answer });

  } catch (error) {
    console.error("Doubt solver error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}