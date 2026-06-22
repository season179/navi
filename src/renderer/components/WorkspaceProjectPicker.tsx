// Workspace project picker echoing Kun's WorkspaceProjectPicker
// (../Kun/src/renderer/src/components/chat/WorkspaceProjectPicker.tsx).
// Visual only: parent supplies a workspace snapshot; no backend wiring.

import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react'
import { Check, ChevronDown, Folder, FolderPlus, Loader2, Search } from 'lucide-react'
import {
  resolveWorkspaceProjectEmptyLabel,
  WORKSPACE_PROJECT_ADD_LABEL,
  WORKSPACE_PROJECT_SEARCH_PLACEHOLDER,
  WORKSPACE_PROJECT_SECTION_LABEL,
  WORKSPACE_PROJECT_SELECT_LABEL,
  WORKSPACE_PROJECT_WORKING_DIRECTORY_LABEL,
} from '../lib/composerWorkspaceProject'

export type WorkspaceProjectOption = {
  root: string
  label: string
  /** Parent folder, shown muted to disambiguate same-named projects. */
  context: string
}

export type WorkspaceProjectsSnapshot = {
  currentRoot: string
  options: WorkspaceProjectOption[]
}

/** Sample workspaces for ?workspaceProjectPickerPreview=1 visual verification. */
export const WORKSPACE_PROJECT_PICKER_PREVIEW: WorkspaceProjectsSnapshot = {
  currentRoot: '/Users/season/Personal/navi',
  options: [
    { root: '/Users/season/Personal/navi', label: 'navi', context: 'Personal' },
    { root: '/Users/season/Personal/Kun', label: 'Kun', context: 'Personal' },
    { root: '/Users/season/Personal/flue', label: 'flue', context: 'Personal' },
    { root: '/Users/season/Personal/gstack', label: 'gstack', context: 'Personal' },
    { root: '/Users/season/Personal/design-lab', label: 'design-lab', context: 'Personal' },
    { root: '/Users/season/Personal/other-project', label: 'other-project', context: '' },
  ],
}

/** Empty snapshot for ?workspaceProjectPickerPreview=empty visual verification. */
export const WORKSPACE_PROJECT_PICKER_PREVIEW_EMPTY: WorkspaceProjectsSnapshot = {
  currentRoot: '',
  options: [],
}

function workspaceLabelFromPath(root: string): string {
  const parts = root.replace(/[/\\]+$/, '').split(/[/\\]/).filter(Boolean)
  return parts[parts.length - 1] ?? root
}

function workspaceRootKey(root: string): string {
  return root.replace(/[/\\]+$/, '').toLowerCase()
}

type Props = {
  snapshot: WorkspaceProjectsSnapshot
  acting?: boolean
  disabled?: boolean
  /** When set, simulates workspace switching for preview interactions. */
  onSelect?: (root: string) => void
  /** When set, simulates the add-project action for preview interactions. */
  onAdd?: () => void
}

