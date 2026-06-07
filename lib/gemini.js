import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash-lite']
const PROMPT = (cropType) => `আপনি একজন বিশেষজ্ঞ উদ্ভিদ রোগ বিশেষজ্ঞ। এই ${cropType} পাতার ছবি বিশ্লেষণ করুন।

শুধুমাত্র এই exact JSON format এ বাংলায় উত্তর দিন, কোনো markdown বা extra text ছাড়া:
{
  "disease_detected": true or false,
  "disease_name": "রোগের নাম, অথবা 'সুস্থ' যদি কোনো রোগ না থাকে",
  "confidence_score": 0.0 থেকে 1.0 এর মধ্যে একটি সংখ্যা,
  "severity": "none" অথবা "low" অথবা "medium" অথবা "high" অথবা "critical",
  "symptoms": "দৃশ্যমান লক্ষণের সংক্ষিপ্ত বিবরণ বাংলায়",
  "description": "রোগের ব্যাখ্যা অথবা কেন গাছটি সুস্থ তা বাংলায়",
  "treatment": "রোগ হলে নির্দিষ্ট চিকিৎসার পদক্ষেপ বাংলায়, অন্যথায় খালি string",
  "prevention": "ভবিষ্যৎ ফসলের জন্য প্রতিরোধমূলক পরামর্শ বাংলায়",
  "remedies": ["পদক্ষেপ ১", "পদক্ষেপ ২"]
}`

/**
 * Analyzes a crop leaf image for disease using Gemini.
 * Tries models in order: gemini-2.5-flash → gemini-2.0-flash → gemini-1.5-flash
 *
 * @param {string} base64Image  - base64-encoded image data
 * @param {string} mimeType     - e.g. "image/jpeg"
 * @param {string} cropType     - e.g. "Tomato"
 * @returns {Promise<object>}   - structured diagnosis object
 */
export async function analyzeCropImage(base64Image, mimeType, cropType) {
  let lastError

  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            parts: [
              { inlineData: { mimeType, data: base64Image } },
              { text: PROMPT(cropType) },
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
        continue // try next model
      }
      throw err // non-retryable error, bail immediately
    }
  }

  throw lastError
}

//updates for using trained model
// Used when custom model already detected the disease
// Just generates Bangla explanation from the disease name
export async function analyzeCropImageBangla(base64Image, mimeType, cropType, diseaseName, confidence) {
  
  // Clean up the class name for Gemini
  const cleanDisease = diseaseName
    .replace(/_+/g, ' ')        // Pepper__bell___healthy → Pepper bell healthy
    .replace(/([a-z])([A-Z])/g, '$1 $2')  // camelCase → camel Case
    .trim()

  const isHealthy = diseaseName.toLowerCase().includes('healthy')

  const prompt = `
আপনি একজন বিশেষজ্ঞ উদ্ভিদ রোগ বিশেষজ্ঞ।
একটি AI মডেল এই ${cropType} গাছের পাতা বিশ্লেষণ করে "${cleanDisease}" শনাক্ত করেছে।
আত্মবিশ্বাসের মাত্রা: ${confidence}%

শুধুমাত্র এই exact JSON format এ বাংলায় উত্তর দিন, কোনো markdown ছাড়া:
{
  "disease_detected": ${isHealthy ? false : true},
  "disease_name": "${cleanDisease}",
  "confidence_score": ${(confidence / 100).toFixed(2)},
  "severity": "${isHealthy ? 'none' : 'medium'}",
  "symptoms": "${isHealthy ? 'গাছটি সুস্থ, কোনো রোগের লক্ষণ নেই' : 'রোগের লক্ষণ বাংলায় লিখুন'}",
  "description": "এই ${cropType} গাছ সম্পর্কে সঠিক বাংলা বিবরণ লিখুন",
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
      return JSON.parse(clean)
    } catch (err) {
      continue
    }
  }
}