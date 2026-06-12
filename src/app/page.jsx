"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

const Icon = ({ name, size = 20, className = "" }) => {
  const icons = {
    home: <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
    quiz: <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    brain: <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />,
    cards: <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />,
    newspaper: <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />,
    trophy: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />,
    store: <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />,
    upload: <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />,
    camera: <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />,
    spark: <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />,
    bookmark: <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />,
    fire: <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />,
    x: <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />,
    rotate: <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />,
    search: <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
    bell: <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />,
    chart: <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
    download: <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />,
    star: <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,
    plus: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />,
    send: <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />,
    lock: <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />,
    share: <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />,
    eye: <><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>,
    target: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
    list: <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />,
    lightning: <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
      {icons[name] || icons.home}
    </svg>
  );
};

const TABS = [
  { id: "dashboard", label: "Home", icon: "home" },
  { id: "quiz", label: "Quiz", icon: "quiz" },
  { id: "doubt", label: "Doubt", icon: "brain" },
  { id: "flashcards", label: "Cards", icon: "cards" },
  { id: "current", label: "News", icon: "newspaper" },
  { id: "leaderboard", label: "Rank", icon: "trophy" },
  { id: "marketplace", label: "Shop", icon: "store" },
];

const SUBJECTS = ["All", "History", "Geography", "Polity", "Science", "Economics", "English", "Maths"];

const Badge = ({ children, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border border-blue-200",
    green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border border-amber-200",
    red: "bg-red-50 text-red-600 border border-red-200",
    purple: "bg-violet-50 text-violet-700 border border-violet-200",
    gray: "bg-gray-800 text-gray-300 border border-gray-700",
    orange: "bg-orange-50 text-orange-700 border border-orange-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${colors[color] || colors.blue}`}>
      {children}
    </span>
  );
};

const Card = ({ children, className = "", onClick }) => (
  <div onClick={onClick}
    className={`bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-gray-900/50 shadow-sm ${onClick ? "cursor-pointer hover:border-blue-200 hover:shadow-md active:scale-[0.985] transition-all duration-150" : ""} ${className}`}>
    {children}
  </div>
);

