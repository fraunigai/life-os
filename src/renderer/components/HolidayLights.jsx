// src/renderer/components/HolidayLights.jsx
// Neon Noel holiday lights: C9 string lights + laser fairy frame + pearl fairy strand.
// Pure decoration. ON = mounted, OFF = unmounted:   {lightsOn && <HolidayLights />}
// Styles: styles/holiday-lights.css (classes hl-*, @imported by globals.css). Only opacity/transform animate.
// Portals into <body> at z-30 (over page + sprite, under the AI FAB, modals, AI panel, toasts, palette),
// pointer-events:none throughout. Hangs from the top edge of <main data-hl-screen>.
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const SWAG_PX = 172                 // target C9 swag width -> swag count = clamp(round(cw / 172), 3, 12)
const TS = [1 / 6, 1 / 2, 5 / 6]    // 3 bulbs per swag, at these fractions of the swag
const SAG = 9                       // C9 wire sag (px)
const PEARL_SAG = 20                // pearl strand: hangs from every 2nd hook, draped deeper
const COLORS = ['r', 'y', 'i', 'm', 'g']   // red, citron, ice, magenta, green (never two similar hues adjacent)
const SPARK_RGB = { pearl: '255 250 241', ice: '0 255 252', gold: '232 255 39', magenta: '255 96 255', pink: '255 190 236' }
const TOP_Y0 = 2, TOP_SAG = 4.5, TOP_SWAGS = 5, SEAM_PERIODS = 6

