'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next'
import '@/app/i18n/config'
import { ArrowLeft, LayoutDashboard, AlertTriangle, CheckCircle } from 'lucide-react'
import LeafPulse from '@/app/components/LeafPulse'
import ThemeToggle from '@/app/components/ThemeToggle'
import HeaderMenu from '@/app/components/HeaderMenu'
import { useTheme } from '@/app/providers/ThemeProvider'

const DiseaseMap = dynamic(() => import('./DiseaseMap'), { ssr: false })

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

export default function DashboardPage() {
  const { t, i18n } = useTranslation(['dashboard', 'common'])
  const { theme } = useTheme()
  const lang = i18n.language?.startsWith('en') ? 'en' : 'bn'

  const [rawAnalytics, setRawAnalytics] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState('all');
  const [recentActivity, setRecentActivity] = useState([]);
  const [mapData, setMapData] = useState([]);
  const [mapWindowDays, setMapWindowDays] = useState(30);
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [loadingMap, setLoadingMap] = useState(true);

  function formatAndSetChartData(data, cropFilter) {
    const filtered = cropFilter !== 'all' ? data.filter(item => item.crop === cropFilter) : data;
    setChartData(filtered.map(item => ({
      name: cropFilter === 'all' ? `${item.region} (${item.crop})` : item.region,
      [t('dashboard:chart.barLabel')]: item.count,
    })));
  }

  useEffect(() => {
    async function fetchAll() {
      try { const r = await fetch('/api/dashboard/analytics'); const d = await r.json(); setRawAnalytics(d); formatAndSetChartData(d, 'all'); } catch {} finally { setLoadingChart(false); }
      try { const r = await fetch('/api/dashboard/recent'); const d = await r.json(); setRecentActivity(Array.isArray(d) ? d : []); } catch {} finally { setLoadingRecent(false); }
      try { const r = await fetch('/api/dashboard/map'); const j = await r.json(); setMapData((j.data||[]).map(e=>({...e,window_days:j.window_days}))); if(j.window_days) setMapWindowDays(j.window_days); } catch {} finally { setLoadingMap(false); }
    }
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (rawAnalytics.length) formatAndSetChartData(rawAnalytics, selectedCrop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  function handleCropChange(e) {
    const crop = e.target.value;
    setSelectedCrop(crop);
    formatAndSetChartData(rawAnalytics, crop);
  }

  const availableCrops = Array.from(new Set(rawAnalytics.map(item => item.crop)));
  const isDark = theme === 'dark'
  const chartAxisColor  = isDark ? '#94a3b8' : '#475569'
  const chartGridColor  = isDark ? '#1e293b' : '#e2e8f0'
  const chartTooltipBg  = isDark ? '#0f172a' : '#ffffff'
  const chartTooltipBdr = isDark ? '#334155' : '#e2e8f0'

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }}>

      {/* Header — matches history page */}
      <div className="px-4 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
        <Link href="/" className="w-11 h-11 flex items-center justify-center rounded-2xl transition-colors flex-shrink-0"
          style={{ color: 'var(--text-secondary)' }}>
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <LayoutDashboard size={16} style={{ color: 'var(--brand)', flexShrink: 0 }} />
          <h1 className="text-base font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{t('dashboard:title')}</h1>
        </div>
        <ThemeToggle />
        <HeaderMenu />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Chart */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            style={{ borderBottom: '1px solid var(--border)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t('dashboard:chart.title')}</p>
            {!loadingChart && rawAnalytics.length > 0 && (
              <select value={selectedCrop} onChange={handleCropChange}
                className="text-xs rounded-xl px-3 py-1.5 focus:outline-none"
                style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                <option value="all">{t('dashboard:chart.allCrops')}</option>
                {availableCrops.map(crop => <option key={crop} value={crop}>{crop}</option>)}
              </select>
            )}
          </div>
          <div className="px-5 py-4">
            {loadingChart ? (
              <div className="flex items-center gap-3 py-8 justify-center text-sm" style={{ color: 'var(--text-muted)' }}>
                <LeafPulse size={22} />{t('dashboard:chart.loading')}
              </div>
            ) : chartData.length === 0 ? (
              <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>{t('dashboard:chart.empty')}</p>
            ) : (
              <div className="w-full h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                    <XAxis dataKey="name" stroke={chartAxisColor} fontSize={11} />
                    <YAxis stroke={chartAxisColor} fontSize={11} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: chartTooltipBg, borderColor: chartTooltipBdr, borderRadius: '12px' }} itemStyle={{ color: 'var(--brand)' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey={t('dashboard:chart.barLabel')} fill="var(--brand)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-2"
            style={{ borderBottom: '1px solid var(--border)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t('dashboard:map.title')}</p>
            <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-400" />{t('dashboard:map.low')}</span>
              <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-500" />{t('dashboard:map.medium')}</span>
              <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" />{t('dashboard:map.high')}</span>
              <span>· {t('dashboard:map.windowDays', { days: mapWindowDays })}</span>
            </div>
          </div>
          <div className="p-4">
            {loadingMap ? (
              <div className="h-[380px] flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                <LeafPulse size={22} />{t('dashboard:map.loading')}
              </div>
            ) : mapData.length === 0 ? (
              <div className="h-[380px] flex items-center justify-center text-sm text-center px-4" style={{ color: 'var(--text-muted)' }}>{t('dashboard:map.empty')}</div>
            ) : (
              <DiseaseMap data={mapData} lang={lang} theme={theme} />
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t('dashboard:recent.title')}</p>
          </div>

          {loadingRecent ? (
            <div className="flex items-center gap-3 py-10 justify-center text-sm" style={{ color: 'var(--text-muted)' }}>
              <LeafPulse size={22} />{t('dashboard:recent.loading')}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center px-4">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t('dashboard:recent.empty')}</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {recentActivity.map((activity) => (
                <Link key={activity.id} href={`/history/${activity.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors"
                  style={{ display: 'flex' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <div className="flex-shrink-0">
                    {activity.is_healthy
                      ? <CheckCircle size={16} className="text-green-500" />
                      : <AlertTriangle size={16} className="text-yellow-500" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-tight truncate" style={{ color: 'var(--text-primary)' }}>
                      {activity.disease_name || (activity.is_healthy ? t('dashboard:recent.healthy') : t('dashboard:recent.checking'))}
                    </p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                      {activity.crop_type}
                      {activity.plant_part && ` · ${activity.plant_part}`}
                      {activity.region && ` · ${activity.region}`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    {activity.severity && activity.severity !== 'none' && (
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={SEVERITY_STYLE[activity.severity] || SEVERITY_STYLE.low}>
                        {activity.severity}
                      </span>
                    )}
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {formatDate(activity.created_at, lang)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
