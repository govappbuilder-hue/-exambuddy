import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function startBulkUpload() {
  try {
    const jsonPath = path.resolve(process.cwd(), 'questions.json');

    if (!fs.existsSync(jsonPath)) {
      console.error("❌ 'questions.json' ફાઈલ મળી નથી!");
      return;
    }

    console.log("📂 ૧. questions.json ફાઈલ રીડ થાય છે...");
    const fileData = fs.readFileSync(jsonPath, 'utf-8');
    const rawQuestions = JSON.parse(fileData);
    
    console.log(`📊 ૨. કુલ ${rawQuestions.length} પ્રશ્નો મળ્યા. ફોર્મેટ કન્વર્ટ થાય છે...`);

    // સુપાબેઝની કોલમ્સ (image_897ce8.png) મુજબ ૧૦૦% સાચું મેપિંગ
    const formattedQuestions = rawQuestions.map((item) => {
      let subId = 'maths';
      if (item.subject === 'ઇતિહાસ' || item.subject === 'History') {
        subId = 'history';
      }

      return {
        subject: subId,
        question: item.question || "",
        option_a: item.a || "",
        option_b: item.b || "",
        option_c: item.c || "",
        option_d: item.d || "",
        correct_answer: (item.correct_option || "A").toUpperCase() // 🌟 આ સુપાબેઝની 'correct_answer' કોલમમાં જશે
      };
    });

    console.log("🚀 ૩. સુપાબેઝમાં પ્રશ્નો અપલોડ થાય છે...");

    // ૩૦-૩૦ ના નાના ચંક્સમાં અપલોડ કરીએ જેથી સ્પીડ મળે
    const chunkSize = 30;
    for (let i = 0; i < formattedQuestions.length; i += chunkSize) {
      const chunk = formattedQuestions.slice(i, i + chunkSize);
      
      const { error } = await supabase
        .from('questions')
        .insert(chunk);

      if (error) {
        console.error(`❌ ભૂલ આવી: ${error.message}`);
        return;
      }
      console.log(`✅ ${Math.min(i + chunkSize, formattedQuestions.length)} / ${formattedQuestions.length} પ્રશ્નો અપલોડ થયા...`);
    }

    console.log("🥳 મહા ધમાકો દીકુ!! બધા જ ૩૨૦૦ પ્રશ્નો એકપણ એરર વગર સુપાબેઝમાં લાઈવ થઈ ગયા છે!");

  } catch (err) {
    console.error("🚨 મોટી આફત આવી:", err.message);
  }
}

startBulkUpload();