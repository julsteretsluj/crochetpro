import { getYouTubeEmbedUrl } from '../lib/youtube'
import './YouTubeEmbed.css'

type YouTubeEmbedProps = {
  url: string
  title?: string
}

export function YouTubeEmbed({ url, title = 'Pattern video' }: YouTubeEmbedProps) {
  const embedUrl = getYouTubeEmbedUrl(url)

  if (!embedUrl) {
    return (
      <p className="youtube-embed__invalid">
        Couldn’t embed that YouTube link. Use a full watch or share URL.
      </p>
    )
  }

  return (
    <div className="youtube-embed">
      <iframe
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  )
}
