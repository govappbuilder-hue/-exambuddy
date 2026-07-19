import { createClient } from '@supabase/supabase-js';
import { getDoubtSolverFallbackMessage } from '../../../lib/doubt-solver-utils.mjs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function POST(request) {
  try {
    const apiKey = process.env.GROQ_API_KEY || "";
    const { question, history, userId } = await request.json();

    if (!question) {
      return Response.json({ error: "No question provided" }, { status: 400 });
    }
    if (!apiKey) {
      return Response.json({ error: getDoubtSolverFallbackMessage('missing api key') }, { status: 500 });
    }

    // ✅ Auth + Premium Check
    if (!userId) {
      return Response.json({ error: "Login karvo jaroori che" }, { status: 401 });
    }

    const { data: premium } = await supabase
      .from('user_premium')
      .select('is_active, expires_at')
      .eq('user_id', userId)
      .single();

    const isPremium = premium?.is_active && new Date(premium.expires_at) > new Date();
    // Free users ne pan allow karo — daily limit frontend (localStorage) thi control thay che

    const contextMessages = history
      ? history.slice(-4).map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.text,
        }))
      : [];

    let res;
    try {
      res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
    } catch (fetchError) {
      return Response.json({ answer: getDoubtSolverFallbackMessage(fetchError?.message || 'fetch failed') }, { status: 200 });
    }

    let data = {};
    try {
      data = await res.json();
    } catch (parseError) {
      return Response.json({ answer: getDoubtSolverFallbackMessage(parseError?.message || 'invalid json') }, { status: 200 });
    }

    if (!res.ok) {
      const errorMessage = data.error?.message || data.message || 'GROQ API error';
      return Response.json({ answer: getDoubtSolverFallbackMessage(errorMessage) }, { status: 200 });
    }

    const answer = data.choices?.[0]?.message?.content || "No response generated.";
    return Response.json({ answer });

  } catch (error) {
    return Response.json({ answer: getDoubtSolverFallbackMessage(error?.message || 'unknown error') }, { status: 200 });
  }
}