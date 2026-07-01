import LeafPulse from './components/LeafPulse'

// Shown by Next.js App Router while the page bundle is streaming / suspending.
export default function Loading() {
  return (
    <div style={{
      minHeight:      '100vh',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      background:     'var(--bg-page)',
    }}>
      <LeafPulse size={56} />
    </div>
  )
}
