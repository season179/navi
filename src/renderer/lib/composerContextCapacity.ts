// Kun context-capacity composer chrome
// (../Kun/src/renderer/src/components/chat/FloatingComposer.tsx +
// ContextCapacityPopover.tsx). Visual only — used for production Composer previews.

/** Whether ?composerContextCapacityPreview should open the toolbar popover on mount. */
export function resolveComposerContextCapacityPreview(
  value: string | null,
): boolean {
  if (value == null || value === '' || value === '1') return true
  return value === 'open'
}
