"use client";

import Link from "next/link";

// ૧૫ વિષયો અને પરીક્ષાઓનો સાદો ડેટા
const EXAMS_DATA = [
  {
    id: "exam_1",
    examName: "GPSC Class 1 and 2",
    description: "Gujarat Public Service Commission Recruitment Exams",
    subjects: [
      { id: "sub_1", name: "History", slug: "history" },
      { id: "sub_2", name: "Geography", slug: "geography" },
      { id: "sub_3", name: "Polity", slug: "polity" },
      { id: "sub_4", name: "Economics", slug: "economics" },
      { id: "sub_5", name: "Cultural Heritage", slug: "heritage" },
    ],
  },
  {
    id: "exam_2",
    examName: "GSSSB Class 3 CCE",
    description: "Gujarat Subordinate Services Selection Board Exams",
    subjects: [
      { id: "sub_6", name: "Maths", slug: "maths" },
      { id: "sub_7", name: "Reasoning", slug: "reasoning" },
      { id: "sub_8", name: "Gujarati Grammar", slug: "gujarati" },
      { id: "sub_9", name: "English Grammar", slug: "english" },
      { id: "sub_10", name: "Public Administration", slug: "pub_ad" },
    ],
  },
  {
    id: "exam_3",
    examName: "Police Bharti",
    description: "Gujarat Police Force Recruitment Examinations",
    subjects: [
      { id: "sub_11", name: "Law", slug: "law" },
      { id: "sub_12", name: "General Knowledge", slug: "gk" },
      { id: "sub_13", name: "Current Affairs", slug: "current_affairs" },
      { id: "sub_14", name: "General Science", slug: "science" },
      { id: "sub_15", name: "Computer Knowledge", slug: "computer" },
    ],
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-extrabold text-blue-700 mb-3 tracking-tight">
          ExamBuddy Quiz Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Select your Exam and Subject to start the quiz.
        </p>
      </div>

      {/* Main Exams Container */}
      <div className="max-w-6xl mx-auto space-y-12">
        {EXAMS_DATA.map((exam) => (
          <div key={exam.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {/* Exam Title */}
            <div className="border-b border-gray-100 pb-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                Exam: {exam.examName}
              </h2>
              <p className="text-sm text-gray-500 mt-1">{exam.description}</p>
            </div>

            {/* Subjects Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {exam.subjects.map((subject) => (
                <Link
                  key={subject.id}
                  href={`/quiz/${subject.slug}`}
                  className="group relative flex flex-col justify-between p-5 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl text-left transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <div>
                    <h3 className="font-bold text-gray-800 group-hover:text-blue-700 transition-colors text-lg">
                      {subject.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">
                      Subject Slug: {subject.slug}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center text-sm font-bold text-blue-600 group-hover:text-blue-700">
                    Start Quiz 
                    <span className="transform group-hover:translate-x-1 transition-transform ml-1">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center mt-16 text-gray-400 text-sm">
        ExamBuddy
      </div>
    </div>
  );
}