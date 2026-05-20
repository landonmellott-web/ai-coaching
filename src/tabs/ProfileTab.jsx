import React from 'react'
import { achievements, levels } from '../data/achievements'
import { newsArticles } from '../data/news'
import { getLevel, getLevelProgress, getNextLevel } from '../hooks/useUser'

const SETTINGS = [
  { icon: '🔔', label: 'Notifications' },
  { icon: '🎨', label: 'Appearance' },
  { icon: '💳', label: 'Manage Subscription' },
  { icon: 'ℹ️', label: 'About GENZ·AI' },
]

export default function ProfileTab({ user, onOpenPaywall }) {
  const currentLevel = getLevel(user.xp)
  const nextLevel = getNextLevel(user.xp)
  const levelProgress = getLevelProgress(user.xp)

  const tierColor =
    user.tier === 'elite'
      ? 'var(--accent-gold)'
      : user.tier === 'pro'
      ? 'var(--accent-violet-light)'
      : 'rgba(240,240,255,0.35)'

  const bookmarkedArticles = newsArticles.filter(a => user.bookmarks.includes(a.id))

  const xpToNext = nextLevel ? nextLevel.min - user.xp : 0

  return (
    <div className="profile-tab">
      {/* Profile Hero */}
      <div className="profile-hero">
        <div className="profile-avatar">
          <div
            className="profile-avatar-ring"
            style={{
              position: 'absolute',
              inset: -5,
              borderRadius: '50%',
              padding: 3,
              background: `conic-gradient(${tierColor}, transparent)`,
            }}
          />
          {user.name[0]}
        </div>
        <div className="profile-name">{user.name}</div>
        <div className="profile-username">{user.username}</div>
        <div className="profile-since">Member since {user.memberSince}</div>

        <div className="tier-upgrade-row">
          <span
            className={`badge ${user.tier === 'elite' ? 'badge-elite' : user.tier === 'pro' ? 'badge-pro' : 'badge-explorer'}`}
          >
            {user.tier === 'elite' ? '👑 ELITE' : user.tier === 'pro' ? '⚡ PRO' : '🔭 Explorer'}
          </span>
          {user.tier === 'free' && (
            <button className="upgrade-cta-btn" onClick={() => onOpenPaywall('pro')}>
              Upgrade →
            </button>
          )}
        </div>
      </div>

      {/* Stat Pills */}
      <div className="profile-stats mb-24">
        <div className="profile-stat-pill">
          <div className="profile-stat-pill__icon">🔥</div>
          <div className="profile-stat-pill__info">
            <div className="profile-stat-pill__value">{user.streak}</div>
            <div className="profile-stat-pill__label">Day Streak</div>
          </div>
        </div>
        <div className="profile-stat-pill">
          <div className="profile-stat-pill__icon">⚡</div>
          <div className="profile-stat-pill__info">
            <div className="profile-stat-pill__value">{user.xp}</div>
            <div className="profile-stat-pill__label">Total XP</div>
          </div>
        </div>
        <div className="profile-stat-pill">
          <div className="profile-stat-pill__icon">📚</div>
          <div className="profile-stat-pill__info">
            <div className="profile-stat-pill__value">{user.lessonsCompleted.length}</div>
            <div className="profile-stat-pill__label">Lessons</div>
          </div>
        </div>
        <div className="profile-stat-pill">
          <div className="profile-stat-pill__icon">🎬</div>
          <div className="profile-stat-pill__info">
            <div className="profile-stat-pill__value">{user.videosWatched.length}</div>
            <div className="profile-stat-pill__label">Videos</div>
          </div>
        </div>
      </div>

      {/* Level Card */}
      <div className="level-card mb-24">
        <div className="level-card__header">
          <div className="level-card__name">
            <span>{currentLevel.emoji}</span>
            <span>{currentLevel.name}</span>
          </div>
          <div className="level-card__xp">{user.xp} XP</div>
        </div>
        <div className="progress-bar" style={{ height: 8 }}>
          <div
            className="progress-bar__fill progress-bar__fill--gold"
            style={{ width: `${levelProgress * 100}%` }}
          />
        </div>
        {nextLevel && (
          <div className="level-card__next">
            {xpToNext} XP to unlock {nextLevel.emoji} {nextLevel.name}
          </div>
        )}
        {!nextLevel && (
          <div className="level-card__next" style={{ color: 'var(--accent-gold)' }}>
            🏆 You've reached the highest level!
          </div>
        )}
      </div>

      {/* Achievements */}
      <div className="achievements-section">
        <div className="section-header">
          <span className="section-title">Achievements</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {achievements.filter(a => a.unlocked).length}/{achievements.length}
          </span>
        </div>

        <div className="achievements-grid">
          {achievements.map(a => (
            <div
              key={a.id}
              className={`achievement-badge${a.unlocked ? ' achievement-badge--unlocked' : ' achievement-badge--locked'}`}
            >
              <div
                className={`achievement-icon${a.unlocked ? '' : ' achievement-icon--locked'}`}
                style={
                  a.unlocked
                    ? { background: `${a.color}20`, border: `1.5px solid ${a.color}50` }
                    : {}
                }
              >
                {a.unlocked ? a.icon : '?'}
              </div>
              <div className="achievement-name">{a.name}</div>
              {!a.unlocked && a.lockLabel && (
                <div className="achievement-lock-label">{a.lockLabel}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bookmarks */}
      <div className="bookmarks-section">
        <div className="section-header">
          <span className="section-title">Bookmarks 🔖</span>
        </div>

        {bookmarkedArticles.length === 0 ? (
          <div className="bookmark-empty">
            No bookmarks yet. Tap 🏷️ on any news story to save it here.
          </div>
        ) : (
          bookmarkedArticles.map(article => (
            <div key={article.id} className="bookmark-item">
              <div className="bookmark-item__emoji">{article.emoji}</div>
              <div>
                <div className="bookmark-item__title">{article.headline}</div>
                <div className="bookmark-item__source">{article.source} · {article.timestamp}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Settings */}
      <div className="settings-section">
        <div className="section-header">
          <span className="section-title">Settings</span>
        </div>
        <div className="settings-list">
          {SETTINGS.map(item => (
            <div key={item.label} className="settings-item">
              <span className="settings-item__icon">{item.icon}</span>
              <span className="settings-item__label">{item.label}</span>
              <span className="settings-item__arrow">›</span>
            </div>
          ))}
        </div>

        <div className="settings-footer">Made with 🔥 by Marcus, Age 17</div>
      </div>
    </div>
  )
}
