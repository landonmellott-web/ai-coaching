import React from 'react'

const PARTICLES = ['🚀', '⭐', '✨', '🔥', '💜', '⚡', '🌟', '💫']

function randomBetween(a, b) {
  return a + Math.random() * (b - a)
}

export default function SuccessAnimation({ tier }) {
  const isPro = tier === 'pro'
  const particles = PARTICLES.map((emoji, i) => ({
    emoji,
    left: `${randomBetween(5, 95)}%`,
    top: `${randomBetween(50, 80)}%`,
    delay: `${i * 0.1}s`,
    duration: `${randomBetween(1.5, 2.5)}s`,
  }))

  return (
    <div className="success-overlay">
      <div className="success-particles">
        {particles.map((p, i) => (
          <span
            key={i}
            className="particle"
            style={{
              left: p.left,
              top: p.top,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          >
            {p.emoji}
          </span>
        ))}
      </div>
      <div className="success-emoji">{isPro ? '💜' : '👑'}</div>
      <h2 className="success-title" style={{ color: isPro ? '#A855F7' : '#F59E0B' }}>
        Welcome to {isPro ? 'PRO' : 'ELITE'}! 🎉
      </h2>
      <p className="success-subtitle">
        {isPro
          ? 'All PRO lessons, news, and videos are now unlocked. Let\'s build.'
          : 'Every lesson, video, and career tool is yours. The future is now.'}
      </p>
    </div>
  )
}
