"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

// ... બાકી constants same રહે (SUBJECTS, MOCK_TESTS, EXAM_DATES)

export default function PremiumApp() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [authMode, setAuthMode] = useState("login"); // login | register
  const [activeTab, setActiveTab] = useState("dashboard");
  const [progressData, setProgressData] = useState({ total: 0, avg: 0, streak: 0 });

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
      .from('quiz_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data && data.length > 0) {
      const total = data.length;
      const avg = Math.round(data.reduce((a, b) => a + ((b.score / b.total) * 100), 0) / total);
      let streak = 0;
      const uniqueDates = [...new Set(data.map(d => new Date(d.created_at).toDateString()))];
      for (let i = 0; i < uniqueDates.length; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        if (uniqueDates.includes(d.toDateString())) streak++;
        else break;
      }
      setProgressData({ total, avg, streak });
    }
  };

  const handleLogin = async () => {
    if (!email || !password) { setMessage("❌ Email અને Password ભરો!"); return; }
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setMessage("❌ " + error.message);
  };

  const handleRegister = async () => {
    if (!email || !password) { setMessage("❌ Email અને Password ભરો!"); return; }
    if (password.length < 6) { setMessage("❌ Password ઓછામાં ઓછો 6 અક્ષર!"); return; }
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) setMessage("❌ " + error.message);
    else setMessage("✅ Account બની ગયો! હવે Login કરો.");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (authLoading) return (
    <div style={{ minHeight: "100vh", background: "#030712", display: "flex", justifyContent: "center", alignItems: "center", color: "#38bdf8", fontSize: "20px", fontWeight: "bold" }}>
      ⚡ ExamBuddy લોડ થઈ રહ્યું છે...
    </div>
  );

  if (!user) return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at top, #0f172a, #030712)", color: "white", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px", fontFamily: "system-ui" }}>
      <div style={{ maxWidth: "420px", width: "100%", background: "rgba(17,24,39,0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.08)", padding: "40px 30px", borderRadius: "24px", boxShadow: "0 25px 50px rgba(0,0,0,0.5)", textAlign: "center" }}>

        <div style={{ fontSize: "50px", marginBottom: "10px" }}>🎓</div>
        <h1 style={{ fontSize: "32px", fontWeight: "800", background: "linear-gradient(to right, #38bdf8, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 6px" }}>
          ExamBuddy
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "28px" }}>
          ગુજરાત ગવર્નમેન્ટ એક્ઝામ પ્રિપરેશન પોર્ટલ
        </p>

        {/* Tab Switch */}
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
          <input
            type="email"
            placeholder="📧 Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: "100%", padding: "14px", background: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", color: "white", fontSize: "15px", outline: "none", boxSizing: "border-box", textAlign: "center" }}
          />
          <input
            type="password"
            placeholder="🔑 Password (6+ અક્ષર)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (authMode === "login" ? handleLogin() : handleRegister())}
            style={{ width: "100%", padding: "14px", background: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", color: "white", fontSize: "15px", outline: "none", boxSizing: "border-box", textAlign: "center" }}
          />
        </div>

        <button
          onClick={authMode === "login" ? handleLogin : handleRegister}
          disabled={loading}
          style={{ width: "100%", padding: "14px", background: loading ? "#334155" : "linear-gradient(90deg,#0ea5e9,#2563eb)", color: "white", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer", marginBottom: "16px" }}>
          {loading ? "⏳ રાહ જુઓ..." : authMode === "login" ? "🚀 Login કરો" : "✨ Account બનાવો"}
        </button>

        <div style={{ display: "flex", alignItems: "center", margin: "0 0 16px", color: "#4b5563", fontSize: "12px" }}>
          <div style={{ flex: 1, height: "1px", background: "#1f2937" }} />
          <span style={{ padding: "0 10px" }}>અથવા</span>
          <div style={{ flex: 1, height: "1px", background: "#1f2937" }} />
        </div>

        <button
          onClick={() => supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } })}
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

  // ═══ LOGGED IN — Dashboard ═══
  return (
    <div style={{ minHeight: "100vh", background: "#030712", color: "white", fontFamily: "system-ui", paddingBottom: "100px" }}>

      {/* Navbar */}
      <div style={{ borderBottom: "1px solid #1f2937", background: "rgba(3,7,18,0.8)", backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "15px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "900", background: "linear-gradient(to right, #38bdf8, #2563eb)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>🎓 ExamBuddy</h1>
          <span style={{ fontSize: "12px", background: "#1e1b4b", color: "#a5b4fc", padding: "6px 12px", borderRadius: "20px", border: "1px solid #312e81" }}>⚡ Pro User</span>
        </div>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "25px 20px" }}>

        {activeTab === "dashboard" && (
          <div>
            <div style={{ marginBottom: "25px", background: "linear-gradient(135deg,#1e293b,#0f172a)", padding: "25px", borderRadius: "20px", border: "1px solid #334155" }}>
              <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#38bdf8" }}>નમસ્તે! 👋</h2>
              <p style={{ color: "#94a3b8", marginTop: "5px", fontSize: "14px" }}>આજે કયા વિષયની પ્રેક્ટિસ કરવી છે?</p>
            </div>

            <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "15px" }}>📚 મુખ્ય વિષયો</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "30px" }}>
              {SUBJECTS.map(sub => (
                <div key={sub.id} onClick={() => router.push(`/quiz/${sub.id}`)}
                  style={{ background: "#0f172a", border: "1px solid #1e2937", padding: "20px", borderRadius: "18px", cursor: "pointer" }}>
                  <div style={{ fontSize: "32px", marginBottom: "10px" }}>{sub.icon}</div>
                  <h4 style={{ fontSize: "18px", fontWeight: "700" }}>{sub.name}</h4>
                  <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>{sub.count}</p>
                  <span style={{ background: "rgba(56,189,248,0.1)", color: "#38bdf8", padding: "3px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: "bold" }}>{sub.tag}</span>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "15px" }}>🏆 Mock Tests</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {MOCK_TESTS.map(test => (
                <div key={test.id} style={{ background: "#0f172a", border: "1px solid #1e2937", padding: "18px 20px", borderRadius: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h4 style={{ fontSize: "16px", fontWeight: "700", color: "#f1f5f9" }}>{test.name}</h4>
                    <p style={{ fontSize: "12px", color: "#64748b", marginTop: "3px" }}>⏳ {test.time} | 🎯 {test.marks}</p>
                  </div>
                  <button onClick={() => router.push('/mock-test')}
                    style={{ background: "#0ea5e9", color: "white", border: "none", padding: "8px 16px", borderRadius: "10px", fontWeight: "bold", fontSize: "13px", cursor: "pointer" }}>
                    શરૂ કરો
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "progress" && (
          <div>
            <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "15px", color: "#38bdf8" }}>📊 તમારો પ્રોગ્રેસ</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "25px" }}>
              {[
                { icon: "📝", label: "કુલ ટેસ્ટ", value: progressData.total, color: "#38bdf8" },
                { icon: "🎯", label: "સરેરાશ", value: `${progressData.avg}%`, color: "#10b981" },
                { icon: "🔥", label: "Streak", value: `${progressData.streak}`, color: "#f59e0b" },
              ].map(s => (
                <div key={s.label} style={{ background: "#0f172a", padding: "15px", borderRadius: "14px", border: "1px solid #1e2937", textAlign: "center" }}>
                  <div style={{ fontSize: "24px" }}>{s.icon}</div>
                  <div style={{ fontSize: "22px", fontWeight: "bold", color: s.color, marginTop: "5px" }}>{s.value}</div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>{s.label}</div>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "15px" }}>📅 આવનારી પરીક્ષાઓ</h3>
            <div style={{ background: "#0f172a", border: "1px solid #1e2937", borderRadius: "16px", overflow: "hidden", marginBottom: "20px" }}>
              {EXAM_DATES.map((exam, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "16px 20px", borderBottom: i !== EXAM_DATES.length - 1 ? "1px solid #1f2937" : "none", alignItems: "center" }}>
                  <span style={{ fontWeight: "600" }}>{exam.name}</span>
                  <span style={{ background: "#7f1d1d", color: "#fca5a5", fontSize: "12px", padding: "4px 10px", borderRadius: "8px", fontWeight: "bold" }}>{exam.date}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button onClick={() => router.push('/my-progress')}
                style={{ width: "100%", padding: "14px", background: "linear-gradient(90deg,#6366f1,#8b5cf6)", color: "white", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}>
                📊 Detailed Progress જુઓ
              </button>
              <button onClick={() => router.push('/analytics')}
                style={{ width: "100%", padding: "14px", background: "linear-gradient(90deg,#0ea5e9,#2563eb)", color: "white", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}>
                📈 Full Analytics
              </button>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div style={{ background: "#0f172a", border: "1px solid #1e2937", padding: "30px", borderRadius: "20px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "20px", color: "#ef4444" }}>👤 પ્રોફાઇલ</h3>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "5px" }}>ઈમેઈલ</label>
              <input type="text" value={user.email} disabled
                style={{ width: "100%", padding: "12px", background: "#030712", border: "1px solid #1f2937", borderRadius: "10px", color: "#94a3b8", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
              <button onClick={() => router.push('/register')}
                style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>
                ✏️ Profile Edit કરો
              </button>
              <button onClick={() => router.push('/admin')}
                style={{ width: "100%", padding: "13px", background: "#1e293b", color: "#94a3b8", border: "1px solid #334155", borderRadius: "12px", fontSize: "14px", cursor: "pointer" }}>
                🛡️ Admin Panel
              </button>
              <button onClick={handleLogout}
                style={{ width: "100%", padding: "13px", background: "#450a0a", color: "#fca5a5", border: "1px solid #7f1d1d", borderRadius: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>
                🚪 લોગઆઉટ
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(15,23,42,0.95)", backdropFilter: "blur(12px)", borderTop: "1px solid #1f2937", padding: "12px 0", zIndex: 100 }}>
        <div style={{ maxWidth: "500px", margin: "0 auto", display: "flex", justifyContent: "space-around" }}>
          {[
            { id: "dashboard", icon: "🏠", label: "ડેશબોર્ડ" },
            { id: "progress", icon: "📊", label: "પ્રોગ્રેસ" },
            { id: "profile", icon: "👤", label: "પ્રોફાઇલ" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === tab.id ? "#38bdf8" : "#64748b", cursor: "pointer", fontWeight: activeTab === tab.id ? "bold" : "normal" }}>
              <span style={{ fontSize: "20px" }}>{tab.icon}</span>
              <span style={{ fontSize: "12px" }}>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}