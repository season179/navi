import { StateField, type EditorState, type Extension } from '@codemirror/state'
import { Decoration, EditorView, WidgetType, type DecorationSet } from '@codemirror/view'

export type WriteMarkdownInlineCompletionPreviewMode = 'completion' | 'edit'

const INLINE_COMPLETION_ANCHOR = 'Inline `clamp()` helpers keep zoom ranges stable across preview modes.'
const INLINE_COMPLETION_GHOST = ' and dark-theme contrast checks.'
const INLINE_EDIT_ORIGINAL = "Match Kun's write preview typography and spacing"
const INLINE_EDIT_REPLACEMENT = 'Match Kun write typography, spacing, and live-preview widgets'

class InlineCompletionWidget extends WidgetType {
  private readonly text: string

  constructor(text: string) {
    super()
    this.text = text
  }

  override eq(other: InlineCompletionWidget): boolean {
    return other.text === this.text
  }

  override toDOM(): HTMLElement {
    const span = document.createElement('span')
    span.className = 'cm-inline-completion'
    span.textContent = this.text
    return span
  }
}

class InlineEditReplacementWidget extends WidgetType {
  private readonly text: string
  private readonly leading: boolean

  constructor(text: string, leading = false) {
    super()
    this.text = text
    this.leading = leading
  }

  override eq(other: InlineEditReplacementWidget): boolean {
    return other.text === this.text && other.leading === this.leading
  }

  override toDOM(): HTMLElement {
    const span = document.createElement('span')
    span.className = this.leading
      ? 'cm-inline-completion cm-inline-edit-replacement cm-inline-edit-replacement-leading'
      : 'cm-inline-completion cm-inline-edit-replacement'

    const arrow = document.createElement('span')
    arrow.className = 'cm-inline-edit-arrow'
    arrow.textContent = '=>'

    const replacement = document.createElement('span')
    replacement.className = 'cm-inline-edit-text'
    replacement.textContent = this.text

    span.append(arrow, replacement)
    return span
  }
}

const inlineEditOriginalMark = Decoration.mark({ class: 'cm-inline-edit-original' })

function findRange(state: EditorState, needle: string): { from: number; to: number } | null {
  const doc = state.doc.toString()
  const index = doc.indexOf(needle)
  if (index < 0) return null
  return { from: index, to: index + needle.length }
}

function buildCompletionDecorations(state: EditorState): DecorationSet {
  const anchor = findRange(state, INLINE_COMPLETION_ANCHOR)
  if (!anchor) return Decoration.none
  return Decoration.set([
    Decoration.widget({
      widget: new InlineCompletionWidget(INLINE_COMPLETION_GHOST),
      side: 1,
    }).range(anchor.to),
  ])
}

function buildEditDecorations(state: EditorState): DecorationSet {
  const anchor = findRange(state, INLINE_EDIT_ORIGINAL)
  if (!anchor) return Decoration.none
  return Decoration.set([
    inlineEditOriginalMark.range(anchor.from, anchor.to),
    Decoration.widget({
      widget: new InlineEditReplacementWidget(INLINE_EDIT_REPLACEMENT),
      side: 1,
    }).range(anchor.to),
  ])
}

function buildDecorations(state: EditorState, mode: WriteMarkdownInlineCompletionPreviewMode): DecorationSet {
  return mode === 'completion' ? buildCompletionDecorations(state) : buildEditDecorations(state)
}

export function writeMarkdownInlineCompletionPreviewExtensions(
  mode: WriteMarkdownInlineCompletionPreviewMode,
): Extension[] {
  const field = StateField.define<DecorationSet>({
    create(state) {
      return buildDecorations(state, mode)
    },
    update(value, transaction) {
      if (transaction.docChanged) {
        return buildDecorations(transaction.state, mode)
      }
      return value
    },
    provide: (f) => EditorView.decorations.from(f),
  })

  return [field]
}

export function resolveWriteMarkdownEditorPreviewMode(
  value: string | null,
): 'default' | 'source' | 'readonly' | 'diffReview' | 'inlineCompletion' | 'inlineEdit' {
  if (value === 'source') return 'source'
  if (value === 'readonly') return 'readonly'
  if (value === 'diffReview') return 'diffReview'
  if (value === 'inlineCompletion') return 'inlineCompletion'
  if (value === 'inlineEdit') return 'inlineEdit'
  return 'default'
}

export function resolveWriteRichEditorPreviewMode(
  value: string | null,
):
  | 'default'
  | 'readonly'
  | 'fallback'
  | 'requirementBadges'
  | 'inlineCompletion'
  | 'inlineEdit'
  | 'imageError'
  | 'infographic'
  | 'infographicStale'
  | 'htmlEmbed' {
  if (value === 'readonly') return 'readonly'
  if (value === 'fallback') return 'fallback'
  if (value === 'requirementBadges') return 'requirementBadges'
  if (value === 'inlineCompletion') return 'inlineCompletion'
  if (value === 'inlineEdit') return 'inlineEdit'
  if (value === 'imageError') return 'imageError'
  if (value === 'infographic') return 'infographic'
  if (value === 'infographicStale') return 'infographicStale'
  if (value === 'htmlEmbed') return 'htmlEmbed'
  return 'default'
}
