// Kun execution-picker composer chrome
// (../Kun/src/renderer/src/components/chat/FloatingComposerExecutionPicker.tsx).
// Visual only — used for production Composer and preview hooks.

export type ApprovalPolicy = 'auto' | 'on-request' | 'untrusted' | 'suggest' | 'never'

export type SandboxMode =
  | 'workspace-write'
  | 'read-only'
  | 'danger-full-access'
  | 'external-sandbox'

export type ComposerExecutionSettings = {
  approvalPolicy: ApprovalPolicy
  sandboxMode: SandboxMode
}

/** English copy matching Kun's composerExecutionLabel locale string. */
export const COMPOSER_EXECUTION_LABEL = 'Execution'

/** English copy matching Kun's composerApprovalShort locale string. */
export const COMPOSER_APPROVAL_SHORT_LABEL = 'Approval'

/** English copy matching Kun's composerAccessShort locale string. */
export const COMPOSER_ACCESS_SHORT_LABEL = 'Access'

/** English copy matching Kun's composerAccessCommandsHint locale string. */
export const COMPOSER_ACCESS_COMMANDS_HINT =
  'Only Full access can run terminal commands (bash).'

/** English copy matching Kun's composerExecutionApplying locale string. */
export const COMPOSER_EXECUTION_APPLYING_LABEL = 'Applying…'

/** English copy matching Kun's approval*Short locale strings. */
export const APPROVAL_POLICY_LABELS: Record<ApprovalPolicy, string> = {
  auto: 'Auto',
  'on-request': 'Ask first',
  untrusted: 'Risky only',
  suggest: 'Suggest',
  never: 'Never',
}

/** English copy matching Kun's sandbox*Short locale strings. */
export const SANDBOX_MODE_LABELS: Record<SandboxMode, string> = {
  'workspace-write': 'Workspace write',
  'read-only': 'Read only',
  'danger-full-access': 'Full access',
  'external-sandbox': 'External',
}

export function approvalPolicyLabel(policy: ApprovalPolicy): string {
  return APPROVAL_POLICY_LABELS[policy] ?? APPROVAL_POLICY_LABELS.auto
}

export function sandboxModeLabel(mode: SandboxMode): string {
  return SANDBOX_MODE_LABELS[mode] ?? SANDBOX_MODE_LABELS['workspace-write']
}

/** Kun trigger title: "Approval: … / Access: …". */
export function formatComposerExecutionPickerTitle(
  approvalPolicy: ApprovalPolicy,
  sandboxMode: SandboxMode,
): string {
  return `${COMPOSER_APPROVAL_SHORT_LABEL}: ${approvalPolicyLabel(approvalPolicy)} / ${COMPOSER_ACCESS_SHORT_LABEL}: ${sandboxModeLabel(sandboxMode)}`
}

/** Sample settings for ?executionPickerPreview=1 visual verification. */
export const EXECUTION_PICKER_PREVIEW = {
  approvalPolicy: 'on-request' as ApprovalPolicy,
  sandboxMode: 'workspace-write' as SandboxMode,
}
