"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

function CurrentAffairsContent() {
  const router = useRouter();
  const [videoData, setVideoData] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // 1. સૌથી લેટેસ્ટ AI વીડિયો લાવશે
      const { data: videoRes } = await supabase
        .from('daily_news_videos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (videoRes && videoRes.length > 0) {
        setVideoData(videoRes[0]);
      }

      // 2. કરંટ અફેર્સની ક્વિઝ લોડ કરશે
      const { data: quizRes } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('subject', 'current_affairs')
        .order('created_at', { ascending: false });

      if (quizRes) setQuizzes(quizRes);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleSelect = (opt) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    setIsAnswered(true);
    const correctOpt = quizzes[currentIndex]?.correct_option?.toLowerCase() || 'a';
    if (opt === correctOpt) setScore(score + 1);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setCurrentIndex(currentIndex + 1);
  };

  if (loading) return <div className="text-center p-10 font-bold text-black animate-pulse">AI અવતાર ક્લાસ લોડ થઈ રહ્યો છે... 🎬</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-black p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* બેક બટન અને ટાઇટલ */}
        <div className="flex items-center space-x-4">
          <button onClick={() => router.push('/')} className="bg-white p-2.5 rounded-xl border shadow-sm font-bold text-sm">← હોમ</button>
          <div>
            <h1 className="text-2xl font-black text-slate-950">🎙️ AI દૈનિક કરંટ અફેર્સ ક્લાસ</h1>
            <p className="text-xs text-slate-400 font-medium">રોજ સવારે AI કેરેક્ટર દ્વારા ન્યૂઝ વિશ્લેષણ</p>
          </div>
        </div>

        {/* 🎬 સેક્શન ૧: AI કેરેક્ટર વીડિયો પ્લેયર */}
        <div className="bg-white border p-4 rounded-3xl shadow-xl border-slate-100">
          <h3 className="text-md font-extrabold mb-3 text-slate-800 flex items-center gap-2">
            <span className="animate-ping inline-block w-2 h-2 rounded-full bg-red-500"></span>
            આજનો વીડિયો લેક્ચર: {videoData?.title || 'Daily Current Affairs analysis'}
          </h3>
          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner border">
            {videoData?.video_url ? (
              <video 
                src={videoData.video_url} 
                controls 
                className="w-full h-full object-cover"
                poster="https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?q=80&w=1000"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-6 text-center">
                <span className="text-4xl mb-2">🤖</span>
                <p className="text-sm font-bold">આજનો AI કેરેક્ટર લેક્ચર તૈયાર થઈ રહ્યો છે.</p>
                <p className="text-xs text-slate-400 mt-1">ત્યાં સુધી નીચે આપેલા આજના સમાચારના પ્રશ્નો સોલ્વ કરો ભાઈ!</p>
              </div>
            )}
          </div>
        </div>

        {/* ✍️ સેક્શન ૨: લાઈવ ટેસ્ટ મેચિંગ */}
        <div className="bg-white border p-6 rounded-3xl shadow-xl border-slate-100">
          <div className="border-b pb-3 mb-4 flex justify-between items-center">
            <h3 className="font-black text-lg text-slate-900">📝 વિડીયો આધારિત ટેસ્ટ</h3>
            <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold">
              {quizzes.length > 0 ? `${currentIndex + 1} / ${quizzes.length}` : '0/0'}
            </span>
          </div>

          {quizzes.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm">આ વિષયમાં હજી કોઈ પ્રશ્નો નથી ઉમેરાયા ભાઈ.</div>
          ) : currentIndex >= quizzes.length ? (
            <div className="text-center py-8 space-y-4">
              <span className="text-4xl">🏆</span>
              <h2 className="text-xl font-black">લેક્ચર ટેસ્ટ પૂરી થઈ!</h2>
              <div className="text-4xl font-black text-blue-600">{score} / {quizzes.length}</div>
              <p className="text-xs text-slate-400">તમારો સ્કોર પ્રોગ્રેસ ગ્રાફમાં સેવ થઈ ગયો છે.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <h4 className="font-extrabold text-md text-slate-900 leading-relaxed">{quizzes[currentIndex].question}</h4>
              <div className="grid grid-cols-1 gap-3">
                {['a', 'b', 'c', 'd'].map((opt) => {
                  const isCorrect = opt === quizzes[currentIndex]?.correct_option?.toLowerCase();
                  const isSelected = selectedOption === opt;
                  let colors = "border-slate-200 text-slate-700 hover:bg-slate-50";

                  if (isAnswered) {
                    if (isCorrect) colors = "bg-green-50 border-green-500 text-green-700 font-bold";
                    else if (isSelected) colors = "bg-red-50 border-red-500 text-red-700 font-bold";
                    else colors = "opacity-40 border-slate-100 text-slate-400";
                  }

                  return (
                    <button 
                      key={opt} 
                      disabled={isAnswered} 
                      onClick={() => handleSelect(opt)} 
                      className={`p-4 text-left border rounded-xl text-sm transition-all flex items-center space-x-3 ${colors}`}
                    >
                      <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-xs font-black uppercase border ${isSelected ? 'bg-black text-white' : 'bg-slate-100 text-slate-500'}`}>{opt}</span>
                      <span>{quizzes[currentIndex][`option_${opt}`] || quizzes[currentIndex][opt]}</span>
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                  <p className="text-xs text-amber-900 leading-relaxed"><strong>💡 સમજૂતી:</strong> {quizzes[currentIndex].explanation || 'કોઈ સમજૂતી નથી.'}</p>
                  <button onClick={handleNext} className="w-full bg-slate-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-slate-800 transition">આગલો પ્રશ્ન ➔</button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function CurrentAffairsPage() {
  return (
    <Suspense fallback={<div className="text-center p-10 font-bold">લોડિંગ... ⏳</div>}>
      <CurrentAffairsContent />
    </Suspense>
  );
}