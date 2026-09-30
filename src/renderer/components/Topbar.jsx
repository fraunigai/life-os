import React from 'react'
import { c } from '../utils/colors'

const LEVEL_THRESHOLDS = [0, 200, 500, 1000, 2000]
function xpForLevel(level) {
  return LEVEL_THRESHOLDS[level - 1] ?? 0
}
function xpForNextLevel(level) {
  return LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

// Inline refresh SVG — circular arrow
function RefreshIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 4v6h-6"/>
      <path d="M1 20v-6h6"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  )
}

// Mini C9 bulb for the holiday-lights toggle: lit glass + halo when on, outline when off.
// The lit glass/socket colours are the garland's decorative bulb colours (--hl-icon-* in holiday-lights.css);
// the off state follows the theme.
function LightsIcon({ on }) {
  return (
    <svg className="hl-icon" width="14" height="18" viewBox="0 0 14 18" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="hlTg" cx="40%" cy="42%" r="62%">
          <stop offset="0" style={{ stopColor: 'var(--hl-icon-hi)' }} />
          <stop offset=".45" style={{ stopColor: 'var(--hl-icon-glass)' }} />
          <stop offset="1" style={{ stopColor: 'var(--hl-icon-deep)' }} />
        </radialGradient>
        <radialGradient id="hlTh">
          <stop offset="0" style={{ stopColor: 'var(--hl-icon-glass)', stopOpacity: 0.55 }} />
          <stop offset="1" style={{ stopColor: 'var(--hl-icon-glass)', stopOpacity: 0 }} />
        </radialGradient>
      </defs>
      {on && <circle cx="7" cy="11.5" r="9" fill="url(#hlTh)" />}
      <rect x="4.6" y=".5" width="4.8" height="4.6" rx="1" fill={on ? 'var(--hl-icon-socket)' : c('chrome-mid')} />
      <path d="M4.9 5.1h4.2c0 1.6 3.4 2.8 3.4 6 0 2.9-2.6 4.8-5.5 6.4-2.9-1.6-5.5-3.5-5.5-6.4 0-3.2 3.4-4.4 3.4-6z"
            fill={on ? 'url(#hlTg)' : 'none'} stroke={on ? 'none' : c('chrome-mid')} strokeWidth="1.2" />
      {on && <ellipse cx="5.4" cy="10" rx=".9" ry="1.3" fill="rgba(255,255,255,0.9)" />}
    </svg>
  )
}

