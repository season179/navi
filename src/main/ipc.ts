// IPC bridge between the renderer and the Flue backend. The renderer calls
// these via the preload-exposed window.navi.flue API; the main process owns the
// SDK client and the bearer token, so the renderer only ever sees plain text.

import { BrowserWindow, dialog, ipcMain, shell } from 'electron'
import { promises as fs } from 'fs'
import path from 'path'
import type {
  DefaultSelection,
  FlueStatus,
  FlueStreamMessage,
  PersistedMessage,
  ProviderProfile,
  ReasoningLevel,
  SkillDetail,
  SkillDraft,
  SkillSource,
  SkillSummary,
} from '../shared/flue'
import { BUILT_IN_SKILLS } from '../shared/flue'
import { parseSkillMarkdown } from '../shared/skill-md'
import { flueBackend } from './flue-backend'
import {
  deleteProvider,
  getProviderKey,
  listProviders,
  setDefaultSelection,
  getDefaultSelection,
  setProviderKey,
  upsertProvider,
} from './settings'
import { probeProvider, type ProbeRequest } from './provider-probe'
import {
  listConversations,
  getConversation,
  saveConversation,
  deleteConversation,
  setActiveModel,
  setReasoning,
  clearProviderPointers,
  listProjects,
  createProject,
  deleteProject,
} from './conversations'
import {
  listGlobalSkills,
  readGlobalSkill,
  writeGlobalSkill,
  deleteGlobalSkill,
  setGlobalSkillEnabled,
} from './skills'

function broadcast(channel: string, payload: FlueStreamMessage | FlueStatus) {
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) win.webContents.send(channel, payload)
  }
}

let registered = false

