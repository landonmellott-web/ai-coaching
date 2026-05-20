import React from 'react'
import { tracks } from '../data/lessons'

function tierAccess(lessonTier, userTier) {
  if (lessonTier === 'free') return true
  if (lessonTier === 'pro') return userTier === 'pro' || userTier === 'elite'
  if (lessonTier === 'elite') return userTier === 'elite'
  return false
}

export default function LearnTab({ user, onOpenPaywall, onSelectLesson }) {
  const totalLessons = tracks.reduce((sum, t) => sum + t.lessons.length, 0)
  const completedCount = user.lessonsCompleted.length

  const handleLessonClick = (lesson) => {
    if (!tierAccess(lesson.tier, user.tier)) {
      const needed = lesson.tier === 'elite' ? 'elite' : 'pro'
      onOpenPaywall(needed)
      return
    }
    if (!lesson.content || lesson.content.length === 0) return
    onSelectLesson(lesson)
  }

  return (
    <div className="learn-tab">
      <div className="learn-header">
        <h1>Learning Journey 🗺️</h1>
        <p>{completedCount} of {totalLessons} lessons complete</p>
      </div>

      {/* Overall progress */}
      <div style={{ marginBottom: 28 }}>
        <div className="progress-bar" style={{ height: 8 }}>
          <div
            className="progress-bar__fill"
            style={{ width: `${(completedCount / totalLessons) * 100}%` }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: 'var(--text-muted)' }}>
          <span>Overall progress</span>
          <span>{Math.round((completedCount / totalLessons) * 100)}%</span>
        </div>
      </div>

      <div className="journey-map">
        <div className="journey-line" />

        {tracks.map(track => {
          const trackTierLabel =
            track.tier === 'elite' ? 'ELITE' : track.tier === 'pro' ? 'PRO' : 'FREE'
          const trackTierClass =
            track.tier === 'elite' ? 'badge-elite' : track.tier === 'pro' ? 'badge-pro' : 'badge-free'

          return (
            <div key={track.id} className="track-block">
              <div className="track-header">
                <div
                  className="track-dot"
                  style={{ background: track.color, boxShadow: `0 0 12px ${track.color}60` }}
                />
                <span className="track-title">
                  {track.icon} {track.name}
                </span>
                <span className={`badge ${trackTierClass}`}>{trackTierLabel}</span>
              </div>

              <div className="lessons-grid">
                {track.lessons.map(lesson => {
                  const isCompleted = user.lessonsCompleted.includes(lesson.id)
                  const hasAccess = tierAccess(lesson.tier, user.tier)
                  const hasContent = lesson.content && lesson.content.length > 0

                  let numClass = 'lesson-number--locked'
                  if (isCompleted) numClass = 'lesson-number--done'
                  else if (hasAccess && hasContent) numClass = 'lesson-number--active'

                  return (
                    <div
                      key={lesson.id}
                      className={`lesson-card${isCompleted ? ' lesson-card--completed' : ''}${!hasAccess ? ' lesson-card--locked' : ''}`}
                      onClick={() => handleLessonClick(lesson)}
                    >
                      <div className={`lesson-number ${numClass}`}>
                        {isCompleted ? '✓' : lesson.number}
                      </div>
                      <div className="lesson-icon">{lesson.icon}</div>
                      <div className="lesson-info">
                        <div className="lesson-title">{lesson.title}</div>
                        <div className="lesson-meta">
                          <span>{lesson.duration}</span>
                          <div className="difficulty-dots">
                            {[1, 2, 3].map(d => (
                              <div
                                key={d}
                                className={`difficulty-dot${d <= lesson.difficulty ? ' difficulty-dot--filled' : ''}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      {isCompleted && (
                        <div className="lesson-check">✓</div>
                      )}
                      {!hasAccess && (
                        <div
                          className="lesson-lock"
                          style={{ color: lesson.tier === 'elite' ? 'var(--accent-gold)' : 'var(--accent-violet-light)' }}
                        >
                          🔒
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
