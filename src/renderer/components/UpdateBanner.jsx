import React, { useEffect, useState } from 'react'
import { c } from '../utils/colors'

const STATES = {
  idle:        'idle',
  available:   'available',
  downloading: 'downloading',
  downloaded:  'downloaded',
  error:       'error',
}

export default function UpdateBanner() {
  const [state, setState]       = useState(STATES.idle)
  const [version, setVersion]   = useState('')
  const [percent, setPercent]   = useState(0)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!window.electronAPI?.updater) return

    window.electronAPI.updater.onAvailable((info) => {
      setVersion(info.version)
      setState(STATES.available)
      setDismissed(false)
    })

    window.electronAPI.updater.onProgress((p) => {
      setPercent(p.percent)
      setState(STATES.downloading)
    })

    window.electronAPI.updater.onDownloaded((info) => {
      setVersion(info.version)
      setState(STATES.downloaded)
    })

    window.electronAPI.updater.onError(() => {
      setState(STATES.error)
    })
  }, [])

  if (dismissed || state === STATES.idle) return null

  const isDownloading = state === STATES.downloading
  const isDownloaded  = state === STATES.downloaded
  const isError       = state === STATES.error

  return (
    <div
      className="flex items-center gap-3 px-5 py-2.5"
      style={{
        background:   isError ? c('x-update-error-bg') : c('chrome'),
        borderBottom: `1px solid ${isError ? c('danger', 0.25) : c('chrome-accent', 0.3)}`,
        minHeight:    42,
      }}
    >
      {/* Icon */}
      <div
        className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full"
        style={{ background: isError ? c('danger', 0.15) : c('chrome-accent', 0.15) }}
      >
        {isError ? (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={c('danger')} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            <circle cx="12" cy="12" r="10"/>
          </svg>
        ) : isDownloaded ? (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={c('chrome-text')} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={c('chrome-text')} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="8 17 12 21 16 17"/><line x1="12" y1="12" x2="12" y2="21"/>
            <path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/>
          </svg>
        )}
      </div>

      {/* Message */}
      <div className="flex-1 min-w-0">
        {isError && (
          <span className="text-[11px] font-semibold" style={{ color: c('danger') }}>
            Update check failed — check your connection and try again.
          </span>
        )}
        {state === STATES.available && (
          <span className="text-[11px] font-semibold" style={{ color: c('chrome-hover') }}>
            Version <strong style={{ color: c('chrome-text') }}>v{version}</strong> is available.
          </span>
        )}
        {isDownloading && (
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold" style={{ color: c('chrome-hover') }}>
              Downloading update… {percent}%
            </span>
            <div
              className="flex-1 max-w-[160px]"
              style={{ height: 4, background: c('chrome-accent', 0.15), borderRadius: 2 }}
            >
              <div
                style={{
                  height: '100%',
                  width:  `${percent}%`,
                  background: `linear-gradient(90deg,${c('chrome-accent')},${c('chrome-text')})`,
                  borderRadius: 2,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        )}
        {isDownloaded && (
          <span className="text-[11px] font-semibold" style={{ color: c('chrome-hover') }}>
            Version <strong style={{ color: c('chrome-text') }}>v{version}</strong> is ready to install.
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {state === STATES.available && (
          <button
            onClick={() => window.electronAPI.updater.download()}
            className="px-3 py-1 text-[10px] font-extrabold text-on-primary game-btn transition-all hover:scale-105"
            style={{
              background: c('primary'),
              border: `1.5px solid ${c('primary-shadow')}`,
              boxShadow: `2px 2px 0 ${c('primary-shadow')}`,
              borderRadius: 4,
            }}
          >
            Download
          </button>
        )}
        {isDownloaded && (
          <button
            onClick={() => window.electronAPI.updater.install()}
            className="px-3 py-1 text-[10px] font-extrabold text-on-primary game-btn transition-all hover:scale-105"
            style={{
              background: c('primary'),
              border: `1.5px solid ${c('primary-shadow')}`,
              boxShadow: `2px 2px 0 ${c('primary-shadow')}`,
              borderRadius: 4,
            }}
          >
            Restart &amp; Install
          </button>
        )}
        {!isDownloading && (
          <button
            onClick={() => setDismissed(true)}
            className="text-[10px] font-semibold transition-opacity hover:opacity-80"
            style={{ color: c('chrome-dim') }}
          >
            {isDownloaded ? 'Later' : 'Dismiss'}
          </button>
        )}
      </div>
    </div>
  )
}
