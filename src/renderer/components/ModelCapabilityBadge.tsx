// Tiny per-model capability badge: vision (text + image) vs text-only. Shared
// by the provider settings model list and the composer model picker (Kun's
// ModelCapabilityBadge).

import { Eye, Type } from 'lucide-react'

export function ModelCapabilityBadge({ vision }: { vision?: boolean }) {
  if (vision) {
    return (
      <span className="cap-badge cap-vision" title="Vision — accepts text and images">
        <Eye />
        Vision
      </span>
    )
  }
  return (
    <span className="cap-badge cap-text" title="Text only">
      <Type />
      Text
    </span>
  )
}
