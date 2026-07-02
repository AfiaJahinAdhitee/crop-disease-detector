'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import '@/app/i18n/config'

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" className="text-red-500">
    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/>
  </svg>
)

export default function YouTubeSection({ diseaseName, cropType, lang: langProp }) {
  const { t, i18n } = useTranslation('upload')
  const lang = langProp ?? (i18n.language?.startsWith('en') ? 'en' : 'bn')
  const isEn = lang === 'en'

  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeVideoId, setActiveVideoId] = useState(null)
  const playerRef = useRef(null)

  const query = isEn
    ? `${cropType} ${diseaseName} plant disease treatment`
    : (() => {
        const banglaOnly = diseaseName
          .replace(/[a-zA-Z0-9\(\)\[\]\{\}\/\\,._-]+/g, ' ')
          .replace(/\s+/g, ' ').trim()
        const term = banglaOnly.length > 3 ? banglaOnly : diseaseName
        return `${cropType} ${term} গাছের রোগ চিকিৎসা`
      })()

  useEffect(() => {
    if (!diseaseName) return
    setLoading(true); setError(null)
    fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`)
      .then(r => r.json())
      .then(data => { if (data.success) setVideos(data.videos); else setError(data.error) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [diseaseName, cropType, lang])

  useEffect(() => {
    if (document.getElementById('yt-api-script')) return
    const tag = document.createElement('script')
    tag.id = 'yt-api-script'
    tag.src = 'https://www.youtube.com/iframe_api'
    document.body.appendChild(tag)
  }, [])

  useEffect(() => {
    if (!activeVideoId) return
    const timer = setTimeout(() => {
      function createPlayer() {
        if (playerRef.current) { playerRef.current.destroy(); playerRef.current = null }
        playerRef.current = new window.YT.Player('yt-player', {
          videoId: activeVideoId,
          playerVars: { autoplay: 1, rel: 0, modestbranding: 1 },
          events: { onReady: (e) => e.target.playVideo() },
        })
      }
      if (window.YT && window.YT.Player) createPlayer()
      else window.onYouTubeIframeAPIReady = createPlayer
    }, 100)
    return () => clearTimeout(timer)
  }, [activeVideoId])

  function closePlayer() {
    if (playerRef.current) playerRef.current.stopVideo()
    setActiveVideoId(null)
  }

  if (loading) {
    return (
      <div className="rounded-2xl p-5 flex items-center gap-3 text-sm"
        style={{ border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
        <Loader2 size={16} className="animate-spin" />
        {t('youtube.loading')}
      </div>
    )
  }

  if (error || videos.length === 0) return null

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
      <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
        <YoutubeIcon />
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t('youtube.header')}</p>
      </div>

      {activeVideoId && (
        <div className="relative bg-black">
          <div id="yt-player" className="w-full aspect-video" />
          <button onClick={closePlayer}
            className="absolute top-2 right-2 rounded-full p-1.5 transition-colors z-10"
            style={{ background: 'rgba(0,0,0,0.7)', color: '#ffffff' }}
            onMouseEnter={e => e.currentTarget.style.background = '#000'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="p-4 grid grid-cols-1 gap-3">
        {videos.map(video => (
          <button key={video.video_id} onClick={() => setActiveVideoId(video.video_id)}
            className="flex items-start gap-3 p-2 rounded-xl transition-colors text-left w-full"
            style={activeVideoId === video.video_id
              ? { background: 'var(--bg-panel)', outline: '1px solid var(--border-strong)' }
              : { background: 'transparent' }
            }
            onMouseEnter={e => { if (activeVideoId !== video.video_id) e.currentTarget.style.background = 'var(--bg-hover)' }}
            onMouseLeave={e => { if (activeVideoId !== video.video_id) e.currentTarget.style.background = 'transparent' }}>
            <div className="relative flex-shrink-0 w-32 rounded-lg overflow-hidden">
              <img src={video.thumbnail} alt={video.title} className="w-full aspect-video object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                  <svg viewBox="0 0 16 16" fill="white" width="12" height="12"><path d="M4 3l9 5-9 5V3z"/></svg>
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0 py-0.5">
              <p className="text-sm font-medium line-clamp-2 leading-snug" style={{ color: 'var(--text-primary)' }}>{video.title}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{video.channel}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {new Date(video.publish_date).toLocaleDateString(isEn ? 'en-GB' : 'bn-BD', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
