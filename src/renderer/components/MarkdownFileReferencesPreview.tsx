// Visual preview for Kun's StreamdownLink + InlineFileReferenceCode styling
// (?markdownFileReferencesPreview=1|inline).

import type { ReactElement } from 'react'
import { Markdown } from './Markdown'

export type MarkdownFileReferencesPreviewMode = 'default' | 'inline'

const MARKDOWN_FILE_REFERENCES_PREVIEW_DEFAULT = `Updated the auth middleware in src/auth/middleware.ts:42 and wired the helper through src/renderer/lib/file-references.ts.

See also [external docs](https://example.com/docs) for API reference.`

const MARKDOWN_FILE_REFERENCES_PREVIEW_INLINE = `Use \`src/renderer/components/Markdown.tsx\` for prose links and inline \`src/lib/code-highlighting.ts\` paths in backticks.`

type PreviewProps = {
  mode: MarkdownFileReferencesPreviewMode
}

export function MarkdownFileReferencesPreview({ mode }: PreviewProps): ReactElement {
  const text =
    mode === 'inline'
      ? MARKDOWN_FILE_REFERENCES_PREVIEW_INLINE
      : MARKDOWN_FILE_REFERENCES_PREVIEW_DEFAULT

  return (
    <div className="markdown-file-references-preview">
      <div className="markdown-file-references-preview-bubble">
        <div className="ds-markdown">
          <Markdown text={text} streaming={false} />
        </div>
      </div>
    </div>
  )
}
