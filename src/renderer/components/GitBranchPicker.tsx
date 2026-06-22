// Git branch picker echoing Kun's GitBranchPicker
// (../Kun/src/renderer/src/components/chat/GitBranchPicker.tsx).
// Visual only: parent supplies a branch snapshot; no git backend wiring.

import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react'
import { AlertCircle, Check, ChevronDown, GitBranch, Loader2, Plus, Search } from 'lucide-react'
import {
  formatGitCreateNamedBranchLabel,
  formatGitDirtyFilesLabel,
  GIT_BRANCH_LABEL,
  GIT_BRANCH_LOADING_LABEL,
  GIT_BRANCHES_SECTION_LABEL,
  GIT_CREATE_BRANCH_LABEL,
  GIT_NO_BRANCHES_LABEL,
  GIT_SEARCH_BRANCHES_PLACEHOLDER,
  resolveGitBranchTriggerLabel,
} from '../lib/composerGitBranch'

export type GitBranchEntry = {
  name: string
  current?: boolean
}

export type GitBranchesSnapshot =
  | {
      ok: true
      currentBranch: string
      branches: GitBranchEntry[]
      dirtyCount?: number
    }
  | {
      ok: false
      message: string
    }

type Props = {
  snapshot: GitBranchesSnapshot | null
  loading?: boolean
  /** When set, simulates branch switching for preview interactions. */
  onSwitchBranch?: (branch: string) => void
}

/** Sample branches for ?gitBranchPickerPreview=1 visual verification. */
export const GIT_BRANCH_PICKER_PREVIEW: GitBranchesSnapshot = {
  ok: true,
  currentBranch: 'gnhf/kun-look-for-a-ui-co-a655f3',
  dirtyCount: 3,
  branches: [
    { name: 'main' },
    { name: 'gnhf/kun-look-for-a-ui-co-a655f3', current: true },
    { name: 'feature/context-popover' },
    { name: 'fix/composer-footer' },
  ],
}

/** Error snapshot for ?gitBranchPickerPreview=error visual verification. */
export const GIT_BRANCH_PICKER_PREVIEW_ERROR: GitBranchesSnapshot = {
  ok: false,
  message: 'Not a git repository',
}

export function GitBranchPicker({
  snapshot,
  loading = false,
  onSwitchBranch,
}: Props): ReactElement | null {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [actingBranch, setActingBranch] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(
    snapshot && !snapshot.ok ? snapshot.message : null,
  )
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const branches = useMemo(
    () => (snapshot?.ok ? snapshot.branches : []),
    [snapshot],
  )
  const filteredBranches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return branches
    return branches.filter((branch) => branch.name.toLowerCase().includes(q))
  }, [branches, query])

  const exactBranchExists = branches.some((branch) => branch.name === query.trim())
  const canCreate = query.trim().length > 0 && !exactBranchExists
  const currentBranch = snapshot?.ok ? snapshot.currentBranch : null
  const label = resolveGitBranchTriggerLabel({
    currentBranch,
    snapshotOk: snapshot?.ok === true,
  })

  useEffect(() => {
    if (!snapshot) return
    setError(snapshot.ok ? null : snapshot.message)
  }, [snapshot])

  useEffect(() => {
    if (!open) return
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent): void => {
      const target = event.target
      if (target instanceof Node && wrapRef.current?.contains(target)) return
      setOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const switchBranch = (branch: string): void => {
    if (!branch || branch === currentBranch) {
      setOpen(false)
      return
    }
    setActingBranch(branch)
    setError(null)
    window.setTimeout(() => {
      onSwitchBranch?.(branch)
      setActingBranch(null)
      setOpen(false)
      setQuery('')
    }, 450)
  }

  const createBranch = (): void => {
    const branch = query.trim()
    if (!branch) return
    switchBranch(branch)
  }

  if (!snapshot && !loading) return null

  return (
    <div ref={wrapRef} className="git-branch-picker">
      <button
        type="button"
        className="git-branch-picker-trigger"
        onClick={() => setOpen((value) => !value)}
        title={GIT_BRANCH_LABEL}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <GitBranch strokeWidth={1.8} />
        <span className="git-branch-picker-label">{label}</span>
        {loading ? (
          <Loader2 className="git-branch-picker-spinner" strokeWidth={2} />
        ) : (
          <ChevronDown className="git-branch-picker-chevron" strokeWidth={2} />
        )}
      </button>

      {open ? (
        <div className="git-branch-picker-menu" role="listbox">
          <div className="git-branch-picker-search">
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
                if (e.key === 'Enter' && canCreate) {
                  e.preventDefault()
                  createBranch()
                }
              }}
              placeholder={GIT_SEARCH_BRANCHES_PLACEHOLDER}
              aria-label={GIT_SEARCH_BRANCHES_PLACEHOLDER}
            />
          </div>

          <div className="git-branch-picker-list">
            <div className="git-branch-picker-section-label">{GIT_BRANCHES_SECTION_LABEL}</div>

            {loading && (!snapshot || !snapshot.ok) ? (
              <div className="git-branch-picker-loading">
                <Loader2 strokeWidth={2} />
                {GIT_BRANCH_LOADING_LABEL}
              </div>
            ) : null}

            {error ? (
              <div className="git-branch-picker-error">
                <AlertCircle strokeWidth={2} />
                <span>{error}</span>
              </div>
            ) : null}

            {filteredBranches.map((branch) => (
              <button
                key={branch.name}
                type="button"
                role="option"
                aria-selected={branch.current === true || branch.name === currentBranch}
                className="git-branch-picker-row"
                onClick={() => switchBranch(branch.name)}
                disabled={actingBranch != null}
              >
                <GitBranch strokeWidth={1.8} />
                <span className="git-branch-picker-row-body">
                  <span className="git-branch-picker-row-name">{branch.name}</span>
                  {branch.current && snapshot?.ok && (snapshot.dirtyCount ?? 0) > 0 ? (
                    <span className="git-branch-picker-row-meta">
                      {formatGitDirtyFilesLabel(snapshot.dirtyCount ?? 0)}
                    </span>
                  ) : null}
                </span>
                {actingBranch === branch.name ? (
                  <Loader2 className="git-branch-picker-row-spinner" strokeWidth={2} />
                ) : branch.current || branch.name === currentBranch ? (
                  <Check className="git-branch-picker-row-check" strokeWidth={2} />
                ) : null}
              </button>
            ))}

            {!loading && snapshot?.ok && filteredBranches.length === 0 ? (
              <div className="git-branch-picker-empty">{GIT_NO_BRANCHES_LABEL}</div>
            ) : null}
          </div>

          <div className="git-branch-picker-footer">
            <button
              type="button"
              disabled={!canCreate || actingBranch != null}
              className="git-branch-picker-create"
              onClick={createBranch}
            >
              {actingBranch === query.trim() ? (
                <Loader2 strokeWidth={2} />
              ) : (
                <Plus strokeWidth={1.9} />
              )}
              <span>
                {query.trim()
                  ? formatGitCreateNamedBranchLabel(query.trim())
                  : GIT_CREATE_BRANCH_LABEL}
              </span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
