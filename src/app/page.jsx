"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

// ═══ CONSTANTS ═══
const SUBJECTS = [
  { id: "history", name: "ઇતિહાસ", icon: "🏛️", count: "200+ સવાલ", tag: "GPSC" },
  { id: "geography", name: "ભૂગોળ", icon: "🌍", count: "150+ સવાલ", tag: "GPSC" },
  { id: "constitution", name: "બંધારણ", icon: "📜", count: "180+ સવાલ", tag: "GPSC" },
  { id: "economics", name: "અર્થશાસ્ત્ર", icon: "📈", count: "120+ સવાલ", tag: "GPSC" },
  { id: "science", name: "વિજ્ઞાન", icon: "🔬", count: "160+ સવાલ", tag: "GSSSB" },
  { id: "maths", name: "ગણિત", icon: "🔢", count: "200+ સવાલ", tag: "GSSSB" },
  { id: "reasoning", name: "રીઝનિંગ", icon: "🧩", count: "180+ સવાલ", tag: "GSSSB" },
  { id: "gujarati", name: "ગુજરાતી", icon: "✍️", count: "150+ સવાલ", tag: "GSSSB" },
  { id: "gk", name: "સામાન્ય જ્ઞાન", icon: "💡", count: "250+ સવાલ", tag: "All" },
  { id: "current_affairs", name: "Current Affairs", icon: "📰", count: "100+ સવાલ", tag: "All" },
  { id: "computer", name: "Computer", icon: "💻", count: "120+ સવાલ", tag: "GSSSB" },
  { id: "law", name: "કાયદો", icon: "⚖️", count: "100+ સવાલ", tag: "Police" },
  { id: "gujarati_sahitya", name: "ગુજ. સાહિત્ય", icon: "📖", count: "130+ સવાલ", tag: "GPSC" },
  { id: "polity", name: "રાજ્યશાસ્ત્ર", icon: "🏛️", count: "140+ સવાલ", tag: "GPSC" },
  { id: "heritage", name: "વારસો", icon: "🏺", count: "80+ સવાલ", tag: "GPSC" },
  { id: "english", name: "English", icon: "🔤", count: "110+ સવાલ", tag: "GSSSB" },
];

const MOCK_TESTS = [
  { id: "gpsc", name: "GPSC Class 1-2 Full Test", time: "120 Min", marks: "200 Marks", icon: "👑", color: "#6366f1" },
  { id: "gsssb", name: "GSSSB / Bin Sachivalay", time: "120 Min", marks: "200 Marks", icon: "📝", color: "#8b5cf6" },
  { id: "police", name: "Police Constable / PSI", time: "60 Min", marks: "100 Marks", icon: "👮", color: "#10b981" },
  { id: "revenue", name: "Revenue Talati / Mantri", time: "60 Min", marks: "100 Marks", icon: "🏢", color: "#f59e0b" },
];

const EXAM_DATES = [
  { name: "GPSC Class 1-2 Prelim", date: "Aug 2025", status: "upcoming" },
  { name: "GSSSB Bin Sachivalay", date: "Jul 2025", status: "upcoming" },
  { name: "Police Constable", date: "Sep 2025", status: "upcoming" },
  { name: "Revenue Talati", date: "Oct 2025", status: "upcoming" },
  { name: "PI / PSO", date: "Nov 2025", status: "upcoming" },
];

const EXAM_FILTER_TAGS = ["All", "GPSC", "GSSSB", "Police", "PSI"];

