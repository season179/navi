// Renders assistant message text as markdown. Ported from the core of Kun's
// StreamdownAssistant (../kun/src/renderer/src/components/chat/StreamdownAssistant.tsx),
// minus the workspace file-reference link handling.
//
// Streamdown is used purely as the markdown -> React engine (with GFM). Its own
// streaming/remend pipeline is left off; the typewriter pacing below is what
// produces the smooth char-by-char reveal, decoupled from the backend's ~40ms
// delta flushes.

import {
  useEffect,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type ReactElement,
} from 'react'
import { Streamdown, type StreamdownProps } from 'streamdown'
import remarkGfm from 'remark-gfm'
import { CodeBlock } from './CodeBlock'

/** Reveal ~1/8 of the outstanding backlog per frame… */
const CATCHUP_DIVISOR = 8
/** …but never more than this, so a huge backlog (tab refocus, resumed thread,
 * burst from a fast model) drains as fast typing instead of a wall of text. */
const MAX_STEP_PER_FRAME = 32

export function nextVisibleLength(current: number, target: number): number {
  if (current === target) return current
  // Live text shrank (interrupt / reset) — snap, never animate backwards.
  if (current > target) return target
  const backlog = target - current
  return current + Math.min(MAX_STEP_PER_FRAME, Math.max(1, Math.ceil(backlog / CATCHUP_DIVISOR)))
}

/**
 * Paces streaming text so it reveals sequentially, decoupled from delta sizes.
 */
function useTypewriterText(text: string, streaming: boolean): string {
  // Start at the current length: re-entering a thread mid-turn must not replay
  // everything already on screen.
  const [visibleLength, setVisibleLength] = useState(() => text.length)
  const targetRef = useRef(text.length)
  targetRef.current = text.length

  useEffect(() => {
    if (!streaming) return
    let raf = requestAnimationFrame(function tick() {
      // When caught up this returns the same value, so React bails out of
      // re-rendering and the idle loop costs only the rAF callback.
      setVisibleLength((current) => nextVisibleLength(current, targetRef.current))
      raf = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(raf)
  }, [streaming])

  if (!streaming) return text
  let length = Math.min(visibleLength, text.length)
  // Don't cut a surrogate pair in half mid-reveal.
  const code = text.charCodeAt(length - 1)
  if (code >= 0xd800 && code <= 0xdbff) length += 1
  return text.slice(0, length)
}

// Open links in a new context rather than navigating the renderer away from
// the app. (Electron routes target=_blank through the main process's
// window-open handler.)
function MarkdownLink({
  node: _node,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { node?: unknown }): ReactElement {
  return <a {...props} target="_blank" rel="noreferrer noopener" />
}

const components = {
  code: CodeBlock,
  a: MarkdownLink,
} satisfies StreamdownProps['components']

type Props = {
  /** Markdown source. */
  text: string
  /** True while the message is still streaming (enables the typewriter reveal). */
  streaming: boolean
}

export function Markdown({ text, streaming }: Props): ReactElement {
  const pacedText = useTypewriterText(text, streaming)

  return (
    <Streamdown
      mode="static"
      parseIncompleteMarkdown={false}
      isAnimating={false}
      // navi doesn't ship streamdown/styles.css (it assumes Tailwind), so
      // disable streamdown's built-in copy/download controls for tables and
      // mermaid — they'd render unstyled. Code blocks use our own CodeBlock
      // component, which draws its own buttons.
      controls={false}
      // Keep Streamdown's own streaming/remend pipeline off: in long Markdown
      // with GFM tables its block-repair path can leave stale fragments next to
      // the repaired block. The pacing hook above is the typewriter instead.
      animated={false}
      // Render plain anchors (styled by .ds-markdown a) instead of streamdown's
      // link-safety <button>, whose Tailwind reset classes are inert here and
      // leave a native button box.
      linkSafety={{ enabled: false }}
      remarkPlugins={[remarkGfm]}
      components={components}
    >
      {pacedText}
    </Streamdown>
  )
}
