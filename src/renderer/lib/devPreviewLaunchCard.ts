// Kun DevPreviewLaunchCard chrome
// (../Kun/src/renderer/src/components/DevPreviewLaunchCard.tsx).
// Visual only — used for production DevPreviewLaunchCard and preview hooks.

/** English copy matching Kun's devPreviewCardTitle locale string. */
export const DEV_PREVIEW_CARD_TITLE = 'Web preview'

/** English copy matching Kun's devPreviewCardSubtitle locale string. */
export const DEV_PREVIEW_CARD_SUBTITLE = 'Website'

/** English copy matching Kun's devPreviewCardOpened locale string. */
export const DEV_PREVIEW_CARD_OPENED = 'Preview opened on the right'

/** English copy matching Kun's devPreviewCardOpen locale string. */
export const DEV_PREVIEW_CARD_OPEN = 'Open preview'

export function formatDevPreviewUrlLabel(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}

export function formatDevPreviewCardSubtitle(url: string): string {
  return `${DEV_PREVIEW_CARD_SUBTITLE} · ${formatDevPreviewUrlLabel(url)}`
}
