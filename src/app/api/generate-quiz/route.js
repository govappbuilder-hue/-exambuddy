// PATH: src/app/api/generate-quiz/route.js

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const FALLBACK = {
  questions: [
    {
      question: "ગુજરાતનું રાજ્ય પક્ષી કયું છે?",
      a: "મોર", b: "પોપટ", c: "ફ્લેમિંગો (સુરખાબ)", d: "કબૂતર",
      correct_option: "c",
      explanation: "ગુજરાતનું રાજ્ય પક્ષી સુરખાબ (ગ્રેટર ફ્લેમિંગો) છે."
    },
    {
      question: "ભારતનું બંધારણ ક્યારે અમલમાં આવ્યું?",
      a: "૧૯૪૭", b: "૧૯૫૦", c: "૧૯૫૨", d: "૧૯૫૬",
      correct_option: "b",
      explanation: "ભારતનું બંધારણ ૨૬ જાન્યુઆરી ૧૯૫૦ ના રોજ અમલમાં આવ્યું."
    },
    {
      question: "ગુજરાતની સ્થાપના ક્યારે થઈ?",
      a: "૧ મે ૧૯૬૦", b: "૧ મે ૧૯૫૮", c: "૧ જૂન ૧૯૬૦", d: "૧ જૂન ૧૯૬૨",
      correct_option: "a",
      explanation: "ગુજરાત રાજ્ય ૧ મે ૧૯૬૦ ના રોજ મહારાષ્ટ્રથી અલગ થઈ અસ્તિત્વમાં આવ્યું."
    },
  ]
};

export async function POST(req) {
  try {
    const contentType = req.headers.get('content-type') || '';
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json(FALLBACK);

    let textContent = '';
    let imageBase64 = null;
    let imageMimeType = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file');

      if (!file) return NextResponse.json(FALLBACK);

      const mimeType = file.type;
      const buffer = Buffer.from(await file.arrayBuffer());

      if (mimeType === 'application/pdf') {
        try {
          const pdfParse = (await import('pdf-parse'));
          const pdfData = await pdfParse(buffer);
          textContent = pdfData.text?.slice(0, 3000) || '';
        } catch (e) {
          console.error('PDF parse error:', e.message);
          return NextResponse.json(FALLBACK);
        }
      } else if (mimeType.startsWith('image/')) {
        imageBase64 = buffer.toString('base64');
        imageMimeType = mimeType;
      }
    } else {
      const body = await req.json();
      textContent = body.textContent || '';
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const gujaratiInstruction = `તમે ગુજરાત સ્પર્ધાત્મક પરીક્ષા (GPSC/GSSSB/Police) માટે MCQ બનાવો છો. ફક્ત JSON response આપો, markdown નહીં.
JSON structure:
{
  "questions": [
    {
      "question": "ગુજરાતીમાં પ્રશ્ન?",
      "a": "વિકલ્પ A",
      "b": "વિકલ્પ B",
      "c": "વિકલ્પ C",
      "d": "વિકલ્પ D",
      "correct_option": "a",
      "explanation": "ગુજરાતીમાં સમજૂતી."
    }
  ]
}`;

    let result;

    if (imageBase64 && imageMimeType) {
      // IMAGE mode — Gemini Vision
      result = await model.generateContent([
        { inlineData: { mimeType: imageMimeType, data: imageBase64 } },
        { text: `${gujaratiInstruction}\n\nAa image na content mathi 10 MCQ questions banavo. explanation mandatory che. Faqt JSON apo.` },
      ]);
    } else if (textContent.trim().length > 10) {
      // PDF / Text mode
      result = await model.generateContent(
        `${gujaratiInstruction}\n\nઆ text ના આધારે 10 MCQ questions બનાવો. દરેક question unique ane exam-relevant hoy. explanation field khali na rakho:\n"${textContent.slice(0, 3000)}"\n\nFaqt JSON apo.`
      );
    } else {
      return NextResponse.json(FALLBACK);
    }

    let raw = result.response.text().trim();
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start !== -1 && end !== -1) raw = raw.slice(start, end + 1);

    const data = JSON.parse(raw);

    if (!data.questions || data.questions.length === 0) {
      return NextResponse.json(FALLBACK);
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Quiz API Error:', error.message);
    return NextResponse.json(FALLBACK);
  }
}