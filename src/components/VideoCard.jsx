import React from 'react'

function tierRequired(tier) {
  if (tier === 'pro') return 'pro'
  if (tier === 'elite') return 'elite'
  return null
}

export default function VideoCard({ video, userTier, onSelect, onOpenPaywall }) {
  const required = tierRequired(video.tier)
  const isLocked =
    (required === 'pro' && userTier === 'free') ||
    (required === 'elite' && userTier !== 'elite')

  const handleClick = () => {
    if (isLocked) {
      onOpenPaywall(required)
    } else {
      onSelect(video)
    }
  }

  return (
    <div className="video-card" onClick={handleClick}>
      <div className="video-thumb" style={{ background: video.gradient }}>
        <div className="video-play-btn">▶</div>
        {isLocked && (
          <div className="video-lock-overlay">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>🔒</div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: required === 'elite' ? '#F59E0B' : '#A855F7',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                }}
              >
                {required === 'elite' ? 'ELITE' : 'PRO'}
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="video-info">
        <div className="video-number">{video.number}</div>
        <div className="video-title">{video.title}</div>
        <div className="video-duration">{video.duration}</div>
      </div>
    </div>
  )
}
