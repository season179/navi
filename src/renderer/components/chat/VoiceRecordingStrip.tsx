// Rolling microphone waveform plus elapsed-time readout shown in the composer
// toolbar while dictation is recording. Ported from Kun's VoiceRecordingStrip
// (../Kun/src/renderer/src/components/chat/VoiceRecordingStrip.tsx). Visual only:
// parent supplies getLevel/startedAtMs; canvas animation is self-contained.

import { useEffect, useRef, useState, type ReactElement } from 'react'

const BAR_WIDTH = 2
const BAR_GAP = 2
const MIN_BAR_HEIGHT = 1.5

export function VoiceRecordingStrip({
  getLevel,
  startedAtMs,
}: {
  getLevel: () => number
  startedAtMs: number
}): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [elapsedMs, setElapsedMs] = useState(0)

  useEffect(() => {
    setElapsedMs(Date.now() - startedAtMs)
    const timer = window.setInterval(() => {
      setElapsedMs(Date.now() - startedAtMs)
    }, 250)
    return () => window.clearInterval(timer)
  }, [startedAtMs])

  useEffect(() => {
    const history: number[] = []
    let frame = 0
    const draw = (): void => {
      frame = window.requestAnimationFrame(draw)
      const canvas = canvasRef.current
      if (!canvas) return
      const dpr = window.devicePixelRatio || 1
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      if (width === 0 || height === 0) return
      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr)
        canvas.height = Math.round(height * dpr)
      }
      const context = canvas.getContext('2d')
      if (!context) return
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, width, height)
      const step = BAR_WIDTH + BAR_GAP
      const maxBars = Math.max(1, Math.floor(width / step))
      history.push(getLevel())
      while (history.length > maxBars) history.shift()
      const color = getComputedStyle(canvas).color
      const mid = height / 2
      context.fillStyle = color
      context.globalAlpha = 0.32
      for (let slot = 0; slot < maxBars - history.length; slot += 1) {
        context.fillRect(slot * step, mid - MIN_BAR_HEIGHT / 2, BAR_WIDTH, MIN_BAR_HEIGHT)
      }
      context.globalAlpha = 1
      for (let i = 0; i < history.length; i += 1) {
        const barHeight = Math.max(MIN_BAR_HEIGHT, history[i] * (height - 4))
        const x = width - (history.length - i) * step
        context.fillRect(x, mid - barHeight / 2, BAR_WIDTH, barHeight)
      }
    }
    frame = window.requestAnimationFrame(draw)
    return () => window.cancelAnimationFrame(frame)
  }, [getLevel])

  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = `${totalSeconds % 60}`.padStart(2, '0')

  return (
    <div className="voice-recording-strip">
      <canvas ref={canvasRef} aria-hidden="true" className="voice-recording-canvas" />
      <span className="voice-recording-timer">
        {minutes}:{seconds}
      </span>
    </div>
  )
}
