'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

const SUBJECTS = [
  { value: 'maths', label: '🔢 ગણિત' },
  { value: 'constitution', label: '📜 બંધારણ' },
  { value: 'history', label: '🏛️ ઇતિહાસ' },
  { value: 'geography', label: '🌍 ભૂગોળ' },
  { value: 'science', label: '🔬 વિજ્ઞાન' },
  { value: 'gujarati', label: '✍️ ગુજરાતી' },
  { value: 'computer', label: '💻 કમ્પ્યૂટર' },
  { value: 'reasoning', label: '🧩 રીઝનિંગ' },
  { value: 'english', label: '🔤 English' },
  { value: 'current-affairs', label: '📰 કરંટ અફેર્સ' },
];

const SAMPLE_JSON = `[
  {
    "question": "ભારતનું બંધારણ ક્યારે અમલમાં આવ્યું?",
    "option_a": "15 ઓગસ્ટ 1947",
    "option_b": "26 જાન્યુઆરી 1950",
    "option_c": "26 નવેમ્બર 1949",
    "option_d": "2 ઓક્ટોબર 1950",
    "correct_answer": "B",
    "explanation": "ભારતનું બંધારણ 26 જાન્યુઆરી 1950 ના રોજ અમલમાં આવ્યું."
  },
  {
    "question": "ગુજરાતની સ્થાપના ક્યારે થઈ?",
    "option_a": "1 મે 1960",
    "option_b": "15 ઓગસ્ટ 1947",
    "option_c": "26 જાન્યુઆરી 1950",
    "option_d": "1 નવેમ્બર 1956",
    "correct_answer": "A",
    "explanation": "ગુજરાત રાજ્યની સ્થાપના 1 મે 1960 ના રોજ થઈ."
  }
]`;

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState('bulk'); // 'bulk' | 'single'

  // Bulk upload state
  const [jsonText, setJsonText] = useState('');
  const [subject, setSubject] = useState('maths');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [preview, setPreview] = useState([]);

  // Single form state
  const [form, setForm] = useState({
    question: '', option_a: '', option_b: '', option_c: '', option_d: '',
    correct_answer: 'A', subject: 'maths', explanation: ''
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Parse JSON and show preview
  const handleJsonChange = (text) => {
    setJsonText(text);
    setUploadResult(null);
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        setPreview(parsed.slice(0, 3));
      }
    } catch {
      setPreview([]);
    }
  };

  // Validate single question
  const validateQuestion = (q) => {
    return q.question && q.option_a && q.option_b && 
           q.option_c && q.option_d && 
           ['A','B','C','D'].includes(q.correct_answer?.toUpperCase());
  };

  // Bulk Upload
  const handleBulkUpload = async () => {
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) throw new Error('Array joie');
    } catch {
      setUploadResult({ type: 'error', msg: '❌ JSON format sahi nathi! Sample juo.' });
      return;
    }

    const valid = parsed.filter(validateQuestion);
    const invalid = parsed.length - valid.length;

    if (valid.length === 0) {
      setUploadResult({ type: 'error', msg: '❌ Koi valid question nathi!' });
      return;
    }

    setUploading(true);
    setUploadResult({ type: 'loading', msg: `⏳ ${valid.length} questions upload thaay che...` });

    // Add subject to all questions
    const toInsert = valid.map(q => ({
      question: q.question.trim(),
      option_a: q.option_a.trim(),
      option_b: q.option_b.trim(),
      option_c: q.option_c.trim(),
      option_d: q.option_d.trim(),
      correct_answer: q.correct_answer.toUpperCase(),
      subject: q.subject || subject,
      explanation: q.explanation?.trim() || '',
    }));

    // Insert in batches of 50
    let successCount = 0;
    const batchSize = 50;
    for (let i = 0; i < toInsert.length; i += batchSize) {
      const batch = toInsert.slice(i, i + batchSize);
      const { error } = await supabase.from('questions').insert(batch);
      if (!error) successCount += batch.length;
    }

    setUploading(false);
    setUploadResult({
      type: 'success',
      msg: `✅ ${successCount} questions successfully add thaya!${invalid > 0 ? ` (${invalid} skip thaya - incomplete data)` : ''}`
    });
    if (successCount > 0) {
      setJsonText('');
      setPreview([]);
    }
  };

  // Single Save
  const handleSave = async () => {
    if (!form.question || !form.option_a || !form.option_b || !form.option_c || !form.option_d) {
      setMsg('❌ બધા ફીલ્ડ ભરો!'); return;
    }
    setSaving(true);
    const { error } = await supabase.from('questions').insert({
      question: form.question, option_a: form.option_a,
      option_b: form.option_b, option_c: form.option_c,
      option_d: form.option_d, correct_answer: form.correct_answer,
      subject: form.subject, explanation: form.explanation,
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
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '20px', marginBottom: '20px', textAlign: 'center', color: 'white' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '900', margin: 0 }}>🛡️ Admin Panel</h1>
          <p style={{ opacity: 0.8, margin: '5px 0 0', fontSize: '14px' }}>ExamBuddy Question Manager</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[
            { key: 'bulk', label: '📦 Bulk Upload (JSON)' },
            { key: 'single', label: '✏️ Single Question' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: tab === t.key ? 'white' : 'rgba(255,255,255,0.2)', color: tab === t.key ? '#667eea' : 'white', fontWeight: '800', cursor: 'pointer', fontSize: '14px' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* BULK UPLOAD TAB */}
        {tab === 'bulk' && (
          <div style={{ background: 'white', borderRadius: '20px', padding: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>

            {/* Subject Select */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '700', color: '#374151', marginBottom: '6px', fontSize: '13px' }}>
                📚 Default વિષય (JSON ma subject ન હોય તો આ વપરાશે)
              </label>
              <select value={subject} onChange={e => setSubject(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '2px solid #e5e7eb', fontSize: '15px', outline: 'none' }}>
                {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {/* JSON Format Info */}
            <div style={{ background: '#f0fdf4', border: '2px solid #86efac', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ fontWeight: '700', color: '#166534', fontSize: '13px', marginBottom: '8px' }}>
                📋 JSON Format (આ structure follow કરો):
              </div>
              <pre style={{ fontSize: '11px', color: '#374151', margin: 0, overflowX: 'auto', lineHeight: 1.6 }}>{`[
  {
    "question": "સવાલ અહીં",
    "option_a": "વિકલ્પ A",
    "option_b": "વિકલ્પ B", 
    "option_c": "વિકલ્પ C",
    "option_d": "વિકલ્પ D",
    "correct_answer": "A",
    "subject": "maths",
    "explanation": "સ્પષ્ટીકરણ (optional)"
  }
]`}</pre>
            </div>

            {/* Sample Button */}
            <button onClick={() => handleJsonChange(SAMPLE_JSON)}
              style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '2px dashed #94a3b8', borderRadius: '10px', color: '#64748b', fontWeight: '700', cursor: 'pointer', fontSize: '13px', marginBottom: '16px' }}>
              📝 Sample JSON Load કરો (test માટે)
            </button>

            {/* JSON Textarea */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '700', color: '#374151', marginBottom: '6px', fontSize: '13px' }}>
                📄 JSON Paste કરો
              </label>
              <textarea
                value={jsonText}
                onChange={e => handleJsonChange(e.target.value)}
                placeholder='[ { "question": "...", "option_a": "...", ... } ]'
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '2px solid #e5e7eb', fontSize: '13px', minHeight: '160px', resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }}
              />
            </div>

            {/* Preview */}
            {preview.length > 0 && (
              <div style={{ background: '#eff6ff', border: '2px solid #bfdbfe', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
                <div style={{ fontWeight: '700', color: '#1d4ed8', fontSize: '13px', marginBottom: '8px' }}>
                  👁️ Preview (પ્રથમ {preview.length} સવાલ):
                </div>
                {preview.map((q, i) => (
                  <div key={i} style={{ background: 'white', borderRadius: '8px', padding: '10px', marginBottom: '6px', fontSize: '12px' }}>
                    <div style={{ fontWeight: '700', color: '#1e1b4b', marginBottom: '4px' }}>Q{i+1}: {q.question?.substring(0, 80)}...</div>
                    <div style={{ color: '#10b981', fontWeight: '600' }}>✅ સાચો: {q.correct_answer} → {q[`option_${q.correct_answer?.toLowerCase()}`]?.substring(0, 40)}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Result Message */}
            {uploadResult && (
              <div style={{
                background: uploadResult.type === 'success' ? '#dcfce7' : uploadResult.type === 'error' ? '#fee2e2' : '#fffbeb',
                color: uploadResult.type === 'success' ? '#166534' : uploadResult.type === 'error' ? '#dc2626' : '#92400e',
                padding: '12px 16px', borderRadius: '10px', marginBottom: '16px',
                fontWeight: '600', fontSize: '14px'
              }}>
                {uploadResult.msg}
              </div>
            )}

            {/* Upload Button */}
            <button onClick={handleBulkUpload} disabled={uploading || !jsonText.trim()}
              style={{ width: '100%', padding: '14px', background: uploading || !jsonText.trim() ? '#94a3b8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '800', cursor: uploading || !jsonText.trim() ? 'not-allowed' : 'pointer' }}>
              {uploading ? '⏳ Upload થઈ રહ્યું છે...' : '🚀 Bulk Upload કરો'}
            </button>
          </div>
        )}

        {/* SINGLE QUESTION TAB */}
        {tab === 'single' && (
          <div style={{ background: 'white', borderRadius: '20px', padding: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            {msg && (
              <div style={{ background: msg.includes('✅') ? '#dcfce7' : '#fee2e2', color: msg.includes('✅') ? '#166534' : '#dc2626', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontWeight: '600', fontSize: '14px' }}>
                {msg}
              </div>
            )}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '700', color: '#374151', marginBottom: '6px', fontSize: '13px' }}>📚 વિષય</label>
              <select value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '2px solid #e5e7eb', fontSize: '15px', outline: 'none' }}>
                {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '700', color: '#374151', marginBottom: '6px', fontSize: '13px' }}>❓ પ્રશ્ન</label>
              <textarea value={form.question} onChange={e => setForm({...form, question: e.target.value})}
                placeholder="પ્રશ્ન અહીં લખો..."
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '2px solid #e5e7eb', fontSize: '15px', minHeight: '80px', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
            </div>
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
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '700', color: '#374151', marginBottom: '6px', fontSize: '13px' }}>✅ સાચો જવાબ</label>
              <select value={form.correct_answer} onChange={e => setForm({...form, correct_answer: e.target.value})}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '2px solid #86efac', fontSize: '15px', outline: 'none' }}>
                {['A','B','C','D'].map(o => <option key={o} value={o}>વિકલ્પ {o}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '700', color: '#374151', marginBottom: '6px', fontSize: '13px' }}>💡 સ્પષ્ટીકરણ (Optional)</label>
              <textarea value={form.explanation} onChange={e => setForm({...form, explanation: e.target.value})}
                placeholder="જવાબ સમજ..."
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '2px solid #e5e7eb', fontSize: '15px', minHeight: '60px', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <button onClick={handleSave} disabled={saving}
              style={{ width: '100%', padding: '14px', background: saving ? '#94a3b8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '800', cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? '⏳ સેવ થઈ રહ્યો છે...' : '💾 Save MCQ'}
            </button>
          </div>
        )}

        {/* Back Button */}
        <button onClick={() => router.push('/')}
          style={{ width: '100%', marginTop: '15px', padding: '12px', background: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
          ← મુખ્ય પેજ
        </button>
      </div>
    </div>
  );
}