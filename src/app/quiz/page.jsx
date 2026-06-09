"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

function QuizContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const subject = searchParams.get("subject") || "";

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizOver, setQuizOver] = useState(false);

  useEffect(() => {
    async function loadQuestions() {
      if (!subject) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .ilike("subject", subject)
        .limit(20);
      if (!error && data) setQuestions(data);
      setLoading(false);
    }
    loadQuestions();
  }, [subject]);

  const handleSelect = (opt) => {
    if (showResult) return;
    setSelectedOpt(opt);
    setShowResult(true);
  };

  const handleNext = () => {
    const correct = questions[currentIdx]?.correct_answer?.toLowerCase();
    if (selectedOpt?.toLowerCase() === correct) {
      setScore((prev) => prev + 1);
    }
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOpt(null);
      setShowResult(false);
    } else {
      setQuizOver(true);
    }
  };

  if (loading) return (
    <div className="p-10 text-center text-2xl font-bold text-blue-600">
      ⏳ પ્રશ્નો લોડ થઈ રહ્યા છે...
    </div>
  );

  if (questions.length === 0) return (
    <div className="p-10 text-center text-xl text-red-500 font-bold">
      ❌ આ વિષય માટે પ્રશ્નો મળ્યા નથી!<br />
      <button onClick={() => router.push("/")} 
        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg">
        પાછા જાઓ
      </button>
    </div>
  );

  const q = questions[currentIdx];
  const correct = q?.correct_answer?.toLowerCase();

  const getButtonStyle = (optKey) => {
    const base = "w-full text-left p-4 rounded-xl border-2 font-medium transition-all duration-200 ";
    if (!showResult) {
      return base + (selectedOpt === optKey
        ? "bg-blue-600 text-white border-blue-700"
        : "bg-white text-gray-700 border-gray-200 hover:border-blue-300");
    }
    if (optKey.toLowerCase() === correct) return base + "bg-green-500 text-white border-green-600";
    if (selectedOpt === optKey) return base + "bg-red-500 text-white border-red-600";
    return base + "bg-white text-gray-400 border-gray-100";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {!quizOver ? (
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold capitalize">
                📚 {subject}
              </span>
              <span className="text-gray-500 font-medium">
                {currentIdx + 1} / {questions.length}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-100 h-2 rounded-full mb-6">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              />
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-6 bg-gray-50 p-4 rounded-xl">
              {q?.question}
            </h2>

            <div className="space-y-3">
              {[
                { key: "A", val: q?.option_a },
                { key: "B", val: q?.option_b },
                { key: "C", val: q?.option_c },
                { key: "D", val: q?.option_d },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handleSelect(opt.key)}
                  className={getButtonStyle(opt.key)}
                  disabled={showResult}
                >
                  <span className="font-bold mr-2">{opt.key}.</span> {opt.val}
                </button>
              ))}
            </div>

            {/* Explanation Box */}
            {showResult && q?.explanation && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-sm font-bold text-yellow-800">💡 સોલ્યુશન:</p>
                <p className="text-sm text-yellow-700 mt-1">{q.explanation}</p>
              </div>
            )}

            {showResult && (
              <button
                onClick={handleNext}
                className="w-full mt-4 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700"
              >
                {currentIdx + 1 === questions.length ? "🏁 ક્વિઝ સમાપ્ત" : "આગળ →"}
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">ક્વિઝ પૂરી!</h2>
            <p className="text-5xl font-black text-blue-600 my-4">
              {score} <span className="text-2xl text-gray-400">/ {questions.length}</span>
            </p>
            <p className="text-gray-500 mb-6">
              {score === questions.length ? "🏆 પર્ફેક્ટ સ્કોર!" :
               score >= questions.length * 0.7 ? "👍 સારો પ્રયાસ!" : "💪 વધુ પ્રેક્ટિસ કરો!"}
            </p>
            <button
              onClick={() => router.push("/")}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700"
            >
              🏠 મુખ્ય પેજ પર જાઓ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={
      <div className="p-10 text-center text-2xl font-bold text-blue-600">
        ⏳ લોડ થઈ રહ્યું છે...
      </div>
    }>
      <QuizContent />
    </Suspense>
  );
}