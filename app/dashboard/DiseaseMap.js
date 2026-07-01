'use client'

import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const DISTRICTS = [
  { names: ['dhaka', 'ঢাকা'],                                          lat: 23.8103, lon: 90.4125 },
  { names: ['faridpur', 'ফরিদপুর'],                                    lat: 23.6070, lon: 89.8429 },
  { names: ['gazipur', 'গাজীপুর'],                                     lat: 23.9999, lon: 90.4203 },
  { names: ['gopalganj', 'গোপালগঞ্জ'],                                lat: 23.0046, lon: 89.8267 },
  { names: ['kishoreganj', 'কিশোরগঞ্জ'],                              lat: 24.4442, lon: 90.7762 },
  { names: ['madaripur', 'মাদারীপুর'],                                lat: 23.1640, lon: 90.2023 },
  { names: ['manikganj', 'মানিকগঞ্জ'],                               lat: 23.8634, lon: 90.0024 },
  { names: ['munshiganj', 'মুন্সিগঞ্জ'],                              lat: 23.5422, lon: 90.5305 },
  { names: ['narayanganj', 'নারায়ণগঞ্জ'],                            lat: 23.6238, lon: 90.4996 },
  { names: ['narsingdi', 'নরসিংদী'],                                  lat: 23.9314, lon: 90.7149 },
  { names: ['rajbari', 'রাজবাড়ী'],                                   lat: 23.7571, lon: 89.6440 },
  { names: ['shariatpur', 'শরীয়তপুর'],                               lat: 23.2424, lon: 90.4348 },
  { names: ['tangail', 'টাঙ্গাইল'],                                   lat: 24.2513, lon: 89.9167 },
  { names: ['bandarban', 'বান্দরবান'],                                lat: 22.1953, lon: 92.2184 },
  { names: ['brahmanbaria', 'ব্রাহ্মণবাড়িয়া'],                      lat: 23.9570, lon: 91.1115 },
  { names: ['chandpur', 'চাঁদপুর'],                                   lat: 23.2333, lon: 90.6667 },
  { names: ['chattogram', 'chittagong', 'চট্টগ্রাম'],                lat: 22.3569, lon: 91.7832 },
  { names: ["cox's bazar", 'coxsbazar', 'কক্সবাজার'],                lat: 21.4272, lon: 92.0058 },
  { names: ['cumilla', 'comilla', 'কুমিল্লা'],                        lat: 23.4576, lon: 91.1809 },
  { names: ['feni', 'ফেনী'],                                           lat: 23.0155, lon: 91.3976 },
  { names: ['khagrachhari', 'খাগড়াছড়ি'],                            lat: 23.1193, lon: 91.9847 },
  { names: ['lakshmipur', 'লক্ষ্মীপুর'],                             lat: 22.9446, lon: 90.8417 },
  { names: ['noakhali', 'নোয়াখালী'],                                 lat: 22.8696, lon: 91.0990 },
  { names: ['rangamati', 'রাঙ্গামাটি'],                               lat: 22.6326, lon: 92.2058 },
  { names: ['bogura', 'bogra', 'বগুড়া'],                              lat: 24.8465, lon: 89.3776 },
  { names: ['chapai nawabganj', 'chapainawabganj', 'চাঁপাইনবাবগঞ্জ'], lat: 24.5965, lon: 88.2785 },
  { names: ['joypurhat', 'জয়পুরহাট'],                                lat: 25.0959, lon: 89.0220 },
  { names: ['naogaon', 'নওগাঁ'],                                      lat: 24.7936, lon: 88.9312 },
  { names: ['natore', 'নাটোর'],                                       lat: 24.4201, lon: 88.9877 },
  { names: ['pabna', 'পাবনা'],                                        lat: 24.0064, lon: 89.2372 },
  { names: ['rajshahi', 'রাজশাহী'],                                   lat: 24.3636, lon: 88.6241 },
  { names: ['sirajganj', 'সিরাজগঞ্জ'],                               lat: 24.4534, lon: 89.7120 },
  { names: ['bagerhat', 'বাগেরহাট'],                                  lat: 22.6602, lon: 89.7854 },
  { names: ['chuadanga', 'চুয়াডাঙ্গা'],                              lat: 23.6401, lon: 88.8415 },
  { names: ['jashore', 'jessore', 'যশোর'],                            lat: 23.1664, lon: 89.2181 },
  { names: ['jhenaidah', 'ঝিনাইদহ'],                                 lat: 23.5448, lon: 89.1537 },
  { names: ['khulna', 'খুলনা'],                                       lat: 22.8456, lon: 89.5403 },
  { names: ['kushtia', 'কুষ্টিয়া'],                                  lat: 23.9010, lon: 89.1191 },
  { names: ['magura', 'মাগুরা'],                                      lat: 23.4877, lon: 89.4196 },
  { names: ['meherpur', 'মেহেরপুর'],                                  lat: 23.7622, lon: 88.6318 },
  { names: ['narail', 'নড়াইল'],                                      lat: 23.1726, lon: 89.5120 },
  { names: ['satkhira', 'সাতক্ষীরা'],                                lat: 22.7185, lon: 89.0705 },
  { names: ['barguna', 'বরগুনা'],                                     lat: 22.1500, lon: 90.1167 },
  { names: ['barishal', 'barisal', 'বরিশাল'],                         lat: 22.7010, lon: 90.3535 },
  { names: ['bhola', 'ভোলা'],                                         lat: 22.6885, lon: 90.6563 },
  { names: ['jhalokati', 'ঝালকাঠি'],                                  lat: 22.6414, lon: 90.1999 },
  { names: ['patuakhali', 'পটুয়াখালী'],                              lat: 22.3596, lon: 90.3296 },
  { names: ['pirojpur', 'পিরোজপুর'],                                  lat: 22.5794, lon: 89.9749 },
  { names: ['habiganj', 'হবিগঞ্জ'],                                   lat: 24.3745, lon: 91.4159 },
  { names: ['moulvibazar', 'মৌলভীবাজার'],                             lat: 24.4829, lon: 91.7774 },
  { names: ['sunamganj', 'সুনামগঞ্জ'],                               lat: 25.0658, lon: 91.3950 },
  { names: ['sylhet', 'সিলেট'],                                       lat: 24.8949, lon: 91.8687 },
  { names: ['dinajpur', 'দিনাজপুর'],                                  lat: 25.6279, lon: 88.6338 },
  { names: ['gaibandha', 'গাইবান্ধা'],                               lat: 25.3288, lon: 89.5288 },
  { names: ['kurigram', 'কুড়িগ্রাম'],                                lat: 25.8073, lon: 89.6364 },
  { names: ['lalmonirhat', 'লালমনিরহাট'],                             lat: 25.9923, lon: 89.2847 },
  { names: ['nilphamari', 'নীলফামারী'],                               lat: 25.9316, lon: 88.8560 },
  { names: ['panchagarh', 'পঞ্চগড়'],                                 lat: 26.3411, lon: 88.5541 },
  { names: ['rangpur', 'রংপুর'],                                      lat: 25.7439, lon: 89.2752 },
  { names: ['thakurgaon', 'ঠাকুরগাঁও'],                              lat: 26.0337, lon: 88.4616 },
  { names: ['jamalpur', 'জামালপুর'],                                  lat: 24.9375, lon: 89.9375 },
  { names: ['mymensingh', 'ময়মনসিংহ'],                               lat: 24.7471, lon: 90.4203 },
  { names: ['netrokona', 'নেত্রকোণা'],                               lat: 24.8703, lon: 90.7271 },
  { names: ['sherpur', 'শেরপুর'],                                     lat: 25.0194, lon: 90.0155 },
]

