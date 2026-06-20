---
# DESIGN.md frontmatter - machine-readable design tokens for design agents.
# Values extracted verbatim from the Kun codebase:
#   kun/src/renderer/src/styles/base-shell.css  (the authoritative token source)
#   kun/src/renderer/src/index.css
#   kun/tailwind.config.js
#   kun/src/renderer/src/components/** (verified usage frequencies)
# kun/DESIGN.md's own frontmatter is stale (a neutral-gray #0088ff palette);
# this file reflects what the running app actually ships.

schema_version: 1
project: Kun
extracted_from: ../kun
source_of_truth:
  tokens: kun/src/renderer/src/styles/base-shell.css
  tailwind: kun/tailwind.config.js
  index: kun/src/renderer/src/index.css
themes: [light, dark, system]
mascot_mode: ikun   # opt-in [data-ikun-mode='on'] overrides accent + neutrals

# ---------- 1. Token architecture (two layers) ----------
token_layers:
  # Layer 1 - primitives. These change per theme. Named after their job.
  primitives:
    - { name: --bg-app,         role: "app shell background (the surrounding frame)" }
    - { name: --bg-sidebar,     role: "sidebar column background" }
    - { name: --bg-canvas,      role: "central work-area background" }
    - { name: --surface-1,      role: "translucent card surface" }
    - { name: --surface-2,      role: "more opaque elevated surface" }
    - { name: --surface-3,      role: "solid surface" }
    - { name: --border-soft,    role: "default hairline border" }
    - { name: --border-strong,  role: "emphasized border (inputs focus, dividers)" }
    - { name: --text-primary,   role: "body ink" }
    - { name: --text-secondary, role: "muted body / metadata" }
    - { name: --text-tertiary,  role: "faint ink / placeholders" }
    - { name: --text-placeholder, role: "input placeholder text" }
  # Layer 2 - semantic aliases. Components ONLY ever reference --ds-* tokens,
  # never the primitives directly. This is the contract that lets themes swap.
  semantic:
    bg: ["--ds-bg-main", "--ds-bg-sidebar", "--ds-bg-canvas"]
    surface: ["--ds-surface-card", "--ds-surface-elevated", "--ds-surface-subtle", "--ds-surface-hover"]
    border: ["--ds-border", "--ds-border-muted", "--ds-border-strong"]
    text: ["--ds-text", "--ds-text-muted", "--ds-text-faint"]
    accent: ["--ds-accent", "--ds-accent-soft"]
    status: ["--ds-success", "--ds-success-soft", "--ds-warning-soft", "--ds-danger", "--ds-danger-soft"]
    diff: ["--ds-diff-added", "--ds-diff-added-soft", "--ds-diff-removed", "--ds-diff-removed-soft"]
    skill: ["--ds-skill", "--ds-skill-soft"]   # purple = "this came from a plugin"
    bubble: ["--ds-bubble-user", "--ds-bubble-user-fg"]
    shadow: ["--ds-shadow-shell", "--ds-shadow-panel", "--ds-shadow-composer", "--ds-shadow-card-soft", "--ds-shadow-card-strong", "--ds-shadow-chip"]
  rule: "Components reference --ds-* only. Themes reassign both layers. Primitives are not a public API."

