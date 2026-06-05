import { createClient } from '@/lib/supabase'
import { analyzeCropImage } from '@/lib/gemini'

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

    if (!imageFile.type.startsWith('image/')) {
      return Response.json(
        { success: false, error: 'Uploaded file must be an image.' },
        { status: 400 }
      )
    }

    // Convert image to base64 for Gemini
    const imageBytes = await imageFile.arrayBuffer()
    const base64Image = Buffer.from(imageBytes).toString('base64')

    const diagnosis = await analyzeCropImage(base64Image, imageFile.type, cropType)

    // Save to Supabase if user is logged in
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

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
      })
    }

    return Response.json({ success: true, diagnosis })
  } catch (error) {
    console.error('Diagnosis error:', error)
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}