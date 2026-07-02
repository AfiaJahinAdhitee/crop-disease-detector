export const runtime = 'nodejs'
import { randomUUID } from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { getUserId } from '@/lib/server-auth'
import { analyzeCropImage, analyzeCropImageBangla } from '@/lib/gemini'
import sharp from 'sharp'
import { getDistrictWeather } from '@/lib/weather'

const SUPPORTED_CROPS = ["tomato", "potato", "pepper"]

async function runCustomModel(imageFile, cropType) {
  const pythonForm = new FormData()
  pythonForm.append("image", imageFile)
  pythonForm.append("cropType", cropType)

  const res = await fetch("https://alshahriaralif2004-crop-disease-model-api.hf.space/predict", {
    method: "POST",
    body: pythonForm,
  })
  return await res.json()
}

export async function POST(request) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get('image')
    const cropType = formData.get('cropType')
    const region = formData.get('region')
    const userDescription = formData.get('userDescription') || ''
    const plantPart = formData.get('plantPart') || 'leaf'

    if (!imageFile || !cropType) {
      return Response.json(
        { success: false, error: 'Image and crop type are required.' },
        { status: 400 }
      )
    }

    const imageBytes = await imageFile.arrayBuffer()
    const compressed = await sharp(Buffer.from(imageBytes))
      .resize({ width: 1200, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer()
    const base64Image = compressed.toString('base64')

    let diagnosis
    let secondOpinion = null

    // Fetch weather for the district (non-blocking — if it fails, we proceed without it)
    const weather = await getDistrictWeather(region)
    if (weather) {
      console.log(`🌤️ Weather for ${weather.district}: ${weather.temperature}°C, ${weather.humidity}% humidity, ${weather.description}`)
    }

    // Only use custom model for LEAVES — it is not trained for other parts
    if (SUPPORTED_CROPS.includes(cropType.toLowerCase()) && plantPart === 'leaf') {
      console.log("🧠 Using CUSTOM MODEL for:", cropType)
      const modelResult = await runCustomModel(imageFile, cropType)
      console.log("🧠 Custom model result:", modelResult)

      const diseaseMatchesCrop = modelResult.disease.toLowerCase().includes(cropType.toLowerCase())

      if (!diseaseMatchesCrop) {
        console.log(`⚠️ Model returned "${modelResult.disease}" for crop "${cropType}" — falling back to Gemini`)
        diagnosis = await analyzeCropImage(base64Image, 'image/jpeg', cropType, userDescription, plantPart, weather)
        diagnosis.source = "gemini_fallback"
      } else {
        diagnosis = await analyzeCropImageBangla(
          base64Image,
          'image/jpeg',
          cropType,
          modelResult.disease,
          modelResult.confidence,
          plantPart
        )
        diagnosis.source = "custom_model"

        // Cross-check with Gemini
        console.log("🔍 Cross-checking with Gemini...")
        const geminiResult = await analyzeCropImage(base64Image, 'image/jpeg', cropType, userDescription, plantPart, weather)

        const modelDisease = modelResult.disease.toLowerCase().replace(/_+/g, ' ')
        const geminiDisease = geminiResult.disease_name?.toLowerCase() || ''
        const modelIsHealthy = modelDisease.includes('healthy')
        const geminiIsHealthy = !geminiResult.disease_detected

        const bothAgreeOnHealth = modelIsHealthy === geminiIsHealthy

        const modelKeywords = modelDisease
          .replace(cropType.toLowerCase(), '')
          .replace(/_+/g, ' ')
          .trim()
          .split(' ')
          .filter(w => w.length > 3)

        const diseaseNamesMatch = modelKeywords.some(word => geminiDisease.includes(word))
        const geminiAgrees = bothAgreeOnHealth && (modelIsHealthy || diseaseNamesMatch)

        console.log(`🔍 Model healthy: ${modelIsHealthy} | Gemini healthy: ${geminiIsHealthy}`)
        console.log(`🔍 Both agree on health: ${bothAgreeOnHealth}`)
        console.log(`🔍 Disease names match: ${diseaseNamesMatch}`)
        console.log(`🔍 Gemini agrees: ${geminiAgrees}`)

        if (!geminiAgrees) {
          console.log(`⚠️ Gemini disagrees! Model: "${modelResult.disease}" | Gemini: "${geminiResult.disease_name}"`)
          geminiResult.source = "gemini"
          secondOpinion = geminiResult
        } else {
          console.log(`✅ Gemini agrees with custom model!`)
        }
      }

    } else {
      console.log(`✨ Using GEMINI for: ${cropType} (part: ${plantPart})`)
      diagnosis = await analyzeCropImage(base64Image, 'image/jpeg', cropType, userDescription, plantPart, weather)
      diagnosis.source = "gemini"
    }

    const userId = await getUserId()

    if (userId) {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )

      const diagnosisId = randomUUID()

      // Upload compressed image to storage — non-blocking, best-effort
      let imageStoragePath = null
      try {
        const storagePath = `${userId}/${diagnosisId}.jpg`
        const { error: uploadError } = await supabaseAdmin.storage
          .from('leaf-images')
          .upload(storagePath, compressed, { contentType: 'image/jpeg', upsert: false })
        if (!uploadError) {
          imageStoragePath = storagePath
        } else {
          console.warn('⚠️ Image upload failed:', uploadError.message)
        }
      } catch (e) {
        console.warn('⚠️ Image upload exception:', e.message)
      }

      const { error: insertError } = await supabaseAdmin.from('diagnoses').insert({
        id: diagnosisId,
        user_id: userId,
        crop_type: cropType,
        region: region || null,
        plant_part: plantPart,
        disease_name: diagnosis.disease_name,
        severity: diagnosis.severity,
        confidence: parseFloat(((diagnosis.confidence_score || 0) * 100).toFixed(1)),
        treatment: diagnosis.treatment,
        prevention: diagnosis.prevention,
        is_healthy: !diagnosis.disease_detected,
        raw_ai_response: JSON.stringify(diagnosis),
        source: diagnosis.source,
        image_url: imageStoragePath,
      })

      if (insertError) {
        console.error('❌ Supabase insert error:', insertError.message)
      } else {
        console.log('✅ Diagnosis saved:', diagnosisId)
      }
    }

    return Response.json({ success: true, diagnosis, secondOpinion, weather })
  } catch (error) {
    console.error('Diagnosis error:', error)
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}