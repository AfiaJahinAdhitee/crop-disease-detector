export const runtime = 'nodejs'
import { createClient } from '@/lib/supabase'
import { analyzeCropImage, analyzeCropImageBangla } from '@/lib/gemini'
import sharp from 'sharp'

const SUPPORTED_CROPS = ["tomato", "potato", "pepper"]

async function runCustomModel(imageFile, cropType) {
  const pythonForm = new FormData()
  pythonForm.append("image", imageFile)
  pythonForm.append("cropType", cropType) // ← add this

  const res = await fetch("http://localhost:5000/predict", {
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



    if (SUPPORTED_CROPS.includes(cropType.toLowerCase())) {
      console.log("🧠 Using CUSTOM MODEL for:", cropType)
      const modelResult = await runCustomModel(imageFile, cropType)
      console.log("🧠 Custom model result:", modelResult)

      const diseaseMatchesCrop = modelResult.disease.toLowerCase().includes(cropType.toLowerCase())

      if (!diseaseMatchesCrop) {
        // Model result doesn't match crop — just use Gemini
        console.log(`⚠️ Model returned "${modelResult.disease}" for crop "${cropType}" — falling back to Gemini`)
        diagnosis = await analyzeCropImage(base64Image, 'image/jpeg', cropType)
        diagnosis.source = "gemini_fallback"
      } else {
        // Model result matches crop — get Bangla explanation
        diagnosis = await analyzeCropImageBangla(
          base64Image,
          'image/jpeg',
          cropType,
          modelResult.disease,
          modelResult.confidence
        )
        diagnosis.source = "custom_model"

        // ✅ Cross-check with Gemini
        console.log("🔍 Cross-checking with Gemini...")
        const geminiResult = await analyzeCropImage(base64Image, 'image/jpeg', cropType)

        const modelDisease = modelResult.disease.toLowerCase().replace(/_+/g, ' ')
        const geminiDisease = geminiResult.disease_name?.toLowerCase() || ''
        const modelIsHealthy = modelDisease.toLowerCase().includes('healthy')
        const geminiIsHealthy = !geminiResult.disease_detected

        // Check 1: both agree on healthy vs diseased
        const bothAgreeOnHealth = modelIsHealthy === geminiIsHealthy

        // Check 2: if both say diseased, check if disease keywords match
        const modelKeywords = modelDisease
          .replace(cropType.toLowerCase(), '')
          .replace(/_+/g, ' ')
          .trim()
          .split(' ')
          .filter(w => w.length > 3)

        const diseaseNamesMatch = modelKeywords.some(word =>
          geminiDisease.includes(word)
        )

        const geminiAgrees = bothAgreeOnHealth && (modelIsHealthy || diseaseNamesMatch)

        console.log(`🔍 Model healthy: ${modelIsHealthy} | Gemini healthy: ${geminiIsHealthy}`)
        console.log(`🔍 Both agree on health: ${bothAgreeOnHealth}`)
        console.log(`🔍 Disease names match: ${diseaseNamesMatch}`)
        console.log(`🔍 Gemini agrees: ${geminiAgrees}`)
        console.log(`🔍 Model keywords: ${modelKeywords}`)
        console.log(`🔍 Gemini disease: ${geminiDisease}`)
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
      console.log("✨ Using GEMINI for:", cropType)
      diagnosis = await analyzeCropImage(base64Image, 'image/jpeg', cropType)
      diagnosis.source = "gemini"
    }

    console.log("📊 Final diagnosis source:", diagnosis.source)
    if (secondOpinion) console.log("📊 Second opinion from Gemini included")

    // Save to Supabase
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      await supabase.from('diagnoses').insert({
        user_id: user.id,
        crop_type: cropType,
        region: region || null,
        disease_name: diagnosis.disease_name,
        severity: diagnosis.severity,
        confidence_score: diagnosis.confidence_score,
        treatment: diagnosis.treatment,
        prevention: diagnosis.prevention,
        is_healthy: !diagnosis.disease_detected,
        raw_ai_response: JSON.stringify(diagnosis),
        source: diagnosis.source,
      })
    }

    return Response.json({ success: true, diagnosis, secondOpinion })
  } catch (error) {
    console.error('Diagnosis error:', error)
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
// export const runtime = 'nodejs'
// import { createClient } from '@/lib/supabase'
// import { analyzeCropImage } from '@/lib/gemini'
// import sharp from 'sharp'


// export async function POST(request) {
//   try {
//     const formData = await request.formData()
//     const imageFile = formData.get('image')
//     const cropType = formData.get('cropType')
//     const region = formData.get('region')

//     if (!imageFile || !cropType) {
//       return Response.json(
//         { success: false, error: 'Image and crop type are required.' },
//         { status: 400 }
//       )
//     }

//     if (!imageFile.type.startsWith('image/')) {
//       return Response.json(
//         { success: false, error: 'Uploaded file must be an image.' },
//         { status: 400 }
//       )
//     }

//     // Read, compress, then convert to base64
//     const imageBytes = await imageFile.arrayBuffer()
//     const compressed = await sharp(Buffer.from(imageBytes))
//       .resize({ width: 1200, withoutEnlargement: true })
//       .jpeg({ quality: 80 })
//       .toBuffer()
//     const base64Image = compressed.toString('base64')

//     const diagnosis = await analyzeCropImage(base64Image, 'image/jpeg', cropType)

//     // Save to Supabase if user is logged in
//     const supabase = createClient()
//     const {
//       data: { user },
//     } = await supabase.auth.getUser()

//     if (user) {
//       await supabase.from('diagnoses').insert({
//         user_id: user.id,
//         crop_type: cropType,
//         region: region || null,
//         disease_name: diagnosis.disease_name,
//         severity: diagnosis.severity,
//         confidence_score: diagnosis.confidence_score,
//         treatment: diagnosis.treatment,
//         prevention: diagnosis.prevention,
//         is_healthy: !diagnosis.disease_detected,
//         raw_ai_response: JSON.stringify(diagnosis),
//       })
//     }

//     return Response.json({ success: true, diagnosis })
//   } catch (error) {
//     console.error('Diagnosis error:', error)
//     return Response.json(
//       { success: false, error: error.message },
//       { status: 500 }
//     )
//   }
// }