# ---------- 2. Palette (raw values, verified against base-shell.css) ----------
palette:
  light:
    bg_app: "#f3f5fc"            # --bg-app
    bg_sidebar: "#eef2fa"        # --bg-sidebar
    bg_canvas: "#fafbff"         # --bg-canvas
    surface_card: "rgba(255,255,255,0.90)"   # --surface-1
    surface_elevated: "rgba(255,255,255,0.98)" # --surface-2
    surface_solid: "#ffffff"     # --surface-3
    surface_subtle: "#eaf0f9"    # --ds-surface-subtle
    surface_hover: "rgba(59,110,187,0.065)"
    border: "rgba(20,47,95,0.13)"   # --border-soft
    border_muted: "rgba(20,47,95,0.085)"
    border_strong: "rgba(20,47,95,0.20)"
    text: "#233659"              # --text-primary - a deep whale-blue ink, NOT gray
    text_muted: "#54678c"        # --text-secondary
    text_faint: "#8492b1"        # --text-tertiary
    text_placeholder: "#93a1c0"  # --text-placeholder
    accent: "#3b82d8"            # --ds-accent - whale blue
    accent_soft: "rgba(59,130,216,0.15)"
    bubble_user: "rgba(133,193,241,0.20)"   # --ds-bubble-user - light bird-blue
    bubble_user_fg: "#233659"
    success: "#128a4a"
    success_soft: "rgba(17,185,129,0.14)"
    danger: "#d6493f"
    danger_soft: "rgba(244,116,100,0.14)"
    warning_soft: "rgba(240,162,63,0.16)"
    diff_added: "#128a4a"
    diff_added_soft: "rgba(18,138,74,0.10)"
    diff_removed: "#d6493f"
    diff_removed_soft: "rgba(214,73,63,0.10)"
    skill: "#7a68e8"            # --ds-skill - soft purple
    skill_soft: "rgba(122,104,232,0.13)"
    selection: "rgba(59,130,216,0.20)"
    scrollbar_thumb: "rgba(84,103,140,0.24)"
    scrollbar_thumb_hover: "rgba(84,103,140,0.34)"
    cursor_spotlight: "rgba(133,193,241,0.28)"
  dark:
    bg_app: "#0f1422"
    bg_sidebar: "#121829"
    bg_canvas: "#161d30"
    surface_card: "rgba(22,29,47,0.92)"
    surface_elevated: "#1b2338"
    surface_subtle: "#1b2338"
    surface_hover: "rgba(151,192,235,0.10)"
    border: "rgba(151,192,235,0.13)"
    border_muted: "rgba(151,192,235,0.10)"
    border_strong: "rgba(151,192,235,0.20)"
    text: "#f0f5fc"
    text_muted: "#bdc9de"
    text_faint: "#8593b1"
    accent: "#6fb0e8"            # lightened whale blue for dark canvas
    accent_soft: "rgba(111,176,232,0.18)"
    bubble_user: "rgba(133,193,241,0.13)"
    bubble_user_fg: "#f0f5fc"
    success: "#40c977"
    success_soft: "rgba(64,201,119,0.18)"
    danger: "#f8736a"
    danger_soft: "rgba(248,115,106,0.18)"
    warning_soft: "rgba(242,162,63,0.18)"
    diff_added: "#40c977"
    diff_added_soft: "rgba(64,201,119,0.16)"
    diff_removed: "#f8736a"
    diff_removed_soft: "rgba(248,115,106,0.16)"
    skill: "#a89bf5"
    skill_soft: "rgba(168,155,245,0.16)"
    selection: "rgba(111,176,232,0.26)"
    scrollbar_thumb: "rgba(151,178,215,0.28)"
    scrollbar_thumb_hover: "rgba(171,198,233,0.38)"
    cursor_spotlight: "rgba(111,176,232,0.20)"
  # iKun mascot mode: opt-in via [data-ikun-mode='on']. Replaces the whole
  # neutral + accent ramp with an amber/basketball-orange identity while
  # keeping every --ds-* alias name stable. Two sub-modes: light + dark.
  ikun_light:
    bg_app: "#faf3e4"
    bg_sidebar: "#f5edd9"
    bg_canvas: "#fdf9ef"
    text: "#43321c"
    accent: "#d8730d"            # basketball orange
    accent_soft: "rgba(216,115,13,0.15)"
    surface_subtle: "#f7f0dd"
    selection: "rgba(216,115,13,0.20)"
  ikun_dark:
    bg_app: "#16110d"
    bg_sidebar: "#1a1410"
    bg_canvas: "#201913"
    text: "#f9f3e5"
    accent: "#f2b13d"            # golden yellow - "night arena"
    accent_soft: "rgba(242,177,61,0.18)"
    surface_subtle: "#271f17"
    selection: "rgba(242,177,61,0.26)"