const StatCard = ({ label, value, sub, icon, color = "blue", trend }) => {
  const palettes = {
    blue: { light: "bg-blue-50", text: "text-blue-600", border: "border-blue-100", ring: "bg-blue-100" },
    green: { light: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100", ring: "bg-emerald-100" },
    amber: { light: "bg-amber-50", text: "text-amber-600", border: "border-amber-100", ring: "bg-amber-100" },
    purple: { light: "bg-violet-50", text: "text-violet-600", border: "border-violet-100", ring: "bg-violet-100" },
  };
  const p = palettes[color];
  return (
    <div className={`bg-gray-900 border ${p.border} rounded-2xl p-4 shadow-gray-900/50 shadow-sm relative overflow-hidden`}>
      <div className={`absolute -right-4 -top-4 w-16 h-16 ${p.ring} rounded-full opacity-50`} />
      <div className="flex items-start justify-between relative">
        <div>
          <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-black text-gray-50">{value}</p>
          {sub && <p className={`text-[11px] font-semibold mt-0.5 ${trend === "up" ? "text-emerald-600" : "text-gray-500"}`}>{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-xl ${p.light} ${p.text}`}>
          <Icon name={icon} size={18} />
        </div>
      </div>
    </div>
  );
};

const SubjectPills = ({ active, onChange }) => (
  <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
    {SUBJECTS.map(s => (
      <button key={s} onClick={() => onChange(s)}
        className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${active === s
          ? "bg-blue-600 text-white border-blue-600 shadow-gray-900/50 shadow-sm"
          : "bg-gray-900 text-gray-300 border-gray-700 hover:border-blue-300"}`}>
        {s}
      </button>
    ))}
  </div>
);

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
const DashboardTab = ({ setActiveTab }) => {
  const [streak, setStreak] = useState(0);
  const [stats, setStats] = useState({ quizzes: 0, accuracy: 0, flashcards: 0, rank: "-" });
  const [statsLoading, setStatsLoading] = useState(true);
  const [todos, setTodos] = useState([
    { task: "Complete History Quiz – Ch. 5", done: false },
    { task: "Read Current Affairs", done: false },
    { task: "Revise 20 Polity Flashcards", done: false },
    { task: "Practice Negative Marking Set", done: false },
  ]);
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const completed = [true, true, true, true, true, true, false];

  const toggleTodo = (i) => {
    setTodos(prev => prev.map((t, idx) => idx === i ? { ...t, done: !t.done } : t));
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setStatsLoading(false); return; }

        const { data: scores } = await supabase
          .from("user_scores")
          .select("score, total, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (scores && scores.length > 0) {
          const totalQuizzes = scores.length;
          const totalCorrect = scores.reduce((sum, s) => sum + (s.score || 0), 0);
          const totalQs = scores.reduce((sum, s) => sum + (s.total || 1), 0);
          const accuracy = Math.round((totalCorrect / totalQs) * 100);

          const dates = [...new Set(scores.map(s => s.created_at?.split("T")[0]))].sort().reverse();
          let currentStreak = 0;
          for (let i = 0; i < dates.length; i++) {
            const expected = new Date(Date.now() - i * 86400000).toISOString().split("T")[0];
            if (dates[i] === expected) currentStreak++;
            else break;
          }

          const { count } = await supabase
            .from("user_scores")
            .select("user_id", { count: "exact", head: true })
            .neq("user_id", user.id);

          setStreak(currentStreak);
          setStats({
            quizzes: totalQuizzes,
            accuracy: accuracy || 0,
            flashcards: Math.floor(totalQuizzes * 2.5),
            rank: count ? `#${Math.floor(count * 0.1) + 1}` : "#1"
          });
        }
      } catch (e) {
        console.error("Stats fetch error:", e);
      }
      setStatsLoading(false);
    };
    fetchStats();
  }, []);

  const donePct = Math.round((todos.filter(t => t.done).length / todos.length) * 100);

  const examDates = [
    { exam: "GSSSB Junior Clerk 2026", date: new Date("2026-07-12"), icon: "🟡" },
    { exam: "IBPS PO 2026", date: new Date("2026-08-09"), icon: "🟢" },
    { exam: "UPSC Prelims 2027", date: new Date("2027-05-23"), icon: "🔴" },
  ];
  const today = new Date();
  const exams = examDates.map(e => {
    const diff = Math.ceil((e.date - today) / (1000 * 60 * 60 * 24));
    return { ...e, days: diff > 0 ? diff : 0, urgent: diff <= 14 && diff > 0, dateStr: e.date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) };
  });

  const GOV_EXAMS = [
    "GPSC", "PSI", "Talati", "GSSSB", "UPSC", "Bin Sachivalay",
    "Constable", "TET", "TAT", "HTAT", "Junior Clerk", "Forest Guard",
    "Police Sub-Inspector", "Revenue Talati", "GPSC AE", "IBPS PO", "Railway NTPC",
  ];

  return (
    <div className="space-y-5">
      <div className="relative rounded-3xl overflow-hidden" style={{ background: "linear-gradient(135deg, #1e40af 0%, #4338ca 50%, #6d28d9 100%)" }}>
        <div className="absolute -right-12 -top-12 w-44 h-44 bg-gray-900 opacity-5 rounded-full" />
        <div className="absolute right-4 top-8 w-20 h-20 bg-gray-900 opacity-5 rounded-full" />
        <div className="absolute left-24 -bottom-10 w-32 h-32 bg-gray-900 opacity-5 rounded-full" />
        <div className="p-5 relative">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-gray-900/15 rounded-full px-3 py-1 mb-2.5 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-white text-xs font-semibold">Good Morning 👋</span>
              </div>
              <h2 className="text-xl font-black text-white leading-tight">Ready to crack<br />today's exam? 🎯</h2>
              <p className="text-blue-200 text-xs mt-2">3 pending quizzes • 2 new flashcard sets</p>
            </div>
            <div className="text-center bg-gray-900/15 rounded-2xl px-3.5 py-2.5 backdrop-blur-sm border border-white/10">
              <div className="flex items-center gap-1 text-amber-300 justify-center">
                <Icon name="fire" size={16} />
                <span className="text-2xl font-black text-white">{streak}</span>
              </div>
              <p className="text-blue-200 text-[10px] font-bold">DAY STREAK</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            {days.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${completed[i]
                  ? "bg-gray-900 text-blue-700 shadow-md"
                  : "bg-gray-900/15 text-blue-200 border border-white/20"}`}>
                  {completed[i] ? <Icon name="check" size={13} /> : d}
                </div>
                <span className="text-[10px] text-blue-300 font-semibold">{d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {GOV_EXAMS.map((tag) => (
          <span key={tag} className="flex-shrink-0 text-xs font-bold text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1.5 whitespace-nowrap">
            {tag}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Quizzes Done" value={statsLoading ? "..." : stats.quizzes} sub={stats.quizzes > 0 ? "Real data ✓" : "No quiz yet"} icon="quiz" color="blue" trend="up" />
        <StatCard label="Accuracy" value={statsLoading ? "..." : `${stats.accuracy}%`} sub={stats.accuracy > 70 ? "↑ Great!" : "Keep going!"} icon="target" color="green" trend="up" />
        <StatCard label="Flashcards" value={statsLoading ? "..." : stats.flashcards} sub="Study streak" icon="cards" color="purple" />
        <StatCard label="Your Rank" value={statsLoading ? "..." : stats.rank} sub="Leaderboard" icon="trophy" color="amber" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-gray-100">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Generate Quiz", sub: "From PDF or Photo", icon: "spark", tab: "quiz", bg: "bg-blue-50", icon_color: "text-blue-600" },
            { label: "Ask AI Doubt", sub: "Instant answers", icon: "brain", tab: "doubt", bg: "bg-violet-50", icon_color: "text-violet-600" },
            { label: "Flashcards", sub: "Study & Review", icon: "cards", tab: "flashcards", bg: "bg-emerald-50", icon_color: "text-emerald-600" },
            { label: "Today's News", sub: "Current Affairs", icon: "newspaper", tab: "current", bg: "bg-amber-50", icon_color: "text-amber-600" },
          ].map((a) => (
            <button key={a.tab} onClick={() => setActiveTab(a.tab)}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-gray-900/50 shadow-sm hover:shadow-md hover:border-blue-200 active:scale-95 transition-all text-left group">
              <div className={`w-9 h-9 rounded-xl ${a.bg} ${a.icon_color} flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform`}>
                <Icon name={a.icon} size={18} />
              </div>
              <p className="text-sm font-bold text-gray-100">{a.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{a.sub}</p>
            </button>
          ))}
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-black text-gray-100">Today's Targets</h3>
            <p className="text-xs text-gray-500 mt-0.5">{todos.filter(t => t.done).length}/{todos.length} done · {donePct}% complete</p>
          </div>
          <button className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
            <Icon name="plus" size={15} />
          </button>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full mb-4 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
            style={{ width: `${donePct}%` }} />
        </div>
        <div className="space-y-2.5">
          {todos.map((t, i) => (
            <button key={i} onClick={() => toggleTodo(i)} className="w-full flex items-center gap-3 group text-left">
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${t.done
                ? "bg-emerald-500 border-emerald-500 text-white"
                : "border-gray-600 group-hover:border-blue-400"}`}>
                {t.done && <Icon name="check" size={11} />}
              </div>
              <span className={`text-sm transition-colors ${t.done ? "line-through text-gray-500" : "text-gray-200"}`}>{t.task}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-gray-100">Weakness Analytics</h3>
          <button className="text-xs font-semibold text-blue-600">View All</button>
        </div>
        <div className="space-y-3.5">
          {[
            { subject: "Modern History", pct: 45, color: "bg-red-400", tag: "red", label: "Needs Work" },
            { subject: "Geography – Maps", pct: 58, color: "bg-amber-400", tag: "amber", label: "Average" },
            { subject: "Economics Basics", pct: 63, color: "bg-amber-300", tag: "amber", label: "Average" },
            { subject: "Science & Tech", pct: 81, color: "bg-emerald-400", tag: "green", label: "Good" },
          ].map((s) => (
            <div key={s.subject}>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-gray-200">{s.subject}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 font-semibold">{s.pct}%</span>
                  <Badge color={s.tag}>{s.label}</Badge>
                </div>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${s.color} transition-all duration-700`} style={{ width: `${s.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-gray-100">Exam Countdown ⏳</h3>
          <button className="text-xs font-semibold text-blue-600">+ Add</button>
        </div>
        <div className="space-y-1">
          {exams.map((e) => (
            <div key={e.exam} className={`flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0 ${e.urgent ? "bg-red-50/50 -mx-4 px-4 rounded-xl" : ""}`}>
              <span className="text-lg">{e.icon}</span>
              <div className="flex-1">
                <p className={`text-sm font-bold ${e.urgent ? "text-red-700" : "text-gray-100"}`}>{e.exam}</p>
                <p className="text-xs text-gray-500">{e.dateStr}</p>
              </div>
              <div className={`text-center px-3 py-1.5 rounded-xl border ${e.urgent ? "bg-red-100 border-red-200" : e.days < 50 ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"}`}>
                <p className={`text-lg font-black ${e.urgent ? "text-red-600" : e.days < 50 ? "text-amber-600" : "text-emerald-600"}`}>{e.days}</p>
                <p className="text-[10px] text-gray-500 font-bold">DAYS</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ─── QUIZ ─────────────────────────────────────────────────────────────────────
const BookmarkButton = ({ question, answer, topic }) => {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBookmark = async () => {
    if (saved || loading) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { alert("Login karo pehla!"); return; }
      await supabase.from('bookmarks').insert({
        user_id: user.id,
        question,
        correct_answer: answer,
        topic: topic || 'General',
        created_at: new Date().toISOString(),
      });
      setSaved(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleBookmark}
      className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg transition-all ${saved
        ? "text-amber-400 bg-amber-900/30 border border-amber-700/50"
        : "text-gray-500 bg-gray-900 border border-gray-700 hover:text-amber-400 hover:border-amber-700/50"}`}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
      </svg>
      {loading ? "..." : saved ? "Saved!" : "Save"}
    </button>
  );
};

const QuizTab = () => {
  const [phase, setPhase] = useState("home");
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [negativeMode, setNegativeMode] = useState(false);
  const [subject, setSubject] = useState("All");
  const [timeLeft, setTimeLeft] = useState(null);
  const [quizDuration, setQuizDuration] = useState(360);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  const [uploadStatus, setUploadStatus] = useState("idle");
  const [uploadFileName, setUploadFileName] = useState("");

  const DEFAULT_QUESTIONS = [
    { q: "ગુજરાતનું રાજ્ય પક્ષી કયું છે?", opts: ["મોર", "પોપટ", "ફ્લેમિંગો (સુરખાબ)", "કબૂતર"], ans: 2, topic: "GK", exp: "ગુજરાતનું રાજ્ય પક્ષી સુરખાબ (ગ્રેટર ફ્લેમિંગો) છે." },
    { q: "ભારતનું બંધારણ ક્યારે અમલમાં આવ્યું?", opts: ["૧૯૪૭", "૧૯૫૦", "૧૯૫૨", "૧૯૫૬"], ans: 1, topic: "Polity", exp: "ભારતનું બંધારણ ૨૬ જાન્યુઆરી ૧૯૫૦ ના રોજ અમલમાં આવ્યું." },
    { q: "ગુજરાતની સ્થાપના ક્યારે થઈ?", opts: ["૧ મે ૧૯૬૦", "૧ મે ૧૯૫૮", "૧ જૂન ૧૯૬૦", "૧ જૂન ૧૯૬૨"], ans: 0, topic: "History", exp: "ગુજરાત ૧ મે ૧૯૬૦ ના રોજ અલગ રાજ્ય બન્યું." },
    { q: "વિદ્યુત પ્રવાહનો SI એકમ કયો છે?", opts: ["વૉલ્ટ", "વૉટ", "એમ્પિયર", "ઓહ્મ"], ans: 2, topic: "Science", exp: "એમ્પિયર (A) વિદ્યુત પ્રવાહનો SI એકમ છે." },
    { q: "ભારતના પ્રથમ ગવર્નર જનરલ કોણ હતા?", opts: ["લૉર્ડ માઉન્ટબેટન", "સી. રાજગોપાલાચારી", "રાજેન્દ્ર પ્રસાદ", "સરદાર પટેલ"], ans: 1, topic: "History", exp: "ભારતના પ્રથમ ભારતીય ગવર્નર જનરલ ચક્રવર્તી રાજગોપાલાચારી હતા." },
  ];

  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);

  // ─── File upload handler ───────────────────────────────────────
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      setUploadStatus("error");
      setUploadFileName("ફક્ત PDF, JPG, PNG ફાઈલ upload કરો");
      return;
    }

    setUploadStatus("loading");
    setUploadFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.questions && data.questions.length > 0) {
        const converted = data.questions.map((q) => {
          const optKeys = ['a', 'b', 'c', 'd'];
          const opts = optKeys.map(k => q[k] || '');
          const ans = optKeys.indexOf(q.correct_option);
          return {
            q: q.question,
            opts,
            ans: ans === -1 ? 0 : ans,
            topic: "AI Generated",
            // ✅ FIX 3: exp kabhi empty nahi rahega
            exp: q.explanation && q.explanation.trim().length > 0
              ? q.explanation.trim()
              : "આ પ્રશ્નનો સાચો જવાબ ઉપર દર્શાવેલ option છે.",
          };
        });

        setUploadStatus("done");

        // ✅ FIX 2: Race condition fix — converted directly pass karo startQuiz ma
        // setQuestions nahi, balke startQuiz ne customQuestions pass karo
        setTimeout(() => startQuiz(15, converted), 1000);
      } else {
        setUploadStatus("error");
        setUploadFileName("Questions generate ના થયા, ફરી try કરો");
      }
    } catch (err) {
      console.error('Upload error:', err);
      setUploadStatus("error");
      setUploadFileName("Upload failed. Internet check કરો.");
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    if (phase === "quiz") {
      clearInterval(timerRef.current);
      setTimeLeft(quizDuration);
    }
    return () => clearInterval(timerRef.current);
  }, [phase, quizDuration]);

  useEffect(() => {
    if (phase === "quiz" && timeLeft !== null) {
      if (timeLeft <= 0) {
        clearInterval(timerRef.current);
        setPhase("result");
        return;
      }
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); setPhase("result"); return 0; }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [phase, timeLeft !== null]);

  const q = questions[current];
  const score = answers.filter((a, i) => a === questions[i]?.ans).length;
  const wrong = answers.filter((a, i) => a !== questions[i]?.ans && a !== null).length;
  const finalScore = negativeMode ? score - wrong * 0.25 : score;
  const pct = Math.round((finalScore / questions.length) * 100);

  const handleAnswer = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    setTimeout(() => {
      const newAns = [...answers, idx];
      setAnswers(newAns);
      if (current + 1 < questions.length) { setCurrent(current + 1); setSelected(null); }
      else { clearInterval(timerRef.current); setPhase("result"); }
    }, 800);
  };

  const resetQuiz = () => {
    clearInterval(timerRef.current);
    setPhase("home");
    setCurrent(0);
    setAnswers([]);
    setSelected(null);
    setTimeLeft(null);
    setUploadStatus("idle");
    setUploadFileName("");
    // Reset to default questions when going back home
    setQuestions(DEFAULT_QUESTIONS);
  };

  // ✅ FIX 2: startQuiz now accepts optional customQuestions param
  // This COMPLETELY solves the race condition — no dependency on state update timing
  const startQuiz = (mins, customQuestions = null) => {
    const dur = mins * 60;
    setQuizDuration(dur);
    setTimeLeft(dur);
    setCurrent(0);
    setAnswers([]);
    setSelected(null);
    // ✅ KEY: If customQuestions provided, set them BEFORE phase change
    // React batches these together in the same render cycle
    if (customQuestions && customQuestions.length > 0) {
      setQuestions(customQuestions);
    }
    setPhase("quiz");
  };

  const fmtTime = (s) => {
    if (s === null) return "00:00";
    return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  };

  if (phase === "home") return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-black text-gray-50">AI Quiz Generator</h2>
        <p className="text-sm text-gray-500 mt-0.5">Upload material or pick a preset quiz</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileUpload}
      />

      <div
        onClick={() => uploadStatus !== "loading" && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer group
          ${uploadStatus === "loading" ? "border-amber-300 bg-amber-50/20 cursor-wait" : ""}
          ${uploadStatus === "done"    ? "border-emerald-300 bg-emerald-50/20" : ""}
          ${uploadStatus === "error"   ? "border-red-300 bg-red-50/20" : ""}
          ${uploadStatus === "idle"    ? "border-blue-200 hover:border-blue-400 hover:bg-blue-50/30 bg-gradient-to-br from-slate-50 to-blue-50/20" : ""}
        `}
      >
        {uploadStatus === "loading" ? (
          <>
            <div className="flex justify-center mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center animate-spin">
                <Icon name="rotate" size={20} className="text-amber-500" />
              </div>
            </div>
            <p className="text-sm font-bold text-amber-600 mb-1">AI questions બનાવી રહ્યો છે...</p>
            <p className="text-xs text-gray-500 truncate">{uploadFileName}</p>
          </>
        ) : uploadStatus === "done" ? (
          <>
            <div className="flex justify-center mb-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Icon name="check" size={20} className="text-emerald-500" />
              </div>
            </div>
            <p className="text-sm font-bold text-emerald-600 mb-1">Questions ready! Quiz starting...</p>
            <p className="text-xs text-gray-500 truncate">{uploadFileName}</p>
          </>
        ) : uploadStatus === "error" ? (
          <>
            <div className="flex justify-center mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Icon name="x" size={20} className="text-red-500" />
              </div>
            </div>
            <p className="text-sm font-bold text-red-500 mb-1">Error — ફરી try કરો</p>
            <p className="text-xs text-gray-500">{uploadFileName}</p>
          </>
        ) : (
          <>
            <div className="flex justify-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                <Icon name="upload" size={20} />
              </div>
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform" style={{ transitionDelay: "50ms" }}>
                <Icon name="camera" size={20} />
              </div>
            </div>
            <p className="text-sm font-bold text-gray-200 mb-1">Upload PDF or Photo</p>
            <p className="text-xs text-gray-500">PDF અથવા Photo upload કરો → AI instant questions બનાવશે</p>
          </>
        )}
      </div>

      <SubjectPills active={subject} onChange={setSubject} />

      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
            <Icon name="lightning" size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-200">Negative Marking</p>
            <p className="text-xs text-gray-500">–0.25 per wrong answer</p>
          </div>
        </div>
        <button onClick={() => setNegativeMode(!negativeMode)}
          className={`w-12 h-6 rounded-full transition-all duration-300 relative ${negativeMode ? "bg-red-500 shadow-md" : "bg-gray-700"}`}>
          <span className={`absolute top-0.5 w-5 h-5 bg-gray-900 rounded-full shadow transition-all duration-300 ${negativeMode ? "left-6" : "left-0.5"}`} />
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-gray-100">Preset Quizzes</h3>
          <button className="text-xs font-semibold text-blue-600">View All</button>
        </div>
        <div className="space-y-2.5">
          {[
            { title: "UPSC Prelims Mock – Set 1", q: 5, mins: 6, topic: "Mixed", badge: "🔥 Popular", bColor: "orange" },
            { title: "SSC CGL Reasoning Practice", q: 20, mins: 15, topic: "Reasoning", badge: null },
            { title: "History Topicwise – Ancient India", q: 15, mins: 12, topic: "History", badge: "✨ New", bColor: "green" },
          ].map((qz, i) => (
            // Preset quizzes use default questions — no customQuestions passed
            <Card key={i} onClick={() => startQuiz(qz.mins)}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                  <Icon name="quiz" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-100 truncate mb-0.5">{qz.title}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500">{qz.q} Qs · {qz.mins} min · {qz.topic}</p>
                    {qz.badge && <Badge color={qz.bColor || "blue"}>{qz.badge}</Badge>}
                  </div>
                </div>
                <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                  <Icon name="spark" size={14} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  // ─── RESULT PHASE ──────────────────────────────────────────────
  if (phase === "result") {
    const grade = pct >= 80
      ? { label: "Excellent! 🏆", color: "text-emerald-600", bg: "from-emerald-50 to-green-50", border: "border-emerald-200", ring: "#10b981" }
      : pct >= 60
        ? { label: "Good Job! 👍", color: "text-blue-600", bg: "from-blue-50 to-indigo-50", border: "border-blue-200", ring: "#3b82f6" }
        : { label: "Keep Trying! 💪", color: "text-amber-600", bg: "from-amber-50 to-orange-50", border: "border-amber-200", ring: "#f59e0b" };
    return (
      <div className="space-y-5">
        <Card className={`text-center py-7 bg-gradient-to-br ${grade.bg} ${grade.border}`}>
          <div className="relative w-24 h-24 mx-auto mb-4">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="2.5" />
              <circle cx="18" cy="18" r="14" fill="none" stroke={grade.ring} strokeWidth="2.5"
                strokeDasharray={`${(pct / 100) * 87.96} 87.96`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-xl font-black ${grade.color}`}>{pct}%</span>
            </div>
          </div>
          <h2 className={`text-lg font-black mb-1 ${grade.color}`}>{grade.label}</h2>
          <p className="text-sm text-gray-400">Final Score: {finalScore.toFixed(1)} / {questions.length}</p>
          <div className="flex justify-center gap-8 mt-5 pt-4 border-t border-white/50">
            <div><p className="text-xl font-black text-emerald-600">{score}</p><p className="text-xs text-gray-500 font-semibold">Correct</p></div>
            <div><p className="text-xl font-black text-red-500">{wrong}</p><p className="text-xs text-gray-500 font-semibold">Wrong</p></div>
            <div><p className="text-xl font-black text-gray-500">{questions.length - score - wrong}</p><p className="text-xs text-gray-500 font-semibold">Skipped</p></div>
          </div>
          {negativeMode && <p className="text-xs text-amber-700 mt-3 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 font-semibold mx-4">⚡ Negative marking: –{(wrong * 0.25).toFixed(2)} pts deducted</p>}
        </Card>

        {/* ─── Question Review with FIX 3 ──────────────────────── */}
        <div>
          <h3 className="text-sm font-black text-gray-200 mb-3">📋 Question Review</h3>
          <div className="space-y-3">
            {questions.map((qq, i) => {
              const userAns = answers[i];
              const correct = userAns === qq.ans;
              return (
                <Card key={i} className={`border-l-4 ${correct ? "border-l-emerald-400 bg-emerald-50/30" : "border-l-red-400 bg-red-50/30"}`}>
                  <div className="flex items-start gap-2.5 mb-2">
                    <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${correct ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
                      <Icon name={correct ? "check" : "x"} size={11} />
                    </div>
                    <p className="text-sm font-semibold text-gray-100 leading-snug">{qq.q}</p>
                  </div>
                  <div className="ml-7 space-y-1.5">
                    {/* Correct answer — always show */}
                    <p className="text-xs text-emerald-700 font-semibold bg-emerald-50 rounded-lg px-2 py-1">
                      ✓ Correct: {qq.opts[qq.ans]}
                    </p>
                    {/* User's wrong answer */}
                    {!correct && userAns != null && (
                      <p className="text-xs text-red-600 font-semibold bg-red-50 rounded-lg px-2 py-1">
                        ✗ Your answer: {qq.opts[userAns]}
                      </p>
                    )}
                    {/* Explanation */}
                    <p className="text-xs text-gray-400 bg-gray-950 rounded-lg px-2 py-1.5 leading-relaxed">
                      💡 {qq.exp && qq.exp.trim().length > 0
                        ? qq.exp
                        : "આ પ્રશ્નનો સાચો જવાબ ઉપર દર્શાવેલ option છે."}
                    </p>
                    {/* Bookmark button */}
                    <BookmarkButton question={qq.q} answer={qq.opts[qq.ans]} topic={qq.topic} />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <button onClick={resetQuiz}
          className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-sm font-bold hover:shadow-lg hover:shadow-blue-600/25 active:scale-95 transition-all">
          ← Back to Quizzes
        </button>
      </div>
    );
  }

  // ─── QUIZ PHASE ────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5 items-center flex-1">
          {questions.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i < current ? "bg-blue-500" : i === current ? "bg-blue-400" : "bg-gray-700"}`}
              style={{ width: i === current ? 32 : 18 }} />
          ))}
          <span className="text-xs text-gray-500 font-bold ml-1">{current + 1}/{questions.length}</span>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-sm ml-3 ${timeLeft !== null && timeLeft < 60 ? "bg-red-50 text-red-600 border border-red-200 animate-pulse" : "bg-gray-800 text-gray-300"}`}>
          ⏱ {fmtTime(timeLeft)}
        </div>
      </div>
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Badge color="gray">{q.topic}</Badge>
          <span className="text-xs text-gray-500 font-semibold">Question {current + 1}</span>
        </div>
        <p className="text-base font-bold text-gray-50 leading-relaxed mb-5">{q.q}</p>
        <div className="space-y-2.5">
          {q.opts.map((opt, i) => {
            let cls = "border-gray-700 text-gray-200 hover:border-blue-400 hover:bg-blue-50/50";
            if (selected !== null) {
              if (i === q.ans) cls = "border-emerald-400 bg-emerald-50 text-emerald-800";
              else if (i === selected && selected !== q.ans) cls = "border-red-400 bg-red-50 text-red-800";
              else cls = "border-gray-800 text-gray-500 opacity-50";
            }
            return (
              <button key={i} onClick={() => handleAnswer(i)}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 flex items-center justify-between ${cls}`}>
                <span><span className="font-black text-xs mr-2">{["A", "B", "C", "D"][i]}.</span>{opt}</span>
                {selected !== null && i === q.ans && <Icon name="check" size={16} className="text-emerald-600 flex-shrink-0" />}
                {selected !== null && i === selected && selected !== q.ans && <Icon name="x" size={16} className="text-red-500 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </Card>
      {negativeMode && (
        <div className="flex items-center justify-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl py-2 font-semibold">
          <Icon name="lightning" size={13} /> Negative marking active · –0.25 per wrong
        </div>
      )}
    </div>
  );
};

// ─── DOUBT SOLVER ─────────────────────────────────────────────────────────────
const DoubtTab = () => {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hello! I'm your AI Doubt Solver 🤖\n\nAsk me anything about UPSC, SSC, IBPS, or any competitive exam topic. I explain concepts clearly and give exam tips!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, text: m.text }));
      const res = await fetch("/api/doubt-solver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMsg, history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `API error: ${res.status}`);
      const text = data.answer || "Sorry, I could not get a response.";
      setMessages(prev => [...prev, { role: "ai", text }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "ai", text: `❌ ${err.message}` }]);
    }
    setLoading(false);
  };

  const suggestions = ["Explain Article 370", "UPSC vs IAS difference?", "GDP vs GNP", "What is Preamble?", "Who wrote Indian Constitution?"];

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[500px]">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-800">
        <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
          <Icon name="brain" size={18} />
        </div>
        <div>
          <p className="text-sm font-black text-gray-100">AI Doubt Solver</p>
          <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block" /> Online & Ready</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pb-4" style={{ scrollbarWidth: "none" }}>
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "ai" && (
              <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                <Icon name="brain" size={13} />
              </div>
            )}
            <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-gray-900/50 shadow-sm ${m.role === "user"
              ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm"
              : "bg-gray-900 border border-gray-800 text-gray-100 rounded-bl-sm"}`}>
              {m.text.split("\n").map((line, li) => <p key={li} className={li > 0 && line ? "mt-1" : ""}>{line}</p>)}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
              <Icon name="brain" size={13} />
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 shadow-gray-900/50 shadow-sm">
              <div className="flex gap-1.5 items-center">
                <span className="text-xs text-gray-500 font-medium mr-1">Thinking</span>
                {[0, 150, 300].map(d => (
                  <span key={d} className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="pt-3 border-t border-gray-800">
        <div className="flex gap-2">
          <button className="p-2.5 border border-gray-700 rounded-xl text-gray-500 hover:text-blue-500 hover:border-blue-300 transition-colors flex-shrink-0">
            <Icon name="camera" size={18} />
          </button>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Ask your doubt..."
            className="flex-1 px-4 py-2.5 border border-gray-700 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-800 bg-gray-800 text-gray-100 placeholder-gray-500 transition-all" />
          <button onClick={send} disabled={loading}
            className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-600/25 disabled:opacity-50 transition-all flex-shrink-0">
            <Icon name="send" size={18} />
          </button>
        </div>
        <div className="flex gap-2 mt-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {suggestions.map(s => (
            <button key={s} onClick={() => setInput(s)}
              className="flex-shrink-0 px-3 py-1.5 bg-violet-50 text-violet-700 text-xs font-semibold rounded-full hover:bg-violet-100 transition-colors border border-violet-100">
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── FLASHCARDS ───────────────────────────────────────────────────────────────
const FlashcardsTab = () => {
  const [flipped, setFlipped] = useState(false);
  const [index, setIndex] = useState(0);
  const [known, setKnown] = useState(new Set());
  const [review, setReview] = useState(new Set());
  const [subject, setSubject] = useState("All");

  const cards = [
    { front: "What is Panchayati Raj?", back: "A system of rural local self-government in India. Introduced by 73rd Constitutional Amendment Act, 1992.", topic: "Polity" },
    { front: "What is the Doctrine of Lapse?", back: "Policy by Lord Dalhousie (1848) allowing the British to annex any princely state if the ruler died without a natural heir.", topic: "History" },
    { front: "What is the Chandrayaan-3 landing site called?", back: "Shiv Shakti Point – India's successful soft landing on Moon's south pole on Aug 23, 2023.", topic: "Science" },
    { front: "Define GDP", back: "Gross Domestic Product – total monetary value of all goods and services produced within a country in a specific time period.", topic: "Economics" },
    { front: "What are the Fundamental Duties?", back: "Added by 42nd Amendment (1976) under Article 51A. Originally 10 duties, 11th added by 86th Amendment (2002). Listed in Part IV-A.", topic: "Polity" },
  ];

  const card = cards[index];

  const next = (action) => {
    if (action === "known") {
      setKnown(prev => new Set([...prev, index]));
      setReview(prev => { const s = new Set(prev); s.delete(index); return s; });
    } else {
      setReview(prev => new Set([...prev, index]));
      setKnown(prev => { const s = new Set(prev); s.delete(index); return s; });
    }
    setFlipped(false);
    setTimeout(() => { setIndex(i => (i + 1 < cards.length ? i + 1 : 0)); }, 250);
  };

  const donePct = (index / cards.length) * 100;
  const remaining = Math.max(0, cards.length - known.size - review.size);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-gray-50">Flashcards</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {index + 1} of {cards.length} ·{" "}
            <span className="text-emerald-600 font-bold">{known.size} known</span> ·{" "}
            <span className="text-red-500 font-bold">{review.size} to review</span>
          </p>
        </div>
        <button className="w-9 h-9 border border-gray-700 rounded-xl flex items-center justify-center text-gray-500 hover:text-blue-500 hover:border-blue-300 transition-colors">
          <Icon name="upload" size={17} />
        </button>
      </div>

      <SubjectPills active={subject} onChange={setSubject} />

      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${donePct}%` }} />
      </div>

      <div style={{ perspective: "1000px" }}>
        <div onClick={() => setFlipped(!flipped)} className="cursor-pointer relative transition-all duration-500"
          style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)", minHeight: 230 }}>
          <div className="absolute inset-0 bg-gray-900 border border-gray-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-gray-900/50 shadow-sm"
            style={{ backfaceVisibility: "hidden" }}>
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 mb-3">
              <Icon name="cards" size={20} />
            </div>
            <Badge color="gray">{card.topic}</Badge>
            <p className="text-lg font-bold text-gray-50 mt-3 leading-relaxed">{card.front}</p>
            <p className="text-xs text-gray-500 mt-4 flex items-center gap-1">
              <Icon name="rotate" size={12} /> Tap to reveal answer
            </p>
          </div>
          <div className="absolute inset-0 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-lg"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: "linear-gradient(135deg, #1e40af, #4338ca, #6d28d9)" }}>
            <div className="w-10 h-10 bg-gray-900/20 rounded-xl flex items-center justify-center text-white mb-3">
              <Icon name="check" size={20} />
            </div>
            <p className="text-white text-sm font-semibold leading-relaxed">{card.back}</p>
            <p className="text-blue-200 text-xs mt-3">Tap again to flip back</p>
          </div>
        </div>
      </div>

      {flipped && (
        <div className="flex gap-3">
          <button onClick={() => next("review")}
            className="flex-1 py-3 border-2 border-red-300 text-red-600 bg-red-50 rounded-2xl text-sm font-bold hover:bg-red-100 active:scale-95 transition-all flex items-center justify-center gap-2">
            <Icon name="rotate" size={16} /> Review Again
          </button>
          <button onClick={() => next("known")}
            className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl text-sm font-bold hover:shadow-lg hover:shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2">
            <Icon name="check" size={16} /> Got It! ✓
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Remaining", value: remaining, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Known", value: known.size, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Review", value: review.size, color: "text-red-500", bg: "bg-red-50" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-3 text-center border border-white`}>
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 font-semibold">{s.label}</p>
          </div>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-100">Personal Notes</h3>
          <button className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:text-blue-700">
            <Icon name="download" size={13} /> Export
          </button>
        </div>
        <textarea rows={3} placeholder="Add your notes for this card..."
          className="w-full text-sm border border-gray-700 rounded-xl px-3 py-2 text-gray-200 bg-gray-800 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-800 resize-none transition-all" />
        <div className="flex gap-3 mt-2">
          <button className="text-xs text-gray-500 font-semibold flex items-center gap-1 hover:text-blue-500 transition-colors">
            <Icon name="bookmark" size={13} /> Bookmark
          </button>
          <button className="text-xs text-gray-500 font-semibold flex items-center gap-1 hover:text-blue-500 transition-colors">
            <Icon name="share" size={13} /> Share
          </button>
        </div>
      </Card>
    </div>
  );
};

// ─── CURRENT AFFAIRS ──────────────────────────────────────────────────────────
const CurrentTab = () => {
  const [lang, setLang] = useState("English");
  const [category, setCategory] = useState("All");
  const [mcqSelected, setMcqSelected] = useState(null);
  const [mcqResetKey, setMcqResetKey] = useState(0);

  const news = [
    { title: "India's GDP grows at 8.2% in Q4 FY24, fastest among G20 nations", category: "Economy", time: "2h ago", important: true },
    { title: "PM Modi launches PM-SHRI Yojana for 14,500 schools across India", category: "Education", time: "4h ago", important: false },
    { title: "India successfully tests Agni-V MIRV ballistic missile", category: "Defence", time: "6h ago", important: true },
    { title: "Supreme Court upholds electoral bond scheme amendments", category: "Polity", time: "8h ago", important: false },
    { title: "ISRO's Aditya-L1 captures solar flare data for first time", category: "Science", time: "1d ago", important: true },
    { title: "India joins Global Biofuel Alliance at G20 summit", category: "Environment", time: "1d ago", important: false },
  ];

  const cats = ["All", "Economy", "Polity", "Defence", "Science", "Environment", "Education"];
  const filtered = category === "All" ? news : news.filter(n => n.category === category);

  const handleMcqSelect = (i) => { if (mcqSelected === null) setMcqSelected(i); };
  const resetMcq = () => { setMcqSelected(null); setMcqResetKey(k => k + 1); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-gray-50">Current Affairs</h2>
          <p className="text-xs text-gray-500">June 12, 2026 • Daily Update</p>
        </div>
        <div className="flex gap-0.5 bg-gray-800 rounded-xl p-1">
          {["En", "Hi", "Gu"].map((l, i) => (
            <button key={l} onClick={() => setLang(["English", "Hindi", "Gujarati"][i])}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${lang === ["English", "Hindi", "Gujarati"][i] ? "bg-gray-900 text-gray-50 shadow-gray-900/50 shadow-sm" : "text-gray-400"}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {cats.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${category === c
              ? "bg-blue-600 text-white border-blue-600 shadow-gray-900/50 shadow-sm"
              : "bg-gray-900 text-gray-300 border-gray-700 hover:border-blue-300"}`}>
            {c}
          </button>
        ))}
      </div>

      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50" key={mcqResetKey}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
              <Icon name="star" size={14} />
            </div>
            <span className="text-xs font-black text-blue-700 uppercase tracking-wide">MCQ of the Day ⭐</span>
          </div>
          {mcqSelected !== null && (
            <button onClick={resetMcq} className="text-xs text-blue-600 font-bold hover:underline">Try Again</button>
          )}
        </div>
        <p className="text-sm font-bold text-gray-100 mb-3">India's GDP growth rate in Q4 FY24 was closest to:</p>
        {["6.8%", "7.6%", "8.2%", "9.1%"].map((opt, i) => {
          const correctIdx = 2;
          let cls = "border-gray-700 bg-gray-900 text-gray-200 hover:border-blue-400 hover:bg-blue-50";
          if (mcqSelected !== null) {
            if (i === correctIdx) cls = "border-emerald-400 bg-emerald-50 text-emerald-800";
            else if (i === mcqSelected) cls = "border-red-400 bg-red-50 text-red-700";
            else cls = "border-gray-800 bg-gray-900 text-gray-500 opacity-60";
          }
          return (
            <button key={i} onClick={() => handleMcqSelect(i)}
              className={`w-full text-left text-sm font-semibold px-3 py-2.5 rounded-xl border mb-2 transition-all ${cls}`}>
              {["A", "B", "C", "D"][i]}. {opt}
              {mcqSelected !== null && i === correctIdx && " ✓"}
            </button>
          );
        })}
        {mcqSelected !== null && (
          <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 font-semibold">
            💡 India's GDP grew at 8.2% in Q4 FY24, making it the fastest growing G20 economy!
          </p>
        )}
      </Card>

      <div className="space-y-3">
        {filtered.map((n, i) => (
          <Card key={i}>
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${n.important ? "bg-red-500" : "bg-slate-300"}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <Badge color={n.important ? "red" : "gray"}>{n.category}</Badge>
                  {n.important && <Badge color="amber">⭐ Exam Important</Badge>}
                </div>
                <p className="text-sm font-semibold text-gray-100 leading-snug">{n.title}</p>
                <p className="text-xs text-gray-500 mt-1.5 font-medium">{n.time}</p>
              </div>
              <button className="text-gray-600 hover:text-blue-500 flex-shrink-0 mt-0.5 transition-colors">
                <Icon name="bookmark" size={16} />
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50 border-blue-100">
        <div>
          <p className="text-sm font-bold text-gray-100">Download Monthly Digest</p>
          <p className="text-xs text-gray-500">June 2026 · PDF · Free</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-blue-600/25 active:scale-95 transition-all">
          <Icon name="download" size={14} /> PDF
        </button>
      </Card>
    </div>
  );
};

// ─── LEADERBOARD ──────────────────────────────────────────────────────────────
const LeaderboardTab = () => {
  const [period, setPeriod] = useState("weekly");
  const [userStats, setUserStats] = useState({ quizzes: 0, streak: 0, score: 0 });
  const [bookmarks, setBookmarks] = useState([]);
  const [activeView, setActiveView] = useState("leaderboard");

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: history } = await supabase
        .from('quiz_history').select('score, total, created_at')
        .eq('user_id', user.id).order('created_at', { ascending: false });
      if (history && history.length > 0) {
        const totalScore = history.reduce((a, b) => a + b.score, 0);
        let streak = 0;
        const today = new Date();
        const uniqueDates = [...new Set(history.map(h => new Date(h.created_at).toDateString()))];
        for (let i = 0; i < 30; i++) {
          const d = new Date(today); d.setDate(today.getDate() - i);
          if (uniqueDates.includes(d.toDateString())) streak++;
          else if (i > 0) break;
        }
        setUserStats({ quizzes: history.length, streak, score: totalScore * 10 });
      }
      const { data: bm } = await supabase.from('bookmarks').select('*')
        .eq('user_id', user.id).order('created_at', { ascending: false });
      if (bm) setBookmarks(bm);
    };
    init();
  }, []);

  const removeBookmark = async (id) => {
    await supabase.from('bookmarks').delete().eq('id', id);
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  const allBadges = [
    { icon: "🎯", label: "First Quiz", earned: (s) => s.quizzes >= 1, req: "1 quiz karo" },
    { icon: "🔥", label: "3-Day Streak", earned: (s) => s.streak >= 3, req: "3 din streak" },
    { icon: "🧠", label: "Quiz Master", earned: (s) => s.quizzes >= 10, req: "10 quizzes" },
    { icon: "⚡", label: "Speed Runner", earned: (s) => s.quizzes >= 5, req: "5 quizzes" },
    { icon: "🔥", label: "7-Day Streak", earned: (s) => s.streak >= 7, req: "7 din streak" },
    { icon: "📰", label: "News Ninja", earned: (s) => s.quizzes >= 3, req: "3 quizzes" },
    { icon: "🏆", label: "Top Scorer", earned: (s) => s.score >= 500, req: "High score" },
    { icon: "💎", label: "Diamond", earned: (s) => s.streak >= 30, req: "30 din streak" },
  ];

  const users = [
    { name: "Arjun Sharma", score: 2840, streak: 21, avatar: "AS", rank: 1 },
    { name: "Priya Patel", score: 2650, streak: 15, avatar: "PP", rank: 2 },
    { name: "Rohit Kumar", score: 2410, streak: 12, avatar: "RK", rank: 3 },
    { name: "You", score: userStats.score || 1980, streak: userStats.streak || 7, avatar: "ME", rank: 24, isMe: true },
    { name: "Sneha Joshi", score: 1840, streak: 9, avatar: "SJ", rank: 25 },
  ];

  const medals = ["🥇", "🥈", "🥉"];
  const avatarGrad = [
    "from-blue-400 to-blue-600",
    "from-violet-400 to-purple-600",
    "from-amber-400 to-orange-500",
    "from-blue-600 to-indigo-700",
    "from-emerald-400 to-green-600",
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-black text-gray-50">Leaderboard 🏆</h2>
        <p className="text-xs text-gray-500">Compete with fellow aspirants</p>
      </div>

      <div className="flex gap-1 bg-gray-800 rounded-xl p-1">
        {[["daily", "Today"], ["weekly", "This Week"], ["monthly", "Month"]].map(([v, l]) => (
          <button key={v} onClick={() => setPeriod(v)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${period === v ? "bg-gray-900 text-gray-50 shadow-gray-900/50 shadow-sm" : "text-gray-400"}`}>
            {l}
          </button>
        ))}
      </div>

      <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/60 border border-amber-200 rounded-3xl p-5">
        <div className="flex items-end justify-center gap-4">
          {[users[1], users[0], users[2]].map((u, i) => {
            const heights = [72, 96, 58];
            const realRank = [2, 1, 3];
            return (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span className="text-xl">{medals[realRank[i] - 1]}</span>
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarGrad[realRank[i] - 1]} flex items-center justify-center text-white text-sm font-black shadow-md`}>
                  {u.avatar}
                </div>
                <p className="text-xs font-bold text-gray-200 text-center w-16 truncate">{u.name.split(" ")[0]}</p>
                <div className="w-14 bg-gradient-to-t from-amber-300 to-amber-200 rounded-t-xl flex items-end justify-center shadow-gray-900/50 shadow-sm"
                  style={{ height: heights[i] }}>
                  <span className="text-xs font-black text-amber-800 mb-1.5">#{realRank[i]}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        {users.map((u, i) => (
          <Card key={i} className={`flex items-center gap-3 py-3 ${u.isMe ? "border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md shadow-blue-100" : ""}`}>
            <span className={`text-sm font-black w-7 text-center ${u.isMe ? "text-blue-600" : "text-gray-500"}`}>#{u.rank}</span>
            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarGrad[i]} flex items-center justify-center text-white text-xs font-black shadow-gray-900/50 shadow-sm`}>
              {u.avatar}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-bold ${u.isMe ? "text-blue-700" : "text-gray-100"}`}>
                {u.name} {u.isMe && <Badge color="blue">You</Badge>}
              </p>
              <p className="text-xs text-gray-500 font-medium">
                {u.score.toLocaleString()} pts · 🔥 <span className="text-orange-500 font-bold">{u.streak}d</span>
              </p>
            </div>
            {i < 3 && <span className="text-xl">{medals[i]}</span>}
          </Card>
        ))}
      </div>

      {/* Badges Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-gray-100">🏅 Achievements</h3>
          <span className="text-xs text-gray-500">{allBadges.filter(b => b.earned(userStats)).length}/{allBadges.length} earned</span>
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          {allBadges.map((b, i) => {
            const isEarned = b.earned(userStats);
            return (
              <div key={i} className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl border text-center relative ${isEarned
                ? "border-amber-500/50 bg-gradient-to-br from-amber-900/40 to-orange-900/30 shadow-amber-900/20 shadow-sm"
                : "border-gray-800 bg-gray-900/50 opacity-50"}`}>
                <span className="text-2xl">{b.icon}</span>
                <p className="text-[9px] text-gray-300 font-bold leading-tight">{b.label}</p>
                {!isEarned && <p className="text-[8px] text-gray-600 mt-0.5">{b.req}</p>}
                {isEarned && <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                </div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bookmarks Section */}
      <div>
        <h3 className="text-sm font-black text-gray-100 mb-3">🔖 Saved Questions ({bookmarks.length})</h3>
        {bookmarks.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            <p className="text-3xl mb-2">🔖</p>
            <p className="text-sm font-bold text-gray-500">No saved questions yet</p>
            <p className="text-xs text-gray-600 mt-1">Quiz ma bookmark button tap karo</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {bookmarks.map((bm) => (
              <div key={bm.id} className="bg-gray-900 border border-gray-700 rounded-2xl p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-100 leading-snug flex-1">{bm.question}</p>
                  <button onClick={() => removeBookmark(bm.id)}
                    className="text-gray-600 hover:text-red-400 flex-shrink-0 mt-0.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-emerald-400 font-bold mt-2">✓ {bm.correct_answer}</p>
                {bm.topic && <span className="inline-block text-[10px] text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full mt-1">{bm.topic}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── MARKETPLACE / PREMIUM ────────────────────────────────────────────────────
const MarketplaceTab = () => {
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [user, setUser] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Check premium status
        const { data } = await supabase
          .from('user_premium')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .gt('expires_at', new Date().toISOString())
          .single();
        if (data) setIsPremium(true);
      }
    };
    init();
  }, []);

  const handlePayment = async () => {
    if (!user) { alert("Pehla login karo!"); return; }
    setLoading(true);
    try {
      // 1. Order create kariye
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan }),
      });
      const { orderId, amount, currency } = await res.json();

      // 2. Razorpay checkout open kariye
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "ExamBuddy Premium",
        description: selectedPlan === "yearly" ? "1 Year Premium Access" : "1 Month Premium Access",
        order_id: orderId,
        prefill: { email: user.email },
        theme: { color: "#2563eb" },
        handler: async (response) => {
          // 3. Payment verify kariye
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: user.id,
              plan: selectedPlan,
            }),
          });
          const result = await verifyRes.json();
          if (result.success) {
            setIsPremium(true);
            setSuccessMsg("🎉 Premium activated! Badhi features unlock thayi!");
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Payment error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const premiumFeatures = [
    { icon: "📝", title: "Unlimited Mock Tests", sub: "GPSC, GSSSB, Police, PSI" },
    { icon: "🤖", title: "AI Doubt Solver", sub: "Unlimited questions" },
    { icon: "⚡", title: "Flashcards - All Subjects", sub: "16+ subjects" },
    { icon: "📰", title: "Daily Current Affairs", sub: "Gujarati + Hindi" },
    { icon: "📊", title: "Detailed Analytics", sub: "Subject-wise weak areas" },
    { icon: "🏆", title: "Leaderboard Access", sub: "Gujarat rank dekho" },
    { icon: "📄", title: "PDF Download", sub: "Current affairs monthly" },
    { icon: "🔔", title: "Exam Notifications", sub: "GPSC, GSSSB alerts" },
  ];

  if (isPremium) {
    return (
      <div className="space-y-5">
        <div className="relative rounded-2xl overflow-hidden p-5 shadow-lg text-center"
          style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
          <div className="text-4xl mb-2">👑</div>
          <h2 className="text-lg font-black text-white">Premium Member!</h2>
          <p className="text-xs text-white/80 mt-1">Tamari badhi features unlock che</p>
        </div>
        {successMsg && (
          <div className="bg-emerald-900/40 border border-emerald-700 rounded-2xl p-4 text-center">
            <p className="text-emerald-400 font-bold text-sm">{successMsg}</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          {premiumFeatures.map((f, i) => (
            <Card key={i}>
              <div className="text-2xl mb-1">{f.icon}</div>
              <p className="text-xs font-bold text-gray-100">{f.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{f.sub}</p>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-black text-gray-50">Premium Plans 👑</h2>
        <p className="text-xs text-gray-500">Gujarat exam ma top rank laavo</p>
      </div>

      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden p-5 shadow-xl"
        style={{ background: "linear-gradient(135deg, #1e3a8a, #2563eb, #7c3aed)" }}>
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full" />
        <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-white/5 rounded-full" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🚀</span>
            <span className="text-xs font-black text-blue-200 uppercase tracking-widest">ExamBuddy</span>
          </div>
          <h3 className="text-xl font-black text-white leading-tight">GPSC Crack karo<br />Premium sathe!</h3>
          <p className="text-xs text-blue-200 mt-2">3,220+ questions · AI-powered · Gujarati medium</p>
        </div>
      </div>

      {/* Plan Toggle */}
      <div className="bg-gray-900 rounded-2xl p-1 flex gap-1">
        <button
          onClick={() => setSelectedPlan("monthly")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${selectedPlan === "monthly"
            ? "bg-blue-600 text-white shadow-sm"
            : "text-gray-400"}`}>
          Monthly
        </button>
        <button
          onClick={() => setSelectedPlan("yearly")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all relative ${selectedPlan === "yearly"
            ? "bg-blue-600 text-white shadow-sm"
            : "text-gray-400"}`}>
          Yearly
          <span className="absolute -top-2 -right-1 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">SAVE 33%</span>
        </button>
      </div>

      {/* Price Card */}
      <Card>
        <div className="text-center py-2">
          <div className="flex items-end justify-center gap-1 mb-1">
            <span className="text-4xl font-black text-gray-50">
              ₹{selectedPlan === "yearly" ? "799" : "99"}
            </span>
            <span className="text-gray-500 text-sm mb-2">
              /{selectedPlan === "yearly" ? "year" : "month"}
            </span>
          </div>
          {selectedPlan === "yearly" && (
            <p className="text-xs text-emerald-400 font-bold">= ₹66/month · ₹400 bachao!</p>
          )}
          {selectedPlan === "monthly" && (
            <p className="text-xs text-gray-500">Daily ₹3.30 ma complete preparation</p>
          )}
        </div>

        <div className="mt-4 space-y-2.5">
          {premiumFeatures.map((f, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-5 h-5 bg-emerald-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <span className="text-xs font-bold text-gray-200">{f.title}</span>
                <span className="text-xs text-gray-500"> · {f.sub}</span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="mt-5 w-full py-3.5 rounded-xl font-black text-sm text-white transition-all active:scale-95 shadow-lg disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
          {loading ? "Processing..." : `🔓 Get Premium - ₹${selectedPlan === "yearly" ? "799" : "99"}`}
        </button>
        <p className="text-center text-xs text-gray-600 mt-2">Secure payment via Razorpay · UPI/Card/NetBanking</p>
      </Card>

      {/* Free vs Premium comparison */}
      <Card>
        <p className="text-xs font-black text-gray-400 uppercase tracking-wide mb-3">Free vs Premium</p>
        <div className="space-y-2">
          {[
            { feature: "Quiz (10 questions)", free: true, premium: true },
            { feature: "Mock Tests", free: "2/month", premium: "Unlimited" },
            { feature: "AI Doubt Solver", free: "3/day", premium: "Unlimited" },
            { feature: "Current Affairs", free: "Headlines only", premium: "Full + PDF" },
            { feature: "Flashcards", free: "History only", premium: "All 16 subjects" },
            { feature: "Analytics", free: "Basic", premium: "Detailed" },
          ].map((row, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 py-1.5 border-b border-gray-800 last:border-0">
              <span className="text-xs text-gray-400 col-span-1">{row.feature}</span>
              <span className="text-xs text-center text-gray-500">
                {row.free === true ? "✓" : row.free === false ? "✗" : row.free}
              </span>
              <span className={`text-xs text-center font-bold ${row.premium === "Unlimited" || row.premium === true ? "text-emerald-400" : "text-blue-400"}`}>
                {row.premium === true ? "✓" : row.premium}
              </span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2 pt-2">
          <div />
          <p className="text-xs text-center text-gray-600 font-bold">Free</p>
          <p className="text-xs text-center text-blue-500 font-black">Premium</p>
        </div>
      </Card>
    </div>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function Page() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const tabComponents = {
    dashboard: <DashboardTab setActiveTab={setActiveTab} />,
    quiz: <QuizTab />,
    doubt: <DoubtTab />,
    flashcards: <FlashcardsTab />,
    current: <CurrentTab />,
    leaderboard: <LeaderboardTab />,
    marketplace: <MarketplaceTab />,
  };

  return (
    <div className="min-h-screen bg-[#0f0f13] pb-24">
      <header className="bg-[#0f0f13]/90 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: "linear-gradient(135deg, #2563eb, #4338ca)" }}>
              <span className="text-white text-xs font-black">EB</span>
            </div>
            <div>
              <span className="font-black text-gray-50 text-sm tracking-tight">ExamBuddy</span>
              <span className="ml-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-full">AI</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 bg-gray-950 border border-gray-700 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors relative">
              <Icon name="bell" size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>
            <button className="w-9 h-9 bg-gray-950 border border-gray-700 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors">
              <Icon name="search" size={18} />
            </button>
            <button
              onClick={async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                  if (confirm(`Logged in as:\n${user.email}\n\nLogout karva maangho cho?`)) {
                    await supabase.auth.signOut();
                    window.location.href = "/login";
                  }
                } else {
                  window.location.href = "/login";
                }
              }}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-gray-900/50 shadow-sm hover:opacity-80 transition-opacity"
              style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}>
              Me
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-5">
        {tabComponents[activeTab]}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-gray-800 z-40 shadow-2xl">
        <div className="max-w-lg mx-auto px-1">
          <div className="flex">
            {TABS.map(tab => {
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-all duration-200 relative ${active ? "text-blue-600" : "text-gray-500 hover:text-gray-300"}`}>
                  {active && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-600 rounded-full" />
                  )}
                  <div className={`p-1.5 rounded-xl transition-all duration-200 ${active ? "bg-blue-50" : "bg-transparent"}`}>
                    <Icon name={tab.icon} size={active ? 20 : 19} />
                  </div>
                  <span className={`text-[10px] font-bold leading-none ${active ? "text-blue-600" : "text-gray-500"}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}