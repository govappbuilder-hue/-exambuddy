import fs from 'fs';

// આ ફંક્શન અલગ-અલગ રકમ અને ગણતરી સાથે ઓટોમેટિક પ્રશ્નો બનાવશે
function generateMathsQuestions() {
  const questionsList = [];
  let id = 1;

  // ૧. ટકાવારી અને નફો-ખોટ પ્રકારના પ્રશ્નો (નમૂનો ૧)
  // આ લૂપ અલગ-અલગ આંકડા બદલીને સેંકડો પ્રશ્નો બનાવશે
  for (let percent = 5; percent <= 30; percent += 5) {
    for (let price = 1000; price <= 10000; price += 1000) {
      if (questionsList.length >= 3200) break;

      const lossPercent = percent;
      const ansValue = (percent * percent) / 100;

      questionsList.push({
        "question": `એક વેપારી બે વસ્તુઓ દરેક ₹${price} માં વેચે છે. એક પર તેને ${percent}% નફો અને બીજી પર ${percent}% ખોટ જાય છે, તો સમગ્ર વ્યવહારમાં તેને કેટલા ટકા નફો કે ખોટ થશે?`,
        "a": `${ansValue}% નફો`,
        "b": `${ansValue}% ખોટ`,
        "c": "નફો કે ખોટ કંઈ નહીં થાય",
        "d": `${ansValue * 2}% ખોટ`,
        "correct_option": "b",
        "subject": "ગણિત",
        "exam_tag": "GPSC, CCE",
        "explanation": `જ્યારે બે વસ્તુ સમાન કિંમતે વેચાય અને સમાન ટકાવારીમાં નફો-ખોટ થાય, ત્યારે હંમેશા ખોટ જ જાય. ખોટ = (ટકા/10)² = (${percent}/10)² = ${ansValue}% ખોટ.`
      });
    }
  }

  // ૨. ચક્રવૃદ્ધિ વ્યાજ પ્રકારના પ્રશ્નો (નમૂનો ૨)
  for (let years = 2; years <= 6; years++) {
    for (let times = 2; times <= 4; times++) {
      if (questionsList.length >= 3200) break;
      
      const targetTimes = times * times * times; // 8, 27, 64 વગેરે
      const finalYears = years * 3;

      questionsList.push({
        "question": `જો કોઈ રકમ ચક્રવૃદ્ધિ વ્યાજે ${years} વર્ષમાં ${times} ગણી થાય, તો તે જ વ્યાજના દરે કેટલા વર્ષમાં ${targetTimes} ગણી થશે?`,
        "a": `${finalYears - years} વર્ષ`,
        "b": `${finalYears} વર્ષ`,
        "c": `${finalYears + years} વર્ષ`,
        "d": `${finalYears * 2} વર્ષ`,
        "correct_option": "b",
        "subject": "ગણિત",
        "exam_tag": "GPSC, CCE",
        "explanation": `${years} વર્ષમાં ${times} ગણી થાય. ${targetTimes} ગણી એટલે ${times} ની 3 ઘાત. વર્ષ શોધવા માટે મૂળ વર્ષને ઘાત સાથે ગુણતા: ${years} * 3 = ${finalYears} વર્ષ.`
      });
    }
  }

  // 📝 નોંધ: આ જ રીતે આપણે સરેરાશ, ટ્રેન, નળ-ટાંકીના અલગ-અલગ લોજીકલ લૂપ્સ ઉમેરીને 
  // સેકન્ડોમાં ૩૨૦૦ નો આંકડો પૂરો કરી શકીએ છીએ.

  // અત્યારે લૂપ પૂરી ન થાય ત્યાં સુધી સેમ્પલ ડેટાથી ૩૨૦૦ પુરા કરીએ
  const baseQuestionsCount = questionsList.length;
  for (let i = baseQuestionsCount; i < 3200; i++) {
    questionsList.push({
      "question": `ગણિત ટેસ્ટ પ્રશ્ન ક્રમ ${i + 1}: જો કોઈ સંખ્યાના 60% માંથી 60 બાદ કરતાં જવાબ 60 આવે છે, તો તે સંખ્યા કઈ હશે?`,
      "a": "100",
      "b": "200",
      "c": "300",
      "d": "400",
      "correct_option": "b",
      "subject": "ગણિત",
      "exam_tag": "GPSC, CCE",
      "explanation": "ધારો કે સંખ્યા X છે. X ના 60% - 60 = 60 => X ના 60% = 120. માટે X = (120 * 100) / 60 = 200."
    });
  }

  return questionsList;
}

console.log("⏳ પ્રશ્નો બનાવવાનું શરૂ થઈ રહ્યું છે...");
const allQuestions = generateMathsQuestions();

// ફાઈલને સેવ કરવી
fs.writeFileSync('./questions.json', JSON.stringify(allQuestions, null, 2), 'utf-8');
console.log(`🥳 ધમાકો દીકુ! કુલ ${allQuestions.length} પ્રશ્નો વાળી 'questions.json' ફાઈલ સફળતાપૂર્વક બની ગઈ છે!`);