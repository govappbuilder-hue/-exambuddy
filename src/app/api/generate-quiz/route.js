import { NextResponse } from 'next/server';

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
    const apiKey = process.env.GROQ_API_KEY;

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

    const gujaratiPrompt = `તમે ગુજરાત સ્પર્ધાત્મક પરીક્ષા (GPSC/GSSSB/Police) માટે MCQ બનાવો છો.
ફક્ત JSON response આપો, બીજું કંઈ નહીં, markdown નહીં.
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

    let userMessage;

    if (imageBase64 && imageMimeType) {
      // Image mode — vision
      userMessage = [
        {
          type: "image_url",
          image_url: {
            url: `data:${imageMimeType};base64,${imageBase64}`
          }
        },
        {
          type: "text",
          text: `${gujaratiPrompt}\n\nAa image na content mathi 10 MCQ questions banavo. explanation mandatory che. Faqt JSON apo.`
        }
      ];
    } else if (textContent.trim().length > 10) {
      userMessage = `${gujaratiPrompt}\n\nઆ text ના આધારે 10 MCQ questions બનાવો:\n"${textContent.slice(0, 3000)}"\n\nફક્ત JSON આપો.`;
    } else {
      return NextResponse.json(FALLBACK);
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: imageBase64 ? 'meta-llama/llama-4-scout-17b-16e-instruct' : 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      console.error('Groq API error:', response.status);
      return NextResponse.json(FALLBACK);
    }

    const groqData = await response.json();
    let raw = groqData.choices?.[0]?.message?.content?.trim() || '';

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