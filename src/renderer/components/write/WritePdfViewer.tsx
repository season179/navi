// Write-mode PDF viewer echoing Kun's WritePdfViewer
// (../Kun/src/renderer/src/components/write/WritePdfViewer.tsx).
// Visual only: mock page surfaces stand in for pdfjs rendering.

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactElement,
} from 'react'
import { ChevronLeft, ChevronRight, Loader2, Minus, Plus, Search } from 'lucide-react'

const COPY = {
  writePdfLoading: 'Opening PDF…',
  writePdfLoadFailed: (message: string) => `PDF failed to open: ${message}`,
  writePdfZoomIn: 'Zoom PDF in',
  writePdfZoomOut: 'Zoom PDF out',
  writePdfPrevPage: 'Previous page',
  writePdfNextPage: 'Next page',
  writePdfPageInput: 'PDF page',
  writePdfPageLabel: (page: number) => `Page ${page}`,
  writePdfSearchPlaceholder: 'Search PDF',
  writePdfPrevMatch: 'Previous match',
  writePdfNextMatch: 'Next match',
  writePdfNoTextLayer:
    'This PDF has no extractable text layer. This version does not run OCR for scanned PDFs yet, but the page image remains readable.',
}

const PAGE_BASE_WIDTH = 595
const PAGE_BASE_HEIGHT = 842
const DEFAULT_SCALE = 1.15
const MIN_SCALE = 0.65
const MAX_SCALE = 2.4

export type WritePdfViewerPreviewMode =
  | 'default'
  | 'loading'
  | 'error'
  | 'noText'
  | 'selection'

/** Sample metadata for ?writePdfViewer preview hooks. */
export const WRITE_PDF_VIEWER_PREVIEW_SAMPLE = {
  filePath: '/Users/season/writing/docs/launch-plan.pdf',
  workspaceRoot: '/Users/season/writing',
  size: 1_842_560,
}

type MockPage = {
  page: number
  title: string
  body: string[]
  text: string
}

const MOCK_PAGES: MockPage[] = [
  {
    page: 1,
    title: 'Launch Plan',
    body: [
      'This document outlines the phased rollout for the writing workspace preview.',
      'The PDF viewer mirrors Kun toolbar chrome, page shadows, and zoom controls.',
    ],
    text: 'Launch Plan phased rollout writing workspace preview PDF viewer toolbar zoom controls',
  },
  {
    page: 2,
    title: 'Milestones',
    body: [
      'Phase 1 — Port preview chrome and typography.',
      'Phase 2 — Wire split-pane layout in the document pane.',
      'Phase 3 — Validate dark theme contrast across PDF pages.',
    ],
    text: 'Milestones Phase preview typography split-pane document pane dark theme contrast',
  },
  {
    page: 3,
    title: 'Appendix',
    body: [
      'Reference notes for scanned PDFs without a text layer.',
      'Selection overlays persist when focus moves to the assist popup.',
    ],
    text: 'Appendix scanned PDF text layer selection overlays assist popup',
  },
]

