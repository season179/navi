// User message file-reference chips echoing Kun's UserFileReferenceChips
// (../Kun/src/renderer/src/components/chat/message-timeline-bubbles.tsx).
// Visual only: parent supplies parsed file references.

import type { ReactElement } from 'react'
import { File } from 'lucide-react'

export type UserFileReference = {
  path: string
  relativePath: string
  name: string
  kind?: 'file' | 'directory'
}

type Props = {
  references: UserFileReference[]
}

/** Sample data for ?userFileReferenceChips=1 visual verification. */
export const USER_FILE_REFERENCE_CHIPS_PREVIEW: UserFileReference[] = [
  {
    path: '/workspace/src/auth/middleware.ts',
    relativePath: 'src/auth/middleware.ts',
    name: 'middleware.ts',
    kind: 'file',
  },
  {
    path: '/workspace/src/lib/jwt.ts',
    relativePath: 'src/lib/jwt.ts',
    name: 'jwt.ts',
    kind: 'file',
  },
  {
    path: '/workspace/src/components/',
    relativePath: 'src/components',
    name: 'components',
    kind: 'directory',
  },
]

/** Directory-only preview for ?userFileReferenceChips=directory. */
export const USER_FILE_REFERENCE_CHIPS_PREVIEW_DIRECTORY: UserFileReference[] = [
  {
    path: '/workspace/src/components/',
    relativePath: 'src/components',
    name: 'components',
    kind: 'directory',
  },
]

export function UserFileReferenceChips({ references }: Props): ReactElement | null {
  if (references.length === 0) return null

  return (
    <div className="user-file-reference-chips">
      <div className="user-file-reference-chips-label">
        Referenced files {references.length}
      </div>
      <div className="user-file-reference-chips-list">
        {references.map((reference) => {
          const isDirectory = reference.kind === 'directory'
          const label = isDirectory
            ? `${reference.relativePath.replace(/\/+$/g, '')}/`
            : reference.relativePath
          return (
            <span
              key={`${reference.kind ?? 'file'}:${reference.path}`}
              title={reference.path}
              className="user-file-reference-chip"
            >
              <File className="user-file-reference-chip-icon" strokeWidth={1.8} />
              <span className="user-file-reference-chip-label">{label}</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
