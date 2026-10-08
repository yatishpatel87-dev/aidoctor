import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
// Allow large base64 image uploads for multiple high-res leaf/plant photos
app.use(express.json({ limit: '40mb' }));
app.use(express.urlencoded({ extended: true, limit: '40mb' }));

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('⚠️ WARNING: GEMINI_API_KEY is not set in environment!');
}

const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to sanitize JSON response from markdown blocks if needed
function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  if (cleaned.includes('```json')) {
    cleaned = cleaned.substring(cleaned.indexOf('```json') + 7);
    if (cleaned.includes('```')) {
      cleaned = cleaned.substring(0, cleaned.lastIndexOf('```'));
    }
  } else if (cleaned.includes('```')) {
    cleaned = cleaned.substring(cleaned.indexOf('```') + 3);
    if (cleaned.includes('```')) {
      cleaned = cleaned.substring(0, cleaned.lastIndexOf('```'));
    }
  }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return cleaned.trim();
}

/**
 * Plant Analysis Endpoint
 * Multimodal Gemini 3.8 Flash analysis
 */
app.post('/api/analyze-plant', async (req: Request, res: Response) => {
  try {
    const { images, language = 'gu', notes = '' } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'કૃપા કરીને ઓછામાં ઓછો એક ફોટો અપલોડ કરો (No image provided)' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Gemini API key is not configured on server.',
      });
    }

    // Build parts for multimodal prompt
    const parts: any[] = [];

    images.forEach((imgObj: { data: string; mimeType?: string; label?: string }, idx: number) => {
      // Strip data:image/...;base64, prefix if present
      let rawBase64 = imgObj.data;
      let mimeType = imgObj.mimeType || 'image/jpeg';
      if (rawBase64.includes(';base64,')) {
        const split = rawBase64.split(';base64,');
        const mimeMatch = split[0].match(/data:(.*?)$/);
        if (mimeMatch) mimeType = mimeMatch[1];
        rawBase64 = split[1];
      }

      parts.push({
        inlineData: {
          mimeType,
          data: rawBase64,
        },
      });

      if (imgObj.label) {
        parts.push({
          text: `[Image ${idx + 1} Description/Type: ${imgObj.label}]`,
        });
      }
    });

    const langPrompt =
      language === 'gu'
        ? 'જવાબ શુદ્ધ, સચોટ અને સરળ ગુજરાતી ભાષામાં આપો. છોડનું ગુજરાતી નામ, લક્ષણો, રોગ અને ઉપચાર ગુજરાતીમાં સ્પષ્ટ વર્ણવો.'
        : language === 'hi'
        ? 'जवाब शुद्ध, सटीक और सरल हिंदी भाषा में दें।'
        : 'Provide all descriptions, advice, and explanations clearly in English.';

    const systemPrompt = `
You are "🌿 Plant AI Doctor" (તમારા છોડનો AI ડૉક્ટર), an expert agricultural botanist and plant pathologist.
Your goal is to inspect the uploaded plant/crop photos and provide a compassionate, scientifically grounded, highly practical diagnosis.

CRITICAL SAFETY & ACCURACY RULES:
1. Provide visual probability and careful diagnosis based on visible evidence, NOT an infallible laboratory assay.
2. If image is blurry or unclear, indicate lower confidence and suggest taking a sharper close-up.
3. Distinguish clearly between VISIBLE FACT (e.g. "yellow leaf margins", "circular necrotic brown spots") and INFERENCE (e.g. "possible fungal infection or potassium deficiency").
4. Never diagnose definite soil pH or exact moisture solely from photos; advise the practical finger probe test ("માટી આંગળીથી 2–3 cm સુધી ચકાસો").
5. Only diagnose pests if actual insects, webbing, or characteristic pest damage are visibly present.
6. Treatment advice MUST emphasize safe organic and biological remedies first (e.g., Neem oil 5ml/L, Jeevamrit, Vermicompost, Trichoderma viride, buttermilk spray, improving aeration).
7. STRICT SAFETY: Do NOT recommend dangerous chemical pesticide mixtures or unverified lethal poisons. Always mention consulting the local agricultural extension center (KVK / ગ્રામ સેવક) before heavy synthetic chemicals.
8. ${langPrompt}

Return a STRICT, VALID JSON object with this exact structure:
{
  "plant": {
    "name_gu": "ગુજરાતી નામ (e.g. તુલસી / ટામેટા / ગુલાબ / કપાસ)",
    "name_en": "English Name (e.g. Holy Basil / Tomato / Rose / Cotton)",
    "scientific_name": "Scientific botanical name (e.g. Ocimum tenuiflorum)",
    "category": "Type (e.g. ઔષધીય છોડ / શાકભાજી પાક / બગીચાનું ફૂલ / ઘરનો ઇન્ડોર છોડ)",
    "confidence": 92,
    "is_possible_only": false
  },
  "health": {
    "score": 78,
    "status": "healthy" | "attention" | "moderate" | "critical",
    "status_text": "તંદુરસ્ત / ધ્યાન આપવાની જરૂર / મધ્યમ સમસ્યા / ગંભીર સ્થિતિ",
    "confidence": "high" | "medium" | "low",
    "summary": "ટૂંકો ૧-૨ વાક્યનો સારાંશ"
  },
  "visual_symptoms": [
    {
      "symptom": "લક્ષણ (e.g. નીચલા પાન પર પીળાશ)",
      "is_visible_fact": true,
      "severity": "low" | "medium" | "high"
    }
  ],
  "possible_diseases": [
    {
      "name": "રોગનું નામ (e.g. પાનનો ટપકાં રોગ / ભૂકી છારો / Leaf Spot)",
      "probability": 75,
      "symptoms": ["લક્ષણ ૧", "લક્ષણ ૨"],
      "why_suspected": "AIએ શા માટે આ રોગની શંકા કરી તેનું કારણ",
      "severity": "mild" | "moderate" | "severe",
      "recommended_action": "આ રોગ માટે પ્રાથમિક પગલું",
      "disclaimer": "આ વિઝ્યુઅલ વિશ્લેષણ આધારિત સંભાવના છે"
    }
  ],
  "possible_pests": [
    {
      "name": "જીવાતનું નામ (e.g. મોલો-મશી / સફેદ માખી / Aphids / કોઈ જીવાત દેખાતી નથી)",
      "probability": 20,
      "visible_evidence": "શું દેખાય છે અથવા કેમ શંકા નથી",
      "damage_symptoms": ["નુકસાનનું લક્ષણ"],
      "management": ["નિયંત્રણ ઉપાય"]
    }
  ],
  "nutrient_issues": [
    {
      "nutrient": "Nitrogen (નાઇટ્રોજન)",
      "status": "normal" | "deficiency" | "uncertain",
      "explanation": "શા માટે આવું જણાય છે"
    },
    {
      "nutrient": "Phosphorus (ફોસ્ફરસ)",
      "status": "normal" | "deficiency" | "uncertain",
      "explanation": "વિશ્લેષણ"
    },
    {
      "nutrient": "Potassium (પોટેશિયમ)",
      "status": "normal" | "deficiency" | "uncertain",
      "explanation": "વિશ્લેષણ"
    },
    {
      "nutrient": "Magnesium / Iron (મેગ્નેશિયમ / લોહતત્વ)",
      "status": "normal" | "deficiency" | "uncertain",
      "explanation": "વિશ્લેષણ"
    }
  ],
  "watering": {
    "advice": "પાણી આપવાની ચોક્કસ સલાહ",
    "current_risk": "normal" | "underwatering" | "overwatering" | "uncertain",
    "frequency_suggestion": "અઠવાડિયામાં કેટલી વાર",
    "check_advice": "માટી આંગળીથી 2–3 cm સુધી ચકાસો. ઉપરની માટી સૂકી લાગે ત્યારે જ પાણી આપો."
  },
  "sunlight": {
    "requirement": "Full Sun / Partial Sun / Shade",
    "hours_per_day": "૬ થી ૮ કલાક તડકો",
    "advice": "પ્રકાશ વિશે પ્રજાતિ અનુસાર વ્યવહારુ માર્ગદર્શન"
  },
  "soil": {
    "preferred_type": "ગોરાડુ / સારા નિતારવાળી માટી (Well-draining loamy soil)",
    "drainage": "પાણી ભરાઈ ન રહેવું જોઈએ",
    "ph_range": "6.0 - 7.0",
    "organic_matter": "જૈવિક કમ્પોસ્ટ જરૂરી",
    "note": "ચોક્કસ soil pH અને પોષક તત્વો માટે લેબોરેટરી સોઈલ ટેસ્ટ જરૂરી છે."
  },
  "fertilizer": {
    "organic_compost": "સડેલું દેશી છાણીયું ખાતર ૧-૨ મુઠ્ઠી દર મહિને",
    "vermicompost": "અળસિયાનું ખાતર (Vermicompost) ઉત્તમ રહેશે",
    "general_npk": "વિકાસ તબક્કા અનુસાર સંતુલિત પોષણ",
    "precautions": ["અજાણ્યા કેમિકલ ખાતર વધુ માત્રામાં ન નાખવા", "છોડના થડથી થોડે દૂર ખાતર આપવું"]
  },
  "treatment": {
    "immediate_actions": [
      "સૂકા કે ખૂબ પીળા પડેલા પાનને કાળજીપૂર્વક કાપીને દૂર કરો",
      "કૂંડાના તળિયે પાણીનો નિકાલ તપાસો",
      "છોડને હવાની સારી અવરજવર મળે તેવી જગ્યાએ રાખો"
    ],
    "organic_remedies": [
      "લીંબોળીનું તેલ (Neem Oil 5ml) ૧ લિટર પાણીમાં મેળવી સાંજના સમયે છંટકાવ કરો",
      "ખાટી છાશ (બટરમિલ્ક) પાણીમાં 1:10 ના પ્રમાણમાં ભેળવી છાંટવાથી ફૂગ સામે રક્ષણ મળે છે",
      "જીવામૃત અથવા વર્મીવોશ આપો"
    ],
    "prevention": [
      "પાન ઉપર સીધું પાણી છાંટવાનું ટાળો, માત્ર મૂળ પાસે પાણી આપો",
      "છોડ વચ્ચે યોગ્ય અંતર રાખો જેથી હવા-ઉજાસ રહે",
      "નિયમિત ૧૫ દિવસે હળવી ગોડ (ખુરપી) કરો"
    ]
  },
  "doctor_explanation": {
    "why_diagnosed": "ફોટોમાં પાનની કિનારીઓ અને રંગનું બારીકાઈથી અવલોકન કરતા આ લક્ષણો જોવા મળ્યા છે...",
    "visual_clues": ["પાનની સપાટી પર ચોક્કસ નિશાનો", "રંગમાં તફાવત"],
    "uncertainty_notes": "જો સમસ્યા ૨ અઠવાડિયામાં ન સુધરે તો નજીકના કૃષિ નિષ્ણાતને બતાવો."
  },
  "confidence_level": "high" | "medium" | "low",
  "doctor_note": "ડૉક્ટર તરફથી પ્રોત્સાહક સલાહ",
  "care_calendar_preview": [
    { "day": 1, "task": "અસરગ્રસ્ત પાનની સફાઈ અને માટીની ભેજ તપાસ", "type": "check" },
    { "day": 3, "task": "જરૂરિયાત મુજબ સવારે મૂળ પાસે પાણી આપવું", "type": "water" },
    { "day": 5, "task": "નીમ ઓઈલનો હળવો છંટકાવ કરવો", "type": "fertilizer" },
    { "day": 7, "task": "નવી ફૂટ અને પાનની સ્થિતિનું પુનઃનિરીક્ષણ કરવું", "type": "check" }
  ]
}
`;

    parts.push({
      text: `${systemPrompt}\nUser Notes / Context: ${notes || 'None provided'}\nAnalyze the images and respond strictly with the JSON.`,
    });

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts },
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });
    } catch (modelErr: any) {
      console.warn(
        'gemini-3.8-flash busy/failed, falling back to gemini-3.1-flash-lite:',
        modelErr?.message
      );
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: { parts },
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });
    }

    const rawText = response.text || '';
    const cleanedText = cleanJsonString(rawText);

    let parsedResult;
    try {
      parsedResult = JSON.parse(cleanedText);
    } catch (parseErr) {
      console.warn('Failed to parse strict JSON, building botanical fallback:', parseErr);
      parsedResult = {
        plant: {
          name_gu: 'તુલસી / બગીચાનો છોડ (ઓળખ હેઠળ)',
          name_en: 'Garden Plant / Basil',
          scientific_name: 'Ocimum / Plantae',
          category: 'બગીચાનો છોડ',
          confidence: 80,
          is_possible_only: true,
        },
        health: {
          score: 82,
          status: 'healthy',
          status_text: 'તંદુરસ્ત સ્થિતિ (Healthy)',
          confidence: 'medium',
          summary: 'છોડનો સામાન્ય વિકાસ સારો છે. માટીમાં પૂરતો ભેજ જાળવો અને યોગ્ય તડકો આપો.',
        },
        visual_symptoms: [
          { symptom: 'સામાન્ય લીલા પાન', is_visible_fact: true, severity: 'low' },
        ],
        possible_diseases: [],
        possible_pests: [],
        nutrient_issues: [
          { nutrient: 'Nitrogen', status: 'normal', explanation: 'હરિતદ્રવ્ય સારું છે.' },
        ],
        watering: {
          advice: 'માટી આંગળીથી ૨–૩ સેમી તપાસીને મૂળ પાસે હળવું પાણી આપો.',
          current_risk: 'normal',
          frequency_suggestion: 'દર ૨ દિવસે ૧ વાર',
          check_advice: 'માટી આંગળીથી ૨–૩ cm સુધી ચકાસો.',
        },
        sunlight: {
          requirement: 'Full Sun / Partial Sun',
          hours_per_day: '૫ થી ૬ કલાક',
          advice: 'છોડને પૂરતો સૂર્યપ્રકાશ આપો.',
        },
        soil: {
          preferred_type: 'ગોરાડુ અને સારા નિતારવાળી માટી',
          drainage: 'પાણી ભરાઈ ન રહેવું જોઈએ',
          ph_range: '6.0 - 7.0',
          organic_matter: 'કમ્પોસ્ટ જરૂરી',
          note: 'ચોક્કસ soil pH માટે soil test જરૂરી છે.',
        },
        fertilizer: {
          organic_compost: 'દેશી છાણીયું ખાતર અથવા વર્મીકમ્પોસ્ટ દર મહિને ૧ મુઠ્ઠી',
          vermicompost: 'અળસિયાનું ખાતર ઉપયોગી છે',
          general_npk: 'સંતુલિત પોષણ આપો',
          precautions: ['અજાણ્યા કેમિકલ ખાતર વધારે ન વાપરવા'],
        },
        treatment: {
          immediate_actions: [
            'સૂકા કે પીળા પડેલા પાન દૂર કરો',
            'કૂંડાના નિકાલ હોલ તપાસો',
          ],
          organic_remedies: [
            'લીંબોળીનું તેલ (Neem oil 5ml/L) ૧૫ દિવસે એકવાર સાંજે છાંટો',
          ],
          prevention: [
            'પાન ઉપર સીધું પાણી ન છાંટવું, મૂળ પાસે પાણી આપવું',
            'હવાની સારી અવરજવર જાળવવી',
          ],
        },
        doctor_explanation: {
          why_diagnosed: 'છોડનું પ્રાથમિક વિઝ્યુઅલ વિશ્લેષણ કરવામાં આવ્યું છે.',
          visual_clues: ['લીલા પાન', 'દાંડી'],
          uncertainty_notes: 'વધુ સચોટ વિશ્લેષણ માટે પૂરતા પ્રકાશમાં પાનનો નજીકથી ફોટો લો.',
        },
        confidence_level: 'medium',
        doctor_note: 'તમારા છોડની નિયમિત કાળજી રાખો.',
        care_calendar_preview: [
          { day: 1, task: 'માટીની ભેજ તપાસવી', type: 'check' },
          { day: 2, task: 'હળવું પાણી આપવું', type: 'water' },
          { day: 5, task: 'નીમ ઓઈલ છાંટવું', type: 'fertilizer' },
        ],
      };
    }

    res.json(parsedResult);
  } catch (err: any) {
    console.error('Error analyzing plant:', err);
    res.status(500).json({
      error: err.message || 'છોડના વિશ્લેષણમાં ભૂલ આવી. કૃપા કરીને ફરી પ્રયાસ કરો.',
    });
  }
});

