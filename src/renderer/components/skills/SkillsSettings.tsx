// Skills settings panel (plan §D6). Skill-centric master/detail mirroring the
// ProvidersSettings layout, adapted to Flue's three sources:
//
// Left list — every skill with a source badge + honest enable state:
//   • built-in → always on; "always on" label, no toggle (rebuild to remove).
//   • project  → on while its project is open; "active in <project>" label, no
//                toggle. We never render a fake toggle where none has effect.
//   • global   → real toggle (persisted; takes effect on next restart).
// Right detail — full SKILL.md body (a view Kun lacks), source badge, open-file,
//   and for global skills: edit / delete.
//
// Honesty rule (§D6): a project skill must read as "active because this project
// is open", never as an untoggled global. Built-ins read as "always on". Only
// globals get a working toggle. The state badge + toggle presence encode this.

import { useCallback, useEffect, useState } from 'react'
import { Plus, X, Trash2, Pencil, FileText, Check } from 'lucide-react'
import type { SkillDetail, SkillDraft, SkillSource, SkillSummary } from '../../../shared/flue'
import { SKILL_STARTERS } from '../../../shared/flue'
import { SkillEditor } from './SkillEditor'

interface SkillsSettingsProps {
  /** Active project's cwd, or undefined for no-project chat (scopes project skills). */
  projectPath?: string
  onClose: () => void
}

// The badge label + class for a source. Global additionally carries its enable
// state; built-in/project are contextual-only.
function badge(s: SkillSummary): { label: string; cls: string } {
  if (s.source === 'built-in') return { label: 'Built-in', cls: 'skill-badge--built-in' }
  if (s.source === 'project') return { label: 'Project', cls: 'skill-badge--project' }
  return { label: s.availableNow ? 'Global · on' : 'Global · off', cls: 'skill-badge--global' }
}

// One-line state explanation under a card — the "honest" surface (§D6).
function stateLine(s: SkillSummary): string {
  if (s.source === 'built-in') return 'Always on in every conversation.'
  if (s.source === 'project') return 'Active while this project is open.'
  return s.availableNow ? 'Enabled — loads in every conversation.' : 'Disabled.'
}

const DRAFT = '__draft__'

