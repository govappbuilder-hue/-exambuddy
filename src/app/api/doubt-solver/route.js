export async function POST(request) {
  try {
    const apiKey = process.env.GROQ_API_KEY || "";
    const { question, history } = await request.json();

    if (!question) {
      return Response.json({ error: "No question provided" }, { status: 400 });
    }
    if (!apiKey) {
      return Response.json({ error: "GROQ API key missing" }, { status: 500 });
    }

    const contextMessages = history
      ? history.slice(-4).map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.text,
        }))
      : [];

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1024,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: `You are ExamBuddy AI Doubt Solver for Indian competitive exam students (UPSC, SSC, IBPS, GPSC, TET, TAT, Police, Clerk). 
Answer clearly and concisely in a friendly tone.
- Use bullet points for lists
- Add a quick exam tip at the end when relevant  
- Keep answers under 300 words
- If asked in Gujarati, reply in Gujarati. If English, reply in English.`,
          },
          ...contextMessages,
          { role: "user", content: question },
        ],
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return Response.json({ error: data.error?.message || "GROQ API error" }, { status: 500 });
    }

    const answer = data.choices?.[0]?.message?.content || "No response generated.";
    return Response.json({ answer });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}