# ---------- 3. Tailwind bridge (kun/tailwind.config.js) ----------
tailwind:
  dark_mode: "selector: [data-theme='dark']"   # NOT media; theme is explicit
  color_aliases:
    accent: "var(--ds-accent)"           # accent.DEFAULT, accent.soft
    background: "var(--ds-bg-canvas)"
    foreground: "var(--ds-text)"
    border: "var(--ds-border)"
    muted: { DEFAULT: "var(--ds-surface-subtle)", foreground: "var(--ds-text-muted)" }
    sidebar: "var(--ds-surface-subtle)"
    primary: { DEFAULT: "var(--ds-accent)", foreground: "#ffffff" }
  # The `ds.*` namespace exposes every semantic token as a Tailwind color, so
  # bg-ds-card, text-ds-ink, border-ds-border, text-ds-muted all resolve to --ds-*.
  # Usage frequency in components (top hits): ds-ink x568, ds-faint x427,
  # ds-muted x383, ds-card x310, ds-border-muted x270, ds-border x263.
  ds_namespace: ["main", "sidebar", "canvas", "card", "elevated", "subtle", "hover", "border", "border-muted", "ink", "muted", "faint", "success", "success-soft", "danger", "danger-soft", "diff-added", "diff-added-soft", "diff-removed", "diff-removed-soft", "skill", "skill-soft", "userbubble", "userbubbleFg"]
  radius_override: { xl: "14px", "2xl": "18px", "3xl": "22px" }

# ---------- 4. Typography ----------
typography:
  families:
    sans: "SF Pro Text, 'PingFang SC', 'Noto Sans SC', 'Helvetica Neue', Arial, sans-serif"
    display: "SF Pro Display, 'PingFang SC', 'Noto Sans SC', sans-serif"
    mono: "SF Mono, 'JetBrains Mono', 'IBM Plex Mono', monospace"
  rule: "Three families maximum. Bilingual cascade (zh + en) is baked into every stack."
  # Sizes are authored as explicit px via Tailwind arbitrary values (text-[13px]),
  # not the default Tailwind scale. This is deliberate - the rhythm is fine-grained.
  size_rhythm:
    caption: 11       # helper text, hints
    label_small: 11.5 # tab labels, table headers
    chip: 10          # status chips, tags
    body_sm: 12.5     # secondary metadata, list row secondary
    body: 13          # default body, button text, table cells (MOST COMMON)
    body_lg: 14       # primary form input text, list row primary
    body_xl: 14.5     # settings subtitle
    title_sm: 15      # strong inline label
    title: 16         # card titles, dialog titles
    title_lg: 18      # topbar session title, settings section H2
    display: 24       # marketing-style headings
    hero: 30          # welcome card (ceiling; never larger)
  # Verified usage in components: text-[12px] x349, text-[13px] x247,
  # text-[12.5px] x123, text-[14px] x115, text-[11px] x86.
  weights: [400, 500, 600, 700]
  leading:
    tight: "leading-tight - hero headings only"
    compact: "leading-5 / leading-6 - UI lists, table rows"
    relaxed: "leading-relaxed - body prose, markdown"
    none: "leading-none - chips only"
  tracking:
    normal: 0
    wide: 0.04        # reserved exclusively for text-[11px] uppercase section eyebrows
  font_scale:
    # Independent of theme. Applied as --ds-ui-scale CSS zoom factor.
    small: 0.82
    medium: 0.88
    large: 1.00

# ---------- 5. Spacing & sizing ----------
spacing:
  base_unit_px: 4     # Tailwind default scale; no custom scale
  card_padding:
    tight: "px-3 py-2"   # 12x8
    normal: "px-4 py-3"  # 16x12
    loose: "px-5 py-4"   # 20x16 - hero cards + full-screen modals only
  inline_gap: "gap-1 to gap-3; beyond gap-4 starts a new region"
  section_spacing: "mt-3 to mt-6; tighter = gap-* on a flex parent, wider = new card"
  layout:   # fixed three-pane defaults from Workbench.tsx
    left_sidebar_default_px: 268
    left_sidebar_min_px: 236
    left_sidebar_max_px: 420
    right_inspector_default_px: 360
    right_inspector_min_px: 280
    right_inspector_max_px: 760
    sidebar_hard_min_px: 180

# ---------- 6. Border radius ----------
radius:
  scale_px: [4, 6, 8, 10, 12, 14, 16, 18, 22, 28, 9999]
  alias:
    sm: 6          # rounded-md - inline code, kbd
    md: 8          # rounded-lg - icon-only buttons
    lg: 12         # rounded-xl - MOST card surfaces
    xl: 14         # tailwind xl override
    "2xl": 18      # tailwind 2xl override - topbar dropdowns
    "3xl": 22      # rounded-3xl - dialogs
    composer: 28   # .ds-chat-composer - the single oversized shell
    pill: 9999     # rounded-full - chips, pill buttons, avatars, status dots
  # Verified usage: rounded-xl x277, rounded-full x234, rounded-lg x139, rounded-md x69.
  hard_rules:
    - "No square corners on a clickable surface. Minimum 6px."
    - "No fully-rounded corners on a card surface. Cards are rounded-xl to rounded-3xl, never pill."

