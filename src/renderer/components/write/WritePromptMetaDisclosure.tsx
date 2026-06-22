// Collapsible write-mode reference disclosure echoing Kun's WritePromptMetaDisclosure
// (../Kun/src/renderer/src/components/chat/message-timeline-cards.tsx).
// Visual only: parent supplies a write-prompt display snapshot.

import type { ReactElement } from 'react'
import { ChevronDown, ChevronRight, MessageSquareQuote, SearchCode } from 'lucide-react'
import {
  WRITE_PROMPT_ACTIVE_FILE,
  WRITE_PROMPT_CONTEXT_LABEL,
  WRITE_PROMPT_REFERENCE,
  WRITE_PROMPT_RETRIEVAL_LABEL,
  WRITE_PROMPT_WORKSPACE,
  buildWritePromptMetaSummary,
  formatWritePromptRetrievalMatched,
  resolveWritePromptQuoteRangeLabel,
} from '../../lib/writePromptMetaDisclosure'

export type WritePromptDisplayContext = {
  workspaceRoot?: string
  activeFile?: string
  lines: string[]
}

export type WritePromptDisplayQuote = {
  sourceTitle: string
  sourceFilePath?: string
  sourceKind?: 'text' | 'pdf'
  lineStart?: number
  lineEnd?: number
  pageStart?: number
  pageEnd?: number
  charCount?: number
  text: string
}

export type WritePromptDisplayRetrievalSnippet = {
  location: string
  title?: string
  keywords?: string
  text: string
}

export type WritePromptDisplayRetrieval = {
  source?: string
  keywords?: string
  snippets: WritePromptDisplayRetrievalSnippet[]
}

export type WritePromptDisplay = {
  userInput: string
  context: WritePromptDisplayContext | null
  quotes: WritePromptDisplayQuote[]
  retrieval: WritePromptDisplayRetrieval | null
}

function writePromptMetaSummary(display: WritePromptDisplay): string {
  return buildWritePromptMetaSummary({
    quotesCount: display.quotes.length,
    retrievalCount: display.retrieval?.snippets.length ?? 0,
    hasContext: display.context != null,
  })
}

/** Sample data for ?writePromptMetaDisclosure=1 visual verification. */
export const WRITE_PROMPT_META_DISCLOSURE_PREVIEW: WritePromptDisplay = {
  userInput: 'Rewrite this middleware to use JWT validation',
  context: {
    activeFile: 'src/middleware/auth.ts',
    workspaceRoot: '/Users/season/Personal/navi',
    lines: [],
  },
  quotes: [
    {
      sourceTitle: 'auth.ts',
      sourceFilePath: 'src/middleware/auth.ts',
      lineStart: 12,
      lineEnd: 28,
      text: 'export function validateSession(req: Request): boolean {\n  const token = req.headers.authorization?.slice(7)\n  if (!token) return false\n  return verifyLegacyToken(token)\n}',
    },
    {
      sourceTitle: 'JWT spec',
      sourceFilePath: 'docs/auth/jwt.md',
      pageStart: 4,
      pageEnd: 5,
      text: 'Tokens must be validated with RS256 and checked against the issuer claim.',
    },
  ],
  retrieval: {
    keywords: 'jwt middleware validation',
    snippets: [
      {
        location: 'src/lib/token.ts:44-52',
        title: 'verifyJwt helper',
        keywords: 'jwt, verify',
        text: 'export async function verifyJwt(token: string, key: CryptoKey): Promise<Claims> {\n  // ...\n}',
      },
      {
        location: 'docs/plans/auth-refactor.md:18',
        title: 'Migration checklist',
        text: 'Replace legacy session tokens with short-lived JWTs before Q2.',
      },
    ],
  },
}

/** Quotes-only preview for ?writePromptMetaDisclosure=quotes. */
export const WRITE_PROMPT_META_DISCLOSURE_PREVIEW_QUOTES: WritePromptDisplay = {
  userInput: 'Explain this helper',
  context: null,
  quotes: [
    {
      sourceTitle: 'utils.ts',
      sourceFilePath: 'src/lib/utils.ts',
      lineStart: 8,
      lineEnd: 14,
      text: 'export function clamp(value: number, min: number, max: number): number {\n  return Math.min(max, Math.max(min, value))\n}',
    },
  ],
  retrieval: null,
}

type Props = {
  display: WritePromptDisplay
  expanded: boolean
  onToggle: () => void
}

