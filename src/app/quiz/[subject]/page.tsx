"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// સુપાબેઝ કનેક્શન સેટઅપ
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface Question {
  id: number;
  subject: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  
  // URL માંથી વિષય પકડીને સ્મોલ અક્ષરોમાં ફેરવવો
  const subjectParam = Array.isArray(params?.subject) ? params.subject[0] : params?.subject;
  const subject = subjectParam?.toLowerCase() || "";

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [quizOver, setQuizOver] = useState(false);

  useEffect(() => {
    async function loadQuestions() {
      if (!subject) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("questions")
          .select("*")
          .eq("subject", subject); 

        if (error) throw error;
        if (data) setQuestions(data);
      } catch (err: any) {
        console.error("Error fetching data:", err.message);
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, [subject]);

  const handleNext = () => {
    if (selectedOpt === questions[currentIdx]?.correct_answer) {
      setScore((prev) => prev + 1);
    }

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOpt(null);
    } else {
      setQuizOver(true);
    }
  };

  if (loading) return <div className="p-8 text-center text-xl font-bold text-blue-600">⏳ પ્રશ્નો લોડ થઈ રહ્યા છે દીકા...</div>;
  if (questions.length === 0) return <div className="p-8 text-center text-xl text-red-500 font-bold">❌ આ વિષયના કોઈ પ્રશ્નો ડેટાબેઝમાં મળ્યા નથી!</div>;

  const currentQuestion = questions[currentIdx];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-10 border border-gray-100">
      {!quizOver ? (
        <div>
          <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
            <span className="font-semibold bg-blue-100 text-blue-800 px-3 py-1 rounded-full capitalize">{subject}</span>
            <span className="font-medium text-gray-600">પ્રશ્ન: {currentIdx + 1} / {questions.length}</span>
          </div>
          
          <h2 className="text-xl font-bold text-gray-800 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
            {currentQuestion.question}
          </h2>
          
          <div className="space-y-3">
            {[
              { key: "A", val: currentQuestion.option_a },
              { key: "B", val: currentQuestion.option_b },
              { key: "C", val: currentQuestion.option_c },
              { key: "D", val: currentQuestion.option_d }
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSelectedOpt(opt.key)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                  selectedOpt === opt.key 
                    ? "bg-blue-600 text-white border-blue-700 shadow-md font-semibold" 
                    : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
                }`}
              >
                <span className="mr-2 font-bold opacity-80">{opt.key}.</span> {opt.val}
              </button>
            ))}
          </div>

          <button
            disabled={!selectedOpt}
            onClick={handleNext}
            className="w-full mt-6 bg-green-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400"
          >
            {currentIdx + 1 === questions.length ? "Finish" : "Next"}
          </button>
        </div>
      ) : (
        <div className="text-center py-8">
          <h2 className="text-3xl font-bold text-green-600 mb-4">🎉 ક્વિઝ પૂરી થઈ ગઈ!</h2>
          <p className="text-xl text-gray-700 mb-6">તારો સ્કોર: <span className="font-bold text-blue-600">{score}</span> / {questions.length}</p>
          <button 
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
          >
            મુખ્ય પેજ પર પાછા જાઓ
          </button>
        </div>
      )}
    </div>
  );
}