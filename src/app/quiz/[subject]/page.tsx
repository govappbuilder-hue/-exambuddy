"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation?: string;
  subject: string;
}

export default function QuizPage({ params }: { params: Promise<{ subject: string }> }) {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);

  useEffect(() => {
    params.then(p => setSubject(p.subject));
  }, [params]);

  useEffect(() => {
    if (!subject) return;
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("questions")
        .select("*")
        .ilike("subject", subject.replace(/_/g, " "))
        .limit(20);
      setQuestions(data || []);
      setLoading(false);
    }
    load();
  }, [subject]);

  useEffect(() => {
    if (done || loading) return;
    if (timeLeft <= 0) { setDone(true); return; }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, done, loading]);

  const formatTime = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const timerColor = timeLeft < 60 ? "#ef4444" : timeLeft < 180 ? "#f59e0b" : "#34d399";

  const handleSelect = (opt: string) => {
    if (showResult) return;
    setSelected(opt);
    setShowResult(true);
  };

  const handleNext = () => {
    const q = questions[current];
    if (selected === q.correct_answer) setScore(s => s + 1);
    if (current + 1 < questions.length) {
      setCurrent(c => c + 1);
      setSelected(null);
      setShowResult(false);
    } else {
      setDone(true);
    }
  };

  const getOptStyle = (opt: string) => {
    const base: React.CSSProperties = {
      width: "100%", padding: "14px 18px", borderRadius: "14px",
      border: "2px solid", cursor: showResult ? "default" : "pointer",
      display: "flex", alignItems: "center", gap: "12px",
      textAlign: "left", fontSize: "15px", fontWeight: "600",
      transition: "all 0.2s", marginBottom: "10px"
    };
    if (!showResult) {
      return { ...base, background: selected === opt ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)", borderColor: selected === opt ? "#6366f1" : "rgba(255,255,255,0.08)", color: "white" };
    }
    const q = questions[current];
    const correct = q.correct_answer;
    if (opt === correct) return { ...base, background: "rgba(52,211,153,0.2)", borderColor: "#34d399", color: "#34d399" };
    if (opt === selected && opt !== correct) return { ...base, background: "rgba(248,113,113,0.2)", borderColor: "#f87171", color: "#f87171" };
    return { ...base, background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)", color: "#475569" };
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
        <p style={{ color: "#818cf8", fontWeight: "700", fontSize: "18px" }}>પ્રશ્નો લોડ થઈ રહ્યા છે...</p>
      </div>
    </div>
  );

  if (questions.length === 0) return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
        <p style={{ color: "#f87171", fontWeight: "700", fontSize: "18px" }}>આ વિષય માટે પ્રશ્નો નથી!</p>
        <button onClick={() => router.push("/")}
          style={{ marginTop: "20px", padding: "12px 24px", background: "linear-gradient(135deg, #6366f1, #0ea5e9)", border: "none", borderRadius: "12px", color: "white", fontWeight: "700", cursor: "pointer" }}>
          ← પાછા જાઓ
        </button>
      </div>
    </div>
  );

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div style={{ minHeight: "100vh", background: "#0a0f1e", fontFamily: "system-ui", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div style={{ maxWidth: "500px", width: "100%", textAlign: "center" }}>
          <div style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(14,165,233,0.3))", border: "1px solid rgba(99,102,241,0.4)", borderRadius: "28px", padding: "40px", marginBottom: "20px" }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>
              {pct >= 80 ? "🏆" : pct >= 60 ? "🎯" : pct >= 40 ? "📚" : "💪"}
            </div>
            <h2 style={{ fontSize: "28px", fontWeight: "900", color: "white", margin: "0 0 8px" }}>ક્વિઝ પૂરી!</h2>
            <div style={{ fontSize: "64px", fontWeight: "900", background: "linear-gradient(90deg, #818cf8, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "12px 0" }}>
              {score}/{questions.length}
            </div>
            <div style={{ fontSize: "20px", color: "#94a3b8", fontWeight: "600" }}>{pct}% Accuracy</div>
            <div style={{ marginTop: "8px", fontSize: "16px", color: pct >= 70 ? "#34d399" : "#f87171", fontWeight: "700" }}>
              {pct >= 80 ? "Excellent! 🌟" : pct >= 60 ? "Good Job! 👍" : pct >= 40 ? "Keep Practicing! 📖" : "Don't Give Up! 💪"}
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={() => { setCurrent(0); setScore(0); setSelected(null); setShowResult(false); setDone(false); setTimeLeft(600); }}
              style={{ flex: 1, padding: "14px", background: "linear-gradient(135deg, #6366f1, #0ea5e9)", border: "none", borderRadius: "14px", color: "white", fontWeight: "800", cursor: "pointer", fontSize: "15px" }}>
              🔄 ફરી રમો
            </button>
            <button onClick={() => router.push("/")}
              style={{ flex: 1, padding: "14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", color: "white", fontWeight: "800", cursor: "pointer", fontSize: "15px" }}>
              🏠 Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const opts = [
    { key: "A", val: q.option_a },
    { key: "B", val: q.option_b },
    { key: "C", val: q.option_c },
    { key: "D", val: q.option_d },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", fontFamily: "system-ui", color: "white" }}>

      {/* Top Bar */}
      <div style={{ background: "rgba(15,23,42,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "12px 20px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => router.push("/")}
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "8px 14px", color: "#94a3b8", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}>
            ← Home
          </button>
          <span style={{ fontWeight: "800", fontSize: "16px", color: "white", textTransform: "capitalize" }}>
            📚 {subject.replace(/_/g, " ")}
          </span>
          <div style={{ background: `${timerColor}20`, border: `1px solid ${timerColor}50`, borderRadius: "10px", padding: "8px 14px", color: timerColor, fontWeight: "800", fontFamily: "monospace", fontSize: "15px" }}>
            ⏱ {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "24px 20px" }}>

        {/* Progress */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#64748b", fontWeight: "600", marginBottom: "8px" }}>
          <span>પ્રશ્ન {current + 1} / {questions.length}</span>
          <span style={{ color: "#34d399" }}>Score: {score}</span>
        </div>
        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "99px", height: "6px", marginBottom: "24px" }}>
          <div style={{ background: "linear-gradient(90deg, #6366f1, #0ea5e9)", height: "100%", borderRadius: "99px", width: `${((current + 1) / questions.length) * 100}%`, transition: "width 0.4s" }} />
        </div>

        {/* Question Card */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "24px", marginBottom: "20px" }}>
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>
            {subject.replace(/_/g, " ")} • Question {current + 1}
          </div>
          <p style={{ fontSize: "18px", fontWeight: "700", color: "white", margin: 0, lineHeight: 1.6 }}>
            {q.question}
          </p>
        </div>

        {/* Options */}
        <div>
          {opts.map(({ key, val }) => (
            <button key={key} onClick={() => handleSelect(key)} style={getOptStyle(key)}>
              <span style={{
                width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: "800", fontSize: "13px", flexShrink: 0,
                background: showResult
                  ? key === questions[current].correct_answer ? "#34d399"
                  : key === selected ? "#f87171" : "rgba(255,255,255,0.06)"
                  : selected === key ? "#6366f1" : "rgba(255,255,255,0.06)",
                color: "white"
              }}>
                {key}
              </span>
              <span>{val}</span>
              {showResult && key === questions[current].correct_answer && <span style={{ marginLeft: "auto", fontSize: "18px" }}>✅</span>}
              {showResult && key === selected && key !== questions[current].correct_answer && <span style={{ marginLeft: "auto", fontSize: "18px" }}>❌</span>}
            </button>
          ))}
        </div>

        {/* Explanation Box */}
        {showResult && (
          <div style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: "16px", padding: "16px 20px", marginTop: "4px", marginBottom: "16px" }}>
            <p style={{ margin: "0 0 6px", fontWeight: "800", color: "#fbbf24", fontSize: "14px" }}>💡 સ્પષ્ટીકરણ:</p>
            <p style={{ margin: 0, color: "#e2e8f0", fontSize: "14px", lineHeight: 1.6 }}>
              {q.explanation || `સાચો જવાબ: વિકલ્પ ${questions[current].correct_answer} છે.`}
            </p>
          </div>
        )}

        {/* Next Button */}
        {showResult && (
          <button onClick={handleNext}
            style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg, #6366f1, #0ea5e9)", border: "none", borderRadius: "14px", color: "white", fontWeight: "800", fontSize: "16px", cursor: "pointer" }}>
            {current + 1 === questions.length ? "🏁 ક્વિઝ પૂરી કરો" : "આગળ →"}
          </button>
        )}
      </div>
    </div>
  );
}