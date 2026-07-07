import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash-lite']

// Part-specific Bengali prompts
const PART_CONTEXT = {
  leaf: {
    bn: 'পাতার',
    focus: 'পাতার রঙ, দাগ, কুঁচকানো, শুকিয়ে যাওয়া, ছিদ্র এবং অন্যান্য দৃশ্যমান লক্ষণ',
  },
  root: {
    bn: 'শিকড়ের',
    focus: 'শিকড়ের পচন, রঙ পরিবর্তন, নোডুল, ছত্রাক সংক্রমণ এবং গঠনগত পরিবর্তন',
  },
  fruit: {
    bn: 'ফলের',
    focus: 'ফলের দাগ, পচন, রঙ পরিবর্তন, বিকৃতি, পোকার আক্রমণ এবং অকাল ঝরে পড়া',
  },
  flower: {
    bn: 'ফুলের',
    focus: 'ফুলের বিবর্ণতা, পচন, ঝরে পড়া, বিকৃতি এবং পরাগায়ন সমস্যার লক্ষণ',
  },
  body: {
    bn: 'কান্ড ও শাখার',
    focus: 'কান্ডের ফাটল, পচন, ছাল উঠে যাওয়া, ক্যাংকার, গামোসিস এবং শাখার শুকিয়ে যাওয়া',
  },
}

const PROMPT = (cropType, plantPart, userDescription, weather) => {
  const ctx = PART_CONTEXT[plantPart] || PART_CONTEXT.leaf
  const weatherLine = weather
    ? `বর্তমান আবহাওয়া (${weather.district}): তাপমাত্রা ${weather.temperature}°C, আর্দ্রতা ${weather.humidity}%, বৃষ্টিপাত ${weather.precipitation}mm, বাতাস ${weather.windSpeed} km/h, অবস্থা: ${weather.description}।`
    : ''
  return `আপনি একজন বিশেষজ্ঞ উদ্ভিদ রোগ বিশেষজ্ঞ। এই ${cropType} গাছের ${ctx.bn} ছবি বিশ্লেষণ করুন।
বিশেষভাবে লক্ষ্য করুন: ${ctx.focus}।
${userDescription ? `ব্যবহারকারীর অতিরিক্ত পর্যবেক্ষণ/বিবরণ: "${userDescription}"` : ''}
${weatherLine}

শুধুমাত্র এই exact JSON format এ বাংলায় উত্তর দিন, কোনো markdown বা extra text ছাড়া:
{
  "disease_detected": true or false,
  "disease_name": "রোগের নাম, অথবা 'সুস্থ' যদি কোনো রোগ না থাকে",
  "confidence_score": 0.0 থেকে 1.0 এর মধ্যে একটি সংখ্যা,
  "severity": "none" অথবা "low" অথবা "medium" অথবা "high" অথবা "critical",
  "symptoms": "দৃশ্যমান লক্ষণের সংক্ষিপ্ত বিবরণ বাংলায় (${ctx.bn} উপর ভিত্তি করে)",
  "description": "রোগের ব্যাখ্যা অথবা কেন গাছটি সুস্থ তা বাংলায়",
  "treatment": "রোগ হলে নির্দিষ্ট চিকিৎসার পদক্ষেপ বাংলায়, অন্যথায় খালি string",
  "prevention": "ভবিষ্যৎ ফসলের জন্য প্রতিরোধমূলক পরামর্শ বাংলায়",
  "remedies": ["পদক্ষেপ ১", "পদক্ষেপ ২"]
}`
}

/**
 * Analyzes a crop image for disease using Gemini.
 *
 * @param {string} base64Image     - base64-encoded image data
 * @param {string} mimeType        - e.g. "image/jpeg"
 * @param {string} cropType        - e.g. "Tomato"
 * @param {string} userDescription - Optional additional user context
 * @param {string} plantPart       - "leaf" | "root" | "fruit" | "flower" | "body"
 * @returns {Promise<object>}      - structured diagnosis object
 */
