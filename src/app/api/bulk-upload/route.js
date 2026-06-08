import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ૧. સુપાબેઝ એડમિન ક્લાયન્ટ સેટઅપ (જેથી મોટો ડેટા ઇન્સર્ટ કરવામાં પ્રોબ્લેમ ન નડે)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    // ⬇️ અહીં તારા ૩૨૦૦ પ્રશ્નો વાળો આખો JSON ડેટા બે કૌંસ [ ] ની વચ્ચે પેસ્ટ કરવાનો છે.
    // મેં તારા આપેલા સેમ્પલ પ્રમાણે અહીં ડેટા ગોઠવ્યો છે:
    const rawQuestions = [
      {
        "question": "એક વેપારી બે વસ્તુઓ દરેક ₹9900 માં વેચે છે. એક પર તેને 10% નફો અને બીજી પર 10% ખોટ જાય છે, તો સમગ્ર વ્યવહારમાં તેને કેટલા ટકા નફો કે ખોટ થશે?",
        "a": "1% નફો",
        "b": "1% ખોટ",
        "c": "નફો કે ખોટ કંઈ નહીં થાય",
        "d": "2% ખોટ",
        "correct_option": "b",
        "subject": "ગણિત",
        "exam_tag": "GPSC, CCE",
        "explanation": "જ્યારે બે વસ્તુ સમાન કિંમતે વેચાય અને સમાન ટકાવારીમાં નફો-ખોટ થાય, ત્યારે હંમેશા ખોટ જ જાય. ખોટ = (ટકા/10)² = (10/10)² = 1% ખોટ."
      },
      {
        "question": "જો કોઈ રકમ ચક્રવૃદ્ધિ વ્યાજે 3 વર્ષમાં બમણી થાય, તો તે જ વ્યાજના દરે કેટલા વર્ષમાં 8 ગણી થશે?",
        "a": "6 વર્ષ",
        "b": "9 વર્ષ",
        "c": "12 વર્ષ",
        "d": "15 વર્ષ",
        "correct_option": "b",
        "subject": "ગણિત",
        "exam_tag": "GPSC, CCE",
        "explanation": "3 વર્ષમાં 2 ગણી થાય. 8 ગણી એટલે 2 ની 3 ઘાત (2³). વર્ષ શોધવા માટે મૂળ વર્ષને ઘાત સાથે ગુણતા: 3 * 3 = 9 વર્ષ."
      }
      // 📝 તારા બાકીના બધા જ ૩૨૦૦ પ્રશ્નો આની નીચે લાઈનસર પેસ્ટ કરી દેજે દીકા...
    ];

    console.log(`🚀 પ્રોસેસિંગ શરૂ... કુલ પ્રશ્નોની સંખ્યા: ${rawQuestions.length}`);

    // ૨. તારા ડેટાના ફોર્મેટને આપણી ક્વિઝ એપના ફોર્મેટમાં ફેરવવું (Mapping)
    const formattedQuestions = rawQuestions.map((item) => {
      // 'a', 'b', 'c', 'd' અક્ષરને ઇન્ડેક્સ નંબર (0, 1, 2, 3) માં ફેરવવું
      const optionMapping = { 'a': 0, 'b': 1, 'c': 2, 'd': 3 };
      const correctIdx = optionMapping[item.correct_option?.toLowerCase()] ?? 0;

      // સબ્જેક્ટ આઈડી અંગ્રેજીમાં કન્વર્ટ કરવો (જેથી URL માં ઇસ્યુ ન આવે)
      let subId = 'general_knowledge';
      if (item.subject === 'ગણિત') subId = 'maths';
      else if (item.subject === 'ઇતિહાસ') subId = 'history';
      // જો બીજા વિષયો હોય તો અહીં વિષય પ્રમાણે કન્ડિશન ઉમેરી શકો છો

      return {
        subject_id: subId,
        question_text: item.question,
        options: [item.a, item.b, item.c, item.d], // ચારેય ઓપ્શન એરે બની ગયા
        correct_option: correctIdx, // "b" માંથી 1 બની ગયું
        explanation: item.explanation || ""
      };
    });

    // 3. ડેટા બહુ મોટો (૩૨૦૦ પ્રશ્નો) હોવાથી તેને નાના ચંક્સ (Chunks) માં અપલોડ કરવો
    // એકસાથે ૩૨૦૦ કરવા જઈએ તો સુપાબેઝ ટાઈમ-આઉટ થઈ જાય, એટલે આપણે ૨૦૦-૨૦૦ ના ટુકડા પાડીશું
    const chunkSize = 200;
    let totalInserted = 0;

    for (let i = 0; i < formattedQuestions.length; i += chunkSize) {
      const chunk = formattedQuestions.slice(i, i + chunkSize);
      
      const { error } = await supabaseAdmin
        .from('questions')
        .insert(chunk);

      if (error) {
        console.error(`❌ બેચ ${i} માં લોચો વાગ્યો:`, error);
        throw error;
      }
      
      totalInserted += chunk.length;
      console.log(`✅ ${totalInserted} / ${formattedQuestions.length} પ્રશ્નો ઘુસી ગયા...`);
    }

    // ૪. સક્સેસ રિસ્પોન્સ
    return NextResponse.json({
      success: true,
      message: `મોજ કર ભાઈ! બધા જ ${totalInserted} પ્રશ્નો સુપાબેઝમાં વન-ક્લિકમાં ઇન્જેક્ટ થઈ ગયા છે! 🥳🔥`
    });

  } catch (error) {
    console.error("🚨 આખી પ્રોસેસમાં મોટો લોચો વાગ્યો:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}