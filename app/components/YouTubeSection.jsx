'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, X } from 'lucide-react'

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" className="text-red-500">
    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/>
  </svg>
)

export default function YouTubeSection({ diseaseName, cropType }) {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeVideoId, setActiveVideoId] = useState(null)
  const playerRef = useRef(null)
  const playerContainerRef = useRef(null)

  // Build query: English disease name + crop for broader results
  const query = `${cropType} ${diseaseName} plant disease treatment`

  useEffect(() => {
    if (!diseaseName) return
    setLoading(true)
    setError(null)

    fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setVideos(data.videos)
        else setError(data.error)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [diseaseName, cropType])

  // Load YouTube IFrame API script once
  useEffect(() => {
    if (window.YT) return // already loaded
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.body.appendChild(tag)
  }, [])

  function openPlayer(videoId) {
    setActiveVideoId(videoId)
  }

  // Init or change the YT player when activeVideoId changes
  useEffect(() => {
    if (!activeVideoId) return

    function initPlayer() {
      if (playerRef.current) {
        playerRef.current.loadVideoById(activeVideoId)
        return
      }
      playerRef.current = new window.YT.Player('yt-player', {
        videoId: activeVideoId,
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
        },
      })
    }

    // YT API may not be ready yet
    if (window.YT && window.YT.Player) {
      initPlayer()
    } else {
      window.onYouTubeIframeAPIReady = initPlayer
    }
  }, [activeVideoId])

  function closePlayer() {
    if (playerRef.current) {
      playerRef.current.stopVideo()
    }
    setActiveVideoId(null)
  }

  if (loading) {
    return (
      <div className="border border-gray-800 rounded-2xl bg-gray-900 p-5 flex items-center gap-3 text-gray-400 text-sm">
        <Loader2 size={16} className="animate-spin" />
        সংশ্লিষ্ট ভিডিও খোঁজা হচ্ছে...
      </div>
    )
  }

  if (error || videos.length === 0) return null // silent fail — no clutter

  return (
    <div className="border border-gray-800 rounded-2xl bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-800 flex items-center gap-2">
        <YoutubeIcon />
        <p className="text-sm font-semibold text-gray-200">
          সম্পর্কিত ভিডিও / Related Videos
        </p>
      </div>

      {/* In-page player */}
      {activeVideoId && (
        <div className="relative bg-black" ref={playerContainerRef}>
          <div id="yt-player" className="w-full aspect-video" />
          <button
            onClick={closePlayer}
            className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full p-1.5 transition-colors z-10"
            title="Close player"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Thumbnail grid */}
      <div className="p-4 grid grid-cols-1 gap-3">
        {videos.map(video => (
          <button
            key={video.video_id}
            onClick={() => openPlayer(video.video_id)}
            className={`flex items-start gap-3 p-2 rounded-xl transition-colors text-left w-full
              ${activeVideoId === video.video_id
                ? 'bg-gray-700 ring-1 ring-gray-500'
                : 'hover:bg-gray-800'
              }`}
          >
            {/* Thumbnail */}
            <div className="relative flex-shrink-0 w-32 rounded-lg overflow-hidden">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full aspect-video object-cover"
              />
              {/* Play icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                  <svg viewBox="0 0 16 16" fill="white" width="12" height="12">
                    <path d="M4 3l9 5-9 5V3z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Meta */}
            <div className="flex-1 min-w-0 py-0.5">
              <p className="text-sm font-medium text-gray-200 line-clamp-2 leading-snug">
                {video.title}
              </p>
              <p className="text-xs text-gray-500 mt-1">{video.channel}</p>
              <p className="text-xs text-gray-600 mt-0.5">
                {new Date(video.publish_date).toLocaleDateString('bn-BD', {
                  year: 'numeric', month: 'short', day: 'numeric'
                })}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}