# ---------- 7. Elevation (shadows) ----------
elevation:
  light:
    chip: "inset 0 1px 0 rgba(255,255,255,0.78)"                    # --ds-shadow-chip
    card_soft: "0 10px 28px rgba(20,47,95,0.06)"                    # --ds-shadow-card-soft
    card_strong: "0 14px 36px rgba(20,47,95,0.09)"                  # --ds-shadow-card-strong
    panel: "0 16px 44px rgba(20,47,95,0.06)"                        # --ds-shadow-panel
    shell: "0 12px 30px rgba(20,47,95,0.08)"                        # --ds-shadow-shell
    composer: "0 18px 46px rgba(20,47,95,0.10), 0 5px 16px rgba(20,47,95,0.06)"  # --ds-shadow-composer
  dark:
    chip: "inset 0 1px 0 rgba(151,192,235,0.06)"
    card_soft: "0 16px 42px rgba(2,6,16,0.22)"
    card_strong: "0 22px 56px rgba(2,6,16,0.30)"
    panel: "0 22px 58px rgba(2,6,16,0.35)"
    shell: "0 38px 96px rgba(2,6,16,0.55)"
    composer: "0 28px 78px rgba(2,6,16,0.45), 0 0 0 1px rgba(151,192,235,0.06)"
  tiers:
    - "Card soft - list rows, side panels, in-page popovers."
    - "Card strong / panel - modals, dropdowns, the composer (lifted glass)."
    - "Shell - the app shell, welcome screen, settings root. Used sparingly."
  rule: "Chips and pill buttons get an inset top highlight so they read as pressed out of glass, not painted on. Never use a colored shadow - all shadows are near-black with low alpha."

# ---------- 8. Background gradients ----------
backgrounds:
  stage_gradient_light: "linear-gradient(180deg, #fafbff 0%, #ffffff 100%)"        # --ds-stage-gradient
  topbar_gradient_light: "linear-gradient(180deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.58) 58%, rgba(255,255,255,0.30) 100%)"
  sidebar_gradient_light: "linear-gradient(180deg, rgba(246,249,254,0.98) 0%, rgba(237,243,252,0.98) 100%)"
  sidebar_haze_light: "radial-gradient(circle at 62% -14%, rgba(133,193,241,0.16), transparent 38%), linear-gradient(180deg, rgba(255,255,255,0.58), rgba(255,255,255,0) 30%)"
  body_glaze_light: "radial + linear layers on body::after - soft directional light, introduces no new color"
  rule: "Gradients live on ::before/::after of structural shells (body, topbar, sidebar, composer). They never add a hue outside the active palette."

# ---------- 9. Motion ----------
motion:
  timing_ms:
    micro: 140     # hover bg, border, color, focus ring swap
    standard: 150  # card hover, composer border on focus, transform
    deep: 300      # modal open, route transition (opacity + scale only)
  easing: ease     # linear ease throughout; no bounce, no elastic, no custom curves
  looped:
    pulse: 1800    # ms, ease-in-out, infinite - status dots, work logo
    shiny_text: 2400  # ms, linear, infinite - streaming assistant shimmer (.ds-shiny-text)
  transform:
    card_lift: "translateY(-1px)"
    button_press: "scale(0.985)"
  principles:
    - "Motion is functional, not decorative."
    - "Do not animate composer, do not animate hover on rows with many cells."
    - "Dialogs cap entry/exit at 200ms opacity + scale."
    - "reduced-motion support is acknowledged but not yet enforced (TODO in source)."

# ---------- 10. Z-index ----------
z_index:
  background: -2
  background_overlay: -1
  base: 0
  sticky: 10
  dropdown: 50
  modal: 100
  toast: 200

# ---------- 11. Window chrome ----------
window:
  app_region: drag             # html/body carry -webkit-app-region: drag
  no_drag_class: ds-no-drag    # any interactive element inside the titlebar opts out
  no_drag_tags: [button, input, select, textarea, option, a, summary, "[role='button']", "[contenteditable='true']"]
  macos_top_inset_px: 42       # --ds-window-controls-safe-block (darwin) - traffic-light safe area
  platform_variants:
    darwin: { controls_safe_block: 42px, controls_safe_inset: 56px, write_titlebar_extra_inset: 20px }
    win32: { windows_titlebar_height: 40px }
    linux: { windows_titlebar_height: 40px }

