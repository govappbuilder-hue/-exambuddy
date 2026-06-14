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
        max_tokens: 3000,
        temperature: 0.7,
        messages: [
          {
            role: "system",
           content: `You are ExamBuddy AI, a specialist doubt solver for Gujarat Government exam students.
Target exams: GPSC Class 1-2, GPSC Class 3, PSI/ASI, Talati, Bin Sachivalay, GSSSB, Head Clerk, Revenue Talati, Forest Guard, Constable, Nayab Mamlatdar, DYSO.

Rules:
- If asked in Gujarati, ALWAYS reply in Gujarati
- If asked in English, reply in English
- Use bullet points for lists
- Give exam-specific tips (mention which Gujarat exam this topic appears in)
- Keep answers under 300 words
- End with: "📌 Exam Tip:" relevant to Gujarat gov exams
- For Maths/Reasoning, show step-by-step solution`, 
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