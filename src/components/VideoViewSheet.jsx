import React, { useState, useEffect } from 'react'

export default function VideoViewSheet({ video, onClose, onAddXP }) {
  const [liked, setLiked] = useState(false)
  const [xpGiven, setXpGiven] = useState(false)

  useEffect(() => {
    if (!xpGiven) {
      const timer = setTimeout(() => {
        onAddXP(30)
        setXpGiven(true)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [xpGiven, onAddXP])

  return (
    <div className="video-view-sheet">
      <div className="video-view__header">
        <button className="video-view__back" onClick={onClose} aria-label="Back">←</button>
        <div className="video-view__title">{video.title}</div>
      </div>

      <div className="video-embed-wrap">
        <iframe
          src={`https://www.youtube.com/embed/${video.ytId}?autoplay=0&rel=0`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <div className="video-replace-note">
        📝 Replace video ID "{video.ytId}" with your actual YouTube video ID
      </div>

      <div className="video-view__info">
        <div className="video-view__series-badge">
          🎬 {video.seriesName}
        </div>

        {video.description && (
          <p className="video-view__desc">{video.description}</p>
        )}

        {video.keyTakeaways && video.keyTakeaways.length > 0 && (
          <div className="video-view__takeaways">
            <h4>Key Takeaways</h4>
            {video.keyTakeaways.map((t, i) => (
              <div key={i} className="takeaway-item">{t}</div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className={`video-like-btn${liked ? ' video-like-btn--liked' : ''}`}
            onClick={() => setLiked(l => !l)}
          >
            {liked ? '❤️' : '🤍'} {liked ? 'Liked' : 'Like'}
          </button>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            ⚡ +30 XP for watching
          </div>
        </div>
      </div>
    </div>
  )
}
