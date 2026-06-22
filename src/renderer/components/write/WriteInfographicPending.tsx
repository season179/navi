// Infographic generation placeholder echoing Kun's infographic-pending-dom.ts
// (../Kun/src/renderer/src/write/infographic-pending-dom.ts).
// Visual only: animated sketch canvas with brush tour and status label.

import { type ReactElement } from 'react'

export type WriteInfographicPendingKind = 'infographic' | 'design' | 'prototype'
export type WriteInfographicPendingState = 'active' | 'stale'
export type WriteInfographicPendingPreviewMode =
  | 'default'
  | 'stale'
  | 'design'
  | 'prototype'

const BRUSH_TOUR =
  'M40 56 L236 56 L40 84 L188 84 L90 140 a36 36 0 1 1 -0.1 0 ' +
  'L168 132 L168 216 L268 216 L190 216 L190 178 L216 216 L216 156 L242 216 L242 192 ' +
  'L40 260 L260 260 L40 284 L236 284 L40 308 L260 308 L40 332 L184 332 ' +
  'L44 366 L256 366 L292 396'

const SKETCH_STROKES = [
  { d: 'M40 56 H236', width: 9, tone: 'accent', step: 1 },
  { d: 'M40 84 H188', width: 5, tone: 'muted', step: 2 },
  { d: 'M90 140 a36 36 0 1 1 -0.1 0', width: 9, tone: 'accent', step: 3 },
  { d: 'M168 132 V216 H268', width: 4, tone: 'muted', step: 4 },
  { d: 'M190 216 V178 M216 216 V156 M242 216 V192', width: 10, tone: 'accent', step: 5 },
  { d: 'M40 260 H260 M40 284 H236', width: 5, tone: 'muted', step: 6 },
  { d: 'M40 308 H260 M40 332 H184', width: 5, tone: 'muted', step: 7 },
  { d: 'M44 366 H256', width: 12, tone: 'wash', step: 8 },
] as const

const COPY = {
  stale: 'Generation interrupted — placeholder left in document',
  infographic: 'Drawing infographic',
  design: 'Drawing design draft',
  prototype: 'Building prototype',
}

function labelFor(kind: WriteInfographicPendingKind, state: WriteInfographicPendingState): string {
  if (state === 'stale') return COPY.stale
  if (kind === 'design') return COPY.design
  if (kind === 'prototype') return COPY.prototype
  return COPY.infographic
}

function InfographicPendingSketch(): ReactElement {
  return (
    <svg
      className="write-infographic-pending-sketch"
      viewBox="0 0 300 400"
      aria-hidden="true"
    >
      <g className="wip-strokes">
        {SKETCH_STROKES.map((stroke) => (
          <path
            key={stroke.step}
            className={`wip-stroke wip-stroke-${stroke.tone} wip-step-${stroke.step}`}
            d={stroke.d}
            pathLength={1}
            strokeWidth={stroke.width}
          />
        ))}
      </g>
      <g
        className="wip-brush"
        style={{ offsetPath: `path('${BRUSH_TOUR}')` }}
      >
        <g className="wip-brush-art">
          <path
            className="wip-brush-bristles"
            d="M0 0 C 4 -3 5 -8 7 -13 L 13 -7 C 8 -5 3 -4 0 0 Z"
          />
          <path className="wip-brush-ferrule" d="M7 -13 L 10 -16 L 16 -10 L 13 -7 Z" />
          <path
            className="wip-brush-handle"
            d="M11.5 -14.5 L 26 -29 L 31 -24 L 16.5 -9.5 Z"
          />
        </g>
      </g>
    </svg>
  )
}

type Props = {
  pendingId?: string
  kind?: WriteInfographicPendingKind
  state?: WriteInfographicPendingState
}

export function WriteInfographicPending({
  pendingId = 'preview-infographic',
  kind = 'infographic',
  state = 'active',
}: Props): ReactElement {
  const stale = state === 'stale'
  const label = labelFor(kind, state)

  return (
    <span
      className="write-infographic-pending"
      data-state={stale ? 'stale' : 'active'}
      data-pending-id={pendingId}
      contentEditable={false}
    >
      <span className="write-infographic-pending-canvas">
        <InfographicPendingSketch />
      </span>
      <span className="write-infographic-pending-label">
        <span>{label}</span>
        {!stale ? (
          <span className="write-infographic-pending-dots" aria-hidden="true">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        ) : null}
      </span>
    </span>
  )
}

function previewSnapshot(mode: WriteInfographicPendingPreviewMode): {
  kind: WriteInfographicPendingKind
  state: WriteInfographicPendingState
} {
  if (mode === 'stale') return { kind: 'infographic', state: 'stale' }
  if (mode === 'design') return { kind: 'design', state: 'active' }
  if (mode === 'prototype') return { kind: 'prototype', state: 'active' }
  return { kind: 'infographic', state: 'active' }
}

type PreviewProps = {
  mode?: WriteInfographicPendingPreviewMode
}

/** Full-page preview shell for ?writeInfographicPending URL hooks. */
export function WriteInfographicPendingPreview({
  mode = 'default',
}: PreviewProps): ReactElement {
  const snapshot = previewSnapshot(mode)

  return (
    <div className="write-infographic-pending-preview">
      <div className="write-infographic-pending-preview-scroll">
        <div className="write-markdown-preview ds-markdown min-h-full text-ds-ink">
          <h2>Infographic placeholder</h2>
          <p>
            Kun shows this animated sketch while an infographic, design draft, or prototype is
            generating inline in the markdown preview.
          </p>
          <WriteInfographicPending kind={snapshot.kind} state={snapshot.state} />
          <p>Final image replaces the placeholder when generation completes.</p>
        </div>
      </div>
    </div>
  )
}
