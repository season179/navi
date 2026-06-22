// Thread todo panel echoing Kun's TodoPanel
// (../Kun/src/renderer/src/components/todo/TodoPanel.tsx).
// Visual only: parent supplies todo snapshots and optional action callbacks.

import { type ReactElement } from 'react'
import {
  CheckCircle2,
  Circle,
  ExternalLink,
  ListTodo,
  PanelRightClose,
  PlayCircle,
  Trash2,
} from 'lucide-react'
import {
  TODO_MARK_COMPLETED_LABEL,
  TODO_MARK_PENDING_LABEL,
  TODO_PANEL_CLEAR_LABEL,
  TODO_PANEL_COLLAPSE_LABEL,
  TODO_PANEL_EMPTY_DESCRIPTION,
  TODO_PANEL_EMPTY_TITLE,
  TODO_PANEL_TITLE,
  TODO_STATUS_COMPLETED_LABEL,
  TODO_STATUS_IN_PROGRESS_LABEL,
  TODO_STATUS_PENDING_LABEL,
  resolveTodoRowStatusLabel,
} from '../lib/todoPanel'

export type ThreadTodoStatus = 'pending' | 'in_progress' | 'completed'

export type ThreadTodoSource = {
  kind: 'plan'
  planId: string
  relativePath: string
  ordinal: number
  contentHash: string
}

export type ThreadTodoItem = {
  id: string
  content: string
  status: ThreadTodoStatus
  source?: ThreadTodoSource
  createdAt: string
  updatedAt: string
}

type Props = {
  items: ThreadTodoItem[]
  className?: string
  onCollapse?: () => void
  onOpenPlan?: () => void
  onStatusChange?: (id: string, status: ThreadTodoStatus) => void
  onClear?: () => void
}

const STATUS_ORDER: ThreadTodoStatus[] = ['pending', 'in_progress', 'completed']

const NOW = new Date().toISOString()

/** Sample items for ?todoPanelPreview preview hooks. */
export const TODO_PANEL_PREVIEW_ITEMS: ThreadTodoItem[] = [
  {
    id: 'todo-1',
    content: 'Audit auth middleware for token refresh edge cases',
    status: 'completed',
    source: {
      kind: 'plan',
      planId: 'plan-auth',
      relativePath: 'plans/auth-refactor.md',
      ordinal: 1,
      contentHash: 'abc123',
    },
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'todo-2',
    content: 'Add integration tests for session expiry handling',
    status: 'in_progress',
    source: {
      kind: 'plan',
      planId: 'plan-auth',
      relativePath: 'plans/auth-refactor.md',
      ordinal: 2,
      contentHash: 'def456',
    },
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'todo-3',
    content: 'Update API docs for the new refresh flow',
    status: 'pending',
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'todo-4',
    content: 'Ship migration guide for existing clients',
    status: 'pending',
    createdAt: NOW,
    updatedAt: NOW,
  },
]

export type TodoPanelPreviewMode = 'default' | 'empty'

