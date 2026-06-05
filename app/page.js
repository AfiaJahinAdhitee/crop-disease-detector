import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6">
      <main className="w-full max-w-4xl rounded-3xl border border-slate-800 bg-slate-900/95 p-10 shadow-2xl shadow-slate-950/40">
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
  );
}
