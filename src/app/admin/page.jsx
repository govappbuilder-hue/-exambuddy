'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      // 🔒 અહીં તારો પોતાનો જ જીમેલ આઈડી નાખી દેજે!
      if (user && user.email === 'તારો_ઈમેલ@gmail.com') {
        setIsAdmin(true);
      } else {
        alert("અરે ભાઈ! આ પેનલ સિક્રેટ છે.");
        router.push('/');
      }
      setLoading(false);
    };
    checkUser();
  }, [router]);

  if (loading) return <div style={{ padding: '50px', textAlign: 'center', fontWeight: 'bold' }}>સુરક્ષા તપાસ ચાલુ છે... 🛡️</div>;
  if (!isAdmin) return null;

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '700px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '26px', fontWeight: '900', marginBottom: '10px' }}>📝 એડમિન માસ્ટર ડેશબોર્ડ</h2>
      <p style={{ color: '#16a34a', fontWeight: '700', marginBottom: '30px' }}>✅ વેલકમ બોસ! તમે સિક્રેટ કંટ્રોલ પેનલમાં છો.</p>

      <div style={{ background: 'white', border: '2px solid #e2e8f0', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <h4 style={{ fontWeight: '800', marginBottom: '15px' }}>➕ નવો MCQ પ્રશ્ન ઉમેરો (૩૨૦૦ પ્રશ્નો માટે)</h4>
        <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '15px' }}>અહીંથી તમે ૧૬ માંથી કોઈપણ સબ્જેક્ટ આઈડી સિલેક્ટ કરીને ડાયરેક્ટ ડેટાબેઝમાં મોકલી શકો છો.</p>
        {/* ફોર્મ નું લોજિક અહીં ચાલુ રહેશે */}
        <div style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>JSON મટીરિયલ બલ્ક ઇમ્પોર્ટ કરવા માટે ટેબલ રેડી છે.</div>
      </div>
    </div>
  );
}