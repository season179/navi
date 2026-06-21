// Worktree settings section echoing Kun's settings-section-worktree.tsx
// (../Kun/src/renderer/src/components/settings-section-worktree.tsx).
// Visual only: mock pool snapshots and preview modes.

import { useState, type ReactElement } from 'react'
import {
  CheckCircle2,
  GitBranch,
  GitMerge,
  Loader2,
  RefreshCw,
  Trash2,
  XCircle,
} from 'lucide-react'
import { SettingRow, SettingsCard } from './SettingsControls'

export const MAX_WORKTREE_POOL_SIZE = 3

export type WorktreeInfoSnapshot = {
  poolIndex: number
  path: string
  branch: string
  inUse: boolean
  taskId: string | null
  baseCommit: string
  changesCount: number
}

export type WorktreePoolStatusSnapshot = {
  projectPath: string
  poolDir: string
  mainBranch: string
  headCommit: string
  worktrees: WorktreeInfoSnapshot[]
  inUseCount: number
  isGitRepo: boolean
}

export type WorktreeMergeResultSnapshot = {
  success: boolean
  message: string
  conflictedFiles: string[]
}

export type WorktreeSyncResultSnapshot = {
  success: boolean
  message: string
  conflictedFiles: string[]
}

const COPY = {
  sectionWorktree: 'Worktree pool',
  worktreeOverview: 'Parallel worktree pool',
  worktreeOverviewDesc:
    'Manage isolated git worktrees for parallel agent tasks on the same repository.',
  worktreeMainBranch: 'Main branch',
  worktreeInUse: 'In use',
  worktreePoolDir: 'Pool directory',
  worktreeRefresh: 'Refresh',
  worktreeNotGitRepo: 'The selected workspace is not a git repository.',
  worktreePool: 'Pool',
  worktreeBusy: 'In use',
  worktreeIdle: 'Idle',
  worktreeEmpty: 'Empty',
  worktreeNotCreated: 'Not created',
  worktreeUncommitted: 'uncommitted',
  worktreeCreate: 'Create',
  worktreeMergeTitle: 'Merge into main',
  worktreeSyncTitle: 'Sync from main',
  worktreeRemove: 'Remove worktree',
  worktreeRelease: 'Release',
  worktreeCleanupAll: 'Remove all idle worktrees',
}

export const WORKTREE_POOL_PREVIEW: WorktreePoolStatusSnapshot = {
  projectPath: '/Users/season/Personal/navi',
  poolDir: '/Users/season/Personal/navi/.kun/worktrees',
  mainBranch: 'main',
  headCommit: 'a1b2c3d',
  inUseCount: 1,
  isGitRepo: true,
  worktrees: [
    {
      poolIndex: 0,
      path: '/Users/season/Personal/navi/.kun/worktrees/pool-0',
      branch: 'kun-pool/0',
      inUse: true,
      taskId: 'task-refactor-sidebar',
      baseCommit: 'a1b2c3d',
      changesCount: 0,
    },
    {
      poolIndex: 1,
      path: '/Users/season/Personal/navi/.kun/worktrees/pool-1',
      branch: 'kun-pool/1',
      inUse: false,
      taskId: null,
      baseCommit: 'a1b2c3d',
      changesCount: 3,
    },
  ],
}

export const WORKTREE_POOL_PREVIEW_EMPTY: WorktreePoolStatusSnapshot = {
  ...WORKTREE_POOL_PREVIEW,
  inUseCount: 0,
  worktrees: [],
}

export const WORKTREE_POOL_PREVIEW_NOT_GIT: WorktreePoolStatusSnapshot = {
  ...WORKTREE_POOL_PREVIEW,
  isGitRepo: false,
  inUseCount: 0,
  worktrees: [],
}

export const WORKTREE_MERGE_SUCCESS: WorktreeMergeResultSnapshot = {
  success: true,
  message: 'Merged pool 1 into main successfully.',
  conflictedFiles: [],
}

export const WORKTREE_MERGE_CONFLICT: WorktreeMergeResultSnapshot = {
  success: false,
  message: 'Merge failed due to conflicts.',
  conflictedFiles: [
    'src/renderer/components/Composer.tsx',
    'src/renderer/styles/app.css',
    'package.json',
    'src/renderer/routes/home.tsx',
    'README.md',
    'tsconfig.json',
  ],
}

export const WORKTREE_SYNC_SUCCESS: WorktreeSyncResultSnapshot = {
  success: true,
  message: 'Synced pool 1 from main.',
  conflictedFiles: [],
}

