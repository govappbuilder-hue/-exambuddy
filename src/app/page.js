"use client";

import Link from "next/link";

const EXAMS_DATA = [
  {
    id: "exam_1",
    examName: "👑 GPSC Class 1 and 2",
    description: "Gujarat Public Service Commission Recruitment Exams",
    subjects: [
      { id: "sub_1", name: "🏛️ ઇતિહાસ", slug: "history" },
      { id: "sub_2", name: "🌍 ભૂગોળ", slug: "geography" },
      { id: "sub_4", name: "📈 અર્થશાસ્ત્ર", slug: "economics" },
      { id: "sub_5", name: "🏛️ સાંસ્કૃતિક વારસો", slug: "heritage" },
    ],
  },
  {
    id: "exam_2",
    examName: "📝 GSSSB Class 3 CCE",
    description: "Gujarat Subordinate Services Selection Board Exams",
    subjects: [
      { id: "sub_6", name: "🔢 ગણિત", slug: "maths" },
      { id: "sub_7", name: "🧩 રીઝનિંગ", slug: "reasoning" },
      { id: "sub_8", name: "✍️ ગુજરાતી સાહિત્ય", slug: "gujarati_sahitya" },
      { id: "sub_8_v", name: "📝 ગુજરાતી વ્યાકરણ", slug: "gujarati_vyakran" },
      { id: "sub_9", name: "🔤 English Grammar", slug: "english" },
      { id: "sub_10", name: "🏢 જાહેર વહીવટ", slug: "pub_ad" },
    ],
  },
  {
    id: "exam_3",
    examName: "👮 Police Bharti",
    description: "Gujarat Police Force Recruitment Examinations",
    subjects: [
      { id: "sub_11", name: "⚖️ કાયદો", slug: "law" },
      { id: "sub_12", name: "💡 સામાન્ય જ્ઞાન", slug: "gk" },
      { id: "sub_13", name: "📰 કરંટ અફેર્સ", slug: "current_affairs" },
      { id: "sub_14", name: "🔬 વિજ્ઞાન", slug: "science" },
      { id: "sub_15", name: "💻 કમ્પ્યૂટર", slug: "computer" },
    ],
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-violet-500 selection:text-white">
      {/* Glow effects */}
      <div className="absolute top-0 left-1/4 w-96 height-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 height-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="max-w-5xl mx-auto text-center mb-16 relative z-10">
        <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-4 inline-block">
          🚀 Welcome to the Future of Learning
        </span>
        <h1 className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 mb-4 tracking-tight drop-shadow-sm">
          ExamBuddy <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">Quiz</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto font-medium">
          તમારી સરકારી નોકરીની તૈયારીને બનાવો વધુ સચોટ અને આકર્ષક. તમારા મનપસંદ વિષયની ક્વિઝ આપો.
        </p>
        
        {/* Admin Link shortcut */}
        <Link href="/admin" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-violet-400 transition-colors">
          ⚙️ એડમિન પેનલ પર જાઓ
        </Link>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto space-y-10 relative z-10">
        {EXAMS_DATA.map((exam) => (
          <div key={exam.id} className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-800/80 p-6 sm:p-8 shadow-2xl transition-all duration-300 hover:border-slate-700/60">
            <div className="border-b border-slate-800/60 pb-5 mb-6">
              <h2 className="text-2xl font-extrabold text-white tracking-wide">
                {exam.examName}
              </h2>
              <p className="text-sm text-slate-400 mt-1 font-medium">{exam.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {exam.subjects && exam.subjects.map((subject) => (
                <Link
                  key={subject.id}
                  href={`/quiz/${subject.slug}`}
                  className="group relative flex flex-col justify-between p-5 bg-slate-950/40 hover:bg-gradient-to-br hover:from-violet-600/[0.15] hover:to-blue-600/[0.15] border border-slate-800 hover:border-violet-500/50 rounded-2xl text-left transition-all duration-300 shadow-lg hover:-translate-y-1"
                >
                  <div>
                    <h3 className="font-bold text-slate-200 group-hover:text-white transition-colors text-lg tracking-wide">
                      {subject.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider font-bold">
                      ID: {subject.slug}
                    </p>
                  </div>
                  <div className="mt-5 flex items-center text-sm font-extrabold text-violet-400 group-hover:text-violet-300">
                    શરૂ કરો 
                    <span className="transform group-hover:translate-x-1.5 transition-transform ml-1.5">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}