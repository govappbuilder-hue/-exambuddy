"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase"; // તારું supabase કનેક્શન

const SUBJECTS = [
  // GPSC
  { name: "ઇતિહાસ", slug: "history", icon: "🏛️", exam: "GPSC", color: "#6366f1" },
  { name: "ભૂગોળ", slug: "geography", icon: "🌍", exam: "GPSC", color: "#6366f1" },
  { name: "અર્થશાસ્ત્ર", slug: "economics", icon: "📈", exam: "GPSC", color: "#6366f1" },
  { name: "સાંસ્કૃતિક વારસો", slug: "heritage", icon: "🏺", exam: "GPSC", color: "#6366f1" },
  { name: "ભારતનું બંધારણ", slug: "constitution", icon: "📜", exam: "GPSC", color: "#6366f1" },
  // GSSSB
  { name: "ગણિત", slug: "maths", icon: "🔢", exam: "GSSSB", color: "#0ea5e9" },
  { name: "રીઝનિંગ", slug: "reasoning", icon: "🧩", exam: "GSSSB", color: "#0ea5e9" },
  { name: "ગુજરાતી સાહિત્ય", slug: "gujarati_sahitya", icon: "✍️", exam: "GSSSB", color: "#0ea5e9" },
  { name: "ગુજરાતી વ્યાકરણ", slug: "gujarati_vyakran", icon: "📝", exam: "GSSSB", color: "#0ea5e9" },
  { name: "English Grammar", slug: "english", icon: "🔤", exam: "GSSSB", color: "#0ea5e9" },
  { name: "જાહેર વહીવટ", slug: "pub_ad", icon: "🏢", exam: "GSSSB", color: "#0ea5e9" },
  // Police
  { name: "કાયદો", slug: "law", icon: "⚖️", exam: "Police", color: "#f59e0b" },
  { name: "સામાન્ય જ્ઞાન", slug: "gk", icon: "💡", exam: "Police", color: "#f59e0b" },
  { name: "કરંટ અફેર્સ", slug: "current_affairs", icon: "📰", exam: "Police", color: "#f59e0b" },
  { name: "વિજ્ઞાન", slug: "science", icon: "🔬", exam: "Police", color: "#f59e0b" },
  { name: "કમ્પ્યૂટર", slug: "computer", icon: "💻", exam: "Police", color: "#f59e0b" },
];

const EXAMS = ["બધા", "GPSC", "GSSSB", "Police"];

const EXAM_COLORS = {
  "GPSC": { bg: "rgba(99,102,241,0.15)", border: "rgba(99,102,241,0.4)", text: "#818cf8" },
  "GSSSB": { bg: "rgba(14,165,233,0.15)", border: "rgba(14,165,233,0.4)", text: "#38bdf8" },
  "Police": { bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.4)", text: "#fbbf24" },
};

