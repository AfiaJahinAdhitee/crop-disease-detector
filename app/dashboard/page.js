import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6">
      <main className="w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-900/95 p-10 shadow-2xl shadow-slate-950/40">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-green-400">Crop Disease Detector</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Dashboard</h1>
          <p className="mt-4 text-slate-400">This page is your central hub for crop health information and diagnosis history.</p>
        </div>

        <div className="mt-10 space-y-4 rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <div className="rounded-2xl bg-slate-900 p-6">
            <h2 className="text-xl font-semibold text-white">Recent activity</h2>
            <p className="mt-2 text-slate-400">No activity yet. Upload a leaf photo to generate your first diagnosis.</p>
          </div>
          <div className="rounded-2xl bg-slate-900 p-6">
            <h2 className="text-xl font-semibold text-white">Next steps</h2>
            <p className="mt-2 text-slate-400">Use the upload page to diagnose crop disease and build your report history.</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/upload"
            className="inline-flex items-center justify-center rounded-full bg-green-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-green-400"
          >
            Go to Upload
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500"
          >
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}

import SignOutButton from '@/app/components/SignOutButton'

// Inside your JSX:
<SignOutButton />