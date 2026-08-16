/**
 * Pull a YouTube video ID from watch, share, embed, or shorts URLs.
 */
export function getYouTubeVideoId(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  try {
    const url = new URL(trimmed)

    if (url.hostname === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0]
      return id || null
    }

    if (url.hostname.includes('youtube.com')) {
      if (url.pathname === '/watch') {
        return url.searchParams.get('v')
      }

      const parts = url.pathname.split('/').filter(Boolean)
      if (
        (parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live') &&
        parts[1]
      ) {
        return parts[1]
      }
    }
  } catch {
    // bare ID
    if (/^[\w-]{11}$/.test(trimmed)) return trimmed
  }

  return null
}

export function getYouTubeEmbedUrl(input: string): string | null {
  const id = getYouTubeVideoId(input)
  return id ? `https://www.youtube.com/embed/${id}` : null
}
