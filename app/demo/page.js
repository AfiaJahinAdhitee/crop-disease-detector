'use client'

import { useState } from 'react'
import LeafPulse from '@/app/components/LeafPulse'
import LeaflineLogo, { LeafMark } from '@/app/components/LeaflineLogo'
import { useTheme } from '@/app/providers/ThemeProvider'

const SIZES = [20, 40, 64, 96, 128]

function Card({ children, label }) {
  return (
    <div
      className="flex flex-col items-center gap-3 rounded-2xl p-5"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      {children}
      {label && (
        <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="flex flex-col gap-4">
      <h2
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: 'var(--text-muted)' }}
      >
        {title}
      </h2>
      <div className="flex flex-wrap gap-4 items-end">{children}</div>
    </section>
  )
}

export default function DemoPage() {
  const { theme, toggle } = useTheme()
  const [paused, setPaused] = useState(false)

  return (
    <div
      className="min-h-screen p-8 flex flex-col gap-12"
      style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <LeaflineLogo size={24} />
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            LeafPulse demo — <code>/demo</code>
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setPaused(p => !p)}
            className="text-xs px-4 py-2 rounded-xl font-medium"
            style={{
              border: '1px solid var(--border)',
              color: paused ? 'var(--brand)' : 'var(--text-secondary)',
              background: paused ? 'var(--brand-bg)' : 'transparent',
            }}
          >
            {paused ? '▶ Resume' : '⏸ Pause'}
          </button>
          <button
            onClick={toggle}
            className="text-xs px-4 py-2 rounded-xl font-medium"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              background: 'transparent',
            }}
          >
            {theme === 'dark' ? '☀ Light' : '☾ Dark'}
          </button>
        </div>
      </div>

      <div className={paused ? 'leaf-animations-paused' : ''}>

        {/* ── Sizes ─────────────────────────────────────────────────── */}
        <Section title="Size variants">
          {SIZES.map(size => (
            <Card key={size} label={`size={${size}}`}>
              <LeafPulse size={size} />
            </Card>
          ))}
        </Section>

        {/* ── Speed variants ────────────────────────────────────────── */}
        <Section title="Speed variants">
          {['slow', 'default', 'fast'].map(s => (
            <Card key={s} label={`speed="${s}"`}>
              <LeafPulse size={64} speed={s} />
            </Card>
          ))}
        </Section>

        {/* ── Inline loading state ───────────────────────────────────── */}
        <Section title="Inline loading state">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            <LeafPulse size={18} />
            <span>Analyzing your crop…</span>
          </div>
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            <LeafPulse size={18} />
            <span>ফসল বিশ্লেষণ করা হচ্ছে…</span>
          </div>
        </Section>

        {/* ── Diagnosis processing overlay ───────────────────────────── */}
        <Section title="Diagnosis processing overlay">
          <div
            className="flex flex-col items-center justify-center gap-4 rounded-2xl w-72 h-56"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <LeafPulse size={72} />
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Analyzing your crop…
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                ফসল বিশ্লেষণ করা হচ্ছে…
              </span>
            </div>
          </div>
        </Section>

        {/* ── Splash screen mock ────────────────────────────────────────  */}
        <Section title="Splash screen">
          <div
            className="flex flex-col items-center justify-center gap-5 rounded-2xl w-72 h-56"
            style={{ background: 'var(--bg-page)', border: '1px solid var(--border)' }}
          >
            <LeafPulse size={56} />
            <LeaflineLogo size={20} />
          </div>
        </Section>

        {/* ── Reduced-motion fallback ───────────────────────────────────  */}
        <Section title="Reduced-motion fallback (all animated layers hidden)">
          <Card label="static LeafMark — no animation">
            <LeafMark size={80} />
          </Card>
        </Section>

      </div>

      <p className="text-xs pb-8" style={{ color: 'var(--text-muted)' }}>
        White <code>#FFFFFF</code> light — same in both themes.
        All animation uses <code>opacity</code> and <code>stroke-dashoffset</code> only.
        ⏸ freezes every layer so you can inspect a single frame.
      </p>
    </div>
  )
}
