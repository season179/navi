// Write-mode rich text editor echoing Kun's WriteRichEditor
// (../Kun/src/renderer/src/write/tiptap/WriteRichEditor.tsx).
// Visual only: TipTap chrome and typography without TipTap runtime or IPC.

import { type ReactElement, type ReactNode } from 'react'
import { TriangleAlert } from 'lucide-react'
import {
  WriteMarkdownEditor,
  WRITE_MARKDOWN_EDITOR_PREVIEW_SAMPLE,
} from './WriteMarkdownEditor'

const COPY = {
  writeRichFallbackNotice:
    'This document uses Markdown features that are not fully supported in rich mode. Showing the source editor instead.',
}

export type WriteRichEditorPreviewMode = 'default' | 'readonly' | 'fallback'

/** Sample markdown backing the rich editor preview surface. */
export const WRITE_RICH_EDITOR_PREVIEW_SAMPLE = WRITE_MARKDOWN_EDITOR_PREVIEW_SAMPLE

type Props = {
  value?: string
  readOnly?: boolean
  /** Static preview: show the amber fidelity fallback with a source editor beneath. */
  showFallback?: boolean
  fallback?: ReactNode
  /** Override the default TipTap-shaped sample document body. */
  sampleContent?: ReactNode
  onChange?: (value: string) => void
}

function WriteRichEditorSampleContent(): ReactElement {
  return (
    <>
      <h1>Launch plan draft</h1>
      <p>
        This document outlines the phased rollout for the writing workspace preview.
      </p>
      <h2>Goals</h2>
      <ul>
        <li>
          <p>Match Kun&apos;s write preview typography and spacing</p>
        </li>
        <li>
          <p>Keep code blocks, tables, and task lists readable</p>
        </li>
        <li>
          <p>
            Preserve the centered <strong>864px</strong> reading column
          </p>
        </li>
      </ul>
      <blockquote>
        <p>
          Good prose is clear thinking made visible. The preview pane should feel like a
          calm reading surface, not a chat bubble.
        </p>
      </blockquote>
      <h3>Milestones</h3>
      <ol>
        <li>
          <p>Port preview chrome and typography</p>
        </li>
        <li>
          <p>Wire split-pane layout in the document pane</p>
        </li>
        <li>
          <p>Validate dark theme contrast</p>
        </li>
      </ol>
      <table>
        <tbody>
          <tr>
            <th>Phase</th>
            <th>Owner</th>
            <th>Status</th>
          </tr>
          <tr>
            <td>Preview port</td>
            <td>Season</td>
            <td>In progress</td>
          </tr>
          <tr>
            <td>Editor port</td>
            <td>Season</td>
            <td>Planned</td>
          </tr>
          <tr>
            <td>PDF viewer</td>
            <td>Season</td>
            <td>Planned</td>
          </tr>
        </tbody>
      </table>
      <pre>
        <code>{`export function clamp(value: number, min: number, max: number): number {
  if (max < min) return min
  return Math.min(Math.max(value, min), max)
}`}</code>
      </pre>
      <p>
        Inline <code>clamp()</code> helpers keep zoom ranges stable across preview modes.
      </p>
      <hr />
      <h3>Checklist</h3>
      <ul data-type="taskList">
        <li>
          <label>
            <input type="checkbox" checked readOnly />
          </label>
          <div>
            <p>Typography tokens</p>
          </div>
        </li>
        <li>
          <label>
            <input type="checkbox" checked readOnly />
          </label>
          <div>
            <p>Code block styling</p>
          </div>
        </li>
        <li>
          <label>
            <input type="checkbox" readOnly />
          </label>
          <div>
            <p>Live image embeds</p>
          </div>
        </li>
      </ul>
      <p>
        Read more in the{' '}
        <a href="https://example.com/kun" target="_blank" rel="noreferrer">
          Kun reference app
        </a>
        .
      </p>
    </>
  )
}

export function WriteRichEditor({
  readOnly = false,
  showFallback = false,
  fallback,
  sampleContent,
}: Props): ReactElement {
  const fallbackSurface =
    fallback ?? (
      <WriteMarkdownEditor
        value={WRITE_RICH_EDITOR_PREVIEW_SAMPLE}
        appearance="live"
        readOnly={readOnly}
      />
    )

  if (showFallback) {
    return (
      <div className="write-rich-fallback-shell">
        <div className="write-rich-fallback-notice">
          <TriangleAlert className="write-rich-fallback-icon" strokeWidth={1.9} />
          <span>{COPY.writeRichFallbackNotice}</span>
        </div>
        <div className="write-rich-fallback-body">{fallbackSurface}</div>
      </div>
    )
  }

  return (
    <div className="write-rich-host">
      <div
        className="tiptap write-rich-editor"
        contentEditable={!readOnly}
        suppressContentEditableWarning
        spellCheck={!readOnly}
        data-write-editor-mode="rich"
      >
        {sampleContent ?? <WriteRichEditorSampleContent />}
      </div>
    </div>
  )
}

type PreviewProps = {
  mode: WriteRichEditorPreviewMode
}

/** Full-page preview shell for ?writeRichEditor URL hooks. */
export function WriteRichEditorPreview({ mode }: PreviewProps): ReactElement {
  return (
    <div className="write-rich-editor-preview">
      <div className="write-rich-editor-preview-card">
        <WriteRichEditor
          readOnly={mode === 'readonly'}
          showFallback={mode === 'fallback'}
        />
      </div>
    </div>
  )
}