export function WritePromptMetaDisclosure({
  display,
  expanded,
  onToggle,
}: Props): ReactElement | null {
  const summary = writePromptMetaSummary(display)
  if (!summary) return null

  return (
    <div className="write-prompt-meta-disclosure">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="write-prompt-meta-disclosure-toggle"
      >
        <MessageSquareQuote className="write-prompt-meta-disclosure-icon" strokeWidth={1.85} />
        <span className="write-prompt-meta-disclosure-summary">{summary}</span>
        {expanded ? (
          <ChevronDown className="write-prompt-meta-disclosure-chevron is-expanded" strokeWidth={1.85} />
        ) : (
          <ChevronRight className="write-prompt-meta-disclosure-chevron" strokeWidth={1.85} />
        )}
      </button>

      {expanded ? (
        <div className="write-prompt-meta-disclosure-body">
          {display.context ? (
            <div className="write-prompt-context-card">
              <div className="write-prompt-context-label">{WRITE_PROMPT_CONTEXT_LABEL}</div>
              {display.context.activeFile ? (
                <div className="write-prompt-context-row">
                  <span className="write-prompt-context-key">{WRITE_PROMPT_ACTIVE_FILE} </span>
                  <span className="write-prompt-context-value">{display.context.activeFile}</span>
                </div>
              ) : null}
              {display.context.workspaceRoot ? (
                <div
                  className="write-prompt-context-row is-tight"
                  title={display.context.workspaceRoot}
                >
                  <span className="write-prompt-context-key">{WRITE_PROMPT_WORKSPACE} </span>
                  <span className="write-prompt-context-value">{display.context.workspaceRoot}</span>
                </div>
              ) : null}
            </div>
          ) : null}

          {display.quotes.map((quote, index) => (
            <WritePromptQuoteCard key={`${quote.sourceTitle}-${index}`} quote={quote} />
          ))}

          {display.retrieval && display.retrieval.snippets.length > 0 ? (
            <WritePromptRetrievalCard retrieval={display.retrieval} />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function WritePromptQuoteCard({ quote }: { quote: WritePromptDisplayQuote }): ReactElement {
  const rangeLabel = resolveWritePromptQuoteRangeLabel(quote)

  return (
    <figure className="write-prompt-quote-card">
      <figcaption className="write-prompt-quote-caption">
        <MessageSquareQuote className="write-prompt-meta-disclosure-icon" strokeWidth={1.9} />
        <span className="write-prompt-quote-title">
          {quote.sourceTitle || WRITE_PROMPT_REFERENCE}
        </span>
        {rangeLabel ? (
          <span className="write-prompt-range-badge">{rangeLabel}</span>
        ) : null}
      </figcaption>
      <blockquote className="write-prompt-quote-text">
        <div className="write-prompt-quote-text-inner">{quote.text}</div>
      </blockquote>
      {quote.sourceFilePath ? (
        <div className="write-prompt-quote-path" title={quote.sourceFilePath}>
          {quote.sourceFilePath}
        </div>
      ) : null}
    </figure>
  )
}

function WritePromptRetrievalCard({
  retrieval,
}: {
  retrieval: WritePromptDisplayRetrieval
}): ReactElement {
  return (
    <div className="write-prompt-retrieval-card">
      <div className="write-prompt-retrieval-header">
        <SearchCode className="write-prompt-meta-disclosure-icon" strokeWidth={1.9} />
        <span className="write-prompt-retrieval-label">{WRITE_PROMPT_RETRIEVAL_LABEL}</span>
        {retrieval.keywords ? (
          <span className="write-prompt-range-badge is-truncate" title={retrieval.keywords}>
            {retrieval.keywords}
          </span>
        ) : null}
      </div>
      <div className="write-prompt-retrieval-list">
        {retrieval.snippets.map((snippet, index) => (
          <div key={`${snippet.location}-${index}`} className="write-prompt-retrieval-snippet">
            <div className="write-prompt-retrieval-snippet-header">
              <span className="write-prompt-retrieval-index">{index + 1}</span>
              <span className="write-prompt-retrieval-location" title={snippet.location}>
                {snippet.location}
              </span>
            </div>
            {snippet.title ? (
              <div className="write-prompt-retrieval-snippet-title">{snippet.title}</div>
            ) : null}
            <div className="write-prompt-retrieval-snippet-text">{snippet.text}</div>
            {snippet.keywords ? (
              <div className="write-prompt-retrieval-matched" title={snippet.keywords}>
                {formatWritePromptRetrievalMatched(snippet.keywords)}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
