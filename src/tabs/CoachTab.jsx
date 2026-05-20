import React from 'react'
import { videoSeries, coachProfile } from '../data/videos'
import VideoCard from '../components/VideoCard'

export default function CoachTab({ user, onOpenPaywall, onSelectVideo, onAddXP }) {
  const handleSelectVideo = (video) => {
    onSelectVideo(video)
  }

  return (
    <div className="coach-tab">
      {/* Coach Profile */}
      <div className="coach-profile-card">
        <div
          className="coach-avatar"
          style={{ background: coachProfile.gradient }}
        >
          {coachProfile.initials}
        </div>
        <div className="coach-name">{coachProfile.name}</div>
        <div className="coach-tagline">{coachProfile.tagline}</div>
        <div className="coach-rating">
          <span>⭐ {coachProfile.rating}</span>
          <span style={{ color: 'var(--glass-border-2)' }}>·</span>
          <span>👥 {coachProfile.students} students</span>
        </div>
        <div className="coach-bio">"{coachProfile.bio}"</div>
      </div>

      {/* Video Series */}
      {videoSeries.map(series => (
        <div key={series.id} className="series-block">
          <div className="series-header">
            <div className="series-title">{series.name}</div>
            <span
              className="badge"
              style={{
                background:
                  series.badge === 'ELITE'
                    ? 'rgba(245,158,11,0.15)'
                    : series.badge === 'PRO'
                    ? 'rgba(168,85,247,0.15)'
                    : 'rgba(6,182,212,0.15)',
                color: series.badgeColor,
                border: `1px solid ${series.badgeColor}40`,
              }}
            >
              {series.badge}
            </span>
          </div>
          <div className="series-desc">{series.description}</div>

          {series.videos.map(video => (
            <VideoCard
              key={video.id}
              video={video}
              userTier={user.tier}
              onSelect={handleSelectVideo}
              onOpenPaywall={onOpenPaywall}
            />
          ))}
        </div>
      ))}

      <div style={{ height: 12 }} />
    </div>
  )
}
