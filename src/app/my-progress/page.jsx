"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function MyProgressPage() {
  const router = useRouter();
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
    <div style={{minHeight:'100vh', background:'#0a0f1e', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{fontSize:'20px', color:'#818cf8', fontWeight:'700'}}>⏳ લોડ થઈ રહ્યો છે...</div>
    </div>
  );

  return (
    <div style={{minHeight:'100vh', background:'#0a0f1e', fontFamily:'system-ui', color:'white', padding:'24px 20px'}}>
      <div style={{maxWidth:'700px', margin:'0 auto'}}>

        {/* Header */}
        <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'32px'}}>
          <button onClick={() => router.push('/')}
            style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'8px 14px', color:'#94a3b8', fontWeight:'700', cursor:'pointer', fontSize:'14px'}}>
            ← Back
          </button>
          <h1 style={{margin:0, fontSize:'24px', fontWeight:'900', background:'linear-gradient(90deg, #818cf8, #38bdf8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>
            📊 મારો પ્રોગ્રેસ
          </h1>
        </div>

        {/* Stats */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', marginBottom:'24px'}}>
          {[
            {val:totalTests, label:'કુલ ટેસ્ટ', icon:'📝', color:'#818cf8', bg:'rgba(99,102,241,0.15)', border:'rgba(99,102,241,0.3)'},
            {val:totalCorrect, label:'સાચા જવાબ', icon:'✅', color:'#34d399', bg:'rgba(52,211,153,0.15)', border:'rgba(52,211,153,0.3)'},
            {val:accuracy+'%', label:'એક્યુરેસી', icon:'🎯', color:'#f472b6', bg:'rgba(244,114,182,0.15)', border:'rgba(244,114,182,0.3)'},
          ].map((s,i) => (
            <div key={i} style={{background:s.bg, border:`1px solid ${s.border}`, borderRadius:'20px', padding:'20px', textAlign:'center'}}>
              <div style={{fontSize:'28px', marginBottom:'6px'}}>{s.icon}</div>
              <div style={{fontSize:'30px', fontWeight:'900', color:s.color}}>{s.val}</div>
              <div style={{fontSize:'12px', color:'#64748b', fontWeight:'700', marginTop:'4px'}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div style={{background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'20px', padding:'24px', marginBottom:'24px'}}>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:'14px', fontWeight:'700', color:'#94a3b8', marginBottom:'12px'}}>
            <span>Overall Accuracy</span>
            <span style={{color:'#818cf8'}}>{totalCorrect} / {totalQ}</span>
          </div>
          <div style={{background:'rgba(255,255,255,0.06)', borderRadius:'99px', height:'12px', overflow:'hidden'}}>
            <div style={{background:'linear-gradient(90deg, #818cf8, #38bdf8)', height:'100%', width:`${accuracy}%`, borderRadius:'99px', transition:'width 1s ease'}}/>
          </div>
          <div style={{marginTop:'8px', fontSize:'12px', color:'#475569', textAlign:'right'}}>
            {accuracy >= 70 ? '🏆 Excellent!' : accuracy >= 50 ? '👍 Good!' : '💪 Keep Practicing!'}
          </div>
        </div>

        {/* History */}
        <div style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'20px', padding:'24px'}}>
          <h3 style={{margin:'0 0 20px', fontSize:'16px', fontWeight:'900', color:'white'}}>📋 ટેસ્ટ હિસ્ટ્રી</h3>
          {history.length === 0 ? (
            <div style={{textAlign:'center', padding:'40px 20px'}}>
              <div style={{fontSize:'48px', marginBottom:'12px'}}>🎯</div>
              <p style={{color:'#475569', fontWeight:'600'}}>હજુ કોઈ ટેસ્ટ આપી નથી!</p>
              <button onClick={() => router.push('/')}
                style={{marginTop:'16px', padding:'10px 24px', background:'linear-gradient(135deg, #6366f1, #0ea5e9)', border:'none', borderRadius:'12px', color:'white', fontWeight:'700', cursor:'pointer'}}>
                Quiz આપો →
              </button>
            </div>
          ) : history.map((item) => {
            const pct = Math.round(((item.score || 0) / (item.total_questions || 1)) * 100);
            const isGood = pct >= 70;
            return (
              <div key={item.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'14px', marginBottom:'10px'}}>
                <div>
                  <p style={{fontWeight:'800', color:'white', margin:'0 0 4px', fontSize:'15px'}}>🎯 {item.topic || 'Quiz'}</p>
                  <p style={{fontSize:'12px', color:'#475569', margin:0}}>{new Date(item.created_at).toLocaleDateString('gu-IN')}</p>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{background:isGood?'rgba(52,211,153,0.15)':'rgba(248,113,113,0.15)', color:isGood?'#34d399':'#f87171', padding:'6px 14px', borderRadius:'10px', fontWeight:'900', fontSize:'14px', border:`1px solid ${isGood?'rgba(52,211,153,0.3)':'rgba(248,113,113,0.3)'}`}}>
                    {item.score}/{item.total_questions}
                  </div>
                  <p style={{fontSize:'11px', color:'#475569', margin:'4px 0 0'}}>{pct}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}