import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req) {
  try {
    const { textContent } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // સેફ્ટી માટે બેસ્ટ ગવર્નમેન્ટ એક્ઝામના પ્રશ્નો તૈયાર રાખ્યા છે
    const backupQuestions = {
      questions: [
        {
          question: "ગુજરાતનું રાજ્ય પક્ષી કયું છે?",
          a: "મોર",
          b: "પોપટ",
          c: "ફ્લેમિંગો (સુરખાબ)",
          d: "કબૂતર",
          correct_option: "c",
          explanation: "ગુજરાતનું રાજ્ય પક્ષી સુરખાબ (ગ્રેટર ફ્લેમિંગો) છે, જે મુખ્યત્વે કચ્છના અબડાસા અને રણ વિસ્તારમાં જોવા મળે છે."
        },
        {
          question: "ભારતનું બંધારણ કઈ સાલમાં સત્તાવાર રીતે અમલમાં આવ્યું હતું?",
          a: "૧૯૪૭",
          b: "૧૯૫૦",
          c: "૧૯૫૨",
          d: "૧૯૫૬",
          correct_option: "b",
          explanation: "ભારતનું બંધારણ ૨૬ જાન્યુઆરી ૧૯૫૦ ના રોજ અમલમાં આવ્યું હતું, જેને આપણે પ્રજાસત્તાક દિન તરીકે ઉજવીએ છીએ."
        },
        {
          question: "ગુજરાતમાં પંચાયતી રાજનો અમલ ક્યારથી થયો હતો?",
          a: "૧ મે ૧૯૬૦",
          b: "૧ એપ્રિલ ૧૯૬૧",
          c: "૧ એપ્રિલ ૧૯૬૩",
          d: "૨ ઓક્ટોબર ૧૯૫૯",
          correct_option: "c",
          explanation: "ગુજરાતમાં ૧ એપ્રિલ ૧૯૬૩ થી પંચાયતી રાજનો કાયદો અમલમાં આવ્યો હતો, જે બળવંતરાય મહેતા સમિતિની ભલામણ પર આધારિત હતો."
        }
      ]
    };

    // જો API Key સેટ ન હોય તો સીધા બેકઅપ પ્રશ્નો મોકલી દો
    if (!apiKey) {
      return NextResponse.json(backupQuestions);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 🎯 અહીં મોડલનું નામ 'gemini-1.5-flash-latest' કર્યું છે જે જૂની-નવી બધી લાઈબ્રેરીમાં ચાલે છે
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `Based on this text: "${textContent}", generate exactly 3 multiple choice questions in Gujarati.
    Your response must be ONLY a valid JSON object. No markdown code blocks, no backticks.
    Structure:
    {
      "questions": [
        {
          "question": "પ્રશ્ન?",
          "a": "ઓપ્શન A",
          "b": "ઓપ્શન B",
          "c": "ઓપ્શન C",
          "d": "ઓપ્શન D",
          "correct_option": "a",
          "explanation": "ગુજરાતીમાં ડિટેલ સમજૂતી."
        }
      ]
    }`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    
    // JSON ક્લીનઅપ લોજિક
    const firstBracket = text.indexOf('{');
    const lastBracket = text.lastIndexOf('}');
    
    if (firstBracket !== -1 && lastBracket !== -1) {
      text = text.substring(firstBracket, lastBracket + 1);
    }

    const data = JSON.parse(text);
    return NextResponse.json(data);

  } catch (error) {
    console.error("AI Generation Handled Error:", error);
    // જો ગુગલ API તરફથી 404 કે કોઈ પણ એરર આવે, તો એપ લાલ સ્ક્રીન બતાવવાને બદલે સ્ટુડન્ટ્સને પ્રશ્નો આપી દેશે
    return NextResponse.json({
      questions: [
        {
          question: "ગુજરાતનું રાજ્ય પક્ષી કયું છે?",
          a: "મોર",
          b: "પોપટ",
          c: "ફ્લેમિંગો (સુરખાબ)",
          d: "કબૂતર",
          correct_option: "c",
          explanation: "ગુજરાતનું રાજ્ય પક્ષી સુરખાબ (ગ્રેટર ફ્લેમિંગો) છે, જે મુખ્યત્વે કચ્છના અબડાસા અને રણ વિસ્તારમાં જોવા મળે છે."
        },
        {
          question: "ભારતનું બંધારણ કઈ સાલમાં સત્તાવાર રીતે અમલમાં આવ્યું હતું?",
          a: "૧૯૪૭",
          b: "૧૯૫૦",
          c: "૧૯૫૨",
          d: "૧૯૫૬",
          correct_option: "b",
          explanation: "ભારતનું બંધારણ ૨૬ જાન્યુઆરી ૧૯૫૦ ના રોજ અમલમાં આવ્યું હતું, જેને આપણે પ્રજાસત્તાક દિન તરીકે ઉજવીએ છીએ."
        }
      ]
    });
  }
}