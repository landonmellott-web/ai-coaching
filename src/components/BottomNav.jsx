import React from 'react'

const TABS = [
  { id: 'home', emoji: '🏠', label: 'Home' },
  { id: 'learn', emoji: '📚', label: 'Learn' },
  { id: 'daily', emoji: '📰', label: 'Daily' },
  { id: 'coach', emoji: '🎬', label: 'Coach' },
  { id: 'profile', emoji: '👤', label: 'Profile' },
]

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="bottom-nav">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`nav-tab${activeTab === tab.id ? ' nav-tab--active' : ''}`}
          onClick={() => onTabChange(tab.id)}
          aria-label={tab.label}
        >
          <div className="nav-tab__dot" />
          <span className="nav-tab__icon">{tab.emoji}</span>
          <span className="nav-tab__label">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