export async function analyzeCropImage(base64Image, mimeType, cropType, userDescription = '', plantPart = 'leaf', weather = null) {
  let lastError

  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            parts: [
              { inlineData: { mimeType, data: base64Image } },
              { text: PROMPT(cropType, plantPart, userDescription, weather) },
            ],
          },
        ],
      })

      const text = response.candidates[0].content.parts[0].text
      const clean = text.replace(/```json\n?|\n?```/g, '').trim()
      return JSON.parse(clean)
    } catch (err) {
      const shouldRetry = err?.message?.includes('503')
        || err?.message?.includes('UNAVAILABLE')
        || err?.message?.includes('429')
        || err?.message?.includes('RESOURCE_EXHAUSTED')
        || err?.message?.includes('404')
        || err?.message?.includes('NOT_FOUND')
      if (shouldRetry) {
        lastError = err
        continue
      }
      throw err
    }
  }

  throw lastError
}

// Used when custom model already detected the disease.
// The disease_detected/disease_name/confidence_score/severity fields are
// derived directly from the custom model's own result (not from Gemini),
// so treatment/weather/YouTube cards — which key off these fields — show up
// consistently even if the Gemini text-enrichment call below fails.
export async function analyzeCropImageBangla(base64Image, mimeType, cropType, diseaseName, confidence, plantPart = 'leaf') {
  const cleanDisease = diseaseName
    .replace(/_+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim()

  const isHealthy = diseaseName.toLowerCase().includes('healthy')
  const ctx = PART_CONTEXT[plantPart] || PART_CONTEXT.leaf

  const coreFields = {
    disease_detected: !isHealthy,
    disease_name: cleanDisease,
    confidence_score: parseFloat((confidence / 100).toFixed(2)),
    severity: isHealthy ? 'none' : 'medium',
  }

  const fallback = {
    ...coreFields,
    symptoms: isHealthy ? 'গাছটি সুস্থ, কোনো রোগের লক্ষণ নেই' : '',
    description: '',
    treatment: isHealthy ? '' : 'বিস্তারিত চিকিৎসার তথ্যের জন্য নিচের ট্রিটমেন্ট কার্ড দেখুন।',
    prevention: '',
    remedies: [],
  }

  const prompt = `
আপনি একজন বিশেষজ্ঞ উদ্ভিদ রোগ বিশেষজ্ঞ।
একটি AI মডেল এই ${cropType} গাছের ${ctx.bn} বিশ্লেষণ করে "${cleanDisease}" শনাক্ত করেছে।
আত্মবিশ্বাসের মাত্রা: ${confidence}%

শুধুমাত্র এই exact JSON format এ বাংলায় উত্তর দিন, কোনো markdown ছাড়া:
{
  "disease_detected": ${isHealthy ? false : true},
  "disease_name": "${cleanDisease}",
  "confidence_score": ${(confidence / 100).toFixed(2)},
  "severity": "${isHealthy ? 'none' : 'medium'}",
  "symptoms": "${isHealthy ? 'গাছটি সুস্থ, কোনো রোগের লক্ষণ নেই' : `${ctx.bn} রোগের লক্ষণ বাংলায় লিখুন`}",
  "description": "এই ${cropType} গাছের ${ctx.bn} সম্পর্কে সঠিক বাংলা বিবরণ লিখুন",
  "treatment": "${isHealthy ? '' : 'চিকিৎসার পদক্ষেপ বাংলায়'}",
  "prevention": "প্রতিরোধমূলক পরামর্শ বাংলায়",
  "remedies": ["পদক্ষেপ ১", "পদক্ষেপ ২"]
}
`

  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [{ parts: [{ text: prompt }] }],
      })

      const text = response.candidates[0].content.parts[0].text
      const clean = text.replace(/```json\n?|\n?```/g, '').trim()
      const parsed = JSON.parse(clean)
      // Core fields always come from the custom model's own result, never from Gemini's text pass.
      return { ...parsed, ...coreFields }
    } catch (err) {
      continue
    }
  }

  // All Gemini attempts failed to produce valid enrichment text — fall back to
  // the custom model's own result so the diagnosis (and its cards) still render.
  return fallback
}