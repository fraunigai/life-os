export const THEMES = [
  { id: 'dynamic',   label: 'Dynamic',    desc: 'Adapts to time of day',            xpRequired: 0    },
  { id: 'noel',      label: 'Neon Noel',  desc: 'Laser neon, pearl & fairy lights', xpRequired: 0    },
  { id: 'forest',    label: 'Forest',     desc: 'Deep greens & earth',              xpRequired: 500  },
  { id: 'ocean',     label: 'Ocean',      desc: 'Cool blues & teals',               xpRequired: 1000 },
  { id: 'synthwave', label: 'Synthwave',  desc: 'Dark purple & pink',               xpRequired: 2000 },
  { id: 'pixel',     label: 'Pixel',      desc: '8-bit grid pattern',               xpRequired: 5000 },
]

// Themes that swap the whole color palette (tokens.css), not just the backgrounds.
// Everything else uses the classic palette.
const PALETTE_THEMES = { noel: 'noel' }

export function paletteFor(themeId) {
  return PALETTE_THEMES[themeId] || 'classic'
}

// Point <html data-theme> at the theme's palette. Call BEFORE the React state update that
// re-renders with the new theme, so components reading token values see the new palette.
export function applyTheme(themeId) {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = paletteFor(themeId)
}

export const THEME_PREVIEW_BG = {
  dynamic:   'linear-gradient(135deg, #fef9f0 0%, #f4fdf8 30%, #fdf5ea 65%, #161d2e 100%)',
  noel:      'linear-gradient(120deg, #06050E 0%, #1A1627 35%, #FF71CE 62%, #4FE6FF 82%, #C3F23A 100%)',
  forest:    'linear-gradient(135deg, #081a0b 0%, #ecf5ec 100%)',
  ocean:     'linear-gradient(135deg, #051422 0%, #e8f4ff 100%)',
  synthwave: 'linear-gradient(135deg, #120820 0%, #3d1260 50%, #c026d322 100%)',
  pixel: [
    'repeating-linear-gradient(0deg,transparent,transparent 7px,rgba(29,158,117,0.18) 8px) 0 0 / 8px 8px',
    'repeating-linear-gradient(90deg,transparent,transparent 7px,rgba(29,158,117,0.18) 8px) 0 0 / 8px 8px',
    '#f4fdf8',
  ].join(', '),
}

function dot(color, size = 24) {
  return {
    bgImage: `radial-gradient(circle, ${color} 1px, transparent 1px)`,
    bgSize: `${size}px ${size}px`,
  }
}

function grid(color, size = 16) {
  return {
    bgImage: [
      `repeating-linear-gradient(0deg, transparent, transparent ${size - 1}px, ${color} ${size}px)`,
      `repeating-linear-gradient(90deg, transparent, transparent ${size - 1}px, ${color} ${size}px)`,
    ].join(', '),
    bgSize: `${size}px ${size}px`,
  }
}

function getTimeBg() {
  const h = new Date().getHours()
  if (h >= 5  && h < 11) return { shell: '#19120a', content: '#fef9f0', ...dot('rgba(200,140,30,0.06)') }
  if (h >= 11 && h < 17) return { shell: '#0d1f14', content: '#f4fdf8', ...dot('rgba(29,158,117,0.07)') }
  if (h >= 17 && h < 21) return { shell: '#1c0e04', content: '#fdf5ea', ...dot('rgba(170,95,20,0.07)')  }
  return                         { shell: '#070c18', content: '#161d2e', ...dot('rgba(80,100,220,0.09)') }
}

const STATIC_BG = {
  // snow dots + oil-slick wash — defined once in styles/noel.css (the lights' scroll band reuses it)
  noel: { shell: 'rgb(var(--c-shell))', content: 'rgb(var(--c-screen))', bgImage: 'var(--nl-screen-bg)', bgSize: 'var(--nl-screen-bg-size)' },
  forest:    { shell: '#081a0b', content: '#ecf5ec', ...dot('rgba(30,120,50,0.07)')    },
  ocean:     { shell: '#051422', content: '#e8f4ff', ...dot('rgba(20,100,200,0.08)')   },
  synthwave: { shell: '#120820', content: '#1a1030', ...dot('rgba(160,80,255,0.09)')   },
  pixel:     { shell: '#0d1f14', content: '#f4fdf8', ...grid('rgba(29,158,117,0.10)') },
}

export function computeBg(themeId) {
  if (themeId === 'dynamic' || !STATIC_BG[themeId]) return getTimeBg()
  return STATIC_BG[themeId]
}
