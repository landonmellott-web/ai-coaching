import React, { useState, useCallback } from 'react'
import { useUser } from './hooks/useUser'
import BottomNav from './components/BottomNav'
import PaywallSheet from './components/PaywallSheet'
import LessonSheet from './components/LessonSheet'
import VideoViewSheet from './components/VideoViewSheet'
import XPAnimation from './components/XPAnimation'
import SuccessAnimation from './components/SuccessAnimation'
import HomeTab from './tabs/HomeTab'
import LearnTab from './tabs/LearnTab'
import DailyTab from './tabs/DailyTab'
import CoachTab from './tabs/CoachTab'
import ProfileTab from './tabs/ProfileTab'
import { getLevel } from './hooks/useUser'

export default function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [paywallTier, setPaywallTier] = useState('pro')
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [xpAnim, setXpAnim] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successTier, setSuccessTier] = useState('pro')
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [levelUpName, setLevelUpName] = useState('')

  const { user, addXP, completeLesson, watchVideo, upgradeTier, toggleBookmark } = useUser()

  const showXPAnimation = useCallback((amount) => {
    setXpAnim(amount)
    setTimeout(() => setXpAnim(null), 2100)
  }, [])

  const handleAddXP = useCallback((amount) => {
    const oldLevel = getLevel(user.xp)
    addXP(amount)
    const newLevel = getLevel(user.xp + amount)
    showXPAnimation(amount)
    if (newLevel.name !== oldLevel.name) {
      setTimeout(() => {
        setLevelUpName(newLevel.name)
        setShowLevelUp(true)
        setTimeout(() => setShowLevelUp(false), 3200)
      }, 2300)
    }
  }, [user.xp, addXP, showXPAnimation])

  const handleOpenPaywall = useCallback((tier = 'pro') => {
    setPaywallTier(tier)
    setPaywallOpen(true)
  }, [])

  const handleUpgrade = useCallback((tier) => {
    upgradeTier(tier)
    setPaywallOpen(false)
    setSuccessTier(tier)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3200)
  }, [upgradeTier])

  const handleCompleteLesson = useCallback((lessonId, perfect) => {
    completeLesson(lessonId)
    const xp = perfect ? 75 : 50
    handleAddXP(xp)
  }, [completeLesson, handleAddXP])

  const handleSelectVideo = useCallback((video) => {
    watchVideo(video.id)
    setSelectedVideo(video)
  }, [watchVideo])

  const tabs = ['home', 'learn', 'daily', 'coach', 'profile']

  return (
    <div className="app">
      {/* Animated mesh background */}
      <div className="bg-mesh">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      {/* Tab content */}
      <div className="app-content">
        {tabs.map(tab => (
          <div
            key={tab}
            className={`tab-panel${activeTab === tab ? ' tab-panel--active' : ''}`}
          >
            {tab === 'home' && (
              <HomeTab
                user={user}
                onOpenPaywall={handleOpenPaywall}
                onTabChange={setActiveTab}
              />
            )}
            {tab === 'learn' && (
              <LearnTab
                user={user}
                onOpenPaywall={handleOpenPaywall}
                onSelectLesson={setSelectedLesson}
              />
            )}
            {tab === 'daily' && (
              <DailyTab
                user={user}
                onOpenPaywall={handleOpenPaywall}
                toggleBookmark={toggleBookmark}
              />
            )}
            {tab === 'coach' && (
              <CoachTab
                user={user}
                onOpenPaywall={handleOpenPaywall}
                onSelectVideo={handleSelectVideo}
                onAddXP={handleAddXP}
              />
            )}
            {tab === 'profile' && (
              <ProfileTab
                user={user}
                onOpenPaywall={handleOpenPaywall}
              />
            )}
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Lesson Sheet */}
      {selectedLesson && (
        <LessonSheet
          lesson={selectedLesson}
          user={user}
          onClose={() => setSelectedLesson(null)}
          onComplete={handleCompleteLesson}
        />
      )}

      {/* Video View Sheet */}
      {selectedVideo && (
        <VideoViewSheet
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
          onAddXP={handleAddXP}
        />
      )}

      {/* Paywall Sheet */}
      {paywallOpen && (
        <PaywallSheet
          tier={paywallTier}
          onClose={() => setPaywallOpen(false)}
          onUpgrade={handleUpgrade}
        />
      )}

      {/* XP Animation */}
      {xpAnim !== null && <XPAnimation amount={xpAnim} />}

      {/* Upgrade Success */}
      {showSuccess && <SuccessAnimation tier={successTier} />}

      {/* Level Up Overlay */}
      {showLevelUp && (
        <div className="levelup-overlay">
          <div className="levelup-icon">🎉</div>
          <div className="levelup-title">Level Up!</div>
          <div className="levelup-name">{levelUpName}</div>
          <div className="levelup-sub">You're crushing it. Keep going! 🚀</div>
        </div>
      )}
    </div>
  )
}
