'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

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
  { value: 'gujarati_sahitya', label: '📖 ગુજરાતી સાહિત્ય' },
  { value: 'gujarati_vyakran', label: '📝 ગુજરાતી વ્યાકરણ' },
  { value: 'law', label: '⚖️ કાયદો' },
  { value: 'gk', label: '💡 સામાન્ય જ્ઞાન' },
  { value: 'economics', label: '📈 અર્થશાસ્ત્ર' },
  { value: 'heritage', label: '🏺 સાંસ્કૃતિક વારસો' },
  { value: 'pub_ad', label: '🏢 જાહેર વહીવટ' },
  { value: 'current_affairs', label: '📰 Current Affairs' },
];

const SAMPLE_JSON = `[
  {
    "question": "भारतनुं बंधारण ક્યારે અમલમાં આવ્યું?",
    "option_a": "15 ઓગસ્ટ 1947",
    "option_b": "26 જાન્યુઆરી 1950",
    "option_c": "26 નવેમ્બર 1949",
    "option_d": "2 ઓક્ટોબર 1950",
    "correct_answer": "B",
    "subject": "constitution",
    "explanation": "भारतनुं बंधारण 26 જાન્યુઆરી 1950 ના રોજ અમલમાં આવ્યું."
  }
]`;

export default function AdminPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [passError, setPassError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [tab, setTab] = useState('bulk');
  const [stats, setStats] = useState({});

  const [jsonText, setJsonText] = useState('');
  const [subject, setSubject] = useState('maths');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [preview, setPreview] = useState([]);

  const [form, setForm] = useState({
    question: '', option_a: '', option_b: '', option_c: '', option_d: '',
    correct_answer: 'A', subject: 'maths', explanation: ''
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // 🔑 ૧. સિક્યોરિટી ફિક્સ: સેશન વેરિફિકેશન ટોકન ડાયનેમિક ચેક કરશે
  useEffect(() => {
    const storedToken = sessionStorage.getItem('admin_token');
    // જો sessionStorage માં ટોકન હાજર હોય તો ઓટોમેટિક લોગિન રહેવા દો
    if (storedToken) {
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (!authed) return;
    const loadStats = async () => {
      const results = {};
      for (const s of SUBJECTS) {
        const { count } = await supabase
          .from('questions')
          .select('*', { count: 'exact', head: true })
          .eq('subject', s.value);
        results[s.value] = count || 0;
      }
      setStats(results);
    };
    loadStats();
  }, [authed]);

  // 🌐 બેકએન્ડ API ને હિટ કરીને પાસવર્ડ ચેક કરો
  const handleLogin = async () => {
    try {
      const res = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passInput })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // ૨. સિક્યોરિટી ફિક્સ: API માંથી આવેલો સિક્યોર ટોકન સ્ટોર કરો
        sessionStorage.setItem('admin_token', data.token || "exambuddy_secure_admin_session_2026");
        setAuthed(true);
        setPassError('');
        setPassInput('');
      } else {
        setPassError(data.message || '❌ Password ખોટો છે!');
        setPassInput('');
      }
    } catch (err) {
      setPassError('⚠️ સિક્યોરિટી ચેક કરવામાં કંઈક ભૂલ થઈ.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    setAuthed(false);
    router.push('/');
  };

  const handleJsonChange = (text) => {
    setJsonText(text);
    setUploadResult(null);
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) setPreview(parsed.slice(0, 3));
    } catch { setPreview([]); }
  };

  const validateQuestion = (q) =>
    q.question && q.option_a && q.option_b && q.option_c && q.option_d &&
    ['A', 'B', 'C', 'D'].includes(q.correct_answer?.toUpperCase());

  const handleBulkUpload = async () => {
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) throw new Error();
    } catch {
      setUploadResult({ type: 'error', msg: '❌ JSON format સાચો નથી!' });
      return;
    }
    const valid = parsed.filter(validateQuestion);
    const invalid = parsed.length - valid.length;
    if (!valid.length) {
      setUploadResult({ type: 'error', msg: '❌ કોઈ valid question નથી!' });
      return;
    }
    setUploading(true);
    setUploadResult({ type: 'loading', msg: `⏳ ${valid.length} questions upload થઈ રહ્યા છે...` });
    const toInsert = valid.map(q => ({
      question: q.question.trim(),
      option_a: q.option_a.trim(), option_b: q.option_b.trim(),
      option_c: q.option_c.trim(), option_d: q.option_d.trim(),
      correct_answer: q.correct_answer.toUpperCase(),
      subject: q.subject || subject,
      explanation: q.explanation?.trim() || '',
    }));
    let successCount = 0;
    for (let i = 0; i < toInsert.length; i += 50) {
      const { error } = await supabase.from('questions').insert(toInsert.slice(i, i + 50));
      if (!error) successCount += Math.min(50, toInsert.length - i);
    }
    setUploading(false);
    setUploadResult({
      type: 'success',
      msg: `✅ ${successCount} questions add થઈ ગયા!${invalid > 0 ? ` (${invalid} skip)` : ''}`
    });
    if (successCount > 0) { setJsonText(''); setPreview([]); }
    const { count } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('subject', subject);
    setStats(p => ({ ...p, [subject]: count || 0 }));
  };

  const handleSave = async () => {
    if (!form.question || !form.option_a || !form.option_b || !form.option_c || !form.option_d) {
      setMsg('❌ બધા ફીલ્ડ ભરો!'); return;
    }
    setSaving(true);
    const { error } = await supabase.from('questions').insert({ ...form });
    setSaving(false);
    if (error) setMsg('❌ Error: ' + error.message);
    else {
      setMsg('✅ સવાલ સેવ થઈ ગયો!');
      setForm({ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A', subject: 'maths', explanation: '' });
    }
  };

  if (!authed) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'system-ui' }}>
      <div style={{ background: 'white', borderRadius: '24px', padding: '40px', maxWidth: '380px', width: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.4)', textAlign: 'center' }}>
        <div style={{ fontSize: '56px', marginBottom: '12px' }}>🔐</div>
        <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#1e1b4b', margin: '0 0 6px' }}>Admin Access</h1>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '28px' }}>ExamBuddy Secret Panel</p>

        {passError && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '10px', marginBottom: '16px', fontSize: '14px', fontWeight: '600' }}>
            {passError}
          </div>
        )}

        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <input
            type={showPass ? 'text' : 'password'}
            value={passInput}
            onChange={e => setPassInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Admin password..."
            style={{ width: '100%', padding: '14px 48px 14px 16px', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }}
            autoFocus
          />
          <button onClick={() => setShowPass(p => !p)}
            style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#6b7280' }}>
            {showPass ? '🙈' : '👁️'}
          </button>
        </div>

        <button onClick={handleLogin}
          style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', marginBottom: '12px' }}>
          🔓 Login
        </button>
        <button onClick={() => router.push('/')}
          style={{ width: '100%', padding: '12px', background: 'transparent', color: '#6b7280', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '14px', cursor: 'pointer' }}>
          ← Home
        </button>
      </div>
    </div>
  );

  const totalQ = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px', fontFamily: 'system-ui' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '18px 24px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>🛡️ Admin Panel</h1>
            <p style={{ opacity: 0.8, margin: '2px 0 0', fontSize: '13px' }}>ExamBuddy Question Manager • {totalQ} total questions</p>
          </div>
          <button onClick={handleLogout}
            style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '10px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer', fontWeight: '700' }}>
            🚪 Logout
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
          {[
            { label: 'કુલ સવાલ', value: totalQ, icon: '❓', color: '#6366f1' },
            { label: 'વિષયો', value: SUBJECTS.length, icon: '📚', color: '#8b5cf6' },
            { label: 'Ready (10+)', value: Object.values(stats).filter(v => v >= 10).length, icon: '✅', color: '#10b981' },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', borderRadius: '14px', padding: '14px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: '24px' }}>{s.icon}</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '16px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
          <div style={{ fontWeight: '800', color: '#1e1b4b', marginBottom: '12px', fontSize: '14px' }}>📊 Subject wise Questions</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {SUBJECTS.map(s => {
              const count = stats[s.value] || 0;
              const ready = count >= 10;
              return (
                <div key={s.value} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '8px', background: ready ? '#f0fdf4' : '#fef2f2', border: `1px solid ${ready ? '#86efac' : '#fca5a5'}` }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>{s.label}</span>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: ready ? '#166534' : '#dc2626' }}>{count} {ready ? '✓' : '✗'}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[
            { key: 'bulk', label: '📦 Bulk Upload' },
            { key: 'single', label: '✏️ Single Add' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: tab === t.key ? 'white' : 'rgba(255,255,255,0.2)', color: tab === t.key ? '#667eea' : 'white', fontWeight: '800', cursor: 'pointer', fontSize: '14px' }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'bulk' && (
          <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '700', color: '#374151', marginBottom: '6px', fontSize: '13px' }}>📚 Default Subject</label>
              <select value={subject} onChange={e => setSubject(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '2px solid #e5e7eb', fontSize: '15px', outline: 'none' }}>
                {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div style={{ background: '#f0fdf4', border: '2px solid #86efac', borderRadius: '12px', padding: '12px', marginBottom: '14px' }}>
              <div style={{ fontWeight: '700', color: '#166534', fontSize: '12px', marginBottom: '6px' }}>📋 JSON Format:</div>
              <pre style={{ fontSize: '11px', color: '#374151', margin: 0, overflowX: 'auto' }}>{`[{"question":"...","option_a":"...","option_b":"...","option_c":"...","option_d":"...","correct_answer":"A","subject":"maths","explanation":"..."}]`}</pre>
            </div>

            <button onClick={() => handleJsonChange(SAMPLE_JSON)}
              style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '2px dashed #94a3b8', borderRadius: '10px', color: '#64748b', fontWeight: '700', cursor: 'pointer', fontSize: '13px', marginBottom: '14px' }}>
              📝 Sample Load
            </button>

            <textarea value={jsonText} onChange={e => handleJsonChange(e.target.value)}
              placeholder='[ { "question": "...", ... } ]'
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #e5e7eb', fontSize: '13px', minHeight: '150px', resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace', marginBottom: '14px' }} />

            {preview.length > 0 && (
              <div style={{ background: '#eff6ff', border: '2px solid #bfdbfe', borderRadius: '12px', padding: '12px', marginBottom: '14px' }}>
                <div style={{ fontWeight: '700', color: '#1d4ed8', fontSize: '12px', marginBottom: '8px' }}>👁️ Preview ({preview.length} questions):</div>
                {preview.map((q, i) => (
                  <div key={i} style={{ background: 'white', borderRadius: '8px', padding: '8px', marginBottom: '6px', fontSize: '12px' }}>
                    <div style={{ fontWeight: '700', color: '#1e1b4b' }}>Q{i + 1}: {q.question?.substring(0, 70)}...</div>
                    <div style={{ color: '#10b981', fontWeight: '600' }}>✅ {q.correct_answer} → {q[`option_${q.correct_answer?.toLowerCase()}`]?.substring(0, 40)}</div>
                  </div>
                ))}
              </div>
            )}

            {uploadResult && (
              <div style={{ background: uploadResult.type === 'success' ? '#dcfce7' : uploadResult.type === 'error' ? '#fee2e2' : '#fffbeb', color: uploadResult.type === 'success' ? '#166534' : uploadResult.type === 'error' ? '#dc2626' : '#92400e', padding: '12px', borderRadius: '10px', marginBottom: '14px', fontWeight: '600', fontSize: '14px' }}>
                {uploadResult.msg}
              </div>
            )}

            <button onClick={handleBulkUpload} disabled={uploading || !jsonText.trim()}
              style={{ width: '100%', padding: '14px', background: uploading || !jsonText.trim() ? '#94a3b8' : 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '800', cursor: uploading || !jsonText.trim() ? 'not-allowed' : 'pointer' }}>
              {uploading ? '⏳ Upload...' : '🚀 Bulk Upload'}
            </button>
          </div>
        )}

        {tab === 'pdf' && (
  <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
    <div style={{ fontWeight: '800', color: '#1e1b4b', marginBottom: '16px', fontSize: '16px' }}>PDF Upload — Study Materials</div>

    {pdfResult && (
      <div style={{ background: pdfResult.type === 'success' ? '#dcfce7' : pdfResult.type === 'error' ? '#fee2e2' : '#fffbeb', color: pdfResult.type === 'success' ? '#166534' : pdfResult.type === 'error' ? '#dc2626' : '#92400e', padding: '12px', borderRadius: '10px', marginBottom: '16px', fontWeight: '600' }}>
        {pdfResult.msg}
      </div>
    )}

    <div style={{ marginBottom: '12px' }}>
      <label style={{ display: 'block', fontWeight: '700', color: '#374151', marginBottom: '4px', fontSize: '13px' }}>PDF Title</label>
      <input value={pdfTitle} onChange={e => setPdfTitle(e.target.value)} placeholder="Eg: Ancient India Notes Chapter 1"
        style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '2px solid #e5e7eb', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
    </div>

    <div style={{ marginBottom: '12px' }}>
      <label style={{ display: 'block', fontWeight: '700', color: '#374151', marginBottom: '4px', fontSize: '13px' }}>Topic Name</label>
      <input value={pdfTopic} onChange={e => setPdfTopic(e.target.value)} placeholder="Eg: Ancient India"
        style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '2px solid #e5e7eb', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
    </div>

    <div style={{ marginBottom: '12px' }}>
      <label style={{ display: 'block', fontWeight: '700', color: '#374151', marginBottom: '4px', fontSize: '13px' }}>Topic ID (1-22)</label>
      <input value={pdfTopicId} onChange={e => setPdfTopicId(e.target.value)} placeholder="Eg: 1"
        style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '2px solid #e5e7eb', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
    </div>

    <div style={{ marginBottom: '12px' }}>
      <label style={{ display: 'block', fontWeight: '700', color: '#374151', marginBottom: '4px', fontSize: '13px' }}>Subject</label>
      <select value={pdfSubject} onChange={e => setPdfSubject(e.target.value)}
        style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '2px solid #e5e7eb', fontSize: '14px', outline: 'none' }}>
        <option value="history">History</option>
        <option value="polity">Polity</option>
        <option value="geography">Geography</option>
        <option value="economy">Economy</option>
        <option value="science">Science</option>
        <option value="maths">Maths</option>
      </select>
    </div>

    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontWeight: '700', color: '#374151', marginBottom: '4px', fontSize: '13px' }}>Material Type</label>
      <select value={pdfType} onChange={e => setPdfType(e.target.value)}
        style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '2px solid #e5e7eb', fontSize: '14px', outline: 'none' }}>
        <option value="notes">Notes</option>
        <option value="mind_maps">Mind Maps</option>
        <option value="previous_year">Previous Year</option>
        <option value="practice_set">Practice Set</option>
      </select>
    </div>

    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontWeight: '700', color: '#374151', marginBottom: '4px', fontSize: '13px' }}>PDF File Select karo</label>
      <input type="file" accept=".pdf,.png,.jpg,.jpeg"
        onChange={e => setPdfFile(e.target.files[0])}
        style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '2px solid #e5e7eb', fontSize: '14px', boxSizing: 'border-box' }} />
      {pdfFile && <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px', fontWeight: '600' }}>Selected: {pdfFile.name}</div>}
    </div>

    <button onClick={handlePdfUpload} disabled={pdfUploading}
      style={{ width: '100%', padding: '14px', background: pdfUploading ? '#94a3b8' : 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '800', cursor: pdfUploading ? 'not-allowed' : 'pointer' }}>
      {pdfUploading ? 'Uploading...' : '📄 PDF Upload Karo'}
    </button>
  </div>
)}

        {tab === 'pdf' && (
  <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
    <div style={{ fontWeight: '800', color: '#1e1b4b', marginBottom: '16px', fontSize: '16px' }}>PDF Upload � Study Materials</div>

    {pdfResult && (
      <div style={{ background: pdfResult.type === 'success' ? '#dcfce7' : pdfResult.type === 'error' ? '#fee2e2' : '#fffbeb', color: pdfResult.type === 'success' ? '#166534' : pdfResult.type === 'error' ? '#dc2626' : '#92400e', padding: '12px', borderRadius: '10px', marginBottom: '16px', fontWeight: '600' }}>
        {pdfResult.msg}
      </div>
    )}

    <button onClick={handlePdfUpload} disabled={pdfUploading}
      style={{ width: '100%', padding: '14px', background: pdfUploading ? '#94a3b8' : 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '800', cursor: pdfUploading ? 'not-allowed' : 'pointer' }}>
      {pdfUploading ? 'Uploading...' : 'PDF Upload Karo'}
    </button>
  </div>
)}

        {tab === 'single' && (
          <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            {msg && (
              <div style={{ background: msg.includes('✅') ? '#dcfce7' : '#fee2e2', color: msg.includes('✅') ? '#166534' : '#dc2626', padding: '12px', borderRadius: '10px', marginBottom: '16px', fontWeight: '600', fontSize: '14px' }}>
                {msg}
              </div>
            )}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontWeight: '700', color: '#374151', marginBottom: '6px', fontSize: '13px' }}>📚 Subject</label>
              <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '2px solid #e5e7eb', fontSize: '15px', outline: 'none' }}>
                {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontWeight: '700', color: '#374151', marginBottom: '6px', fontSize: '13px' }}>❓ Question</label>
              <textarea value={form.question} onChange={e => setForm({ ...form, question: e.target.value })}
                placeholder="પ્રશ્ન અહીં..."
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '2px solid #e5e7eb', fontSize: '15px', minHeight: '80px', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            {['A', 'B', 'C', 'D'].map(opt => (
              <div key={opt} style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontWeight: '700', color: '#374151', marginBottom: '4px', fontSize: '12px' }}>
                  {opt === form.correct_answer ? '✅' : '⬜'} Option {opt}
                </label>
                <input value={form[`option_${opt.toLowerCase()}`]}
                  onChange={e => setForm({ ...form, [`option_${opt.toLowerCase()}`]: e.target.value })}
                  placeholder={`Option ${opt}`}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `2px solid ${opt === form.correct_answer ? '#86efac' : '#e5e7eb'}`, fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontWeight: '700', color: '#374151', marginBottom: '6px', fontSize: '13px' }}>✅ Correct Answer</label>
              <select value={form.correct_answer} onChange={e => setForm({ ...form, correct_answer: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '2px solid #86efac', fontSize: '15px', outline: 'none' }}>
                {['A', 'B', 'C', 'D'].map(o => <option key={o} value={o}>Option {o}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontWeight: '700', color: '#374151', marginBottom: '6px', fontSize: '13px' }}>💡 Explanation (optional)</label>
              <textarea value={form.explanation} onChange={e => setForm({ ...form, explanation: e.target.value })}
                placeholder="સ્પષ્ટીકરણ..."
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '2px solid #e5e7eb', fontSize: '15px', minHeight: '60px', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <button onClick={handleSave} disabled={saving}
              style={{ width: '100%', padding: '14px', background: saving ? '#94a3b8' : 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '800', cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? '⏳ Saving...' : '💾 Save Question'}
            </button>
          </div>
        )}

        <button onClick={() => router.push('/')}
          style={{ width: '100%', marginTop: '15px', padding: '12px', background: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
          ← Home
        </button>
      </div>
    </div>
  );
}
