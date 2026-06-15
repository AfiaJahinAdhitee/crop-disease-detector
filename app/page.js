'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

const PLANT_PARTS = [
  {
    key: 'leaf',
    label: 'পাতা',
    labelEn: 'Leaf',
    desc: 'পাতার দাগ, রঙ বদলানো, ছিদ্র বা শুকিয়ে যাওয়া',
    color: '#22c55e',
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="52" height="52">
        <path d="M32 8C32 8 12 20 12 38C12 49 21 58 32 58C43 58 52 49 52 38C52 20 32 8 32 8Z" fill="#16a34a" opacity="0.25"/>
        <path d="M32 8C32 8 12 20 12 38C12 49 21 58 32 58C43 58 52 49 52 38C52 20 32 8 32 8Z" stroke="#22c55e" strokeWidth="2.5" fill="none"/>
        <path d="M32 14C32 14 18 24 18 38C18 45.7 24.3 52 32 52" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" opacity="0.7"/>
        <line x1="32" y1="8" x2="32" y2="58" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
        <path d="M32 22 Q22 28 20 36" stroke="#86efac" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
        <path d="M32 30 Q42 36 44 44" stroke="#86efac" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
  },
  {
    key: 'root',
    label: 'শিকড়',
    labelEn: 'Root',
    desc: 'শিকড়ের পচন, রঙ বদলানো বা ছত্রাক সংক্রমণ',
    color: '#a78bfa',
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="52" height="52">
        <rect x="26" y="6" width="12" height="16" rx="4" fill="#7c3aed" opacity="0.25" stroke="#a78bfa" strokeWidth="2"/>
        <line x1="32" y1="22" x2="32" y2="36" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M32 36 Q24 42 18 52" stroke="#a78bfa" strokeWidth="2.2" strokeLinecap="round"/>
        <path d="M32 36 Q40 42 46 52" stroke="#a78bfa" strokeWidth="2.2" strokeLinecap="round"/>
        <path d="M32 42 Q27 46 22 56" stroke="#c4b5fd" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
        <path d="M32 42 Q37 46 42 56" stroke="#c4b5fd" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
        <circle cx="18" cy="52" r="3" fill="#a78bfa" opacity="0.5"/>
        <circle cx="46" cy="52" r="3" fill="#a78bfa" opacity="0.5"/>
        <circle cx="22" cy="56" r="2" fill="#c4b5fd" opacity="0.4"/>
        <circle cx="42" cy="56" r="2" fill="#c4b5fd" opacity="0.4"/>
      </svg>
    ),
  },
  {
    key: 'fruit',
    label: 'ফল',
    labelEn: 'Fruit',
    desc: 'ফলের পচন, দাগ, বিকৃতি বা অকাল ঝরা',
    color: '#f97316',
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="52" height="52">
        <path d="M32 10 Q30 6 26 7" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="32" cy="36" r="22" fill="#ea580c" opacity="0.2" stroke="#f97316" strokeWidth="2.5"/>
        <path d="M20 28 Q32 22 44 28" stroke="#fdba74" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        <path d="M17 38 Q32 32 47 38" stroke="#fdba74" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
        <path d="M20 48 Q32 42 44 48" stroke="#fdba74" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
        <ellipse cx="32" cy="36" rx="6" ry="8" fill="#f97316" opacity="0.15"/>
      </svg>
    ),
  },
  {
    key: 'flower',
    label: 'ফুল',
    labelEn: 'Flower',
    desc: 'ফুলের বিবর্ণতা, পচন বা ঝরে পড়া',
    color: '#ec4899',
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="52" height="52">
        <ellipse cx="32" cy="16" rx="7" ry="12" fill="#be185d" opacity="0.3" stroke="#ec4899" strokeWidth="1.8"/>
        <ellipse cx="48" cy="32" rx="7" ry="12" fill="#be185d" opacity="0.3" stroke="#ec4899" strokeWidth="1.8" transform="rotate(90 48 32)"/>
        <ellipse cx="32" cy="48" rx="7" ry="12" fill="#be185d" opacity="0.3" stroke="#ec4899" strokeWidth="1.8"/>
        <ellipse cx="16" cy="32" rx="7" ry="12" fill="#be185d" opacity="0.3" stroke="#ec4899" strokeWidth="1.8" transform="rotate(90 16 32)"/>
        <ellipse cx="42" cy="22" rx="6" ry="10" fill="#be185d" opacity="0.2" stroke="#f472b6" strokeWidth="1.5" transform="rotate(45 42 22)"/>
        <ellipse cx="42" cy="42" rx="6" ry="10" fill="#be185d" opacity="0.2" stroke="#f472b6" strokeWidth="1.5" transform="rotate(-45 42 42)"/>
        <ellipse cx="22" cy="42" rx="6" ry="10" fill="#be185d" opacity="0.2" stroke="#f472b6" strokeWidth="1.5" transform="rotate(45 22 42)"/>
        <ellipse cx="22" cy="22" rx="6" ry="10" fill="#be185d" opacity="0.2" stroke="#f472b6" strokeWidth="1.5" transform="rotate(-45 22 22)"/>
        <circle cx="32" cy="32" r="8" fill="#fbbf24" opacity="0.9" stroke="#f59e0b" strokeWidth="1.5"/>
        <circle cx="32" cy="32" r="4" fill="#fef08a"/>
      </svg>
    ),
  },
  {
    key: 'body',
    label: 'কান্ড/শাখা',
    labelEn: 'Stem / Branch',
    desc: 'কান্ডের ফাটল, পচন, ছাল উঠে যাওয়া বা শুকানো',
    color: '#92400e',
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="52" height="52">
        <rect x="26" y="4" width="12" height="56" rx="6" fill="#78350f" opacity="0.3" stroke="#92400e" strokeWidth="2.5"/>
        <path d="M32 18 Q46 14 52 8" stroke="#a16207" strokeWidth="2.2" strokeLinecap="round"/>
        <path d="M32 28 Q18 24 12 16" stroke="#a16207" strokeWidth="2.2" strokeLinecap="round"/>
        <path d="M32 38 Q46 34 54 30" stroke="#a16207" strokeWidth="2" strokeLinecap="round"/>
        <path d="M32 18 Q44 10 50 4" stroke="#d97706" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
        <path d="M32 28 Q20 20 14 12" stroke="#d97706" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
        <line x1="30" y1="10" x2="34" y2="10" stroke="#b45309" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>
        <line x1="30" y1="20" x2="34" y2="20" stroke="#b45309" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>
        <line x1="30" y1="30" x2="34" y2="30" stroke="#b45309" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>
        <line x1="30" y1="40" x2="34" y2="40" stroke="#b45309" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>
        <line x1="30" y1="50" x2="34" y2="50" stroke="#b45309" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>
      </svg>
    ),
  },
]

