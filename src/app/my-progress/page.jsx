"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function MyProgressPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      const { data } = await supabase.from('quiz_history').select('*').order('created_at', { ascending: false });
      setHistory(data || []);
      setLoading(false);
    }
    fetchHistory();
  }, []);

  if (loading) return <div className="p-10 text-center text-black font-bold">ડેટા લોડ થઈ રહ્યો છે...</div>;

  const totalTests = history.length;
  const totalCorrect = history.reduce((acc, curr) => acc + (curr.score || 0), 0);
  const totalQuestions = history.reduce((acc, curr) => acc + (curr.total_questions || 1), 0);
  const accuracyRate = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 text-black p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-6">
        
        {/* 📊 વિઝ્યુઅલ પ્રોગ્રેસ બાર ચાર્ટ */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-black mb-4 flex items-center space-x-2">
            <span>📊</span> <span>તમારો સ્કોર પ્રોગ્રેસ ચાર્ટ</span>
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4 text-center">
            <div className="bg-blue-50 p-4 rounded-2xl">
              <span className="block text-2xl font-black text-blue-600">{totalTests}</span>
              <span className="text-xs text-gray-400 font-bold">કુલ ટેસ્ટ આપી</span>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl">
              <span className="block text-2xl font-black text-emerald-600">{accuracyRate}%</span>
              <span className="text-xs text-gray-400 font-bold">એક્યુરેસી રેટ</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-gray-400">
              <span>સાચા જવાબોની ટકાવારી</span>
              <span>{totalCorrect} / {totalQuestions}</span>
            </div>
            <div className="w-full bg-gray-100 h-5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full transition-all" style={{ width: `${accuracyRate}%` }}></div>
            </div>
          </div>
        </div>

        {/* 📋 હિસ્ટ્રી લિસ્ટ */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-black mb-4">📋 ટેસ્ટ હિસ્ટ્રી</h3>
          <div className="space-y-3">
            {history.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div>
                  <h4 className="font-bold text-sm text-gray-800">{item.quiz_type || 'AI Quiz'}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(item.created_at).toLocaleDateString()}</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-black px-3 py-1.5 rounded-xl text-xs">
                  {item.score} / {item.total_questions}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}