import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-backend-js'; // અથવા તારું સર્વર-સાઇડ સુપાબેઝ ક્લાયન્ટ

// સુપાબેઝ એડમિન કનેક્શન (સર્વર સાઇડ માટે)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // એનવાયરમેન્ટ ફાઇલમાં આ કી હોવી જરૂરી છે ભાઈ
);

export async function GET(request) {
  try {
    // 1. D-ID API અને Gemini માટેની કીઝ (તારી .env ફાઇલમાં સેટ કરી દેવી)
    const DID_API_KEY = process.env.DID_API_KEY || "તારી_D-ID_API_KEY_અહીં_પણ_નાખી_શકે";
    
    // 💡 ડેમો ન્યૂઝ ટેક્સ્ટ (અહીં તું Gemini API થી રોજ સવારે ઓટોમેટિક કરંટ અફેર્સ પણ જનરેટ કરાવી શકે)
    const gujaratiNewsText = "નમસ્કાર વિદ્યાર્થી મિત્રો, એક્ઝામ બડી કરંટ અફેર્સ ક્લાસમાં તમારું સ્વાગત છે. આજે આપણે વાત કરીશું ગુજરાતના બજેટ અને દેશની મહત્વની ઘટનાઓ વિશે, જે તમારી આવનારી સરકારી પરીક્ષા માટે ખૂબ જ ઉપયોગી સાબિત થશે. પૂરો વિડીયો જુઓ અને નીચે આપેલી ક્વિઝ રમો.";

    // 2. 🎬 D-ID API ને રિક્વેસ્ટ મોકલીને AI વિડીયો જનરેટ કરવાનું શરૂ કરો
    const didResponse = await fetch("https://api.d-id.com/talks", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${DID_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        script: {
          type: "text",
          subtitles: "false",
          provider: { 
            type: "microsoft", 
            voice_id: "gu-IN-DhwaniNeural" // 🎙️ એકદam કડક ગુજરાતી લેડી અવાજ!
          }, 
          input: gujaratiNewsText
        },
        config: { 
          fluent: "true", 
          pad_audio: "0.0" 
        },
        source_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400" // 🤖 પ્રીમિયમ પ્રોફેશનલ એન્કરનો ફોટો
      })
    });

    if (!didResponse.ok) {
      const errorData = await didResponse.json();
      throw new Error(`D-ID API Error: ${JSON.stringify(errorData)}`);
    }

    const talkData = await didResponse.json();
    const talkId = talkData.id; // D-ID એ વિડીયો પ્રોસેસિંગ આઈડી આપ્યો

    // 3. ⏳ વીડિયો તૈયાર થવામાં થોડી સેકન્ડ લાગશે, એટલે આપણે 10 સેકન્ડ વેટ કરીશું 
    // (પ્રોડક્શનમાં વેબહુક વાપરવું સારું, પણ ક્રોન જોબ માટે આ દેશી જુગાડ એકદમ બેસ્ટ છે!)
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // 4. વિડીયો લિંક રેડી થઈ કે નહીં તે ચેક કરો
    const statusResponse = await fetch(`https://api.d-id.com/talks/${talkId}`, {
      method: "GET",
      headers: {
        "Authorization": `Basic ${DID_API_KEY}`
      }
    });

    const statusData = await statusResponse.json();
    const finalVideoUrl = statusData.result_url || ""; // આ આપણી અસલી MP4 લિંક છે!

    // 5. 💾 જો વિડીયો લિંક મળી જાય, તો તેને સીધી Supabase માં સ્ટોર કરી દો
    if (finalVideoUrl) {
      const { error: dbError } = await supabaseAdmin
        .from('daily_news_videos')
        .insert([
          {
            title: `દૈનિક કરંટ અફેર્સ ડોઝ - ${new Date().toLocaleDateString('gu-IN')}`,
            video_url: finalVideoUrl,
            summary: gujaratiNewsText
          }
        ]);

      if (dbError) throw dbError;

      return NextResponse.json({ 
        success: true, 
        message: "બૂમ! AI વિડીયો બની ગયો અને સુપાબેઝમાં સેવ થઈ ગયો ભાઈ!",
        video_url: finalVideoUrl 
      });
    } else {
      // જો ૧૦ સેકન્ડમાં પ્રોસેસ ન થયો હોય તો Talk ID સેવ કરી લો (બીજી વાર ચેક કરવા)
      return NextResponse.json({ 
        success: false, 
        message: "વિડીયો હજી પ્રોસેસિંગમાં છે, પણ જોબ ચાલુ થઈ ગઈ છે ડાર્લિંગ!",
        talk_id: talkId 
      });
    }

  } catch (error) {
    console.error("Error in AI Video Cron:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}