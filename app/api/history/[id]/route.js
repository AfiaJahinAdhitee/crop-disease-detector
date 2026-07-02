import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUserId } from '@/lib/server-auth'

export const dynamic = 'force-dynamic'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

// GET /api/history/[id] — full detail for a single diagnosis
export async function GET(request, { params }) {
  try {
    const { id } = await params
    const userId = await getUserId()

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabaseAdmin = adminClient()

    const { data, error } = await supabaseAdmin
      .from('diagnoses')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    let image_signed_url = null
    if (data.image_url) {
      const { data: signed } = await supabaseAdmin.storage
        .from('leaf-images')
        .createSignedUrl(data.image_url, 3600)
      image_signed_url = signed?.signedUrl ?? null
    }

    return NextResponse.json({ diagnosis: { ...data, image_signed_url } })
  } catch (err) {
    console.error('[history/[id] GET]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/history/[id]
export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    const userId = await getUserId()

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabaseAdmin = adminClient()

    // Fetch first to confirm ownership and get image path
    const { data: row } = await supabaseAdmin
      .from('diagnoses')
      .select('image_url, user_id')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (!row) {
      // Either doesn't exist or belongs to another user — same 404 to avoid enumeration
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Remove stored image (best-effort, don't block delete on failure)
    if (row.image_url) {
      await supabaseAdmin.storage.from('leaf-images').remove([row.image_url])
    }

    const { error } = await supabaseAdmin
      .from('diagnoses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[history/[id] DELETE]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
