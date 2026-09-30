import React from 'react'
import { c } from '../utils/colors'

const TODAY = new Date().toISOString().split('T')[0]

function getLast28Days() {
  const days = []
  for (let i = 27; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

const DAYS = getLast28Days()
// 4 rows × 7 cols — row 0 = oldest week, row 3 = current week (today is last cell)
const WEEKS = [DAYS.slice(0, 7), DAYS.slice(7, 14), DAYS.slice(14, 21), DAYS.slice(21, 28)]

function CalendarGrid({ recentDates }) {
  const loggedCount = DAYS.filter(d => recentDates.has(d)).length
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: c('hint-alt') }}>Last 28 days</span>
        <span className="text-[9px] font-bold" style={{ color: c('primary') }}>{loggedCount}/28</span>
      </div>
      <div className="flex flex-col gap-[3px]">
        {WEEKS.map((week, wi) => (
          <div key={wi} className="flex gap-[3px]">
            {week.map(date => {
              const logged  = recentDates.has(date)
              const isToday = date === TODAY
              return (
                <div
                  key={date}
                  title={date}
                  style={{
                    width: 9,
                    height: 9,
                    background:   logged ? c('primary') : c('x-streak-day-empty'),
                    borderRadius: 1,
                    outline:      isToday ? `1.5px solid ${c('ink')}` : 'none',
                    outlineOffset: isToday ? '1px' : '0',
                    opacity:      logged ? 1 : 0.55,
                  }}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function StreakCard({ habit, todayLogged, onLog, recentDates = new Set() }) {
  const fireSize = Math.min(32, 16 + habit.current_streak)

  return (
    <div
      className="bg-surface p-4 flex flex-col gap-3 retro-card"
      style={{ cursor: 'default' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-teal-dark truncate">{habit.name}</p>
          {habit.description && (
            <p className="text-[10px] text-text-muted mt-0.5 line-clamp-1">{habit.description}</p>
          )}
        </div>
        {/* Streak count */}
        <div className="flex items-center gap-1 flex-shrink-0 select-none">
          <span style={{ fontSize: fireSize, lineHeight: 1 }}>🔥</span>
          <span
            className="font-extrabold leading-none"
            style={{ fontSize: Math.min(24, 14 + habit.current_streak / 3), color: c('ink') }}
          >
            {habit.current_streak}
          </span>
        </div>
      </div>

      {/* Calendar grid */}
      <CalendarGrid recentDates={recentDates} />

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-teal-border">
        <span className="text-[10px] text-text-hint font-medium">
          Best: <span className="text-teal-dark font-bold">{habit.longest_streak}</span> days
        </span>
        <button
          onClick={() => onLog(habit.id)}
          disabled={todayLogged}
          className="px-3 py-1 text-[11px] font-bold transition-all game-btn"
          style={
            todayLogged
              ? { background: c('success', 0.1), color: c('x-streak-logged-ink'), border: `2px solid ${c('x-streak-logged-line')}`, boxShadow: `2px 2px 0 ${c('x-streak-logged-ink', 0.2)}`, borderRadius: 4, cursor: 'default' }
              : { background: c('primary'), color: c('on-primary'), border: `2px solid ${c('primary-shadow')}`, boxShadow: `2px 2px 0 ${c('primary-shadow')}`, borderRadius: 4 }
          }
        >
          {todayLogged ? '✓ Logged' : 'Log today'}
        </button>
      </div>
    </div>
  )
}
