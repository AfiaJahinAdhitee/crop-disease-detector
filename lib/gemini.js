import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']

const PROMPT = (cropType) => `You are an expert plant pathologist. Analyze this ${cropType} leaf image.

Respond ONLY with a valid JSON object in this exact format, no markdown, no extra text:
{
  "disease_detected": true or false,
  "disease_name": "name of disease, or 'Healthy' if none",
  "confidence_score": a number between 0.0 and 1.0,
  "severity": "none" or "low" or "medium" or "high" or "critical",
  "symptoms": "brief description of visible symptoms",
  "description": "explanation of the disease or why the plant is healthy",
  "treatment": "specific treatment steps if diseased, otherwise empty string",
  "prevention": "prevention advice for future crops",
  "remedies": ["step 1", "step 2"]
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
      if (is503) {
        lastError = err
        continue // try next model
      }
      throw err // non-503 error, don't retry
    }
  }

  throw lastError
}