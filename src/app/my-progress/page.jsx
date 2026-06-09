"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

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
    <div style={{padding:'40px', textAlign:'center', fontSize:'20px', color:'#2563eb', fontWeight:'700'}}>
      ⏳ ડેટા લોડ થઈ રહ્યો છે...
    </div>
  );

  return (
    <div style={{minHeight:'100vh', background:'#f8fafc', padding:'24px', fontFamily:'system-ui'}}>
      <div style={{maxWidth:'600px', margin:'0 auto'}}>
        <h1 style={{fontSize:'24px', fontWeight:'900', color:'#0f172a', marginBottom:'24px'}}>📊 મારો પ્રોગ્રેસ</h1>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'16px', marginBottom:'24px'}}>
          {[
            {val: totalTests, label:'કુલ ટેસ્ટ', color:'#2563eb'},
            {val: totalCorrect, label:'સાચા જવાબ', color:'#16a34a'},
            {val: accuracy+'%', label:'એક્યુરેસી', color:'#7c3aed'},
          ].map((s,i) => (
            <div key={i} style={{background:'white', padding:'20px', borderRadius:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', textAlign:'center'}}>
              <p style={{fontSize:'28px', fontWeight:'900', color:s.color, margin:0}}>{s.val}</p>
              <p style={{fontSize:'12px', color:'#94a3b8', fontWeight:'700', margin:'4px 0 0'}}>{s.label}</p>
            </div>
          ))}
        </div>

        <div style={{background:'white', padding:'24px', borderRadius:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', marginBottom:'24px'}}>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:'14px', fontWeight:'700', color:'#64748b', marginBottom:'8px'}}>
            <span>સાચા જવાબ</span><span>{totalCorrect} / {totalQ}</span>
          </div>
          <div style={{background:'#f1f5f9', borderRadius:'99px', height:'16px', overflow:'hidden'}}>
            <div style={{background:'linear-gradient(90deg, #2563eb, #16a34a)', height:'100%', width:`${accuracy}%`, borderRadius:'99px', transition:'width 0.7s'}}/>
          </div>
        </div>

        <div style={{background:'white', padding:'24px', borderRadius:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
          <h3 style={{fontSize:'16px', fontWeight:'900', color:'#0f172a', marginBottom:'16px'}}>📋 ટેસ્ટ હિસ્ટ્રી</h3>
          {history.length === 0 ? (
            <p style={{color:'#94a3b8', textAlign:'center', padding:'20px'}}>હજુ કોઈ ટેસ્ટ આપી નથી! 🎯</p>
          ) : history.map((item) => {
            const pct = Math.round((item.score / item.total_questions) * 100);
            return (
              <div key={item.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px', background:'#f8fafc', borderRadius:'12px', border:'1px solid #e2e8f0', marginBottom:'10px'}}>
                <div>
                  <p style={{fontWeight:'700', color:'#0f172a', margin:0}}>🎯 {item.topic}</p>
                  <p style={{fontSize:'12px', color:'#94a3b8', margin:'2px 0 0'}}>{new Date(item.created_at).toLocaleDateString('gu-IN')}</p>
                </div>
                <div style={{textAlign:'right'}}>
                  <span style={{background: pct>=70?'#dcfce7':'#fee2e2', color:pct>=70?'#16a34a':'#dc2626', padding:'6px 12px', borderRadius:'10px', fontWeight:'800', fontSize:'13px'}}>
                    {item.score}/{item.total_questions}
                  </span>
                  <p style={{fontSize:'12px', color:'#94a3b8', margin:'4px 0 0'}}>{pct}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}