"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CurrentAffairsPage() {
  const router = useRouter();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generateNews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cron-current-affairs");
      const data = await res.json();
      if (data.success) {
        await loadArticles();
        setGenerated(true);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const loadArticles = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(`/api/get-current-affairs?date=${today}`);
      const data = await res.json();
      if (data.articles) setArticles(data.articles);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { loadArticles(); }, []);

  const catColor = {
    "National": "#6366f1", "International": "#0ea5e9",
    "Economy": "#10b981", "Science": "#f59e0b", "Sports": "#ef4444"
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", color: "white", fontFamily: "system-ui, sans-serif" }}>
      
      {/* Navbar */}
      <nav style={{ background: "rgba(15,23,42,0.95)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 20px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", alignItems: "center", height: "60px", gap: "16px" }}>
          <button onClick={() => router.push("/")} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "20px" }}>←</button>
          <span style={{ fontSize: "18px", fontWeight: "900", background: "linear-gradient(90deg, #818cf8, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            📰 આજના કરંટ અફેર્સ
          </span>
          <span style={{ marginLeft: "auto", fontSize: "12px", color: "#475569" }}>
            {new Date().toLocaleDateString("gu-IN")}
          </span>
        </div>
      </nav>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "30px 20px" }}>

        {articles.length === 0 ? (
          /* Generate Button */
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "80px", marginBottom: "24px" }}>🤖</div>
            <h2 style={{ fontSize: "24px", fontWeight: "900", marginBottom: "8px" }}>આજના સમાચાર હજુ તૈયાર નથી</h2>
            <p style={{ color: "#64748b", marginBottom: "32px" }}>AI Gemini દ્વારા આજના current affairs generate કરો - free & instant!</p>
            <button onClick={generateNews} disabled={loading}
              style={{ padding: "16px 40px", background: loading ? "#334155" : "linear-gradient(135deg, #6366f1, #0ea5e9)", border: "none", borderRadius: "16px", color: "white", fontSize: "18px", fontWeight: "800", cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "⏳ Generate થઈ રહ્યું છે..." : "✨ આજના સમાચાર Generate કરો"}
            </button>
          </div>
        ) : (
          /* Articles List */
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800" }}>📋 આજના {articles.length} સમાચાર</h2>
              <button onClick={generateNews} disabled={loading}
                style={{ padding: "8px 16px", background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "10px", color: "#818cf8", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
                🔄 Refresh
              </button>
            </div>
            {articles.map((a, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px", marginBottom: "16px" }}>
                <div style={{ display: "flex", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
                  <span style={{ padding: "3px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", background: `${catColor[a.category] || "#6366f1"}22`, color: catColor[a.category] || "#818cf8", border: `1px solid ${catColor[a.category] || "#6366f1"}44` }}>
                    {a.category}
                  </span>
                  <span style={{ padding: "3px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", background: a.importance === "High" ? "#ef444422" : "#f59e0b22", color: a.importance === "High" ? "#ef4444" : "#f59e0b", border: `1px solid ${a.importance === "High" ? "#ef4444" : "#f59e0b"}44` }}>
                    {a.importance === "High" ? "🔥 High" : "📌 Medium"}
                  </span>
                </div>
                <h3 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: "800", lineHeight: 1.4 }}>{a.title}</h3>
                <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8", lineHeight: 1.6 }}>{a.summary}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}