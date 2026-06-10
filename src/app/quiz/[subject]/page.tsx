'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

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
  pub_ad: { dbName: 'જાहेर વહીવટ', displayName: '🏢 જાહેર વહીવટ' }
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

interface PageProps {
  params: any;
}

export default function QuizPage({ params }: PageProps) {
  const router = useRouter();
  
  const [routeSubject, setRouteSubject] = useState<string>("");
  const [isParamsReady, setIsParamsReady] = useState(false); // નવું પ્રોટેક્શન સ્ટેટ
  const [screen, setScreen] = useState<ScreenType>('setup');
  const [totalMarks, setTotalMarks] = useState(50);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);

  // URL Params ને સેફલી લોડ કરવાનો ૧૦૦% સાચો રસ્તો
  useEffect(() => {
    if (params) {
      Promise.resolve(params)
        .then((res) => {
          if (res && res.subject) {
            setRouteSubject(res.subject);
          }
          setIsParamsReady(true); // ડેટા મળી ગયો એટલે સિગ્નલ ગ્રીન
        })
        .catch((err) => {
          console.error(err);
          setIsParamsReady(true);
        });
    } else {
      setIsParamsReady(true);
    }
  }, [params]);

  const subjectConfig = SUBJECT_MAP[routeSubject] || { dbName: routeSubject, displayName: routeSubject };
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
        alert(`"${subjectConfig.dbName}" વિષયના પ્રશ્નો મળ્યા નથી!`);
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
      alert('ડેટા લોડ કરવામાં ભૂલ આવી!');
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

  const correctCount = questions.reduce((acc, q, i) => selected[i] === q.correct_answer ? acc + 1 : acc, 0);
  const attemptedCount = Object.keys(selected).length;
  const wrongCount = attemptedCount - correctCount;
  const negativeMarks = wrongCount * 0.25;
  const finalScore = parseFloat((correctCount - negativeMarks).toFixed(2));

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');
  const timerColor = timeLeft < 60 ? '#ef4444' : timeLeft < 300 ? '#fbbf24' : '#34d399';

  // જ્યાં સુધી URL ના ડેટા ન લોડ થાય ત્યાં સુધી બ્લેન્ક નહિ પણ મસ્ત લોડિંગ સ્ક્રીન દેખાશે
  if (!isParamsReady) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-slate-100 flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-bold">વિષય લોડ થઈ રહ્યો છે...</p>
        </div>
      </div>
    );
  }

  // 1️⃣ SETUP SCREEN
  if (screen === 'setup') return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 max-w-md w-100 text-center shadow-2xl relative z-10">
        <div className="text-5xl mb-4 animate-bounce">📝</div>
        <h1 className="text-3xl font-black text-white mb-2 tracking-wide">{subjectConfig.displayName}</h1>
        <p className="text-slate-400 mb-8 text-sm font-medium">ટેસ્ટ માટે પ્રશ્નોની સંખ્યા પસંદ કરો</p>

        <div className="flex flex-col gap-3 mb-8">
          {[
            { marks: 50, label: '50 માર્ક્સ', sub: '50 સવાલ • 50 મિનิต (0.25 નેગેટિવ)', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' },
            { marks: 100, label: '100 માર્ક્સ', sub: '100 સવાલ • 100 મિનિટ (0.25 નેગેટિવ)', color: 'border-blue-500/30 text-blue-400 bg-blue-500/5' },
            { marks: 200, label: '200 માર્ક્સ', sub: '200 સવાલ • 200 મિનિટ (0.25 નેગેટિવ)', color: 'border-violet-500/30 text-violet-400 bg-violet-500/5' },
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
          className="w-full py-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-black rounded-2xl text-lg shadow-lg hover:opacity-90 transition-all disabled:opacity-50">
          {loading ? '⏳ લોડ થઈ રહ્યું છે...' : '🚀 ક્વિઝ શરૂ કરો'}
        </button>
        <button onClick={() => router.push('/')}
          className="w-full mt-3 py-3 border border-slate-800 rounded-2xl text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800/40 transition-all">
          ← મુખ્ય પેજ
        </button>
      </div>
    </div>
  );

  // 2️⃣ QUIZ SCREEN
  const q = questions[current];
  const hasAnswered = selected[current] !== undefined;

  if (screen === 'quiz' && q) return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans">
      <div className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="text-sm font-bold bg-slate-800 px-3 py-1.5 rounded-full text-slate-300">
          પ્રશ્ન: {current + 1} / {questions.length}
        </div>
        <div style={{ color: timerColor }} className="bg-slate-950/60 border border-slate-800 rounded-full px-5 py-1.5 font-black text-xl tracking-wider">
          ⏱ {mm}:{ss}
        </div>
        <button onClick={submitQuiz}
          className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 px-4 py-2 rounded-xl text-xs font-black transition-all">
          સબમિટ
        </button>
      </div>

      <div className="h-1.5 bg-slate-950 w-full">
        <div className="h-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-300" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 mb-6 shadow-xl">
          <div className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">CCE / GPSC LEVEL MCQ</div>
          <p className="text-lg sm:text-xl font-bold leading-relaxed text-white">{q.question}</p>
        </div>

        <div className="space-y-3">
          {['A','B','C','D'].map(opt => {
            const optKey = `option_${opt.toLowerCase()}` as keyof Question;
            const val = q[optKey] as string;
            
            const isCurrentSelection = selected[current] === opt;
            const isCorrectAnswer = q.correct_answer === opt;

            let buttonStyle = "border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-700";
            let badgeStyle = "bg-slate-800 text-slate-400";

            if (hasAnswered) {
              if (isCorrectAnswer) {
                buttonStyle = "border-emerald-500 bg-emerald-500/20 text-emerald-200 font-bold shadow-lg";
                badgeStyle = "bg-emerald-500 text-white";
              } else if (isCurrentSelection) {
                buttonStyle = "border-red-500 bg-red-500/20 text-red-200 font-bold shadow-lg";
                badgeStyle = "bg-red-500 text-white";
              } else {
                buttonStyle = "border-slate-900 bg-slate-900/10 text-slate-500 opacity-60";
              }
            }

            return (
              <button key={opt} 
                onClick={() => { if (!hasAnswered) setSelected(p => ({...p, [current]: opt})); }}
                disabled={hasAnswered}
                className={`w-full p-4 sm:p-5 rounded-2xl border text-left flex items-center gap-4 transition-all duration-200 ${buttonStyle}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base flex-shrink-0 ${badgeStyle}`}>
                  {opt}
                </div>
                <span className="text-sm sm:text-base font-semibold">{val}</span>
              </button>
            );
          })}
        </div>

        {hasAnswered && q.explanation && (
          <div className="mt-6 bg-slate-900/40 border border-amber-500/20 rounded-2xl p-5 shadow-lg">
            <div className="text-amber-400 font-black text-sm flex items-center gap-2 mb-2">
              💡 જવાબનું સ્પષ્ટીકરણ (Explanation):
            </div>
            <div className="text-slate-300 text-sm leading-relaxed font-medium">
              {q.explanation}
            </div>
          </div>
        )}

        <div className="flex gap-4 mt-8">
          <button onClick={() => setCurrent(p => Math.max(0, p-1))} disabled={current === 0}
            className="flex-1 py-4 border border-slate-800 rounded-2xl bg-slate-900/20 text-slate-400 font-bold hover:text-white hover:border-slate-700 transition-all disabled:opacity-20">
            ← પાછળ
          </button>
          {current < questions.length - 1 ? (
            <button onClick={() => setCurrent(p => p+1)}
              className="flex-[2] py-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-black rounded-2xl hover:opacity-90 transition-all shadow-lg">
              આગળ વધીએ →
            </button>
          ) : (
            <button onClick={submitQuiz}
              className="flex-[2] py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black rounded-2xl hover:opacity-90 transition-all shadow-lg">
              ✅ ટેસ્ટ પૂરો કરો
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // 3️⃣ RESULT SCREEN
  if (screen === 'result') return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 max-w-md w-100 text-center shadow-2xl relative z-10">
        <div className="text-6xl mb-4">
          {finalScore >= (questions.length * 0.7) ? '🏆' : finalScore >= (questions.length * 0.4) ? '😎' : '💪'}
        </div>
        <h2 className="text-3xl font-black text-white mb-1">પરીક્ષાનું પરિણામ</h2>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">OFFICIAL SCORECARD</p>

        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl py-6 px-4 mb-6 shadow-inner">
          <div className={`text-5xl font-black ${finalScore >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {finalScore} <span className="text-xl text-slate-600">/ {questions.length}</span>
          </div>
          <div className="text-sm font-bold text-slate-400 mt-2">મેરિટ ગુણ (Final Merit Marks)</div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
            <div className="text-xl font-black text-emerald-400">{correctCount}</div>
            <div className="text-[11px] font-bold text-slate-500 mt-0.5">✅ સાચા પ્રશ્નો (+{correctCount})</div>
          </div>
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3">
            <div className="text-xl font-black text-red-400">{wrongCount}</div>
            <div className="text-[11px] font-bold text-slate-500 mt-0.5">❌ ખોટા પ્રશ્નો (-{wrongCount * 0.25})</div>
          </div>
        </div>

        <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3 mb-6 text-left text-xs text-slate-400 space-y-1">
          <div>• કુલ પ્રશ્નો: <span className="text-white font-bold">{questions.length}</span></div>
          <div>• ટીક કરેલા પ્રશ્નો (Attempted): <span className="text-white font-bold">{attemptedCount}</span></div>
          <div>• બાકી છોડેલા પ્રશ્નો (Left): <span className="text-white font-bold">{questions.length - attemptedCount}</span></div>
        </div>

        <button onClick={() => setScreen('setup')}
          className="w-full py-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-black rounded-xl hover:opacity-90 transition-all shadow-md">
          🔄 નવો મોક ટેસ્ટ આપો
        </button>
        <button onClick={() => router.push('/')}
          className="w-full mt-3 py-3 border border-slate-800 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800/40 transition-all">
          ← મુખ્ય ડૅશબોર્ડ પર જાઓ
        </button>
      </div>
    </div>
  );

  return null;
}