import React from 'react'

export default function NewsCard({ article, bookmarked, onBookmark, onOpenPaywall, userTier }) {
  const isLocked = article.tier === 'pro' && userTier === 'free'

  return (
    <div className="news-card" style={{ position: 'relative' }}>
      <div className="news-card__top">
        <div className="news-card__source">
          <div className="news-card__source-dot">{article.emoji}</div>
          {article.source}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="news-card__time">{article.timestamp}</span>
          <button
            className={`news-card__bookmark${bookmarked ? ' news-card__bookmark--active' : ''}`}
            onClick={e => { e.stopPropagation(); onBookmark(article.id) }}
            aria-label="Bookmark"
          >
            {bookmarked ? '🔖' : '🏷️'}
          </button>
        </div>
      </div>

      <div className="news-card__headline">{article.headline}</div>
      <div className="news-card__summary">{article.summary}</div>

      <div className="news-card__footer">
        <span className={`news-card__cat cat-${article.category}`}>{article.category}</span>
        <span className="news-card__read">{article.readTime} read</span>
      </div>

      {isLocked && (
        <div className="news-locked-overlay" onClick={() => onOpenPaywall('pro')}>
          <span>🔒</span>
          <span className="news-locked-overlay__label">Read Full Story — PRO</span>
        </div>
      )}
    </div>
  )
}
