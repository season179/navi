// Kun RuntimeWakeHero chrome
// (../Kun/src/renderer/src/components/chat/message-timeline-empty.tsx).
// Visual only — used for production RuntimeWakeHero and preview hooks.

/** English copy matching Kun's runtimeOfflineHeroKicker locale string. */
export const RUNTIME_WAKE_HERO_KICKER = 'GUI agent core'

/** Navi-branded equivalent of Kun's runtimeOfflineHeroTitle locale string. */
export const RUNTIME_WAKE_HERO_OFFLINE_TITLE = 'Navi is waking the local agent'

/** Navi-branded equivalent of Kun's runtimeOfflineHeroSub locale string. */
export const RUNTIME_WAKE_HERO_OFFLINE_DETAIL =
  'The workbench is bringing Navi back into this window. When the local service is ready, sessions and the composer resume here.'

/** English copy matching Kun's runtimeErrorHeroTitle locale string. */
export const RUNTIME_WAKE_HERO_ERROR_TITLE = 'Cannot connect to the local runtime'

/** English copy matching Kun's retryConnection locale string. */
export const RUNTIME_WAKE_HERO_RETRY_LABEL = 'Retry'

/** English copy matching Kun's openSettings locale string. */
export const RUNTIME_WAKE_HERO_OPEN_SETTINGS_LABEL = 'Open Settings'

export function resolveRuntimeWakeHeroTitle(runtimeError?: string | null): string {
  const trimmedError = runtimeError?.trim() ?? ''
  return trimmedError.length > 0 ? RUNTIME_WAKE_HERO_ERROR_TITLE : RUNTIME_WAKE_HERO_OFFLINE_TITLE
}

export function resolveRuntimeWakeHeroDetail(runtimeError?: string | null): string {
  const trimmedError = runtimeError?.trim() ?? ''
  return trimmedError.length > 0 ? trimmedError : RUNTIME_WAKE_HERO_OFFLINE_DETAIL
}

export function resolveRuntimeWakeHeroWaking(runtimeError?: string | null): boolean {
  const trimmedError = runtimeError?.trim() ?? ''
  return trimmedError.length === 0
}
