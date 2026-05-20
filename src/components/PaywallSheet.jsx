import React from 'react'

const BENEFITS = {
  pro: [
    '📚 All 26 premium lessons across 6 tracks',
    '📰 Full AI news feed — 8 stories daily',
    '🎬 Exclusive coaching video series',
  ],
  elite: [
    '🚀 Everything in PRO, plus career tracks',
    '🔨 Build with AI — hands-on project lessons',
    '👑 Direct mentorship content from Coach Marcus',
  ],
}

export default function PaywallSheet({ tier, onClose, onUpgrade }) {
  const benefits = BENEFITS[tier] || BENEFITS.pro

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="paywall-shimmer" />

        <div className="paywall-header">
          <div className={`paywall-tier-label paywall-tier-label--${tier}`}>
            {tier === 'elite' ? '👑 ELITE' : '⚡ PRO'}
          </div>
          <div className="paywall-subtitle">
            {tier === 'elite'
              ? 'Everything you need to build an AI career'
              : 'Unlock the full learning experience'}
          </div>
        </div>

        <ul className="paywall-benefits">
          {benefits.map((b, i) => (
            <li key={i} className="paywall-benefit">
              <div className="paywall-benefit__check">✓</div>
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div className="paywall-plans">
          <button className="plan-btn plan-btn--pro" onClick={() => onUpgrade('pro')}>
            <span className="plan-btn__popular">Most Popular</span>
            <span className="plan-btn__tier">⚡ PRO</span>
            <span className="plan-btn__price">$9.99 / month</span>
            <span className="plan-btn__yearly">or $79.99 / year — save 33%</span>
          </button>

          <button className="plan-btn plan-btn--elite" onClick={() => onUpgrade('elite')}>
            <span className="plan-btn__popular">Best Value</span>
            <span className="plan-btn__tier">👑 ELITE</span>
            <span className="plan-btn__price">$24.99 / month</span>
            <span className="plan-btn__yearly">or $199.99 / year — save 33%</span>
          </button>
        </div>

        <p className="paywall-social-proof">🔥 Join 2,400+ teen learners already ahead</p>
        <p className="paywall-cancel">Cancel anytime · No contracts · Instant access</p>

        <span className="paywall-later" onClick={onClose}>
          Maybe later
        </span>
      </div>
    </div>
  )
}
