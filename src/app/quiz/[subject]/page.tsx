'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// એડમિન પેનલ અને ડેટાબેઝ સાથે પરફેક્ટ સિંક કરેલું મેપિંગ
const SUBJECT_MAP: Record<string, { dbName: string; displayName: string }> = {
  gujarati_sahitya: { dbName: 'ગુજરાતી સાહિત્ય', displayName: '✍️ ગુજરાતી સાહિત્ય' },
  gujarati_vyakran: { dbName: 'ગુજરાતી વ્યાકરણ', displayName: '📝 ગુજરાતી વ્યાકરણ' },
  maths: { dbName: 'ગણિત', displayName: '🔢 ગણિત' },
  constitution: { dbName: 'ભારતનું બંધારણ', displayName: '📜 ભારતનું બંધારણ' },
  history: { dbName: 'ઇતિહાસ', displayName: '🏛️ ગુજરાતનો ઇતિહાસ' },
  geography: { dbName: 'ભૂગોળ', displayName: '🌍 ભૂગોળ' },
  science: { dbName: 'વિજ્ઞાન', displayName: '🔬 સામાન્ય વિજ્ઞાન' },
  computer: { dbName: 'કમ્પ્યૂટર', displayName: '💻 કમ્પ્યૂટર જ્ઞાન' },
  reasoning: { dbName: 'રીઝનિંગ', displayName: '🧩 રીઝનિંગ' },
  english: { dbName: 'English', displayName: '🔤 English Grammar' },
  law: { dbName: 'કાયદો', displayName: '⚖️ કાયદો' },
  gk: { dbName: 'સામાન્ય જ્ઞાન', displayName: '💡 સામાન્ય જ્ઞાન' },
  current_affairs: { dbName: 'કરંટ અફેર્સ', displayName: '📰 કરંટ અફેર્સ' },
  heritage: { dbName: 'સાંસ્કૃતિક વારસો', displayName: '🏛️ સાંસ્કૃતિક વારસો' },
  economics: { dbName: 'અર્થશાસ્ત્ર', displayName: '📈 અર્થશાસ્ત્ર' },
  pub_ad: { dbName: 'જાહેર વહીવટ', displayName: '🏢 જાહેર વહીવટ' }
};

interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation?: string;
}

type ScreenType = 'setup' | 'quiz' | 'result';

// 1. Pehle interface ko aise update kar (Line 42 ke aas-paas)
interface PageProps {
  params: Promise<{ subject: string }>;
}

