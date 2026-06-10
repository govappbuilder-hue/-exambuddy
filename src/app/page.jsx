"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

const SUBJECTS = [
  { id: "history", name: "ઇતિહાસ", icon: "🏛️", tag: "GPSC / Class 3", count: "૧,૨૦૦+ Questions" },
  { id: "geography", name: "ભૂગોળ", icon: "🌍", tag: "GPSC / Class 3", count: "૯૫૦+ Questions" },
  { id: "constitution", name: "બંધારણ", icon: "📜", tag: "GPSC / Class 3", count: "૮૦૦+ Questions" },
];

const MOCK_TESTS = [
  { id: "mock-1", name: "Full Mock Test - 1", time: "૧૨૦ મિનિટ", marks: "૨૦૦ ગુણ" },
  { id: "mock-2", name: "Current Affairs Weekly", time: "૩૦ મિનિટ", marks: "૫૦ ગુણ" },
];

const EXAM_DATES = [
  { name: "GPSC Class 1 & 2", date: "૨૪ ઓગસ્ટ, ૨૦૨૬" },
  { name: "GSSSB Clerk / Head Clerk", date: "૧૨ સપ્ટેમ્બર, ૨૦૨૬" },
  { name: "Gujarat Police Constable", date: "૦૫ ઓક્ટોબર, ૨૦૨૬" },
];