export default function Home() {
  const router = useRouter()

  async function handleSignOut() {
    const { createClient } = await import('@/lib/supabase')
    await createClient().auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-10">
      <main className="w-full max-w-5xl rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/40">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <div style={{ width: 28, height: 28, color: '#4ade80' }}>
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 3C16 3 8 9 8 18C8 22.4 11.6 26 16 26C20.4 26 24 22.4 24 18C24 9 16 3 16 3Z" fill="currentColor" opacity="0.9"/>
                <path d="M16 10C16 10 11 14 11 19C11 21.8 13.2 24 16 24" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
              </svg>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', color: '#4ade80', textTransform: 'uppercase' }}>
              CROP DOCTOR
            </span>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-red-500/50 hover:bg-red-950/40 hover:text-red-400"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
        </div>

        {/* Hero */}
        <div className="text-center mb-10">
          <p className="text-sm uppercase tracking-[0.3em] text-green-400">Crop Disease Detector</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            কোন অংশে সমস্যা হচ্ছে?
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-slate-400 text-sm leading-relaxed">
            নিচের ছবি থেকে আপনার গাছের রোগাক্রান্ত অংশ বেছে নিন। তারপর ছবি, কণ্ঠস্বর বা বিবরণ দিয়ে রোগ নির্ণয় করুন।
          </p>
          <p className="mx-auto mt-1 max-w-xl text-slate-600 text-xs">
            Which part of the plant has a problem? Select below to begin diagnosis.
          </p>
        </div>

        {/* Plant Part Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          {PLANT_PARTS.map((part) => (
            <a
              key={part.key}
              href={`/upload?part=${part.key}`}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-5 text-center transition-all duration-200 hover:scale-105 cursor-pointer"
              style={{
                '--part-color': part.color,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = part.color + '80'
                e.currentTarget.style.background = part.color + '0d'
                e.currentTarget.style.boxShadow = `0 0 24px ${part.color}22`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = ''
                e.currentTarget.style.background = ''
                e.currentTarget.style.boxShadow = ''
              }}
            >
              <div className="transition-transform duration-200 group-hover:scale-110">
                {part.svg}
              </div>
              <div>
                <p className="font-bold text-white text-base leading-tight" style={{ color: part.color }}>{part.label}</p>
                <p className="text-slate-500 text-xs mt-0.5">{part.labelEn}</p>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed hidden sm:block">{part.desc}</p>
              <span className="text-xs font-medium mt-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: part.color }}>
                রোগ নির্ণয় করুন →
              </span>
            </a>
          ))}
        </div>

        {/* Dashboard link */}
        <div className="border-t border-slate-800 pt-6">
          <a
            href="/dashboard"
            className="group flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 px-6 py-5 transition hover:border-green-400/50 hover:bg-slate-900"
          >
            <div>
              <h2 className="text-lg font-semibold text-white">Dashboard</h2>
              <p className="mt-1 text-slate-400 text-sm">আপনার রোগ নির্ণয়ের ইতিহাস, ফলাফল এবং সুপারিশ দেখুন।</p>
            </div>
            <span className="text-sm font-medium text-green-400 group-hover:text-green-300 ml-4 shrink-0">
              View Dashboard →
            </span>
          </a>
        </div>
      </main>
    </div>
  )
}