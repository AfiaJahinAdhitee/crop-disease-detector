'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AlertCircle, Loader2, X, Mic, Square, ArrowLeft, Volume2, FlaskConical, Sprout, TriangleAlert, AlertTriangle } from 'lucide-react'
import LeafPulse from '../components/LeafPulse'
import ThemeToggle from '../components/ThemeToggle'
import HeaderMenu from '../components/HeaderMenu'
import { useTranslation } from 'react-i18next'
import '@/app/i18n/config'
import YouTubeSection from '../components/YouTubeSection'

const CROP_CONFIG = [
  { id: 'Rice',       emoji: '🌾' },
  { id: 'Potato',     emoji: '🥔' },
  { id: 'Tomato',     emoji: '🍅' },
  { id: 'Corn',       emoji: '🌽' },
  { id: 'Wheat',      emoji: '🌿' },
  { id: 'Pepper',     emoji: '🌶️' },
  { id: 'Apple',      emoji: '🍎' },
  { id: 'Grape',      emoji: '🍇' },
  { id: 'Strawberry', emoji: '🍓' },
  { id: 'Other',      emoji: '🌱' },
]

const BANGLADESH_DISTRICTS = [
  'Bagerhat','Bandarban','Barguna','Barishal','Bhola','Bogura','Brahmanbaria','Chandpur',
  'Chapai Nawabganj','Chattogram','Chuadanga',"Cox's Bazar",'Cumilla','Dhaka','Dinajpur',
  'Faridpur','Feni','Gaibandha','Gazipur','Gopalganj','Habiganj','Jamalpur','Jessore',
  'Jhalokati','Jhenaidah','Joypurhat','Khagrachhari','Khulna','Kishoreganj','Kurigram',
  'Kushtia','Lakshmipur','Lalmonirhat','Madaripur','Magura','Manikganj','Meherpur',
  'Moulvibazar','Munshiganj','Mymensingh','Naogaon','Narail','Narayanganj','Narsingdi',
  'Natore','Netrokona','Nilphamari','Noakhali','Pabna','Panchagarh','Patuakhali',
  'Pirojpur','Rajbari','Rajshahi','Rangamati','Rangpur','Satkhira','Shariatpur','Sherpur',
  'Sirajganj','Sunamganj','Sylhet','Tangail','Thakurgaon',
]

const BANGLA_HINTS = {
  'রাজশাহী':'Rajshahi','রাজবাড়ী':'Rajbari','ঢাকা':'Dhaka','চট্টগ্রাম':'Chattogram',
  'খুলনা':'Khulna','সিলেট':'Sylhet','রংপুর':'Rangpur','ময়মনসিংহ':'Mymensingh',
  'বরিশাল':'Barishal','কুমিল্লা':'Cumilla','নারায়ণগঞ্জ':'Narayanganj','গাজীপুর':'Gazipur',
  'বগুড়া':'Bogura','দিনাজপুর':'Dinajpur','পাবনা':'Pabna','টাঙ্গাইল':'Tangail',
  'যশোর':'Jessore','ফরিদপুর':'Faridpur','নোয়াখালী':'Noakhali','কিশোরগঞ্জ':'Kishoreganj',
  'ব্রাহ্মণবাড়িয়া':'Brahmanbaria','জামালপুর':'Jamalpur','নেত্রকোণা':'Netrokona',
  'শেরপুর':'Sherpur','মানিকগঞ্জ':'Manikganj','মুন্সিগঞ্জ':'Munshiganj',
  'নরসিংদী':'Narsingdi','গোপালগঞ্জ':'Gopalganj','মাদারীপুর':'Madaripur',
  'শরীয়তপুর':'Shariatpur','ঝালকাঠি':'Jhalokati','পটুয়াখালী':'Patuakhali',
  'ভোলা':'Bhola','পিরোজপুর':'Pirojpur','বরগুনা':'Barguna','বাগেরহাট':'Bagerhat',
  'সাতক্ষীরা':'Satkhira','নড়াইল':'Narail','মাগুরা':'Magura','ঝিনাইদহ':'Jhenaidah',
  'মেহেরপুর':'Meherpur','চুয়াডাঙ্গা':'Chuadanga','কুষ্টিয়া':'Kushtia','নাটোর':'Natore',
  'সিরাজগঞ্জ':'Sirajganj','নওগাঁ':'Naogaon','চাঁপাইনবাবগঞ্জ':'Chapai Nawabganj',
  'জয়পুরহাট':'Joypurhat','গাইবান্ধা':'Gaibandha','কুড়িগ্রাম':'Kurigram',
  'লালমনিরহাট':'Lalmonirhat','নীলফামারী':'Nilphamari','পঞ্চগড়':'Panchagarh',
  'ঠাকুরগাঁও':'Thakurgaon','সুনামগঞ্জ':'Sunamganj','মৌলভীবাজার':'Moulvibazar',
  'হবিগঞ্জ':'Habiganj','খাগড়াছড়ি':'Khagrachhari','রাঙামাটি':'Rangamati',
  'বান্দরবান':'Bandarban','কক্সবাজার':"Cox's Bazar",'ফেনী':'Feni',
  'লক্ষ্মীপুর':'Lakshmipur','চাঁদপুর':'Chandpur',
}