export default function HomePage() {
  const router = useRouter();
  const [activeExam, setActiveExam] = useState("બધા");
  const [user, setUser] = useState(null);

  // યુઝર લોગિન છે કે નહીં તે ચેક કરવા માટે
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Google Login ફંક્શન
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  // Logout ફંક્શન
  const handleLogout = async () => {
    await supabase.signOut();
    setUser(null);
  };

  const filtered = activeExam === "બધા" ? SUBJECTS : SUBJECTS.filter(s => s.exam === activeExam);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", fontFamily: "system-ui, sans-serif", color: "white" }}>
      
      {/* Navbar */}
      <nav style={{ background: "rgba(15,23,42,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 20px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", height: "60px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "24px" }}>🎓</span>
            <span style={{ fontSize: "20px", fontWeight: "900", background: "linear-gradient(90deg, #818cf8, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ExamBuddy</span>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button onClick={() => router.push("/my-progress")}
              style={{ padding: "8px 16px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "10px", color: "#818cf8", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>
              📊 પ્રોગ્રેસ
            </button>
            <button onClick={() => router.push("/mock-test")}
              style={{ padding: "8px 16px", background: "rgba(14,165,233,0.15)", border: "1px solid rgba(14,165,233,0.3)", borderRadius: "10px", color: "#38bdf8", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>
              🏆 Mock Test
            </button>
            <button onClick={() => router.push("/admin")}
              style={{ padding: "8px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#94a3b8", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>
              ⚙️ Admin
            </button>

            {/* Dynamic Auth Button */}
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "4px" }}>
                <img src={user.user_metadata?.avatar_url} alt="profile" style={{ width: "30px", height: "30px", borderRadius: "50%", border: "1px solid #38bdf8" }} />
                <button onClick={handleLogout}
                  style={{ padding: "8px 14px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", color: "#f87171", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>
                  Logout
                </button>
              </div>
            ) : (
              <button onClick={handleGoogleLogin}
                style={{ padding: "8px 14px", background: "white", border: "none", borderRadius: "10px", color: "#0f172a", fontWeight: "700", fontSize: "13px", cursor: "pointer", marginLeft: "4px" }}>
                🚀 Google Login
              </button>
            )}
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "30px 20px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ display: "inline-block", padding: "6px 16px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "99px", fontSize: "12px", fontWeight: "700", color: "#818cf8", marginBottom: "16px", letterSpacing: "0.05em" }}>
            🚀 Gujarat Govt Exam Preparation Platform
          </div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: "900", margin: "0 0 12px", lineHeight: 1.15, background: "linear-gradient(135deg, #fff 0%, #94a3b8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            સરકારી નોકરી માટે<br/>
            <span style={{ background: "linear-gradient(90deg, #818cf8, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Smart Practice</span> કરો
          </h1>
          {user && (
            <p style={{ color: "#38bdf8", fontSize: "15px", fontWeight: "600", marginBottom: "10px" }}>
              ગમતું નામ, વેલકમ બેક, {user.user_metadata?.full_name}! 👋
            </p>
          )}
          <p style={{ color: "#64748b", fontSize: "16px", maxWidth: "500px", margin: "0 auto" }}>
            GPSC • GSSSB • Police • SSC • Railway - બધા exam ની practice અહીં
          </p>
        </div>

        {/* Current Affairs Banner */}
        <div onClick={() => router.push("/current-affairs")}
          style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(14,165,233,0.2))", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "20px", padding: "20px 24px", marginBottom: "32px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ fontSize: "36px" }}>📰</div>
            <div>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "white" }}>આજના કરંટ અફેર્સ</h3>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#94a3b8" }}>Daily AI-powered news + Live Quiz</p>
            </div>
          </div>
          <div style={{ background: "linear-gradient(135deg, #6366f1, #0ea5e9)", padding: "10px 20px", borderRadius: "12px", fontWeight: "800", fontSize: "14px", whiteSpace: "nowrap" }}>
            જુઓ →
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }}>
          {[
            { icon: "📚", val: "16", label: "Subjects" },
            { icon: "❓", val: "3,220+", label: "Questions" },
            { icon: "🏆", val: "3", label: "Exam Types" }, 
          ].map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: "28px", marginBottom: "4px" }}>{s.icon}</div>
              <div style={{ fontSize: "24px", fontWeight: "900", color: "white" }}>{s.val}</div>
              <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
          {EXAMS.map(exam => {
            const active = activeExam === exam;
            const c = EXAM_COLORS[exam] || {};
            return (
              <button key={exam} onClick={() => setActiveExam(exam)}
                style={{ padding: "8px 20px", borderRadius: "99px", border: active ? `1px solid ${c.border || "rgba(255,255,255,0.3)"}` : "1px solid rgba(255,255,255,0.08)", background: active ? (c.bg || "rgba(255,255,255,0.1)") : "transparent", color: active ? (c.text || "white") : "#64748b", fontWeight: "700", fontSize: "14px", cursor: "pointer", transition: "all 0.2s" }}>
                {exam === "બધા" ? "🌐 " : exam === "GPSC" ? "👑 " : exam === "GSSSB" ? "📝 " : "👮 "}{exam}
              </button>
            );
          })}
          <span style={{ marginLeft: "auto", fontSize: "13px", color: "#475569", alignSelf: "center", fontWeight: "600" }}>
            {filtered.length} subjects
          </span>
        </div>

        {/* Subject Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", marginBottom: "40px" }}>
          {filtered.map((subject) => {
            const ec = EXAM_COLORS[subject.exam];
            return (
              <Link key={subject.slug} href={`/quiz/${subject.slug}`}
                style={{ textDecoration: "none", display: "block" }}>
                <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid rgba(255,255,255,0.07)`, borderRadius: "20px", padding: "22px 18px", cursor: "pointer", transition: "all 0.25s", height: "100%", boxSizing: "border-box" }}
                  onMouseEnter={e => { e.currentTarget.style.background = ec.bg; e.currentTarget.style.borderColor = ec.border; e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  <div style={{ fontSize: "32px", marginBottom: "12px" }}>{subject.icon}</div>
                  <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: "800", color: "white", lineHeight: 1.3 }}>{subject.name}</h3>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 8px", borderRadius: "6px", background: ec.bg, color: ec.text, border: `1px solid ${ec.border}` }}>
                      {subject.exam}
                    </span>
                    <span style={{ color: ec.text, fontSize: "16px", fontWeight: "800" }}>→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
          <div onClick={() => router.push("/mock-test")}
            style={{ background: "linear-gradient(135deg, rgba(14,165,233,0.15), rgba(6,182,212,0.1))", border: "1px solid rgba(14,165,233,0.25)", borderRadius: "20px", padding: "24px", cursor: "pointer" }}>
            <div style={{ fontSize: "32px", marginBottom: "10px" }}>🏆</div>
            <h3 style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: "800", color: "white" }}>Mock Test</h3>
            <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>GPSC/UPSC/SSC full mock test with timer</p>
          </div>
          <div onClick={() => router.push("/my-progress")}
            style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))", border: "1px solid rgba(99,102,241,0.25)", borderRadius: "20px", padding: "24px", cursor: "pointer" }}>
            <div style={{ fontSize: "32px", marginBottom: "10px" }}>📊</div>
            <h3 style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: "800", color: "white" }}>મારો પ્રોગ્રેસ</h3>
            <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>Score history and accuracy chart</p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.05)", color: "#334155", fontSize: "13px", fontWeight: "600" }}>
          Made with 💙 for Gujarat Exam Aspirants • ExamBuddy 2026
        </div>

      </div>
    </div>
  );
}