# ---------- 12. Iconography ----------
icons:
  library: lucide-react
  default_size_px: 16
  common_sizes_px: [14, 16, 18, 20, 24]
  color: currentColor   # icons inherit text color; never hard-code icon color

# ---------- 13. Component recipes (verified from components/**) ----------
components:
  card:
    base: "border border-ds-border bg-ds-card rounded-xl shadow-sm"
    strong: "border-ds-border-strong bg-ds-elevated backdrop-blur-xl shadow-[var(--ds-shadow-card-strong)]"
  button_primary:
    base: "inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-[13px] font-semibold text-white transition hover:brightness-110"
  button_secondary:
    base: "inline-flex items-center gap-1.5 rounded-xl border border-ds-border bg-ds-card px-3 py-2 text-[13px] font-medium text-ds-ink shadow-sm transition hover:bg-ds-hover disabled:opacity-50"
  button_pill:
    base: "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] transition"
  input:
    base: "w-full rounded-xl border border-ds-border bg-ds-card px-3 py-2 text-[14px] text-ds-ink shadow-sm focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/30"
  chip:
    accent: "inline-flex items-center gap-1 rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold text-accent"
    muted: "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[12.5px] font-medium text-ds-muted bg-ds-subtle shadow-sm"
  user_bubble:
    base: "rounded-xl bg-ds-userbubble px-3 py-2 text-[13px] font-medium text-ds-userbubbleFg shadow-sm"
  code_inline:
    base: "rounded-md bg-ds-code-bg px-1.5 py-0.5 font-mono text-[12px] text-ds-ink"   # .ds-code-inline in base-shell.css
  code_block:
    base: "rounded-xl border border-ds-border-muted bg-ds-pre-bg p-3 font-mono text-[12px] leading-5 text-ds-ink"
  status_dot:
    base: "h-2 w-2 rounded-full bg-accent animate-pulse"
  kbd:
    base: "rounded bg-ds-kbd-bg px-1.5 py-0.5 font-mono text-[11px] text-ds-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
  modal:
    container: "fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
    panel: "w-full max-w-md rounded-3xl border border-ds-border bg-ds-elevated p-6 shadow-[var(--ds-shadow-panel)]"

# ---------- 14. Custom CSS classes (base-shell.css) ----------
custom_classes:
  # BEM-ish ds-* classes define reusable structural/visual patterns that
  # Tailwind utility composition can't express cleanly. Most reused:
  ds_markdown: "rendered markdown container (prose styling, code blocks)"
  ds_chat_answer: "assistant message bubble"
  ds_composer_shell: "the floating chat composer (glass + glow + 28px radius)"
  ds_work_logo: "animated Kun whale mascot logo (multi-part wave/swell/spray)"
  ds_shiny_text: "streaming text shimmer (2.4s linear loop)"
  ds_topbar_surface: "translucent draggable topbar strip"
  ds_no_drag: "opt-out from -webkit-app-region drag"
  ds_stage_inset: "center-column work surface frame"

# ---------- 15. i18n & voice ----------
i18n:
  locales: [zh, en]
  default: zh
  framework: "react-i18next; strings in src/renderer/src/locales/{zh,en}/"
  tone: "Direct, helpful, slightly opinionated. First-person plural for the product ('we ship Code, Write, and Connect phone'), second person for the user. No emoji in production copy."
  error_format: "Full human sentence ending in punctuation. Never a raw stack trace."

# ---------- 16. Accessibility ----------
a11y:
  focus_ring: "ring-1 ring-accent/30 on focus-visible; border shifts to ~40% accent"
  focus_visible_only: true   # no ugly focus rings on mouse users
  hit_target_min_px: 32
  contrast_target: WCAG_AA
  selection_color: var(--ds-selection)
  respects_prefers_reduced_motion: false   # TODO: pending in source
  loading_pattern: "role='status' aria-live='polite' on suspense fallbacks (see AppShell.tsx)"