// 2. Ab function declaration aur params handling ko aise likh:
export default function QuizPage({ params }: PageProps) {
  const router = useRouter();
  
  // Is line ko dhyan se dekh, ye params ko unlock karegi
  const resolvedParams = use(params); 
  const routeSubject = resolvedParams?.subject || "";

  // Baki subjectConfig wali line waisi hi rahegi
  const subjectConfig = SUBJECT_MAP[routeSubject] || { dbName: routeSubject, displayName: routeSubject };

  const [screen, setScreen] = useState<ScreenType>('setup');
  const [totalMarks, setTotalMarks] = useState(50);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const questionCount = totalMarks;
  const timeSeconds = totalMarks * 60;

  const startQuiz = async () => {
    if (!subjectConfig.dbName) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('subject', subjectConfig.dbName)
        .limit(questionCount);

      if (error) throw error;

      if (!data || data.length === 0) {
        alert(`"${subjectConfig.dbName}" વિષયના પ્રશ્નો હજી ડેટાબેઝમાં નથી ઉમેરાયા! કૃપા કરીને એડમિન પેનલથી ઉમેરો.`);
        return;
      }

      const shuffled = [...data].sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
      setTimeLeft(timeSeconds);
      setCurrent(0);
      setSelected({});
      setScreen('quiz');
    } catch (err) {
      console.error(err);
      alert('ડેટા લોડ કરવામાં કોઈ સમસ્યા આવી!');
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = useCallback(() => setScreen('result'), []);

  useEffect(() => {
    if (screen !== 'quiz') return;
    const t = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) {
          clearInterval(t);
          submitQuiz();
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [screen, submitQuiz]);

  const score = questions.reduce((acc, q, i) =>
    selected[i] === q.correct_answer ? acc + 1 : acc, 0);
  const percent = questions.length ? Math.round((score / questions.length) * 100) : 0;

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');
  const timerColor = timeLeft < 60 ? '#ef4444' : timeLeft < 300 ? '#fbbf24' : '#34d399';

  // 1️⃣ SETUP SCREEN (Premium Dark Mode)
  if (screen === 'setup') return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 max-w-md w-100 text-center shadow-2xl relative z-10">
        <div className="text-5xl mb-4 animate-bounce">📝</div>
        <h1 className="text-3xl font-black text-white mb-2 tracking-wide">
          {subjectConfig.displayName}
        </h1>
        <p className="text-slate-400 mb-8 text-sm font-medium">ટેસ્ટ માટે પ્રશ્નોની સંખ્યા પસંદ કરો</p>

        <div className="flex flex-col gap-3 mb-8">
          {[
            { marks: 50, label: '50 માર્ક્સ', sub: '50 સવાલ • 50 મિનિટ', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' },
            { marks: 100, label: '100 માર્ક્સ', sub: '100 સવાલ • 100 મિનિટ', color: 'border-blue-500/30 text-blue-400 bg-blue-500/5' },
            { marks: 200, label: '200 માર્ક્સ', sub: '200 સવાલ • 200 મિનિટ', color: 'border-violet-500/30 text-violet-400 bg-violet-500/5' },
          ].map(opt => {
            const isSelected = totalMarks === opt.marks;
            return (
              <button key={opt.marks} onClick={() => setTotalMarks(opt.marks)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 ${isSelected ? opt.color + ' border-2 scale-[1.02]' : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700'}`}>
                <div className="font-extrabold text-lg">{opt.label}</div>
                <div className="text-xs text-slate-500 mt-0.5 font-medium">{opt.sub}</div>
              </button>
            );
          })}
        </div>

        <button onClick={startQuiz} disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-black rounded-2xl text-lg shadow-lg shadow-violet-600/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50">
          {loading ? '⏳ પ્રશ્નો આવી રહ્યા છે...' : '🚀 ક્વિઝ શરૂ કરો'}
        </button>

        <button onClick={() => router.push('/')}
          className="w-full mt-3 py-3 border border-slate-800 rounded-2xl text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800/40 transition-all">
          ← મુખ્ય પેજ પર જાઓ
        </button>
      </div>
    </div>
  );

  // 2️⃣ QUIZ SCREEN (Interactive & Beautiful)
  const q = questions[current];
  if (screen === 'quiz' && q) return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans">
      {/* Quiz Header */}
      <div className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="text-sm font-bold bg-slate-800 px-3 py-1.5 rounded-full text-slate-300">
          પ્રશ્ન: {current + 1} / {questions.length}
        </div>
        <div style={{ color: timerColor }} className="bg-slate-950/60 border border-slate-800 rounded-full px-5 py-1.5 font-black text-xl tracking-wider shadow-inner">
          ⏱ {mm}:{ss}
        </div>
        <button onClick={submitQuiz}
          className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all">
          સબમિટ
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-slate-950 w-full">
        <div className="h-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-300" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
      </div>

      {/* Question Card */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 mb-6 shadow-xl relative overflow-hidden">
          <div className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">QUESTION MULTIPLE CHOICE</div>
          <p className="text-lg sm:text-xl font-bold leading-relaxed text-white">{q.question}</p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {['A','B','C','D'].map(opt => {
            const optKey = `option_${opt.toLowerCase()}` as keyof Question;
            const val = q[optKey] as string;
            const isSelected = selected[current] === opt;
            return (
              <button key={opt} 
                onClick={() => { if (!selected[current]) setSelected(p => ({...p, [current]: opt})); setShowExplanation(false); }}
                className={`w-full p-4 sm:p-5 rounded-2xl border text-left flex items-center gap-4 transition-all duration-200 ${isSelected ? 'border-violet-500 bg-violet-600/10 text-white shadow-lg shadow-violet-500/5' : 'border-slate-800/80 bg-slate-900/40 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60'}`}
                style={{ cursor: selected[current] ? 'default' : 'pointer' }}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base flex-shrink-0 transition-all ${isSelected ? 'bg-violet-500 text-white shadow-md' : 'bg-slate-800 text-slate-400'}`}>
                  {opt}
                </div>
                <span className="text-sm sm:text-base font-semibold leading-snug">{val}</span>
              </button>
            );
          })}
        </div>

        {/* Explanation Section */}
        {selected[current] && q.explanation && (
          <div className="mt-6">
            <button onClick={() => setShowExplanation(p => !p)}
              className="w-full py-3 bg-amber-500/5 border border-amber-500/20 rounded-xl text-amber-400 font-bold text-sm hover:bg-amber-500/10 transition-all">
              💡 {showExplanation ? 'સ્પષ્ટીકરણ છુપાવો' : 'જવાબનું સ્પષ્ટીકરણ જુઓ'}
            </button>
            {showExplanation && (
              <div className="mt-2 bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 text-amber-300/90 text-sm leading-relaxed font-medium">
                {q.explanation}
              </div>
            )}
          </div>
        )}

        {/* Navigation Controls */}
        <div className="flex gap-4 mt-8">
          <button onClick={() => { setCurrent(p => Math.max(0, p-1)); setShowExplanation(false); }} disabled={current === 0}
            className="flex-1 py-4 border border-slate-800 rounded-2xl bg-slate-900/20 text-slate-400 font-bold hover:text-white hover:border-slate-700 transition-all disabled:opacity-20 disabled:cursor-not-allowed">
            ← પાછળ
          </button>
          {current < questions.length - 1 ? (
            <button onClick={() => { setCurrent(p => p+1); setShowExplanation(false); }}
              className="flex-[2] py-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-black rounded-2xl tracking-wide hover:opacity-90 transition-all shadow-lg shadow-violet-600/10">
              આગળ વધીએ →
            </button>
          ) : (
            <button onClick={submitQuiz}
              className="flex-[2] py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black rounded-2xl tracking-wide hover:opacity-90 transition-all shadow-lg shadow-emerald-600/10">
              ✅ ટેસ્ટ પૂરો કરો
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // 3️⃣ RESULT SCREEN (Victory Dashboard)
  if (screen === 'result') return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 max-w-md w-100 text-center shadow-2xl relative z-10">
        <div className="text-6xl mb-4">
          {percent >= 80 ? '🏆' : percent >= 60 ? '😎' : percent >= 40 ? '📚' : '💪'}
        </div>
        <h2 className="text-3xl font-black text-white mb-1">
          {percent >= 80 ? 'અદભુત પ્રદર્શન!' : percent >= 60 ? 'ખૂબ સરસ!' : percent >= 40 ? 'હજી સુધારો થઈ શકે' : 'ખૂબ મહેનતની જરૂર છે'}
        </h2>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">QUIZ SCORE REPORT</p>

        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl py-6 px-4 mb-6 shadow-inner">
          <div className={`text-6xl font-black ${percent >= 60 ? 'text-emerald-400' : 'text-red-400'}`}>
            {score} <span className="text-2xl text-slate-600">/ {questions.length}</span>
          </div>
          <div className="text-sm font-bold text-slate-400 mt-2">{percent}% ગુણ મેળવ્યા</div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3.5">
            <div className="text-2xl font-black text-emerald-400">{score}</div>
            <div className="text-xs font-bold text-slate-500 mt-0.5">✅ સાચા જવાબ</div>
          </div>
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3.5">
            <div className="text-2xl font-black text-red-400">{questions.length - score}</div>
            <div className="text-xs font-bold text-slate-500 mt-0.5">❌ ખોટા જવાબ</div>
          </div>
        </div>

        <button onClick={() => setScreen('setup')}
          className="w-full py-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-black rounded-xl hover:opacity-90 transition-all shadow-md">
          🔄 નવો ટેસ્ટ શરૂ કરો
        </button>
        <button onClick={() => router.push('/')}
          className="w-full mt-3 py-3 border border-slate-800 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800/40 transition-all">
          ← મુખ્ય ડેશબોર્ડ
        </button>
      </div>
    </div>
  );

  return null;
}