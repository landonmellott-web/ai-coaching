import React, { useState } from 'react'
import { newsArticles, aiTip, weeklyRoundup, toolSpotlight, categories } from '../data/news'
import NewsCard from '../components/NewsCard'

export default function DailyTab({ user, onOpenPaywall, toggleBookmark }) {
  const [activeCategory, setActiveCategory] = useState('All')

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const filtered =
    activeCategory === 'All'
      ? newsArticles
      : newsArticles.filter(a => a.category === activeCategory)

  const handleBookmark = (id) => {
    if (toggleBookmark) toggleBookmark(id)
  }

  return (
    <div className="daily-tab">
      {/* Header */}
      <div className="daily-header">
        <div className="daily-header__left">
          <h1>AI World Today</h1>
          <div className="daily-header__date">{today}</div>
        </div>
        <div className="live-badge">
          <div className="live-dot" />
          Live
        </div>
      </div>

      {/* Category Filter */}
      <div className="category-scroll">
        <div className="category-pills">
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-pill${activeCategory === cat ? ' category-pill--active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* AI Tip */}
      <div className="ai-tip-card">
        <div className="ai-tip-card__label">{aiTip.title}</div>
        <p className="ai-tip-card__text">{aiTip.text}</p>
      </div>

      {/* News Cards */}
      {filtered.map((article, i) => {
        const isLocked = article.tier === 'pro' && user.tier === 'free'
        return (
          <div key={article.id} style={{ position: 'relative' }}>
            <NewsCard
              article={article}
              bookmarked={user.bookmarks.includes(article.id)}
              onBookmark={handleBookmark}
              onOpenPaywall={onOpenPaywall}
              userTier={user.tier}
            />
          </div>
        )
      })}

      {/* Weekly Roundup */}
      <div
        className="roundup-card"
        onClick={() => user.tier === 'free' && onOpenPaywall('pro')}
        style={{ cursor: user.tier === 'free' ? 'pointer' : 'default' }}
      >
        {user.tier === 'free' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              background: 'rgba(10,10,15,0.55)',
              borderRadius: 'var(--r-xl)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              zIndex: 1,
            }}
          >
            <span style={{ fontSize: 24 }}>🔒</span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--accent-gold)',
                letterSpacing: 0.5,
              }}
            >
              PRO — Weekly Roundup
            </span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 24 }}>📋</span>
          <span className="badge badge-pro">PRO</span>
        </div>
        <div className="roundup-card__title">{weeklyRoundup.title}</div>
        <div className="roundup-card__sub">{weeklyRoundup.subtitle}</div>
      </div>

      {/* Tool Spotlight */}
      <div
        className="spotlight-card"
        onClick={() => user.tier === 'free' && onOpenPaywall('pro')}
        style={{ cursor: user.tier === 'free' ? 'pointer' : 'default' }}
      >
        {user.tier === 'free' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              background: 'rgba(10,10,15,0.55)',
              borderRadius: 'var(--r-xl)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              zIndex: 1,
            }}
          >
            <span style={{ fontSize: 24 }}>🔒</span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--accent-gold)',
                letterSpacing: 0.5,
              }}
            >
              PRO — Tool Spotlight
            </span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 24 }}>{toolSpotlight.emoji}</span>
          <span className="badge badge-pro">PRO</span>
        </div>
        <div className="spotlight-card__title">
          AI Tool Spotlight: {toolSpotlight.tool}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          {toolSpotlight.tagline}
        </div>
      </div>
    </div>
  )
}