# ---------- 17. Theme application ----------
theming:
  mechanism: "data-theme attribute on <html> ('light' | 'dark'); darkMode is selector-based, NOT media"
  system_mode: "Settings listens to prefers-color-scheme, writes data-theme accordingly"
  ikun_mode: "Optional [data-ikun-mode='on'] overlays the amber identity; composes with dark (four total variants)"
  font_scale: "Independent of theme; --ds-ui-scale applied as CSS zoom (small 0.82 / medium 0.88 / large 1.00)"
  html_color_scheme: "light (set on <html>); dark is opt-in via data-theme"
  rule: "Every screen must work in both themes without per-screen overrides. The token layer is the contract."

# ---------- 18. Anti-patterns (enforced by the codebase) ----------
dont:
  - "Reference --bg-* / --surface-* / --text-* primitives from a component. Use --ds-* aliases only."
  - "Use a second live agent runtime - Kun is the only one."
  - "Apply a tint or hue outside the active palette."
  - "Use a font outside the three declared families."
  - "Use a border radius smaller than 4px on a clickable surface; smaller than 6px on any interactive control."
  - "Use a fully-rounded (pill) corner on a card surface."
  - "Use a colored shadow. All shadows are near-black with low alpha."
  - "Hard-code icon color; icons use currentColor."
  - "Use a Tailwind default font size (text-sm, text-base). Sizes are authored as explicit text-[Npx]."
  - "Use emoji in production copy or as a functional UI affordance."
  - "Recolor disabled elements - disabled is opacity 0.5, never a hue change."
---

# Kun - DESIGN.md (extracted)

> Extracted from the Kun codebase at `../kun`. This is a record of how Kun's
> visual system is **actually built**, verified against the running source.
> The authoritative token values live in the YAML frontmatter above; this
> prose is the *why* and the *when*.

## 0. How to read this file

Two layers, on purpose:

- **YAML frontmatter** - the contract. Exact hex values, token aliases, font
  stacks, spacing, radius, shadows, motion, component recipes. When a value
  changes, change it here **and** in `kun/src/renderer/src/styles/base-shell.css`.
- **Markdown body** - the editorial companion. Design intent, principles, and
  the reasoning behind the values.

> Note: Kun ships its own `kun/DESIGN.md` whose frontmatter describes a neutral
> gray palette with a `#0088ff` accent. That frontmatter is **stale**. The
> values in this file come from reading `base-shell.css` directly, which is
> what the running app actually renders: a whale-blue ink palette with a
> `#3b82d8` accent, plus an opt-in amber "iKun" mascot mode.

---

## 1. Project at a glance

Kun (formerly DeepSeek GUI) is a local-first desktop workbench for its
namesake agent runtime. Electron shell, React 19 + Zustand 5 renderer,
TailwindCSS 3, with a hand-built two-layer token system on top. Three
workbenches share one runtime and one visual system: **Code** (agent work in a
local repo), **Write** (long-form Markdown), and **Connect phone** (Feishu /
Lark / webhook automation).

---

## 2. The two-layer token contract

This is the most important architectural decision in the visual system.

**Layer 1 - primitives** (`--bg-app`, `--surface-1`, `--text-primary`, etc.)
hold the raw per-theme values. They change in every theme block.

**Layer 2 - semantic aliases** (`--ds-*`) map a stable name to a primitive.
Components reference `--ds-*` exclusively, via the Tailwind `ds.*` color
namespace (`bg-ds-card`, `text-ds-ink`, `border-ds-border`).

Because components never touch primitives, a theme can swap the entire palette
by reassigning both layers, and every component updates with zero per-file
changes. This is what lets the iKun mascot mode exist as a clean overlay
rather than a fork.

**Rule:** components use `--ds-*` only. Primitives are not a public API.

---

## 3. Design principles

1. **Stable visual identity, not novelty.** A new screen looks like a sibling
   of an existing one. New components earn their place by replacing several
   existing ones, not by adding a new style.
2. **Calm by default.** A near-paper canvas (light) or near-charcoal canvas
   (dark), restrained translucent surfaces, no chroma in the chrome, a single
   accent that only lights up on actionable elements. Status, danger, and skill
   are the only other colors you may reach for.
3. **Glass, used purposefully.** Translucency + `backdrop-blur-xl` + inset
   top highlights read as layered glass. It is structural (topbar, composer,
   dropdowns), not decorative.
4. **Dense but never crowded.** Fine-grained 0.5px font steps, tight inline
   gaps, a single body size of 13px. The product reads like a code editor,
   not a chat app.

---

## 4. Color, when to use it

The accent (whale blue `#3b82d8` light / `#6fb0e8` dark) is reserved for
*exactly* these:

