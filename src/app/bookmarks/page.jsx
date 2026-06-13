'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function BookmarksPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data, error } = await supabase
        .from('bookmarks')
        .select(`
          id,
          question_id,
          created_at,
          questions (
            id, question, option_a, option_b, option_c, option_d,
            correct_answer, explanation, subject
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setQuestions(data.filter(b => b.questions));
      }
      setLoading(false);
    };
    init();
  }, []);

  const removeBookmark = async (bookmarkId) => {
    setRemoving(bookmarkId);
    await supabase.from('bookmarks').delete().eq('id', bookmarkId);
    setQuestions(p => p.filter(b => b.id !== bookmarkId));
    setRemoving(null);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'system-ui' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>❤️</div>
        <div style={{ fontSize: '16px', color: '#94a3b8' }}>Bookmarks load thay chhe...</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: 'system-ui', color: 'white', paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{ background: '#1e293b', padding: '16px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '12px', position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={() => router.push('/dashboard')} style={{ background: '#334155', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '13px' }}>← Back</button>
        <div>
          <div style={{ fontWeight: '900', fontSize: '18px' }}>❤️ Bookmarks</div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>{questions.length} saved questions</div>
        </div>
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '20px 16px' }}>

        {/* Empty State */}
        {questions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🤍</div>
            <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#94a3b8' }}>Koi bookmark nathi!</div>
            <div style={{ fontSize: '14px', marginBottom: '24px' }}>Quiz ma questions par ❤️ tap karo to yahan dakhashе</div>
            <button onClick={() => router.push('/dashboard')}
              style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 24px', cursor: 'pointer', fontWeight: '800', fontSize: '15px' }}>
              Quiz Shuru Karo →
            </button>
          </div>
        )}

        {/* Questions List */}
        {questions.map((b, i) => {
          const q = b.questions;
          const opts = [
            { key: 'A', val: q.option_a },
            { key: 'B', val: q.option_b },
            { key: 'C', val: q.option_c },
            { key: 'D', val: q.option_d },
          ];
          return (
            <div key={b.id} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '18px', marginBottom: '14px' }}>

              {/* Question Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#818cf8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {q.subject} • Q{i + 1}
                  </div>
                </div>
                <button
                  onClick={() => removeBookmark(b.id)}
                  disabled={removing === b.id}
                  style={{ background: removing === b.id ? '#334155' : '#450a0a', border: '1px solid #ef444440', color: '#ef4444', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>
                  {removing === b.id ? '...' : '🗑 Remove'}
                </button>
              </div>

              {/* Question Text */}
              <p style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 14px', lineHeight: 1.7, color: 'white' }}>
                {q.question}
              </p>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                {opts.map(opt => {
                  const isCorrect = opt.key === q.correct_answer;
                  return (
                    <div key={opt.key} style={{
                      padding: '10px 14px', borderRadius: '10px',
                      border: `2px solid ${isCorrect ? '#10b981' : '#334155'}`,
                      background: isCorrect ? '#064e3b' : '#0f172a',
                      display: 'flex', alignItems: 'center', gap: '10px'
                    }}>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '6px', flexShrink: 0,
                        background: isCorrect ? '#10b981' : '#334155',
                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '900', fontSize: '13px'
                      }}>{opt.key}</div>
                      <span style={{ fontSize: '14px', color: isCorrect ? '#6ee7b7' : '#94a3b8', flex: 1 }}>{opt.val}</span>
                      {isCorrect && <span style={{ fontSize: '16px' }}>✅</span>}
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              {q.explanation && (
                <div style={{ background: '#1c1a00', border: '1px solid #ca8a04', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ color: '#fbbf24', fontWeight: '700', fontSize: '12px', marginBottom: '4px' }}>💡 સ્પષ્ટીકરણ:</div>
                  <div style={{ color: '#fef3c7', fontSize: '13px', lineHeight: 1.6 }}>{q.explanation}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}