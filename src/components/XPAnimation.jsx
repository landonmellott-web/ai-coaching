import React from 'react'

export default function XPAnimation({ amount }) {
  return (
    <div className="xp-animation" role="status" aria-live="polite">
      ⚡ +{amount} XP
    </div>
  )
}