export function TodoPanel({
  items,
  className = '',
  onCollapse,
  onOpenPlan,
  onStatusChange,
  onClear,
}: Props): ReactElement {
  const completed = items.filter((item) => item.status === 'completed').length
  const inProgress = items.filter((item) => item.status === 'in_progress').length
  const pending = Math.max(0, items.length - completed - inProgress)

  return (
    <aside className={`todo-panel ${className}`.trim()}>
      <div className="todo-panel-header">
        <div className="todo-panel-header-row">
          <button
            type="button"
            onClick={onCollapse}
            className="ds-sidebar-toggle-button todo-panel-collapse-btn"
            aria-label={TODO_PANEL_COLLAPSE_LABEL}
            title={TODO_PANEL_COLLAPSE_LABEL}
          >
            <PanelRightClose className="todo-panel-collapse-icon" strokeWidth={1.85} />
          </button>
          <div className="todo-panel-title-wrap">
            <ListTodo className="todo-panel-title-icon" strokeWidth={1.85} />
            <span className="todo-panel-title">{TODO_PANEL_TITLE}</span>
          </div>
          {items.length > 0 ? (
            <button
              type="button"
              onClick={onClear}
              className="todo-panel-clear-btn"
              aria-label={TODO_PANEL_CLEAR_LABEL}
              title={TODO_PANEL_CLEAR_LABEL}
            >
              <Trash2 className="todo-panel-clear-icon" strokeWidth={1.75} />
            </button>
          ) : null}
        </div>
        <div className="todo-panel-stats">
          <TodoStat label={TODO_STATUS_PENDING_LABEL} value={pending} />
          <TodoStat label={TODO_STATUS_IN_PROGRESS_LABEL} value={inProgress} />
          <TodoStat label={TODO_STATUS_COMPLETED_LABEL} value={completed} />
        </div>
      </div>

      <div className="todo-panel-body">
        {items.length === 0 ? (
          <div className="todo-panel-empty">
            <div className="todo-panel-empty-icon-wrap">
              <ListTodo className="todo-panel-empty-icon" strokeWidth={1.65} />
            </div>
            <div>
              <div className="todo-panel-empty-title">{TODO_PANEL_EMPTY_TITLE}</div>
              <div className="todo-panel-empty-description">{TODO_PANEL_EMPTY_DESCRIPTION}</div>
            </div>
          </div>
        ) : (
          <div className="todo-panel-list">
            {items.map((item) => (
              <TodoRow
                key={item.id}
                item={item}
                onOpenPlan={onOpenPlan}
                onStatus={(status) => onStatusChange?.(item.id, status)}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}

function TodoStat({ label, value }: { label: string; value: number }): ReactElement {
  return (
    <div className="todo-panel-stat">
      <div className="todo-panel-stat-value">{value}</div>
      <div className="todo-panel-stat-label">{label}</div>
    </div>
  )
}

function TodoRow({
  item,
  onStatus,
  onOpenPlan,
}: {
  item: ThreadTodoItem
  onStatus: (status: ThreadTodoStatus) => void
  onOpenPlan?: () => void
}): ReactElement {
  return (
    <div className="todo-panel-row">
      <div className="todo-panel-row-main">
        <button
          type="button"
          onClick={() => onStatus(item.status === 'completed' ? 'pending' : 'completed')}
          className="todo-panel-row-toggle"
          aria-label={
            item.status === 'completed' ? TODO_MARK_PENDING_LABEL : TODO_MARK_COMPLETED_LABEL
          }
          title={
            item.status === 'completed' ? TODO_MARK_PENDING_LABEL : TODO_MARK_COMPLETED_LABEL
          }
        >
          {item.status === 'completed' ? (
            <CheckCircle2 className="todo-panel-row-icon todo-panel-row-icon-completed" strokeWidth={1.85} />
          ) : item.status === 'in_progress' ? (
            <PlayCircle className="todo-panel-row-icon todo-panel-row-icon-active" strokeWidth={1.85} />
          ) : (
            <Circle className="todo-panel-row-icon" strokeWidth={1.85} />
          )}
        </button>
        <div className="todo-panel-row-content">
          <div
            className={
              item.status === 'completed'
                ? 'todo-panel-row-text todo-panel-row-text-completed'
                : 'todo-panel-row-text'
            }
          >
            {item.content}
          </div>
          {item.source?.kind === 'plan' ? (
            <button
              type="button"
              onClick={onOpenPlan}
              className="todo-panel-row-plan-link"
              title={item.source.relativePath}
            >
              <ExternalLink className="todo-panel-row-plan-icon" strokeWidth={1.8} />
              <span className="todo-panel-row-plan-path">{item.source.relativePath}</span>
            </button>
          ) : null}
        </div>
      </div>
      <div className="todo-panel-row-statuses">
        {STATUS_ORDER.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => onStatus(status)}
            className={
              item.status === status
                ? 'todo-panel-row-status is-active'
                : 'todo-panel-row-status'
            }
            aria-current={item.status === status ? 'true' : undefined}
          >
            {resolveTodoRowStatusLabel(status)}
          </button>
        ))}
      </div>
    </div>
  )
}
