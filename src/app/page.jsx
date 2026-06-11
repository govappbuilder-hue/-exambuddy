"use client";

import { useState, useRef, useEffect } from "react";

// ─── Icons (inline SVG to avoid dependency issues) ───────────────────────────
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
    shield: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
    chart: <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
    download: <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />,
    star: <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,
    plus: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />,
    send: <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />,
    lock: <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />,
    tag: <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />,
    share: <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />,
    eye: <><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>,
    globe: <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />,
    target: <><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></>,
    list: <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
      {icons[name] || icons.home}
    </svg>
  );
};

// ─── Constants ────────────────────────────────────────────────────────────────
const TABS = [
  { id: "dashboard", label: "Dashboard", icon: "home" },
  { id: "quiz", label: "Quiz", icon: "quiz" },
  { id: "doubt", label: "Doubt Solver", icon: "brain" },
  { id: "flashcards", label: "Flashcards", icon: "cards" },
  { id: "current", label: "Current Affairs", icon: "newspaper" },
  { id: "leaderboard", label: "Leaderboard", icon: "trophy" },
  { id: "marketplace", label: "Marketplace", icon: "store" },
];

const SUBJECTS = ["All", "History", "Geography", "Polity", "Science", "Economics", "English", "Mathematics"];

// ─── Shared UI components ─────────────────────────────────────────────────────
const Badge = ({ children, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border border-blue-100",
    green: "bg-green-50 text-green-700 border border-green-100",
    amber: "bg-amber-50 text-amber-700 border border-amber-100",
    red: "bg-red-50 text-red-700 border border-red-100",
    purple: "bg-purple-50 text-purple-700 border border-purple-100",
    gray: "bg-gray-100 text-gray-600 border border-gray-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${colors[color]}`}>
      {children}
    </span>
  );
};

