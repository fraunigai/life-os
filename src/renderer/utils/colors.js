import { createContext, useContext, useMemo } from 'react'

// Theme-aware color helpers. Tokens live in styles/tokens.css as RGB channels.

// CSS color for a token, e.g. c('primary') → 'rgb(var(--c-primary))', c('primary', 0.2) → 'rgb(var(--c-primary) / 0.2)'.
export function c(name, alpha) {
  return alpha == null ? `rgb(var(--c-${name}))` : `rgb(var(--c-${name}) / ${alpha})`
}

// Apply alpha to ANY CSS color string — a token from c(), a hex, or a data-driven color.
// Replaces the old `color + '18'` hex-suffix trick, which breaks on non-hex colors.
// `alpha` is 0–1, or a 2-digit hex string ('18', '40', …) for drop-in replacement of suffixes.
export function withAlpha(color, alpha) {
  const a = typeof alpha === 'string' ? parseInt(alpha, 16) / 255 : alpha
  const pct = Math.round(Math.max(0, Math.min(1, a)) * 1000) / 10
  return `color-mix(in srgb, ${color} ${pct}%, transparent)`
}

// Resolve a token to a '#rrggbb' hex string for consumers that can't read CSS variables
// (canvas-confetti, Recharts gradient math, etc.). Reads the live value from <html>.
export function tokenHex(name) {
  if (typeof document === 'undefined') return '#000000'
  const raw = getComputedStyle(document.documentElement).getPropertyValue(`--c-${name}`).trim()
  const parts = raw.split(/[\s,/]+/).filter(Boolean).slice(0, 3).map(Number)
  if (parts.length < 3 || parts.some(Number.isNaN)) return '#000000'
  return '#' + parts.map(v => v.toString(16).padStart(2, '0')).join('')
}

// Current palette id ('classic' | 'noel'), provided by App.
export const ThemeContext = createContext('classic')

export function useThemePalette() {
  return useContext(ThemeContext)
}

// Resolved hex values for a set of tokens; recomputed when the palette changes.
// const T = useTokenHex(['primary', 'amber']) → { primary: '#1d9e75', amber: '#ef9f27' }
export function useTokenHex(names) {
  const palette = useContext(ThemeContext)
  const key = names.join('|')
  return useMemo(() => Object.fromEntries(names.map(n => [n, tokenHex(n)])), [palette, key])
}
