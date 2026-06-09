"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MyProgressPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("user_scores")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setHistory(data || []);
      setLoading(false);
    }
    fetchHistory();
  }, []);

  const totalTests = history.length;
  const totalCorrect = history.reduce((a, c) => a + (c.score || 0), 0);
  const totalQ = history.reduce((a, c) => a + (c.total_questions || 1), 0);
  const accuracy = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;

  if (loading) return (
    <div className="p-10 text-center font-bold text-blue-600 text-xl">
      ⏳ ડેટા લોડ થઈ રહ્યો છે...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-black text-gray-800">📊 મારો પ્રોગ્રેસ</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow text-center">
            <p className="text-3xl font-black text-blue-600">{totalTests}</p>
            <p className="text-xs text-gray-400 font-bold mt-1">કુલ ટેસ્ટ</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow text-center">
            <p className="text-3xl font-black text-green-600">{totalCorrect}</p>
            <p className="text-xs text-gray-400 font-bold mt-1">સાચા જવાબ</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow text-center">
            <p className="text-3xl font-black text-purple-600">{accuracy}%</p>
            <p className="text-xs text-gray-400 font-bold mt-1">એક્યુરેસી</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <div className="flex justify-between text-sm font-bold text-gray-500 mb-2">
            <span>સાચા જવાબ</span>
            <span>{totalCorrect} / {totalQ}</span>
          </div>
          <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-700"
              style={{ width: `${accuracy}%` }}
            />
          </div>
        </div>

        {/* History List */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="font-black text-gray-800 mb-4">📋 ટેસ્ટ હિસ્ટ્રી</h3>
          {history.length === 0 ? (
            <p className="text-gray-400 text-center py-4">
              હજુ કોઈ ટેસ્ટ આપી નથી! 🎯
            </p>
          ) : (
            <div className="space-y-3">
              {history.map((item) => {
                const pct = Math.round((item.score / item.total_questions) * 100);
                return (
                  <div key={item.id}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <p className="font-bold text-gray-800">🎯 {item.topic}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(item.created_at).toLocaleDateString("gu-IN")}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`font-black px-3 py-1 rounded-xl text-sm ${
                        pct >= 70 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                      }`}>
                        {item.score}/{item.total_questions}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">{pct}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}