"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CurrentAffairsPage() {
  const router = useRouter();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [lang, setLang] = useState("gu");
  const [mcqArticle, setMcqArticle] = useState(null);
  const [mcqs, setMcqs] = useState([]);
  const [mcqLoading, setMcqLoading] = useState(false);
  const [selected, setSelected] = useState({});
  const [showResult, setShowResult] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const loadArticles = async (generate = false) => {
  try {
    const url = `/api/get-current-affairs?date=${today}${generate ? "&generate=true" : ""}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.articles?.length > 0) {
      setArticles(data.articles);
      return true;
    }
    return false;
  } catch (e) {
    console.error(e);
    return false;
  }
};

  const handleGenerate = async () => {
  setGenerating(true);
  const success = await loadArticles(true);
  setGenerating(false);
  if (!success) {
    alert("Generate na thayु. Pachi try karo.");
  }
};

  useEffect(() => {
    loadArticles().finally(() => setLoading(false));
  }, []);

  // Generate MCQ for an article using Gemini
  const generateMCQ = async (article) => {
    setMcqArticle(article);
    setMcqs([]);
    setSelected({});
    setShowResult(false);
    setMcqLoading(true);

    try {
      const res = await fetch("/api/doubt-solver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: `Based on this current affairs topic, generate 5 MCQ questions in Gujarati for GPSC exam preparation.

Topic: ${article.title}
Summary: ${article.summary}

Return ONLY a JSON array in this exact format, no other text:
[{"q":"question","a":"option A","b":"option B","c":"option C","d":"option D","ans":"A","exp":"brief explanation in Gujarati"}]`
        }),
      });
      const data = await res.json();
      const text = data.answer || data.response || "";

      // Extract JSON
      const start = text.indexOf("[");
      const end = text.lastIndexOf("]");
      if (start !== -1 && end !== -1) {
        const parsed = JSON.parse(text.slice(start, end + 1));
        setMcqs(parsed);
      } else {
        alert("MCQ generate na thaya. Pachi try karo.");
        setMcqArticle(null);
      }
    } catch (e) {
      alert("Error: " + e.message);
      setMcqArticle(null);
    }
    setMcqLoading(false);
  };

  const score = mcqs.reduce((acc, q, i) => selected[i] === q.ans ? acc + 1 : acc, 0);

  const catColor = {
    "National": "#6366f1", "International": "#0ea5e9",
    "Economy": "#10b981", "Science": "#f59e0b",
    "Sports": "#ef4444", "Gujarat": "#f97316"
  };
  const catLabel = {
    "National": "રાષ્ટ્રીય", "International": "આંતરરાષ્ટ્રીય",
    "Economy": "અર્થ.", "Science": "વિજ્ઞાન",
    "Sports": "રમત", "Gujarat": "ગુજરાત"
  };

  // MCQ Screen
  if (mcqArticle) return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", color: "white", fontFamily: "system-ui", paddingBottom: "90px" }}>
      <nav style={{ background: "rgba(15,23,42,0.95)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 20px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", alignItems: "center", height: "60px", gap: "16px" }}>
          <button onClick={() => { setMcqArticle(null); setMcqs([]); setSelected({}); setShowResult(false); }}
            style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "20px" }}>←</button>
          <span style={{ fontSize: "16px", fontWeight: "900", color: "#818cf8" }}>📝 MCQ Quiz</span>
        </div>
      </nav>

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "20px 16px" }}>
        <div style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "14px", padding: "14px", marginBottom: "20px" }}>
          <div style={{ fontSize: "13px", fontWeight: "800", color: "#818cf8", marginBottom: "4px" }}>Topic:</div>
          <div style={{ fontSize: "14px", color: "#e2e8f0", lineHeight: 1.5 }}>{mcqArticle.title}</div>
        </div>

        {mcqLoading ? (
          <div style={{ textAlign: "center", padding: "60px" }}>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>🤖</div>
            <p style={{ color: "#64748b" }}>AI MCQ generate કરી રહ્યું છે...</p>
          </div>
        ) : (
          <>
            {mcqs.map((q, i) => {
              const opts = [
                { key: "A", val: q.a }, { key: "B", val: q.b },
                { key: "C", val: q.c }, { key: "D", val: q.d }
              ];
              return (
                <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "18px", marginBottom: "14px" }}>
                  <div style={{ fontSize: "12px", color: "#6366f1", fontWeight: "700", marginBottom: "8px" }}>Q{i + 1}</div>
                  <p style={{ fontSize: "15px", fontWeight: "700", margin: "0 0 14px", lineHeight: 1.6 }}>{q.q}</p>
                  {opts.map(opt => {
                    const isSelected = selected[i] === opt.key;
                    const isCorrect = opt.key === q.ans;
                    const show = showResult;
                    let bg = "rgba(255,255,255,0.04)";
                    let border = "rgba(255,255,255,0.1)";
                    if (show && isCorrect) { bg = "#064e3b"; border = "#10b981"; }
                    else if (show && isSelected && !isCorrect) { bg = "#450a0a"; border = "#ef4444"; }
                    else if (isSelected) { bg = "rgba(99,102,241,0.2)"; border = "#6366f1"; }

                    return (
                      <button key={opt.key} onClick={() => { if (!showResult) setSelected(p => ({ ...p, [i]: opt.key })); }}
                        style={{ width: "100%", padding: "12px 14px", marginBottom: "8px", borderRadius: "10px", border: `2px solid ${border}`, background: bg, color: "white", textAlign: "left", cursor: showResult ? "default" : "pointer", display: "flex", gap: "10px", alignItems: "center" }}>
                        <span style={{ fontWeight: "800", color: show && isCorrect ? "#10b981" : show && isSelected ? "#ef4444" : "#6366f1", minWidth: "20px" }}>{opt.key}.</span>
                        <span style={{ fontSize: "14px" }}>{opt.val}</span>
                        {show && isCorrect && <span style={{ marginLeft: "auto" }}>✅</span>}
                        {show && isSelected && !isCorrect && <span style={{ marginLeft: "auto" }}>❌</span>}
                      </button>
                    );
                  })}
                  {showResult && q.exp && (
                    <div style={{ background: "#1c1a00", border: "1px solid #ca8a04", borderRadius: "10px", padding: "10px", marginTop: "8px" }}>
                      <span style={{ color: "#fbbf24", fontSize: "12px", fontWeight: "700" }}>💡 </span>
                      <span style={{ color: "#fef3c7", fontSize: "13px" }}>{q.exp}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {mcqs.length > 0 && !showResult && (
              <button onClick={() => setShowResult(true)}
                style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg,#6366f1,#0ea5e9)", border: "none", borderRadius: "12px", color: "white", fontWeight: "800", fontSize: "16px", cursor: "pointer" }}>
                ✅ Submit Quiz
              </button>
            )}

            {showResult && (
              <div style={{ background: score >= mcqs.length * 0.6 ? "#064e3b" : "#450a0a", border: `2px solid ${score >= mcqs.length * 0.6 ? "#10b981" : "#ef4444"}`, borderRadius: "16px", padding: "20px", textAlign: "center", marginTop: "8px" }}>
                <div style={{ fontSize: "36px", marginBottom: "8px" }}>{score >= mcqs.length * 0.6 ? "🏆" : "📚"}</div>
                <div style={{ fontSize: "24px", fontWeight: "900", color: score >= mcqs.length * 0.6 ? "#34d399" : "#fca5a5" }}>
                  {score}/{mcqs.length} સાચા
                </div>
                <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>
                  {Math.round((score / mcqs.length) * 100)}% accuracy
                </div>
                <button onClick={() => { setSelected({}); setShowResult(false); }}
                  style={{ marginTop: "14px", padding: "10px 24px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "10px", color: "white", cursor: "pointer", fontWeight: "700" }}>
                  🔄 ફરીથી આપો
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", color: "white", fontFamily: "system-ui, sans-serif", paddingBottom: "90px" }}>
      <nav style={{ background: "rgba(15,23,42,0.95)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 20px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", alignItems: "center", height: "60px", gap: "16px" }}>
          <button onClick={() => router.push("/")} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "20px" }}>←</button>
          <span style={{ fontSize: "18px", fontWeight: "900", background: "linear-gradient(90deg, #818cf8, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            📰 કરંટ અફેર્સ
          </span>
          <div style={{ marginLeft: "auto", display: "flex", gap: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "8px", padding: "3px" }}>
            {["gu", "hi", "en"].map(l => (
              <button key={l} onClick={() => setLang(l)}
                style={{ padding: "4px 10px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: "700", background: lang === l ? "rgba(99,102,241,0.5)" : "transparent", color: lang === l ? "white" : "#64748b" }}>
                {l === "gu" ? "ગુ" : l === "hi" ? "हि" : "EN"}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px 16px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>⏳</div>
            <p>Loading...</p>
          </div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "80px", marginBottom: "24px" }}>📰</div>
            <h2 style={{ fontSize: "22px", fontWeight: "900", marginBottom: "8px" }}>આજના સમાચાર તૈયાર નથી</h2>
            <p style={{ color: "#64748b", marginBottom: "32px", fontSize: "14px" }}>AI દ્વારા GPSC/UPSC ના આજના current affairs generate કરો</p>
            <button onClick={handleGenerate} disabled={generating}
              style={{ padding: "16px 40px", background: generating ? "#334155" : "linear-gradient(135deg, #6366f1, #0ea5e9)", border: "none", borderRadius: "16px", color: "white", fontSize: "17px", fontWeight: "800", cursor: generating ? "not-allowed" : "pointer" }}>
              {generating ? "⏳ Generate થઈ રહ્યું છે..." : "✨ આજના સમાચાર Generate કરો"}
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h2 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: "800" }}>📋 {articles.length} સમાચાર</h2>
                <p style={{ margin: 0, fontSize: "12px", color: "#475569" }}>{new Date().toLocaleDateString("gu-IN")}</p>
              </div>
              <button onClick={handleGenerate} disabled={generating}
                style={{ padding: "8px 16px", background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "10px", color: "#818cf8", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
                {generating ? "⏳" : "🔄 Refresh"}
              </button>
            </div>

            {articles.map((a, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "18px", marginBottom: "14px" }}>
                <div style={{ display: "flex", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
                  <span style={{ padding: "3px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", background: `${catColor[a.category] || "#6366f1"}22`, color: catColor[a.category] || "#818cf8", border: `1px solid ${catColor[a.category] || "#6366f1"}44` }}>
                    {catLabel[a.category] || a.category}
                  </span>
                  <span style={{ padding: "3px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", background: a.importance === "High" ? "#ef444422" : "#f59e0b22", color: a.importance === "High" ? "#ef4444" : "#f59e0b", border: `1px solid ${a.importance === "High" ? "#ef4444" : "#f59e0b"}44` }}>
                    {a.importance === "High" ? "🔥 Important" : "📌 Medium"}
                  </span>
                </div>
                <h3 style={{ margin: "0 0 8px", fontSize: "15px", fontWeight: "800", lineHeight: 1.4 }}>{a.title}</h3>
                <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#94a3b8", lineHeight: 1.6 }}>{a.summary}</p>
                {a.gujarati_keywords?.length > 0 && (
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
                    {a.gujarati_keywords.map((kw, j) => (
                      <span key={j} style={{ padding: "2px 8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", fontSize: "11px", color: "#64748b" }}>#{kw}</span>
                    ))}
                  </div>
                )}
                {/* MCQ Button */}
                <button onClick={() => generateMCQ(a)}
                  style={{ padding: "8px 18px", background: "linear-gradient(135deg,#6366f1,#0ea5e9)", border: "none", borderRadius: "10px", color: "white", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
                  📝 MCQ Quiz Banavo
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}