"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useSearchParams, useRouter } from 'next/navigation';

// 🧠 આ મેઈન ક્વિઝનું લોજિક છે
function QuizContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // હોમ પેજ પરથી સિલેક્ટ કરેલો વિષય વાંચશે (જો કંઈ ન મળે તો બાય-ડિફોલ્ટ 'ગણિત')
  const subject = searchParams.get('subject') || 'ગણિત';

  const [quizzes, setQuizzes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  // 🔄 સુપાબેઝમાંથી માત્ર સિલેક્ટ કરેલા વિષયના જ પ્રશ્નો લાવશે
  useEffect(() => {
    async function loadData() {
      const { data, error } = await supabase
        .from('government_quizzes')
        .select('*')
        .eq('subject', subject);
        
      if (!error) setQuizzes(data || []);
      setLoading(false);
    }
    loadData();
  }, [subject]);

  if (loading) return <div className="text-center p-10 font-bold text-black animate-pulse">પેપર સેટ લોડ થઈ રહ્યો છે... ⏳</div>;
  
  if (quizzes.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-black p-6">
        <div className="text-center max-w-sm bg-white p-6 rounded-3xl shadow-md border border-gray-100">
          <span className="text-4xl">⚠️</span>
          <h3 className="text-xl font-bold mt-4">પ્રશ્નો મળ્યા નથી ભાઈ!</h3>
          <p className="text-gray-400 text-sm mt-2">ડેટાબેઝમાં હજી સુધી "{subject}" વિષયના પ્રશ્નો નથી ઉમેરાયા.</p>
          <button onClick={() => router.push('/')} className="w-full mt-6 bg-black text-white py-3 rounded-xl font-bold">પાછા હોમ પેજ પર જાઓ</button>
        </div>
      </div>
    );
  }

  const current = quizzes[currentIndex];
  const correctOpt = current?.correct_option ? current.correct_option.toLowerCase() : 'a';

  // 🎯 ક્લિક લોજિક (સાચું પડે તો લીલું, ખોટું પડે તો લાલ અને હિસ્ટ્રી સેવ)
  const handleSelect = async (opt) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    setIsAnswered(true);
    
    let isCorrect = opt === correctOpt;
    if (isCorrect) {
      setScore(score + 1);
    }

    // 📊 પ્રોગ્રેસ ચાર્ટ માટે ડેટાબેઝમાં એન્ટ્રી પાડવી
    try {
      await supabase.from('quiz_history').insert([
        {
          quiz_type: subject,
          score: isCorrect ? 1 : 0,
          total_questions: 1
        }
      ]);
    } catch (err) {
      console.error("History save error:", err);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setCurrentIndex(currentIndex + 1);
  };

  // 🏆 રિઝલ્ટ કાર્ડ
  if (currentIndex >= quizzes.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 text-black">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm w-full border border-gray-100">
          <span className="text-5xl">🏆</span>
          <h2 className="text-2xl font-black mt-4 mb-2">ટેસ્ટ પૂરી થઈ ગઈ!</h2>
          <p className="text-sm text-gray-400 mb-4">વિષય: {subject}</p>
          <div className="text-5xl font-black text-blue-600 mb-2">{score} / {quizzes.length}</div>
          <button onClick={() => router.push('/')} className="w-full bg-black text-white py-3 rounded-xl font-bold">બીજી ટેસ્ટ આપો ➔</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-black flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
        <div className="flex justify-between text-xs font-black text-gray-400 mb-4 uppercase tracking-widest border-b pb-3">
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">{current.subject}</span>
          <span>{currentIndex + 1} / {quizzes.length}</span>
        </div>
        
        <h2 className="text-xl font-extrabold mb-6 leading-relaxed text-gray-900">{current.question}</h2>
        
        <div className="space-y-3">
          {['a', 'b', 'c', 'd'].map((opt) => {
            const isCorrect = opt === correctOpt;
            const isSelected = selectedOption === opt;
            let colors = "border-gray-200 text-gray-700 hover:bg-gray-50";
            
            if (isAnswered) {
              if (isCorrect) colors = "bg-green-50 border-green-500 text-green-700 font-bold";
              else if (isSelected) colors = "bg-red-50 border-red-500 text-red-700 font-bold";
              else colors = "opacity-50 border-gray-100 text-gray-400";
            }
            
            return (
              <button key={opt} disabled={isAnswered} onClick={() => handleSelect(opt)} className={`w-full p-4 text-left border rounded-2xl transition-all flex items-center space-x-3 ${colors}`}>
                <span className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-black border uppercase ${isSelected ? 'bg-black text-white' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>{opt}</span>
                <span className="flex-1">{current[opt]}</span>
              </button>
            );
          })}
        </div>
        
        {isAnswered && (
          <div className="mt-6 p-4 bg-amber-50/70 border border-amber-200 rounded-2xl">
            <p className="text-sm text-amber-900 font-medium"><strong>💡 સમજૂતી:</strong> {current.explanation || 'આ પ્રશ્નની કોઈ સમજૂતી ઉપલબ્ધ નથી.'}</p>
            <button onClick={handleNext} className="w-full mt-4 bg-gray-900 hover:bg-gray-800 text-white py-3.5 rounded-xl font-bold transition shadow-md">આગલો પ્રશ્ન ➔</button>
          </div>
        )}
      </div>
    </div>
  );
}

// 🛡️ આ મોસ્ટ ઈમ્પોર્ટન્ટ સ્ટેપ છે: યુઝર સર્ચ પેરામ્સને Suspense બાઉન્ડ્રીમાં રેપ કર્યું જેથી પેલી બ્રાઉઝર એરર સોલ્વ થઈ જાય!
export default function QuizPage() {
  return (
    <Suspense fallback={<div className="text-center p-10 font-bold text-black animate-pulse">પેજ લોડ થઈ રહ્યું છે... ⏳</div>}>
      <QuizContent />
    </Suspense>
  );
}