function formatSize(size: number): string {
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`
  if (size >= 1024) return `${Math.round(size / 1024)} KB`
  return `${size} B`
}

function normalizePath(value: string): string {
  return value.replaceAll('\\', '/').replace(/\/+$/, '')
}

function relativeToWorkspace(workspaceRoot: string, filePath: string): string {
  const normalizedRoot = normalizePath(workspaceRoot)
  const normalizedTarget = normalizePath(filePath)
  const prefix = `${normalizedRoot}/`
  if (normalizedTarget.startsWith(prefix)) {
    return normalizedTarget.slice(prefix.length)
  }
  const segments = normalizedTarget.split('/').filter(Boolean)
  return segments[segments.length - 1] || normalizedTarget
}

function clampScale(value: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number(value.toFixed(2))))
}

function pageSvg(page: MockPage): string {
  const bodyLines = page.body
    .map((line, index) => {
      const y = 180 + index * 34
      return `<text x="56" y="${y}" font-family="Georgia, 'Times New Roman', serif" font-size="15" fill="#334155">${escapeXml(line)}</text>`
    })
    .join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${PAGE_BASE_WIDTH}" height="${PAGE_BASE_HEIGHT}" viewBox="0 0 ${PAGE_BASE_WIDTH} ${PAGE_BASE_HEIGHT}">
    <rect width="100%" height="100%" fill="#ffffff"/>
    <rect x="0" y="0" width="100%" height="96" fill="#f8fafc"/>
    <text x="56" y="72" font-family="Georgia, 'Times New Roman', serif" font-size="28" font-weight="700" fill="#0f172a">${escapeXml(page.title)}</text>
    ${bodyLines}
    <line x1="56" y1="760" x2="539" y2="760" stroke="#e2e8f0" stroke-width="1"/>
    <text x="539" y="790" text-anchor="end" font-family="ui-monospace, monospace" font-size="12" fill="#94a3b8">${page.page}</text>
  </svg>`
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

type SelectionRect = {
  x: number
  y: number
  width: number
  height: number
}

type Props = {
  filePath: string
  size: number
  workspaceRoot: string
  /** Static preview: force loading/error/no-text states without pdfjs. */
  previewState?: 'loading' | 'error' | 'noText'
  previewErrorMessage?: string
  /** Static preview: show committed selection overlay on page 1. */
  showSelectionOverlay?: boolean
}

function MockPdfPage({
  page,
  scale,
  selectionRects,
}: {
  page: MockPage
  scale: number
  selectionRects: SelectionRect[]
}): ReactElement {
  const width = PAGE_BASE_WIDTH * scale
  const height = PAGE_BASE_HEIGHT * scale
  const src = `data:image/svg+xml,${encodeURIComponent(pageSvg(page))}`

  return (
    <div
      className="write-pdf-page"
      data-write-pdf-page={page.page}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <img
        className="write-pdf-canvas"
        src={src}
        alt=""
        draggable={false}
        width={width}
        height={height}
      />
      <div className="write-pdf-overlay-layer" aria-hidden="true">
        {selectionRects.map((rect, index) => (
          <span
            key={`${page.page}-${index}-${rect.x}-${rect.y}`}
            className="write-pdf-selection-rect"
            style={{
              left: rect.x,
              top: rect.y,
              width: rect.width,
              height: rect.height,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export function WritePdfViewer({
  filePath,
  size,
  workspaceRoot,
  previewState,
  previewErrorMessage = 'Mock preview error: file is corrupted.',
  showSelectionOverlay = false,
}: Props): ReactElement {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const scrollRafRef = useRef<number | null>(null)
  const [scale, setScale] = useState(DEFAULT_SCALE)
  const [pageInput, setPageInput] = useState('1')
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchIndex, setSearchIndex] = useState(0)
  const pageCount = MOCK_PAGES.length
  const loading = previewState === 'loading'
  const error = previewState === 'error' ? previewErrorMessage : ''
  const noTextLayer = previewState === 'noText'

  const searchMatches = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query || noTextLayer) return []
    return MOCK_PAGES.filter((page) => page.text.toLowerCase().includes(query))
      .map((page) => page.page)
      .sort((a, b) => a - b)
  }, [noTextLayer, searchQuery])

  const selectionRectsByPage = useMemo(() => {
    if (!showSelectionOverlay) return new Map<number, SelectionRect[]>()
    return new Map<number, SelectionRect[]>([
      [
        1,
        [
          { x: 56 * scale, y: 168 * scale, width: 220 * scale, height: 22 * scale },
          { x: 56 * scale, y: 202 * scale, width: 460 * scale, height: 22 * scale },
        ],
      ],
    ])
  }, [scale, showSelectionOverlay])

  const updateCurrentPageFromScroll = useCallback((): void => {
    const scroller = scrollerRef.current
    if (!scroller || pageRefs.current.size === 0) return
    const scrollerRect = scroller.getBoundingClientRect()
    const targetY = scrollerRect.top + scrollerRect.height * 0.42
    let bestPage = 1
    let bestDistance = Number.POSITIVE_INFINITY

    pageRefs.current.forEach((node, page) => {
      const rect = node.getBoundingClientRect()
      const distance =
        targetY >= rect.top && targetY <= rect.bottom
          ? 0
          : Math.min(Math.abs(targetY - rect.top), Math.abs(targetY - rect.bottom))
      if (distance < bestDistance) {
        bestDistance = distance
        bestPage = page
      }
    })

    setCurrentPage((value) => (value === bestPage ? value : bestPage))
    setPageInput((value) => (value === String(bestPage) ? value : String(bestPage)))
  }, [])

  const schedulePageSync = useCallback((): void => {
    if (scrollRafRef.current != null) return
    scrollRafRef.current = window.requestAnimationFrame(() => {
      scrollRafRef.current = null
      updateCurrentPageFromScroll()
    })
  }, [updateCurrentPageFromScroll])

  const scrollToPage = useCallback((page: number): void => {
    const clamped = Math.max(1, Math.min(pageCount, Math.round(page)))
    setCurrentPage(clamped)
    setPageInput(String(clamped))
    pageRefs.current.get(clamped)?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }, [pageCount])

  const jumpSearch = useCallback(
    (direction: 1 | -1): void => {
      if (searchMatches.length === 0) return
      const nextIndex = (searchIndex + direction + searchMatches.length) % searchMatches.length
      setSearchIndex(nextIndex)
      scrollToPage(searchMatches[nextIndex])
    },
    [scrollToPage, searchIndex, searchMatches],
  )

  useEffect(() => {
    setSearchIndex(0)
    if (searchMatches.length > 0) scrollToPage(searchMatches[0])
  }, [scrollToPage, searchMatches.join(',')])

  useEffect(() => {
    return () => {
      if (scrollRafRef.current != null) {
        window.cancelAnimationFrame(scrollRafRef.current)
        scrollRafRef.current = null
      }
    }
  }, [])

  const handlePageSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    scrollToPage(Number(pageInput))
  }

  return (
    <div className="write-pdf-viewer">
      <div className="write-pdf-toolbar">
        <div className="write-pdf-toolbar-row">
          <div className="write-pdf-toolbar-meta">
            {formatSize(size)} · {relativeToWorkspace(workspaceRoot, filePath)}
          </div>
          <div className="write-pdf-control-group">
            <button
              type="button"
              className="write-pdf-icon-button"
              title={COPY.writePdfZoomOut}
              aria-label={COPY.writePdfZoomOut}
              onClick={() => setScale((value) => clampScale(value - 0.1))}
            >
              <Minus className="write-pdf-toolbar-icon" strokeWidth={1.9} />
            </button>
            <span className="write-pdf-scale-label">{Math.round(scale * 100)}%</span>
            <button
              type="button"
              className="write-pdf-icon-button"
              title={COPY.writePdfZoomIn}
              aria-label={COPY.writePdfZoomIn}
              onClick={() => setScale((value) => clampScale(value + 0.1))}
            >
              <Plus className="write-pdf-toolbar-icon" strokeWidth={1.9} />
            </button>
          </div>
          <div className="write-pdf-control-group">
            <button
              type="button"
              className="write-pdf-icon-button"
              title={COPY.writePdfPrevPage}
              aria-label={COPY.writePdfPrevPage}
              onClick={() => scrollToPage(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="write-pdf-toolbar-icon" strokeWidth={1.9} />
            </button>
            <form className="write-pdf-page-form" onSubmit={handlePageSubmit}>
              <input
                className="write-pdf-page-input"
                value={pageInput}
                aria-label={COPY.writePdfPageInput}
                onChange={(event) => setPageInput(event.target.value)}
              />
              <span className="write-pdf-page-count">/ {pageCount || '-'}</span>
            </form>
            <button
              type="button"
              className="write-pdf-icon-button"
              title={COPY.writePdfNextPage}
              aria-label={COPY.writePdfNextPage}
              onClick={() => scrollToPage(currentPage + 1)}
              disabled={!pageCount || currentPage >= pageCount}
            >
              <ChevronRight className="write-pdf-toolbar-icon" strokeWidth={1.9} />
            </button>
          </div>
          <div className="write-pdf-search-group">
            <Search className="write-pdf-search-icon" strokeWidth={1.9} />
            <input
              className="write-pdf-search-input"
              value={searchQuery}
              placeholder={COPY.writePdfSearchPlaceholder}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <span className="write-pdf-search-count">
              {searchQuery.trim() ? `${searchMatches.length ? searchIndex + 1 : 0}/${searchMatches.length}` : ''}
            </span>
            <button
              type="button"
              className="write-pdf-icon-button"
              title={COPY.writePdfPrevMatch}
              aria-label={COPY.writePdfPrevMatch}
              disabled={searchMatches.length === 0}
              onClick={() => jumpSearch(-1)}
            >
              <ChevronLeft className="write-pdf-toolbar-icon" strokeWidth={1.9} />
            </button>
            <button
              type="button"
              className="write-pdf-icon-button"
              title={COPY.writePdfNextMatch}
              aria-label={COPY.writePdfNextMatch}
              disabled={searchMatches.length === 0}
              onClick={() => jumpSearch(1)}
            >
              <ChevronRight className="write-pdf-toolbar-icon" strokeWidth={1.9} />
            </button>
          </div>
        </div>
      </div>
      <div
        ref={scrollerRef}
        className="write-pdf-scroller"
        onScroll={schedulePageSync}
      >
        {loading ? (
          <div className="write-pdf-state write-pdf-state-loading">
            <Loader2 className="write-pdf-state-spinner" strokeWidth={1.9} />
            {COPY.writePdfLoading}
          </div>
        ) : error ? (
          <div className="write-pdf-state write-pdf-state-error">
            {COPY.writePdfLoadFailed(error)}
          </div>
        ) : (
          <div className="write-pdf-pages">
            {noTextLayer ? (
              <div className="write-pdf-no-text-banner">{COPY.writePdfNoTextLayer}</div>
            ) : null}
            {MOCK_PAGES.map((page) => (
              <div
                key={page.page}
                ref={(node) => {
                  if (node) pageRefs.current.set(page.page, node)
                  else pageRefs.current.delete(page.page)
                }}
              >
                <MockPdfPage
                  page={page}
                  scale={scale}
                  selectionRects={selectionRectsByPage.get(page.page) ?? []}
                />
                <div className="write-pdf-page-label">{COPY.writePdfPageLabel(page.page)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function previewSnapshot(mode: WritePdfViewerPreviewMode): {
  previewState?: 'loading' | 'error' | 'noText'
  showSelectionOverlay?: boolean
} {
  if (mode === 'loading') return { previewState: 'loading' }
  if (mode === 'error') return { previewState: 'error' }
  if (mode === 'noText') return { previewState: 'noText' }
  if (mode === 'selection') return { showSelectionOverlay: true }
  return {}
}

type PreviewProps = {
  mode: WritePdfViewerPreviewMode
}

/** Full-page preview shell for ?writePdfViewer URL hooks. */
export function WritePdfViewerPreview({ mode }: PreviewProps): ReactElement {
  const snapshot = previewSnapshot(mode)

  return (
    <div className="write-pdf-viewer-preview">
      <WritePdfViewer
        filePath={WRITE_PDF_VIEWER_PREVIEW_SAMPLE.filePath}
        size={WRITE_PDF_VIEWER_PREVIEW_SAMPLE.size}
        workspaceRoot={WRITE_PDF_VIEWER_PREVIEW_SAMPLE.workspaceRoot}
        previewState={snapshot.previewState}
        showSelectionOverlay={snapshot.showSelectionOverlay}
      />
    </div>
  )
}