export default function PremiumApp() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, progress, profile

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setAuthLoading(false);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleMagicLogin = async (e) => {
    e.preventDefault();
    if (!email) return alert("કૃપા કરીને ઈમેઈલ લખો દીકુ!");
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: typeof window !== "undefined" ? window.location.origin : "" },
    });

    if (error) setMessage(`❌ એરર: ${error.message}`);
    else setMessage("📩 લોગિન લિંક તારા ઈમેઈલ પર મોકલી દીધી છે! ઈનબોક્સ ચેક કર.");
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: typeof window !== "undefined" ? window.location.origin : "" },
    });
    if (error) alert(error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setActiveTab("dashboard");
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#030712", display: "flex", justifyContent: "center", alignItems: "center", color: "#38bdf8", fontSize: "20px", fontWeight: "bold" }}>
        <div style={{ animation: "pulse 1.5s infinite" }}>⚡ ExamBuddy લોડ થઈ રહ્યું છે...</div>
      </div>
    );
  }

  // 🔒 ૧. જો યુઝર લોગિન ન હોય તો આ ગ્લેમરસ લોગિન સ્ક્રીન દેખાશે
  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: "radial-gradient(circle at top, #0f172a, #030712)", color: "white", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px", fontFamily: "system-ui" }}>
        <div style={{ maxWidth: "450px", width: "100%", background: "rgba(17, 24, 39, 0.7)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.08)", padding: "40px 30px", borderRadius: "24px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", textAlign: "center" }}>
          <div style={{ fontSize: "50px", marginBottom: "10px" }}>🎓</div>
          <h1 style={{ fontSize: "32px", fontWeight: "800", background: "linear-gradient(to right, #38bdf8, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ExamBuddy</h1>
          <p style={{ color: "#94a3b8", marginTop: "8px", fontSize: "14px" }}>ગુજરાત ગવર્નમેન્ટ એક્ઝામ પ્રિપરેશન પોર્ટલ</p>
          
          <div style={{ height: "1px", background: "linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)", margin: "25px 0" }} />
          
          <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px", color: "#e2e8f0" }}>એપ્લિકેશન વાપરવા માટે લોગિન કરો</h2>

          {/* Google Login Button */}
          <button onClick={handleGoogleLogin} style={{ width: "100%", padding: "14px", background: "white", color: "#111827", border: "none", borderRadius: "14px", fontSize: "16px", fontWeight: "700", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", cursor: "pointer", boxShadow: "0 4px 12px rgba(255,255,255,0.1)", transition: "0.2s" }}>
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5.04c1.65 0 3.13.57 4.3 1.69l3.22-3.22C17.56 1.7 14.97 1 12 1 7.42 1 3.51 3.63 1.62 7.45l3.86 3C6.39 7.45 9 5.04 12 5.04z"/><path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.43h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.38-4.88 3.38-8.48z"/><path fill="#FBBC05" d="M5.48 14.55c-.24-.72-.38-1.49-.38-2.3c0-.81.14-1.58.38-2.3L1.62 6.95C.59 9.02 0 11.34 0 13.75s.59 4.73 1.62 6.8l3.86-3z"/><path fill="#34A853" d="M12 23c3.24 0 5.97-1.08 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-4.3 1.09-3 0-5.61-2.41-6.52-5.41l-3.86 3C3.51 20.37 7.42 23 12 23z"/></svg>
            Continue with Google
          </button>

          <div style={{ display: "flex", alignItems: "center", margin: "20px 0", color: "#4b5563", fontSize: "12px" }}>
            <div style={{ flex: 1, height: "1px", background: "#1f2937" }} />
            <span style={{ padding: "0 10px" }}>અથવા</span>
            <div style={{ flex: 1, height: "1px", background: "#1f2937" }} />
          </div>

          {/* Magic Link Form */}
          <form onSubmit={handleMagicLogin} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input type="email" placeholder="તમારો ઈમેઈલ આઈડી લખો" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: "14px", background: "#030712", border: "1px solid #1f2937", borderRadius: "12px", color: "white", fontSize: "15px", outline: "none", textAlign: "center" }} />
            <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px", background: "linear-gradient(90deg, #0ea5e9, #2563eb)", color: "white", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: "700", cursor: "pointer" }}>
              {loading ? "⌛ મોકલી રહ્યા છીએ..." : "🚀 OTP વગર સીધા લોગિન કરો"}
            </button>
          </form>
          {message && <p style={{ marginTop: "15px", fontSize: "13px", color: "#34d399" }}>{message}</p>}
        </div>
      </div>
    );
  }

  // 🔓 ૨. જો યુઝર લોગિન થઈ જાય, તો આ અલ્ટ્રા મોર્ડન ડેશબોર્ડ ૩ ટેબ્સ સાથે ખુલશે
  return (
    <div style={{ minHeight: "100vh", background: "#030712", color: "white", fontFamily: "system-ui", paddingBottom: "100px" }}>
      
      {/* Top Premium Navbar */}
      <div style={{ borderBottom: "1px solid #1f2937", background: "rgba(3,7,18,0.8)", backdropFilter: "blur(10px)", sticky: "top", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "15px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "900", letterSpacing: "0.5px", background: "linear-gradient(to right, #38bdf8, #2563eb)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>🎓 ExamBuddy</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "12px", background: "#1e1b4b", color: "#a5b4fc", padding: "6px 12px", borderRadius: "20px", border: "1px solid #312e81" }}>⚡ Pro User</span>
          </div>
        </div>
      </div>

      {/* Main Content Body based on Active Tab */}
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "25px 20px" }}>
        
        {/* TAB 1: DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <div>
            <div style={{ marginBottom: "25px", background: "linear-gradient(135deg, #1e293b, #0f172a)", padding: "25px", borderRadius: "20px", border: "1px solid #334155" }}>
              <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#38bdf8" }}>નમસ્તે ભાઈ! 👋</h2>
              <p style={{ color: "#94a3b8", marginTop: "5px", fontSize: "14px" }}>આજે કયા વિષયની પ્રેક્ટિસ કરવી છે? નીચેથી પસંદ કરો અને કડક તૈયારી શરૂ કરો.</p>
            </div>

            {/* Subjects Grid */}
            <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>📚 મુખ્ય વિષયો પ્રેક્ટિસ</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "30px" }}>
              {SUBJECTS.map((sub) => (
                <div key={sub.id} onClick={() => router.push(`/quiz/${sub.id}`)} style={{ background: "#0f172a", border: "1px solid #1e2937", padding: "20px", borderRadius: "18px", cursor: "pointer", transition: "0.2s", position: "relative", overflow: "hidden" }}>
                  <div style={{ fontSize: "32px", marginBottom: "10px" }}>{sub.icon}</div>
                  <h4 style={{ fontSize: "18px", fontWeight: "700" }}>{sub.name}</h4>
                  <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>{sub.count}</p>
                  <span style={{ position: "absolute", top: "15px", right: "15px", background: "rgba(56,189,248,0.1)", color: "#38bdf8", padding: "3px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: "bold" }}>{sub.tag}</span>
                </div>
              ))}
            </div>

            {/* Mock Tests Section */}
            <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "15px" }}>🏆 લાઈવ Mock Tests</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {MOCK_TESTS.map((test) => (
                <div key={test.id} style={{ background: "#0f172a", border: "1px solid #1e2937", padding: "18px 20px", borderRadius: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h4 style={{ fontSize: "16px", fontWeight: "700", color: "#f1f5f9" }}>{test.name}</h4>
                    <p style={{ fontSize: "12px", color: "#64748b", marginTop: "3px" }}>⏳ {test.time} | 🎯 {test.marks}</p>
                  </div>
                  <button onClick={() => alert("Mock Test ટૂંક સમયમાં શરૂ થશે દીકુ!")} style={{ background: "#0ea5e9", color: "white", border: "none", padding: "8px 16px", borderRadius: "10px", fontWeight: "bold", fontSize: "13px", cursor: "pointer" }}>શરૂ કરો</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: MY PROGRESS & EXAM DATES TAB */}
        {activeTab === "progress" && (
          <div>
            <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "15px", color: "#38bdf8" }}>📊 તમારો પર્ફોર્મન્સ અહેવાલ</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "35px" }}>
              <div style={{ background: "#0f172a", padding: "15px", borderRadius: "14px", border: "1px solid #1e2937", textAlign: "center" }}>
                <span style={{ fontSize: "12px", color: "#64748b" }}>કુલ સોલ્વ કરેલા પ્રશ્નો</span>
                <div style={{ fontSize: "24px", fontWeight: "bold", color: "#38bdf8", marginTop: "5px" }}>૧૪૮</div>
              </div>
              <div style={{ background: "#0f172a", padding: "15px", borderRadius: "14px", border: "1px solid #1e2937", textAlign: "center" }}>
                <span style={{ fontSize: "12px", color: "#64748b" }}>સરેરાશ એક્યુરેસી</span>
                <div style={{ fontSize: "24px", fontWeight: "bold", color: "#10b981", marginTop: "5px" }}>૭૬%</div>
              </div>
              <div style={{ background: "#0f172a", padding: "15px", borderRadius: "14px", border: "1px solid #1e2937", textAlign: "center" }}>
                <span style={{ fontSize: "12px", color: "#64748b" }}>ડેઇલી સ્ટ્રીક</span>
                <div style={{ fontSize: "24px", fontWeight: "bold", color: "#f59e0b", marginTop: "5px" }}>🔥 ૫ દિવસ</div>
              </div>
            </div>

            {/* Live Exam Dates Calendar */}
            <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "15px" }}>📅 આવનારી પરીક્ષાઓની તારીખો</h3>
            <div style={{ background: "#0f172a", border: "1px solid #1e2937", borderRadius: "16px", overflow: "hidden" }}>
              {EXAM_DATES.map((exam, index) => (
                <div key={index} style={{ display: "flex", justifyContent: "space-between", padding: "16px 20px", borderBottom: index !== EXAM_DATES.length - 1 ? "1px solid #1f2937" : "none", alignItems: "center" }}>
                  <span style={{ fontWeight: "600" }}>{exam.name}</span>
                  <span style={{ background: "#7f1d1d", color: "#fca5a5", fontSize: "12px", padding: "4px 10px", borderRadius: "8px", fontWeight: "bold" }}>{exam.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PROFILE & REGISTER FORM TAB */}
        {activeTab === "profile" && (
          <div style={{ background: "#0f172a", border: "1px solid #1e2937", padding: "30px", borderRadius: "20px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "20px", color: "#ef4444" }}>👤 પ્રોફાઇલ અને સેટિંગ્સ</h3>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "5px" }}>લોગિન આઈડી (ઈમેઈલ)</label>
              <input type="text" value={user.email} disabled style={{ width: "100%", padding: "12px", background: "#030712", border: "1px solid #1f2937", borderRadius: "10px", color: "#94a3b8" }} />
            </div>

            <div style={{ marginBottom: "30px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "5px" }}>યુઝર આઈડી (Supabase UID)</label>
              <input type="text" value={user.id} disabled style={{ width: "100%", padding: "12px", background: "#030712", border: "1px solid #1f2937", borderRadius: "10px", color: "#64748b", fontSize: "12px" }} />
            </div>

            <button onClick={handleLogout} style={{ width: "100%", padding: "14px", background: "#ef4444", color: "white", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "bold", cursor: "pointer", transition: "0.2s" }}>
              🚪 એપ્લિકેશનમાંથી લોગઆઉટ કરો
            </button>
          </div>
        )}

      </div>

      {/* 📱 Bottom Navigation 3-Tab Bar (આનાથી યુઝર ફિદા થઈ જશે!) */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(15,23,42,0.9)", backdropFilter: "blur(12px)", borderTop: "1px solid #1f2937", padding: "12px 0", zIndex: 100 }}>
        <div style={{ maxWidth: "500px", margin: "0 auto", display: "flex", justifyContent: "space-around" }}>
          
          <button onClick={() => setActiveTab("dashboard")} style={{ background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "dashboard" ? "#38bdf8" : "#64748b", cursor: "pointer", fontWeight: activeTab === "dashboard" ? "bold" : "normal" }}>
            <span style={{ fontSize: "20px" }}>🏠</span>
            <span style={{ fontSize: "12px" }}>ડેશબોર્ડ</span>
          </button>

          <button onClick={() => setActiveTab("progress")} style={{ background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "progress" ? "#38bdf8" : "#64748b", cursor: "pointer", fontWeight: activeTab === "progress" ? "bold" : "normal" }}>
            <span style={{ fontSize: "20px" }}>📊</span>
            <span style={{ fontSize: "12px" }}>પ્રોગ્રેસ</span>
          </button>

          <button onClick={() => setActiveTab("profile")} style={{ background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "profile" ? "#38bdf8" : "#64748b", cursor: "pointer", fontWeight: activeTab === "profile" ? "bold" : "normal" }}>
            <span style={{ fontSize: "20px" }}>👤</span>
            <span style={{ fontSize: "12px" }}>પ્રોફાઇલ</span>
          </button>

        </div>
      </div>

    </div>
  );
}