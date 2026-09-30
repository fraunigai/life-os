/** @type {import('tailwindcss').Config} */

// Colors resolve to the theme tokens in src/renderer/styles/tokens.css, so every
// utility (bg-primary, text-teal-dark, border-teal-border/50, …) follows the active theme.
const token = name => `rgb(var(--c-${name}) / <alpha-value>)`

export default {
  content: ['./src/renderer/**/*.{js,jsx,ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: token('primary'),
          deep:    token('primary-deep'),
          hover:   token('primary-hover'),
          shadow:  token('primary-shadow'),
        },
        'on-primary':  token('on-primary'),
        'teal-dark':   token('ink'),
        'teal-med':    token('primary-deep'),
        'teal-light':  token('tint'),
        'teal-border': token('line'),
        'teal-pale':   token('surface-2'),
        amber: {
          DEFAULT: token('amber'),
          shadow:  token('amber-shadow'),
          ink:     token('amber-ink'),
          tint:    token('amber-tint'),
          line:    token('amber-line'),
        },
        'on-amber':    token('on-amber'),
        purple: {
          DEFAULT: token('purple'),
          shadow:  token('purple-shadow'),
          tint:    token('purple-tint'),
          line:    token('purple-line'),
        },
        'on-purple':   token('on-purple'),
        danger: {
          DEFAULT: token('danger'),
          deep:    token('danger-deep'),
          tint:    token('danger-tint'),
          line:    token('danger-line'),
        },
        'on-danger':   token('on-danger'),
        success:       token('success'),
        'on-success':  token('on-success'),
        'green-done':  token('done'),
        done:          token('done'),
        'on-done':     token('on-done'),
        'text-pri':    token('ink'),
        'text-sec':    token('text'),
        'text-muted':  token('muted'),
        'text-hint':   token('hint'),
        ink:           token('ink'),
        surface: {
          DEFAULT: token('surface'),
          2:       token('surface-2'),
        },
        screen:        token('screen'),
        tint:          token('tint'),
        line: {
          DEFAULT: token('line'),
          strong:  token('line-strong'),
        },
        chrome: {
          DEFAULT: token('chrome'),
          shell:   token('shell'),
          accent:  token('chrome-accent'),
          text:    token('chrome-text'),
          soft:    token('chrome-soft'),
          hover:   token('chrome-hover'),
          mid:     token('chrome-mid'),
          dim:     token('chrome-dim'),
          label:   token('chrome-label'),
        },
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        pill: '100px',
        sm:   '10px',
      },
    },
  },
  plugins: [],
}