- The primary action button (Send, Allow, Save).
- A focused form control's border + ring.
- Status dots meaning "live and doing something".
- Hyperlink-style chip labels.
- Text selection background (`--ds-selection`).

Other named colors are reserved for their semantic and nothing else:

- `success` / `danger` - tool outcomes, health, approvals.
- `skill` (purple) - "this came from a user-loaded plugin".
- `diff-added` / `diff-removed` - the only colors allowed side by side on a
  code block.
- `warning-soft` - non-fatal warnings.

Disabled elements are **opacity 0.5**, never recolored. Everything else stays
neutral. If a screen needs more than accent plus these named semantics, the
information architecture should change first.

### The iKun mascot mode

An opt-in identity (`[data-ikun-mode='on']`) reassigns the entire neutral +
accent ramp to an amber/basketball palette while keeping every `--ds-*` name
stable. It has light and dark sub-modes. Because it rides the same alias
contract, no component code changes to support it.

---

## 5. Typography

Three families, bilingual cascades baked into each:

- **Sans** (body): SF Pro Text, PingFang SC, Noto Sans SC, Helvetica Neue, Arial.
- **Display** (hero only): SF Pro Display, same CJK fallback.
- **Mono**: SF Mono, JetBrains Mono, IBM Plex Mono. Code, inline code, kbd,
  command lines, model ids.

Sizes are authored as explicit `text-[Npx]` arbitrary values, not Tailwind's
default scale. The rhythm is fine-grained (10 to 30px, half-pixel steps in the
middle). The single most common size is `text-[13px]` for body and buttons.

`tracking-wide` is reserved for `text-[11px] font-semibold uppercase` section
eyebrows above settings groups. Nothing else gets letter-spacing.

---

## 6. Radius and shape

The product reads as **soft but not round**. Pills (`rounded-full`) for chrome
controls; `rounded-xl` (12px) for most cards; a single oversized
`rounded-[28px]` for the composer shell; `rounded-md`/`rounded-lg` for inline
code, kbd, and icon-only buttons. Two hard rules: no square corners on a
clickable surface (minimum 6px), and no pill corners on a card.

---

## 7. Elevation

Three tiers: **card soft** (list rows, popovers), **card strong / panel**
(modals, dropdowns, composer, lifted glass), **shell** (app shell, welcome,
used sparingly). Dark mode shadows are dramatically deeper (alpha up to 0.55)
because translucency needs more lift to separate from the canvas. Chips get an
inset top highlight so they read as pressed out of glass. Never a colored
shadow.

---

## 8. Motion

Functional, not decorative. 140ms for hover/focus swaps, 150ms for card lift,
200-300ms for route/panel changes (opacity + scale only). Two loops exist: a
1.8s `pulse` on status dots and the work logo, and a 2.4s linear
`ds-shiny-text` shimmer on streaming text. The composer never animates.
Rows with many cells never animate on hover. Reduced-motion support is a known
TODO in the source.

---

## 9. Layout grammar

Every screen follows the same macro-grammar:

- **Topbar** - translucent, draggable strip (back button, session title, mode
  switcher, right action cluster). Interactive elements opt out with
  `.ds-no-drag`.
- **Left sidebar** - workspace roots / channels / spaces. Collapsible,
  drag-resizable, 268px default.
- **Center column** - the work surface (message timeline or editor). Never
  bleeds into the sidebars.
- **Right inspector** - optional, context-driven (Changes, Todo, Plan, File,
  Write/SDD Assistant). 360px default, drag-resizable.

A new screen should fit this grammar. If it cannot, the grammar needs to grow,
and the change goes in this file first.

---

## 10. On-brand checklist

Before shipping a new screen:

- [ ] Sits in the three-pane + topbar grammar (or explicitly extends it here).
- [ ] References `--ds-*` tokens only, never primitives.
- [ ] Uses only the four color families (neutral, accent, status, skill/diff).
- [ ] Uses only the three font families and the documented size rhythm.
- [ ] Uses the radius ladder (no square clickables, no pill cards).
- [ ] Uses elevation tiers, not custom shadows.
- [ ] Every interactive element has a focus ring (`ring-1 ring-accent/30`).
- [ ] Works in both light and dark without per-screen overrides.
- [ ] Strings ship in both `zh` and `en` locale files.
- [ ] No emoji, no marketing copy, no recolored disabled state.
