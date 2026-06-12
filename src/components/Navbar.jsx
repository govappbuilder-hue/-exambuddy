"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

const NAV_LINKS = [
  { href: "/quiz", label: "Quiz" },
  { href: "/mock-test", label: "Mock Test" },
  { href: "/current-affairs", label: "Current Affairs" },
  { href: "/doubt-solver", label: "Doubt Solver" },
];

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      <nav style={{ background: "#0f0f13", borderBottom: "1px solid #1e2030", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: "1024px", margin: "0 auto", padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "56px" }}>

            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "linear-gradient(135deg, #2563eb, #4338ca)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "white", fontSize: "12px", fontWeight: 900 }}>EB</span>
              </div>
              <span style={{ fontWeight: 800, color: "#f1f5f9", fontSize: "15px" }}>ExamBuddy</span>
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#3b82f6", background: "#eff6ff", border: "1px solid #bfdbfe", padding: "1px 6px", borderRadius: "20px" }}>AI</span>
            </Link>

            <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {NAV_LINKS.map(link => (
                <Link key={link.href} href={link.href} style={{ padding: "6px 12px", borderRadius: "8px", fontSize: "14px", fontWeight: 500, color: pathname === link.href ? "#3b82f6" : "#94a3b8", background: pathname === link.href ? "#1e2030" : "transparent", textDecoration: "none" }}>
                  {link.label}
                </Link>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {user ? (
                <>
                  <span style={{ background: "#1e2030", color: "#93c5fd", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, border: "1px solid #1e3a5f" }}>
                    {user.email?.split("@")[0].toUpperCase()}
                  </span>
                  <button onClick={handleLogout} style={{ background: "#450a0a", color: "#fca5a5", border: "1px solid #7f1d1d", padding: "6px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" style={{ border: "1px solid #2d3748", color: "#94a3b8", padding: "6px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>Login</Link>
                  <Link href="/register" style={{ background: "linear-gradient(135deg, #2563eb, #4338ca)", color: "white", padding: "6px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, textDecoration: "none" }}>Register</Link>
                </>
              )}
              <button onClick={() => setMenuOpen(!menuOpen)} className="mobile-menu-btn"
                style={{ display: "none", width: "36px", height: "36px", background: "#1e2030", border: "1px solid #2d3748", borderRadius: "8px", cursor: "pointer", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "4px", padding: "8px" }}>
                <span style={{ display: "block", width: "16px", height: "1.5px", background: "#94a3b8" }} />
                <span style={{ display: "block", width: "16px", height: "1.5px", background: "#94a3b8" }} />
                <span style={{ display: "block", width: "16px", height: "1.5px", background: "#94a3b8" }} />
              </button>
            </div>
          </div>
        </div>

        {menuOpen && (
          <div className="mobile-menu" style={{ background: "#0f0f13", borderTop: "1px solid #1e2030", padding: "12px 16px 16px" }}>
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href} style={{ display: "block", padding: "12px 0", borderBottom: "1px solid #1e2030", fontSize: "15px", fontWeight: 500, color: "#cbd5e1", textDecoration: "none" }}>
                {link.label}
              </Link>
            ))}
            {!user && (
              <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                <Link href="/login" style={{ flex: 1, textAlign: "center", border: "1px solid #2d3748", color: "#94a3b8", padding: "10px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>Login</Link>
                <Link href="/register" style={{ flex: 1, textAlign: "center", background: "linear-gradient(135deg, #2563eb, #4338ca)", color: "white", padding: "10px", borderRadius: "8px", fontSize: "14px", fontWeight: 700, textDecoration: "none" }}>Register</Link>
              </div>
            )}
          </div>
        )}
      </nav>
      <style>{`
        @media (max-width: 768px) { .desktop-nav { display: none !important; } .mobile-menu-btn { display: flex !important; } }
        @media (min-width: 769px) { .mobile-menu { display: none !important; } }
      `}</style>
    </>
  );
}