const COORDS_BY_NAME = {}
for (const d of DISTRICTS) {
  for (const alias of d.names) {
    COORDS_BY_NAME[alias.toLowerCase().trim()] = { lat: d.lat, lon: d.lon }
  }
}

function resolveCoords(region) {
  const key = region.toLowerCase().trim()
  if (COORDS_BY_NAME[key]) return COORDS_BY_NAME[key]
  for (const [alias, coords] of Object.entries(COORDS_BY_NAME)) {
    if (alias.includes(key) || key.includes(alias)) return coords
  }
  return null
}

const SEV_COLOR = { high: '#ef4444', medium: '#f97316', low: '#eab308' }

function circleRadius(total) {
  return Math.max(9, Math.min(34, Math.sqrt(total) * 7))
}

// Theme-specific popup colors (can't use CSS vars in Leaflet HTML strings)
const POPUP_COLORS = {
  dark:  { bg: '#1e293b', text: '#e2e8f0', subtext: '#94a3b8', label: '#64748b', count: '#4ade80', border: '#334155' },
  light: { bg: '#ffffff', text: '#0f172a', subtext: '#475569', label: '#94a3b8', count: '#16a34a', border: '#e2e8f0' },
}

export default function DiseaseMap({ data = [], lang = 'bn', theme = 'dark' }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const isEn = lang === 'en'

  useEffect(() => {
    if (!containerRef.current) return

    const isDark = theme === 'dark'
    const pc = POPUP_COLORS[isDark ? 'dark' : 'light']
    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

    const map = L.map(containerRef.current, {
      center: [23.685, 90.356],
      zoom: 7,
      scrollWheelZoom: false,
    })

    L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://carto.com/attributions">CartoDB</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map)

    for (const entry of data) {
      const coords = resolveCoords(entry.region)
      if (!coords) continue

      const days = entry.window_days || 30
      const casesLine = isEn
        ? `${entry.total} active case(s) · last ${days} days`
        : `${entry.total} টি সক্রিয় কেস · শেষ ${days} দিন`
      const diseasesLabel = isEn ? 'Top diseases' : 'প্রধান রোগ'

      const popup = `
        <div style="min-width:180px;background:${pc.bg};color:${pc.text}">
          <p style="font-weight:700;font-size:14px;margin:0 0 4px;color:${pc.text}">${entry.region}</p>
          <p style="font-size:12px;color:${pc.subtext};margin:0 0 6px">${casesLine}</p>
          <p style="font-size:11px;color:${pc.label};margin:0 0 5px;text-transform:uppercase;letter-spacing:0.08em">${diseasesLabel}</p>
          <div style="display:flex;flex-direction:column;gap:3px">
            ${entry.diseases.map(d => `
              <div style="display:flex;justify-content:space-between;font-size:12px">
                <span style="color:${pc.text}">${d.name}</span>
                <span style="color:${pc.count};font-weight:600;margin-left:12px">${d.count}</span>
              </div>`).join('')}
          </div>
        </div>`

      L.circleMarker([coords.lat, coords.lon], {
        radius: circleRadius(entry.total),
        fillColor: SEV_COLOR[entry.max_severity] || '#22c55e',
        fillOpacity: 0.78,
        color: isDark ? '#0f172a' : '#ffffff',
        weight: 1.5,
      }).bindPopup(popup).addTo(map)
    }

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [data, lang, theme])

  return (
    <div
      ref={containerRef}
      style={{ height: '420px', width: '100%', borderRadius: '12px', background: 'var(--bg-panel)' }}
    />
  )
}