export function SkillsSettings({ projectPath, onClose }: SkillsSettingsProps) {
  const [skills, setSkills] = useState<SkillSummary[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [selectedSource, setSelectedSource] = useState<SkillSource | null>(null)
  const [detail, setDetail] = useState<SkillDetail | null>(null)
  const [editing, setEditing] = useState(false)
  const [creating, setCreating] = useState(false)
  const [busy, setBusy] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    const list = await window.navi.flue.listSkills(projectPath)
    setSkills(list)
  }, [projectPath])

  useEffect(() => {
    void refresh()
  }, [refresh])

  // Load detail when selection changes (not on every refresh — detail is heavy).
  // projectPath is forwarded so a project skill resolves against the active cwd.
  const loadDetail = useCallback(
    async (source: SkillSource, name: string) => {
      const d = await window.navi.flue.getSkill(source, name, projectPath)
      setDetail(d)
    },
    [projectPath],
  )

  const select = (s: SkillSummary) => {
    setSelected(s.name)
    setSelectedSource(s.source)
    setEditing(false)
    setCreating(false)
    setError(null)
    void loadDetail(s.source, s.name)
  }

  const startCreate = () => {
    setAddOpen(false)
    setCreating(true)
    setEditing(false)
    setError(null)
    setSelected(DRAFT)
    setSelectedSource(null)
    setDetail(null)
  }

  const startStarter = (draft: SkillDraft) => {
    setAddOpen(false)
    setError(null)
    // Create the starter immediately, then drop the user on its detail view so
    // they can edit it. A starter whose name is already taken (e.g. the user
    // added it once before) fails server-side; surface that instead of silently
    // doing nothing.
    void window.navi.flue.createGlobalSkill(draft).then(async (res) => {
      if (!res.ok) {
        setError(res.error ?? `Could not add “${draft.name}”.`)
        return
      }
      await refresh()
      setCreating(false)
      setSelected(draft.name)
      setSelectedSource('global')
      void loadDetail('global', draft.name)
    })
  }

  const startEdit = () => {
    if (!detail || detail.source !== 'global') return
    setEditing(true)
    setCreating(false)
  }

  const handleCreate = async (draft: SkillDraft) => {
    const res = await window.navi.flue.createGlobalSkill(draft)
    if (!res.ok) return res
    await refresh()
    setCreating(false)
    setSelected(draft.name)
    setSelectedSource('global')
    void loadDetail('global', draft.name)
    return res
  }

  const handleUpdate = async (draft: SkillDraft) => {
    if (!detail) return { ok: false, error: 'No skill selected.' }
    const res = await window.navi.flue.updateGlobalSkill(detail.name, {
      description: draft.description,
      body: draft.body,
    })
    if (!res.ok) return res
    await refresh()
    setEditing(false)
    void loadDetail('global', detail.name)
    return res
  }

  const handleDelete = async () => {
    if (!detail || detail.source !== 'global') return
    setBusy(true)
    await window.navi.flue.deleteGlobalSkill(detail.name)
    setBusy(false)
    setSelected(null)
    setSelectedSource(null)
    setDetail(null)
    await refresh()
  }

  const handleToggle = async (s: SkillSummary, enabled: boolean) => {
    if (s.source !== 'global') return // only globals toggle
    await window.navi.flue.setGlobalSkillEnabled(s.name, enabled)
    await refresh()
    if (selected === s.name && selectedSource === 'global') void loadDetail('global', s.name)
  }

  const handleOpenFile = () => {
    if (!detail) return
    void window.navi.flue.openSkillFile(detail.source, detail.name)
  }

  const groups: { source: SkillSource; title: string; items: SkillSummary[] }[] = [
    { source: 'built-in', title: 'Built-in', items: skills.filter((s) => s.source === 'built-in') },
    { source: 'global', title: 'Global', items: skills.filter((s) => s.source === 'global') },
    { source: 'project', title: 'Project', items: skills.filter((s) => s.source === 'project') },
  ]

  return (
    <div className="providers-panel skills-panel">
      <header className="providers-head">
        <div className="providers-title">Skills</div>
        <div className="providers-head-actions">
          <div className="add-provider">
            <button className="btn btn-secondary" onClick={() => setAddOpen((v) => !v)}>
              <Plus />
              Add skill
            </button>
            {addOpen ? (
              <div className="add-provider-menu" role="menu">
                {SKILL_STARTERS.map((s) => (
                  <button key={s.name} role="menuitem" onClick={() => startStarter(s)}>
                    {s.name}
                    <span className="menu-item-desc">{s.description}</span>
                  </button>
                ))}
                <button role="menuitem" onClick={startCreate}>
                  Custom…
                </button>
              </div>
            ) : null}
          </div>
          <button className="apikey-close" onClick={onClose} aria-label="Close" title="Close">
            <X />
          </button>
        </div>
      </header>

      <div className="providers-body">
        {error ? <div className="apikey-error skills-panel-error">{error}</div> : null}
        <aside className="providers-list skills-list">
          {skills.length === 0 && !creating ? (
            <div className="providers-list-empty">No skills yet. Add one to start.</div>
          ) : null}
          {groups.map((g) =>
            g.items.length === 0 ? null : (
              <div key={g.source} className="skill-group">
                <div className="skill-group-label">{g.title}</div>
                {g.items.map((s) => {
                  const b = badge(s)
                  const isActive = selected === s.name && selectedSource === s.source
                  return (
                    <button
                      key={s.name}
                      className={isActive ? 'provider-card skill-card is-active' : 'provider-card skill-card'}
                      onClick={() => select(s)}
                    >
                      <span className="skill-card-main">
                        <span className="provider-card-name">{s.name}</span>
                        <span className={`skill-badge ${b.cls}`}>{b.label}</span>
                      </span>
                      <span className="skill-card-state">{stateLine(s)}</span>
                      {s.canToggle ? (
                        <span
                          className={s.availableNow ? 'skill-toggle is-on' : 'skill-toggle'}
                          role="switch"
                          aria-checked={s.availableNow}
                          // Stop propagation so the click toggles, not selects.
                          onClick={(e) => {
                            e.stopPropagation()
                            void handleToggle(s, !s.availableNow)
                          }}
                          title={s.availableNow ? 'Disable' : 'Enable'}
                        >
                          <span className="skill-toggle-knob" />
                        </span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            ),
          )}
          {creating ? (
            <div className="provider-card is-active is-draft">
              <span className="provider-card-name">New global skill</span>
              <span className="provider-card-count">new</span>
            </div>
          ) : null}
        </aside>

        <section className="provider-detail skill-detail-pane">
          {creating ? (
            <SkillEditor onSave={handleCreate} onCancel={() => { setCreating(false); setSelected(null) }} />
          ) : editing && detail ? (
            <SkillEditor
              initial={{ name: detail.name, description: detail.description, body: detail.body }}
              onSave={handleUpdate}
              onCancel={() => setEditing(false)}
            />
          ) : !detail ? (
            <div className="provider-detail-empty">
              Select a skill to read its instructions, or add one.
            </div>
          ) : (
            <>
              <div className="skill-detail-head">
                <div className="skill-detail-title">
                  {detail.name}
                  <span className={`skill-badge ${badge(detail).cls}`}>{badge(detail).label}</span>
                </div>
                <div className="skill-detail-state">{stateLine(detail)}</div>
              </div>

              <div className="skill-detail-actions">
                <button className="btn btn-secondary" onClick={handleOpenFile} title="Show in folder">
                  <FileText />
                  Show file
                </button>
                {detail.source === 'global' ? (
                  <>
                    <button className="btn btn-secondary" onClick={startEdit} disabled={busy}>
                      <Pencil />
                      Edit
                    </button>
                    <button
                      className="btn btn-secondary danger"
                      onClick={handleDelete}
                      disabled={busy}
                    >
                      <Trash2 />
                      Delete
                    </button>
                  </>
                ) : null}
                {detail.source === 'global' ? (
                  <button
                    className="btn btn-secondary"
                    onClick={() => void handleToggle(detail, !detail.availableNow)}
                  >
                    <Check />
                    {detail.availableNow ? 'Disable' : 'Enable'}
                  </button>
                ) : null}
              </div>

              <div className="skill-detail-desc">{detail.description}</div>
              <pre className="skill-detail-body">{detail.body}</pre>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
