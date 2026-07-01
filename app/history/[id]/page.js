'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, CheckCircle, Loader2, Trash2, FlaskConical, Sprout, TriangleAlert, ImageOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
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
    { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  )
}

function TreatmentCard({ treatment, t }) {
  const [tab, setTab] = useState('organic')
  const [fieldSize, setFieldSize] = useState('')
  const [fieldUnit, setFieldUnit] = useState('bigha')
  const BIGHA_PER_ACRE = 3.025

  function toBigha(value, unit) {
    const n = parseFloat(value)
    if (!n || n <= 0) return null
    return unit === 'acre' ? n * BIGHA_PER_ACRE : n
  }

  function formatDosage(opt, bc) {
    if (!bc) return `${opt.dosage_per_bigha_amount} ${opt.dosage_per_bigha_unit} ${t('upload:treatment.perBigha')}`
    const total = opt.dosage_per_bigha_amount * bc
    return `${total >= 100 ? Math.round(total) : Math.round(total * 10) / 10} ${opt.dosage_per_bigha_unit}`
  }

  function formatCost(opt, bc) {
    if (!bc) return `৳ ${opt.cost_per_bigha_bdt} ${t('upload:treatment.perBigha')}`
    return `৳ ${Math.round(opt.cost_per_bigha_bdt * bc).toLocaleString()}`
  }

  const bc = toBigha(fieldSize, fieldUnit)
  const options = tab === 'organic' ? treatment.organic : treatment.chemical
  const isOrganic = tab === 'organic'
  const accent = isOrganic ? 'var(--sev-none-text)' : '#60a5fa'
  const accentHex = isOrganic ? '#22c55e' : '#60a5fa'
  const accentBg = isOrganic ? 'var(--sev-none-bg)' : 'rgba(96,165,250,0.08)'
  const accentBorder = isOrganic ? 'var(--sev-none-border)' : 'rgba(96,165,250,0.3)'

  return (
    <div className="rounded-2xl overflow-hidden mt-6"
      style={{ border: '1.5px solid var(--sev-none-border)', background: 'var(--sev-none-bg)' }}>
      <div className="px-5 py-4" style={{ background: 'rgba(21,128,61,0.2)', borderBottom: '1px solid var(--sev-none-border)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(52,211,153,0.2)' }}>
            <FlaskConical size={17} style={{ color: 'var(--sev-none-text)' }} />
          </div>
          <div>
            <p className="text-base font-bold" style={{ color: 'var(--sev-none-text)' }}>{t('history:detail.treatmentTitle')}</p>
            <p className="text-xs font-medium" style={{ color: 'var(--sev-none-text)', opacity: 0.7 }}>
              {t('history:detail.treatmentSubtitle')} — {treatment.disease_name_en}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {treatment.yield_loss_if_untreated && (
          <div className="flex items-start gap-3 rounded-xl px-4 py-3.5"
            style={{ background: 'var(--sev-high-bg)', border: '1px solid var(--sev-high-border)' }}>
            <TriangleAlert size={18} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--sev-high-text)' }} />
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--sev-high-text)' }}>
                {t('upload:treatment.yieldLoss', { range: treatment.yield_loss_if_untreated.percent_range })}
              </p>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--sev-high-text)', opacity: 0.75 }}>
                {treatment.yield_loss_if_untreated.description_bn}
              </p>
            </div>
          </div>
        )}

        {treatment.application_timing_bn && (
          <div className="flex items-start gap-3 rounded-xl px-4 py-3"
            style={{ background: 'var(--sev-low-bg)', border: '1px solid var(--sev-low-border)' }}>
            <span className="text-base flex-shrink-0">🕐</span>
            <div>
              <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--sev-low-text)' }}>{t('upload:treatment.timing')}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--sev-low-text)', opacity: 0.8 }}>{treatment.application_timing_bn}</p>
            </div>
          </div>
        )}

        <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="text-xs font-semibold mb-2.5" style={{ color: 'var(--text-secondary)' }}>{t('upload:treatment.fieldSize')}</p>
          <div className="flex gap-2">
            <input type="number" min="0" step="0.5" placeholder={t('upload:treatment.fieldPlaceholder')}
              value={fieldSize} onChange={e => setFieldSize(e.target.value)}
              className="flex-1 rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-colors"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              onFocus={e => e.target.style.borderColor = 'var(--brand)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <div className="flex rounded-xl overflow-hidden text-sm" style={{ border: '1px solid var(--border)' }}>
              {['bigha', 'acre'].map(u => (
                <button key={u} onClick={() => setFieldUnit(u)} className="px-3 py-2.5 font-medium transition-colors"
                  style={fieldUnit === u
                    ? { background: 'var(--brand)', color: 'var(--brand-on)' }
                    : { background: 'var(--bg-input)', color: 'var(--text-muted)' }}>
                  {u === 'bigha' ? t('upload:treatment.bigha') : t('upload:treatment.acre')}
                </button>
              ))}
            </div>
          </div>
          {bc && (
            <p className="text-xs mt-2" style={{ color: 'var(--brand)' }}>
              {fieldUnit === 'bigha'
                ? t('upload:treatment.convBigha', { bigha: bc, acre: (bc / BIGHA_PER_ACRE).toFixed(2) })
                : t('upload:treatment.convAcre', { acre: parseFloat(fieldSize), bigha: bc.toFixed(1) })
              }
            </p>
          )}
        </div>

        <div className="flex gap-2">
          {[
            { key: 'organic',  Icon: Sprout,       count: treatment.organic.length  },
            { key: 'chemical', Icon: FlaskConical,  count: treatment.chemical.length },
          ].map(({ key, Icon, count }) => (
            <button key={key} onClick={() => setTab(key)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={tab === key
                ? { background: accentBg, color: accentHex, border: `1.5px solid ${accentBorder}` }
                : { background: 'var(--bg-panel)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
              }>
              <Icon size={15} />
              {key === 'organic' ? t('upload:treatment.tabOrganic') : t('upload:treatment.tabChemical')}
              <span className="text-xs opacity-70">({count})</span>
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {options.map((opt, i) => (
            <div key={i} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${accentBorder}`, background: accentBg }}>
              <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: `1px solid ${accentBorder}` }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: accentHex, color: '#fff' }}>{i + 1}</div>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{opt.name_en}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{opt.name_bn}</p>
                </div>
              </div>
              <div className="px-4 py-3 space-y-3">
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{opt.description_bn}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg px-3 py-2.5" style={{ background: 'var(--bg-card)' }}>
                    <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{t('upload:treatment.dosageLabel')}</p>
                    <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{formatDosage(opt, bc)}</p>
                  </div>
                  <div className="rounded-lg px-3 py-2.5" style={{ background: 'var(--bg-card)' }}>
                    <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{t('upload:treatment.costLabel')}</p>
                    <p className="text-base font-bold" style={{ color: accentHex }}>{formatCost(opt, bc)}</p>
                  </div>
                </div>
                <div className="rounded-lg px-3 py-2.5 text-xs leading-relaxed" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
                  <span className="font-semibold" style={{ color: 'var(--text-muted)' }}>{t('upload:treatment.methodLabel')}</span>
                  {opt.application_method_bn}
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-center" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>{t('upload:treatment.disclaimer')}</p>
      </div>
    </div>
  )
}

export default function HistoryDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { t, i18n } = useTranslation(['history', 'upload', 'common'])
  const lang = i18n.language?.startsWith('en') ? 'en' : 'bn'

  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)
  const [treatmentData, setTreatmentData] = useState(null)

  useEffect(() => {
    if (!id) return
    fetch(`/api/history/${id}`)
      .then(r => r.json())
      .then(async d => {
        if (d.error) throw new Error(d.error)
        setRecord(d.diagnosis)
        let parsed = null
        try { parsed = JSON.parse(d.diagnosis.raw_ai_response) } catch {}
        if (parsed) setRecord(prev => ({ ...prev, _parsed: parsed }))
        if (d.diagnosis.disease_name && !d.diagnosis.is_healthy) {
          try {
            const tr = await fetch(`/api/treatments?disease=${encodeURIComponent(d.diagnosis.disease_name)}&crop=${encodeURIComponent(d.diagnosis.crop_type || '')}`)
            const td = await tr.json()
            if (td.found) setTreatmentData(td.treatment)
          } catch {}
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  async function handleDelete() {
    if (!confirm(t('history:detail.deleteConfirm'))) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/history/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      router.push('/history')
    } catch (e) {
      alert(t('history:detail.deleteError') + e.message)
      setDeleting(false)
    }
  }

  const diagnosis = record?._parsed || record

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <Link href="/history" className="transition-colors" style={{ color: 'var(--text-secondary)' }}>
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{t('history:detail.title')}</h1>
        </div>
        {record && (
          <button onClick={handleDelete} disabled={deleting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-colors disabled:opacity-50"
            style={{ color: 'var(--sev-high-text)', border: '1px solid var(--sev-high-border)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--sev-high-bg)'}
            onMouseLeave={e => e.currentTarget.style.background = ''}>
            {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            {t('history:detail.deleteBtn')}
          </button>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-5">
        {loading && (
          <div className="flex items-center gap-3 py-20 justify-center" style={{ color: 'var(--text-secondary)' }}>
            <Loader2 size={20} className="animate-spin" />
            {t('history:detail.loading')}
          </div>
        )}

        {error && (
          <div className="rounded-2xl px-5 py-4 text-sm"
            style={{ background: 'var(--sev-high-bg)', border: '1px solid var(--sev-high-border)', color: 'var(--sev-high-text)' }}>
            {error}
          </div>
        )}

        {record && (
          <>
            {record.image_signed_url ? (
              <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <img src={record.image_signed_url} alt={record.disease_name || 'Diagnosis image'} className="w-full max-h-80 object-contain" />
              </div>
            ) : (
              <div className="rounded-2xl h-32 flex flex-col items-center justify-center gap-2"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <ImageOff size={24} style={{ color: 'var(--text-muted)' }} />
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('history:detail.noImage')}</p>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs flex-wrap" style={{ color: 'var(--text-muted)' }}>
              <span>{record.crop_type}</span>
              {record.plant_part && <><span>·</span><span>{record.plant_part}</span></>}
              {record.region && <><span>·</span><span>{record.region}</span></>}
              <span>·</span>
              <span>{formatDate(record.created_at, lang)}</span>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2">
                  {record.is_healthy
                    ? <CheckCircle size={18} style={{ color: 'var(--sev-none-text)' }} />
                    : <AlertTriangle size={18} style={{ color: 'var(--sev-low-text)' }} />
                  }
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {(diagnosis?.disease_name) || record.disease_name || (record.is_healthy ? t('history:detail.healthy') : t('history:detail.unknown'))}
                  </span>
                </div>
                {record.severity && record.severity !== 'none' && (
                  <span className="text-xs font-medium px-3 py-1 rounded-full"
                    style={{ ...(SEVERITY_STYLE[record.severity] || SEVERITY_STYLE.low) }}>
                    {t('history:detail.severity', { level: record.severity })}
                  </span>
                )}
              </div>

              {record.confidence != null && (
                <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{t('history:detail.sections.confidence')}</p>
                  <div className="w-full rounded-full h-2" style={{ background: 'var(--bg-panel)' }}>
                    <div className="h-2 rounded-full transition-all" style={{ width: `${Math.round(record.confidence)}%`, background: 'var(--brand)' }} />
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{Math.round(record.confidence)}%</p>
                </div>
              )}

              {diagnosis?.description && (
                <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{t('history:detail.sections.about')}</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{diagnosis.description}</p>
                </div>
              )}

              {diagnosis?.symptoms && (
                <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{t('history:detail.sections.symptoms')}</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{diagnosis.symptoms}</p>
                </div>
              )}

              {!record.is_healthy && (diagnosis?.treatment || record.treatment) && (
                <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{t('history:detail.sections.treatment')}</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{diagnosis?.treatment || record.treatment}</p>
                </div>
              )}

              {!record.is_healthy && diagnosis?.remedies?.length > 0 && (
                <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{t('history:detail.sections.remedies')}</p>
                  <ol className="space-y-1.5 list-none">
                    {diagnosis.remedies.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full text-xs flex items-center justify-center font-medium"
                          style={{ background: 'var(--bg-panel)', color: 'var(--text-muted)' }}>{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {(diagnosis?.prevention || record.prevention) && (
                <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{t('history:detail.sections.prevention')}</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{diagnosis?.prevention || record.prevention}</p>
                </div>
              )}

              <div className="px-5 py-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full inline-block"
                  style={{ background: record.source === 'custom_model' ? 'var(--sev-none-text)' : '#60a5fa' }} />
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {record.source === 'custom_model' ? t('history:detail.sourceCustom') : t('history:detail.sourceGemini')}
                </p>
              </div>
            </div>

            {treatmentData && (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: 'var(--sev-none-border)' }} />
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--sev-none-text)' }}>
                    {t('history:detail.treatmentDivider')}
                  </span>
                  <div className="flex-1 h-px" style={{ background: 'var(--sev-none-border)' }} />
                </div>
                <TreatmentCard treatment={treatmentData} t={t} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
