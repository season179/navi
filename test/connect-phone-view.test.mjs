import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.connect-phone-view-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'connectPhoneView.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  CONNECT_PHONE_TITLE,
  CONNECT_PHONE_SUBTITLE,
  CONNECT_PHONE_GENERATE_QR_LABEL,
  CONNECT_PHONE_QR_LOADING_LABEL,
  CONNECT_PHONE_BINDING_LABEL,
  CONNECT_PHONE_SCAN_HINT,
  CONNECT_PHONE_SCAN_HINT_WEIXIN,
  CONNECT_PHONE_AUTO_BIND_HINT,
  CONNECT_PHONE_DISABLED_CONNECTION_HINT,
  CONNECT_PHONE_PREVIEW_USER,
  CONNECT_PHONE_PREVIEW_ASSISTANT,
  CONNECT_PHONE_PREVIEW_DONE_LABEL,
  CONNECT_PHONE_PREVIEW_INPUT_PLACEHOLDER,
  CONNECT_PHONE_OFFICIAL_QR_SUCCESS_LABEL,
  CONNECT_PHONE_OFFICIAL_QR_FAILED_LABEL,
  CONNECT_PHONE_OFFICIAL_QR_RETRY_LABEL,
  CONNECT_PHONE_SIDEBAR_EXPAND_LABEL,
  CONNECT_PHONE_MANAGE_IM_CONNECTED_LABEL,
  CONNECT_PHONE_DISCONNECT_LABEL,
  CONNECT_PHONE_DISCONNECTING_LABEL,
  CONNECT_PHONE_INSTALL_TARGET_FEISHU_LABEL,
  CONNECT_PHONE_INSTALL_TARGET_LARK_LABEL,
  CONNECT_PHONE_INSTALL_TARGET_WEIXIN_LABEL,
  formatConnectPhoneUserCodeLabel,
  formatConnectPhoneOfficialQrTimeLeft,
  connectPhoneInstallTargetLabel,
  formatConnectPhoneUserCode,
} = await import(out)

test('connect phone view copy matches Kun locale strings', () => {
  assert.equal(CONNECT_PHONE_TITLE, 'Use your phone to connect kun')
  assert.equal(
    CONNECT_PHONE_SUBTITLE,
    'Access this computer through an IM tool so you can keep working from your phone.',
  )
  assert.equal(CONNECT_PHONE_GENERATE_QR_LABEL, 'Generate authorization QR')
  assert.equal(CONNECT_PHONE_QR_LOADING_LABEL, 'Generating QR…')
  assert.equal(CONNECT_PHONE_BINDING_LABEL, 'Binding')
  assert.equal(
    CONNECT_PHONE_SCAN_HINT,
    'Scan with Feishu/Lark to open the authorization page.',
  )
  assert.equal(CONNECT_PHONE_SCAN_HINT_WEIXIN, 'Scan with WeChat to sign in.')
  assert.equal(
    CONNECT_PHONE_AUTO_BIND_HINT,
    'Confirm authorization on your phone and this will bind automatically.',
  )
  assert.equal(
    CONNECT_PHONE_DISABLED_CONNECTION_HINT,
    'The existing connection is disabled. Manage it in settings to turn it back on.',
  )
  assert.equal(
    CONNECT_PHONE_PREVIEW_USER,
    'Check the latest proposal docs in the "Z project" folder on my computer and send me an outline.',
  )
  assert.equal(
    CONNECT_PHONE_PREVIEW_ASSISTANT,
    'I read 3 documents and drafted the outline, with emphasis on our smart-park technical advantages. Should I turn it into a full draft?',
  )
  assert.equal(CONNECT_PHONE_PREVIEW_DONE_LABEL, 'Done')
  assert.equal(CONNECT_PHONE_PREVIEW_INPUT_PLACEHOLDER, 'Send to kun')
  assert.equal(CONNECT_PHONE_OFFICIAL_QR_SUCCESS_LABEL, 'Scan succeeded')
  assert.equal(CONNECT_PHONE_OFFICIAL_QR_FAILED_LABEL, 'QR flow failed')
  assert.equal(CONNECT_PHONE_OFFICIAL_QR_RETRY_LABEL, 'Generate again')
  assert.equal(CONNECT_PHONE_SIDEBAR_EXPAND_LABEL, 'Expand sidebar')
  assert.equal(CONNECT_PHONE_MANAGE_IM_CONNECTED_LABEL, 'Connected')
  assert.equal(CONNECT_PHONE_DISCONNECT_LABEL, 'Disconnect phone')
  assert.equal(CONNECT_PHONE_DISCONNECTING_LABEL, 'Disconnecting')
  assert.equal(CONNECT_PHONE_INSTALL_TARGET_FEISHU_LABEL, 'Feishu')
  assert.equal(CONNECT_PHONE_INSTALL_TARGET_LARK_LABEL, 'Lark')
  assert.equal(CONNECT_PHONE_INSTALL_TARGET_WEIXIN_LABEL, 'WeChat')
})

test('connect phone view formatters match Kun behavior', () => {
  assert.equal(formatConnectPhoneUserCodeLabel('ABCD-1234'), 'Code ABCD-1234')
  assert.equal(formatConnectPhoneOfficialQrTimeLeft(87), 'Expires in 87s')
  assert.equal(connectPhoneInstallTargetLabel('feishu'), 'Feishu')
  assert.equal(connectPhoneInstallTargetLabel('lark'), 'Lark')
  assert.equal(connectPhoneInstallTargetLabel('weixin'), 'WeChat')
  assert.equal(formatConnectPhoneUserCode('YWAZ-ZZ8P', 'v1:opaque-device-code'), 'YWAZ-ZZ8P')
  assert.equal(formatConnectPhoneUserCode('', 'abcd1234-rest-of-token'), 'ABCD-1234')
})