const f2 = (v) => Math.round(v * 100) / 100
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
// stable per-index randomness: adding a swag on resize never reshuffles existing bulbs' colour/timing
function hash(i, k) {
  let t = (Math.imul(i + 1, 0x9E3779B1) ^ Math.imul(k + 7, 0x85EBCA77)) >>> 0
  t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

// ---- SVG masks (data URIs, used as CSS mask-image via custom properties) ----------------------
const enc = (s) => `url("data:image/svg+xml,${encodeURIComponent(s).replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29')}")`
function strandMask(d, vb, o) {
  const { pitch = 6.5, led = 2.4, halo = 7, haloOp = 0.4, blur = 2, wire = 0.45 } = o || {}
  const VE = "vector-effect='non-scaling-stroke' fill='none' stroke='#fff' stroke-linecap='round'"
  return enc(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='${vb}' preserveAspectRatio='none'>` +
    `<defs><filter id='g' x='-20%' y='-20%' width='140%' height='140%' filterUnits='userSpaceOnUse'><feGaussianBlur stdDeviation='${blur}'/></filter></defs>` +
    `<path d='${d}' ${VE} stroke-width='${halo}' stroke-opacity='${haloOp}' stroke-dasharray='0 ${pitch}' filter='url(#g)'/>` +
    `<path d='${d}' ${VE} stroke-width='.8' stroke-opacity='${wire}'/>` +
    `<path d='${d}' ${VE} stroke-width='${led}' stroke-dasharray='0 ${pitch}'/></svg>`)
}
// quadratic scallops across a W-wide viewBox; each swag spans `span` anchors; trough = y0 + sag
function swags(n, W, y0, sag, span = 1) {
  const w = (W / n) * span
  let d = `M0 ${y0}`
  for (let x = 0; x < W - 0.01; x += w) d += ` Q${f2(x + w / 2)} ${f2(y0 + 2 * sag)} ${f2(x + w)} ${y0}`
  return d
}
function meander(periods, H, x0, amp) {
  let d = `M${x0} 0`
  for (let y = 4; y <= H; y += 4) d += ` L${f2(x0 + amp * Math.sin((y / H) * periods * 2 * Math.PI))} ${y}`
  return d
}
// static: computed once per module load
const MASKS = {
  '--hl-mask-top': strandMask(swags(TOP_SWAGS, 1000, TOP_Y0, TOP_SAG), '0 0 1000 16'),
  '--hl-mask-corner': strandMask(swags(1, 200, TOP_Y0, TOP_SAG), '0 0 200 16'),
  '--hl-mask-seam': strandMask(meander(SEAM_PERIODS, 1000, 9, 3.2), '0 0 18 1000'),
}
// the pearl strand hangs from the SAME hooks as the C9 wire, so its mask depends on n
const pearlMask = (n) => strandMask(swags(n, 1000, 6, PEARL_SAG, 2), '0 0 1000 44',
  { pitch: 10, led: 3.4, halo: 9, haloOp: 0.55, blur: 2.2, wire: 0.3 })

export const swagCount = (width, side = 200) => clamp(Math.round((width - side) / SWAG_PX), 3, 12)

// everything below depends only on n (+ the nominal content width, used for the bulb tilt)
export function buildModel(n, cw) {
  const sw = cw / n
  let wire = 'M0 4'
  for (let s = 0; s < n; s++) wire += ` Q${f2(((s + 0.5) / n) * 1000)} ${4 + 2 * SAG} ${f2(((s + 1) / n) * 1000)} 4`
  const bulbs = []
  for (let s = 0; s < n; s++) for (let j = 0; j < 3; j++) {
    const i = s * 3 + j, t = TS[j]
    const slope = (4 * SAG * (1 - 2 * t)) / sw
    const dur = 4.2 + hash(i, 1) * 4.6
    bulbs.push({
      i, c: COLORS[i % 5], tw: hash(i, 3) < 0.33,
      x: f2(((s + t) / n) * 100), y: f2(4 + 4 * SAG * t * (1 - t)),
      r: f2((Math.atan(slope) * 180) / Math.PI * 0.7 + (hash(i, 0) - 0.5) * 6),
      t: f2(dur), d: f2(-hash(i, 2) * dur),
    })
  }
  const troughs = []
  for (let k = 1; k < n; k += 2) troughs.push(k)
  const pearlK = [...new Set([troughs[1] ?? troughs[0], troughs[troughs.length - 1]])]
  const onTop = (f) => `calc(var(--hl-side) + (100% - var(--hl-side)) * ${f2(f)})`
  const sparks = [
    { plug: true, x: 'var(--hl-side)', y: `${TOP_Y0}px`, sc: SPARK_RGB.pearl },
    { x: onTop(0.5), y: `${TOP_Y0 + TOP_SAG}px`, sc: SPARK_RGB.ice, sd: 11, d: -3.2 },
    { x: 'var(--hl-side)', y: '36%', sc: SPARK_RGB.gold, sd: 12, d: -1.1 },
    { x: 'var(--hl-side)', y: '74%', sc: SPARK_RGB.magenta, sd: 10.5, d: -6.4 },
    ...pearlK.map((k, q) => ({ x: onTop(k / n), y: `calc(var(--hl-hook) + ${PEARL_SAG}px)`, sc: q ? SPARK_RGB.pink : SPARK_RGB.pearl, sd: 13 + q * 1.7, d: -8.6 + q * 5.1 })),
  ]
  return { wire, bulbs, sparks }
}

// ---- hooks -------------------------------------------------------------------------------------
function useSwagCount(side) {        // re-renders only when the COUNT changes (~every 172px of width)
  const [n, setN] = useState(() => swagCount(window.innerWidth, side))
  useEffect(() => {
    let raf = 0
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setN(swagCount(window.innerWidth, side))) }
    on()
    window.addEventListener('resize', on)
    return () => { window.removeEventListener('resize', on); cancelAnimationFrame(raf) }
  }, [side])
  return n
}
// --hl-screen = top edge of the content "screen" (<main data-hl-screen>), written straight to the
// root's style (no re-render). Follows the UpdateBanner: main shrinks -> ResizeObserver fires.
function useScreenTop(rootRef, selector) {
  useLayoutEffect(() => {
    const root = rootRef.current, el = document.querySelector(selector)
    if (!root || !el) return
    const apply = () => root.style.setProperty('--hl-screen', `${Math.round(el.getBoundingClientRect().top)}px`)
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    return () => ro.disconnect()
  }, [rootRef, selector])
}
function usePageHidden() {
  const [hidden, setHidden] = useState(() => document.hidden)
  useEffect(() => {
    const on = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', on)
    return () => document.removeEventListener('visibilitychange', on)
  }, [])
  return hidden
}

// ---- component ---------------------------------------------------------------------------------
const FRAME = ['holo', 'glint', 'chase']
const PEARL = ['pearl', 'glint']
const Strand = ({ mod, fills }) => (
  <div className={`hl-strand hl-strand--${mod}`}>{fills.map((f) => <i key={f} className={`hl-${f}`} />)}</div>
)

export default function HolidayLights({ sidebarWidth = 200, screenSelector = '[data-hl-screen]', paused = false }) {
  const rootRef = useRef(null)
  const n = useSwagCount(sidebarWidth)
  const hidden = usePageHidden()
  useScreenTop(rootRef, screenSelector)

  // keyed by index + memoized on n: a resize drag never restarts running animations
  const m = useMemo(() => buildModel(n, window.innerWidth - sidebarWidth), [n, sidebarWidth])
  const style = useMemo(() => ({ ...MASKS, '--hl-mask-pearl': pearlMask(n), '--hl-side': `${sidebarWidth}px` }), [n, sidebarWidth])

  return createPortal(
    <div ref={rootRef} className={`hl-lights${paused || hidden ? ' hl-paused' : ''}`} aria-hidden="true" style={style}>
      <Strand mod="corner" fills={FRAME} />
      <Strand mod="top" fills={FRAME} />
      <Strand mod="seam" fills={FRAME} />
      <i className="hl-bloom hl-bloom--corner" />
      <i className="hl-bloom hl-bloom--top" />
      <i className="hl-bloom hl-bloom--seam" />
      <Strand mod="pearl" fills={PEARL} />
      <div className="hl-garland" style={{ '--n': n }}>
        <svg className="hl-wire" viewBox="0 0 1000 48" preserveAspectRatio="none">
          <path className="w" d={m.wire} />
          <path className="h" d={m.wire} />
        </svg>
        {m.bulbs.map((b) => (
          <i key={b.i} className={`hl-c9 ${b.c}${b.tw ? ' tw' : ''}`}
             style={{ '--x': `${b.x}%`, '--y': `${b.y}px`, '--r': `${b.r}deg`, '--t': `${b.t}s`, '--d': `${b.d}s` }} />
        ))}
      </div>
      <i className="hl-bow" />
      {m.sparks.map((s, k) => (
        <i key={k} className={`hl-spark${s.plug ? ' hl-spark--plug' : ''}`}
           style={{ '--x': s.x, '--y': s.y, '--sc': s.sc, ...(s.sd && { '--sd': `${s.sd}s` }), ...(s.d && { '--d': `${s.d}s` }) }} />
      ))}
    </div>,
    document.body,
  )
}
