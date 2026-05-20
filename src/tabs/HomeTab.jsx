import React, { useState, useEffect } from 'react'
import { aiFacts, currentLessonProgress } from '../data/lessons'
import { newsArticles } from '../data/news'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function HomeTab({ user, onOpenPaywall, onTabChange }) {
  const [factIndex, setFactIndex] = useState(() => {
    return Math.floor(Date.now() / 86400000) % aiFacts.length
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex(i => (i + 1) % aiFacts.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const tierLabel = user.tier === 'elite' ? 'Elite' : user.tier === 'pro' ? 'PRO' : 'Explorer'
  const tierClass = user.tier === 'elite' ? 'badge-elite' : user.tier === 'pro' ? 'badge-pro' : 'badge-explorer'

  const freeNews = newsArticles.slice(0, 3)

  return (
    <div className="home-tab">
      {/* Greeting */}
      <div className="home-greeting">
        <div className="greeting-text">{getGreeting()}, {user.name} 👋</div>
        <div className="greeting-sub">Day {user.streak} of your AI journey · {user.streak} day streak 🔥</div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-pill">
          <span>🏅</span>
          <span className={`badge ${tierClass}`}>{tierLabel}</span>
        </div>
        <div className="stat-pill">
          <span>📚</span>
          <span>{user.lessonsCompleted.length} Lessons</span>
        </div>
        <div className="stat-pill">
          <span>🔥</span>
          <span>{user.streak} Streak</span>
        </div>
      </div>

      {/* AI Moment Card */}
      <div className="ai-moment-card">
        <div className="ai-moment-label">✨ Today's AI Moment</div>
        <p className="ai-moment-fact">"{aiFacts[factIndex]}"</p>
        <div className="ai-moment-actions">
          <div className="fact-dots">
            {aiFacts.map((_, i) => (
              <div
                key={i}
                className={`fact-dot${i === factIndex ? ' fact-dot--active' : ''}`}
                onClick={() => setFactIndex(i)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
          <button
            className="btn btn-glass"
            style={{ padding: '8px 16px', fontSize: 13 }}
            onClick={() => {
              if (navigator.share) {
                navigator.share({ text: aiFacts[factIndex], title: 'AI Fact' })
              }
            }}
          >
            Share 🔗
          </button>
        </div>
      </div>

      {/* Continue Learning */}
      <div className="continue-card">
        <div className="continue-card__header">
          <div className="continue-card__icon">✍️</div>
          <div className="continue-card__info">
            <div className="continue-card__label">Continue Learning</div>
            <div className="continue-card__title">{currentLessonProgress.lessonTitle}</div>
          </div>
        </div>
        <div className="continue-card__progress-row">
          <div className="progress-bar">
            <div
              className="progress-bar__fill"
              style={{ width: `${currentLessonProgress.progress * 100}%` }}
            />
          </div>
          <span>{Math.round(currentLessonProgress.progress * 100)}%</span>
        </div>
        <button
          className="btn btn-violet btn-full"
          onClick={() => onTabChange('learn')}
        >
          Continue →
        </button>
      </div>

      {/* What's New in AI */}
      <div className="section-header">
        <span className="section-title">What's New in AI</span>
        <span className="section-action" onClick={() => onTabChange('daily')}>See all →</span>
      </div>

      <div className="news-scroll-wrap mb-24">
        <div className="news-scroll">
          {newsArticles.map((article, i) => {
            const isLocked = i >= 4 && user.tier === 'free'
            return (
              <div
                key={article.id}
                className="news-mini-card"
                onClick={() => isLocked ? onOpenPaywall('pro') : onTabChange('daily')}
              >
                <div className="news-mini-card__source">{article.source}</div>
                <div className="news-mini-card__headline">{article.headline}</div>
                {isLocked && (
                  <div className="news-mini-card__locked">
                    <div className="pro-lock-badge">
                      <span>🔒</span>
                      <span>PRO</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Featured Coaching Clip */}
      <div className="section-header">
        <span className="section-title">Featured Coaching Clip</span>
      </div>

      <div
        className="featured-video-card mb-24"
        onClick={() => onTabChange('coach')}
      >
        <div className="featured-video-thumb">
          <div className="featured-video-thumb__play">▶</div>
          <div className="featured-video-free-badge">60s Preview · FREE</div>
        </div>
        <div className="featured-video-info">
          <h4>Welcome to AI: Your Journey Starts Here</h4>
          <p>Coach Marcus · 8:24 · AI Starter Pack</p>
        </div>
      </div>

      {/* Streak Banner */}
      <div className="streak-banner">
        <div className="streak-banner__emoji">🔥</div>
        <div className="streak-banner__text">
          <h4>{user.streak}-Day Streak! Keep it up</h4>
          <p>You're in the top 12% of learners this week</p>
        </div>
      </div>
    </div>
  )
}
