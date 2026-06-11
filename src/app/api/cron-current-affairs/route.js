import { createClient } from "@supabase/supabase-js";

// Supabase ક્લાયન્ટ ઇનિશિયલાઇઝેશન
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// AI ના રિસ્પોન્સમાંથી શુદ્ધ JSON Array કાઢવા માટેનું હેલ્પર ફંક્શન
function extractJsonArray(text) {
  if (!text) return null;
  let clean = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = clean.indexOf("[");
  const end = clean.lastIndexOf("]");
  if (start === -1 || end === -1 || end < start) return null;
  const jsonStr = clean.slice(start, end + 1);
  try {
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

// Groq API કૉલ કરવાનું ફંક્શન
async function callGroq(apiKey, prompt) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a JSON API. You ONLY respond with a raw JSON array. No markdown, no code fences, no explanation, no extra text before or after. Just the array starting with [ and ending with ]."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 2000,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || "Groq API error");
  }
  return data.choices?.[0]?.message?.content || "";
}

export async function GET(request) {
  try {
    // 🔒 1. CRON_SECRET Guard અમલીકરણ (Sprint Task મુજબ સખત વેલિડેશન)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // પ્રોડક્શન પર સિક્યોરિટી મજબૂત રાખવા માટે કડક ચેક
    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return Response.json(
        { error: "Unauthorized access. Invalid or missing secret token." }, 
        { status: 401 }
      );
    }

    // 🔒 સિક્યોરિટી ફિક્સ: બેકએન્ડ માટે સેફ વેરિએબલનો ઉપયોગ (NEXT_PUBLIC વગર)
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return Response.json({ error: "Groq API key missing on the server" }, { status: 500 });
    }

    // આજની તારીખ ફોર્મેટ (Gujarati પ્રૉમ્પ્ટ માટે)
    const today = new Date().toLocaleDateString("en-IN", {
      year: "numeric", month: "long", day: "numeric",
    });

    const prompt = `Generate 8 important current affairs for ${today} for GPSC/UPSC exam preparation in Gujarati language.
Respond with ONLY this JSON array format, nothing else:
[{"title":"headline in Gujarati","summary":"2-3 line summary in Gujarati","category":"National","importance":"High"}]
Categories must be one of: National, International, Economy, Science, Sports
Importance must be one of: High, Medium`;

    let parsed = null;
    let lastError = "";

    // પ્રથમ પ્રયાસ (Attempt 1)
    try {
      const text = await callGroq(apiKey, prompt);
      parsed = extractJsonArray(text);
      if (!parsed) lastError = "Attempt 1: could not parse JSON. Raw: " + text.slice(0, 200);
    } catch (e) {
      lastError = "Attempt 1 error: " + e.message;
    }

    // જો પ્રથમ પ્રયાસ નિષ્ફળ જાય તો બીજો પ્રયાસ (Attempt 2 - Retry)
    if (!parsed) {
      try {
        const retryPrompt = prompt + "\n\nIMPORTANT: Output raw JSON array only. Do not wrap in markdown code blocks. Do not add any text before [ or after ].";
        const text2 = await callGroq(apiKey, retryPrompt);
        parsed = extractJsonArray(text2);
        if (!parsed) lastError += " | Attempt 2: could not parse JSON. Raw: " + text2.slice(0, 200);
      } catch (e) {
        lastError += " | Attempt 2 error: " + e.message;
      }
    }

    // જો બંને પ્રયાસ નિષ્ફળ જાય તો એરર થ્રો કરો જેથી ફૉલબેક ડેટા રન થાય
    if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("Invalid JSON response from AI. " + lastError);
    }

    const todayDate = new Date().toISOString().split("T")[0];

    // Supabase માં ડેટા અપસર્ટ (Insert/Update) કરો
    const { error } = await supabase
      .from("daily_current_affairs")
      .upsert(
        { date: todayDate, articles: parsed, generated_at: new Date().toISOString() },
        { onConflict: "date" }
      );

    if (error) throw error;

    return Response.json({ success: true, count: parsed.length, source: "ai" });

  } catch (error) {
    console.error("CA Error:", error.message);

    // 🚨 ફૉલબેક વ્યવસ્થા (જો AI API ફેઈલ થાય તો ડેટાબેઝ ખાલી ન રહે)
    try {
      const fallback = [
        {"title":"ભારતની GDP વૃદ્ધિ 7.2%","summary":"IMF અનુસાર ભારત 2025-26 માં 7.2% GDP વૃદ્ધિ સાથે વિશ્વનું સૌથી ઝડપથી વિકસતું અર્થતંત્ર રહેશે. સેવા ક્ષેત્ર અને ડિજિટલ અર્થવ્યવસ્થા મુખ્ય ચાલકબળ છે.","category":"Economy","importance":"High"},
        {"title":"GPSC Class 1-2 પ્રારંભિક પરીક્ષા 2025","summary":"GPSC દ્વારા Class 1-2 ની જાહેરાત પ્રકાશિત. કુલ 423 જગ્યાઓ માટે OJAS portal પર ઓનલાઇન અરજી શરૂ.","category":"National","importance":"High"},
        {"title":"ચંદ્રયાન-4 મિશનને કેન્દ્ર સરકારની મંજૂરી","summary":"ISRO ના ચંદ્રયાન-4 મિશનને ₹2,104 કરોડના ખર્ચ સાથે મંજૂરી. 2028 સુધીમાં ચંદ્ર પરથી નમૂના પૃથ્વી પર લાવવાનું લક્ષ્ય.","category":"Science","importance":"High"},
        {"title":"ભારત-UAE વેપાર કરાર","summary":"ભારત અને UAE વચ્ચે CEPA કરાર અંતર્ગત 100 બિલિયન ડોલરનો વેપાર 2030 સુધી પહોંચાડવાનો લક્ષ્ય.","category":"International","importance":"Medium"},
        {"title":"UPI ટ્રાન્ઝેક્શન 20 બિલિયન પાર","summary":"ભારતમાં UPI પેમેન્ટ 2024-25 માં 20 ટ્રિલિયન રૂપિયા વટાવ્યા. ડિજિટલ ઇન્ડિયા અભિયાનની મોટી સફળતા.","category":"Economy","importance":"Medium"},
        {"title":"ગુજરાત ઈ-ગ્રામ વિશ્વગ્રામ 2.0","summary":"ગુજરાત સરકારે 14,000+ ગ્રામ પંચાયતોને હાઈ-સ્પીડ ઈન્ટરનેટ સાથે જોડવાનો પ્રોજેક્ટ શરૂ કર્યો.","category":"National","importance":"Medium"},
        {"title":"ભારત T20 વિશ્વ ચેમ્પિયન 2024","summary":"ભારતે વેસ્ટ ઈન્ડિઝ-USA માં T20 World Cup 2024 જીત્યો. ફાઈનલમાં દક્ષિણ આફ્રિકાનો 7 રને હરાવ્યું.","category":"Sports","importance":"Medium"},
        {"title":"NEP 2020 - ગુજરાતમાં અમલ","summary":"ગુજરાત રાજ્ય શિક્ષણ નીતિ 2020 સંપૂર્ણ અમલ કરનાર અગ્રણી રાજ્ય. 5-ભાષા ફોર્મ્યુલા અને કૌશલ્ય આધારિત શિક્ષણ પર ભાર.","category":"National","importance":"High"}
      ];

      const todayDate = new Date().toISOString().split("T")[0];
      await supabase.from("daily_current_affairs").upsert(
        { date: todayDate, articles: fallback, generated_at: new Date().toISOString() },
        { onConflict: "date" }
      );
      return Response.json({ success: true, count: fallback.length, source: "fallback", debug: error.message });
    } catch (fallbackError) {
      return Response.json({ error: fallbackError.message }, { status: 500 });
    }
  }
}