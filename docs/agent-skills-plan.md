# Agent Skills for navi — plan

**Status:** Agreed by Claude + pi (de-phased, UI/UX in scope). pi sign-off: `AGREED`.
**Date:** 2026-06-21
**Scope model:** Single-owner app → no phases, no partial milestones. The "Definition
of done" below is one boolean: it's all true, or it isn't done.

This plan describes how navi (Electron app wrapping the Flue agent harness) gains
"agent skills" — and why navi should **not** copy Kun's backend implementation.
Kun is navi's reference only for **UI/UX**; the backends differ (navi = Flue).

---

## TL;DR — the central finding

**Flue already implements the [Agent Skills spec](https://agentskills.io/specification) natively.**
Kun built a whole bespoke skill subsystem because Kun runs on its *own* agent runtime
that predates/ignores the spec. navi runs on Flue, which gives most of that subsystem
for free. So navi's job is to **wire up Flue's native skills and build a Kun-style UI
around them** — not to rebuild Kun's engine.

Verified directly in code:
- `node_modules/@flue/runtime/docs/guide/skills.md` — the native skills guide.
- `@flue/cli/dist/flue.js` — `flue build` inlines imported skills as base64 into a
  virtual module baked into `dist/server.mjs` (`packageSkill` → `registerPackagedSkill`
  → `getPackagedSkills()`).
- `@flue/runtime/dist/...` — `AgentConfig.systemPrompt` is *"Discovered from AGENTS.md
  + .agents/skills/"*; the runtime catalog = `mergeSkillCatalog(definitionSkills,
  discoverLocalSkills(cwd))`. **Flue injects the skills catalog into the system prompt
  itself.**

---

## How Kun does it (reference)

Backend (NOT ported): a skill is a directory with `skill.json`/legacy `SKILL.md`,
discovered from `.agents/.claude/.codex/skills` roots, surfaced via a hand-built catalog
+ trigger engine + `load_skill` tool + `allowedTools` enforcement. Flue covers all of
this, so porting it would *fight* the framework.

UI/UX (the part we DO port, adapted): three front-end surfaces —
1. **Settings panel** listing skills with scope badges + enable/disable + open-file.
2. **Skill creator / templates** — name+description+body writes a `SKILL.md`; one-click
   "Add" for recommended starters.
3. **Composer `/skill:<id>` picker** — pick a skill from a `/` menu; injects its prompt.

---

## What Flue gives navi natively (verified)

| Capability | Mechanism |
|---|---|
| Spec `SKILL.md` format + frontmatter validation | built in |
| **Built-in / bundled skills** | `import x from '../skills/x/SKILL.md' with { type: 'skill' }` → `createAgent(() => ({ skills: [x] }))`; inlined into `dist/server.mjs` at build |
| **Workspace skills** | auto-discovered under `<cwd>/.agents/skills/` at runtime, no import |
| Catalog in system prompt | Flue assembles it from registered + discovered skills |
| Explicit invocation (workflows) | `session.skill(name)` |

Constraints that shape the design:
- **C1.** The only *runtime-dynamic* skill path is `<cwd>/.agents/skills/`. The
  `skills:[...]` array is **build-time/static**.
- **C2.** A registered skill needs **both** a `SkillReference` and matching
  `PackagedSkillDirectory` content, host-seeded inside the generated `server.mjs`
  (not from the `createAgent` factory). navi already patches `server.mjs`
  (`scripts/patch-flue-server.mjs`).
- **C3.** A **same-name** imported skill and discovered workspace skill = **hard
  init failure**.
- **C4.** navi's agent (`.flue/agents/navi-assistant.ts`): no-project "plain chat"
  has **no cwd / no sandbox**; project chats bind `cwd = project dir` with `sandbox: local()`.

---

## Decisions (the full scope)

- **D1. Use Flue native; do NOT rebuild Kun's runtime.** No `skill.json`, no zod
  manifest, no trigger engine, no `load_skill` tool, no hand-built catalog.
- **D2. Skill format = spec `SKILL.md`.** `name` must equal the directory name
  (lowercase/digits/hyphens, ≤64); `description` required. Portable with Kun-legacy and
  Claude Code skills.
- **D3. Three skill sources:**
  - **(A) Built-in / bundled** — `src/skills/navi-<name>/SKILL.md` imported and passed
    in `skills:[...]`. Available in **every** conversation, including no-project chat.
  - **(B) Project** — Flue auto-discovers `<project-cwd>/.agents/skills/`. Free — but
    only when a project is open (C4).
  - **(C) User global** — a navi-owned library (`userData/skills/<name>/SKILL.md`),
    managed in-app, available in every conversation.
- **D4. Invocation = trust the agent.** Flue injects the catalog; the model loads/follows
  skills as needed. No trigger engine. The composer `/skill` picker (D6) is a UI shortcut
  that injects a "use the X skill" hint into the message — not a backend trigger.
- **D5. User global skills (C) load via the `packagedSkills` seam.** Extend
  `scripts/patch-flue-server.mjs` so the generated `server.mjs` seeds Flue's
  `packagedSkills` (+ synthesized `SkillReference`s) from `userData/skills/`. This works
  cross-mode (incl. no-project chat) with no repo pollution. **Fallback** if the internal
  seam proves unworkable: materialize enabled global skills as symlinks into the effective
  `<cwd>/.agents/skills/` (a runtime-cwd symlink is outside Flue's packaging, so allowed;
  depends on the symlink-discovery probe).
- **D6. UI/UX — Kun-style, adapted to Flue.**
  - **Skills panel** (in Settings): **skill-centric** cards (name, description, source
    badge: Built-in / Project / Global), open-file, empty state, click-to-view the
    `SKILL.md` body (a detail view Kun lacks).
  - **Enable/disable is global-only.** Flue has no disable hook: built-in skills are
    always-on (rebuild to remove); project skills are on whenever the project is open;
    only global skills (navi-materialized) can be toggled. The panel must be **visually
    honest** — a project skill reads as "active because this project is open," never as an
    untoggled global. Do not render a fake toggle anywhere it has no effect.
  - **Custom-skill creator**: name + description + body → writes
    `userData/skills/<name>/SKILL.md`; plus one-click **starter templates**.
  - **Composer `/skill` picker**: a `/` menu of available skills (with scope badge) that
    injects a hint into the message. Front-end only.
  - **Skip** (Kun has, navi doesn't need): root/directory-centric management; search/filter
    until skill counts justify it.
  - Hooks already exist: encrypted settings, the `server.mjs` patch point, the IPC bridge.
- **D7. Namespace built-ins `navi-*`** so a bundled skill can never collide-by-name with a
  project or global skill (C3 is a hard init failure). Enforce with a test.

---

## Unknowns to prove during the build (not a gate)

These are the genuinely uncertain mechanics. Prove them as throwaway spikes **while
building** — not as a sequenced milestone that delays everything else (pi's note:
gating on them is just phasing through another door). The risky one (the `packagedSkills`
seam) has a defined fallback, so it can't block "done."
1. **Auto-load:** a `SKILL.md` under a project's `.agents/skills/` is actually picked up
   and used (test with a *project* open — C4).
2. **Bundled import survives build:** a `src/skills/` import survives `flue build` **and**
   `patch-flue-server.mjs`, and is available in a no-project chat.
3. **`packagedSkills` seam (D5):** runtime-seeded global skills load. If not → symlink fallback.
4. **Symlink discovery + same-name fail:** discovery follows symlinks (decides the
   fallback); reproduce C3 to lock the `navi-*` namespacing test.

---

## Key risks
- **`packagedSkills` is an internal Flue API:** isolate it behind the one patch point,
  document the symlink fallback, re-verify on every Flue upgrade (versions are pinned).
- **`patch-flue-server.mjs` coupling:** D5 extends an already-fragile post-build patch.
- **Name collision (C3):** mitigated by D7 (`navi-*` + test).

---

## What we explicitly are NOT doing
- Not porting Kun's `skill.json` manifest, zod schema, or trigger engine.
- Not building a `load_skill` tool (Flue's loading subsumes it).
- Not building a hand-rolled system-prompt catalog (Flue does it).
- Not enforcing `allowed-tools` (spec marks it accepted-not-enforced; Flue follows that).

---

## Definition of done (the boolean)
- [ ] Built-in `navi-*` skills bundled via `skills:[...]`, present in every conversation.
- [ ] Project skills under `<cwd>/.agents/skills/` auto-load when a project is open.
- [ ] User global skills in `userData/skills/` load in every conversation (via D5 seam or fallback).
- [ ] Skills panel: skill-centric cards, source badges, SKILL.md detail view, honest state (no fake toggles).
- [ ] Custom-skill creator + starter templates write valid `SKILL.md`.
- [ ] Global skills can be enabled/disabled and it actually takes effect.
- [ ] Composer `/skill` picker injects a hint.
- [ ] `navi-*` namespacing enforced by a test; no same-name init failures.
