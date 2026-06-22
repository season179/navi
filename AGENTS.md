Personal-use Electron app.
Use deepwiki for package/library docs.
Use agent-browser to test it.
No flaky tests; every test must protect something real.
Kun (`/Users/season/Personal/Kun`) is the reference app: when asked to look at it, it's almost always for UI/UX or Electron-app patterns, not its backend/runtime.
**For anything UI/UX, align with Kun as much as possible** — match its components, layout, interactions, and navigation patterns, and port its solutions directly rather than reinventing them. (navi's backend is Flue, so backend/runtime code does NOT follow Kun.)

## Components
- **Never delete components.** Treat everything under `src/renderer/components/` as permanent — even a component that looks unused (a ported Kun-parity twin, a preview-only specimen, or an older variant) may be wired up later. When replacing one component with another, rewire the imports and **leave the old file in place**; do not delete it.
- **Preview/production twin pattern.** Many UI surfaces have two components: a faithful Kun *preview twin* (visual-only, mock-data, rendered via `?…Preview` URL params in `routes/home.tsx`) and a *production twin* wired to real data (e.g. `MessageTimeline` vs `ChatThread`, `FloatingComposer` vs `Composer`, `FloatingComposerModelPicker` vs `FloatingModelPicker`). Keep both. The preview twin is the closest in-repo reference for Kun's look — when closing a visual gap, align the production twin's markup/classes to the preview twin (and to Kun's source) rather than swapping files.
- **Folder layout.** Components are grouped by feature under `src/renderer/components/`: `app/` (shell + onboarding), `chat/` (timeline + composer + chat shell), `sidebar/`, `claw/`, `workbench/`, `runtime/`, `plan/`, `sdd/`, `schedule/`, `write/`, `terminal/`, `todo/`, `plugins/`, `settings/` (all `*SettingsSection` plus `settings/providers/` and `settings/skills/`), and `common/` (shared renderers/primitives: Markdown, CodeBlock, DiffView, Mascot, …). Put a new component with the feature that owns it; only truly shared primitives go in `common/`.

## pi (collaborating coding agent)
`pi` is preconfigured — never set `--model`/`--thinking`/`--provider`/`--api-key`. Flags: `--tools read,grep,find,ls` (read-only), `--session-id <id>` (continuity), `--wt` (worktree).
- Put any non-trivial prompt in a file: `pi -p @/abs/prompt.txt`. Inline `pi -p "…"` with symbols (`{} <> [] '' "" => ~ $`) hangs (shell mangles it); only bare prose is safe inline.
- Output buffers until exit, so an empty output file ≠ stalled. For long runs use plain text + a `timeout` cap.
