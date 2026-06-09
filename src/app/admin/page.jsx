'use client';

import { useEffect, useState } from 'react';
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
    correct_answer: 'A', subject: 'maths', explanation: ''
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const subjects = [
    { value: 'maths', label: '🔢 ગણિત' },
    { value: 'constitution', label: '📜 ભારતનું બંધારણ' },
    { value: 'history', label: '🏛️ ગુજરાતનો ઇતિહાસ' },
    { value: 'geography', label: '🌍 ભૂગોળ' },
    { value: 'science', label: '🔬 સામાન્ય વિજ્ઞાન' },
    { value: 'gujarati', label: '✍️ ગુજરાતી સાહિત્ય' },
    { value: 'computer', label: '💻 કમ્પ્યૂટર જ્ઞાન' },
    { value: 'reasoning', label: '🧩 રીઝનિંગ' },
    { value: 'english', label: '🔤 English Grammar' },
    { value: 'current-affairs', label: '📰 કરંટ અફેર્સ' },
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
        correct_answer: 'A', subject: 'maths', explanation: '' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px', fontFamily: 'system-ui' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '20px', marginBottom: '20px', textAlign: 'center', color: 'white' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '900', margin: 0 }}>🛡️ Admin Panel</h1>
          <p style={{ opacity: 0.8, margin: '5px 0 0', fontSize: '14px' }}>ExamBuddy Question Manager</p>
        </div>

        {/* Form Card */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
          
          {msg && (
            <div style={{ background: msg.includes('✅') ? '#dcfce7' : '#fee2e2', color: msg.includes('✅') ? '#166534' : '#dc2626', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontWeight: '600', fontSize: '14px' }}>
              {msg}
            </div>
          )}

          {/* Subject Select */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: '700', color: '#374151', marginBottom: '6px', fontSize: '13px' }}>📚 વિષય</label>
            <select value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '2px solid #e5e7eb', fontSize: '15px', outline: 'none' }}>
              {subjects.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {/* Question */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: '700', color: '#374151', marginBottom: '6px', fontSize: '13px' }}>❓ પ્રશ્ન (Gujarati)</label>
            <textarea value={form.question} onChange={e => setForm({...form, question: e.target.value})}
              placeholder="પ્રશ્ન અહીં લખો..."
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '2px solid #e5e7eb', fontSize: '15px', minHeight: '80px', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Options */}
          {['A','B','C','D'].map(opt => (
            <div key={opt} style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontWeight: '700', color: '#374151', marginBottom: '6px', fontSize: '13px' }}>
                {opt === form.correct_answer ? '✅' : '⬜'} વિકલ્પ {opt}
              </label>
              <input value={form[`option_${opt.toLowerCase()}`]}
                onChange={e => setForm({...form, [`option_${opt.toLowerCase()}`]: e.target.value})}
                placeholder={`વિકલ્પ ${opt}`}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: `2px solid ${opt === form.correct_answer ? '#86efac' : '#e5e7eb'}`, fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          ))}

          {/* Correct Answer */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: '700', color: '#374151', marginBottom: '6px', fontSize: '13px' }}>✅ સાચો જવાબ</label>
            <select value={form.correct_answer} onChange={e => setForm({...form, correct_answer: e.target.value})}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '2px solid #86efac', fontSize: '15px', outline: 'none' }}>
              {['A','B','C','D'].map(o => <option key={o} value={o}>વિકલ્પ {o}</option>)}
            </select>
          </div>

          {/* Explanation */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: '700', color: '#374151', marginBottom: '6px', fontSize: '13px' }}>💡 સ્પષ્ટીકરણ (Optional)</label>
            <textarea value={form.explanation} onChange={e => setForm({...form, explanation: e.target.value})}
              placeholder="જવાબ સમજ..."
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '2px solid #e5e7eb', fontSize: '15px', minHeight: '60px', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Save Button */}
          <button onClick={handleSave} disabled={saving}
            style={{ width: '100%', padding: '14px', background: saving ? '#94a3b8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '800', cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? '⏳ સેવ થઈ રહ્યો છે...' : '💾 Save MCQ'}
          </button>
        </div>

        {/* Back Button */}
        <button onClick={() => router.push('/')}
          style={{ width: '100%', marginTop: '15px', padding: '12px', background: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
          ← મુખ્ય પેજ
        </button>

      </div>
    </div>
  );
}