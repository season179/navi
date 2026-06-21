---
name: navi-release-notes
description: Draft concise, user-facing release notes from a git diff or a list of commits. Use when the user asks for release notes, changelog entries, or "what changed" summaries.
---

# Release notes

Write release notes that a non-engineer can read.

## Steps

1. If the user gave a range (e.g. `v1.2.0..HEAD`), run `git log <range>` and `git diff <range> --stat` to see what changed. If they gave prose, work from that.
2. Group changes by audience-meaningful buckets, not by file:
   - **New** — things that didn't exist before.
   - **Changed** — existing behavior that's different now.
   - **Fixed** — bugs and papercaps resolved.
   - **Removed** — gone in this version.
   Drop any bucket that has nothing.
3. Write one bullet per change. Lead with the user-visible outcome, not the implementation. "You can now drag tabs to reorder them" — not "reorder-tabs.tsx now accepts an index prop".
4. Keep each bullet to one line. If a change needs context, add a short clause after an em dash, never a second sentence.
5. Omit internal refactors, dependency bumps, test-only changes, and anything with no user impact unless the user asks for the full set.

## Format

```
## <version or "Latest">

### New
- …

### Changed
- …

### Fixed
- …
```

If there's no version yet, use "Latest" as the heading. Don't invent version numbers.

## Voice

Plain, present tense, second person. No marketing words ("powerful", "seamless"). No exclamation marks. If a change has a caveat that matters to the user, say it directly in the bullet.
