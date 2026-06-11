'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  async function handleSignOut() {
    const { createClient } = await import('@/lib/supabase')
    await createClient().auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6">
      <main className="w-full max-w-4xl rounded-3xl border border-slate-800 bg-slate-900/95 p-10 shadow-2xl shadow-slate-950/40">

        {/* Header row with sign out */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <div style={{ width: 28, height: 28, color: '#4ade80' }}>
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 3C16 3 8 9 8 18C8 22.4 11.6 26 16 26C20.4 26 24 22.4 24 18C24 9 16 3 16 3Z" fill="currentColor" opacity="0.9"/>
                <path d="M16 10C16 10 11 14 11 19C11 21.8 13.2 24 16 24" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
              </svg>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', color: '#4ade80', textTransform: 'uppercase' }}>
              CROP2
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

        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-green-400">Crop Disease Detector</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Welcome to your farm health dashboard
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            Start by uploading a leaf image for diagnosis, or explore your dashboard for insights and history.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <Link
            href="/upload"
            className="group block rounded-3xl border border-slate-800 bg-slate-950 p-8 text-left transition hover:border-green-400 hover:bg-slate-900"
          >
            <h2 className="text-2xl font-semibold text-white">Upload a Leaf</h2>
            <p className="mt-3 text-slate-400">Send an image of your crop leaf to detect disease, severity, and recommendations.</p>
            <span className="mt-6 inline-flex text-sm font-medium text-green-400 group-hover:text-green-300">
              Go to Upload →
            </span>
          </Link>

          <Link
            href="/dashboard"
            className="group block rounded-3xl border border-slate-800 bg-slate-950 p-8 text-left transition hover:border-green-400 hover:bg-slate-900"
          >
            <h2 className="text-2xl font-semibold text-white">Dashboard</h2>
            <p className="mt-3 text-slate-400">View your diagnosis history, results, and crop health recommendations in one place.</p>
            <span className="mt-6 inline-flex text-sm font-medium text-green-400 group-hover:text-green-300">
              View Dashboard →
            </span>
          </Link>
        </div>
      </main>
    </div>
  )
}