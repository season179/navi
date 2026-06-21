Personal-use Electron app.
Use deepwiki for package/library docs.
Use agent-browser to test it.
No flaky tests; every test must protect something real.
Kun (`/Users/season/Personal/Kun`) is the reference app: when asked to look at it, it's almost always for UI/UX or Electron-app patterns, not its backend/runtime.

## pi (collaborating coding agent)
`pi` is preconfigured — never set `--model`/`--thinking`/`--provider`/`--api-key`. Flags: `--tools read,grep,find,ls` (read-only), `--session-id <id>` (continuity), `--wt` (worktree).
- Put any non-trivial prompt in a file: `pi -p @/abs/prompt.txt`. Inline `pi -p "…"` with symbols (`{} <> [] '' "" => ~ $`) hangs (shell mangles it); only bare prose is safe inline.
- Output buffers until exit, so an empty output file ≠ stalled. For long runs use plain text + a `timeout` cap.
