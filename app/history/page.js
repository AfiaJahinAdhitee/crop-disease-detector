'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Trash2, Loader2, Clock, Leaf, AlertTriangle, CheckCircle, ImageOff } from 'lucide-react'
import LeafPulse from '@/app/components/LeafPulse'
import ThemeToggle from '@/app/components/ThemeToggle'
import HeaderMenu from '@/app/components/HeaderMenu'
import { useTranslation } from 'react-i18next'
import '@/app/i18n/config'

const SEVERITY_STYLE = {
  none:     { background: 'var(--sev-none-bg)', border: '1px solid var(--sev-none-border)', color: 'var(--sev-none-text)' },
  low:      { background: 'var(--sev-low-bg)',  border: '1px solid var(--sev-low-border)',  color: 'var(--sev-low-text)'  },
  medium:   { background: 'var(--sev-mid-bg)',  border: '1px solid var(--sev-mid-border)',  color: 'var(--sev-mid-text)'  },
  high:     { background: 'var(--sev-high-bg)', border: '1px solid var(--sev-high-border)', color: 'var(--sev-high-text)' },
  critical: { background: 'var(--sev-crit-bg)', border: '1px solid var(--sev-crit-border)', color: 'var(--sev-crit-text)' },
}

function formatDate(iso, lang) {
  return new Date(iso).toLocaleDateString(
    lang === 'en' ? 'en-GB' : 'bn-BD',
    { year: 'numeric', month: 'short', day: 'numeric' }
  )
}

function ConfidencePill({ value }) {
  const pct = value != null ? Math.round(value) : null
  if (pct == null) return null
  const color = pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444'
  return <span className="text-xs font-semibold" style={{ color }}>{pct}%</span>
}

export default function HistoryPage() {
  const { t, i18n } = useTranslation(['history', 'common'])
  const lang = i18n.language?.startsWith('en') ? 'en' : 'bn'

  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/history')
      .then(r => r.json())
      .then(d => { if (d.error) throw new Error(d.error); setHistory(d.history || []) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id) {
    if (!confirm(t('common:deleteConfirm'))) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/history/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Delete failed')
      setHistory(prev => prev.filter(h => h.id !== id))
    } catch (e) {
      alert(t('common:deleteError') + e.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      <div className="px-4 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
        <Link href="/" className="w-11 h-11 flex items-center justify-center rounded-2xl transition-colors flex-shrink-0"
          style={{ color: 'var(--text-secondary)' }}>
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Clock size={16} style={{ color: 'var(--brand)', flexShrink: 0 }} />
          <h1 className="text-base font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{t('history:list.title')}</h1>
        </div>
        {!loading && history.length > 0 && (
          <span className="text-xs px-2.5 py-1 rounded-full flex-shrink-0"
            style={{ color: 'var(--text-secondary)', background: 'var(--bg-panel)' }}>
            {t('history:list.count', { count: history.length })}
          </span>
        )}
        <ThemeToggle />
        <HeaderMenu />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {loading && (
          <div className="flex items-center gap-3 py-20 justify-center" style={{ color: 'var(--text-secondary)' }}>
            <LeafPulse size={24} />
            {t('history:list.loading')}
          </div>
        )}

        {error && (
          <div className="rounded-2xl px-5 py-4 text-sm"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
            {t('history:list.errorPrefix')}{error}
          </div>
        )}

        {!loading && !error && history.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-card)' }}>
              <Leaf size={32} style={{ color: 'var(--border-strong)' }} />
            </div>
            <div>
              <p className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>{t('history:list.empty.title')}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{t('history:list.empty.desc')}</p>
            </div>
            <Link href="/" className="mt-2 px-6 py-3 rounded-2xl text-sm font-semibold transition-colors"
              style={{ background: 'var(--brand)', color: 'var(--brand-on)' }}>
              {t('history:list.empty.cta')}
            </Link>
          </div>
        )}

        {!loading && history.length > 0 && (
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item.id} className="flex items-stretch rounded-2xl overflow-hidden"
                style={{ minHeight: 112, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <Link href={`/history/${item.id}`} className="flex items-stretch flex-1 min-w-0">
                  <div className="w-28 flex-shrink-0 overflow-hidden" style={{ background: 'var(--bg-panel)' }}>
                    {item.image_signed_url ? (
                      <img src={item.image_signed_url} alt={item.disease_name || 'Diagnosis'} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageOff size={22} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 px-4 py-3.5 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start gap-1.5">
                        {item.is_healthy
                          ? <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                          : <AlertTriangle size={14} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                        }
                        <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
                          {item.disease_name || (item.is_healthy ? t('history:list.healthy') : t('history:list.unknown'))}
                        </p>
                      </div>
                      <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                        {item.crop_type}
                        {item.plant_part && ` · ${item.plant_part}`}
                        {item.region && ` · ${item.region}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {item.severity && item.severity !== 'none' && (
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={SEVERITY_STYLE[item.severity] || SEVERITY_STYLE.low}>
                          {item.severity}
                        </span>
                      )}
                      <ConfidencePill value={item.confidence} />
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(item.created_at, lang)}</span>
                    </div>
                  </div>
                </Link>

                <div className="flex items-center justify-center flex-shrink-0" style={{ width: 52, borderLeft: '1px solid var(--border)' }}>
                  <button onClick={() => handleDelete(item.id)} disabled={deletingId === item.id}
                    className="w-11 h-11 flex items-center justify-center rounded-xl transition-colors disabled:opacity-40"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = '' }}
                    aria-label={t('history:list.deleteLabel')}>
                    {deletingId === item.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