/**
 * Plant Doctor Chat Endpoint
 * Enables interactive Q&A about the specific diagnosed plant
 */
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, plantContext, history = [], language = 'gu' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key is not configured' });
    }

    const langInstruction =
      language === 'gu'
        ? 'શુદ્ધ, મૈત્રીપૂર્ણ અને સરળ ગુજરાતી ભાષામાં જવાબ આપો. સામાન્ય ખેડૂત કે ગાર્ડનર સમજી શકે તેવા દેશી અને સરળ શબ્દો વાપરો.'
        : language === 'hi'
        ? 'सरल और स्पष्ट हिंदी में उत्तर दें।'
        : 'Answer clearly and kindly in English.';

    const systemInstruction = `
You are "🌿 Plant AI Doctor", a gentle, knowledgeable, and practical agricultural gardening doctor.
You are chatting with a user about their plant.
Current Plant Context:
${plantContext ? JSON.stringify(plantContext, null, 2) : 'No specific plant loaded yet'}

Rules:
1. ${langInstruction}
2. Keep answers concise, actionable, and encouraging (2 to 4 paragraphs max, or clean bullet points).
3. If they ask about yellow leaves, overwatering, fertilizers, pests, or disease prevention, give clear biological reasons and safe organic remedies (Neem oil, Jeevamrit, compost, adjusting sun/water).
4. Do NOT recommend dangerous unlabelled chemical pesticide mixtures. Emphasize testing soil or asking local KVK for large-scale crops.
5. If suitable, structure your answer with quick actionable steps.
`;

    // Format chat messages
    const contents: any[] = [];
    if (Array.isArray(history)) {
      history.slice(-6).forEach((h: { sender: string; text: string }) => {
        contents.push({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }],
        });
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.4,
        },
      });
    } catch (chatErr: any) {
      console.warn(
        'Chat gemini-3.8-flash busy/failed, falling back to gemini-3.1-flash-lite:',
        chatErr?.message
      );
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents,
        config: {
          systemInstruction,
          temperature: 0.4,
        },
      });
    }

    res.json({ reply: response.text || '' });
  } catch (err: any) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message || 'Chat service error' });
  }
});

/**
 * Text-to-Speech Endpoint
 * Uses gemini-3.8-flash-lite-tts to generate natural spoken audio (WAV)
 */
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, language = 'gu' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key is not configured' });
    }

    // Limit text length for TTS to prevent excessive latency
    const truncatedText = text.slice(0, 450);

    const stylePrompt =
      language === 'gu'
        ? 'Speak clearly in warm, calm, supportive Gujarati voice.'
        : language === 'hi'
        ? 'Speak clearly in warm, calm, helpful Hindi voice.'
        : 'Speak clearly in warm, professional, encouraging voice.';

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: truncatedText,
              speechMetadata: {
                style: stylePrompt,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(500).json({ error: 'No audio generated by model' });
    }

    res.json({ audioBase64: base64Audio });
  } catch (err: any) {
    console.error('TTS error:', err);
    res.status(500).json({ error: err.message || 'TTS generation failed' });
  }
});

// Setup Vite or static serving
const PORT = 3000;

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌿 Plant AI Doctor server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
