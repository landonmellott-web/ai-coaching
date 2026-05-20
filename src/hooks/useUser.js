import { useState, useEffect } from 'react'
import { levels } from '../data/achievements'

const DEFAULT_USER = {
  name: 'Alex',
  username: '@alex_ai',
  tier: 'free',
  xp: 340,
  streak: 7,
  lessonsCompleted: ['1-1', '1-2', '1-3', '1-4', '2-1', '2-2'],
  videosWatched: ['v1-1', 'v1-2'],
  bookmarks: ['n1', 'n3'],
  memberSince: 'May 2025',
}

function readStorage() {
  try {
    const raw = localStorage.getItem('genzai_user')
    return raw ? { ...DEFAULT_USER, ...JSON.parse(raw) } : DEFAULT_USER
  } catch {
    return DEFAULT_USER
  }
}

export function getLevel(xp) {
  return levels.find(l => xp >= l.min && xp < l.max) || levels[levels.length - 1]
}

export function getNextLevel(xp) {
  const idx = levels.findIndex(l => xp >= l.min && xp < l.max)
  return idx < levels.length - 1 ? levels[idx + 1] : null
}

export function getLevelProgress(xp) {
  const current = getLevel(xp)
  if (current.max === Infinity) return 1
  const range = current.max - current.min
  const progress = xp - current.min
  return Math.min(progress / range, 1)
}

export function useUser() {
  const [user, setUser] = useState(readStorage)

  useEffect(() => {
    localStorage.setItem('genzai_user', JSON.stringify(user))
  }, [user])

  const addXP = (amount) => {
    let didLevelUp = false
    setUser(prev => {
      const oldLevel = getLevel(prev.xp)
      const newXP = prev.xp + amount
      const newLevel = getLevel(newXP)
      if (newLevel.name !== oldLevel.name) didLevelUp = true
      return { ...prev, xp: newXP }
    })
    return didLevelUp
  }

  const completeLesson = (lessonId) => {
    setUser(prev => ({
      ...prev,
      lessonsCompleted: prev.lessonsCompleted.includes(lessonId)
        ? prev.lessonsCompleted
        : [...prev.lessonsCompleted, lessonId],
    }))
  }

  const watchVideo = (videoId) => {
    setUser(prev => ({
      ...prev,
      videosWatched: prev.videosWatched.includes(videoId)
        ? prev.videosWatched
        : [...prev.videosWatched, videoId],
    }))
  }

  const upgradeTier = (tier) => {
    setUser(prev => ({ ...prev, tier }))
  }

  const toggleBookmark = (newsId) => {
    setUser(prev => ({
      ...prev,
      bookmarks: prev.bookmarks.includes(newsId)
        ? prev.bookmarks.filter(b => b !== newsId)
        : [...prev.bookmarks, newsId],
    }))
  }

  return { user, addXP, completeLesson, watchVideo, upgradeTier, toggleBookmark }
}
