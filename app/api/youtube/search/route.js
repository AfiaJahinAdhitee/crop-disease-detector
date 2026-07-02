export const runtime = 'nodejs'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')

  if (!q) {
    return Response.json({ success: false, error: 'Query is required' }, { status: 400 })
  }

  try {
    const url = new URL('https://www.googleapis.com/youtube/v3/search')
    url.searchParams.set('part', 'snippet')
    url.searchParams.set('q', q)
    url.searchParams.set('type', 'video')
    url.searchParams.set('maxResults', '5')
    url.searchParams.set('relevanceLanguage', 'bn')   // prefer Bangla results
    url.searchParams.set('key', process.env.YOUTUBE_API_KEY)

    const res = await fetch(url.toString())
    const data = await res.json()

    if (!res.ok) {
      return Response.json({ success: false, error: data.error?.message || 'YouTube API error' }, { status: 500 })
    }

    const videos = data.items.map(item => ({
      video_id:     item.id.videoId,
      title:        item.snippet.title,
      thumbnail:    item.snippet.thumbnails.medium.url,
      channel:      item.snippet.channelTitle,
      publish_date: item.snippet.publishedAt,
    }))

    return Response.json({ success: true, videos })
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 })
  }
}