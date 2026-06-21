// Write-mode markdown editor echoing Kun's WriteMarkdownEditor
// (../Kun/src/renderer/src/components/write/WriteMarkdownEditor.tsx).
// Visual only: CodeMirror chrome and theme without inline completion or IPC.

import {
  useEffect,
  useRef,
  useState,
  type ReactElement,
} from 'react'
import { Compartment, EditorSelection, EditorState, type Extension } from '@codemirror/state'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { bracketMatching, indentOnInput } from '@codemirror/language'
import { languages } from '@codemirror/language-data'
import {
  drawSelection,
  EditorView,
  highlightActiveLine,
  keymap,
  showPanel,
  type Panel,
} from '@codemirror/view'
import { unifiedMergeView } from '@codemirror/merge'
import {
  writeMarkdownInlineCompletionPreviewExtensions,
  type WriteMarkdownInlineCompletionPreviewMode,
} from '../lib/writeMarkdownInlineCompletionPreview'
import {
  editorPreviewContentForImageWidgetMode,
  editorWidgetOverridesForImageWidgetMode,
  isWriteMarkdownEditorImageWidgetMode,
  type WriteMarkdownPreviewWidgetOverrides,
} from '../lib/writeMarkdownImageWidgets'
import { writeMarkdownLivePreviewExtensions } from '../lib/writeMarkdownLivePreview'
import { WRITE_MARKDOWN_PREVIEW_SAMPLE } from './WriteMarkdownPreview'

const COPY = {
  writeDiffReviewing: 'Reviewing AI changes',
  writeDiffRejectAll: 'Reject all',
  writeDiffAcceptAll: 'Accept all',
}

export type WriteMarkdownEditorPreviewMode =
  | 'default'
  | 'source'
  | 'readonly'
  | 'diffReview'
  | 'inlineCompletion'
  | 'inlineEdit'
  | 'infographic'
  | 'infographicStale'
  | 'infographicDesign'
  | 'infographicPrototype'
  | 'htmlEmbed'
  | 'htmlEmbedLoaded'
  | 'htmlEmbedError'
  | 'htmlEmbedMissing'
  | 'imageError'
  | 'loadedImage'

/** Sample document for ?writeMarkdownEditor preview hooks. */
export const WRITE_MARKDOWN_EDITOR_PREVIEW_SAMPLE = WRITE_MARKDOWN_PREVIEW_SAMPLE

const DIFF_REVIEW_ORIGINAL = `# Launch plan draft

This document outlines the phased rollout for the writing workspace preview.

## Goals

- Match Kun's write preview typography and spacing
- Keep code blocks readable
`

const DIFF_REVIEW_NEXT = `# Launch plan draft

This document outlines the phased rollout for the writing workspace preview.

## Goals

- Match Kun's write preview typography and spacing
- Keep code blocks, tables, and task lists readable
- Preserve the centered **864px** reading column

## Timeline

Ship the editor port before wiring live preview widgets.
`

type Props = {
  value: string
  appearance?: 'source' | 'live'
  readOnly?: boolean
  /** Static preview: show the inline diff review panel and merge colors. */
  showDiffReview?: boolean
  /** Static preview: render Kun-matching inline AI completion or edit decorations. */
  inlineCompletionPreview?: WriteMarkdownInlineCompletionPreviewMode
  /** Static preview: override live-preview widget appearance (infographic kind/state). */
  livePreviewWidgetOverrides?: WriteMarkdownPreviewWidgetOverrides
  onChange?: (value: string) => void
}

function buildEditorTheme(appearance: 'source' | 'live'): Extension {
  const sourceMode = appearance === 'source'
  return EditorView.theme({
    '&': {
      height: '100%',
      minWidth: '0',
      minHeight: '0',
      color: 'var(--ds-text)',
      backgroundColor: 'transparent',
      fontFamily: sourceMode
        ? 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace'
        : "var(--write-editor-font-family, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Noto Sans SC', 'Microsoft YaHei', sans-serif)",
      fontSize: 'var(--write-editor-font-size, 16px)',
    },
    '.cm-scroller': {
      overflow: 'auto',
      lineHeight: 'var(--write-editor-line-height, 1.75)',
      backgroundColor: 'transparent',
    },
    '.cm-content': {
      minHeight: '100%',
      padding: sourceMode ? '26px 24px 56px' : 'clamp(40px, 7vh, 72px) 24px 120px',
      caretColor: 'var(--ds-text)',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: 'var(--ds-text)',
    },
    '.cm-selectionBackground': {
      backgroundColor: 'var(--write-selection-bg, var(--ds-selection))',
    },
    '.cm-content::selection, .cm-content *::selection': {
      backgroundColor: 'var(--write-selection-bg, var(--ds-selection))',
      color: 'var(--write-selection-text, inherit)',
    },
    '.cm-gutters': {
      display: 'none',
    },
    '.cm-activeLine': {
      backgroundColor: 'rgba(0, 0, 0, 0.025)',
    },
    '[data-theme="dark"] & .cm-activeLine': {
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
    },
  })
}

