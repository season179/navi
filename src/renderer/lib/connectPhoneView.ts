// Kun ConnectPhoneView chrome
// (../Kun/src/renderer/src/components/chat/ConnectPhoneView.tsx).
// Visual only — used for production ConnectPhoneView and preview hooks.

/** English copy matching Kun's connectPhoneTitle locale string. */
export const CONNECT_PHONE_TITLE = 'Use your phone to connect kun'

/** English copy matching Kun's connectPhoneSubtitle locale string. */
export const CONNECT_PHONE_SUBTITLE =
  'Access this computer through an IM tool so you can keep working from your phone.'

/** English copy matching Kun's connectPhoneGenerateQr locale string. */
export const CONNECT_PHONE_GENERATE_QR_LABEL = 'Generate authorization QR'

/** English copy matching Kun's connectPhoneQrLoading locale string. */
export const CONNECT_PHONE_QR_LOADING_LABEL = 'Generating QR…'

/** English copy matching Kun's connectPhoneBinding locale string. */
export const CONNECT_PHONE_BINDING_LABEL = 'Binding'

/** English copy matching Kun's connectPhoneScanHint locale string. */
export const CONNECT_PHONE_SCAN_HINT =
  'Scan with Feishu/Lark to open the authorization page.'

/** English copy matching Kun's connectPhoneScanHintWeixin locale string. */
export const CONNECT_PHONE_SCAN_HINT_WEIXIN = 'Scan with WeChat to sign in.'

/** English copy matching Kun's connectPhoneAutoBindHint locale string. */
export const CONNECT_PHONE_AUTO_BIND_HINT =
  'Confirm authorization on your phone and this will bind automatically.'

/** English copy matching Kun's connectPhoneUserCode locale string template. */
export const CONNECT_PHONE_USER_CODE_TEMPLATE = 'Code {{code}}'

/** English copy matching Kun's connectPhoneDisabledConnectionHint locale string. */
export const CONNECT_PHONE_DISABLED_CONNECTION_HINT =
  'The existing connection is disabled. Manage it in settings to turn it back on.'

/** English copy matching Kun's connectPhonePreviewUser locale string. */
export const CONNECT_PHONE_PREVIEW_USER =
  'Check the latest proposal docs in the "Z project" folder on my computer and send me an outline.'

/** English copy matching Kun's connectPhonePreviewAssistant locale string. */
export const CONNECT_PHONE_PREVIEW_ASSISTANT =
  'I read 3 documents and drafted the outline, with emphasis on our smart-park technical advantages. Should I turn it into a full draft?'

/** English copy matching Kun's connectPhonePreviewDone locale string. */
export const CONNECT_PHONE_PREVIEW_DONE_LABEL = 'Done'

/** English copy matching Kun's connectPhonePreviewInput locale string. */
export const CONNECT_PHONE_PREVIEW_INPUT_PLACEHOLDER = 'Send to kun'

/** English copy matching Kun's clawAddImOfficialQrTimeLeft locale string template. */
export const CONNECT_PHONE_OFFICIAL_QR_TIME_LEFT_TEMPLATE = 'Expires in {{seconds}}s'

/** English copy matching Kun's clawAddImOfficialQrSuccess locale string. */
export const CONNECT_PHONE_OFFICIAL_QR_SUCCESS_LABEL = 'Scan succeeded'

/** English copy matching Kun's clawAddImOfficialQrFailed locale string. */
export const CONNECT_PHONE_OFFICIAL_QR_FAILED_LABEL = 'QR flow failed'

/** English copy matching Kun's clawAddImOfficialQrRetry locale string. */
export const CONNECT_PHONE_OFFICIAL_QR_RETRY_LABEL = 'Generate again'

/** English copy matching Kun's sidebarExpand locale string. */
export const CONNECT_PHONE_SIDEBAR_EXPAND_LABEL = 'Expand sidebar'

/** English copy matching Kun's clawManageImConnected locale string. */
export const CONNECT_PHONE_MANAGE_IM_CONNECTED_LABEL = 'Connected'

/** English copy matching Kun's connectPhoneDisconnect locale string. */
export const CONNECT_PHONE_DISCONNECT_LABEL = 'Disconnect phone'

/** English copy matching Kun's connectPhoneDisconnecting locale string. */
export const CONNECT_PHONE_DISCONNECTING_LABEL = 'Disconnecting'

/** English copy matching Kun's clawAddImTargetFeishu locale string. */
export const CONNECT_PHONE_INSTALL_TARGET_FEISHU_LABEL = 'Feishu'

/** English copy matching Kun's clawAddImTargetLark locale string. */
export const CONNECT_PHONE_INSTALL_TARGET_LARK_LABEL = 'Lark'

/** English copy matching Kun's clawAddImTargetWeixin locale string. */
export const CONNECT_PHONE_INSTALL_TARGET_WEIXIN_LABEL = 'WeChat'

/** Resolve connect-phone user code label matching Kun's {{code}} interpolation. */
export function formatConnectPhoneUserCodeLabel(code: string): string {
  return CONNECT_PHONE_USER_CODE_TEMPLATE.replace('{{code}}', code)
}

/** Resolve official QR countdown label matching Kun's {{seconds}} interpolation. */
export function formatConnectPhoneOfficialQrTimeLeft(seconds: number): string {
  return CONNECT_PHONE_OFFICIAL_QR_TIME_LEFT_TEMPLATE.replace('{{seconds}}', String(seconds))
}

/** Resolve install target tab label matching Kun's clawInstallTargetLabel. */
export function connectPhoneInstallTargetLabel(
  target: 'feishu' | 'lark' | 'weixin',
): string {
  if (target === 'weixin') return CONNECT_PHONE_INSTALL_TARGET_WEIXIN_LABEL
  return target === 'lark'
    ? CONNECT_PHONE_INSTALL_TARGET_LARK_LABEL
    : CONNECT_PHONE_INSTALL_TARGET_FEISHU_LABEL
}

/** Format the official user code instead of the opaque device code. */
export function formatConnectPhoneUserCode(userCode: string, deviceCode: string): string {
  const source = userCode.trim() || deviceCode
  const compact = source.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8)
  if (compact.length <= 4) return compact
  return `${compact.slice(0, 4)}-${compact.slice(4)}`
}
