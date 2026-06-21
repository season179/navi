---
name: navi-commit-message
description: Write a Conventional Commits message for staged or recent changes. Use when the user asks for a commit message, a PR title, or a one-line summary of a change.
---

# Commit message

Produce a Conventional Commits message that matches what the change actually does.

## Steps

1. Look at the diff. Prefer `git diff --cached` (staged) unless the user said otherwise. If nothing is staged, fall back to `git diff` and say so.
2. Pick exactly one type:
   - `feat` — new user-facing capability.
   - `fix` — bug fix.
   - `refactor` — internal change with no behavior delta.
   - `perf` — performance improvement.
   - `docs` — documentation only.
   - `test` — tests only.
   - `chore` — tooling, deps, build, anything non-productive.
   - `build` / `ci` — build system or CI config.
3. Decide a scope only when the codebase clearly uses one (a monorepo package, a well-known module). Otherwise omit it. Never invent a scope that doesn't appear elsewhere in the history.

## Format

```
<type>(<scope>): <imperative summary>

<optional body — why, not what>
```

## Rules

- The summary is lowercase, imperative mood, no trailing period, ≤72 chars.
- It describes the change, not the task ("add retry on 429", not "handle rate limiting issue").
- If the diff does several unrelated things, say so and suggest splitting — do not mash them into one type.
- The body, if present, explains motivation and trade-offs in plain prose. Wrap at 72 chars. Leave a blank line between summary and body, and between body paragraphs.

## Output

Give the message in a fenced block, ready to paste. If the change is trivially small, a one-line message is fine — don't pad.
