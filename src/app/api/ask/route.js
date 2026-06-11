import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system:
          "You are ExamBuddy AI Doubt Solver for Indian competitive exam students (UPSC, SSC, IBPS, Railway, State PSC). Answer clearly and concisely in a friendly tone. Use bullet points for lists. Add a quick exam tip at the end when relevant. Keep answers focused and practical.",
        messages: [{ role: "user", content: message }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data = await res.json();
    const answer = data.content?.map((c) => c.text || "").join("") || "No response.";
    return NextResponse.json({ answer });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}