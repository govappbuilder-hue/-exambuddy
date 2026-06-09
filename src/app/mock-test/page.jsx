'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

const EXAM_CONFIGS = {
  gpsc: { name: 'GPSC', totalTime: 3600, questions: 10, color: '#2563eb' },
  upsc: { name: 'UPSC', totalTime: 3600, questions: 10, color: '#7c3aed' },
  ssc:  { name: 'SSC',  totalTime: 1800, questions: 10, color: '#16a34a' },
};

export default function MockTestPage() {
  const router = useRouter();
  const [phase, setPhase] = useState('select');
  const [examType, setExamType] = useState('');
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const formatTime = (sec) => {
    const h = Math.floor(sec/3600);
    const m = Math.floor((sec%3600)/60);
    const s = sec%60;
    return h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  const submitTest = useCallback(async () => {
    if (phase === 'result') return;
    setPhase('result');
    const config = EXAM_CONFIGS[examType];
    let correct = 0, wrong = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correct_answer) correct++;
      else if (answers[i]) wrong++;
    });
    const unattempted = questions.length - correct - wrong;
    const score = Math.round((correct / questions.length) * 100);
    const timeTaken = config.totalTime - timeLeft;
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.from('mock_tests').insert({
        user_id: session.user.id,
        exam_type: examType.toUpperCase(),
        total_questions: questions.length,
        correct_answers: correct,
        wrong_answers: wrong,
        score,
        time_taken: timeTaken,
      });
    }
    setResult({ correct, wrong, unattempted, score, timeTaken });
  }, [phase, examType, questions, answers, timeLeft]);

  useEffect(() => {
    if (phase !== 'test') return;
    if (timeLeft <= 0) { submitTest(); return; }
    const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, phase, submitTest]);

  const startTest = async (type) => {
    setLoading(true);
    setExamType(type);
    const config = EXAM_CONFIGS[type];
    const { data, error } = await supabase.from('questions').select('*').limit(config.questions);
    if (error || !data?.length) { alert('Questions load nahi thaya!'); setLoading(false); return; }
    setQuestions(data);
    setTimeLeft(config.totalTime);
    setAnswers({});
    setCurrent(0);
    setPhase('test');
    setLoading(false);
  };

  const timerColor = timeLeft < 300 ? '#ef4444' : timeLeft < 600 ? '#f59e0b' : '#16a34a';

  if (phase === 'select') return (
    <div style={{minHeight:'100vh', background:'#f8fafc', fontFamily:'system-ui', padding:'20px'}}>
      <div style={{maxWidth:'600px', margin:'0 auto'}}>
        <button onClick={() => router.push('/')} style={{background:'none', border:'none', fontSize:'14px', color:'#6b7280', cursor:'pointer', fontWeight:'600', marginBottom:'24px', display:'block'}}>← Home</button>
        <h1 style={{fontSize:'28px', fontWeight:'800', color:'#0f172a', marginBottom:'8px'}}>🏆 Mock Test</h1>
        <p style={{color:'#6b7280', marginBottom:'32px'}}>Exam select karo ane full test apao</p>
        {Object.entries(EXAM_CONFIGS).map(([key, cfg]) => (
          <div key={key} onClick={() => !loading && startTest(key)}
            style={{background:'white', border:`2px solid ${cfg.color}30`, borderRadius:'16px', padding:'24px', marginBottom:'16px', cursor:'pointer'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div>
                <div style={{fontSize:'20px', fontWeight:'800', color:cfg.color}}>{cfg.name} Exam</div>
                <div style={{fontSize:'14px', color:'#6b7280', marginTop:'4px'}}>{cfg.questions} questions • {Math.floor(cfg.totalTime/60)} minutes</div>
              </div>
              <div style={{background:cfg.color, color:'white', padding:'10px 20px', borderRadius:'10px', fontWeight:'700'}}>{loading?'...':'Start →'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (phase === 'test') {
    const q = questions[current];
    const cfg = EXAM_CONFIGS[examType];
    return (
      <div style={{minHeight:'100vh', background:'#f8fafc', fontFamily:'system-ui'}}>
        <div style={{background:'#0f172a', padding:'12px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0}}>
          <span style={{color:'white', fontWeight:'800'}}>{cfg.name} Mock Test</span>
          <div style={{background:timerColor, color:'white', padding:'8px 16px', borderRadius:'8px', fontWeight:'800', fontSize:'18px', fontFamily:'monospace'}}>⏱ {formatTime(timeLeft)}</div>
          <button onClick={submitTest} style={{background:'#ef4444', color:'white', border:'none', padding:'8px 16px', borderRadius:'8px', fontWeight:'700', cursor:'pointer'}}>Submit</button>
        </div>
        <div style={{maxWidth:'700px', margin:'0 auto', padding:'20px'}}>
          <div style={{background:'#e2e8f0', borderRadius:'99px', height:'6px', marginBottom:'20px'}}>
            <div style={{background:cfg.color, height:'100%', borderRadius:'99px', width:`${((current+1)/questions.length)*100}%`}}/>
          </div>
          <div style={{background:'white', borderRadius:'16px', padding:'24px', marginBottom:'16px', boxShadow:'0 4px 20px rgba(0,0,0,0.06)'}}>
            <p style={{fontSize:'17px', fontWeight:'700', color:'#0f172a', margin:0, lineHeight:1.6}}>{q.question}</p>
          </div>
          {[{l:'A',v:q.option_a},{l:'B',v:q.option_b},{l:'C',v:q.option_c},{l:'D',v:q.option_d}].map(({l,v}) => {
            const sel = answers[current]===l;
            return (
              <button key={l} onClick={() => setAnswers(p=>({...p,[current]:l}))}
                style={{width:'100%', padding:'14px 16px', marginBottom:'10px', background:sel?`${cfg.color}15`:'white', border:`2px solid ${sel?cfg.color:'#e2e8f0'}`, borderRadius:'12px', cursor:'pointer', display:'flex', alignItems:'center', gap:'12px', textAlign:'left'}}>
                <span style={{background:sel?cfg.color:'#f1f5f9', color:sel?'white':'#64748b', borderRadius:'8px', width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'800', flexShrink:0}}>{l}</span>
                <span style={{fontSize:'15px', fontWeight:'600', color:sel?cfg.color:'#374151'}}>{v}</span>
              </button>
            );
          })}
          <div style={{display:'flex', gap:'12px', marginTop:'16px'}}>
            <button onClick={() => setCurrent(c=>Math.max(0,c-1))} disabled={current===0}
              style={{flex:1, padding:'12px', background:current===0?'#f1f5f9':'white', border:'2px solid #e2e8f0', borderRadius:'10px', fontWeight:'700', cursor:current===0?'not-allowed':'pointer', color:current===0?'#94a3b8':'#0f172a'}}>← Prev</button>
            <button onClick={() => current+1<questions.length?setCurrent(c=>c+1):submitTest()}
              style={{flex:1, padding:'12px', background:cfg.color, color:'white', border:'none', borderRadius:'10px', fontWeight:'700', cursor:'pointer'}}>
              {current+1<questions.length?'Next →':'🏁 Submit'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'result' && result) {
    const cfg = EXAM_CONFIGS[examType];
    const grade = result.score>=80?'A':result.score>=60?'B':result.score>=40?'C':'D';
    const emoji = result.score>=80?'🏆':result.score>=60?'🎯':result.score>=40?'📚':'💪';
    return (
      <div style={{minHeight:'100vh', background:'#f8fafc', fontFamily:'system-ui', padding:'20px'}}>
        <div style={{maxWidth:'600px', margin:'0 auto'}}>
          <div style={{background:`linear-gradient(135deg, #0f172a, ${cfg.color})`, borderRadius:'20px', padding:'36px', textAlign:'center', color:'white', marginBottom:'24px'}}>
            <div style={{fontSize:'56px', marginBottom:'12px'}}>{emoji}</div>
            <h2 style={{fontSize:'24px', fontWeight:'800', margin:'0 0 8px'}}>{cfg.name} Complete!</h2>
            <div style={{fontSize:'56px', fontWeight:'900', margin:'12px 0'}}>{result.score}%</div>
            <div style={{fontSize:'20px', fontWeight:'700', opacity:0.9}}>Grade: {grade}</div>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'24px'}}>
            {[
              {label:'✅ Correct', val:result.correct, bg:'#dcfce7', color:'#16a34a'},
              {label:'❌ Wrong', val:result.wrong, bg:'#fee2e2', color:'#dc2626'},
              {label:'⬜ Skipped', val:result.unattempted, bg:'#f1f5f9', color:'#6b7280'},
              {label:'⏱ Time', val:formatTime(result.timeTaken), bg:'#dbeafe', color:'#2563eb'},
            ].map(s => (
              <div key={s.label} style={{background:s.bg, borderRadius:'12px', padding:'20px', textAlign:'center'}}>
                <div style={{fontSize:'28px', fontWeight:'800', color:s.color}}>{s.val}</div>
                <div style={{fontSize:'13px', color:s.color, marginTop:'4px'}}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{display:'flex', gap:'12px'}}>
            <button onClick={() => {setPhase('select');setResult(null);}} style={{flex:1, padding:'14px', background:cfg.color, color:'white', border:'none', borderRadius:'10px', fontWeight:'700', cursor:'pointer'}}>🔄 Again</button>
            <button onClick={() => router.push('/')} style={{flex:1, padding:'14px', background:'#f1f5f9', color:'#0f172a', border:'none', borderRadius:'10px', fontWeight:'700', cursor:'pointer'}}>🏠 Home</button>
          </div>
        </div>
      </div>
    );
  }
  return null;
}