// ═══ MAIN COMPONENT ═══
export default function PremiumApp() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [activeTab, setActiveTab] = useState("home");
  const [progressData, setProgressData] = useState({ total: 0, avg: 0, streak: 0 });
  const [subjectFilter, setSubjectFilter] = useState("All");

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) await fetchProgress(session.user.id);
      setAuthLoading(false);
    };
    getSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchProgress = async (userId) => {
    const { data } = await supabase
      .from("quiz_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (data && data.length > 0) {
      const total = data.length;
      const avg = Math.round(data.reduce((a, b) => a + ((b.score / b.total) * 100), 0) / total);
      let streak = 0;
      const uniqueDates = [...new Set(data.map((d) => new Date(d.created_at).toDateString()))];
      for (let i = 0; i < uniqueDates.length; i++) {
        const d = new Date(); d.setDate(d.getDate() - i);
        if (uniqueDates.includes(d.toDateString())) streak++; else break;
      }
      setProgressData({ total, avg, streak });
    }
  };

  const handleLogin = async () => {
    if (!email || !password) { setMessage("❌ Email અને Password ભરો!"); return; }
    setLoading(true); setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setMessage("❌ " + error.message);
  };

  const handleRegister = async () => {
    if (!email || !password) { setMessage("❌ Email અને Password ભરો!"); return; }
    if (password.length < 6) { setMessage("❌ Password ઓછામાં ઓછો 6 અક્ષર!"); return; }
    setLoading(true); setMessage("");
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) setMessage("❌ " + error.message);
    else setMessage("✅ Account બની ગયો! હવે Login કરો.");
  };

  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null); };

  const filteredSubjects = subjectFilter === "All" ? SUBJECTS : SUBJECTS.filter(s => s.tag === subjectFilter);

  // ─── LOADING ───
  if (authLoading) return (
    <div style={{ minHeight: "100vh", background: "#030712", display: "flex", justifyContent: "center", alignItems: "center", color: "#38bdf8", fontSize: "20px", fontWeight: "bold" }}>
      ⚡ ExamBuddy લોડ થઈ રહ્યું છે...
    </div>
  );

  // ─── LOGIN SCREEN ───
  if (!user) return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at top, #0f172a, #030712)", color: "white", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px", fontFamily: "system-ui" }}>
      <div style={{ maxWidth: "420px", width: "100%", background: "rgba(17,24,39,0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.08)", padding: "40px 30px", borderRadius: "24px", boxShadow: "0 25px 50px rgba(0,0,0,0.5)", textAlign: "center" }}>
        <div style={{ fontSize: "50px", marginBottom: "10px" }}>🎓</div>
        <h1 style={{ fontSize: "32px", fontWeight: "800", background: "linear-gradient(to right, #38bdf8, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 6px" }}>ExamBuddy</h1>
        <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "28px" }}>ગુજરાત ગવર્નમેન્ટ એક્ઝામ પ્રિપરેશન પોર્ટલ</p>

        <div style={{ display: "flex", background: "#0f172a", borderRadius: "12px", padding: "4px", marginBottom: "24px", gap: "4px" }}>
          {["login", "register"].map(mode => (
            <button key={mode} onClick={() => { setAuthMode(mode); setMessage(""); }}
              style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "none", background: authMode === mode ? "linear-gradient(135deg,#667eea,#764ba2)" : "transparent", color: authMode === mode ? "white" : "#64748b", fontWeight: "800", cursor: "pointer", fontSize: "14px" }}>
              {mode === "login" ? "🔐 Login" : "📝 Register"}
            </button>
          ))}
        </div>

        {message && (
          <div style={{ background: message.includes("✅") ? "#064e3b" : "#450a0a", color: message.includes("✅") ? "#6ee7b7" : "#fca5a5", padding: "12px", borderRadius: "10px", marginBottom: "16px", fontSize: "14px", fontWeight: "600" }}>
            {message}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
          <input type="email" placeholder="📧 Email address" value={email} onChange={e => setEmail(e.target.value)}
            style={{ width: "100%", padding: "14px", background: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", color: "white", fontSize: "15px", outline: "none", boxSizing: "border-box", textAlign: "center" }} />
          <input type="password" placeholder="🔑 Password (6+ અક્ષર)" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (authMode === "login" ? handleLogin() : handleRegister())}
            style={{ width: "100%", padding: "14px", background: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", color: "white", fontSize: "15px", outline: "none", boxSizing: "border-box", textAlign: "center" }} />
        </div>

        <button onClick={authMode === "login" ? handleLogin : handleRegister} disabled={loading}
          style={{ width: "100%", padding: "14px", background: loading ? "#334155" : "linear-gradient(90deg,#0ea5e9,#2563eb)", color: "white", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer", marginBottom: "16px" }}>
          {loading ? "⏳ રાહ જુઓ..." : authMode === "login" ? "🚀 Login કરો" : "✨ Account બનાવો"}
        </button>

        <div style={{ display: "flex", alignItems: "center", margin: "0 0 16px", color: "#4b5563", fontSize: "12px" }}>
          <div style={{ flex: 1, height: "1px", background: "#1f2937" }} />
          <span style={{ padding: "0 10px" }}>અથવા</span>
          <div style={{ flex: 1, height: "1px", background: "#1f2937" }} />
        </div>

        <button onClick={() => supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } })}
          style={{ width: "100%", padding: "13px", background: "white", color: "#111827", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "700", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", cursor: "pointer" }}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5.04c1.65 0 3.13.57 4.3 1.69l3.22-3.22C17.56 1.7 14.97 1 12 1 7.42 1 3.51 3.63 1.62 7.45l3.86 3C6.39 7.45 9 5.04 12 5.04z"/>
            <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.43h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.38-4.88 3.38-8.48z"/>
            <path fill="#FBBC05" d="M5.48 14.55c-.24-.72-.38-1.49-.38-2.3c0-.81.14-1.58.38-2.3L1.62 6.95C.59 9.02 0 11.34 0 13.75s.59 4.73 1.62 6.8l3.86-3z"/>
            <path fill="#34A853" d="M12 23c3.24 0 5.97-1.08 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-4.3 1.09-3 0-5.61-2.41-6.52-5.41l-3.86 3C3.51 20.37 7.42 23 12 23z"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );

  // ─── LOGGED IN — 5 TAB APP ───
  return (
    <div style={{ minHeight: "100vh", background: "#030712", color: "white", fontFamily: "system-ui", paddingBottom: "80px" }}>

      {/* Top Navbar */}
      <div style={{ borderBottom: "1px solid #1f2937", background: "rgba(3,7,18,0.9)", backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "13px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: "20px", fontWeight: "900", background: "linear-gradient(to right, #38bdf8, #2563eb)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0 }}>🎓 ExamBuddy</h1>
          <span style={{ fontSize: "11px", background: "#1e1b4b", color: "#a5b4fc", padding: "5px 10px", borderRadius: "20px", border: "1px solid #312e81" }}>⚡ Free</span>
        </div>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px 16px" }}>

        {/* ═══ TAB 1: HOME ═══ */}
        {activeTab === "home" && (
          <div>
            {/* Welcome Card */}
            <div style={{ background: "linear-gradient(135deg,#1e1b4b,#0f172a)", padding: "22px", borderRadius: "20px", border: "1px solid #312e81", marginBottom: "22px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#a5b4fc", margin: "0 0 4px" }}>નમસ્તે! 👋</h2>
              <p style={{ color: "#64748b", margin: 0, fontSize: "13px" }}>આજે કયા વિષયની પ્રેક્ટિસ કરીએ?</p>
              <div style={{ display: "flex", gap: "14px", marginTop: "16px" }}>
                {[
                  { icon: "📝", label: "કુલ ટેસ્ટ", value: progressData.total, color: "#38bdf8" },
                  { icon: "🎯", label: "સરેરાશ", value: `${progressData.avg}%`, color: "#10b981" },
                  { icon: "🔥", label: "Streak", value: `${progressData.streak}d`, color: "#f59e0b" },
                ].map(s => (
                  <div key={s.label} style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "10px", textAlign: "center" }}>
                    <div style={{ fontSize: "16px", fontWeight: "800", color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: "10px", color: "#475569", marginTop: "2px" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subject Filter */}
            <div style={{ display: "flex", gap: "8px", overflowX: "auto", marginBottom: "16px", paddingBottom: "4px" }}>
              {EXAM_FILTER_TAGS.map(tag => (
                <button key={tag} onClick={() => setSubjectFilter(tag)}
                  style={{ padding: "6px 14px", borderRadius: "20px", border: `1.5px solid ${subjectFilter === tag ? "#6366f1" : "#1f2937"}`, background: subjectFilter === tag ? "#6366f120" : "transparent", color: subjectFilter === tag ? "#818cf8" : "#64748b", fontSize: "13px", cursor: "pointer", fontWeight: "600", whiteSpace: "nowrap" }}>
                  {tag}
                </button>
              ))}
            </div>

            {/* Subjects Grid */}
            <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px", color: "#e2e8f0" }}>📚 વિષયો — Quiz Practice</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {filteredSubjects.map(sub => (
                <div key={sub.id} onClick={() => router.push(`/quiz/${sub.id}`)}
                  style={{ background: "#0f172a", border: "1px solid #1e2937", padding: "16px", borderRadius: "16px", cursor: "pointer", transition: "all 0.2s" }}>
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>{sub.icon}</div>
                  <h4 style={{ fontSize: "15px", fontWeight: "700", margin: "0 0 3px", color: "#f1f5f9" }}>{sub.name}</h4>
                  <p style={{ fontSize: "11px", color: "#475569", margin: "0 0 6px" }}>{sub.count}</p>
                  <span style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8", padding: "2px 7px", borderRadius: "5px", fontSize: "10px", fontWeight: "700" }}>{sub.tag}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ TAB 2: CURRENT AFFAIRS ═══ */}
        {activeTab === "current" && (
          <CurrentAffairsTab />
        )}

        {/* ═══ TAB 3: MOCK TEST ═══ */}
        {activeTab === "mock" && (
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "16px", color: "#e2e8f0" }}>🏆 Mock Tests</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {MOCK_TESTS.map(test => (
                <div key={test.id} onClick={() => router.push("/mock-test")}
                  style={{ background: "#0f172a", border: `1px solid ${test.color}33`, padding: "18px 20px", borderRadius: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: `${test.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>{test.icon}</div>
                    <div>
                      <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#f1f5f9", margin: "0 0 3px" }}>{test.name}</h4>
                      <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>⏳ {test.time} &nbsp;|&nbsp; 🎯 {test.marks}</p>
                    </div>
                  </div>
                  <div style={{ background: test.color, color: "white", padding: "8px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: "700" }}>Start</div>
                </div>
              ))}
            </div>

            {/* Progress Section */}
            <h3 style={{ fontSize: "18px", fontWeight: "800", margin: "28px 0 16px", color: "#e2e8f0" }}>📊 Progress</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
              {[
                { icon: "📝", label: "ટેસ્ટ", value: progressData.total, color: "#38bdf8" },
                { icon: "🎯", label: "સરેરાશ", value: `${progressData.avg}%`, color: "#10b981" },
                { icon: "🔥", label: "Streak", value: `${progressData.streak}d`, color: "#f59e0b" },
              ].map(s => (
                <div key={s.label} style={{ background: "#0f172a", padding: "16px", borderRadius: "14px", border: "1px solid #1e2937", textAlign: "center" }}>
                  <div style={{ fontSize: "20px" }}>{s.icon}</div>
                  <div style={{ fontSize: "22px", fontWeight: "bold", color: s.color, marginTop: "5px" }}>{s.value}</div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>{s.label}</div>
                </div>
              ))}
            </div>
            <button onClick={() => router.push("/my-progress")}
              style={{ width: "100%", padding: "14px", background: "linear-gradient(90deg,#6366f1,#8b5cf6)", color: "white", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}>
              📊 Detailed Progress જુઓ →
            </button>
          </div>
        )}

        {/* ═══ TAB 4: EXAM DATES ═══ */}
        {activeTab === "exams" && (
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "16px", color: "#e2e8f0" }}>📅 આવનારી પરીક્ષાઓ</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
              {EXAM_DATES.map((exam, i) => (
                <div key={i} style={{ background: "#0f172a", border: "1px solid #1e2937", padding: "16px 20px", borderRadius: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h4 style={{ margin: "0 0 3px", fontSize: "15px", fontWeight: "700", color: "#f1f5f9" }}>{exam.name}</h4>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>Notification: Coming Soon</span>
                  </div>
                  <span style={{ background: "#7f1d1d", color: "#fca5a5", fontSize: "12px", padding: "5px 11px", borderRadius: "8px", fontWeight: "700" }}>{exam.date}</span>
                </div>
              ))}
            </div>

            <div style={{ background: "#0f172a", border: "1px solid #1e2937", borderRadius: "16px", padding: "20px" }}>
              <h4 style={{ margin: "0 0 10px", color: "#38bdf8", fontWeight: "700" }}>📋 Form Filling Tips</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  "OJAS Portal par Register karvu jaruri che",
                  "Valid Email ane Mobile number ready rakhvo",
                  "Photo ane Signature 20-50KB ma hovi joiye",
                  "Form submit karta pahela preview check karo",
                  "Application number note karvo",
                ].map((tip, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", fontSize: "13px", color: "#94a3b8", lineHeight: 1.5 }}>
                    <span style={{ color: "#38bdf8", fontWeight: "700", flexShrink: 0 }}>→</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => window.open("https://ojas.gujarat.gov.in", "_blank")}
                style={{ width: "100%", marginTop: "16px", padding: "12px", background: "linear-gradient(90deg,#0ea5e9,#2563eb)", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>
                🔗 OJAS Portal ખોલો
              </button>
            </div>
          </div>
        )}

        {/* ═══ TAB 5: PROFILE ═══ */}
        {activeTab === "profile" && (
          <div>
            <div style={{ background: "linear-gradient(135deg,#1e1b4b,#0f172a)", padding: "24px", borderRadius: "20px", border: "1px solid #312e81", marginBottom: "20px", textAlign: "center" }}>
              <div style={{ width: "70px", height: "70px", borderRadius: "50%", background: "linear-gradient(135deg,#667eea,#764ba2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", margin: "0 auto 12px" }}>🎓</div>
              <h3 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: "700", color: "#e2e8f0" }}>Exam Aspirant</h3>
              <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>{user.email}</p>
            </div>

            <div style={{ background: "#0f172a", border: "1px solid #1e2937", borderRadius: "16px", padding: "16px", marginBottom: "16px" }}>
              <h4 style={{ margin: "0 0 12px", color: "#94a3b8", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Stats</h4>
              {[
                { label: "કુલ ટેસ્ટ આપ્યા", value: progressData.total },
                { label: "સરેરાશ Score", value: `${progressData.avg}%` },
                { label: "Current Streak", value: `${progressData.streak} days` },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1f2937" }}>
                  <span style={{ fontSize: "14px", color: "#94a3b8" }}>{item.label}</span>
                  <span style={{ fontSize: "14px", fontWeight: "700", color: "#38bdf8" }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button onClick={() => router.push("/my-progress")}
                style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>
                📊 Detailed Progress
              </button>
              <button onClick={() => router.push("/admin")}
                style={{ width: "100%", padding: "13px", background: "#1e293b", color: "#94a3b8", border: "1px solid #334155", borderRadius: "12px", fontSize: "14px", cursor: "pointer" }}>
                🛡️ Admin Panel
              </button>
              <button onClick={handleLogout}
                style={{ width: "100%", padding: "13px", background: "#450a0a", color: "#fca5a5", border: "1px solid #7f1d1d", borderRadius: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>
                🚪 Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══ BOTTOM NAV — 5 TABS ═══ */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(3,7,18,0.97)", backdropFilter: "blur(16px)", borderTop: "1px solid #1f2937", padding: "8px 0 12px", zIndex: 100 }}>
        <div style={{ maxWidth: "500px", margin: "0 auto", display: "flex", justifyContent: "space-around" }}>
          {[
            { id: "home", icon: "🏠", label: "Home" },
            { id: "current", icon: "📰", label: "Affairs" },
            { id: "mock", icon: "🏆", label: "Mock" },
            { id: "exams", icon: "📅", label: "Exams" },
            { id: "profile", icon: "👤", label: "Profile" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", color: activeTab === tab.id ? "#38bdf8" : "#475569", cursor: "pointer", padding: "4px 8px", borderRadius: "10px", transition: "all 0.2s", minWidth: "52px" }}>
              <span style={{ fontSize: "19px", filter: activeTab === tab.id ? "none" : "grayscale(0.5)" }}>{tab.icon}</span>
              <span style={{ fontSize: "10px", fontWeight: activeTab === tab.id ? "700" : "500" }}>{tab.label}</span>
              {activeTab === tab.id && <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#38bdf8" }} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CURRENT AFFAIRS INLINE TAB ───
function CurrentAffairsTab() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadArticles = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(`/api/get-current-affairs?date=${today}`);
      const data = await res.json();
      if (data.articles) setArticles(data.articles);
    } catch (e) { console.error(e); }
  };

  const generateNews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cron-current-affairs");
      const data = await res.json();
      if (data.success) await loadArticles();
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadArticles(); }, []);

  const catColor = { "National": "#6366f1", "International": "#0ea5e9", "Economy": "#10b981", "Science": "#f59e0b", "Sports": "#ef4444" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#e2e8f0" }}>📰 આજના Current Affairs</h3>
        <span style={{ fontSize: "12px", color: "#475569" }}>{new Date().toLocaleDateString("gu-IN")}</span>
      </div>

      {articles.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px 20px" }}>
          <div style={{ fontSize: "60px", marginBottom: "16px" }}>🤖</div>
          <h4 style={{ color: "#e2e8f0", marginBottom: "8px", fontSize: "18px" }}>આજના સમાચાર હજુ તૈયાર નથી</h4>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "24px" }}>AI Gemini દ્વારા instant generate કરો</p>
          <button onClick={generateNews} disabled={loading}
            style={{ padding: "14px 32px", background: loading ? "#334155" : "linear-gradient(135deg,#6366f1,#0ea5e9)", border: "none", borderRadius: "14px", color: "white", fontSize: "16px", fontWeight: "800", cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "⏳ Generate થઈ રહ્યું છે..." : "✨ Generate કરો"}
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
            <button onClick={generateNews} disabled={loading}
              style={{ padding: "7px 14px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "8px", color: "#818cf8", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
              🔄 Refresh
            </button>
          </div>
          {articles.map((a, i) => (
            <div key={i} style={{ background: "#0f172a", border: "1px solid #1e2937", borderRadius: "14px", padding: "16px", marginBottom: "12px" }}>
              <div style={{ display: "flex", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                <span style={{ padding: "2px 8px", borderRadius: "5px", fontSize: "11px", fontWeight: "700", background: `${catColor[a.category] || "#6366f1"}22`, color: catColor[a.category] || "#818cf8", border: `1px solid ${catColor[a.category] || "#6366f1"}44` }}>{a.category}</span>
                <span style={{ padding: "2px 8px", borderRadius: "5px", fontSize: "11px", fontWeight: "700", background: a.importance === "High" ? "#ef444420" : "#f59e0b20", color: a.importance === "High" ? "#ef4444" : "#f59e0b" }}>
                  {a.importance === "High" ? "🔥 High" : "📌 Medium"}
                </span>
              </div>
              <h4 style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: "700", lineHeight: 1.4, color: "#f1f5f9" }}>{a.title}</h4>
              <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8", lineHeight: 1.6 }}>{a.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}