function buildInteractionExtensions(readOnly: boolean, appearance: 'source' | 'live'): Extension[] {
  return [
    EditorState.readOnly.of(readOnly),
    EditorView.editable.of(!readOnly),
    EditorView.contentAttributes.of({
      spellcheck: readOnly ? 'false' : 'true',
      autocorrect: readOnly ? 'off' : 'on',
      autocapitalize: readOnly ? 'off' : 'sentences',
      'data-write-editor-mode': appearance,
    }),
  ]
}

function buildDiffReviewPanel(): Panel {
  const dom = document.createElement('div')
  dom.className = 'cm-write-diff-panel'
  const label = document.createElement('span')
  label.className = 'cm-write-diff-panel-label'
  label.textContent = COPY.writeDiffReviewing
  const reject = document.createElement('button')
  reject.type = 'button'
  reject.className = 'cm-write-diff-reject-all'
  reject.textContent = COPY.writeDiffRejectAll
  const accept = document.createElement('button')
  accept.type = 'button'
  accept.className = 'cm-write-diff-accept-all'
  accept.textContent = COPY.writeDiffAcceptAll
  dom.append(label, reject, accept)
  return { dom, top: true }
}

export function WriteMarkdownEditor({
  value,
  appearance = 'live',
  readOnly = false,
  showDiffReview = false,
  inlineCompletionPreview,
  livePreviewWidgetOverrides,
  onChange,
}: Props): ReactElement {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const viewRef = useRef<EditorView | null>(null)
  const themeCompartmentRef = useRef<Compartment | null>(null)
  const editableCompartmentRef = useRef<Compartment | null>(null)
  const livePreviewCompartmentRef = useRef<Compartment | null>(null)
  const inlineCompletionCompartmentRef = useRef<Compartment | null>(null)
  const mergeCompartmentRef = useRef<Compartment | null>(null)
  const onChangeRef = useRef(onChange)
  const lastEmittedValueRef = useRef<string | null>(null)

  onChangeRef.current = onChange

  useEffect(() => {
    if (!hostRef.current) return

    const themeCompartment = new Compartment()
    const editableCompartment = new Compartment()
    const livePreviewCompartment = new Compartment()
    const inlineCompletionCompartment = new Compartment()
    const mergeCompartment = new Compartment()
    themeCompartmentRef.current = themeCompartment
    editableCompartmentRef.current = editableCompartment
    livePreviewCompartmentRef.current = livePreviewCompartment
    inlineCompletionCompartmentRef.current = inlineCompletionCompartment
    mergeCompartmentRef.current = mergeCompartment

    const initialDoc = showDiffReview ? DIFF_REVIEW_NEXT : value
    const mergeExtensions = showDiffReview
      ? [
          unifiedMergeView({
            original: DIFF_REVIEW_ORIGINAL,
            gutter: false,
            collapseUnchanged: { margin: 3, minSize: 4 },
          }),
          showPanel.of(buildDiffReviewPanel),
        ]
      : []

    const state = EditorState.create({
      doc: initialDoc,
      extensions: [
        themeCompartment.of(buildEditorTheme(appearance)),
        editableCompartment.of(buildInteractionExtensions(readOnly, appearance)),
        livePreviewCompartment.of(
          appearance === 'live'
            ? writeMarkdownLivePreviewExtensions(livePreviewWidgetOverrides)
            : [],
        ),
        inlineCompletionCompartment.of(
          inlineCompletionPreview
            ? writeMarkdownInlineCompletionPreviewExtensions(inlineCompletionPreview)
            : [],
        ),
        mergeCompartment.of(mergeExtensions),
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        history(),
        drawSelection(),
        highlightActiveLine(),
        indentOnInput(),
        bracketMatching(),
        EditorView.lineWrapping,
        keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
        EditorView.updateListener.of((update) => {
          if (showDiffReview || readOnly) return
          if (update.docChanged) {
            const next = update.state.doc.toString()
            lastEmittedValueRef.current = next
            onChangeRef.current?.(next)
          }
        }),
      ],
    })

    const view = new EditorView({
      state,
      parent: hostRef.current,
    })
    viewRef.current = view
    lastEmittedValueRef.current = initialDoc

    return () => {
      view.destroy()
      viewRef.current = null
      themeCompartmentRef.current = null
      editableCompartmentRef.current = null
      livePreviewCompartmentRef.current = null
      inlineCompletionCompartmentRef.current = null
      mergeCompartmentRef.current = null
    }
    // Mount-once editor shell for preview verification.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const view = viewRef.current
    const themeCompartment = themeCompartmentRef.current
    const editableCompartment = editableCompartmentRef.current
    const livePreviewCompartment = livePreviewCompartmentRef.current
    const inlineCompletionCompartment = inlineCompletionCompartmentRef.current
    if (!view || !themeCompartment || !editableCompartment || !livePreviewCompartment || !inlineCompletionCompartment) {
      return
    }
    view.dispatch({
      effects: [
        themeCompartment.reconfigure(buildEditorTheme(appearance)),
        editableCompartment.reconfigure(buildInteractionExtensions(readOnly, appearance)),
        livePreviewCompartment.reconfigure(
          appearance === 'live'
            ? writeMarkdownLivePreviewExtensions(livePreviewWidgetOverrides)
            : [],
        ),
        inlineCompletionCompartment.reconfigure(
          inlineCompletionPreview
            ? writeMarkdownInlineCompletionPreviewExtensions(inlineCompletionPreview)
            : [],
        ),
      ],
    })
  }, [appearance, inlineCompletionPreview, livePreviewWidgetOverrides, readOnly])

  useEffect(() => {
    if (showDiffReview) return
    const view = viewRef.current
    if (!view) return
    if (value === lastEmittedValueRef.current) return
    const current = view.state.doc.toString()
    if (current === value) {
      lastEmittedValueRef.current = value
      return
    }
    const nextLength = value.length
    const { anchor, head } = view.state.selection.main
    lastEmittedValueRef.current = value
    view.dispatch({
      changes: { from: 0, to: current.length, insert: value },
      selection: EditorSelection.single(
        Math.min(anchor, nextLength),
        Math.min(head, nextLength),
      ),
    })
  }, [showDiffReview, value])

  return (
    <div
      ref={hostRef}
      className={`write-codemirror-host flex h-full min-h-0 w-full min-w-0${appearance === 'live' ? ' cm-write-live-preview' : ''}`}
    />
  )
}

