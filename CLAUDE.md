# Life OS — Gamified Electron Desktop App

A personal productivity operating system built as an Electron desktop app. Gamifies life management: Epics (big goals), daily Streaks (habits), Time Audit, Network CRM, Weekly Review, and Energy Log — all tied to an XP / leveling system with retro game aesthetics.

---

## Tech Stack

| Layer | Library / Version |
|---|---|
| Runtime | Electron 31 |
| UI framework | React 18 |
| Build tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| Database | better-sqlite3 |
| Charts | Recharts |
| Confetti | canvas-confetti |
| Icons | Tabler Icons (SVG via JSX) |
| Router | React Router v6 (MemoryRouter — required for Electron file:// protocol) |

---

## Design System

### Colors — theme tokens

**Rule: no hardcoded colors in renderer code.** Every color is a theme token, so a palette theme (Neon Noel) can restyle the whole app while **classic stays pixel-identical**.

- **`styles/tokens.css`** defines each token as space-separated RGB channels (`--c-primary: 29 158 117;`). `:root` = classic palette; `html[data-theme="noel"]` = Neon Noel overrides. `applyTheme(themeId)` in `utils/themes.js` sets `<html data-theme>` (`paletteFor()` → `'classic'` | `'noel'`); call it *before* the React state update.
- **Tailwind** (`tailwind.config.js`) maps every color name to `rgb(var(--c-<token>) / <alpha-value>)`, so utilities (incl. `/NN` opacity) follow the theme. Legacy names still work: `teal-dark`/`text-pri` → `ink`, `teal-med` → `primary-deep`, `teal-light` → `tint`, `teal-border` → `line`, `teal-pale` → `surface-2`, `green-done` → `done`, `text-sec`/`text-muted`/`text-hint` → `text`/`muted`/`hint`.
- **`utils/colors.js`** helpers for inline styles, SVG and charts:

```js
import { c, withAlpha, tokenHex, useTokenHex } from '../utils/colors'
c('ink')                 // 'rgb(var(--c-ink))'           → inline styles, SVG fill/stroke, Recharts props
c('primary', 0.08)       // 'rgb(var(--c-primary) / 0.08)'
withAlpha(color, '18')   // alpha for ANY CSS color (replaces `color + '18'` hex-suffix math); also withAlpha(color, 0.2)
tokenHex('primary')      // live '#rrggbb' — ONLY for canvas (canvas-confetti) / libs that must parse hex
useTokenHex(['primary']) // hook version, re-resolves on theme change (via ThemeContext from App)
```

| Token (`--c-*`) | Classic | Neon Noel | Tailwind | Role |
|---|---|---|---|---|
| `chrome` / `shell` | `#061710` / `#0d1f14` | `#0B0915` / `#06050E` | `chrome`, `chrome-shell` | Sidebar + Topbar bezel / outermost shell |
| `chrome-accent` `-text` `-soft` `-hover` `-mid` `-dim` `-label` | `#1D9E75` `#4dffb0` `#7dc4a4` `#a8e8c8` `#3d7058` `#2a5c40` `#EF9F27` | `#A66BFF` `#7DF9FF` `#C9B8F0` `#FFA8E8` `#8D82AE` `#756C98` `#E8FF27` | `chrome-*` | Anything painted on the dark chrome |
| `screen` | `#f4fdf8` | `#110E1B` | `screen` | Content "screen" |
| `surface` / `surface-2` | `#ffffff` / `#f7fdfb` | `#1A1627` / `#15121F` | `surface`, `surface-2` | Cards, panels, modals / pale inputs |
| `tint` / `line` / `line-strong` | `#E1F5EE` / `#d4f0e6` / `#b3e8d3` | `#2B1F42` / `#383152` / `#71679C` | `tint`, `line`, `line-strong` | Teal tints / borders |
| `ink` / `text` / `muted` / `hint` | `#085041` / `#444441` / `#888780` / `#B4B2A9` | `#F7F1FF` / `#DCD4EE` / `#A39ABF` / `#857CAB` | `ink`, `text-sec`, `text-muted`, `text-hint` | Text |
| `muted-alt` / `hint-alt` | `#4a7060` / `#9bbdaa` | `#8CB9D4` / `#6A8BA6` | via `c()` | Teal-grey secondary / hint text |
| `primary` `-deep` `-hover` `-shadow` | `#1D9E75` `#0F6E56` `#2a8a67` `#085041` | `#FF71CE` `#FFA3E0` `#FF8AD6` `#9C35E1` | `primary`, `primary-*` | CTAs, active states, hard shadows |
| `amber` `-shadow` `-ink` `-tint` `-line` | `#EF9F27` `#a65c00` `#7a4800` `#fff8ec` `#f5d28a` | `#FFA53D` `#B0620A` `#FFE08F` `#2A2010` `#6E5420` | `amber`, `amber-*` | XP coins, warnings |
| `purple` `-shadow` `-tint` `-line` | `#7F77DD` `#3d3a9e` `#f5f4ff` `#cac8f5` | `#4FE6FF` `#1A66B8` `#10263A` `#1F5C7A` | `purple`, `purple-*` | Third accent (ice in noel) |
| `danger` `-deep` `-tint` `-line` | `#ef4444` `#b91c1c` `#fef2f2` `#fecaca` | `#FF3D4A` `#FF7A85` `#2E1018` `#7A2034` | `danger`, `danger-*` | Errors, delete, overdue |
| `success` / `done` | `#22c55e` / `#639922` | `#36F59A` / `#C3F23A` | `success`, `done` | Completed states |
| `on-primary` `on-amber` `on-purple` `on-danger` `on-success` `on-done` | white | near-black | `on-*` | Text/icons on a solid fill of that color |

- **Extension tokens** `x-<area>-<name>` (e.g. `x-journal-mood-1`, `x-xp-high-end`) cover feature-specific colors with no base token; they're defined for both palettes in `tokens.css` and used as `c('x-…')` or `bg-[rgb(var(--c-x-…))]`.
- **Map by role, not hex.** Text on a colored fill → the matching `on-*` (never literal white). A dark background that classic painted `#085041` → `primary-shadow` or `chrome` (in noel `ink` is near-white). Anything on the dark chrome → `chrome-*`.
- **Allowed literals only:** `rgba(0,0,0,a)` drop shadows/scrims, `rgba(255,255,255,a)` sheen/ripples on colored fills, `transparent`/`currentColor`/`inherit`/`none`; pixel-art sprite palettes (`ReindeerSprite.jsx`); holiday-light bulb colors (`HolidayLights.jsx`, `holiday-lights.css`); background presets in `utils/themes.js`; finishes in `noel.css`.
- `widget.jsx` (separate window) imports `tokens.css` itself and calls `applyTheme()` from the `app_theme` setting.

### Neon Noel theme (`app_theme = 'noel'`)
- Dark oil-slick / pearlescent vaporwave with laser neon and Christmas accents: chrome `#0B0915`, screen `#110E1B`, surfaces `#1A1627`, ink `#F7F1FF`; laser pink primary `#FF71CE`, tang amber `#FFA53D`, ice `#4FE6FF` (purple slot), Rudolph red danger `#FF3D4A`, green `#36F59A`, citron-lime done `#C3F23A`, lilac chrome accent `#A66BFF`.
- On dark, `-deep`/`-hover` variants are **more** luminous than the base, and every `on-*` is near-black.
- **`styles/noel.css`** adds what a flat token can't (holo borders, pearl sheen, glows), all scoped to `html[data-theme="noel"]`. Gradient vars: `--g-holo`, `--g-holo-conic`, `--g-holo-pink`, `--g-holo-ice`, `--g-tinsel`, `--g-pearl`, `--g-sheen`, `--glow-primary`.
  - Opt-in hook classes (`nl-*`): `nl-sidebar`, `nl-navlabel`, `nl-nav-active`, `nl-brand`, `nl-logo`, `nl-streak-box` (Sidebar); `nl-topbar`, `nl-xp-track`, `nl-xp-fill`, `nl-coin`, `nl-avatar` (Topbar); `nl-ai-fab` (App); `nl-progress-fill` (ProgressBar). Several use `!important` to beat inline styles.
  - Automatic: `main h1` gradient text, holo borders on `.retro-card*`, pearl sheen on `.bg-surface`, pearl `.game-btn.bg-primary`, input focus glow, `::selection`.
- **Holiday lights** (`HolidayLights.jsx` + `holiday-lights.css`, classes `hl-*`; work in every theme, default on only in noel): C9 string lights hung from the topbar, a laser fairy frame (top edge + sidebar seam) and a pearl fairy strand. Portalled to `<body>` at **z-30**, `pointer-events: none`, animates only opacity/transform, pauses while `document.hidden` or while any `[data-hl-pause]` element (Modal, CommandPalette) is open; reduced-motion = static glow. Mounted only when on (`{lightsOn && <HolidayLights />}`); hangs from `<main data-hl-screen>`. Toggle: Topbar bulb button, Settings → Appearance, ⌘K "Toggle holiday lights".
  - **Layering contract:** sprite (z-20) < lights (z-30) < AI FAB (z-40) < Modal/AIPanel (z-50) < XPToast (z-60) < CommandPalette (z-100). Never add `isolate`, `transform`, `filter`, `z-index` or `will-change` to `<main>` or its wrappers. `Modal` portals to `<body>`. Sidebar must stay `w-[200px]` (or pass `sidebarWidth`).
- **Rudolph** (`ReindeerSprite.jsx` + `reindeer.css`; all themes, replaced the old Mario sprite): pixel-art reindeer mascot with a pulsing red nose glow — `ReindeerFaceIcon` on the AI button (`.sprite-bob`) and chat header, `WalkingReindeer` on the Dashboard floor. In noel its scarf follows `primary`.

### Typography
- Font: **Nunito** (Google Fonts, loaded in `index.html`)
- Base: 14px, line-height 1.6

### Retro card style (`.retro-card`)
- `border: 2px solid` `primary` (classic `#1D9E75`)
- `box-shadow: 3px 3px 0` `primary-shadow` (classic `#085041`) — hard drop shadow, no blur = pixel-art look
- Hover: `translate(-1px, -1px)` + shadow expands to `4px 4px 0`
- Amber variant: `.retro-card-amber` (`amber` / `amber-shadow`)
- Purple variant: `.retro-card-purple` (`purple` / `purple-shadow`)
- Neon Noel swaps the borders for holo gradients (`noel.css`)

### Game chrome pattern
- Sidebar + Topbar: dark `chrome` (classic `#061710`) — the "bezel"
- Content area: `screen` (classic light `#f4fdf8`) — the "screen"
- `.game-bg`: radial dot pattern `c('primary', 0.07)` on content area

---

## SQLite Schema (all 9 tables)

```sql
CREATE TABLE IF NOT EXISTS epics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'bolt',
  color TEXT DEFAULT 'teal',           -- 'teal' | 'amber' | 'purple'
  horizon TEXT DEFAULT 'quarter',      -- 'quarter' | 'year' | 'longterm'
  status TEXT DEFAULT 'not_started',   -- 'not_started' | 'in_progress' | 'done'
  progress INTEGER DEFAULT 0,          -- 0–100, recalculated from subtasks
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subtasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  epic_id INTEGER REFERENCES epics(id) ON DELETE CASCADE,
  parent_id INTEGER REFERENCES subtasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_recurring INTEGER DEFAULT 0,
  recurrence TEXT,
  status TEXT DEFAULT 'not_started',   -- 'not_started' | 'in_progress' | 'done'
  due_date DATE,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS streak_habits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'flame',
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS streak_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  habit_id INTEGER REFERENCES streak_habits(id) ON DELETE CASCADE,
  logged_date DATE NOT NULL,
  completed INTEGER DEFAULT 1,
  UNIQUE(habit_id, logged_date)
);

CREATE TABLE IF NOT EXISTS time_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  week_start DATE NOT NULL UNIQUE,
  deep_work_hours REAL DEFAULT 0,
  learning_hours REAL DEFAULT 0,
  admin_hours REAL DEFAULT 0,
  social_hours REAL DEFAULT 0,
  rest_hours REAL DEFAULT 0,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  role TEXT,
  company TEXT,
  relationship_type TEXT DEFAULT 'other',  -- 'mentor' | 'peer' | 'lead' | 'other'
  last_contact_date DATE,
  next_action TEXT,
  next_action_date DATE,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS weekly_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  week_start DATE NOT NULL UNIQUE,
  what_worked TEXT,
  what_didnt TEXT,
  dropping_this_week TEXT,
  focus_next_week TEXT,
  energy_rating INTEGER,               -- 1–5
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS energy_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  log_date DATE NOT NULL UNIQUE,
  energy_rating INTEGER NOT NULL,      -- 1–5
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Bonus tables (added during Phase 3 / AI work):
CREATE TABLE IF NOT EXISTS ai_conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  messages TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role TEXT NOT NULL,                  -- 'user' | 'assistant'
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Created at runtime by their owning page (CREATE TABLE IF NOT EXISTS via IPC):

-- subtasks gains is_recurring=1 for "Daily Checklist" tasks; one row per day they're ticked:
CREATE TABLE IF NOT EXISTS recurring_completions (   -- EpicDetail.jsx / Dashboard.jsx
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subtask_id INTEGER REFERENCES subtasks(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  UNIQUE(subtask_id, completed_date)
);

CREATE TABLE IF NOT EXISTS journal_entries (         -- Journal.jsx
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entry_date DATE NOT NULL UNIQUE,
  content TEXT,
  mood INTEGER,                       -- 1–5
  highlight TEXT, gratitude TEXT, challenge TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS journal_reflections (     -- Journal.jsx (cached AI recaps)
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  range_type TEXT NOT NULL,           -- '7' | '30'
  end_date DATE NOT NULL,
  narrative TEXT, mood_arc TEXT, patterns TEXT, insight TEXT,
  fingerprint TEXT,                   -- cache key; regenerate only when entries change
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(range_type, end_date)
);

CREATE TABLE IF NOT EXISTS daily_schedules (         -- Daily.jsx ("Generate my day")
  schedule_date DATE PRIMARY KEY,
  blocks TEXT NOT NULL                -- JSON array of time blocks
);

CREATE TABLE IF NOT EXISTS weekly_ai_reviews (       -- WeeklyReview.jsx (cached AI review)
  week_start DATE PRIMARY KEY,
  summary TEXT, biggest_win TEXT, biggest_gap TEXT, reflective_questions TEXT,
  data_fingerprint TEXT,
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Settings keys (seeded defaults)

| Key | Default | Notes |
|---|---|---|
| `user_name` | `'Polana'` | Display name |
| `user_initials` | `'PK'` | Avatar initials |
| `ai_provider` | `'anthropic'` | `'anthropic'` \| `'openai'` \| `'gemini'` \| `'ollama'` |
| `ai_model` | `'claude-sonnet-4-20250514'` | |
| `ai_api_key` | `''` | XOR-encrypted at rest |
| `ollama_endpoint` | `'http://localhost:11434'` | |
| `ollama_model` | `'llama3'` | |
| `openai_api_key` | `''` | XOR-encrypted |
| `gemini_api_key` | `''` | XOR-encrypted |
| `launch_on_startup` | `'true'` | |
| `start_minimized` | `'false'` | |
| `weekly_review_reminder` | `'true'` | |
| `reminder_time` | `'20:00'` | |
| `xp_total` | `'0'` | Cumulative XP |
| `xp_level` | `'1'` | Current level 1–5 |
| `app_theme` | *(not seeded → `'dynamic'`)* | `'dynamic'` \| `'noel'` \| `'forest'` \| `'ocean'` \| `'synthwave'` \| `'pixel'`. `'noel'` (Neon Noel) is the only one that swaps the color palette (`<html data-theme="noel">`); the rest only change backgrounds. Set from Settings → Appearance |
| `holiday_lights` | *(not seeded → auto)* | `'true'` \| `'false'` once the user chooses. Missing = auto: on only in Neon Noel. Switching the theme to `'noel'` sets it to `'true'`. **Do not seed it** |

---

## XP Gamification Rules

### Earning XP

| Action | XP |
|---|---|
| Log a daily streak habit | +10 XP |
| Complete a subtask | +15 XP |
| Create a new Epic | +20 XP |
| Complete an entire Epic | +50 XP |
| Submit a Weekly Review | +25 XP |
| Log energy for the day | +5 XP |
| Write a journal entry (first per day) | +8 XP |
| Check off a daily epic task | +10 XP |

### Level thresholds

| Level | XP required |
|---|---|
| 1 | 0 |
| 2 | 200 |
| 3 | 500 |
| 4 | 1 000 |
| 5 | 2 000 |

Level-up triggers canvas-confetti + a level-up toast. Calculated in `src/main/main.js` → `calcLevel()`.

### XP bar display
- Shown in Topbar as an HP-style segmented fill
- Colour shifts green → yellow → red based on % toward next level
- Tick marks divide the bar into segments

---

## Project Structure

```
d:\Dashboard\
├── src/
│   ├── main/
│   │   ├── main.js          # Electron main process, IPC handlers
│   │   ├── preload.js       # Context bridge — exposes window.electronAPI
│   │   ├── database.js      # better-sqlite3 init, schema, seed, helpers
│   │   └── aiHandler.js     # AI provider routing (Anthropic / OpenAI / Gemini / Ollama)
│   └── renderer/
│       ├── index.html
│       ├── main.jsx
│       ├── App.jsx          # Root: MemoryRouter, layout shell, AI panel toggle
│       ├── styles/
│       │   ├── globals.css        # Tailwind + custom animations + retro-card classes (@imports the files below)
│       │   ├── tokens.css         # Theme color tokens (RGB channels): classic :root + html[data-theme="noel"]
│       │   ├── noel.css           # Neon Noel finishes (holo borders, pearl sheen, glows) via nl-* hooks
│       │   ├── holiday-lights.css # hl-* overlay styles for HolidayLights (+ Topbar bulb icon colors)
│       │   └── reindeer.css       # Rudolph nose-glow pulse, noel scarf tint, .sprite-bob
│       ├── utils/
│       │   ├── colors.js        # c() / withAlpha() / tokenHex() / useTokenHex() + ThemeContext
│       │   ├── themes.js        # THEMES, applyTheme(), paletteFor(), computeBg() background presets
│       │   ├── systemPrompt.js  # buildSystemPrompt() + fetchMemories() (shared LLM personality layer)
│       │   ├── dailyBrief.js    # Topbar daily brief (AI + template fallback)
│       │   └── dates.js
│       ├── components/
│       │   ├── Sidebar.jsx
│       │   ├── Topbar.jsx           # Brief, ⌘K trigger, holiday-lights + music toggles, XP bar
│       │   ├── AIPanel.jsx          # Slide-in AI chat with persistent memory + actions
│       │   ├── CommandPalette.jsx   # Global ⌘K command center (fuzzy search + actions)
│       │   ├── ReindeerSprite.jsx   # Rudolph: ReindeerFaceIcon (AI button/header) + WalkingReindeer (Dashboard)
│       │   ├── HolidayLights.jsx    # Neon Noel string + fairy lights overlay (portal, z-30)
│       │   ├── Modal.jsx            # Shared modal (portalled to <body>)
│       │   ├── EpicCard.jsx
│       │   ├── ProgressBar.jsx
│       │   ├── StatusPill.jsx
│       │   ├── XPToast.jsx
│       │   └── ConfettiCelebration.jsx
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── Daily.jsx        # Daily Planner + "Generate my day" AI schedule
│       │   ├── Journal.jsx      # Daily diary (mood + free-write) + AI 7/30-day reflections
│       │   ├── Insights.jsx     # Analytics: activity heatmap, level ring, mood/energy, charts
│       │   ├── Calendar.jsx
│       │   ├── Epics.jsx
│       │   ├── EpicDetail.jsx   # Milestones + recurring Daily Checklist per epic
│       │   ├── Streaks.jsx
│       │   ├── TimeAudit.jsx
│       │   ├── NetworkCRM.jsx
│       │   ├── WeeklyReview.jsx # Auto-generated AI weekly review
│       │   ├── EnergyLog.jsx
│       │   ├── Welcome.jsx      # 4-step first-run onboarding
│       │   └── Settings.jsx
│       └── hooks/
│           └── useAudio.js
├── public/
│   └── icon.png
├── package.json
├── vite.config.js
├── tailwind.config.js
└── CLAUDE.md               ← this file
```

---

## IPC API (`window.electronAPI`)

```js
window.electronAPI.db.query(sql, params)     // SELECT → array
window.electronAPI.db.run(sql, params)       // INSERT/UPDATE/DELETE → { lastInsertRowid, changes }
window.electronAPI.db.get(sql, params)       // SELECT one → object | undefined

window.electronAPI.settings.get(key)         // → string | null
window.electronAPI.settings.set(key, value)  // → true
window.electronAPI.settings.getApiKey(provider)     // decrypted string
window.electronAPI.settings.setApiKey(provider, key) // encrypts + stores

window.electronAPI.xp.award(amount)          // → { xp, level, levelUp }

window.electronAPI.ai.chat({ messages, provider, model, ollamaEndpoint, systemPrompt })

window.electronAPI.system.setLoginItem(bool)
window.electronAPI.system.exportData()       // → { ok, filePath? }
```

---

## Security Constraints

- **AI API keys must NEVER be exposed in renderer** — all AI calls go through main process IPC
- API keys are **XOR-encrypted** using a machine-specific key (hostname + username) before writing to SQLite
- `ELECTRON_RUN_AS_NODE=1` must NOT be set when running the app (causes Electron to run as Node, not as a window)

---

## Development

```powershell
# Kill any stale processes first:
Get-Process -Name node, electron -ErrorAction SilentlyContinue | Stop-Process -Force

# Clear the env var if accidentally set:
[System.Environment]::SetEnvironmentVariable('ELECTRON_RUN_AS_NODE', $null, 'Process')

npm run dev
```

Vite dev server: `http://localhost:5173`  
Electron loads that URL in dev mode; `dist/index.html` in production.

---

## All Phases

### ✅ Phase 1 — Main process + DB
- Electron main process skeleton
- `database.js`: schema for all 9 tables, seed data, XOR-encrypted API key storage
- `preload.js`: context bridge exposing `window.electronAPI`
- IPC handlers: db CRUD, settings, XP award, AI chat, system tray, export

### ✅ Phase 2 — React shell + routing
- `App.jsx`: MemoryRouter with all routes
- `Sidebar.jsx`: dark game-chrome nav
- `Topbar.jsx`: greeting, XP bar, level badge, coin
- Stub pages for all routes

### ✅ Phase 3 — Dashboard + gamification + AI
- `Dashboard.jsx`: stat cards, Epic cards with horizon tabs, daily streak log
- `MarioSprite.jsx`: pixel-art walking Mario (RAF loop), interactive hover/click *(replaced by Rudolph / `ReindeerSprite.jsx` in Phase 13)*
- `AIPanel.jsx`: slide-in chat panel with persistent `ai_messages` DB memory
- `EpicCard.jsx`: retro-card style
- `XPToast.jsx`, `ConfettiCelebration.jsx`: XP feedback
- `useAudio.js`: chiptune sound effects
- Full retro visual overhaul (dark chrome, retro cards, `globals.css` animations)

### ✅ Phase 4 — Epics full CRUD + detail page
- `Epics.jsx`: list all epics, create new epic modal (name, description, icon, color, horizon)
- `EpicDetail.jsx`: view/edit epic, add/complete/delete subtasks, progress recalc, mark epic complete (+50 XP)

### ✅ Phase 5 — Streaks page
- `Streaks.jsx`: create/delete habits, today's progress bar, XP award (+10)
- `StreakCard.jsx`: 28-day calendar grid (4×7), logged count, streak + best streak display

### ✅ Phase 6 — AI chat panel (enhancements)
- Context injection: live epics, streaks, today's logs, XP, level injected as system prompt
- Persistent memory via `ai_messages` table (from Phase 3)

### ✅ Phase 7 — Remaining pages
- `TimeAudit.jsx`: weekly hours logger (deep work, learning, admin, social, rest) + Recharts bar
- `NetworkCRM.jsx`: contacts table, add/edit/delete, search, overdue follow-up indicators
- `WeeklyReview.jsx`: form (what worked, what didn't, dropping, next focus, energy rating) + +25 XP on first submit per week
- `EnergyLog.jsx`: daily energy rating (1–5) with 30-day trend chart + +5 XP on first log per day

### ✅ Phase 8 — Settings page
- `Settings.jsx`: user profile, AI provider switcher (Anthropic / OpenAI / Gemini / Ollama), API key input (encrypted), startup settings, data export

### ✅ Phase 9 — Package to .exe
- `electron-builder.yml`: NSIS config, `win.icon: public/icon.png` (auto-converted to .ico)
- `npm run build:win` → `dist-electron/Life OS Setup.exe`

### ✅ Phase 10 — AI deepening + product polish
- Shared `utils/systemPrompt.js`: provider-agnostic personality layer (`buildSystemPrompt` + `fetchMemories`) used by every LLM call
- `Daily.jsx`: "Generate my day" — AI builds a JSON time-block schedule, drag-to-reorder, cached in `daily_schedules`
- `WeeklyReview.jsx`: auto-generated AI review ([SUMMARY]/[WIN]/[GAP]/[QUESTIONS]), cached by data fingerprint
- `EpicDetail.jsx`: epics split into **Milestones** (one-time, +15 XP) and a recurring **Daily Checklist** (+10 XP/day via `recurring_completions`); progress % counts milestones only. Dashboard shows a "Daily Grind" sidebar of all recurring tasks
- `Welcome.jsx`: 4-step first-run onboarding (name → first epic → first habit → XP intro); shown when DB has no epics
- `AIPanel.jsx`: full task-aware context (subtask IDs + daily/done state) and 13 action types — `move_to_daily`, `move_to_milestone`, `complete_task`, `log_daily_epic_task`, `delete_task`, `update_epic`, `add_daily_task`, `journal_entry`, plus navigate/add_task/log_streak/add_habit/add_contact/create_goal. All XP routed through App's `awardXp` (toasts + confetti)

### ✅ Phase 11 — Journal + AI reflections
- `Journal.jsx`: three tabs — **Write** (mood 1–5 + free-write + optional highlight/gratitude/challenge, rotating daily prompt, +8 XP first entry per day), **AI Reflections** (7- or 30-day narrative / emotional arc / patterns / insight via the shared provider layer, cached in `journal_reflections` by fingerprint), **History** (month calendar heatmap coloured by mood + recent-entry list)
- Journaling streak badge; `journal_entry` AI action lets the assistant write/append entries on command

### ✅ Phase 12 — Insights analytics + ⌘K Command Palette
- `Insights.jsx` (`/insights`): premium analytics page — animated count-ups, a **level/XP progress ring**, a **GitHub-style 17-week activity heatmap** synthesising tasks + streak logs + recurring completions + journal + energy into a per-day intensity, a **Mood vs Energy** 30-day line chart, **30-day habit-consistency** bars, **epic momentum** bars, and **weekday productivity** analysis. All Recharts; graceful empty states + loading skeleton
- `CommandPalette.jsx`: global **⌘K / Ctrl+K** command center (toggle wired in `App.jsx`, rendered inside `MemoryRouter` so `useNavigate` works). Fuzzy-search (subsequence scoring) across all pages, active epics, and habits, plus quick actions. Arrow/Enter/Esc keyboard nav, grouped results, log-a-streak inline (+10 XP, stays open). Topbar has a discoverable "Search ⌘K" trigger
- `Epics.jsx`: opens the create-epic modal when reached via `?new=1` (used by the palette's "Create a new epic")

### ✅ Phase 13 — Neon Noel theme
- **Token migration:** every renderer color moved to theme tokens — `styles/tokens.css` (RGB channels, classic `:root` + `html[data-theme="noel"]`), Tailwind colors mapped to `rgb(var(--c-*) / <alpha-value>)`, `utils/colors.js` helpers (`c`, `withAlpha`, `tokenHex`, `useTokenHex`, `ThemeContext`). Classic is pixel-identical; feature-specific colors are `x-<area>-<name>` extension tokens. `widget.jsx` loads the tokens and applies the saved theme too
- **Neon Noel** (`app_theme = 'noel'`, 0 XP, listed in `THEMES`): dark oil-slick / pearlescent palette with laser neon + Christmas accents; `styles/noel.css` adds holo borders, pearl sheen and glows through `nl-*` hook classes
- **Holiday lights** (`HolidayLights.jsx` + `styles/holiday-lights.css`): C9 string lights on the topbar edge, laser fairy frame, pearl fairy strand. Setting `holiday_lights` (unset = on only in noel; switching to noel turns it on). Toggles: Topbar bulb button, Settings → Appearance, ⌘K "Toggle holiday lights". Portalled overlay at z-30 with `pointer-events: none`; pauses under `[data-hl-pause]` (Modal, CommandPalette) and when the window is hidden; `Modal` now portals to `<body>`
- **Rudolph** (`ReindeerSprite.jsx` + `styles/reindeer.css`) replaces the Mario sprite everywhere: `ReindeerFaceIcon` on the floating AI button (`.sprite-bob`) and the AI chat header, `WalkingReindeer` on the Dashboard. `MarioSprite.jsx` deleted
