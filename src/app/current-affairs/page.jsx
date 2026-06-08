'use client';

import { useRouter } from 'next/navigation';

export default function CurrentAffairsPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', fontFamily: 'sans-serif', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* 🔙 બેક બટન */}
        <button onClick={() => router.push('/')} style={{ background: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', color: '#1e293b', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ⬅️ પાછા જાઓ
        </button>

        {/* 🔥 હેડર કાર્ડ */}
        <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', padding: '35px', borderRadius: '24px', color: 'white', boxShadow: '0 20px 25px -5px rgba(37, 99, 235, 0.2)', marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '40px', background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '16px' }}>🎙️</span>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: '900', letterSpacing: '-0.5px' }}>AI દૈનિક કરંટ અફેર્સ ક્લાસ</h1>
              <p style={{ opacity: '0.85', fontSize: '14px', marginTop: '4px' }}>રોજ સવારે AI કેરેક્ટર દ્વારા ન્યૂઝ વિશ્લેષણ અને ઓડિયો લેક્ચર</p>
            </div>
          </div>
        </div>

        {/* 📺 વિડિયો લોડર સેક્શન */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', marginBottom: '30px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
            🎬 આજનો વિડિયો લેક્ચર: <span style={{ color: '#2563eb' }}>Daily Current Affairs</span>
          </h3>
          
          {/* સ્માર્ટ ગ્રેડિયન્ટ વેઇટિંગ સ્ટેટ */}
          <div style={{ background: 'linear-gradient(135deg, #fef08a 0%, #fef9c3 100%)', border: '2px dashed #eab308', padding: '30px', borderRadius: '20px', color: '#854d0e', fontWeight: '750' }}>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>🤖🧠</div>
            આજનો AI કેરેક્ટર લેક્ચર તૈયાર થઈ રહ્યો છે... <br/>
            <span style={{ fontSize: '13px', opacity: '0.8', fontWeight: '500' }}>ત્યાં સુધી નીચે આપેલી મોક ટેસ્ટ સોલ્વ કરીને રોકડા માર્ક્સ પાકા કરો ભાઈ!</span>
          </div>
        </div>

        {/* 📝 ટેસ્ટ સેક્શન */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '15px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>✍️ વિડિયો આધારિત લાઈવ ટેસ્ટ</h3>
            <span style={{ background: '#eff6ff', color: '#2563eb', padding: '6px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: '800' }}>0 / 0 ପ୍ରશ્નો</span>
          </div>

          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>📁</div>
            <p style={{ fontWeight: '600', fontSize: '15px' }}>આ વિષયમાં હજી કોઈ લાઈવ પ્રશ્નો ઉમેરાયા નથી ભાઈ.</p>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>એડમિન પેનલમાંથી બલ્ક અપલોડર રન થતાં જ અહીં ક્વિઝ દેખાશે!</p>
          </div>
        </div>

      </div>
    </div>
  );
}