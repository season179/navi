// Kun WritePromptMetaDisclosure chrome
// (../Kun/src/renderer/src/components/chat/message-timeline-cards.tsx).
// Visual only — used for production WritePromptMetaDisclosure and preview hooks.

/** English copy matching Kun's writePromptContextShort locale string. */
export const WRITE_PROMPT_CONTEXT_SHORT = 'Context'

/** English copy matching Kun's writePromptContextLabel locale string. */
export const WRITE_PROMPT_CONTEXT_LABEL = 'Writing context'

/** English copy matching Kun's writePromptReferencesCount locale string. */
export const WRITE_PROMPT_REFERENCES_COUNT_TEMPLATE = '{{count}} ref'

/** English copy matching Kun's writePromptReference locale string. */
export const WRITE_PROMPT_REFERENCE = 'Text reference'

/** English copy matching Kun's writePromptReferenceLines locale string. */
export const WRITE_PROMPT_REFERENCE_LINES_TEMPLATE = 'lines {{start}}-{{end}}'

/** English copy matching Kun's writePromptReferencePage locale string. */
export const WRITE_PROMPT_REFERENCE_PAGE_TEMPLATE = 'page {{page}}'

/** English copy matching Kun's writePromptReferencePages locale string. */
export const WRITE_PROMPT_REFERENCE_PAGES_TEMPLATE = 'pages {{start}}-{{end}}'

/** English copy matching Kun's writePromptRetrievalCount locale string. */
export const WRITE_PROMPT_RETRIEVAL_COUNT_TEMPLATE = '{{count}} retrieved'

/** English copy matching Kun's writePromptRetrievalLabel locale string. */
export const WRITE_PROMPT_RETRIEVAL_LABEL = 'Retrieved snippets'

/** English copy matching Kun's writePromptRetrievalMatched locale string. */
export const WRITE_PROMPT_RETRIEVAL_MATCHED_TEMPLATE = 'Matched: {{keywords}}'

/** English copy matching Kun's writePromptActiveFile locale string. */
export const WRITE_PROMPT_ACTIVE_FILE = 'Current file'

/** English copy matching Kun's writePromptWorkspace locale string. */
export const WRITE_PROMPT_WORKSPACE = 'Workspace'

export function formatWritePromptReferencesCount(count: number): string {
  return WRITE_PROMPT_REFERENCES_COUNT_TEMPLATE.replace('{{count}}', String(count))
}

export function formatWritePromptRetrievalCount(count: number): string {
  return WRITE_PROMPT_RETRIEVAL_COUNT_TEMPLATE.replace('{{count}}', String(count))
}

export function formatWritePromptReferenceLines(start: number, end: number): string {
  return WRITE_PROMPT_REFERENCE_LINES_TEMPLATE.replace('{{start}}', String(start)).replace(
    '{{end}}',
    String(end),
  )
}

export function formatWritePromptReferencePage(page: number): string {
  return WRITE_PROMPT_REFERENCE_PAGE_TEMPLATE.replace('{{page}}', String(page))
}

export function formatWritePromptReferencePages(start: number, end: number): string {
  return WRITE_PROMPT_REFERENCE_PAGES_TEMPLATE.replace('{{start}}', String(start)).replace(
    '{{end}}',
    String(end),
  )
}

export function formatWritePromptRetrievalMatched(keywords: string): string {
  return WRITE_PROMPT_RETRIEVAL_MATCHED_TEMPLATE.replace('{{keywords}}', keywords)
}

export function resolveWritePromptQuoteRangeLabel(input: {
  lineStart?: number
  lineEnd?: number
  pageStart?: number
  pageEnd?: number
}): string | null {
  if (input.lineStart != null && input.lineEnd != null) {
    return formatWritePromptReferenceLines(input.lineStart, input.lineEnd)
  }
  if (input.pageStart != null && input.pageEnd != null) {
    return input.pageStart === input.pageEnd
      ? formatWritePromptReferencePage(input.pageStart)
      : formatWritePromptReferencePages(input.pageStart, input.pageEnd)
  }
  return null
}

export function buildWritePromptMetaSummary(input: {
  quotesCount: number
  retrievalCount: number
  hasContext: boolean
}): string {
  const parts: string[] = []
  if (input.quotesCount > 0) {
    parts.push(formatWritePromptReferencesCount(input.quotesCount))
  }
  if (input.retrievalCount > 0) {
    parts.push(formatWritePromptRetrievalCount(input.retrievalCount))
  }
  if (input.hasContext) {
    parts.push(WRITE_PROMPT_CONTEXT_SHORT)
  }
  return parts.join(' · ')
}
