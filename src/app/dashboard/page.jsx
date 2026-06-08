'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('ai-mission');
  const [uploading, setUploading] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [scoreHistory, setScoreHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Phase 2 States
  const [currentAffairs, setCurrentAffairs] = useState(null);
  const [loadingCA, setLoadingCA] = useState(true);
  const [isCATest, setIsCATest] = useState(false);

  // Fetch History & Today's News
  useEffect(() => {
    async function fetchInitialData() {
      try {
        setLoadingHistory(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('user_scores')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          if (data) setScoreHistory(data);
        }
      } catch (err) {
        console.error("History Error:", err);
      } finally {
        setLoadingHistory(false);
      }
    }

    async function fetchTodayNews() {
      try {
        setLoadingCA(true);
        const todayStr = new Date().toISOString().split('T')[0];
        
        const { data, error } = await supabase
          .from('daily_current_affairs')
          .select('*')
          .eq('news_date', todayStr)
          .single();

        if (data) {
          setCurrentAffairs(data);
        } else {
          setCurrentAffairs(null);
        }
      } catch (err) {
        console.error("CA Fetch Error:", err);
        setCurrentAffairs(null); // એરર આવે તો પણ નલ સેટ કરો જેથી ક્રેશ ન થાય
      } finally {
        setLoadingCA(false);
      }
    }

    fetchInitialData();
    fetchTodayNews();
  }, []);

  // AI Mission Upload Handler
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setQuizQuestions([]);
      setCurrentQuestionIndex(0);
      setScore(0);
      setQuizFinished(false);
      setIsCATest(false);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('study-materials')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textContent: `કન્ટેન્ટ આઈડી: ${fileName}` }),
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || 'AI Server Error');

      if (resData.questions && resData.questions.length > 0) {
        setQuizQuestions(resData.questions);
      } else {
        alert('AI પ્રશ્નો બનાવી શક્યું નહીં, ફરી ટ્રાય કરો.');
      }
    } catch (error) {
      alert('ભૂલ આવી: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Start CA Test
  const startCurrentAffairsTest = () => {
    if (currentAffairs && currentAffairs.quiz_questions && currentAffairs.quiz_questions.length > 0) {
      setQuizQuestions(currentAffairs.quiz_questions);
      setCurrentQuestionIndex(0);
      setScore(0);
      setQuizFinished(false);
      setIsCATest(true);
    } else {
      alert("આજના ટેસ્ટના પ્રશ્નો તૈયાર નથી બડી!");
    }
  };

  // Handle Answer & Save Result
  const handleAnswer = async (selectedOption) => {
    const isCorrect = selectedOption === quizQuestions[currentQuestionIndex]?.correct_option;
    let newScore = score;
    if (isCorrect) {
      newScore = score + 1;
      setScore(newScore);
    }

    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < quizQuestions.length) {
      setCurrentQuestionIndex(nextIndex);
    } else {
      setQuizFinished(true);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const finalTopic = isCATest ? 'Current Affairs' : (quizQuestions[0]?.topic || 'AI Quiz');
          
          const { error: insertError } = await supabase.from('user_scores').insert({
            user_id: user.id,
            score: newScore,
            total_questions: quizQuestions.length,
            topic: finalTopic
          });

          if (insertError) throw insertError;

          const { data: freshHistory } = await supabase
            .from('user_scores')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          if (freshHistory) setScoreHistory(freshHistory);
        }
      } catch (err) {
        console.error("Score Save Error:", err);
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <Navbar />

      {/* Tabs */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '0 20px' }}>
        <div style={{ display: 'flex', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
          <button 
            onClick={() => { setActiveTab('ai-mission'); setQuizQuestions([]); setQuizFinished(false); }} 
            style={{ padding: '16px 0', fontSize: '16px', fontWeight: '600', color: activeTab === 'ai-mission' ? '#4f46e5' : '#64748b', border: 'none', borderBottom: activeTab === 'ai-mission' ? '3px solid #4f46e5' : '3px solid transparent', background: 'none', cursor: 'pointer' }}
          >
            🎯 AI Mission
          </button>
          <button 
            onClick={() => { setActiveTab('current-affairs'); setQuizQuestions([]); setQuizFinished(false); }} 
            style={{ padding: '16px 0', fontSize: '16px', fontWeight: '600', color: activeTab === 'current-affairs' ? '#4f46e5' : '#64748b', border: 'none', borderBottom: activeTab === 'current-affairs' ? '3px solid #4f46e5' : '3px solid transparent', background: 'none', cursor: 'pointer' }}
          >
            📰 કરંટ અફેર્સ
          </button>
          <button 
            onClick={() => setActiveTab('my-progress')} 
            style={{ padding: '16px 0', fontSize: '16px', fontWeight: '600', color: activeTab === 'my-progress' ? '#4f46e5' : '#64748b', border: 'none', borderBottom: activeTab === 'my-progress' ? '3px solid #4f46e5' : '3px solid transparent', background: 'none', cursor: 'pointer' }}
          >
            📊 માય પ્રોગ્રેસ
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
        
        {/* QUIZ VIEW */}
        {quizQuestions && quizQuestions.length > 0 && !quizFinished ? (
          <div style={{ maxWidth: '700px', margin: '0 auto', background: '#ffffff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontWeight: '600', marginBottom: '20px' }}>
              <span>📝 પ્રશ્ન: {currentQuestionIndex + 1} / {quizQuestions.length}</span>
              <span>🥇 સ્કોર: {score}</span>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '25px' }}>{quizQuestions[currentQuestionIndex]?.question}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['a', 'b', 'c', 'd'].map((option) => (
                <button key={option} onClick={() => handleAnswer(option)} style={{ width: '100%', padding: '16px', textAlign: 'left', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '16px', fontWeight: '500', cursor: 'pointer' }}>
                  <strong style={{ marginRight: '10px', color: '#4f46e5' }}>{option.toUpperCase()}</strong> {quizQuestions[currentQuestionIndex]?.[option]}
                </button>
              ))}
            </div>
          </div>
        ) : quizFinished ? (
          <div style={{ maxWidth: '600px', margin: '0 auto', background: '#ffffff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <span style={{ fontSize: '50px' }}>🎉</span>
            <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>મિશન પૂરું થયું બડી!</h2>
            <p style={{ fontSize: '18px', color: '#ef4444', fontWeight: '700', margin: '15px 0' }}>તમારો સ્કોર: {score} / {quizQuestions.length}</p>
            <button onClick={() => { setQuizQuestions([]); setQuizFinished(false); }} style={{ padding: '12px 24px', background: '#4f46e5', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
              🔄 મુખ્ય સ્ક્રીન પર જાઓ
            </button>
          </div>
        ) : (
          /* TABS CONTAINER */
          <div>
            {activeTab === 'ai-mission' && (
              <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>AI ક્વિઝ હેક મિશન 🤖</h1>
                <p style={{ color: '#64748b', marginBottom: '30px' }}>મટીરીયલ PDF અથવા ફોટો અપલોડ કરીને લાઈવ ટેસ્ટ આપો!</p>
                <div style={{ border: '2px dashed #cbd5e1', padding: '40px', borderRadius: '16px', background: '#ffffff' }}>
                  <input type="file" accept="application/pdf,image/*" onChange={handleFileUpload} id="file-upload" style={{ display: 'none' }} disabled={uploading} />
                  <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'block' }}>
                    <span style={{ fontSize: '48px', display: 'block', marginBottom: '15px' }}>{uploading ? '⏳' : '📁'}</span>
                    <span style={{ fontSize: '16px', fontWeight: '600', color: '#334155' }}>
                      {uploading ? 'AI ક્વિઝ સેટ થઈ રહી છે...' : 'ફાઇલ અથવા ફોટો અપલોડ કરો'}
                    </span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'current-affairs' && (
              <div style={{ padding: '24px', background: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', maxWidth: '650px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '20px', color: '#0f172a' }}>📰 આજના મુખ્ય સમાચાર (Exam Facts)</h2>
                {loadingCA ? (
                  <div style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>⏳ લોડિંગ થઈ રહ્યું છે...</div>
                ) : currentAffairs && currentAffairs.bullet_points ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {currentAffairs.bullet_points.map((point, index) => (
                      <div key={index} style={{ fontSize: '16px', color: '#334155', lineHeight: '1.6', background: '#f8fafc', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #3b82f6', fontWeight: '500' }}>
                        {point}
                      </div>
                    ))}
                    <button onClick={startCurrentAffairsTest} style={{ marginTop: '20px', width: '100%', padding: '14px', background: 'linear-gradient(135deg, #4f46e5, #3b82f6)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
                      🎯 આજના સમાચારની લાઈવ ટેસ્ટ આપો
                    </button>
                  </div>
                ) : (
                  <div style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
                    ❌ આજના સમાચાર હજુ લોક થયા નથી. કૃપા કરીને બેકએન્ડ રૂટ રન કરો!
                  </div>
                )}
              </div>
            )}

            {activeTab === 'my-progress' && (
              <div style={{ maxWidth: '600px', margin: '0 auto', background: '#ffffff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '20px' }}>📊 તમારી ટેસ્ટ હિસ્ટ્રી</h2>
                {loadingHistory ? (
                  <p style={{ color: '#64748b' }}>સ્કોર લોડ થઈ રહ્યો છે...</p>
                ) : !scoreHistory || scoreHistory.length === 0 ? (
                  <p style={{ color: '#64748b' }}>હજુ સુધી કોઈ ટેસ્ટ આપી નથી બડી!</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {scoreHistory.map((item) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <div>
                          <p style={{ fontWeight: '600', color: '#0f172a', margin: 0 }}>🎯 {item.topic}</p>
                          <small style={{ color: '#94a3b8' }}>{item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}</small>
                        </div>
                        <span style={{ background: '#dcfce7', color: '#15803d', padding: '6px 12px', borderRadius: '20px', fontWeight: '700', fontSize: '14px' }}>
                          {item.score} / {item.total_questions}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}