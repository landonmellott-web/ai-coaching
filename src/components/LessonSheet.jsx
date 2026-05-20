import React, { useState } from 'react'
import { tracks } from '../data/lessons'

function getTrackName(trackId) {
  const track = tracks.find(t => t.id === trackId)
  return track ? track.name : 'Learning Track'
}

export default function LessonSheet({ lesson, user, onClose, onComplete }) {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [completed, setCompleted] = useState(false)

  const isCompleted = user.lessonsCompleted.includes(lesson.id)
  const quiz = lesson.quiz

  const isCorrect = quiz && selectedOption === quiz.correct
  const canComplete = !quiz || submitted

  const handleSubmitQuiz = () => {
    if (selectedOption === null) return
    setSubmitted(true)
  }

  const handleComplete = () => {
    if (completed) return
    setCompleted(true)
    const perfect = isCorrect
    onComplete(lesson.id, perfect)
    setTimeout(onClose, 800)
  }

  const xpReward = quiz && isCorrect ? 75 : 50

  return (
    <div className="lesson-sheet-wrap" onClick={onClose}>
      <div className="lesson-sheet" onClick={e => e.stopPropagation()}>
        <div className="lesson-sheet__header">
          <span className="lesson-sheet__track">Track {lesson.track} · {getTrackName(lesson.track)}</span>
          <button className="lesson-sheet__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="lesson-sheet__progress-wrap">
          <div className="progress-bar">
            <div
              className="progress-bar__fill"
              style={{ width: submitted ? '100%' : canComplete ? '85%' : `${Math.max(20, scrollProgress)}%` }}
            />
          </div>
          <div className="lesson-progress-labels">
            <span>Lesson {lesson.number}</span>
            <span>{lesson.duration}</span>
          </div>
        </div>

        <h2 className="lesson-sheet__title">
          {lesson.icon} {lesson.title}
        </h2>

        <div className="lesson-content">
          {lesson.content.map((block, i) => {
            if (block.type === 'text') {
              return (
                <p key={i} className="lesson-text-block">{block.text}</p>
              )
            }
            if (block.type === 'keypoint') {
              return (
                <div key={i} className="lesson-keypoint">
                  <div className="lesson-keypoint__label">💡 Key Point</div>
                  <div className="lesson-keypoint__text">{block.text}</div>
                </div>
              )
            }
            return null
          })}

          {quiz && (
            <div className="lesson-quiz">
              <div className="lesson-quiz__label">🧠 Quick Check</div>
              <div className="lesson-quiz__question">{quiz.question}</div>
              <div className="quiz-options">
                {quiz.options.map((opt, i) => {
                  let cls = 'quiz-option'
                  if (submitted) {
                    if (i === quiz.correct) cls += ' quiz-option--correct'
                    else if (i === selectedOption && selectedOption !== quiz.correct)
                      cls += ' quiz-option--wrong'
                  } else if (selectedOption === i) {
                    cls += ' quiz-option--selected'
                  }
                  return (
                    <button
                      key={i}
                      className={cls}
                      onClick={() => !submitted && setSelectedOption(i)}
                      disabled={submitted}
                    >
                      {String.fromCharCode(65 + i)}. {opt}
                    </button>
                  )
                })}
              </div>
              {submitted && (
                <div className="quiz-explanation">
                  {isCorrect ? '✅ ' : '💡 '}{quiz.explanation}
                </div>
              )}
              {!submitted && selectedOption !== null && (
                <button
                  className="btn btn-violet btn-full"
                  style={{ marginTop: 14 }}
                  onClick={handleSubmitQuiz}
                >
                  Submit Answer
                </button>
              )}
            </div>
          )}
        </div>

        {canComplete && !isCompleted && (
          <>
            <div className="xp-reward-display">
              Complete to earn <strong>+{xpReward} XP</strong>
              {isCorrect && ' (perfect quiz bonus!)'}
            </div>
            <button
              className="lesson-complete-btn"
              onClick={handleComplete}
              disabled={completed}
            >
              {completed ? '🎉 Completed!' : `Mark Complete · +${xpReward} XP`}
            </button>
          </>
        )}

        {isCompleted && (
          <div
            style={{
              margin: '24px 20px 0',
              padding: '16px',
              borderRadius: 'var(--r-lg)',
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.3)',
              textAlign: 'center',
              color: 'var(--accent-green)',
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            ✅ Lesson already completed!
          </div>
        )}
      </div>
    </div>
  )
}
