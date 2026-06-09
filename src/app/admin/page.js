'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function AdminPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    question: '', option_a: '', option_b: '', option_c: '', option_d: '',
    correct_answer: 'A', subject: 'ગણિત', explanation: ''
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // આ નામો સીધા તારા સુપાબેઝ ડેટાબેઝ સાથે સિંક થશે
  const subjects = [
    { value: 'ગણિત', label: '🔢 ગણિત' },
    { value: 'ભારતનું બંધારણ', label: '📜 ભારતનું બંધારણ' },
    { value: 'ઇતિહાસ', label: '🏛️ ગુજરાતનો ઇતિહાસ' },
    { value: 'ભૂગોળ', label: '🌍 ભૂગોળ' },
    { value: 'વિજ્ઞાન', label: '🔬 સામાન્ય વિજ્ઞાન' },
    { value: 'ગુજરાતી સાહિત્ય', label: '✍️ ગુજરાતી સાહિત્ય' },
    { value: 'ગુજરાતી વ્યાકરણ', label: '📝 ગુજરાતી વ્યાકરણ' },
    { value: 'કમ્પ્યૂટર', label: '💻 કમ્પ્યૂટર જ્ઞાન' },
    { value: 'રીઝનિંગ', label: '🧩 રીઝનિંગ' },
    { value: 'English', label: '🔤 English Grammar' },
    { value: 'કાયદો', label: '⚖️ કાયદો' },
    { value: 'સામાન્ય જ્ઞાન', label: '💡 સામાન્ય જ્ઞાન' },
    { value: 'કરંટ અફેર્સ', label: '📰 કરંટ અફેર્સ' },
    { value: 'સાંસ્કૃતિક વારસો', label: '🏛️ સાંસ્કૃતિક વારસો' },
    { value: 'અર્થશાસ્ત્ર', label: '📈 અર્થશાસ્ત્ર' },
    { value: 'જાહેર વહીવટ', label: '🏢 જાહેર વહીવટ' }
  ];

  const handleSave = async () => {
    if (!form.question || !form.option_a || !form.option_b || !form.option_c || !form.option_d) {
      setMsg('❌ બધા ફીલ્ડ ભરો!'); return;
    }
    setSaving(true);
    const { error } = await supabase.from('questions').insert({
      question: form.question,
      option_a: form.option_a,
      option_b: form.option_b,
      option_c: form.option_c,
      option_d: form.option_d,
      correct_answer: form.correct_answer,
      subject: form.subject,
      explanation: form.explanation,
    });
    setSaving(false);
    if (error) { setMsg('❌ Error: ' + error.message); }
    else {
      setMsg('✅ સવાલ સેવ થઈ ગયો!');
      setForm({ question: '', option_a: '', option_b: '', option_c: '', option_d: '',
        correct_answer: 'A', subject: form.subject, explanation: '' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '40px 20px', fontFamily: 'system-ui', color: '#f8fafc' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '24px', padding: '24px', marginBottom: '24px', textAlign: 'center', border: '1px solid #334155', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '900', margin: 0, tracking: 'wide' }}>🛡️ Admin Panel</h1>
          <p style={{ opacity: 0.7, margin: '6px 0 0', fontSize: '14px', fontWeight: '500' }}>ExamBuddy Question Manager</p>
        </div>

        {/* Form Card */}
        <div style={{ background: '#1e293b', borderRadius: '24px', padding: '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', border: '1px solid #334155' }}>
          
          {msg && (
            <div style={{ background: msg.includes('✅') ? 'rgba(22,101,52,0.2)' : 'rgba(220,38,38,0.2)', color: msg.includes('✅') ? '#4ade80' : '#f87171', border: `1px solid ${msg.includes('✅') ? '#22c55e' : '#ef4444'}`, padding: '14px 16px', borderRadius: '12px', marginBottom: '24px', fontWeight: '700', fontSize: '14px' }}>
              {msg}
            </div>
          )}

          {/* Subject Select */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: '700', color: '#cbd5e1', marginBottom: '8px', fontSize: '14px' }}>📚 વિષય પસંદ કરો</label>
            <select value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #475569', background: '#0f172a', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}>
              {subjects.map(s => <option key={s.value} value={s.value} style={{ background: '#1e293b' }}>{s.label}</option>)}
            </select>
          </div>

          {/* Question */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: '700', color: '#cbd5e1', marginBottom: '8px', fontSize: '14px' }}>❓ પ્રશ્ન (Gujarati)</label>
            <textarea value={form.question} onChange={e => setForm({...form, question: e.target.value})}
              placeholder="પ્રશ્ન અહીં લખો..."
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #475569', background: '#0f172a', color: 'white', fontSize: '15px', minHeight: '90px', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Options */}
          {['A','B','C','D'].map(opt => {
            const isCorrect = form.correct_answer === opt;
            return (
              <div key={opt} style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: '700', color: '#cbd5e1', marginBottom: '8px', fontSize: '13px' }}>
                  {isCorrect ? '🟢' : '⚫'} વિકલ્પ {opt}
                </label>
                <input value={form[`option_${opt.toLowerCase()}`]}
                  onChange={e => setForm({...form, [`option_${opt.toLowerCase()}`]: e.target.value})}
                  placeholder={`વિકલ્પ ${opt} લખો...`}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: `2px solid ${isCorrect ? '#22c55e' : '#475569'}`, background: '#0f172a', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            );
          })}

          {/* Correct Answer */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: '700', color: '#cbd5e1', marginBottom: '8px', fontSize: '14px' }}>✅ સાચો જવાબ</label>
            <select value={form.correct_answer} onChange={e => setForm({...form, correct_answer: e.target.value})}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #22c55e', background: '#0f172a', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}>
              {['A','B','C','D'].map(o => <option key={o} value={o} style={{ background: '#1e293b' }}>વિકલ્પ {o}</option>)}
            </select>
          </div>

          {/* Explanation */}
          <div style={{ marginBottom: '26px' }}>
            <label style={{ display: 'block', fontWeight: '700', color: '#cbd5e1', marginBottom: '8px', fontSize: '14px' }}>💡 સ્પષ્ટીકરણ (Optional)</label>
            <textarea value={form.explanation} onChange={e => setForm({...form, explanation: e.target.value})}
              placeholder="આ જવાબ કેમ આવ્યો તેની સમજૂતી..."
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #475569', background: '#0f172a', color: 'white', fontSize: '15px', minHeight: '70px', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Save Button */}
          <button onClick={handleSave} disabled={saving}
            style={{ width: '100%', padding: '16px', background: saving ? '#64748b' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: '800', cursor: saving ? 'not-allowed' : 'pointer', transition: 'transform 0.2s', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)' }}>
            {saving ? '⏳ સેવ થઈ રહ્યો છે...' : '💾 Save MCQ to Live Database'}
          </button>
        </div>

        {/* Back Button */}
        <button onClick={() => router.push('/')}
          style={{ width: '100%', marginTop: '16px', padding: '14px', background: 'transparent', color: '#94a3b8', border: '2px solid #334155', borderRadius: '14px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}>
          ← મુખ્ય પેજ પર પાછા જાઓ
        </button>

      </div>
    </div>
  );
}