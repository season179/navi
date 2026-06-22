// Kun MessageBubble approval chrome
// (../Kun/src/renderer/src/components/chat/message-timeline-bubbles.tsx).
// Visual only — used for production MessageBubble approval blocks and preview hooks.

/** English copy matching Kun's approvalTitle locale string. */
export const MESSAGE_BUBBLE_APPROVAL_TITLE = 'Approval required'

/** English copy matching Kun's approvalTool locale string. */
export const MESSAGE_BUBBLE_APPROVAL_TOOL_TEMPLATE = 'Tool: {{name}}'

/** English copy matching Kun's approvalPending locale string. */
export const MESSAGE_BUBBLE_APPROVAL_PENDING_LABEL = 'Waiting for your decision…'

/** English copy matching Kun's approvalAllow locale string. */
export const MESSAGE_BUBBLE_APPROVAL_ALLOW = 'Allow'

/** English copy matching Kun's approvalDeny locale string. */
export const MESSAGE_BUBBLE_APPROVAL_DENY = 'Deny'

/** English copy matching Kun's approvalAllowed locale string. */
export const MESSAGE_BUBBLE_APPROVAL_ALLOWED_LABEL = 'Allowed'

/** English copy matching Kun's approvalDenied locale string. */
export const MESSAGE_BUBBLE_APPROVAL_DENIED_LABEL = 'Denied'

/** English copy matching Kun's approvalFailed locale string. */
export const MESSAGE_BUBBLE_APPROVAL_FAILED_LABEL = 'Request failed'

export type MessageBubbleApprovalStatus = 'pending' | 'allowed' | 'denied' | 'error'

export function formatMessageBubbleApprovalTool(name: string): string {
  return MESSAGE_BUBBLE_APPROVAL_TOOL_TEMPLATE.replace('{{name}}', name)
}

export function resolveMessageBubbleApprovalStatusLabel(
  status: MessageBubbleApprovalStatus,
): string {
  switch (status) {
    case 'allowed':
      return MESSAGE_BUBBLE_APPROVAL_ALLOWED_LABEL
    case 'denied':
      return MESSAGE_BUBBLE_APPROVAL_DENIED_LABEL
    case 'error':
      return MESSAGE_BUBBLE_APPROVAL_FAILED_LABEL
    default:
      return MESSAGE_BUBBLE_APPROVAL_PENDING_LABEL
  }
}
