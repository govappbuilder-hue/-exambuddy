export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    const { question, history } = await request.json();

    if (!question) {
      return Response.json({ error: "No question provided" }, { status: 400 });
    }
    if (!apiKey) {
      return Response.json({ error: "Gemini API key missing" }, { status: 500 });
    }

    // Try models in order until one works
    const models = [
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite", 
      "gemini-1.5-flash",
      "gemini-1.5-flash-latest",
      "gemini-1.0-pro",
    ];

    const contextLines = history
      ? history.slice(-4).map((m) =>
          `${m.role === "user" ? "Student" : "Teacher"}: ${m.text}`
        ).join("\n")
      : "";

    const prompt = `You are ExamBuddy AI Doubt Solver for Indian competitive exam students (UPSC, SSC, IBPS, GPSC). Answer clearly and concisely with exam tips. Keep under 300 words.

${contextLines ? `Previous conversation:\n${contextLines}\n\n` : ""}Student question: ${question}`;

    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
    });

    // Try each model
    for (const model of models) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body }
      );
      const data = await res.json();

      if (res.ok) {
        const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
        return Response.json({ answer, model_used: model });
      }
      // If model not found, try next
      if (data.error?.code === 404) continue;
      // Other error - return it
      return Response.json({ error: data.error?.message || "API error" }, { status: 500 });
    }

    return Response.json({ error: "No available Gemini model found for this API key" }, { status: 500 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}