import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export async function generateQuizAI(topic) {
  // અહીં પર્ફેક્ટ મોડેલ નામ 'gemini-1.5-flash' સેટ કરી દીધું છે
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Generate 5 multiple choice questions about ${topic} in Gujarati. 
  Return the response in strict JSON format as an array of objects with keys: 
  question, a, b, c, d, correct_option, subject, explanation. 
  The correct_option should be a single letter (a, b, c, or d).`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonMatch = text.match(/\[.*\]/s);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return [];
  }
}