function previewAppearance(mode: WriteMarkdownEditorPreviewMode): 'source' | 'live' {
  return mode === 'source' ? 'source' : 'live'
}

type PreviewProps = {
  mode: WriteMarkdownEditorPreviewMode
}

function previewInitialContent(mode: WriteMarkdownEditorPreviewMode): string {
  if (isWriteMarkdownEditorImageWidgetMode(mode)) {
    return editorPreviewContentForImageWidgetMode(mode)
  }
  return WRITE_MARKDOWN_EDITOR_PREVIEW_SAMPLE
}

/** Full-page preview shell for ?writeMarkdownEditor URL hooks. */
export function WriteMarkdownEditorPreview({ mode }: PreviewProps): ReactElement {
  const [value, setValue] = useState(() => previewInitialContent(mode))
  const inlineCompletionPreview =
    mode === 'inlineCompletion' ? 'completion' : mode === 'inlineEdit' ? 'edit' : undefined
  const livePreviewWidgetOverrides = isWriteMarkdownEditorImageWidgetMode(mode)
    ? editorWidgetOverridesForImageWidgetMode(mode)
    : undefined
  const readOnly =
    mode === 'readonly' ||
    mode === 'diffReview' ||
    mode === 'inlineCompletion' ||
    mode === 'inlineEdit' ||
    isWriteMarkdownEditorImageWidgetMode(mode)

  return (
    <div className="write-markdown-editor-preview">
      <WriteMarkdownEditor
        value={value}
        appearance={previewAppearance(mode)}
        readOnly={readOnly}
        showDiffReview={mode === 'diffReview'}
        inlineCompletionPreview={inlineCompletionPreview}
        livePreviewWidgetOverrides={livePreviewWidgetOverrides}
        onChange={readOnly ? undefined : setValue}
      />
    </div>
  )
}