type Props = {
  poolStatus: WorktreePoolStatusSnapshot | null
  loading?: boolean
  error?: string | null
  lastMergeResult?: WorktreeMergeResultSnapshot | null
  lastSyncResult?: WorktreeSyncResultSnapshot | null
  busyPool?: number | null
  onRefresh?: () => void
}

function poolByIndex(
  worktrees: WorktreeInfoSnapshot[],
  index: number,
): WorktreeInfoSnapshot | undefined {
  return worktrees.find((worktree) => worktree.poolIndex === index)
}

export function WorktreeSettingsSection({
  poolStatus,
  loading = false,
  error = null,
  lastMergeResult = null,
  lastSyncResult = null,
  busyPool = null,
  onRefresh,
}: Props): ReactElement {
  const pools = poolStatus?.worktrees ?? []

  return (
    <SettingsCard title={COPY.sectionWorktree}>
      <SettingRow
        title={COPY.worktreeOverview}
        description={COPY.worktreeOverviewDesc}
        wideControl
        control={
          <div className="worktree-control">
            <div className="worktree-overview-stats">
              <div className="worktree-stat-card">
                <div className="worktree-stat-label">{COPY.worktreeMainBranch}</div>
                <div className="worktree-stat-value worktree-stat-value-mono">
                  {poolStatus?.mainBranch ?? '—'}
                </div>
              </div>
              <div className="worktree-stat-card">
                <div className="worktree-stat-label">{COPY.worktreeInUse}</div>
                <div className="worktree-stat-value worktree-stat-value-count">
                  {poolStatus?.inUseCount ?? 0} / {MAX_WORKTREE_POOL_SIZE}
                </div>
              </div>
              <div className="worktree-stat-card">
                <div className="worktree-stat-label">{COPY.worktreePoolDir}</div>
                <div
                  className="worktree-stat-value worktree-stat-value-path"
                  title={poolStatus?.poolDir}
                >
                  {poolStatus?.poolDir ?? '—'}
                </div>
              </div>
              <div className="worktree-stat-refresh">
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={loading}
                  className="worktree-refresh-btn"
                >
                  <RefreshCw
                    className={`worktree-refresh-icon ${loading ? 'worktree-refresh-icon-spin' : ''}`}
                    strokeWidth={1.8}
                  />
                  {COPY.worktreeRefresh}
                </button>
              </div>
            </div>

            {poolStatus?.isGitRepo === false ? (
              <div className="worktree-warning">{COPY.worktreeNotGitRepo}</div>
            ) : error ? (
              <div className="worktree-error">{error}</div>
            ) : null}

            <div className="worktree-pool-list">
              {Array.from({ length: MAX_WORKTREE_POOL_SIZE }, (_, index) => {
                const worktree = poolByIndex(pools, index)
                const isBusy = busyPool === index
                return (
                  <div
                    key={index}
                    className={`worktree-pool-card ${worktree?.inUse ? 'worktree-pool-card-busy' : ''}`}
                  >
                    <div className="worktree-pool-row">
                      <div className="worktree-pool-main">
                        <GitBranch className="worktree-pool-icon" strokeWidth={1.75} />
                        <div className="worktree-pool-copy">
                          <div className="worktree-pool-title-row">
                            <span>
                              {COPY.worktreePool} {index}
                            </span>
                            {worktree?.inUse ? (
                              <span className="worktree-status-badge worktree-status-badge-busy">
                                <span className="worktree-status-dot" />
                                {COPY.worktreeBusy}
                              </span>
                            ) : worktree ? (
                              <span className="worktree-status-badge worktree-status-badge-idle">
                                {COPY.worktreeIdle}
                              </span>
                            ) : (
                              <span className="worktree-status-badge worktree-status-badge-empty">
                                {COPY.worktreeEmpty}
                              </span>
                            )}
                          </div>
                          <div className="worktree-pool-path" title={worktree?.path}>
                            {worktree ? worktree.path : COPY.worktreeNotCreated}
                            {worktree && worktree.changesCount > 0 ? (
                              <span className="worktree-pool-changes">
                                · {worktree.changesCount} {COPY.worktreeUncommitted}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <div className="worktree-pool-actions">
                        {isBusy ? (
                          <Loader2
                            className="worktree-pool-spinner"
                            strokeWidth={1.8}
                          />
                        ) : null}
                        {!worktree && !isBusy ? (
                          <button type="button" className="worktree-action-text">
                            {COPY.worktreeCreate}
                          </button>
                        ) : null}
                        {worktree && !worktree.inUse && !isBusy ? (
                          <>
                            <button
                              type="button"
                              className="worktree-action-icon"
                              title={COPY.worktreeMergeTitle}
                            >
                              <GitMerge className="worktree-action-icon-svg" strokeWidth={1.8} />
                            </button>
                            <button
                              type="button"
                              className="worktree-action-icon"
                              title={COPY.worktreeSyncTitle}
                            >
                              <RefreshCw
                                className="worktree-action-icon-svg"
                                strokeWidth={1.8}
                              />
                            </button>
                            <button
                              type="button"
                              className="worktree-action-icon worktree-action-icon-danger"
                              title={COPY.worktreeRemove}
                            >
                              <Trash2 className="worktree-action-icon-svg" strokeWidth={1.8} />
                            </button>
                          </>
                        ) : null}
                        {worktree?.inUse && !isBusy ? (
                          <button type="button" className="worktree-action-text">
                            {COPY.worktreeRelease}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {lastMergeResult ? (
              <div
                className={`worktree-result ${
                  lastMergeResult.success
                    ? 'worktree-result-success'
                    : 'worktree-result-warning'
                }`}
              >
                {lastMergeResult.success ? (
                  <CheckCircle2 className="worktree-result-icon" strokeWidth={1.8} />
                ) : (
                  <XCircle className="worktree-result-icon" strokeWidth={1.8} />
                )}
                <div className="worktree-result-body">
                  <div className="worktree-result-message">{lastMergeResult.message}</div>
                  {lastMergeResult.conflictedFiles.length > 0 ? (
                    <ul className="worktree-result-conflicts">
                      {lastMergeResult.conflictedFiles.slice(0, 5).map((file) => (
                        <li key={file} className="worktree-result-conflict-item">
                          {file}
                        </li>
                      ))}
                      {lastMergeResult.conflictedFiles.length > 5 ? (
                        <li>… +{lastMergeResult.conflictedFiles.length - 5}</li>
                      ) : null}
                    </ul>
                  ) : null}
                </div>
              </div>
            ) : null}

            {lastSyncResult ? (
              <div
                className={`worktree-result ${
                  lastSyncResult.success
                    ? 'worktree-result-success'
                    : 'worktree-result-warning'
                }`}
              >
                {lastSyncResult.success ? (
                  <CheckCircle2 className="worktree-result-icon" strokeWidth={1.8} />
                ) : (
                  <XCircle className="worktree-result-icon" strokeWidth={1.8} />
                )}
                <div className="worktree-result-body">
                  <div className="worktree-result-message">{lastSyncResult.message}</div>
                  {lastSyncResult.conflictedFiles.length > 0 ? (
                    <ul className="worktree-result-conflicts">
                      {lastSyncResult.conflictedFiles.slice(0, 5).map((file) => (
                        <li key={file} className="worktree-result-conflict-item">
                          {file}
                        </li>
                      ))}
                      {lastSyncResult.conflictedFiles.length > 5 ? (
                        <li>… +{lastSyncResult.conflictedFiles.length - 5}</li>
                      ) : null}
                    </ul>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="worktree-cleanup-row">
              <button
                type="button"
                disabled={busyPool === -1 || pools.length === 0}
                className="worktree-cleanup-btn"
              >
                {COPY.worktreeCleanupAll}
              </button>
            </div>
          </div>
        }
      />
    </SettingsCard>
  )
}

export type WorktreePreviewMode =
  | 'default'
  | 'empty'
  | 'loading'
  | 'error'
  | 'notGitRepo'
  | 'busy'
  | 'mergeSuccess'
  | 'mergeConflict'
  | 'syncSuccess'

export function WorktreeSettingsSectionPreview({
  mode = 'default',
}: {
  mode?: WorktreePreviewMode
}): ReactElement {
  const [loading, setLoading] = useState(mode === 'loading')

  const poolStatus =
    mode === 'empty'
      ? WORKTREE_POOL_PREVIEW_EMPTY
      : mode === 'notGitRepo'
        ? WORKTREE_POOL_PREVIEW_NOT_GIT
        : WORKTREE_POOL_PREVIEW

  const lastMergeResult =
    mode === 'mergeSuccess'
      ? WORKTREE_MERGE_SUCCESS
      : mode === 'mergeConflict'
        ? WORKTREE_MERGE_CONFLICT
        : null

  const lastSyncResult = mode === 'syncSuccess' ? WORKTREE_SYNC_SUCCESS : null

  return (
    <WorktreeSettingsSection
      poolStatus={poolStatus}
      loading={loading}
      error={mode === 'error' ? 'Failed to list worktrees: permission denied.' : null}
      lastMergeResult={lastMergeResult}
      lastSyncResult={lastSyncResult}
      busyPool={mode === 'busy' ? 0 : null}
      onRefresh={() => {
        setLoading(true)
        window.setTimeout(() => setLoading(false), 900)
      }}
    />
  )
}
