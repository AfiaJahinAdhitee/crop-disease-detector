import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Adjust these without touching app logic
const CONFIG = {
  window_days: 30,
  max_diseases_per_region: 5,
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const SEV_ORDER = { low: 0, medium: 1, high: 2 }

export async function GET() {
  try {
    const since = new Date()
    since.setDate(since.getDate() - CONFIG.window_days)

    const { data, error } = await supabase
      .from('diagnoses')
      .select('region, disease_name, severity, confidence')
      .eq('is_healthy', false)
      .gte('created_at', since.toISOString())
      .not('region', 'is', null)
      .neq('region', '')

    if (error) throw error

    const byRegion = {}
    for (const row of data) {
      const r = (row.region || '').trim()
      if (!r) continue
      if (!byRegion[r]) byRegion[r] = { total: 0, diseases: {}, max_severity: 'low' }
      byRegion[r].total++
      const d = row.disease_name || 'Unknown'
      byRegion[r].diseases[d] = (byRegion[r].diseases[d] || 0) + 1
      const sev = row.severity || 'low'
      if ((SEV_ORDER[sev] ?? 0) > (SEV_ORDER[byRegion[r].max_severity] ?? 0)) {
        byRegion[r].max_severity = sev
      }
    }

    const result = Object.entries(byRegion).map(([region, v]) => ({
      region,
      total: v.total,
      max_severity: v.max_severity,
      diseases: Object.entries(v.diseases)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, CONFIG.max_diseases_per_region),
    }))

    return NextResponse.json({ data: result, window_days: CONFIG.window_days })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
