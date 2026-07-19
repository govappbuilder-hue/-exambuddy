import { NextResponse } from "next/server";
import { signAdminSession } from '../../../lib/admin-auth.mjs';

export async function POST(request) {
  try {
    const { password } = await request.json();
    
    // .env.local માંથી સિક્રેટ પાસવર્ડ રીડ કરો
    const correctPassword = process.env.ADMIN_PASSWORD;

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
      const token = signAdminSession();
      const response = NextResponse.json({
        success: true,
        token,
      });
      response.cookies.set({
        name: 'admin_session',
        value: token,
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 8,
      });
      return response;
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