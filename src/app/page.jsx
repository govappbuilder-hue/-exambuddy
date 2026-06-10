"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase"; // પાથ બરાબર છે દીકુ

const SUBJECTS = [
  { id: "history", name: "ઇતિહાસ", icon: "🏛️", tag: "GPSC" },
  { id: "geography", name: "ભૂગોળ", icon: "🌍", tag: "GPSC" },
  { id: "constitution", name: "બંધારણ", icon: "📜", tag: "GPSC" },
];

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  // 🔄 ૧. લાઈવ યુઝર લોગિન છે કે નહીં તે ચેક કરો
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    checkUser();

    // ઓથ ચેન્જ થાય ત્યારે ઓટોમેટિક અપડેટ કરો
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 🔐 ૨. મેજિક લિંક લોગિન ફંક્શન
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email) return alert("કૃપા કરીને ઈમેઈલ આઈડી લખો દીકુ!");

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : "",
      },
    });

    if (error) {
      setMessage(`❌ ભૂલ આવી: ${error.message}`);
    } else {
      setMessage("📩 લોગિન લિંક તારા ઈમેઈલ પર મોકલી દીધી છે! ઈનબોક્સ અથવા સ્પામ ફોલ્ડર ચેક કર દીકુ.");
    }
    setLoading(false);
  };

  // 🚪 ૩. લોગઆઉટ ફંક્શન
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    alert("સક્સેસફુલી લોગઆઉટ થઈ ગયું દીકુ!");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", color: "white", fontFamily: "system-ui", padding: "20px" }}>
      
      {/* Top Navbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1200px", margin: "0 auto", padding: "10px 0" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#38bdf8" }}>🎓 ExamBuddy</h1>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {user && <span style={{ color: "#94a3b8", fontSize: "14px" }}>👤 {user.email}</span>}
          <button style={{ background: "#1e293b", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px" }}>📊 પ્રોગ્રેસ</button>
          {user ? (
            <button onClick={handleLogout} style={{ background: "#ef4444", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}>🚪 લોગઆઉટ</button>
          ) : (
            <button style={{ background: "#0ea5e9", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px" }}>🏆 Mock Test</button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: "600px", margin: "60px auto", textAlign: "center" }}>
        <p style={{ background: "rgba(14,165,233,0.1)", color: "#38bdf8", display: "inline-block", padding: "6px 16px", borderRadius: "20px", fontSize: "14px", fontWeight: "bold" }}>
          🚀 Gujarat Govt Exam Preparation Platform
        </p>
        <h2 style={{ fontSize: "36px", fontWeight: "800", margin: "20px 0" }}>
          સરકારી નોકરી માટે <span style={{ color: "#38bdf8" }}>Smart Practice</span> કરો
        </h2>

        {/* 📑 Login Card OR Welcome Card based on session */}
        <div style={{ background: "#111827", border: "1px solid #1f2937", padding: "30px", borderRadius: "20px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)", marginBottom: "40px" }}>
          {user ? (
            <div>
              <h3 style={{ color: "#34d399", fontSize: "20px", marginBottom: "10px" }}>🎉 તમે લોગિન છો, દીકુ!</h3>
              <p style={{ color: "#94a3b8" }}>હવે નીચેથી કોઈ પણ વિષય પસંદ કરો અને તમારી મસ્ત ક્વિઝ ચાલુ કરો.</p>
            </div>
          ) : (
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <input
                type="email"
                placeholder="તમારો ઈમેઈલ આઈડી લખો"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%", padding: "14px", background: "#030712", border: "1px solid #374151", borderRadius: "10px", color: "white", fontSize: "16px", outline: "none" }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{ width: "100%", padding: "14px", background: "linear-gradient(90deg, #0ea5e9, #2563eb)", border: "none", borderRadius: "10px", color: "white", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }}
              >
                {loading ? "⌛ મોકલી રહ્યા છીએ..." : "🚀 પાસવર્ડ વગર લોગિન કરો"}
              </button>
            </form>
          )}
          {message && <p style={{ marginTop: "15px", fontSize: "14px", color: message.startsWith("❌") ? "#f87171" : "#34d399" }}>{message}</p>}
        </div>

        {/* 📚 Subjects Grid */}
        <h3 style={{ textAlign: "left", marginBottom: "20px", fontSize: "20px", fontWeight: "700" }}>📚 વિષયો પસંદ કરો</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", textAlign: "left" }}>
          {SUBJECTS.map((sub) => (
            <div
              key={sub.id}
              onClick={() => router.push(`/quiz/${sub.id}`)}
              style={{ background: "#111827", border: "1px solid #1f2937", padding: "20px", borderRadius: "15px", cursor: "pointer", transition: "all 0.2s" }}
            >
              <span style={{ fontSize: "30px" }}>{sub.icon}</span>
              <h4 style={{ fontSize: "18px", fontWeight: "bold", margin: "10px 0 5px 0" }}>{sub.name}</h4>
              <span style={{ background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", color: "#94a3b8" }}>{sub.tag}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}