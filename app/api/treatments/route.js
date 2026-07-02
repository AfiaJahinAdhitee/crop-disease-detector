import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

function loadTreatments() {
  const filePath = join(process.cwd(), 'data', 'treatments.json')
  return JSON.parse(readFileSync(filePath, 'utf-8'))
}

function normalize(str) {
  return (str || '').toLowerCase().trim().replace(/\s+/g, ' ')
}

function scoreMatch(entry, diseaseQuery, cropQuery) {
  const q = normalize(diseaseQuery)
  if (!q) return 0

  let best = 0

  for (const keyword of entry.keywords) {
    const kw = normalize(keyword)
    if (!kw) continue

    if (q.includes(kw) || kw.includes(q)) {
      const score = Math.min(q.length, kw.length)
      if (score > best) best = score
    }
  }

  // Bonus when crop type matches the entry's crop field
  if (best > 0 && cropQuery && normalize(entry.crop) === normalize(cropQuery)) {
    best += 10
  }

  return best
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const disease = searchParams.get('disease') || ''
  const crop = searchParams.get('crop') || ''

  if (!disease.trim()) {
    return NextResponse.json({ found: false })
  }

  let treatmentsData
  try {
    treatmentsData = loadTreatments()
  } catch (err) {
    console.error('Failed to load treatments.json:', err)
    return NextResponse.json({ found: false, error: 'Could not load treatment data' })
  }

  let bestEntry = null
  let bestScore = 0

  for (const entry of treatmentsData.diseases) {
    const score = scoreMatch(entry, disease, crop)
    if (score > bestScore) {
      bestScore = score
      bestEntry = entry
    }
  }

  console.log(`[treatments] disease="${disease}" crop="${crop}" → match="${bestEntry?.id}" score=${bestScore}`)

  if (!bestEntry) {
    return NextResponse.json({ found: false })
  }

  return NextResponse.json({ found: true, treatment: bestEntry })
}
