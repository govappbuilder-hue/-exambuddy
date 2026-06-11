"use client";

import { useState, useRef, useEffect } from "react";

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
    gray: "bg-slate-100 text-slate-600 border border-slate-200",
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
    className={`bg-white border border-slate-100 rounded-2xl p-4 shadow-sm ${onClick ? "cursor-pointer hover:border-blue-200 hover:shadow-md active:scale-[0.985] transition-all duration-150" : ""} ${className}`}>
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
    <div className={`bg-white border ${p.border} rounded-2xl p-4 shadow-sm relative overflow-hidden`}>
      <div className={`absolute -right-4 -top-4 w-16 h-16 ${p.ring} rounded-full opacity-50`} />
      <div className="flex items-start justify-between relative">
        <div>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-black text-slate-900">{value}</p>
          {sub && <p className={`text-[11px] font-semibold mt-0.5 ${trend === "up" ? "text-emerald-600" : "text-slate-400"}`}>{sub}</p>}
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
          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
          : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}>
        {s}
      </button>
    ))}
  </div>
);

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
const DashboardTab = ({ setActiveTab }) => {
  const [streak] = useState(7);
  const [todos, setTodos] = useState([
    { task: "Complete History Quiz – Ch. 5", done: true },
    { task: "Read Current Affairs (June 12)", done: true },
    { task: "Revise 20 Polity Flashcards", done: false },
    { task: "Practice Negative Marking Set", done: false },
  ]);
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const completed = [true, true, true, true, true, true, false];

  const toggleTodo = (i) => {
    const updated = [...todos];
    updated[i] = { ...updated[i], done: !updated[i].done };
    setTodos(updated);
  };

  const donePct = Math.round((todos.filter(t => t.done).length / todos.length) * 100);

  return (
    <div className="space-y-5">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden" style={{ background: "linear-gradient(135deg, #1e40af 0%, #4338ca 50%, #6d28d9 100%)" }}>
        <div className="absolute -right-12 -top-12 w-44 h-44 bg-white opacity-5 rounded-full" />
        <div className="absolute right-4 top-8 w-20 h-20 bg-white opacity-5 rounded-full" />
        <div className="absolute left-24 -bottom-10 w-32 h-32 bg-white opacity-5 rounded-full" />
        <div className="p-5 relative">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1 mb-2.5 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-white text-xs font-semibold">Good Morning 👋</span>
              </div>
              <h2 className="text-xl font-black text-white leading-tight">Ready to crack<br />today's exam? 🎯</h2>
              <p className="text-blue-200 text-xs mt-2">3 pending quizzes • 2 new flashcard sets</p>
            </div>
            <div className="text-center bg-white/15 rounded-2xl px-3.5 py-2.5 backdrop-blur-sm border border-white/10">
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
                  ? "bg-white text-blue-700 shadow-md"
                  : "bg-white/15 text-blue-200 border border-white/20"}`}>
                  {completed[i] ? <Icon name="check" size={13} /> : d}
                </div>
                <span className="text-[10px] text-blue-300 font-semibold">{d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Quizzes Done" value="142" sub="↑ +12 this week" icon="quiz" color="blue" trend="up" />
        <StatCard label="Accuracy" value="78%" sub="↑ +3% this week" icon="target" color="green" trend="up" />
        <StatCard label="Flashcards" value="38" sub="Reviewed today" icon="cards" color="purple" />
        <StatCard label="Your Rank" value="#24" sub="Out of 1,240" icon="trophy" color="amber" />
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-slate-800">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Generate Quiz", sub: "From PDF or Photo", icon: "spark", tab: "quiz", bg: "bg-blue-50", icon_color: "text-blue-600" },
            { label: "Ask AI Doubt", sub: "Instant answers", icon: "brain", tab: "doubt", bg: "bg-violet-50", icon_color: "text-violet-600" },
            { label: "Flashcards", sub: "Study & Review", icon: "cards", tab: "flashcards", bg: "bg-emerald-50", icon_color: "text-emerald-600" },
            { label: "Today's News", sub: "Current Affairs", icon: "newspaper", tab: "current", bg: "bg-amber-50", icon_color: "text-amber-600" },
          ].map((a) => (
            <button key={a.tab} onClick={() => setActiveTab(a.tab)}
              className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-blue-200 active:scale-95 transition-all text-left group">
              <div className={`w-9 h-9 rounded-xl ${a.bg} ${a.icon_color} flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform`}>
                <Icon name={a.icon} size={18} />
              </div>
              <p className="text-sm font-bold text-slate-800">{a.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{a.sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Today Targets */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-black text-slate-800">Today's Targets</h3>
            <p className="text-xs text-slate-400 mt-0.5">{todos.filter(t => t.done).length}/{todos.length} done · {donePct}% complete</p>
          </div>
          <button className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
            <Icon name="plus" size={15} />
          </button>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full mb-4 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
            style={{ width: `${donePct}%` }} />
        </div>
        <div className="space-y-2.5">
          {todos.map((t, i) => (
            <button key={i} onClick={() => toggleTodo(i)} className="w-full flex items-center gap-3 group text-left">
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${t.done
                ? "bg-emerald-500 border-emerald-500 text-white"
                : "border-slate-300 group-hover:border-blue-400"}`}>
                {t.done && <Icon name="check" size={11} />}
              </div>
              <span className={`text-sm transition-colors ${t.done ? "line-through text-slate-400" : "text-slate-700"}`}>{t.task}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Weakness */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-slate-800">Weakness Analytics</h3>
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
                <span className="font-semibold text-slate-700">{s.subject}</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-semibold">{s.pct}%</span>
                  <Badge color={s.tag}>{s.label}</Badge>
                </div>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${s.color} transition-all duration-700`} style={{ width: `${s.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Exam Countdown */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-slate-800">Exam Countdown ⏳</h3>
          <button className="text-xs font-semibold text-blue-600">+ Add</button>
        </div>
        <div className="space-y-1">
          {[
            { exam: "UPSC Prelims 2025", date: "26 May 2025", days: 14, icon: "🔴", urgent: true },
            { exam: "SSC CGL Tier I", date: "20 Jun 2025", days: 38, icon: "🟡", urgent: false },
            { exam: "IBPS PO", date: "15 Aug 2025", days: 94, icon: "🟢", urgent: false },
          ].map((e) => (
            <div key={e.exam} className={`flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0 ${e.urgent ? "bg-red-50/50 -mx-4 px-4 rounded-xl" : ""}`}>
              <span className="text-lg">{e.icon}</span>
              <div className="flex-1">
                <p className={`text-sm font-bold ${e.urgent ? "text-red-700" : "text-slate-800"}`}>{e.exam}</p>
                <p className="text-xs text-slate-400">{e.date}</p>
              </div>
              <div className={`text-center px-3 py-1.5 rounded-xl border ${e.urgent ? "bg-red-100 border-red-200" : e.days < 50 ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"}`}>
                <p className={`text-lg font-black ${e.urgent ? "text-red-600" : e.days < 50 ? "text-amber-600" : "text-emerald-600"}`}>{e.days}</p>
                <p className="text-[10px] text-slate-400 font-bold">DAYS</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ─── QUIZ ─────────────────────────────────────────────────────────────────────
const QuizTab = () => {
  const [phase, setPhase] = useState("home");
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [negativeMode, setNegativeMode] = useState(false);
  const [subject, setSubject] = useState("All");
  const [timeLeft, setTimeLeft] = useState(360);
  const timerRef = useRef(null);

  const questions = [
    { q: "Who was the first Viceroy of India?", opts: ["Lord Canning", "Lord Dalhousie", "Lord Curzon", "Lord Irwin"], ans: 0, topic: "History", exp: "Lord Canning became the first Viceroy of India in 1858 after the Government of India Act." },
    { q: "The Tropic of Cancer passes through how many Indian states?", opts: ["6", "7", "8", "9"], ans: 2, topic: "Geography", exp: "8 states: Gujarat, Rajasthan, MP, Chhattisgarh, Jharkhand, West Bengal, Tripura, Mizoram." },
    { q: "Which Article deals with Right to Equality?", opts: ["Article 12", "Article 14", "Article 19", "Article 21"], ans: 1, topic: "Polity", exp: "Article 14 guarantees equality before law and equal protection of laws within India." },
    { q: "What is the SI unit of electric current?", opts: ["Volt", "Watt", "Ampere", "Ohm"], ans: 2, topic: "Science", exp: "Ampere (A) is the SI unit of electric current, named after André-Marie Ampère." },
    { q: "Which Five Year Plan focused on 'Garibi Hatao'?", opts: ["3rd", "4th", "5th", "6th"], ans: 2, topic: "Economics", exp: "5th Five Year Plan (1974-79) under Indira Gandhi had the 'Garibi Hatao' slogan." },
  ];

  useEffect(() => {
    if (phase === "quiz") {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); setPhase("result"); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

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

  const resetQuiz = () => { setPhase("home"); setCurrent(0); setAnswers([]); setSelected(null); setTimeLeft(360); };
  const fmtTime = (s) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  if (phase === "home") return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-black text-slate-900">AI Quiz Generator</h2>
        <p className="text-sm text-slate-400 mt-0.5">Upload material or pick a preset quiz</p>
      </div>
      <div className="border-2 border-dashed border-blue-200 rounded-2xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group bg-gradient-to-br from-slate-50 to-blue-50/20">
        <div className="flex justify-center gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
            <Icon name="upload" size={20} />
          </div>
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform" style={{ transitionDelay: "50ms" }}>
            <Icon name="camera" size={20} />
          </div>
        </div>
        <p className="text-sm font-bold text-slate-700 mb-1">Upload PDF or Photo</p>
        <p className="text-xs text-slate-400">AI will generate smart questions instantly</p>
      </div>

      <SubjectPills active={subject} onChange={setSubject} />

      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
            <Icon name="lightning" size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">Negative Marking</p>
            <p className="text-xs text-slate-400">–0.25 per wrong answer</p>
          </div>
        </div>
        <button onClick={() => setNegativeMode(!negativeMode)}
          className={`w-12 h-6 rounded-full transition-all duration-300 relative ${negativeMode ? "bg-red-500 shadow-md" : "bg-slate-200"}`}>
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${negativeMode ? "left-6" : "left-0.5"}`} />
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-slate-800">Preset Quizzes</h3>
          <button className="text-xs font-semibold text-blue-600">View All</button>
        </div>
        <div className="space-y-2.5">
          {[
            { title: "UPSC Prelims Mock – Set 1", q: 5, mins: 6, topic: "Mixed", badge: "🔥 Popular", bColor: "orange" },
            { title: "SSC CGL Reasoning Practice", q: 20, mins: 15, topic: "Reasoning", badge: null },
            { title: "History Topicwise – Ancient India", q: 15, mins: 12, topic: "History", badge: "✨ New", bColor: "green" },
          ].map((qz, i) => (
            <Card key={i} onClick={() => { setCurrent(0); setAnswers([]); setSelected(null); setTimeLeft(qz.mins * 60); setPhase("quiz"); }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                  <Icon name="quiz" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate mb-0.5">{qz.title}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-slate-400">{qz.q} Qs · {qz.mins} min · {qz.topic}</p>
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
          <p className="text-sm text-slate-500">Final Score: {finalScore.toFixed(1)} / {questions.length}</p>
          <div className="flex justify-center gap-8 mt-5 pt-4 border-t border-white/50">
            <div><p className="text-xl font-black text-emerald-600">{score}</p><p className="text-xs text-slate-400 font-semibold">Correct</p></div>
            <div><p className="text-xl font-black text-red-500">{wrong}</p><p className="text-xs text-slate-400 font-semibold">Wrong</p></div>
            <div><p className="text-xl font-black text-slate-400">{questions.length - score - wrong}</p><p className="text-xs text-slate-400 font-semibold">Skipped</p></div>
          </div>
          {negativeMode && <p className="text-xs text-amber-700 mt-3 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 font-semibold mx-4">⚡ Negative marking: –{(wrong * 0.25).toFixed(2)} pts deducted</p>}
        </Card>
        <div>
          <h3 className="text-sm font-black text-slate-700 mb-3">📋 Question Review</h3>
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
                    <p className="text-sm font-semibold text-slate-800 leading-snug">{qq.q}</p>
                  </div>
                  <div className="ml-7 space-y-1.5">
                    <p className="text-xs text-emerald-700 font-semibold bg-emerald-50 rounded-lg px-2 py-1">✓ {qq.opts[qq.ans]}</p>
                    {!correct && userAns != null && <p className="text-xs text-red-600 font-semibold bg-red-50 rounded-lg px-2 py-1">✗ Your answer: {qq.opts[userAns]}</p>}
                    {qq.exp && <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-2 py-1">💡 {qq.exp}</p>}
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5 items-center flex-1">
          {questions.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i < current ? "bg-blue-500" : i === current ? "bg-blue-400" : "bg-slate-200"}`}
              style={{ width: i === current ? 32 : 18 }} />
          ))}
          <span className="text-xs text-slate-400 font-bold ml-1">{current + 1}/{questions.length}</span>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-sm ml-3 ${timeLeft < 60 ? "bg-red-50 text-red-600 border border-red-200 animate-pulse" : "bg-slate-100 text-slate-600"}`}>
          ⏱ {fmtTime(timeLeft)}
        </div>
      </div>
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Badge color="gray">{q.topic}</Badge>
          <span className="text-xs text-slate-400 font-semibold">Question {current + 1}</span>
        </div>
        <p className="text-base font-bold text-slate-900 leading-relaxed mb-5">{q.q}</p>
        <div className="space-y-2.5">
          {q.opts.map((opt, i) => {
            let cls = "border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50/50";
            if (selected !== null) {
              if (i === q.ans) cls = "border-emerald-400 bg-emerald-50 text-emerald-800";
              else if (i === selected && selected !== q.ans) cls = "border-red-400 bg-red-50 text-red-800";
              else cls = "border-slate-100 text-slate-400 opacity-50";
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
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are ExamBuddy AI Doubt Solver for Indian competitive exam students (UPSC, SSC, IBPS, Railway, State PSC). Answer clearly and concisely in a friendly tone. Use bullet points for lists. Add a quick exam tip at the end when relevant. Keep answers focused and practical.",
          messages: [{ role: "user", content: userMsg }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(c => c.text || "").join("") || "Sorry, I could not get a response.";
      setMessages(prev => [...prev, { role: "ai", text }]);
    } catch {
      setMessages(prev => [...prev, { role: "ai", text: "Connection error. Please check your internet and try again." }]);
    }
    setLoading(false);
  };

  const suggestions = ["Explain Article 370", "UPSC vs IAS difference?", "GDP vs GNP", "What is Preamble?", "Who wrote Indian Constitution?"];

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[500px]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
          <Icon name="brain" size={18} />
        </div>
        <div>
          <p className="text-sm font-black text-slate-800">AI Doubt Solver</p>
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
            <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${m.role === "user"
              ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm"
              : "bg-white border border-slate-100 text-slate-800 rounded-bl-sm"}`}>
              {m.text.split("\n").map((line, li) => <p key={li} className={li > 0 && line ? "mt-1" : ""}>{line}</p>)}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
              <Icon name="brain" size={13} />
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1.5 items-center">
                <span className="text-xs text-slate-400 font-medium mr-1">Thinking</span>
                {[0, 150, 300].map(d => (
                  <span key={d} className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="pt-3 border-t border-slate-100">
        <div className="flex gap-2">
          <button className="p-2.5 border border-slate-200 rounded-xl text-slate-400 hover:text-blue-500 hover:border-blue-300 transition-colors flex-shrink-0">
            <Icon name="camera" size={18} />
          </button>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Ask your doubt..."
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
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
  const [known, setKnown] = useState([]);
  const [review, setReview] = useState([]);
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
    if (action === "known") setKnown(prev => [...prev, index]);
    else setReview(prev => [...prev, index]);
    setFlipped(false);
    setTimeout(() => { setIndex(i => (i + 1 < cards.length ? i + 1 : 0)); }, 250);
  };
  const donePct = ((index) / cards.length) * 100;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900">Flashcards</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {index + 1} of {cards.length} ·{" "}
            <span className="text-emerald-600 font-bold">{known.length} known</span> ·{" "}
            <span className="text-red-500 font-bold">{review.length} to review</span>
          </p>
        </div>
        <button className="w-9 h-9 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-300 transition-colors">
          <Icon name="upload" size={17} />
        </button>
      </div>

      <SubjectPills active={subject} onChange={setSubject} />

      {/* Progress */}
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${donePct}%` }} />
      </div>

      {/* Flashcard 3D */}
      <div style={{ perspective: "1000px" }}>
        <div onClick={() => setFlipped(!flipped)} className="cursor-pointer relative transition-all duration-500"
          style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)", minHeight: 230 }}>
          <div className="absolute inset-0 bg-white border border-slate-100 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm"
            style={{ backfaceVisibility: "hidden" }}>
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 mb-3">
              <Icon name="cards" size={20} />
            </div>
            <Badge color="gray">{card.topic}</Badge>
            <p className="text-lg font-bold text-slate-900 mt-3 leading-relaxed">{card.front}</p>
            <p className="text-xs text-slate-400 mt-4 flex items-center gap-1">
              <Icon name="rotate" size={12} /> Tap to reveal answer
            </p>
          </div>
          <div className="absolute inset-0 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-lg"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: "linear-gradient(135deg, #1e40af, #4338ca, #6d28d9)" }}>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white mb-3">
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

      {/* Session Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Remaining", value: cards.length - known.length - review.length, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Known", value: known.length, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Review", value: review.length, color: "text-red-500", bg: "bg-red-50" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-3 text-center border border-white`}>
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 font-semibold">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Notes */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800">Personal Notes</h3>
          <button className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:text-blue-700">
            <Icon name="download" size={13} /> Export
          </button>
        </div>
        <textarea rows={3} placeholder="Add your notes for this card..."
          className="w-full text-sm border border-slate-100 rounded-xl px-3 py-2 text-slate-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 resize-none transition-all" />
        <div className="flex gap-3 mt-2">
          <button className="text-xs text-slate-400 font-semibold flex items-center gap-1 hover:text-blue-500 transition-colors">
            <Icon name="bookmark" size={13} /> Bookmark
          </button>
          <button className="text-xs text-slate-400 font-semibold flex items-center gap-1 hover:text-blue-500 transition-colors">
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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900">Current Affairs</h2>
          <p className="text-xs text-slate-400">June 12, 2026 • Daily Update</p>
        </div>
        <div className="flex gap-0.5 bg-slate-100 rounded-xl p-1">
          {["En", "Hi", "Gu"].map((l, i) => (
            <button key={l} onClick={() => setLang(["English", "Hindi", "Gujarati"][i])}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${lang === ["English", "Hindi", "Gujarati"][i] ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {cats.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${category === c
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}>
            {c}
          </button>
        ))}
      </div>

      {/* MCQ of the Day */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
            <Icon name="star" size={14} />
          </div>
          <span className="text-xs font-black text-blue-700 uppercase tracking-wide">MCQ of the Day ⭐</span>
        </div>
        <p className="text-sm font-bold text-slate-800 mb-3">India's GDP growth rate in Q4 FY24 was closest to:</p>
        {["6.8%", "7.6%", "8.2%", "9.1%"].map((opt, i) => {
          const correctIdx = 2;
          let cls = "border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50";
          if (mcqSelected !== null) {
            if (i === correctIdx) cls = "border-emerald-400 bg-emerald-50 text-emerald-800";
            else if (i === mcqSelected) cls = "border-red-400 bg-red-50 text-red-700";
            else cls = "border-slate-100 bg-white text-slate-400 opacity-60";
          }
          return (
            <button key={i} onClick={() => { if (mcqSelected === null) setMcqSelected(i); }}
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

      {/* News */}
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
                <p className="text-sm font-semibold text-slate-800 leading-snug">{n.title}</p>
                <p className="text-xs text-slate-400 mt-1.5 font-medium">{n.time}</p>
              </div>
              <button className="text-slate-300 hover:text-blue-500 flex-shrink-0 mt-0.5 transition-colors">
                <Icon name="bookmark" size={16} />
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50 border-blue-100">
        <div>
          <p className="text-sm font-bold text-slate-800">Download Monthly Digest</p>
          <p className="text-xs text-slate-400">June 2026 · PDF · Free</p>
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

  const users = [
    { name: "Arjun Sharma", score: 2840, streak: 21, avatar: "AS", rank: 1 },
    { name: "Priya Patel", score: 2650, streak: 15, avatar: "PP", rank: 2 },
    { name: "Rohit Kumar", score: 2410, streak: 12, avatar: "RK", rank: 3 },
    { name: "You", score: 1980, streak: 7, avatar: "ME", rank: 24, isMe: true },
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
        <h2 className="text-lg font-black text-slate-900">Leaderboard 🏆</h2>
        <p className="text-xs text-slate-400">Compete with fellow aspirants</p>
      </div>

      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {[["daily", "Today"], ["weekly", "This Week"], ["monthly", "Month"]].map(([v, l]) => (
          <button key={v} onClick={() => setPeriod(v)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${period === v ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
            {l}
          </button>
        ))}
      </div>

      {/* Podium */}
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
                <p className="text-xs font-bold text-slate-700 text-center w-16 truncate">{u.name.split(" ")[0]}</p>
                <div className="w-14 bg-gradient-to-t from-amber-300 to-amber-200 rounded-t-xl flex items-end justify-center shadow-sm"
                  style={{ height: heights[i] }}>
                  <span className="text-xs font-black text-amber-800 mb-1.5">#{realRank[i]}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {users.map((u, i) => (
          <Card key={i} className={`flex items-center gap-3 py-3 ${u.isMe ? "border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md shadow-blue-100" : ""}`}>
            <span className={`text-sm font-black w-7 text-center ${u.isMe ? "text-blue-600" : "text-slate-400"}`}>#{u.rank}</span>
            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarGrad[i]} flex items-center justify-center text-white text-xs font-black shadow-sm`}>
              {u.avatar}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-bold ${u.isMe ? "text-blue-700" : "text-slate-800"}`}>
                {u.name} {u.isMe && <Badge color="blue">You</Badge>}
              </p>
              <p className="text-xs text-slate-400 font-medium">
                {u.score.toLocaleString()} pts · 🔥 <span className="text-orange-500 font-bold">{u.streak}d</span>
              </p>
            </div>
            {i < 3 && <span className="text-xl">{medals[i]}</span>}
          </Card>
        ))}
      </div>

      {/* Badges */}
      <div>
        <h3 className="text-sm font-black text-slate-800 mb-3">Your Achievements</h3>
        <div className="grid grid-cols-4 gap-2.5">
          {[
            { icon: "🔥", label: "7-Day Streak", earned: true },
            { icon: "🧠", label: "Quiz Master", earned: true },
            { icon: "📰", label: "News Ninja", earned: false },
            { icon: "🏆", label: "Top 10", earned: false },
          ].map((b, i) => (
            <div key={i} className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center ${b.earned
              ? "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm"
              : "border-slate-100 bg-slate-50 opacity-40"}`}>
              <span className="text-2xl">{b.icon}</span>
              <p className="text-[10px] text-slate-600 font-bold leading-tight">{b.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── MARKETPLACE ──────────────────────────────────────────────────────────────
const MarketplaceTab = () => {
  const [filterType, setFilterType] = useState("All");

  const items = [
    { title: "UPSC Prelims Complete Notes 2024", author: "IAS Mentor", type: "PDF", price: 99, rating: 4.8, downloads: 1240, pages: 340, badge: "Bestseller" },
    { title: "SSC CGL Maths Shortcut Tricks", author: "Rajesh Sir", type: "PDF", price: 49, rating: 4.6, downloads: 890, pages: 120, badge: null },
    { title: "Polity by Laxmikanth – Revision Notes", author: "CivilsPrep", type: "PDF", price: 0, rating: 4.9, downloads: 5200, pages: 80, badge: "Free" },
    { title: "Current Affairs Jan-Jun 2024", author: "NewsEdge", type: "PDF", price: 79, rating: 4.5, downloads: 670, pages: 200, badge: "New" },
    { title: "Ancient History Full Course Pack", author: "HistoryHero", type: "Course", price: 299, rating: 4.7, downloads: 430, pages: null, badge: "Premium" },
    { title: "Reasoning 500 Practice Questions", author: "LogicBox", type: "PDF", price: 39, rating: 4.4, downloads: 1100, pages: 90, badge: null },
  ];

  const types = ["All", "PDF", "Course", "Test Series"];
  const filtered = filterType === "All" ? items : items.filter(i => i.type === filterType);
  const badgeColors = { Bestseller: "amber", Free: "green", New: "blue", Premium: "purple" };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-black text-slate-900">Marketplace 🛒</h2>
        <p className="text-xs text-slate-400">Study materials by toppers & educators</p>
      </div>

      {/* Sell Banner */}
      <div className="relative rounded-2xl overflow-hidden p-4 flex items-center gap-3 shadow-lg"
        style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5, #2563eb)" }}>
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
        <div className="flex-1 relative">
          <p className="font-black text-white text-sm">💰 Sell Your Study Material</p>
          <p className="text-xs text-white/80 mt-0.5">Upload PDFs & earn 70% commission</p>
        </div>
        <button className="flex-shrink-0 px-4 py-2 bg-white text-violet-700 rounded-xl text-xs font-black hover:bg-slate-50 active:scale-95 transition-all shadow-sm">
          Upload
        </button>
      </div>

      <div className="flex gap-2">
        {types.map(t => (
          <button key={t} onClick={() => setFilterType(t)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${filterType === t
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((item, i) => (
          <Card key={i}>
            <div className="flex items-start gap-3">
              <div className="w-12 h-14 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 text-blue-500">
                <Icon name={item.type === "Course" ? "eye" : "list"} size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  {item.badge && <Badge color={badgeColors[item.badge] || "gray"}>{item.badge}</Badge>}
                  <Badge color="gray">{item.type}</Badge>
                </div>
                <p className="text-sm font-bold text-slate-900 leading-snug">{item.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">by {item.author} · ⭐ {item.rating} · {item.downloads.toLocaleString()} downloads</p>
                {item.pages && <p className="text-xs text-slate-400">{item.pages} pages</p>}
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
              <span className="text-base font-black text-slate-900">
                {item.price === 0 ? <span className="text-emerald-600">Free ✓</span> : `₹${item.price}`}
              </span>
              <button className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 shadow-sm ${item.price === 0
                ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-emerald-500/25 hover:shadow-md"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-600/25 hover:shadow-md"}`}>
                <Icon name={item.price === 0 ? "download" : "lock"} size={13} />
                {item.price === 0 ? "Download" : "Buy Now"}
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Job Alerts */}
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
            <Icon name="bell" size={14} />
          </div>
          <span className="text-xs font-black text-emerald-700 uppercase tracking-wide">Latest Job Notifications</span>
        </div>
        <div className="space-y-1">
          {[
            { title: "UPSC CSE 2025 Notification", date: "Out Now", hot: true },
            { title: "SSC CGL 2024 Result", date: "Jun 10", hot: false },
            { title: "IBPS PO 2025 Apply", date: "Jul 1", hot: false },
          ].map((j, i) => (
            <div key={i} className={`flex items-center justify-between py-2 border-b border-emerald-100 last:border-0 ${j.hot ? "bg-red-50/50 -mx-4 px-4 rounded-xl" : ""}`}>
              <p className={`text-xs font-bold ${j.hot ? "text-red-700" : "text-slate-700"}`}>{j.title}</p>
              <Badge color={j.hot ? "red" : "gray"}>{j.date}</Badge>
            </div>
          ))}
        </div>
        <button className="mt-3 text-xs text-blue-600 font-bold flex items-center gap-1 hover:underline">
          <Icon name="download" size={12} /> Download Syllabus PDFs
        </button>
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
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: "linear-gradient(135deg, #2563eb, #4338ca)" }}>
              <span className="text-white text-xs font-black">EB</span>
            </div>
            <div>
              <span className="font-black text-slate-900 text-sm tracking-tight">ExamBuddy</span>
              <span className="ml-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-full">AI</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors relative">
              <Icon name="bell" size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>
            <button className="w-9 h-9 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
              <Icon name="search" size={18} />
            </button>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-sm"
              style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}>
              Me
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 pt-5">
        {tabComponents[activeTab]}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 z-40 shadow-2xl">
        <div className="max-w-lg mx-auto px-1">
          <div className="flex">
            {TABS.map(tab => {
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-all duration-200 relative ${active ? "text-blue-600" : "text-slate-400 hover:text-slate-600"}`}>
                  {active && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-600 rounded-full" />
                  )}
                  <div className={`p-1.5 rounded-xl transition-all duration-200 ${active ? "bg-blue-50" : "bg-transparent"}`}>
                    <Icon name={tab.icon} size={active ? 20 : 19} />
                  </div>
                  <span className={`text-[10px] font-bold leading-none ${active ? "text-blue-600" : "text-slate-400"}`}>
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