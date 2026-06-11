import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { password } = await request.json();
    
    // .env.local માંથી સિક્રેટ પાસવર્ડ રીડ કરો
    const correctPassword = process.env.ADMIN_PASSWORD;

    // 🛠️ ડીબગીંગ લોગ્સ: આ તમારા VS Code ના ટર્મિનલમાં દેખાશે
    console.log("--- ADMIN AUTH CHECK ---");
    console.log("યુઝરે નાખેલો પાસવર્ડ:", password);
    console.log("Environment નો સાચો પાસવર્ડ:", correctPassword);

    // જો એન્વાયરમેન્ટ વેરિએબલ લોડ ન થયો હોય તો
    if (!correctPassword) {
      console.error("❌ એરર: .env.local માંથી ADMIN_PASSWORD લોડ થયો નથી!");
      return NextResponse.json(
        { success: false, message: "⚠️ સર્વર કોન્ફિગરેશન ભૂલ છે." },
        { status: 500 }
      );
    }

    // પાસવર્ડ મેચિંગ (બંને બાજુથી સ્પેસ હટાવીને ચેક કરશે)
    if (password?.trim() === correctPassword.trim()) {
      return NextResponse.json({ 
        success: true, 
        token: "exambuddy_secure_admin_session_2026" 
      });
    }

    // જો પાસવર્ડ ખોટો હોય તો
    return NextResponse.json(
      { success: false, message: "❌ Password ખોટો છે!" },
      { status: 401 }
    );

  } catch (error) {
    console.error("API ક્રોશ એરર:", error);
    return NextResponse.json(
      { success: false, message: "⚠️ સર્વર પર કંઈક ભૂલ થઈ." },
      { status: 500 }
    );
  }
}