export default function Topbar({ userName, userInitials, xp, level, musicOn, onToggleMusic, lightsOn, onToggleLights, brief, briefLoading, onRefreshBrief, onOpenCommand }) {
  const current = xp - xpForLevel(level)
  const needed  = xpForNextLevel(level) - xpForLevel(level)
  const pct     = level >= 5 ? 100 : Math.min(100, Math.round((current / needed) * 100))

  return (
    <header
      className="nl-topbar h-[70px] min-h-[70px] flex items-center justify-between px-8"
      style={{ background: c('chrome'), borderBottom: `1px solid ${c('chrome-accent', 0.22)}` }}
    >
      {/* Left: daily brief + date */}
      <div className="flex flex-col justify-center gap-0.5 max-w-[520px] min-w-0">
        {briefLoading ? (
          <span className="text-[11px] font-medium animate-pulse" style={{ color: c('chrome-dim') }}>
            Generating daily brief…
          </span>
        ) : (
          <p
            className="text-[11px] font-semibold line-clamp-3 leading-snug"
            style={{ color: c('chrome-text') }}
          >
            {brief || <span style={{ color: c('chrome-dim') }}>Loading…</span>}
          </p>
        )}
        <span className="text-[10px] font-medium" style={{ color: c('chrome-dim') }}>{formatDate()}</span>
      </div>

      {/* Right: command + lights + music + XP bar + level badge + avatar */}
      <div className="flex items-center gap-4">

        {/* Command palette trigger (⌘K) */}
        <button
          onClick={onOpenCommand}
          title="Command palette (Ctrl+K)"
          className="flex items-center gap-2 h-7 pl-2.5 pr-2 transition-all hover:scale-[1.03]"
          style={{
            background: c('chrome-accent', 0.08),
            border: `1px solid ${c('chrome-accent', 0.22)}`,
            borderRadius: 5,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c('chrome-text')} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="text-[10px] font-bold" style={{ color: c('chrome-dim') }}>Search</span>
          <kbd className="text-[8px] font-extrabold px-1 py-0.5 rounded" style={{ background: c('chrome-accent', 0.15), color: c('chrome-text'), border: `1px solid ${c('chrome-accent', 0.25)}` }}>
            ⌘K
          </kbd>
        </button>

        {/* Brief refresh */}
        <button
          onClick={onRefreshBrief}
          disabled={briefLoading}
          title="Refresh daily brief"
          className="w-7 h-7 flex items-center justify-center transition-all hover:scale-110 disabled:opacity-30"
          style={{
            background: c('chrome-accent', 0.08),
            border: `1px solid ${c('chrome-accent', 0.2)}`,
            borderRadius: 4,
            color: c('chrome-text'),
          }}
        >
          <RefreshIcon />
        </button>

        {/* Holiday lights toggle */}
        <button
          type="button"
          onClick={onToggleLights}
          aria-pressed={!!lightsOn}
          aria-label="Holiday lights"
          title={lightsOn ? 'Turn holiday lights off' : 'Turn holiday lights on'}
          className="w-8 h-8 flex items-center justify-center transition-all hover:scale-110"
          style={{
            background: c('chrome-accent', lightsOn ? 0.14 : 0.06),
            border: `1px solid ${c('chrome-accent', 0.3)}`,
            borderRadius: 4,
          }}
        >
          <LightsIcon on={lightsOn} />
        </button>

        {/* Music toggle */}
        <button
          onClick={onToggleMusic}
          title={musicOn ? 'Stop music' : 'Play BGM 🎵'}
          className="w-8 h-8 flex items-center justify-center text-[16px] transition-all hover:scale-110"
          style={{
            background: musicOn ? c('primary') : c('chrome-accent', 0.12),
            border: `1px solid ${c('chrome-accent', 0.25)}`,
            borderRadius: 4,
            boxShadow: musicOn ? `2px 2px 0 ${c('primary-shadow')}` : 'none',
          }}
        >
          {musicOn ? '🎵' : '🎮'}
        </button>

        {/* XP bar */}
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-extrabold font-mono whitespace-nowrap" style={{ color: c('chrome-text') }}>
            {level >= 5
              ? `Level ${level} · ${xp} XP · MAX`
              : `Level ${level} · ${xp} / ${xpForNextLevel(level)} XP`}
          </span>
          {/* HP-style segmented bar */}
          <div
            className="nl-xp-track relative w-[140px] overflow-hidden"
            style={{
              height: 8,
              background: 'rgba(0,0,0,0.35)',
              borderRadius: 2,
              border: `1px solid ${c('chrome-accent', 0.2)}`,
            }}
          >
            <div
              className="nl-xp-fill absolute inset-y-0 left-0 progress-fill"
              style={{
                width: `${pct}%`,
                borderRadius: 2,
                background: pct > 70
                  ? `linear-gradient(90deg,${c('primary')},${c('x-xp-high-end')})`
                  : pct > 35
                    ? `linear-gradient(90deg,${c('amber')},${c('x-xp-mid-end')})`
                    : `linear-gradient(90deg,${c('x-xp-low-start')},${c('x-xp-low-end')})`,
              }}
            />
            {[25, 50, 75].map(t => (
              <div
                key={t}
                className="absolute top-0 bottom-0 w-px"
                style={{ left: `${t}%`, background: 'rgba(255,255,255,0.2)' }}
              />
            ))}
          </div>
        </div>

        {/* Level badge — gold coin */}
        <div
          className="nl-coin w-8 h-8 rounded-full flex items-center justify-center coin-wobble flex-shrink-0"
          style={{
            background: `linear-gradient(135deg,${c('amber')},${c('x-xp-coin-hi')})`,
            boxShadow: `0 2px 0 ${c('x-xp-coin-shadow')}, 0 0 10px ${c('amber', 0.4)}`,
          }}
        >
          <span className="text-[12px] font-extrabold text-on-amber" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
            {level}
          </span>
        </div>

        {/* Avatar */}
        <div
          className="nl-avatar w-8 h-8 flex items-center justify-center flex-shrink-0"
          style={{
            background: c('chrome-accent', 0.15),
            border: `2px solid ${c('chrome-accent', 0.3)}`,
            borderRadius: 4,
          }}
        >
          <span className="text-[11px] font-extrabold" style={{ color: c('chrome-text') }}>{userInitials}</span>
        </div>
      </div>
    </header>
  )
}
