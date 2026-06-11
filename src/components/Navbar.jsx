"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase"; // તમારો supabase કલાયન્ટ પાથ

export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // 1. કરન્ટ સેશન ચેક કરો
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // 2. લોગિન-લોગઆઉટ ઇવેન્ટ્સ રીઅલ-ટાઇમ લિસન કરો
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
    router.refresh(); // પેજ રીફ્રેશ જેથી બધો ડેટા ક્લીન થાય
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <Link href="/" className="text-2xl font-bold text-blue-600 tracking-wider">
          ExamBuddy
        </Link>
      </div>

      <div className="flex items-center space-x-6 font-medium text-gray-700">
        <Link href="/quiz" className="hover:text-blue-600 transition">Quizzes</Link>
        <Link href="/mock-test" className="hover:text-blue-600 transition">Mock Test</Link>
        <Link href="/current-affairs" className="hover:text-blue-600 transition">Current Affairs</Link>
        <Link href="/doubt-solver" className="hover:text-blue-600 transition">Doubt Solver</Link>

        {user ? (
          <div className="flex items-center space-x-4">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
              {user.email?.split("@")[0].toUpperCase()}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm transition"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}