export function WorkspaceProjectPicker({
  snapshot,
  acting = false,
  disabled = false,
  onSelect,
  onAdd,
}: Props): ReactElement {
  const current = snapshot.currentRoot
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [localActing, setLocalActing] = useState(false)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const options = useMemo(() => {
    const seen = new Set<string>()
    const out: WorkspaceProjectOption[] = []
    for (const raw of [current, ...snapshot.options.map((option) => option.root)]) {
      const root = raw.replace(/[/\\]+$/, '')
      if (!root) continue
      const key = workspaceRootKey(root)
      if (seen.has(key)) continue
      seen.add(key)
      const existing = snapshot.options.find(
        (option) => workspaceRootKey(option.root) === key,
      )
      if (existing) {
        out.push(existing)
        continue
      }
      const label = workspaceLabelFromPath(root)
      out.push({ root, label, context: '' })
    }
    return out.sort((a, b) => a.label.localeCompare(b.label))
  }, [current, snapshot.options])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(q) ||
        option.root.toLowerCase().includes(q),
    )
  }, [options, query])

  const showSearch = options.length > 5
  const isActing = acting || localActing
  const label = current ? workspaceLabelFromPath(current) : WORKSPACE_PROJECT_SELECT_LABEL

  useEffect(() => {
    setOpen(false)
    setQuery('')
  }, [current])

  useEffect(() => {
    if (!open) return
    if (showSearch) window.setTimeout(() => inputRef.current?.focus(), 0)
    const onPointerDown = (event: PointerEvent): void => {
      const target = event.target
      if (target instanceof Node && wrapRef.current?.contains(target)) return
      setOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [open, showSearch])

  const handleSelect = (root: string): void => {
    if (isActing) return
    if (workspaceRootKey(root) === workspaceRootKey(current)) {
      setOpen(false)
      return
    }
    setLocalActing(true)
    window.setTimeout(() => {
      onSelect?.(root)
      setLocalActing(false)
      setOpen(false)
      setQuery('')
    }, 450)
  }

  const handleAdd = (): void => {
    if (isActing) return
    setLocalActing(true)
    window.setTimeout(() => {
      onAdd?.()
      setLocalActing(false)
      setOpen(false)
      setQuery('')
    }, 450)
  }

  return (
    <div ref={wrapRef} className="workspace-project-picker">
      <button
        type="button"
        className="workspace-project-picker-trigger"
        onClick={() => setOpen((value) => !value)}
        title={WORKSPACE_PROJECT_WORKING_DIRECTORY_LABEL}
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
      >
        <Folder strokeWidth={1.8} />
        <span className="workspace-project-picker-label">{label}</span>
        {isActing ? (
          <Loader2 className="workspace-project-picker-spinner" strokeWidth={2} />
        ) : (
          <ChevronDown className="workspace-project-picker-chevron" strokeWidth={2} />
        )}
      </button>

      {open ? (
        <div className="workspace-project-picker-menu" role="listbox">
          {showSearch ? (
            <div className="workspace-project-picker-search">
              <Search strokeWidth={1.8} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    e.preventDefault()
                    setOpen(false)
                  }
                }}
                placeholder={WORKSPACE_PROJECT_SEARCH_PLACEHOLDER}
                aria-label={WORKSPACE_PROJECT_SEARCH_PLACEHOLDER}
              />
            </div>
          ) : null}

          <div className="workspace-project-picker-list">
            <div className="workspace-project-picker-section-label">
              {WORKSPACE_PROJECT_SECTION_LABEL}
            </div>

            {filtered.map((option) => {
              const isCurrent = workspaceRootKey(option.root) === workspaceRootKey(current)
              return (
                <button
                  key={option.root}
                  type="button"
                  role="option"
                  aria-selected={isCurrent}
                  className="workspace-project-picker-row"
                  onClick={() => handleSelect(option.root)}
                  disabled={isActing}
                  title={option.root}
                >
                  <Folder strokeWidth={1.8} />
                  <span className="workspace-project-picker-row-body">
                    <span className="workspace-project-picker-row-name">{option.label}</span>
                    {option.context ? (
                      <span className="workspace-project-picker-row-context">{option.context}</span>
                    ) : null}
                  </span>
                  {isCurrent ? (
                    <Check className="workspace-project-picker-row-check" strokeWidth={2} />
                  ) : null}
                </button>
              )
            })}

            {filtered.length === 0 ? (
              <div className="workspace-project-picker-empty">
                {resolveWorkspaceProjectEmptyLabel({ hasOptions: options.length > 0 })}
              </div>
            ) : null}
          </div>

          <div className="workspace-project-picker-footer">
            <button
              type="button"
              disabled={isActing}
              className="workspace-project-picker-add"
              onClick={handleAdd}
            >
              <FolderPlus strokeWidth={1.9} />
              <span>{WORKSPACE_PROJECT_ADD_LABEL}</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
