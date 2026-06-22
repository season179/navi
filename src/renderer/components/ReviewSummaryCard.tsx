// Collapsible code-review summary card echoing Kun's ReviewSummaryCard
// (../Kun/src/renderer/src/components/chat/message-timeline-cards.tsx).
// Visual only: parent supplies a review snapshot.

import type { ReactElement } from 'react'
import { useState } from 'react'
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  SearchCode,
  TriangleAlert,
} from 'lucide-react'
import { resolveReviewSummaryCardStatusLabel } from '../lib/reviewSummaryCard'

export type ReviewFinding = {
  title: string
  body: string
  priority: number
  codeLocation: {
    absoluteFilePath: string
    lineRange: { start: number; end: number }
  }
}

export type ReviewSummarySnapshot = {
  title: string
  status: 'running' | 'success' | 'error'
  reviewText?: string
  output?: {
    findings: ReviewFinding[]
    overallCorrectness: 'patch is correct' | 'patch is incorrect'
    overallExplanation: string
  }
}

type Props = {
  review: ReviewSummarySnapshot
}

/** Sample data for ?reviewSummaryCard=1 visual verification. */
export const REVIEW_SUMMARY_CARD_PREVIEW: ReviewSummarySnapshot = {
  title: 'Review uncommitted changes',
  status: 'success',
  output: {
    overallCorrectness: 'patch is correct',
    overallExplanation:
      'The auth middleware refactor looks sound. Token validation is centralized and error paths are consistent.',
    findings: [
      {
        title: '[P1] Missing null check on session expiry',
        body: 'session.expiresAt is read without guarding against undefined when legacy tokens are present.',
        priority: 1,
        codeLocation: {
          absoluteFilePath: 'src/middleware/auth.ts',
          lineRange: { start: 42, end: 48 },
        },
      },
      {
        title: '[P2] Rate limit bypass on websocket upgrade',
        body: 'The upgrade handler skips the shared limiter used by HTTP routes.',
        priority: 2,
        codeLocation: {
          absoluteFilePath: 'src/server/ws.ts',
          lineRange: { start: 18, end: 31 },
        },
      },
    ],
  },
}

export const REVIEW_SUMMARY_CARD_PREVIEW_RUNNING: ReviewSummarySnapshot = {
  title: 'Review uncommitted changes',
  status: 'running',
}

export const REVIEW_SUMMARY_CARD_PREVIEW_ERROR: ReviewSummarySnapshot = {
  title: 'Review uncommitted changes',
  status: 'error',
  reviewText: 'The review agent timed out while reading the diff.',
}

export const REVIEW_SUMMARY_CARD_PREVIEW_INCORRECT: ReviewSummarySnapshot = {
  title: 'Review uncommitted changes',
  status: 'success',
  output: {
    overallCorrectness: 'patch is incorrect',
    overallExplanation:
      'The patch introduces a regression in token refresh — expired sessions are not rotated.',
    findings: [
      {
        title: '[P0] Refresh token never rotated',
        body: 'rotateRefreshToken() is imported but never called after successful login.',
        priority: 0,
        codeLocation: {
          absoluteFilePath: 'src/auth/session.ts',
          lineRange: { start: 88, end: 102 },
        },
      },
    ],
  },
}

export const REVIEW_SUMMARY_CARD_PREVIEW_NO_FINDINGS: ReviewSummarySnapshot = {
  title: 'Review uncommitted changes',
  status: 'success',
  output: {
    overallCorrectness: 'patch is correct',
    overallExplanation: 'No issues found in the changed files.',
    findings: [],
  },
}

export function ReviewSummaryCard({ review }: Props): ReactElement {
  const [expanded, setExpanded] = useState(review.status !== 'success')
  const findings = review.output?.findings ?? []
  const incorrect = review.output?.overallCorrectness === 'patch is incorrect'
  const running = review.status === 'running'
  const failed = review.status === 'error'

  const icon = running ? (
    <SearchCode strokeWidth={1.9} />
  ) : failed || incorrect ? (
    <TriangleAlert strokeWidth={1.9} />
  ) : (
    <CheckCircle2 strokeWidth={1.9} />
  )

  const statusText = resolveReviewSummaryCardStatusLabel({
    running,
    failed,
    findingsCount: findings.length,
  })

  const iconTone =
    failed || incorrect ? 'is-error' : running ? 'is-running' : 'is-success'

  return (
    <section className="review-summary-card">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className="review-summary-card-header"
      >
        <span className={`review-summary-card-icon ${iconTone}`}>{icon}</span>
        <span className="review-summary-card-heading">
          <span className="review-summary-card-title">{review.title}</span>
          <span className="review-summary-card-status">{statusText}</span>
        </span>
        {expanded ? (
          <ChevronDown className="review-summary-card-chevron" strokeWidth={1.8} />
        ) : (
          <ChevronRight className="review-summary-card-chevron" strokeWidth={1.8} />
        )}
      </button>

      {expanded ? (
        <div className="review-summary-card-body">
          {review.output?.overallExplanation?.trim() ? (
            <p className="review-summary-card-explanation">{review.output.overallExplanation}</p>
          ) : review.reviewText?.trim() ? (
            <p className="review-summary-card-explanation">{review.reviewText}</p>
          ) : (
            <p className="review-summary-card-explanation">{statusText}</p>
          )}

          {findings.length > 0 ? (
            <div className="review-summary-card-findings">
              {findings.map((finding, index) => (
                <article
                  key={`${finding.title}-${index}`}
                  className="review-summary-card-finding"
                >
                  <div className="review-summary-card-finding-head">
                    <span className="review-summary-card-finding-priority">
                      P{finding.priority}
                    </span>
                    <div className="review-summary-card-finding-copy">
                      <div className="review-summary-card-finding-title">
                        {finding.title.replace(/^\[P[0-3]\]\s*/i, '')}
                      </div>
                      <div className="review-summary-card-finding-location">
                        {finding.codeLocation.absoluteFilePath}:
                        {finding.codeLocation.lineRange.start}-
                        {finding.codeLocation.lineRange.end}
                      </div>
                    </div>
                  </div>
                  {finding.body.trim() ? (
                    <p className="review-summary-card-finding-body">{finding.body}</p>
                  ) : null}
                </article>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