export function registerFlueIpc(): void {
  if (registered) return
  registered = true

  flueBackend.onStream((msg) => broadcast('flue:event', msg))
  flueBackend.onStatus((status) => broadcast('flue:status-changed', status))

  ipcMain.handle('flue:status', () => flueBackend.status())

  ipcMain.handle('flue:send', async (_evt, conversationId: string, message: string) => {
    return flueBackend.send(conversationId, message)
  })

  ipcMain.handle('flue:cancel', (_evt, requestId: string) => {
    flueBackend.cancel(requestId)
  })

  // --- Multi-provider ---

  ipcMain.handle('providers:list', () => listProviders())

  // Create/replace a provider (+ optional key), then restart so registerProvider
  // (boot-only) picks it up.
  ipcMain.handle(
    'providers:upsert',
    async (_evt, profile: ProviderProfile, apiKey?: string) => {
      try {
        await upsertProvider(profile)
        if (apiKey && apiKey.trim()) await setProviderKey(profile.id, apiKey)
        await flueBackend.restart()
        return { ok: true }
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : String(err) }
      }
    },
  )

  ipcMain.handle('providers:delete', async (_evt, id: string) => {
    try {
      await deleteProvider(id)
      await clearProviderPointers(id) // cascade-clear stale conversation pointers (§F1d)
      await flueBackend.restart()
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  ipcMain.handle('providers:getDefault', () => getDefaultSelection())

  ipcMain.handle('providers:setDefault', async (_evt, sel: DefaultSelection) => {
    await setDefaultSelection(sel)
    // Refresh NAVI_DEFAULT_MODEL/_REASONING in the child. A restart failure (e.g.
    // the ready-timeout) is reported via the status emitter, so swallow it here
    // rather than rejecting the invoke — this handler returns void and the
    // renderer's awaited call has no catch (unlike the upsert/delete handlers).
    try {
      await flueBackend.restart()
    } catch {
      // surfaced through the 'status' event (lastError / ready=false)
    }
  })

  // Probe with the request's key, or fall back to the stored key for an
  // existing provider so "Test connection" works without re-entering it.
  ipcMain.handle('providers:probe', async (_evt, req: ProbeRequest) => {
    let apiKey = req.apiKey
    if (!apiKey?.trim() && req.id) {
      const k = await getProviderKey(req.id)
      if (k.state === 'ok') apiKey = k.key
    }
    return probeProvider({ ...req, apiKey })
  })

  // Per-conversation selection — store pointers only; NO restart.
  ipcMain.handle(
    'conversations:setActiveModel',
    (_evt, id: string, providerId: string, modelId: string) =>
      setActiveModel(id, providerId, modelId),
  )

  ipcMain.handle('conversations:setReasoning', (_evt, id: string, level: ReasoningLevel) =>
    setReasoning(id, level),
  )

  ipcMain.handle('projects:list', () => listProjects())

  ipcMain.handle('projects:create', async (evt) => {
    const win = BrowserWindow.fromWebContents(evt.sender) ?? BrowserWindow.getAllWindows()[0]
    const opts = {
      title: 'Select project folder',
      properties: ['openDirectory', 'createDirectory', 'dontAddToRecent'] as (
        | 'openDirectory'
        | 'createDirectory'
        | 'dontAddToRecent'
      )[],
    }
    const res = win ? await dialog.showOpenDialog(win, opts) : await dialog.showOpenDialog(opts)
    if (res.canceled || !res.filePaths[0]) return null
    return createProject(res.filePaths[0])
  })

  ipcMain.handle('projects:delete', (_e, id: string) => deleteProject(id))

  ipcMain.handle('conversations:list', () => listConversations())

  ipcMain.handle('conversations:get', (_evt, id: string) => getConversation(id))

  ipcMain.handle(
    'conversations:save',
    (_evt, id: string, projectId: string, title: string, messages: PersistedMessage[]) =>
      saveConversation(id, projectId, title, messages),
  )

  ipcMain.handle('conversations:delete', (_evt, id: string) => deleteConversation(id))

  // --- Agent skills (plan §D3 / §D6) ----------------------------------------

  // Built-ins come from the shared catalog (mirrors the agent's imports). They
  // are always-on and never have a filesystem path the user can edit, so they
  // surface as summaries only; getSkill() reads the packaged body from the
  // bundled source so the detail view can render it.
  const builtInSummaries = (): SkillSummary[] =>
    BUILT_IN_SKILLS.map((s) => ({
      name: s.name,
      description: s.description,
      source: 'built-in' as const,
      availableNow: true,
      canToggle: false,
    }))

  // Project skills: Flue discovers <project-cwd>/.agents/skills/ itself; navi
  // only lists them here for the panel/picker. Honest state (§D6): a project
  // skill is "available now" only when its project is the active one, which the
  // renderer signals by passing projectPath. We don't parse frontmatter with
  // Flue's strictness — a malformed project skill is Flue's to skip at runtime;
  // we surface what parses with navi's parser, tolerantly. Detail bodies are
  // resolved by skills:get using the same projectPath (see handler).
  async function listProjectSkills(projectPath: string | undefined): Promise<SkillSummary[]> {
    if (!projectPath) return []
    const skillsDir = path.join(projectPath, '.agents', 'skills')
    let entries: string[]
    try {
      entries = await fs.readdir(skillsDir)
    } catch {
      return [] // no project skills dir — normal
    }
    const out: SkillSummary[] = []
    for (const entry of entries) {
      const skillDir = path.join(skillsDir, entry)
      const stat = await fs.stat(skillDir).catch(() => null)
      if (!stat?.isDirectory()) continue
      const mdPath = path.join(skillDir, 'SKILL.md')
      try {
        const raw = await fs.readFile(mdPath, 'utf8')
        const parsed = parseSkillMarkdown(raw, { directoryName: entry, path: mdPath })
        out.push({
          name: parsed.name,
          description: parsed.description,
          source: 'project',
          availableNow: true,
          canToggle: false,
        })
      } catch {
        // malformed project skill — skip (Flue skips these at runtime too)
      }
    }
    return out
  }

  ipcMain.handle('skills:list', async (_evt, projectPath?: string) => {
    const [builtIns, globals, projects] = await Promise.all([
      Promise.resolve(builtInSummaries()),
      listGlobalSkills().then((gs) =>
        gs.map<SkillSummary>((s) => ({
          name: s.name,
          description: s.description,
          source: 'global',
          availableNow: s.enabled,
          canToggle: true,
        })),
      ),
      listProjectSkills(projectPath),
    ])
    // Deterministic order: built-ins, then globals (alpha), then projects (alpha).
    // The renderer may re-sort, but stable input helps snapshots/diffs.
    return [
      ...builtIns,
      ...globals.sort((a, b) => a.name.localeCompare(b.name)),
      ...projects.sort((a, b) => a.name.localeCompare(b.name)),
    ]
  })

  ipcMain.handle(
    'skills:get',
    async (
      _evt,
      source: SkillSource,
      name: string,
      projectPath?: string,
    ): Promise<SkillDetail | null> => {
      if (source === 'global') {
        const s = await readGlobalSkill(name)
        if (!s) return null
        return {
          name: s.name,
          description: s.description,
          body: s.body,
          source: 'global',
          availableNow: s.enabled,
          canToggle: true,
          dirPath: s.dirPath,
        }
      }
      if (source === 'built-in') {
        const meta = BUILT_IN_SKILLS.find((s) => s.name === name)
        if (!meta) return null
        // Read the bundled source so the detail view shows the real body (the
        // packaged copy in dist is base64; the source is the readable original).
        const body = await readBuiltInBody(name)
        return {
          name: meta.name,
          description: meta.description,
          body,
          source: 'built-in',
          availableNow: true,
          canToggle: false,
        }
      }
      // project — resolve via the active project's skills dir. The panel passes
      // `projectPath` (it always knows the cwd); without one there's no location
      // to read from, so return null and let the renderer keep its list view.
      if (!projectPath) return null
      const skillDir = path.join(projectPath, '.agents', 'skills', name)
      const mdPath = path.join(skillDir, 'SKILL.md')
      try {
        const raw = await fs.readFile(mdPath, 'utf8')
        const parsed = parseSkillMarkdown(raw, { directoryName: name, path: mdPath })
        return {
          name: parsed.name,
          description: parsed.description,
          body: parsed.body,
          source: 'project',
          availableNow: true,
          canToggle: false,
          dirPath: skillDir,
        }
      } catch {
        // missing or malformed — Flue skips these at runtime too
        return null
      }
    },
  )

  // Built-in skill bodies live under src/skills/<name>/SKILL.md in the app
  // source. In production the app is bundled, so we resolve relative to the
  // main bundle's location (dist/main/main.cjs → ../../src/skills/...). This is
  // read-only display; the user can't edit a built-in.
  async function readBuiltInBody(name: string): Promise<string> {
    // __dirname is dist/main at runtime. The source tree ships with the app
    // (it's a dev/personal app), so the path is stable. If the source isn't
    // present (e.g. a future packaging change), return a placeholder rather
    // than crash the detail view.
    const srcPath = path.join(__dirname, '..', '..', 'src', 'skills', name, 'SKILL.md')
    try {
      const raw = await fs.readFile(srcPath, 'utf8')
      const parsed = parseSkillMarkdown(raw, { directoryName: name, path: srcPath })
      return parsed.body
    } catch {
      return '*(built-in skill body unavailable — see src/skills/' + name + '/SKILL.md)*'
    }
  }

  ipcMain.handle(
    'skills:createGlobal',
    async (_evt, draft: SkillDraft): Promise<{ ok: boolean; error?: string }> => {
      try {
        await writeGlobalSkill(draft)
        // writeGlobalSkill adds a newly-created skill to the enable list (default-
        // on, matching built-ins), even after a prior toggle materialized it.
        await flueBackend.restart()
        return { ok: true }
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : String(err) }
      }
    },
  )

  ipcMain.handle(
    'skills:updateGlobal',
    async (
      _evt,
      name: string,
      draft: { description: string; body: string },
    ): Promise<{ ok: boolean; error?: string }> => {
      try {
        // Re-read the existing skill to preserve its name, then rewrite with
        // the new description/body. writeGlobalSkill validates + re-parses.
        const existing = await readGlobalSkill(name)
        if (!existing) return { ok: false, error: 'Skill not found.' }
        await writeGlobalSkill(
          { name, description: draft.description, body: draft.body },
          { allowOverwrite: true },
        )
        await flueBackend.restart()
        return { ok: true }
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : String(err) }
      }
    },
  )

  ipcMain.handle(
    'skills:deleteGlobal',
    async (_evt, name: string): Promise<{ ok: boolean; error?: string }> => {
      try {
        await deleteGlobalSkill(name)
        await flueBackend.restart()
        return { ok: true }
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : String(err) }
      }
    },
  )

  // Toggling a global skill rewrites the enable list, then restarts so the
  // manifest is rebuilt (excludes disabled skills) and the seam re-registers.
  ipcMain.handle('skills:setEnabled', (_evt, name: string, enabled: boolean) =>
    setGlobalSkillEnabled(name, enabled).then(() => flueBackend.restart()),
  )

  // Reveal the skill's SKILL.md in the OS file manager. Built-ins have no
  // editable path; project/global do. No-op (not an error) for built-ins.
  ipcMain.handle('skills:openFile', async (_evt, source: SkillSource, name: string) => {
    let mdPath: string | undefined
    if (source === 'global') {
      const s = await readGlobalSkill(name)
      mdPath = s ? path.join(s.dirPath, 'SKILL.md') : undefined
    } else if (source === 'built-in') {
      mdPath = path.join(__dirname, '..', '..', 'src', 'skills', name, 'SKILL.md')
    }
    if (mdPath) shell.showItemInFolder(mdPath)
  })
}