const Card = ({ children, className = "", onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white border border-gray-100 rounded-2xl p-5 ${onClick ? "cursor-pointer hover:border-gray-200 hover:shadow-sm transition-all" : ""} ${className}`}
  >
    {children}
  </div>
);

const StatCard = ({ label, value, sub, icon, color = "blue" }) => {
  const colors = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    amber: "text-amber-600 bg-amber-50",
    purple: "text-purple-600 bg-purple-50",
  };
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{label}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`p-2 rounded-xl ${colors[color]}`}>
          <Icon name={icon} size={18} />
        </div>
      </div>
    </Card>
  );
};

const UploadZone = ({ onUpload, label = "Upload PDF or Photo" }) => (
  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer">
    <div className="flex justify-center gap-3 mb-3">
      <div className="p-2 bg-gray-100 rounded-xl text-gray-400">
        <Icon name="upload" size={20} />
      </div>
      <div className="p-2 bg-gray-100 rounded-xl text-gray-400">
        <Icon name="camera" size={20} />
      </div>
    </div>
    <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
    <p className="text-xs text-gray-400">PDF, JPG, PNG supported</p>
  </div>
);

// ─── TAB: Dashboard ──────────────────────────────────────────────────────────
const DashboardTab = ({ setActiveTab }) => {
  const [streak] = useState(7);
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const completed = [true, true, true, true, true, true, false];

  return (
    <div className="space-y-6">
      {/* Welcome + streak */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-blue-100 text-sm">Good morning 👋</p>
            <h2 className="text-xl font-semibold mt-0.5">Ready to study?</h2>
            <p className="text-blue-100 text-sm mt-1">You have 3 pending quizzes today</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-amber-300">
              <Icon name="fire" size={20} />
              <span className="text-2xl font-bold">{streak}</span>
            </div>
            <p className="text-xs text-blue-200">day streak</p>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          {days.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${completed[i] ? "bg-white text-blue-600" : "bg-blue-500/50 text-blue-200"}`}>
                {completed[i] ? <Icon name="check" size={14} /> : d}
              </div>
              <span className="text-xs text-blue-200">{d}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Quizzes Done" value="142" sub="This month" icon="quiz" color="blue" />
        <StatCard label="Accuracy" value="78%" sub="+3% this week" icon="target" color="green" />
        <StatCard label="Flashcards" value="38" sub="Reviewed today" icon="cards" color="purple" />
        <StatCard label="Rank" value="#24" sub="Out of 1,240" icon="trophy" color="amber" />
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Generate Quiz", sub: "From PDF or Photo", icon: "spark", tab: "quiz", color: "bg-blue-50 text-blue-600" },
            { label: "Ask Doubt", sub: "AI Doubt Solver", icon: "brain", tab: "doubt", color: "bg-purple-50 text-purple-600" },
            { label: "Flashcards", sub: "Study & Review", icon: "cards", tab: "flashcards", color: "bg-green-50 text-green-600" },
            { label: "Today's News", sub: "Current Affairs", icon: "newspaper", tab: "current", color: "bg-amber-50 text-amber-600" },
          ].map((a) => (
            <Card key={a.tab} onClick={() => setActiveTab(a.tab)} className="flex items-start gap-3">
              <div className={`p-2 rounded-xl ${a.color}`}>
                <Icon name={a.icon} size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{a.label}</p>
                <p className="text-xs text-gray-400">{a.sub}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* To-do list */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">Today's Targets</h3>
          <button className="text-blue-600 hover:text-blue-700">
            <Icon name="plus" size={16} />
          </button>
        </div>
        <div className="space-y-3">
          {[
            { task: "Complete History Quiz – Ch. 5", done: true },
            { task: "Read Current Affairs (June 12)", done: true },
            { task: "Revise 20 Polity Flashcards", done: false },
            { task: "Practice Negative Marking Set", done: false },
          ].map((t, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${t.done ? "bg-green-500 border-green-500 text-white" : "border-gray-300"}`}>
                {t.done && <Icon name="check" size={11} />}
              </div>
              <span className={`text-sm ${t.done ? "line-through text-gray-400" : "text-gray-700"}`}>{t.task}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Weakness analytics */}
      <Card>
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Weakness Analytics</h3>
        <div className="space-y-3">
          {[
            { subject: "Modern History", pct: 45, color: "bg-red-400" },
            { subject: "Geography – Maps", pct: 58, color: "bg-amber-400" },
            { subject: "Economics Basics", pct: 63, color: "bg-amber-300" },
            { subject: "Science & Tech", pct: 81, color: "bg-green-400" },
          ].map((s) => (
            <div key={s.subject}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600">{s.subject}</span>
                <span className="text-gray-400">{s.pct}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Exam Date Tracker */}
      <Card>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Exam Date Tracker</h3>
        <div className="space-y-2">
          {[
            { exam: "UPSC Prelims 2025", date: "26 May 2025", days: 14, color: "red" },
            { exam: "SSC CGL Tier I", date: "20 Jun 2025", days: 38, color: "amber" },
            { exam: "IBPS PO", date: "15 Aug 2025", days: 94, color: "green" },
          ].map((e) => (
            <div key={e.exam} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-800">{e.exam}</p>
                <p className="text-xs text-gray-400">{e.date}</p>
              </div>
              <Badge color={e.color}>{e.days}d left</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ─── TAB: Quiz ───────────────────────────────────────────────────────────────
const QuizTab = () => {
  const [phase, setPhase] = useState("home"); // home | quiz | result
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [negativeMode, setNegativeMode] = useState(false);
  const [subject, setSubject] = useState("All");

  const questions = [
    { q: "Who was the first Viceroy of India?", opts: ["Lord Canning", "Lord Dalhousie", "Lord Curzon", "Lord Irwin"], ans: 0, topic: "History" },
    { q: "The Tropic of Cancer passes through how many Indian states?", opts: ["6", "7", "8", "9"], ans: 2, topic: "Geography" },
    { q: "Which Article of the Constitution deals with the Right to Equality?", opts: ["Article 12", "Article 14", "Article 19", "Article 21"], ans: 1, topic: "Polity" },
    { q: "What is the SI unit of electric current?", opts: ["Volt", "Watt", "Ampere", "Ohm"], ans: 2, topic: "Science" },
    { q: "Which Five Year Plan focused on 'Garibi Hatao'?", opts: ["3rd", "4th", "5th", "6th"], ans: 2, topic: "Economics" },
  ];

  const q = questions[current];
  const score = answers.filter((a, i) => a === questions[i]?.ans).length;
  const wrong = answers.filter((a, i) => a !== questions[i]?.ans && a !== null).length;
  const finalScore = negativeMode ? score - wrong * 0.25 : score;

  const handleAnswer = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    setTimeout(() => {
      const newAns = [...answers, idx];
      setAnswers(newAns);
      if (current + 1 < questions.length) {
        setCurrent(current + 1);
        setSelected(null);
      } else {
        setPhase("result");
      }
    }, 700);
  };

  if (phase === "home") return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">AI Quiz Generator</h2>
        <p className="text-sm text-gray-400 mt-0.5">Generate from PDF, photo, or start a preset quiz</p>
      </div>
      <UploadZone label="Upload PDF or Photo to generate quiz" />
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {SUBJECTS.map(s => (
          <button key={s} onClick={() => setSubject(s)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${subject === s ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}>
            {s}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
          <p className="text-sm font-medium text-gray-700">Negative Marking Mode</p>
          <p className="text-xs text-gray-400">–0.25 per wrong answer</p>
        </div>
        <button onClick={() => setNegativeMode(!negativeMode)}
          className={`w-11 h-6 rounded-full transition-colors relative ${negativeMode ? "bg-blue-600" : "bg-gray-200"}`}>
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${negativeMode ? "left-5.5 translate-x-0.5" : "left-0.5"}`} />
        </button>
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Preset Quizzes</h3>
        {[
          { title: "UPSC Prelims Mock – Set 1", q: 5, mins: 6, topic: "Mixed", badge: "Popular" },
          { title: "SSC CGL Reasoning Practice", q: 20, mins: 15, topic: "Reasoning", badge: null },
          { title: "History Topicwise – Ancient India", q: 15, mins: 12, topic: "History", badge: "New" },
        ].map((qz, i) => (
          <Card key={i} onClick={() => { setCurrent(0); setAnswers([]); setSelected(null); setPhase("quiz"); }} className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-gray-800">{qz.title}</p>
                {qz.badge && <Badge color={qz.badge === "New" ? "green" : "blue"}>{qz.badge}</Badge>}
              </div>
              <p className="text-xs text-gray-400">{qz.q} questions · {qz.mins} min · {qz.topic}</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); }} className="p-1.5 text-gray-300 hover:text-blue-500">
              <Icon name="bookmark" size={16} />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );

  if (phase === "result") return (
    <div className="space-y-5">
      <Card className="text-center py-8">
        <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl font-bold text-blue-600">{finalScore.toFixed(1)}</span>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Quiz Complete!</h2>
        <p className="text-sm text-gray-400">Out of {questions.length} questions</p>
        <div className="flex justify-center gap-6 mt-5">
          <div className="text-center"><p className="text-lg font-semibold text-green-600">{score}</p><p className="text-xs text-gray-400">Correct</p></div>
          <div className="text-center"><p className="text-lg font-semibold text-red-500">{wrong}</p><p className="text-xs text-gray-400">Wrong</p></div>
          <div className="text-center"><p className="text-lg font-semibold text-gray-500">{questions.length - score - wrong}</p><p className="text-xs text-gray-400">Skipped</p></div>
        </div>
        {negativeMode && <p className="text-xs text-amber-600 mt-3 bg-amber-50 rounded-lg px-3 py-2">Negative marking applied: –{(wrong * 0.25).toFixed(2)} points</p>}
      </Card>
      <div className="space-y-3">
        {questions.map((qq, i) => {
          const userAns = answers[i];
          const correct = userAns === qq.ans;
          return (
            <Card key={i} className={`border ${correct ? "border-green-100 bg-green-50/30" : "border-red-100 bg-red-50/30"}`}>
              <div className="flex items-start gap-2 mb-2">
                <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${correct ? "bg-green-500 text-white" : "bg-red-400 text-white"}`}>
                  <Icon name={correct ? "check" : "x"} size={11} />
                </div>
                <p className="text-sm font-medium text-gray-800">{qq.q}</p>
              </div>
              <div className="ml-7 space-y-1">
                <p className="text-xs text-green-700">✓ {qq.opts[qq.ans]}</p>
                {!correct && userAns != null && <p className="text-xs text-red-600">✗ You chose: {qq.opts[userAns]}</p>}
              </div>
            </Card>
          );
        })}
      </div>
      <button onClick={() => { setPhase("home"); setCurrent(0); setAnswers([]); setSelected(null); }}
        className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
        Back to Quizzes
      </button>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all ${i < current ? "bg-blue-500" : i === current ? "bg-blue-300 flex-1" : "bg-gray-200"}`}
              style={{ width: i === current ? 32 : 20 }} />
          ))}
        </div>
        <span className="text-xs text-gray-400">{current + 1} / {questions.length}</span>
      </div>
      <Card>
        <Badge color="gray">{q.topic}</Badge>
        <p className="text-base font-medium text-gray-900 mt-3 mb-5 leading-relaxed">{q.q}</p>
        <div className="space-y-2.5">
          {q.opts.map((opt, i) => {
            let style = "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50";
            if (selected !== null) {
              if (i === q.ans) style = "border-green-400 bg-green-50 text-green-800";
              else if (i === selected && selected !== q.ans) style = "border-red-300 bg-red-50 text-red-800";
              else style = "border-gray-100 text-gray-400";
            }
            return (
              <button key={i} onClick={() => handleAnswer(i)}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${style}`}>
                <span className="font-medium mr-2">{["A", "B", "C", "D"][i]}.</span>{opt}
              </button>
            );
          })}
        </div>
      </Card>
      {negativeMode && <p className="text-xs text-center text-amber-600">Negative marking active · –0.25 per wrong answer</p>}
    </div>
  );
};

// ─── TAB: Doubt Solver ───────────────────────────────────────────────────────
const DoubtTab = () => {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hello! I'm your AI Doubt Solver. Ask me anything about your exam topics, or upload an image of your problem. 📚" }
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
          system: "You are ExamBuddy's AI Doubt Solver for Indian competitive exam students (UPSC, SSC, IBPS, etc). Answer clearly and concisely. Use simple language. Format answers with bullet points when listing. End with a tip or related fact when relevant.",
          messages: [{ role: "user", content: userMsg }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(c => c.text || "").join("") || "Sorry, I couldn't get a response.";
      setMessages(prev => [...prev, { role: "ai", text }]);
    } catch {
      setMessages(prev => [...prev, { role: "ai", text: "Connection error. Please try again." }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[500px]">
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === "user" ? "bg-blue-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"}`}>
              {m.text.split("\n").map((line, li) => <p key={li} className={li > 0 ? "mt-1" : ""}>{line}</p>)}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="pt-3 border-t border-gray-100">
        <div className="flex gap-2">
          <button className="p-2.5 border border-gray-200 rounded-xl text-gray-400 hover:text-blue-500 hover:border-blue-200">
            <Icon name="camera" size={18} />
          </button>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Type your doubt..."
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition-colors" />
          <button onClick={send} disabled={loading}
            className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors">
            <Icon name="send" size={18} />
          </button>
        </div>
        <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
          {["Explain Article 370", "Difference: UPSC vs IAS?", "GDP vs GNP", "What is Preamble?"].map(s => (
            <button key={s} onClick={() => setInput(s)}
              className="flex-shrink-0 px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 transition-colors">
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── TAB: Flashcards ─────────────────────────────────────────────────────────
const FlashcardsTab = () => {
  const [flipped, setFlipped] = useState(false);
  const [index, setIndex] = useState(0);
  const [known, setKnown] = useState([]);
  const [review, setReview] = useState([]);
  const [subject, setSubject] = useState("All");

  const cards = [
    { front: "What is Panchayati Raj?", back: "A system of rural local self-government in India. Introduced by 73rd Constitutional Amendment Act, 1992.", topic: "Polity" },
    { front: "What is the Doctrine of Lapse?", back: "Policy by Lord Dalhousie (1848) allowing the British to annex any princely state if the ruler died without a natural heir.", topic: "History" },
    { front: "What is the Chandrayaan-3 landing site called?", back: "Shiv Shakti Point – announced by PM Modi after India's successful soft landing on the Moon's south pole on Aug 23, 2023.", topic: "Science" },
    { front: "Define GDP", back: "Gross Domestic Product – total monetary value of all goods and services produced within a country's borders in a specific time period.", topic: "Economics" },
    { front: "What are the Fundamental Duties?", back: "Added by 42nd Amendment (1976) under Article 51A. Originally 10 duties, 11th added by 86th Amendment (2002). Listed in Part IV-A.", topic: "Polity" },
  ];

  const card = cards[index];
  const next = (action) => {
    if (action === "known") setKnown(prev => [...prev, index]);
    else setReview(prev => [...prev, index]);
    setFlipped(false);
    setTimeout(() => {
      if (index + 1 < cards.length) setIndex(index + 1);
      else setIndex(0);
    }, 200);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Flashcards</h2>
          <p className="text-xs text-gray-400">{index + 1} of {cards.length} · {known.length} known · {review.length} to review</p>
        </div>
        <UploadZone label="" />
        <button className="p-2 border border-gray-200 rounded-xl text-gray-400 hover:text-blue-500">
          <Icon name="upload" size={18} />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {SUBJECTS.map(s => (
          <button key={s} onClick={() => setSubject(s)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${subject === s ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200"}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Flashcard */}
      <div className="relative" style={{ perspective: "1000px" }}>
        <div onClick={() => setFlipped(!flipped)}
          className="cursor-pointer transition-all duration-500 relative"
          style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)", minHeight: 220 }}>
          {/* Front */}
          <div className="absolute inset-0 bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center"
            style={{ backfaceVisibility: "hidden" }}>
            <Badge color="gray">{card.topic}</Badge>
            <p className="text-lg font-medium text-gray-900 mt-4 leading-relaxed">{card.front}</p>
            <p className="text-xs text-gray-400 mt-4">Tap to reveal answer</p>
          </div>
          {/* Back */}
          <div className="absolute inset-0 bg-blue-600 rounded-2xl p-6 flex flex-col items-center justify-center text-center"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <p className="text-white text-base leading-relaxed">{card.back}</p>
          </div>
        </div>
      </div>

      {flipped && (
        <div className="flex gap-3">
          <button onClick={() => next("review")}
            className="flex-1 py-3 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
            <Icon name="rotate" size={16} /> Review Again
          </button>
          <button onClick={() => next("known")}
            className="flex-1 py-3 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
            <Icon name="check" size={16} /> Got it!
          </button>
        </div>
      )}

      {/* Progress */}
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${((index) / cards.length) * 100}%` }} />
      </div>

      {/* Bookmarked / notes */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Personal Notes</h3>
          <button className="text-xs text-blue-600 flex items-center gap-1"><Icon name="download" size={13} /> Export</button>
        </div>
        <textarea rows={3} placeholder="Add your notes for this card..."
          className="w-full text-sm border border-gray-100 rounded-xl px-3 py-2 text-gray-700 outline-none focus:border-blue-300 resize-none" />
        <div className="flex gap-2 mt-2">
          <button className="text-xs text-gray-400 flex items-center gap-1 hover:text-blue-500"><Icon name="bookmark" size={13} /> Bookmark</button>
          <button className="text-xs text-gray-400 flex items-center gap-1 hover:text-blue-500"><Icon name="share" size={13} /> Share Note</button>
        </div>
      </Card>
    </div>
  );
};

// ─── TAB: Current Affairs ────────────────────────────────────────────────────
const CurrentTab = () => {
  const [lang, setLang] = useState("English");
  const [category, setCategory] = useState("All");

  const news = [
    { title: "India's GDP grows at 8.2% in Q4 FY24, fastest among G20 nations", category: "Economy", time: "2h ago", important: true },
    { title: "PM Modi launches PM-SHRI Yojana for 14,500 schools", category: "Education", time: "4h ago", important: false },
    { title: "India successfully tests Agni-V MIRV missile", category: "Defence", time: "6h ago", important: true },
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
          <h2 className="text-lg font-semibold text-gray-900">Current Affairs</h2>
          <p className="text-xs text-gray-400">June 12, 2026</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {["English", "Hindi", "Gujarati"].map(l => (
            <button key={l} onClick={() => setLang(l)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${lang === l ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {cats.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${category === c ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200"}`}>
            {c}
          </button>
        ))}
      </div>

      {/* MCQ of the day */}
      <Card className="border-blue-100 bg-blue-50/30">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600"><Icon name="star" size={14} /></div>
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Current Affairs MCQ – Today</span>
        </div>
        <p className="text-sm font-medium text-gray-800 mb-3">India's GDP growth rate in Q4 FY24 was closest to:</p>
        {["6.8%", "7.6%", "8.2%", "9.1%"].map((opt, i) => (
          <button key={i}
            className="w-full text-left text-sm px-3 py-2 rounded-lg border border-gray-200 mb-2 hover:border-blue-300 hover:bg-blue-50 transition-all text-gray-700">
            {["A", "B", "C", "D"][i]}. {opt}
          </button>
        ))}
      </Card>

      {/* News list */}
      <div className="space-y-3">
        {filtered.map((n, i) => (
          <Card key={i} className="flex items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge color={n.important ? "red" : "gray"}>{n.category}</Badge>
                {n.important && <Badge color="amber">⭐ Exam Important</Badge>}
              </div>
              <p className="text-sm font-medium text-gray-800 leading-snug">{n.title}</p>
              <p className="text-xs text-gray-400 mt-1">{n.time}</p>
            </div>
            <button className="text-gray-300 hover:text-blue-500 flex-shrink-0 mt-0.5">
              <Icon name="bookmark" size={16} />
            </button>
          </Card>
        ))}
      </div>

      {/* PDF Download */}
      <Card className="flex items-center justify-between bg-gray-50">
        <div>
          <p className="text-sm font-medium text-gray-800">Download Monthly Digest</p>
          <p className="text-xs text-gray-400">June 2026 · PDF · Free</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-medium hover:bg-blue-700 transition-colors">
          <Icon name="download" size={14} /> PDF
        </button>
      </Card>
    </div>
  );
};

// ─── TAB: Leaderboard ────────────────────────────────────────────────────────
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
  const avatarColors = ["bg-blue-100 text-blue-700", "bg-purple-100 text-purple-700", "bg-amber-100 text-amber-700", "bg-blue-600 text-white", "bg-green-100 text-green-700"];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Leaderboard</h2>
        <p className="text-xs text-gray-400">Compete with fellow aspirants</p>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {[["daily", "Today"], ["weekly", "This Week"], ["monthly", "Month"]].map(([v, l]) => (
          <button key={v} onClick={() => setPeriod(v)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${period === v ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>
            {l}
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-100">
        <div className="flex items-end justify-center gap-4 py-4">
          {[users[1], users[0], users[2]].map((u, i) => {
            const heights = [80, 100, 65];
            const realRank = [2, 1, 3];
            return (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className="text-lg">{medals[realRank[i] - 1]}</span>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold ${avatarColors[realRank[i] - 1]}`}>{u.avatar}</div>
                <p className="text-xs font-medium text-gray-700 text-center w-16 truncate">{u.name}</p>
                <div className={`w-12 flex items-end justify-center rounded-t-lg bg-amber-200`} style={{ height: heights[i] }}>
                  <span className="text-xs font-bold text-amber-800 mb-1">#{realRank[i]}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Full list */}
      <div className="space-y-2">
        {users.map((u, i) => (
          <Card key={i} className={`flex items-center gap-3 py-3 ${u.isMe ? "border-blue-200 bg-blue-50/40" : ""}`}>
            <span className="text-sm font-bold text-gray-400 w-6 text-center">#{u.rank}</span>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ${avatarColors[i]}`}>{u.avatar}</div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${u.isMe ? "text-blue-700" : "text-gray-800"}`}>{u.name} {u.isMe && <Badge color="blue">You</Badge>}</p>
              <p className="text-xs text-gray-400">{u.score} pts · 🔥 {u.streak} day streak</p>
            </div>
            {i < 3 && <span className="text-lg">{medals[i]}</span>}
          </Card>
        ))}
      </div>

      {/* Badges */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Badges</h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: "🔥", label: "7-Day Streak", earned: true },
            { icon: "🧠", label: "Quiz Master", earned: true },
            { icon: "📰", label: "News Ninja", earned: false },
            { icon: "🏆", label: "Top 10", earned: false },
          ].map((b, i) => (
            <div key={i} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center ${b.earned ? "border-amber-200 bg-amber-50" : "border-gray-100 bg-gray-50 opacity-50"}`}>
              <span className="text-2xl">{b.icon}</span>
              <p className="text-xs text-gray-600 leading-tight">{b.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── TAB: Marketplace ────────────────────────────────────────────────────────
const MarketplaceTab = () => {
  const [filterType, setFilterType] = useState("All");

  const items = [
    { title: "UPSC Prelims Complete Notes 2024", author: "IAS Mentor", type: "PDF", price: 99, rating: 4.8, downloads: 1240, pages: 340, badge: "Bestseller" },
    { title: "SSC CGL Maths Shortcut Tricks", author: "Rajesh Sir", type: "PDF", price: 49, rating: 4.6, downloads: 890, pages: 120, badge: null },
    { title: "Polity by Laxmikanth – Revision Notes", author: "CivilsPrep", type: "PDF", price: 0, rating: 4.9, downloads: 5200, pages: 80, badge: "Free" },
    { title: "Current Affairs Jan-Jun 2024 Compilation", author: "NewsEdge", type: "PDF", price: 79, rating: 4.5, downloads: 670, pages: 200, badge: "New" },
    { title: "Ancient History Full Course Video Pack", author: "HistoryHero", type: "Course", price: 299, rating: 4.7, downloads: 430, pages: null, badge: "Premium" },
    { title: "Reasoning 500 Practice Questions", author: "LogicBox", type: "PDF", price: 39, rating: 4.4, downloads: 1100, pages: 90, badge: null },
  ];

  const types = ["All", "PDF", "Course", "Test Series"];
  const filtered = filterType === "All" ? items : items.filter(i => i.type === filterType);
  const badgeColors = { Bestseller: "amber", Free: "green", New: "blue", Premium: "purple" };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Marketplace</h2>
        <p className="text-xs text-gray-400">Study materials by toppers & educators</p>
      </div>

      {/* Sell banner */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 text-white flex items-center gap-3">
        <div className="flex-1">
          <p className="font-semibold text-sm">Sell Your Study Material</p>
          <p className="text-xs text-white/80 mt-0.5">Upload PDFs & earn commissions</p>
        </div>
        <button className="flex-shrink-0 px-4 py-2 bg-white text-purple-700 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors">
          Upload
        </button>
      </Card>

      {/* Filter */}
      <div className="flex gap-2">
        {types.map(t => (
          <button key={t} onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${filterType === t ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="space-y-3">
        {filtered.map((item, i) => (
          <Card key={i}>
            <div className="flex items-start gap-3">
              <div className="w-12 h-14 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-400">
                <Icon name={item.type === "Course" ? "eye" : "list"} size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                      {item.badge && <Badge color={badgeColors[item.badge] || "gray"}>{item.badge}</Badge>}
                      <Badge color="gray">{item.type}</Badge>
                    </div>
                    <p className="text-sm font-medium text-gray-900 leading-snug">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">by {item.author} · ⭐ {item.rating} · {item.downloads.toLocaleString()} downloads</p>
                    {item.pages && <p className="text-xs text-gray-400">{item.pages} pages</p>}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
              <span className="text-base font-semibold text-gray-900">
                {item.price === 0 ? <span className="text-green-600">Free</span> : `₹${item.price}`}
              </span>
              <button className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-medium hover:bg-blue-700 transition-colors flex items-center gap-1">
                <Icon name={item.price === 0 ? "download" : "lock"} size={13} />
                {item.price === 0 ? "Download" : "Buy Now"}
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Job alerts */}
      <Card className="border-green-100 bg-green-50/30">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-green-100 rounded-lg text-green-600"><Icon name="bell" size={14} /></div>
          <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Latest Job Notifications</span>
        </div>
        <div className="space-y-2">
          {[
            { title: "UPSC CSE 2025 Notification", date: "Out Now" },
            { title: "SSC CGL 2024 Result", date: "Jun 10" },
            { title: "IBPS PO 2025 Apply", date: "Jul 1" },
          ].map((j, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-b border-green-100 last:border-0">
              <p className="text-xs font-medium text-gray-700">{j.title}</p>
              <Badge color={j.date === "Out Now" ? "green" : "gray"}>{j.date}</Badge>
            </div>
          ))}
        </div>
        <button className="mt-3 text-xs text-blue-600 flex items-center gap-1 hover:underline">
          <Icon name="download" size={12} /> Download Syllabus PDFs
        </button>
      </Card>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
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
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xs font-bold">EB</span>
            </div>
            <span className="font-semibold text-gray-900 text-sm">ExamBuddy</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-gray-400 hover:text-gray-600 relative">
              <Icon name="bell" size={20} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button className="text-gray-400 hover:text-gray-600">
              <Icon name="search" size={20} />
            </button>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-semibold">
              Me
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 pt-5">
        {tabComponents[activeTab]}
      </main>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40">
        <div className="max-w-lg mx-auto px-2">
          <div className="flex">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${activeTab === tab.id ? "text-blue-600" : "text-gray-400 hover:text-gray-600"}`}>
                <Icon name={tab.icon} size={activeTab === tab.id ? 22 : 20} />
                <span className={`text-[10px] font-medium leading-tight ${activeTab === tab.id ? "text-blue-600" : ""}`}>
                  {tab.label.split(" ")[0]}
                </span>
                {activeTab === tab.id && <span className="w-1 h-1 bg-blue-600 rounded-full" />}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}