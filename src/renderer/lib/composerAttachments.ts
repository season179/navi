/** Image attachment row item for Kun's composer attachment preview chips. */
export type ComposerImageAttachment = {
  id: string
  name: string
  previewUrl: string
}

const SAMPLE_IMAGE =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" fill="#dbeafe"/><circle cx="52" cy="58" r="18" fill="#93c5fd"/><path d="M16 132l38-42 28 24 22-18 40 36H16z" fill="#60a5fa"/></svg>`,
  )

/** Mock image attachments for ?composerAttachmentsPreview visual verification. */
export const COMPOSER_ATTACHMENTS_PREVIEW = [
  { id: 'img-1', name: 'mock-screenshot.png', previewUrl: SAMPLE_IMAGE },
  { id: 'img-2', name: 'wireframe.png', previewUrl: SAMPLE_IMAGE },
] satisfies ComposerImageAttachment[]

/** English copy matching Kun's composerAttachmentUnavailable locale string. */
export const COMPOSER_ATTACHMENT_UNAVAILABLE_PREVIEW = 'Attachment upload is unavailable.'

/** English copy matching Kun's composerAttachmentModelUnsupported locale string. */
export const COMPOSER_ATTACHMENT_MODEL_UNSUPPORTED_PREVIEW =
  'The selected model cannot read images. Switch to a vision model or remove the attachment.'

/** Resolves attachment error preview copy from ?composerAttachmentErrorPreview query values. */
export function resolveComposerAttachmentErrorPreview(
  value: string | null,
): string | undefined {
  if (value === 'unsupported') return COMPOSER_ATTACHMENT_MODEL_UNSUPPORTED_PREVIEW
  if (value === '1' || value === 'true' || value === 'unavailable') {
    return COMPOSER_ATTACHMENT_UNAVAILABLE_PREVIEW
  }
  return undefined
}
