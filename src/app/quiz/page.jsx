'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';

function QuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = searchParams.get('subject') || 'general_knowledge';

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  // 📥 સુપાબેઝમાંથી પ્રશ્નો લોડ કરવાનું લોજિક
  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('subject_id', subjectId);

      if (data && data.length > 0) {
        setQuestions(data);
      }
      setLoading(false);
    }
    fetchQuestions();
  }, [subjectId]);

  // 🎯 ઓપ્શન સિલેક્ટ થાય ત્યારે
  const handleOptionClick = (optionIndex) => {
    if (selectedOption !== null) return; // એકવાર જવાબ આપ્યા પછી બીજીવાર ક્લિક ન થાય
    setSelectedOption(optionIndex);

    if (optionIndex === questions[currentIdx].correct_option) {
      setScore(score + 1);
    }
  };

  // ➡️ આગલો પ્રશ્ન અથવા ક્વિઝ પૂરી કરવી
  const handleNext = async () => {
    setSelectedOption(null);
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setIsFinished(true);
      
      // 📊 યુઝરનો પ્રોગ્રેસ સેવ કરો (Analytics ટેબલ માટે)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('user_progress').insert([
          {
            user_id: user.id,
            subject_id: subjectId,
            score: score + (selectedOption === questions[currentIdx].correct_option ? 1 : 0),
            total_questions: questions.length
          }
        ]);
      }
    }
  };

  // ⏳ લોડિંગ સ્ટેટ લુક
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '15px' }}>
        <div style={{ width: '45px', height: '45px', border: '4px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ fontWeight: '700', color: '#475569', fontFamily: 'sans-serif' }}>ડેટાબેઝમાંથી પ્રશ્નો લોડ થઈ રહ્યા છે... 🧠</p>
        <style jsx global>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // ⚠️ જો પ્રશ્નો ન મળે તો (Attractive Glass Box)
  if (questions.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
        <div style={{ background: 'white', padding: '40px 30px', borderRadius: '28px', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '50px', marginBottom: '15px' }}>⚠️</div>
          <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#1e293b' }}>પ્રશ્નો મળ્યા નથી ભાઈ!</h3>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px', lineHeight: '1.5' }}>
            ડેટાબેઝમાં હજી સુધી <span style={{ color: '#2563eb', fontWeight: 'bold' }}>"{subjectId}"</span> કેટેગરી માટે પ્રશ્નો અપલોડ કરવામાં આવ્યા નથી.
          </p>
          
          <button 
            onClick={() => router.push('/')} 
            style={{ marginTop: '25px', width: '100%', padding: '14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '750', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)' }}
          >
            🏠 પાછા હોમ પેજ પર જાઓ
          </button>
        </div>
      </div>
    );
  }

  // 🎉 ક્વિઝ પૂરી થયા પછીનું રિઝલ્ટ કાર્ડ
  if (isFinished) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
        <div style={{ background: 'white', padding: '40px 30px', borderRadius: '28px', boxShadow: '0 20px 25px -5px rgba(22, 163, 74, 0.1)', maxWidth: '480px', width: '100%', textAlign: 'center', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: '60px', marginBottom: '15px' }}>🏆</div>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#16a34a' }}>ક્વિઝ પૂરી થઈ ગઈ ભાઈ!</h2>
          <p style={{ color: '#475569', marginTop: '10px', fontSize: '16px' }}>તમારો ફાઇનલ સ્કોર</p>
          
          <div style={{ fontSize: '48px', fontWeight: '900', color: '#1e3a8a', margin: '20px 0' }}>
            {score} / {questions.length}
          </div>

          <button 
            onClick={() => router.push('/')} 
            style={{ width: '100%', padding: '14px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '750', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(22, 163, 74, 0.3)' }}
          >
            ➔ મુખ્ય ડેશબોર્ડ પર જાઓ
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'sans-serif', padding: '40px 20px', color: 'black' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        
        {/* પ્રોગ્રેસ બાર */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ fontWeight: '700', color: '#64748b' }}>પ્રશ્ન {currentIdx + 1} / {questions.length}</span>
          <span style={{ background: '#dbeafe', color: '#2563eb', padding: '4px 12px', borderRadius: '8px', fontSize: '14px', fontWeight: '700' }}>સ્કોર: {score}</span>
        </div>

        <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '30px', overflow: 'hidden' }}>
          <div style={{ width: `${((currentIdx + 1) / questions.length) * 100}%`, height: '100%', background: '#2563eb', transition: 'width 0.3s ease' }}></div>
        </div>

        {/* ❓ પ્રશ્ન કાર્ડ */}
        <div style={{ background: 'white', border: '2px solid #e2e8f0', borderRadius: '24px', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', marginBottom: '25px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', lineHeight: '1.6', color: '#0f172a' }}>
            {currentQ.question_text}
          </h2>
        </div>

        {/* 🎯 ઓપ્શન્સ લિસ્ટ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {currentQ.options && currentQ.options.map((opt, index) => {
            let bg = 'white';
            let border = '2px solid #e2e8f0';
            let color = '#334155';

            if (selectedOption !== null) {
              if (index === currentQ.correct_option) {
                bg = '#dcfce7'; // સાચો જવાબ લીલો થાય
                border = '2px solid #22c55e';
                color = '#15803d';
              } else if (selectedOption === index) {
                bg = '#fee2e2'; // ખોટો જવાબ લાલ થાય
                border = '2px solid #ef4444';
                color = '#b91c1c';
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleOptionClick(index)}
                disabled={selectedOption !== null}
                style={{ width: '100%', padding: '16px 20px', background: bg, border: border, color: color, borderRadius: '16px', fontSize: '16px', fontWeight: '700', textAlign: 'left', cursor: selectedOption === null ? 'pointer' : 'not-allowed', transition: 'all 0.2s', boxSizing: 'border-box' }}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {/* ➡️ આગળ વધવાનું બટન */}
        {selectedOption !== null && (
          <button
            onClick={handleNext}
            style={{ marginTop: '30px', width: '100%', padding: '15px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '16px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
          >
            {currentIdx + 1 === questions.length ? '🏁 રિઝલ્ટ જુઓ' : 'આગલો પ્રશ્ન ➔'}
          </button>
        )}

      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div style={{ color: 'black', textAlign: 'center', padding: '50px' }}>લોડિંગ...</div>}>
      <QuizContent />
    </Suspense>
  );
}