const PART_META = {
  leaf:   { color: '#22c55e', icon: <svg viewBox="0 0 32 32" fill="none" width="20" height="20"><path d="M16 4C16 4 6 10 6 19C6 24.5 10.5 29 16 29C21.5 29 26 24.5 26 19C26 10 16 4 16 4Z" fill="#22c55e" opacity="0.8"/><path d="M16 7C16 7 9 12 9 19C9 22 11.5 24.5 14 25.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/></svg> },
  root:   { color: '#a78bfa', icon: <svg viewBox="0 0 32 32" fill="none" width="20" height="20"><rect x="13" y="3" width="6" height="8" rx="2" fill="#a78bfa" opacity="0.8" stroke="#a78bfa" strokeWidth="1"/><line x1="16" y1="11" x2="16" y2="18" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"/><path d="M16 18 Q11 22 8 28" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"/><path d="M16 18 Q21 22 24 28" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"/></svg> },
  fruit:  { color: '#f97316', icon: <svg viewBox="0 0 32 32" fill="none" width="20" height="20"><path d="M16 5 Q15 3 13 3.5" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"/><circle cx="16" cy="18" r="11" fill="#f97316" opacity="0.8"/><path d="M10 14 Q16 11 22 14" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.5"/></svg> },
  flower: { color: '#ec4899', icon: <svg viewBox="0 0 32 32" fill="none" width="20" height="20"><ellipse cx="16" cy="8" rx="4" ry="6" fill="#ec4899" opacity="0.7"/><ellipse cx="24" cy="16" rx="4" ry="6" fill="#ec4899" opacity="0.7" transform="rotate(90 24 16)"/><ellipse cx="16" cy="24" rx="4" ry="6" fill="#ec4899" opacity="0.7"/><ellipse cx="8" cy="16" rx="4" ry="6" fill="#ec4899" opacity="0.7" transform="rotate(90 8 16)"/><circle cx="16" cy="16" r="4.5" fill="#fbbf24"/></svg> },
  body:   { color: '#d97706', icon: <svg viewBox="0 0 32 32" fill="none" width="20" height="20"><rect x="13" y="2" width="6" height="28" rx="3" fill="#92400e" opacity="0.8"/><path d="M16 9 Q23 7 26 4" stroke="#a16207" strokeWidth="1.8" strokeLinecap="round"/><path d="M16 16 Q9 14 6 10" stroke="#a16207" strokeWidth="1.8" strokeLinecap="round"/></svg> },
}

const SEV_HERO_COLORS = {
  none:     { bg: 'var(--sev-none-bg)', border: 'var(--sev-none-border)', color: 'var(--sev-none-text)' },
  low:      { bg: 'var(--sev-low-bg)',  border: 'var(--sev-low-border)',  color: 'var(--sev-low-text)'  },
  medium:   { bg: 'var(--sev-mid-bg)',  border: 'var(--sev-mid-border)',  color: 'var(--sev-mid-text)'  },
  high:     { bg: 'var(--sev-high-bg)', border: 'var(--sev-high-border)', color: 'var(--sev-high-text)' },
  critical: { bg: 'var(--sev-crit-bg)', border: 'var(--sev-crit-border)', color: 'var(--sev-crit-text)' },
}

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
  return dp[a.length][b.length]
}

function CameraIcon({ color, size = 56 }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" width={size} height={size}>
      <rect x="4" y="16" width="56" height="40" rx="8" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2"/>
      <circle cx="32" cy="36" r="12" stroke={color} strokeWidth="2.5" fill={color} fillOpacity="0.1"/>
      <circle cx="32" cy="36" r="5" fill={color} opacity="0.9"/>
      <path d="M22 16L25 9H39L42 16" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
      <circle cx="52" cy="22" r="3" fill={color} opacity="0.6"/>
    </svg>
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
  const accentHex = isOrganic ? '#22c55e' : '#60a5fa'
  const accentBg = isOrganic ? 'var(--sev-none-bg)' : 'rgba(96,165,250,0.08)'
  const accentBorder = isOrganic ? 'var(--sev-none-border)' : 'rgba(96,165,250,0.3)'

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid var(--sev-none-border)', background: 'var(--sev-none-bg)' }}>
      <div className="px-5 py-4" style={{ background: 'rgba(21,128,61,0.2)', borderBottom: '1px solid var(--sev-none-border)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(52,211,153,0.2)' }}>
            <FlaskConical size={17} style={{ color: 'var(--sev-none-text)' }} />
          </div>
          <div>
            <p className="text-base font-bold leading-tight" style={{ color: 'var(--sev-none-text)' }}>{t('upload:treatment.header')}</p>
            <p className="text-xs font-medium" style={{ color: 'var(--sev-none-text)', opacity: 0.7 }}>
              {t('upload:treatment.subtitle')} — {treatment.disease_name_en}
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
              className="flex-1 rounded-xl px-3 py-3 text-sm focus:outline-none"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              onFocus={e => e.target.style.borderColor = 'var(--brand)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <div className="flex rounded-xl overflow-hidden text-sm" style={{ border: '1px solid var(--border)' }}>
              {['bigha', 'acre'].map(u => (
                <button key={u} onClick={() => setFieldUnit(u)} className="px-4 py-3 font-medium transition-colors"
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
            { key: 'organic',  Icon: Sprout,      count: treatment.organic.length },
            { key: 'chemical', Icon: FlaskConical, count: treatment.chemical.length },
          ].map(({ key, Icon, count }) => (
            <button key={key} onClick={() => setTab(key)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
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
                  <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{opt.name_bn || opt.name_en}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{opt.name_en}</p>
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

function WeatherCard({ weather, t }) {
  if (!weather) return null
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-lg">🌤️</span>
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{weather.district} — {t('upload:weather.title')}</p>
      </div>
      <div className="px-5 py-4 grid grid-cols-2 gap-3 text-sm">
        {[
          { labelKey: 'upload:weather.temp',     value: `${weather.temperature}°C` },
          { labelKey: 'upload:weather.humidity', value: `${weather.humidity}%` },
          { labelKey: 'upload:weather.rain',     value: `${weather.precipitation} mm` },
          { labelKey: 'upload:weather.wind',     value: `${weather.windSpeed} km/h` },
        ].map(({ labelKey, value }) => (
          <div key={labelKey} className="rounded-xl px-4 py-3" style={{ background: 'var(--bg-panel)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{t(labelKey)}</p>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</p>
          </div>
        ))}
      </div>
      <div className="px-5 pb-4">
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--bg-panel)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{t('upload:weather.condition')}</p>
          <p style={{ color: 'var(--text-primary)' }}>{weather.description}</p>
        </div>
      </div>
    </div>
  )
}

function DiagnosisCard({ result, accentColor, isSecond, t, lang }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoadingTTS, setIsLoadingTTS] = useState(false)
  const [showDetail, setShowDetail] = useState(true)
  const audioRef = useRef(null)

  useEffect(() => {
    return () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = '' }
    }
  }, [result])

  async function handleReadAloud() {
    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause()
      setIsPlaying(false)
      return
    }

    const parts = []
    if (result.description) parts.push(result.description)
    if (result.symptoms) parts.push(result.symptoms)
    if (result.treatment) parts.push(result.treatment)
    if (result.remedies?.length > 0) parts.push(result.remedies.join(', '))
    if (result.prevention) parts.push(result.prevention)
    const fullText = parts.join('। ')
    if (!fullText) return

    setIsLoadingTTS(true)
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullText, lang })
      })
      if (!res.ok) throw new Error('TTS failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const audio = new window.Audio(url)
      audioRef.current = audio
      audio.onended = () => { setIsPlaying(false); URL.revokeObjectURL(url) }
      audio.play().catch(() => {})
      setIsPlaying(true)
    } catch {
      alert(t('upload:result.audioError'))
    } finally {
      setIsLoadingTTS(false)
    }
  }

  const sev = result.severity || (result.disease_detected ? 'low' : 'none')
  const hero = SEV_HERO_COLORS[sev] || SEV_HERO_COLORS.none
  const confPct = Math.round((result.confidence_score || 0) * 100)
  const confLabel = result.disease_detected
    ? (confPct >= 80 ? t('upload:confidence.highSick') : confPct >= 60 ? t('upload:confidence.midSick') : t('upload:confidence.lowSick'))
    : (confPct >= 80 ? t('upload:confidence.highHealthy') : t('upload:confidence.midHealthy'))

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${hero.border}` }}>
      {isSecond && (
        <div className="px-5 py-3 flex items-center gap-2"
          style={{ background: 'var(--sev-low-bg)', borderBottom: '1px solid var(--sev-low-border)' }}>
          <AlertTriangle size={16} style={{ color: 'var(--sev-low-text)' }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--sev-low-text)' }}>{t('upload:result.secondOpinionLabel')}</p>
        </div>
      )}

      <div style={{ background: hero.bg, borderBottom: `1px solid ${hero.border}` }}>
        <div className="px-5 pt-5 pb-4 flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-3xl"
            style={{ background: hero.color + '18', border: `1px solid ${hero.color}40` }}>
            {result.disease_detected ? '⚠️' : '✅'}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <p className="text-xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{result.disease_name}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-sm font-semibold px-2.5 py-1 rounded-full"
                style={{ background: hero.color + '20', color: hero.color, border: `1px solid ${hero.color}40` }}>
                {t(`upload:severity.${sev}`)}
              </span>
              <span className="text-xs" style={{ color: hero.color, opacity: 0.7 }}>{confLabel}</span>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5">
          <button onClick={handleReadAloud} disabled={isLoadingTTS}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-base transition-all"
            style={isLoadingTTS
              ? { background: 'var(--bg-panel)', color: 'var(--text-muted)', cursor: 'not-allowed' }
              : isPlaying
                ? { background: 'rgba(239,68,68,0.18)', color: '#fca5a5', border: '1.5px solid rgba(239,68,68,0.35)' }
                : { background: hero.color, color: sev === 'none' ? 'var(--brand-on)' : '#000', border: 'none' }
            }>
            {isLoadingTTS ? (
              <><Loader2 size={20} className="animate-spin" />{t('upload:result.audioLoading')}</>
            ) : isPlaying ? (
              <><Square size={20} fill="currentColor" />{t('upload:result.stop')}</>
            ) : (
              <><Volume2 size={22} />{t('upload:result.readAloud')}</>
            )}
          </button>
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)' }}>
        <button onClick={() => setShowDetail(v => !v)}
          className="w-full px-5 py-4 flex items-center justify-between text-sm font-medium transition-colors"
          style={{ color: 'var(--text-muted)', borderBottom: showDetail ? '1px solid var(--border)' : 'none' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = ''}>
          <span>{showDetail ? t('upload:result.hideDetail') : t('upload:result.showDetail')}</span>
          <span style={{ color: 'var(--border-strong)' }}>{showDetail ? '▲' : '▼'}</span>
        </button>

        {showDetail && (
          <div>
            {result.description && (
              <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>{t('upload:result.sections.about')}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{result.description}</p>
              </div>
            )}
            {result.symptoms && (
              <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>{t('upload:result.sections.symptoms')}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{result.symptoms}</p>
              </div>
            )}
            {result.disease_detected && result.treatment && (
              <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>{t('upload:result.sections.treatment')}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{result.treatment}</p>
              </div>
            )}
            {result.disease_detected && result.remedies?.length > 0 && (
              <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-muted)' }}>{t('upload:result.sections.remedies')}</p>
                <ol className="space-y-3">
                  {result.remedies.map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: accentColor + '22', color: accentColor }}>{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {result.prevention && (
              <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>{t('upload:result.sections.prevention')}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{result.prevention}</p>
              </div>
            )}
            <div className="px-5 py-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full inline-block"
                style={{ background: result.source === 'custom_model' ? 'var(--brand)' : '#60a5fa' }} />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {result.source === 'custom_model' ? t('upload:result.sourceCustom') : t('upload:result.sourceGemini')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function UploadPageInner() {
  const searchParams = useSearchParams()
  const plantPart = searchParams.get('part') || 'leaf'
  const meta = PART_META[plantPart] || PART_META.leaf
  const { t, i18n } = useTranslation(['upload', 'common', 'home'])
  const lang = i18n.language?.startsWith('en') ? 'en' : 'bn'
  const isEn = lang === 'en'

  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [cropType, setCropType] = useState('')
  const [region, setRegion] = useState('')
  const [userDescription, setUserDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [secondOpinion, setSecondOpinion] = useState(null)
  const [error, setError] = useState(null)
  const [weather, setWeather] = useState(null)
  const [isListening, setIsListening] = useState(false)
  const [regionSuggestions, setRegionSuggestions] = useState([])
  const [treatmentData, setTreatmentData] = useState(null)
  const [loadingTreatment, setLoadingTreatment] = useState(false)
  const recognitionRef = useRef(null)
  const regionRecognitionRef = useRef(null)
  const [isRegionListening, setIsRegionListening] = useState(false)
  const regionBorderRef = useRef(null)

  useEffect(() => {
    const input = region.trim()
    if (!input) { setRegionSuggestions([]); return }

    const isBangla = /[ঀ-৿]/.test(input)
    let searchTerms = []

    if (isBangla) {
      const exactMatches = Object.entries(BANGLA_HINTS)
        .filter(([bangla]) => bangla.includes(input))
        .map(([, english]) => english.toLowerCase())

      const BANGLA_ROMAN = {
        'অ':'a','আ':'a','ই':'i','ঈ':'i','উ':'u','ঊ':'u','এ':'e','ঐ':'oi','ও':'o','ঔ':'ou',
        'ক':'k','খ':'kh','গ':'g','ঘ':'gh','ঙ':'ng','চ':'ch','ছ':'chh','জ':'j','ঝ':'jh','ঞ':'n',
        'ট':'t','ঠ':'th','ড':'d','ঢ':'dh','ণ':'n','ত':'t','থ':'th','দ':'d','ধ':'dh','ন':'n',
        'প':'p','ফ':'f','ব':'b','ভ':'bh','ম':'m','য':'j','র':'r','ল':'l','শ':'sh','ষ':'sh','স':'s','হ':'h',
        'ড়':'r','ঢ়':'rh','য়':'y','ৎ':'t','ং':'ng','ঃ':'h','ঁ':'n',
        'া':'a','ি':'i','ী':'i','ু':'u','ূ':'u','ে':'e','ৈ':'oi','ো':'o','ৌ':'ou','্':'',
      }
      const transliterate = (str) => str.split('').map(ch => BANGLA_ROMAN[ch] ?? '').join('')
      const phonetic = transliterate(input).toLowerCase().replace(/\s+/g, '')
      searchTerms = exactMatches.length > 0 ? exactMatches : (phonetic ? [phonetic] : [])
    } else {
      searchTerms = [input.toLowerCase()]
    }

    if (searchTerms.length === 0) { setRegionSuggestions([]); return }

    const scored = BANGLADESH_DISTRICTS.map(d => {
      const name = d.toLowerCase()
      const words = name.split(' ')
      let best = Infinity
      for (const term of searchTerms) {
        if (name.includes(term)) { best = -1; break }
        const tolerance = term.length <= 4 ? 1 : 2
        for (const word of words) {
          const dist = levenshtein(word, term)
          if (dist <= tolerance) best = Math.min(best, dist)
        }
      }
      return { d, best }
    }).filter(x => x.best !== Infinity).sort((a, b) => a.best - b.best)

    setRegionSuggestions(scored.map(x => x.d).slice(0, 6))
  }, [region])

  function makeRecognition(onResult) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setError(t('upload:voiceError')); return null }
    const r = new SR()
    r.continuous = false
    r.interimResults = false
    r.lang = isEn ? 'en-US' : 'bn-BD'
    r.onresult = (e) => onResult(e.results[0][0].transcript)
    return r
  }

  function startSpeechRecognition() {
    const r = makeRecognition(transcript => setUserDescription(prev => prev ? `${prev} ${transcript}` : transcript))
    if (!r) return
    recognitionRef.current = r
    r.onstart = () => setIsListening(true)
    r.onerror = () => setIsListening(false)
    r.onend = () => setIsListening(false)
    r.start()
  }

  function stopSpeechRecognition() {
    if (recognitionRef.current) { recognitionRef.current.stop(); setIsListening(false) }
  }

  function startRegionRecognition() {
    const r = makeRecognition(transcript => setRegion(transcript.trim()))
    if (!r) return
    regionRecognitionRef.current = r
    r.onstart = () => setIsRegionListening(true)
    r.onerror = () => setIsRegionListening(false)
    r.onend = () => setIsRegionListening(false)
    r.start()
  }

  function stopRegionRecognition() {
    if (regionRecognitionRef.current) { regionRecognitionRef.current.stop(); setIsRegionListening(false) }
  }

  function handleImageChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setImage(file); setPreview(URL.createObjectURL(file))
    setResult(null); setSecondOpinion(null); setError(null)
  }

  function handleDrop(e) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file || !file.type.startsWith('image/')) return
    setImage(file); setPreview(URL.createObjectURL(file))
    setResult(null); setSecondOpinion(null); setError(null)
  }

  function clearImage() {
    setImage(null); setPreview(null); setCropType(''); setRegion('')
    setUserDescription(''); setResult(null); setSecondOpinion(null)
    setError(null); stopSpeechRecognition(); setWeather(null); setTreatmentData(null)
  }

  async function handleSubmit() {
    if (!image || !cropType) { setError(t('upload:submit.error')); return }
    setLoading(true); setError(null)
    try {
      const formData = new FormData()
      formData.append('image', image)
      formData.append('cropType', cropType)
      formData.append('region', region)
      formData.append('userDescription', userDescription)
      formData.append('plantPart', plantPart)

      const res = await fetch('/api/diagnose', { method: 'POST', body: formData })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Diagnosis failed')
      setResult(data.diagnosis)
      setSecondOpinion(data.secondOpinion || null)
      setWeather(data.weather || null)

      if (data.diagnosis?.disease_detected && data.diagnosis?.disease_name) {
        setLoadingTreatment(true)
        try {
          const tr = await fetch(`/api/treatments?disease=${encodeURIComponent(data.diagnosis.disease_name)}&crop=${encodeURIComponent(cropType)}`)
          const td = await tr.json()
          setTreatmentData(td.found ? td.treatment : null)
        } catch { setTreatmentData(null) }
        finally { setLoadingTreatment(false) }
      } else {
        setTreatmentData(null)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = !loading && !!image && !!cropType && !!region.trim()
  const partLabel = t(`home:parts.${plantPart}.label`)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }}>

      {/* Diagnosis processing overlay */}
      {loading && (
        <div
          aria-live="polite"
          style={{
            position:       'fixed',
            inset:          0,
            zIndex:         50,
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            '1rem',
            background:     'rgba(3,8,15,0.88)',
          }}
        >
          <LeafPulse size={72} speed="fast" />
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9375rem' }}>
              {isEn ? 'Analyzing your crop…' : 'ফসল বিশ্লেষণ করা হচ্ছে…'}
            </p>
            {!isEn && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                Analyzing your crop…
              </p>
            )}
          </div>
        </div>
      )}

      <div className="px-4 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
        <a href="/" className="flex items-center justify-center w-10 h-10 rounded-xl transition-colors flex-shrink-0"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-hover)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = '' }}>
          <ArrowLeft size={20} />
        </a>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div style={{ color: meta.color }}>{meta.icon}</div>
          <h1 className="text-base font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {t('upload:header.diagnosis', { part: partLabel })}
          </h1>
        </div>
        <a href="/history" className="flex-shrink-0 text-xs px-3 py-2 rounded-xl transition-colors"
          style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--brand)'; e.currentTarget.style.borderColor = 'var(--brand-ring)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}>
          {t('upload:header.history')}
        </a>
        <ThemeToggle />
        <HeaderMenu />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Photo upload */}
        <div onDrop={handleDrop} onDragOver={e => e.preventDefault()}
          className="relative rounded-3xl overflow-hidden cursor-pointer"
          style={{ border: `2px dashed ${meta.color}50`, background: 'var(--bg-card)' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = meta.color + 'aa'}
          onMouseLeave={e => e.currentTarget.style.borderColor = meta.color + '50'}
        >
          {preview ? (
            <div className="relative">
              <img src={preview} alt="Preview" className="w-full max-h-80 object-contain p-4" />
              <button onClick={clearImage} suppressHydrationWarning
                className="absolute top-3 right-3 flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors"
                style={{ background: 'var(--bg-overlay)', color: 'var(--text-secondary)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                <X size={14} />{t('upload:photo.retake')}
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-4 py-10 cursor-pointer min-h-[220px]">
              <CameraIcon color={meta.color} size={64} />
              <div className="text-center">
                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{t(`home:parts.${plantPart}.uploadHint`)}</p>
                <p className="text-sm mt-1.5" style={{ color: 'var(--text-secondary)' }}>{t('upload:photo.galleryHint')}</p>
              </div>
              <span className="px-4 py-2 rounded-xl font-semibold text-sm" style={{ background: meta.color, color: '#000' }}>
                {t('upload:photo.addPhoto')}
              </span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          )}
        </div>

        {/* Crop type */}
        <div className="space-y-3">
          <p className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <span>{t('upload:crop.sectionLabel')}</span>
            <span style={{ color: 'var(--sev-high-text)' }}>{t('upload:crop.required')}</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            {CROP_CONFIG.map((crop) => {
              const selected = cropType === crop.id
              return (
                <button key={crop.id} suppressHydrationWarning onClick={() => setCropType(crop.id)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-colors text-left"
                  style={selected
                    ? { backgroundColor: meta.color + '20', borderColor: meta.color, color: 'var(--text-primary)' }
                    : { borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--bg-card)' }
                  }>
                  <span className="text-2xl leading-none flex-shrink-0">{crop.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold leading-tight" style={{ color: selected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {t(`upload:crop.names.${crop.id}`)}
                    </p>
                    {!isEn && (
                      <p className="text-xs mt-0.5" style={{ color: selected ? meta.color : 'var(--text-muted)' }}>{crop.id}</p>
                    )}
                  </div>
                  {selected && (
                    <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: meta.color }}>
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Optional details */}
        <details className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          <summary className="px-5 py-4 cursor-pointer flex items-center justify-between text-sm font-medium select-none list-none [&::-webkit-details-marker]:hidden transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = ''}>
            <span className="flex items-center gap-2">
              <Mic size={15} />
              {t('upload:optional.title')}
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('upload:optional.badge')}</span>
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('upload:optional.expand')}</span>
          </summary>

          <div className="px-5 pb-5 pt-4 space-y-4" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
            {/* Region */}
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{t('upload:region.label')}</label>
              <div className="relative">
                <div ref={regionBorderRef} className="relative rounded-xl overflow-visible transition-colors"
                  style={{ border: isRegionListening ? '1px solid #ef4444' : '1px solid var(--border)', background: 'var(--bg-card)' }}>
                  <input type="text" suppressHydrationWarning
                    placeholder={t('upload:region.placeholder')}
                    value={region}
                    onChange={e => setRegion(e.target.value)}
                    className="w-full bg-transparent border-none px-4 py-3 pr-12 text-sm focus:outline-none"
                    style={{ color: 'var(--text-primary)' }}
                    onFocus={() => { if (regionBorderRef.current) regionBorderRef.current.style.borderColor = meta.color }}
                    onBlur={() => {
                      if (regionBorderRef.current) regionBorderRef.current.style.borderColor = ''
                      setTimeout(() => setRegionSuggestions([]), 150)
                    }}
                    autoComplete="off"
                  />
                  <button type="button" suppressHydrationWarning
                    onClick={() => isRegionListening ? stopRegionRecognition() : startRegionRecognition()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors"
                    style={isRegionListening
                      ? { background: 'rgba(239,68,68,0.2)', color: '#ef4444' }
                      : { background: 'var(--bg-panel)', color: 'var(--text-muted)' }}>
                    {isRegionListening ? <Square size={16} fill="currentColor" /> : <Mic size={16} />}
                  </button>
                </div>
                {regionSuggestions.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 rounded-xl overflow-hidden shadow-lg"
                    style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border)' }}>
                    {regionSuggestions.map(d => (
                      <li key={d} onMouseDown={() => { setRegion(d); setRegionSuggestions([]) }}
                        className="px-4 py-3 text-sm cursor-pointer transition-colors"
                        style={{ color: 'var(--text-primary)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>{d}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{t('upload:description.label')}</label>
                {isListening && (
                  <span className="text-xs flex items-center gap-1.5 font-medium" style={{ color: '#ef4444' }}>
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-pulse" />
                    {t('upload:description.listening')}
                  </span>
                )}
              </div>
              <div className="relative rounded-xl overflow-hidden transition-colors"
                style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                <textarea rows={3}
                  placeholder={t('upload:description.placeholder', { part: partLabel })}
                  value={userDescription} onChange={e => setUserDescription(e.target.value)}
                  className="w-full bg-transparent border-none rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none resize-none"
                  style={{ color: 'var(--text-primary)' }}
                />
                <button type="button" suppressHydrationWarning
                  onClick={() => isListening ? stopSpeechRecognition() : startSpeechRecognition()}
                  className="absolute right-3 bottom-3 p-2.5 rounded-xl transition-colors"
                  style={isListening
                    ? { background: 'rgba(239,68,68,0.2)', color: '#ef4444', outline: '1px solid rgba(239,68,68,0.4)' }
                    : { background: 'var(--bg-panel)', color: 'var(--text-muted)' }}>
                  {isListening ? <Square size={16} fill="currentColor" /> : <Mic size={16} />}
                </button>
              </div>
            </div>
          </div>
        </details>

        {error && (
          <div className="flex items-center gap-2.5 rounded-2xl px-4 py-3.5 text-sm"
            style={{ color: 'var(--sev-high-text)', background: 'var(--sev-high-bg)', border: '1px solid var(--sev-high-border)' }}>
            <AlertCircle size={18} className="flex-shrink-0" />{error}
          </div>
        )}

        <button onClick={handleSubmit} suppressHydrationWarning disabled={!canSubmit || !!result}
          className="w-full font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2.5 text-base"
          style={result
            ? { backgroundColor: 'var(--sev-none-bg)', color: 'var(--sev-none-text)', border: '1.5px solid var(--sev-none-border)', cursor: 'default' }
            : canSubmit
              ? { backgroundColor: meta.color, color: '#000' }
              : { backgroundColor: 'var(--bg-panel)', color: 'var(--text-muted)', cursor: 'not-allowed' }
          }>
          {loading ? (
            <><LeafPulse size={20} speed="fast" />{t('upload:submit.loading')}</>
          ) : result ? (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {t('upload:submit.done')}
            </>
          ) : (
            <><div>{meta.icon}</div>{t('upload:submit.idle')}</>
          )}
        </button>

        {weather && <WeatherCard weather={weather} t={t} />}

        {result && <DiagnosisCard result={result} accentColor={meta.color} isSecond={false} t={t} lang={lang} />}
        {secondOpinion && <DiagnosisCard result={secondOpinion} accentColor="#60a5fa" isSecond={true} t={t} lang={lang} />}

        {loadingTreatment && (
          <div className="flex items-center gap-3 rounded-2xl px-5 py-4 text-sm"
            style={{ background: 'var(--sev-none-bg)', border: '1px solid var(--sev-none-border)', color: 'var(--sev-none-text)' }}>
            <LeafPulse size={22} className="flex-shrink-0" />
            {t('upload:treatment.loading')}
          </div>
        )}

        {treatmentData && !loadingTreatment && (
          <>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex-1 h-px" style={{ background: 'var(--sev-none-border)' }} />
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--sev-none-text)' }}>
                {t('upload:treatment.divider')}
              </span>
              <div className="flex-1 h-px" style={{ background: 'var(--sev-none-border)' }} />
            </div>
            <TreatmentCard treatment={treatmentData} t={t} />
          </>
        )}

        {result?.disease_detected && (
          <YouTubeSection
            diseaseName={secondOpinion?.disease_name || result?.disease_name}
            cropType={cropType}
            lang={lang}
          />
        )}
      </div>
    </div>
  )
}

export default function UploadPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
        <LeafPulse size={56} />
      </div>
    }>
      <UploadPageInner />
    </Suspense>
  )
}
