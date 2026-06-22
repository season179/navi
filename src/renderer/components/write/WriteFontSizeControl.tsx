// Compact in-toolbar font-size stepper echoing Kun's WriteFontSizeControl
// (../Kun/src/renderer/src/components/write/WriteFontSizeControl.tsx).
// Visual only: drives --write-editor-font-size for instant feedback without settings IPC.

import { useState, type ReactElement } from 'react'
import { Minus, Plus } from 'lucide-react'

const FONT_SIZE_VAR = '--write-editor-font-size'

export const WRITE_EDITOR_FONT_SIZE_MIN = 12
export const WRITE_EDITOR_FONT_SIZE_MAX = 28
export const DEFAULT_WRITE_EDITOR_FONT_SIZE_PX = 16

export type WriteFontSizeControlPreviewMode = 'default' | 'min' | 'max'

function previewInitialSize(mode: WriteFontSizeControlPreviewMode): number {
  if (mode === 'min') return WRITE_EDITOR_FONT_SIZE_MIN
  if (mode === 'max') return WRITE_EDITOR_FONT_SIZE_MAX
  return DEFAULT_WRITE_EDITOR_FONT_SIZE_PX
}

function readEditorFontSize(fallback: number): number {
  if (typeof window === 'undefined') return fallback
  const raw = getComputedStyle(document.documentElement).getPropertyValue(FONT_SIZE_VAR)
  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function applyEditorFontSize(size: number): number {
  const next = Math.max(
    WRITE_EDITOR_FONT_SIZE_MIN,
    Math.min(WRITE_EDITOR_FONT_SIZE_MAX, size),
  )
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty(FONT_SIZE_VAR, `${next}px`)
  }
  return next
}

type Props = {
  /** Optional starting size for preview modes (?writeFontSizeControl=min|max). */
  initialSize?: number
}

export function WriteFontSizeControl({ initialSize }: Props): ReactElement {
  const [size, setSize] = useState<number>(() => {
    const fallback = initialSize ?? DEFAULT_WRITE_EDITOR_FONT_SIZE_PX
    return applyEditorFontSize(readEditorFontSize(fallback))
  })

  const bump = (delta: number): void => {
    setSize((current) => applyEditorFontSize(current + delta))
  }

  return (
    <div
      className="write-font-size-control"
      role="group"
      aria-label="Font size"
    >
      <button
        type="button"
        className="write-font-size-control-btn"
        onClick={() => bump(-1)}
        disabled={size <= WRITE_EDITOR_FONT_SIZE_MIN}
        title="Decrease font size"
        aria-label="Decrease font size"
      >
        <Minus className="write-font-size-control-icon" strokeWidth={2} />
      </button>
      <span className="write-font-size-control-value">{size}</span>
      <button
        type="button"
        className="write-font-size-control-btn"
        onClick={() => bump(1)}
        disabled={size >= WRITE_EDITOR_FONT_SIZE_MAX}
        title="Increase font size"
        aria-label="Increase font size"
      >
        <Plus className="write-font-size-control-icon" strokeWidth={2} />
      </button>
    </div>
  )
}

type PreviewProps = {
  mode: WriteFontSizeControlPreviewMode
}

/** Centered preview shell for ?writeFontSizeControl URL hooks. */
export function WriteFontSizeControlPreview({ mode }: PreviewProps): ReactElement {
  return (
    <div className="write-font-size-control-preview">
      <div className="write-font-size-control-preview-card">
        <div className="write-font-size-control-preview-label">Write toolbar control</div>
        <WriteFontSizeControl initialSize={previewInitialSize(mode)} />
        <p
          className="write-font-size-control-preview-sample"
          style={{ fontSize: 'var(--write-editor-font-size, 16px)' }}
        >
          The quick brown fox jumps over the lazy dog.
        </p>
      </div>
    </div>
  )
}
