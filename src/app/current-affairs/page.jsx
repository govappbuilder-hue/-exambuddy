"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CurrentAffairsPage() {
  const router = useRouter();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [lang, setLang] = useState("gu"); // gu = Gujarati, hi = Hindi

  const today = new Date().toISOString().split("T")[0];

  const loadArticles = async (generate = false) => {
    try {
      const url = `/api/get-current-affairs?date=${today}${generate ? "&generate=true" : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.articles?.length > 0) setArticles(data.articles);
      return data.articles?.length > 0;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    await loadArticles(true);
    setGenerating(false);
  };

  useEffect(() => {
    loadArticles().finally(() => setLoading(false));
  }, []);

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

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", color: "white", fontFamily: "system-ui, sans-serif" }}>
      
      {/* Navbar */}
      <nav style={{ background: "rgba(15,23,42,0.95)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 20px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", alignItems: "center", height: "60px", gap: "16px" }}>
          <button onClick={() => router.push("/")} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "20px" }}>←</button>
          <span style={{ fontSize: "18px", fontWeight: "900", background: "linear-gradient(90deg, #818cf8, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            📰 કરંટ અફેર્સ
          </span>

          {/* Language Toggle */}
          <div style={{ marginLeft: "auto", display: "flex", gap: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "8px", padding: "3px" }}>
            {["gu", "hi", "en"].map(l => (
              <button key={l} onClick={() => setLang(l)}
                style={{ padding: "4px 10px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: "700",
                  background: lang === l ? "rgba(99,102,241,0.5)" : "transparent",
                  color: lang === l ? "white" : "#64748b" }}>
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
          /* Generate Button */
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "80px", marginBottom: "24px" }}>📰</div>
            <h2 style={{ fontSize: "22px", fontWeight: "900", marginBottom: "8px" }}>આજના સમાચાર તૈયાર નથી</h2>
            <p style={{ color: "#64748b", marginBottom: "32px", fontSize: "14px" }}>
              AI દ્વારા GPSC/UPSC ના આજના current affairs generate કરો
            </p>
            <button onClick={handleGenerate} disabled={generating}
              style={{ padding: "16px 40px", background: generating ? "#334155" : "linear-gradient(135deg, #6366f1, #0ea5e9)", border: "none", borderRadius: "16px", color: "white", fontSize: "17px", fontWeight: "800", cursor: generating ? "not-allowed" : "pointer" }}>
              {generating ? "⏳ Generate થઈ રહ્યું છે..." : "✨ આજના સમાચાર Generate કરો"}
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h2 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: "800" }}>
                  📋 {articles.length} સમાચાર
                </h2>
                <p style={{ margin: 0, fontSize: "12px", color: "#475569" }}>
                  {new Date().toLocaleDateString("gu-IN")}
                </p>
              </div>
              <button onClick={handleGenerate} disabled={generating}
                style={{ padding: "8px 16px", background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "10px", color: "#818cf8", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
                {generating ? "⏳" : "🔄 Refresh"}
              </button>
            </div>

            {articles.map((a, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "18px", marginBottom: "14px" }}>
                <div style={{ display: "flex", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
                  <span style={{ padding: "3px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "700",
                    background: `${catColor[a.category] || "#6366f1"}22`,
                    color: catColor[a.category] || "#818cf8",
                    border: `1px solid ${catColor[a.category] || "#6366f1"}44` }}>
                    {catLabel[a.category] || a.category}
                  </span>
                  <span style={{ padding: "3px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "700",
                    background: a.importance === "High" ? "#ef444422" : "#f59e0b22",
                    color: a.importance === "High" ? "#ef4444" : "#f59e0b",
                    border: `1px solid ${a.importance === "High" ? "#ef4444" : "#f59e0b"}44` }}>
                    {a.importance === "High" ? "🔥 Important" : "📌 Medium"}
                  </span>
                </div>
                <h3 style={{ margin: "0 0 8px", fontSize: "15px", fontWeight: "800", lineHeight: 1.4 }}>
                  {a.title}
                </h3>
                <p style={{ margin: "0 0 10px", fontSize: "13px", color: "#94a3b8", lineHeight: 1.6 }}>
                  {a.summary}
                </p>
                {a.gujarati_keywords?.length > 0 && (
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {a.gujarati_keywords.map((kw, j) => (
                      <span key={j} style={{ padding: "2px 8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", fontSize: "11px", color: "#64748b" }}>
                        #{kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}