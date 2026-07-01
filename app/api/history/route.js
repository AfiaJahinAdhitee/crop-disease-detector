import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUserId } from '@/lib/server-auth'

export const dynamic = 'force-dynamic'

async function getSignedUrl(supabaseAdmin, path) {
  if (!path) return null
  const { data } = await supabaseAdmin.storage
    .from('leaf-images')
    .createSignedUrl(path, 3600) // 1-hour TTL
  return data?.signedUrl ?? null
}

export async function GET() {
  try {
    const userId = await getUserId()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data, error } = await supabaseAdmin
      .from('diagnoses')
      .select('id, crop_type, plant_part, region, disease_name, severity, confidence, is_healthy, image_url, source, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error

    // Attach signed image URLs
    const history = await Promise.all(
      (data || []).map(async (row) => ({
        ...row,
        image_signed_url: await getSignedUrl(supabaseAdmin, row.image_url),
      }))
    )

    return NextResponse.json({ history })
  } catch (err) {
    console.error('[history GET]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
