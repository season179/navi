// Kun ConnectPhoneView.tsx visual port
// (../Kun/src/renderer/src/components/chat/ConnectPhoneView.tsx).
// Visual only: mock channel/QR snapshots and preview URL hooks.

import {
  useMemo,
  useState,
  type ReactElement,
} from 'react'
import {
  AtSign,
  Battery,
  CheckCircle2,
  ChevronLeft,
  Image as ImageIcon,
  Loader2,
  LogOut,
  Maximize2,
  MessageSquare,
  Mic,
  MoreHorizontal,
  PanelLeft,
  Plus,
  PlusCircle,
  QrCode,
  RefreshCw,
  Settings,
  Smile,
  Wifi,
} from 'lucide-react'
import {
  ClawProviderLogo,
  clawProviderDisplayLabel,
  type ClawImChannelSidebarSnapshot,
  type ClawImProvider,
} from './ClawSidebar'
import { type ClawInstallTarget } from './ClawAddImDialog'
import {
  CLAW_SIDEBAR_ADD_IM_LABEL,
  CLAW_SIDEBAR_IM_DISABLED_LABEL,
  CLAW_SIDEBAR_IM_LABEL,
  CLAW_SIDEBAR_NO_IM_SUB,
  CLAW_SIDEBAR_NO_IM_TITLE,
  CLAW_SIDEBAR_SETTINGS_LABEL,
} from '../lib/clawSidebar'
import { SIDEBAR_CLAW_LABEL } from '../lib/sidebar'
import {
  CONNECT_PHONE_AUTO_BIND_HINT,
  CONNECT_PHONE_BINDING_LABEL,
  CONNECT_PHONE_DISABLED_CONNECTION_HINT,
  CONNECT_PHONE_DISCONNECTING_LABEL,
  CONNECT_PHONE_DISCONNECT_LABEL,
  CONNECT_PHONE_GENERATE_QR_LABEL,
  CONNECT_PHONE_MANAGE_IM_CONNECTED_LABEL,
  CONNECT_PHONE_OFFICIAL_QR_FAILED_LABEL,
  CONNECT_PHONE_OFFICIAL_QR_RETRY_LABEL,
  CONNECT_PHONE_OFFICIAL_QR_SUCCESS_LABEL,
  CONNECT_PHONE_PREVIEW_ASSISTANT,
  CONNECT_PHONE_PREVIEW_DONE_LABEL,
  CONNECT_PHONE_PREVIEW_INPUT_PLACEHOLDER,
  CONNECT_PHONE_PREVIEW_USER,
  CONNECT_PHONE_QR_LOADING_LABEL,
  CONNECT_PHONE_SCAN_HINT,
  CONNECT_PHONE_SCAN_HINT_WEIXIN,
  CONNECT_PHONE_SIDEBAR_EXPAND_LABEL,
  CONNECT_PHONE_SUBTITLE,
  CONNECT_PHONE_TITLE,
  connectPhoneInstallTargetLabel,
  formatConnectPhoneOfficialQrTimeLeft,
  formatConnectPhoneUserCode,
  formatConnectPhoneUserCodeLabel,
} from '../lib/connectPhoneView'

export type ConnectPhoneQrStatus = 'idle' | 'loading' | 'showing' | 'success' | 'error'

export type ConnectPhoneViewPreviewMode =
  | 'default'
  | 'lark'
  | 'weixin'
  | 'qrLoading'
  | 'qrShowing'
  | 'qrSuccess'
  | 'qrError'
  | 'connected'
  | 'sidebarCollapsed'

export type ConnectPhoneSidebarPreviewMode =
  | 'default'
  | 'empty'
  | 'connected'
  | 'qrShowing'
  | 'qrSuccess'
  | 'qrError'
  | 'disconnecting'
  | 'disabled'

const CONNECT_PHONE_TARGETS: readonly ClawInstallTarget[] = ['feishu', 'lark', 'weixin']

function connectPhoneProviderForTarget(target: ClawInstallTarget): ClawImProvider {
  return target === 'weixin' ? 'weixin' : 'feishu'
}

function MockQrCode({ className }: { className?: string }): ReactElement {
  return (
    <svg viewBox="0 0 48 48" className={className ?? 'connect-phone-mock-qr'} aria-hidden="true">
      <rect width="48" height="48" fill="#fff" />
      <rect x="4" y="4" width="12" height="12" fill="#111" />
      <rect x="32" y="4" width="12" height="12" fill="#111" />
      <rect x="4" y="32" width="12" height="12" fill="#111" />
      {Array.from({ length: 64 }, (_, index) => {
        const row = Math.floor(index / 8)
        const col = index % 8
        if ((row < 2 && col < 2) || (row < 2 && col > 5) || (row > 5 && col < 2)) return null
        if ((row + col + index) % 3 === 0) {
          return (
            <rect
              key={index}
              x={16 + col * 2}
              y={16 + row * 2}
              width="2"
              height="2"
              fill="#111"
            />
          )
        }
        return null
      })}
    </svg>
  )
}

/** Mock channel list for production sidebar visual parity until Flue exposes claw channels. */
export const CONNECT_PHONE_SIDEBAR_PREVIEW_CHANNELS: ClawImChannelSidebarSnapshot[] = [
  {
    id: 'feishu-team',
    provider: 'feishu',
    label: 'Feishu Team Bot',
    enabled: true,
    model: 'auto',
    threadId: 'thread-feishu-1',
    conversations: [
      {
        chatId: 'chat-1',
        senderName: 'Alex Chen',
        localThreadId: 'thread-feishu-1',
        updatedAt: '2026-06-01T10:00:00Z',
      },
    ],
    updatedAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'weixin-support',
    provider: 'weixin',
    label: 'WeChat Support',
    enabled: false,
    model: 'auto',
    threadId: '',
    conversations: [],
    updatedAt: '2026-05-28T08:00:00Z',
  },
]

function ConnectPhonePreviewDevice(): ReactElement {
  return (
    <div className="connect-phone-device-wrap">
      <div className="connect-phone-device-frame">
        <div className="connect-phone-device-button connect-phone-device-button-left-top" />
        <div className="connect-phone-device-button connect-phone-device-button-left-bottom" />
        <div className="connect-phone-device-button connect-phone-device-button-right" />
        <div className="connect-phone-device-notch" />
        <div className="connect-phone-device-camera" />
        <div className="connect-phone-device-screen">
          <div className="connect-phone-device-statusbar">
            <span className="connect-phone-device-time">9:41</span>
            <span className="connect-phone-device-status-icons">
              <Wifi className="connect-phone-device-status-icon" strokeWidth={2} />
              <Battery className="connect-phone-device-status-icon" strokeWidth={2} />
            </span>
          </div>
          <div className="connect-phone-device-header">
            <ChevronLeft className="connect-phone-device-header-icon" strokeWidth={1.8} />
            <div className="connect-phone-device-header-title">
              <span>kun</span>
              <span className="connect-phone-device-ai-badge">AI</span>
            </div>
            <MoreHorizontal className="connect-phone-device-header-more" strokeWidth={2} />
          </div>
          <div className="connect-phone-device-chat">
            <div className="connect-phone-device-user-row">
              <div className="connect-phone-device-user-bubble">{CONNECT_PHONE_PREVIEW_USER}</div>
              <div className="connect-phone-device-user-avatar">K</div>
            </div>
            <div className="connect-phone-device-assistant-row">
              <span className="connect-phone-device-assistant-avatar">K</span>
              <div className="connect-phone-device-assistant-card">
                <div className="connect-phone-device-assistant-header">
                  <span className="connect-phone-device-assistant-name">kun</span>
                  <span className="connect-phone-device-done-badge">{CONNECT_PHONE_PREVIEW_DONE_LABEL}</span>
                </div>
                <div className="connect-phone-device-assistant-body">
                  {CONNECT_PHONE_PREVIEW_ASSISTANT}
                </div>
              </div>
            </div>
          </div>
          <div className="connect-phone-device-composer">
            <div className="connect-phone-device-input-row">
              <span className="connect-phone-device-input-placeholder">
                {CONNECT_PHONE_PREVIEW_INPUT_PLACEHOLDER}
              </span>
              <Maximize2 className="connect-phone-device-input-expand" strokeWidth={1.8} />
            </div>
            <div className="connect-phone-device-toolbar">
              <Smile className="connect-phone-device-toolbar-icon" strokeWidth={1.8} />
              <AtSign className="connect-phone-device-toolbar-icon" strokeWidth={1.8} />
              <Mic className="connect-phone-device-toolbar-icon" strokeWidth={1.8} />
              <ImageIcon className="connect-phone-device-toolbar-icon" strokeWidth={1.8} />
              <span className="connect-phone-device-toolbar-aa">Aa</span>
              <PlusCircle className="connect-phone-device-toolbar-icon" strokeWidth={1.8} />
            </div>
            <div className="connect-phone-device-home-indicator" />
          </div>
        </div>
      </div>
    </div>
  )
}

type ConnectPhoneQrPanelProps = {
  target: ClawInstallTarget
  qrStatus: ConnectPhoneQrStatus
  qrTimeLeft: number
  userCode: string
  qrError: string
  saving: boolean
  hasExistingChannel: boolean
  hasDisabledChannels: boolean
  compact?: boolean
  onTargetChange?: (target: ClawInstallTarget) => void
}

function ConnectPhoneQrPanel({
  target,
  qrStatus,
  qrTimeLeft,
  userCode,
  qrError,
  saving,
  hasExistingChannel,
  hasDisabledChannels,
  compact = false,
  onTargetChange,
}: ConnectPhoneQrPanelProps): ReactElement {
  const targetProvider = connectPhoneProviderForTarget(target)
  const displayUserCode =
    targetProvider === 'weixin' ? '' : formatConnectPhoneUserCode(userCode, 'ABCD1234')

  return (
    <div className={`connect-phone-qr-panel${compact ? ' is-compact' : ''}`}>
      {!compact ? (
        <>
          <h1 className="connect-phone-title">{CONNECT_PHONE_TITLE}</h1>
          <p className="connect-phone-subtitle">{CONNECT_PHONE_SUBTITLE}</p>
        </>
      ) : null}

      <div
        className={`connect-phone-target-tabs${compact ? ' is-compact' : ''}`}
        role="tablist"
        aria-label="IM provider"
      >
        {CONNECT_PHONE_TARGETS.map((item) => {
          const active = target === item
          const provider = connectPhoneProviderForTarget(item)
          return (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={active}
              className={`connect-phone-target-tab${active ? ' is-active' : ''}`}
              onClick={() => onTargetChange?.(item)}
            >
              <ClawProviderLogo provider={provider} className="connect-phone-target-tab-logo" />
              {connectPhoneInstallTargetLabel(item)}
            </button>
          )
        })}
      </div>

      <div className={`connect-phone-qr-card${compact ? ' is-compact' : ''}`}>
        {qrStatus === 'idle' ? (
          <div className="connect-phone-qr-idle">
            <div className="connect-phone-qr-idle-icon-wrap">
              <QrCode className="connect-phone-qr-idle-icon" strokeWidth={1.7} />
            </div>
            <button
              type="button"
              className="connect-phone-generate-btn"
              disabled={hasExistingChannel}
            >
              {CONNECT_PHONE_GENERATE_QR_LABEL}
            </button>
          </div>
        ) : null}

        {qrStatus === 'loading' ? (
          <div className="connect-phone-qr-loading">
            <Loader2 className="connect-phone-qr-spinner" strokeWidth={2} />
            <span>{CONNECT_PHONE_QR_LOADING_LABEL}</span>
          </div>
        ) : null}

        {qrStatus === 'showing' || qrStatus === 'success' ? (
          <MockQrCode className={`connect-phone-mock-qr${compact ? ' is-compact' : ''}`} />
        ) : null}

        {qrStatus === 'showing' ? (
          <div className="connect-phone-qr-timer">
            {formatConnectPhoneOfficialQrTimeLeft(qrTimeLeft)}
          </div>
        ) : null}

        {qrStatus === 'success' ? (
          <div className="connect-phone-qr-success">
            <CheckCircle2 className="connect-phone-qr-success-icon" strokeWidth={1.9} />
            {saving ? CONNECT_PHONE_BINDING_LABEL : CONNECT_PHONE_OFFICIAL_QR_SUCCESS_LABEL}
          </div>
        ) : null}

        {qrStatus === 'error' ? (
          <div className="connect-phone-qr-error-block">
            <div className="connect-phone-qr-error-text">
              {qrError || CONNECT_PHONE_OFFICIAL_QR_FAILED_LABEL}
            </div>
            {!hasExistingChannel ? (
              <button type="button" className="connect-phone-qr-retry-btn">
                <RefreshCw className="connect-phone-qr-retry-icon" strokeWidth={1.8} />
                {CONNECT_PHONE_OFFICIAL_QR_RETRY_LABEL}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className={`connect-phone-hints${compact ? ' is-compact' : ''}`}>
        <div className="connect-phone-scan-hint">
          <ClawProviderLogo provider={targetProvider} className="connect-phone-hint-logo" />
          {targetProvider === 'weixin' ? CONNECT_PHONE_SCAN_HINT_WEIXIN : CONNECT_PHONE_SCAN_HINT}
        </div>
        <div>{CONNECT_PHONE_AUTO_BIND_HINT}</div>
        {displayUserCode ? (
          <div className="connect-phone-user-code">
            {formatConnectPhoneUserCodeLabel(displayUserCode)}
          </div>
        ) : null}
        {hasDisabledChannels ? <div>{CONNECT_PHONE_DISABLED_CONNECTION_HINT}</div> : null}
      </div>
    </div>
  )
}

type ConnectPhoneViewProps = {
  target: ClawInstallTarget
  qrStatus: ConnectPhoneQrStatus
  qrTimeLeft: number
  userCode: string
  qrError: string
  saving: boolean
  channels: ClawImChannelSidebarSnapshot[]
  leftSidebarCollapsed: boolean
  onTargetChange?: (target: ClawInstallTarget) => void
  onToggleSidebar?: () => void
}

export function ConnectPhoneView({
  target,
  qrStatus,
  qrTimeLeft,
  userCode,
  qrError,
  saving,
  channels,
  leftSidebarCollapsed,
  onTargetChange,
  onToggleSidebar,
}: ConnectPhoneViewProps): ReactElement {
  const targetProvider = connectPhoneProviderForTarget(target)
  const hasExistingChannel = channels.some((channel) => channel.provider === targetProvider)
  const hasDisabledChannels =
    hasExistingChannel &&
    !channels.some((channel) => channel.provider === targetProvider && channel.enabled)

  return (
    <section className="connect-phone-view">
      {leftSidebarCollapsed ? (
        <div className="connect-phone-sidebar-toggle">
          <button
            type="button"
            className="connect-phone-sidebar-toggle-btn"
            title={CONNECT_PHONE_SIDEBAR_EXPAND_LABEL}
            aria-label={CONNECT_PHONE_SIDEBAR_EXPAND_LABEL}
            onClick={onToggleSidebar}
          >
            <PanelLeft className="connect-phone-sidebar-toggle-icon" strokeWidth={1.9} />
          </button>
        </div>
      ) : null}

      <div className="connect-phone-view-grid">
        <div className="connect-phone-view-left">
          <ConnectPhoneQrPanel
            target={target}
            qrStatus={qrStatus}
            qrTimeLeft={qrTimeLeft}
            userCode={userCode}
            qrError={qrError}
            saving={saving}
            hasExistingChannel={hasExistingChannel}
            hasDisabledChannels={hasDisabledChannels}
            onTargetChange={onTargetChange}
          />
        </div>
        <div className="connect-phone-view-right">
          <ConnectPhonePreviewDevice />
        </div>
      </div>
    </section>
  )
}

type ConnectPhoneSidebarPanelProps = {
  channels: ClawImChannelSidebarSnapshot[]
  target: ClawInstallTarget
  qrStatus: ConnectPhoneQrStatus
  qrTimeLeft: number
  userCode: string
  qrError: string
  saving: boolean
  disconnecting: boolean
  disconnectError: string
  onTargetChange?: (target: ClawInstallTarget) => void
  onEnterClawRoute?: () => void
}

export function ConnectPhoneSidebarPanel({
  channels,
  target,
  qrStatus,
  qrTimeLeft,
  userCode,
  qrError,
  saving,
  disconnecting,
  disconnectError,
  onTargetChange,
  onEnterClawRoute,
}: ConnectPhoneSidebarPanelProps): ReactElement {
  const targetProvider = connectPhoneProviderForTarget(target)
  const connectedChannel = channels.find((channel) => channel.provider === targetProvider) ?? null
  const sortedChannels = useMemo(
    () => [...channels].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)),
    [channels],
  )
  const firstAvailableTarget =
    CONNECT_PHONE_TARGETS.find(
      (item) => !channels.some((channel) => channel.provider === connectPhoneProviderForTarget(item)),
    ) ?? null

  return (
    <div className="connect-phone-sidebar-panel">
      <div className="connect-phone-sidebar-panel-main">
        <div className="connect-phone-sidebar-panel-header">
          <span className="connect-phone-sidebar-panel-label">{CLAW_SIDEBAR_IM_LABEL}</span>
          <span className="connect-phone-sidebar-panel-actions">
            <button
              type="button"
              className="connect-phone-sidebar-icon-btn"
              disabled={!firstAvailableTarget}
              aria-label={CLAW_SIDEBAR_ADD_IM_LABEL}
              title={CLAW_SIDEBAR_ADD_IM_LABEL}
              onClick={() => {
                if (firstAvailableTarget) onTargetChange?.(firstAvailableTarget)
              }}
            >
              <Plus className="connect-phone-sidebar-icon" strokeWidth={1.9} />
            </button>
            <button
              type="button"
              className="connect-phone-sidebar-icon-btn"
              aria-label={CLAW_SIDEBAR_SETTINGS_LABEL}
              title={CLAW_SIDEBAR_SETTINGS_LABEL}
            >
              <Settings className="connect-phone-sidebar-icon" strokeWidth={1.9} />
            </button>
          </span>
        </div>

        <div className="connect-phone-sidebar-scroll">
          {sortedChannels.length === 0 ? (
            <div className="connect-phone-sidebar-empty">
              <p className="connect-phone-sidebar-empty-title">{CLAW_SIDEBAR_NO_IM_TITLE}</p>
              <p className="connect-phone-sidebar-empty-sub">{CLAW_SIDEBAR_NO_IM_SUB}</p>
            </div>
          ) : (
            <div className="connect-phone-sidebar-channel-list">
              {sortedChannels.map((channel) => {
                const providerTarget: ClawInstallTarget =
                  channel.provider === 'weixin' ? 'weixin' : 'feishu'
                const active = channel.provider === targetProvider
                const disabled = !channel.enabled
                const sortedConversations = [...channel.conversations].sort(
                  (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
                )
                const latestConversation = sortedConversations[0] ?? null
                const providerLabel = clawProviderDisplayLabel(channel.provider)
                const secondaryLabel =
                  latestConversation?.senderName.trim() ||
                  latestConversation?.chatId.trim() ||
                  `${providerLabel} · ${channel.model}`
                return (
                  <button
                    key={channel.id}
                    type="button"
                    className={`connect-phone-sidebar-channel-row${active ? ' is-active' : ''}${disabled ? ' is-disabled' : ''}`}
                    title={disabled ? CLAW_SIDEBAR_IM_DISABLED_LABEL : channel.label}
                    onClick={() => {
                      onTargetChange?.(providerTarget)
                      onEnterClawRoute?.()
                    }}
                  >
                    <MessageSquare
                      className="connect-phone-sidebar-channel-msg-icon"
                      strokeWidth={1.75}
                    />
                    <span className="connect-phone-sidebar-channel-logo-wrap">
                      <ClawProviderLogo
                        provider={channel.provider}
                        className="connect-phone-sidebar-channel-logo"
                      />
                    </span>
                    <span className="connect-phone-sidebar-channel-copy">
                      <span className="connect-phone-sidebar-channel-title">{channel.label}</span>
                      <span className="connect-phone-sidebar-channel-sub">{secondaryLabel}</span>
                    </span>
                    <span
                      className={`connect-phone-sidebar-status-dot${disabled ? ' is-faint' : ' is-live'}`}
                    />
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="connect-phone-sidebar-footer">
        <div className="connect-phone-sidebar-footer-label">
          <ClawProviderLogo provider={targetProvider} className="connect-phone-hint-logo" />
          <span>{SIDEBAR_CLAW_LABEL}</span>
        </div>

        <div className="connect-phone-sidebar-target-grid">
          {CONNECT_PHONE_TARGETS.map((item) => {
            const active = target === item
            const provider = connectPhoneProviderForTarget(item)
            return (
              <button
                key={item}
                type="button"
                className={`connect-phone-sidebar-target-btn${active ? ' is-active' : ''}`}
                aria-pressed={active}
                onClick={() => onTargetChange?.(item)}
              >
                <ClawProviderLogo provider={provider} className="connect-phone-sidebar-target-logo" />
                {connectPhoneInstallTargetLabel(item)}
              </button>
            )
          })}
        </div>

        {connectedChannel ? (
          <div className="connect-phone-sidebar-connected-card">
            <div className="connect-phone-sidebar-connected-row">
              <span className="connect-phone-sidebar-connected-icon-wrap">
                <CheckCircle2 className="connect-phone-sidebar-connected-icon" strokeWidth={1.9} />
              </span>
              <span className="connect-phone-sidebar-connected-copy">
                <span className="connect-phone-sidebar-connected-title">
                  {connectedChannel.label}
                </span>
                <span className="connect-phone-sidebar-connected-sub">
                  {connectedChannel.enabled
                    ? CONNECT_PHONE_MANAGE_IM_CONNECTED_LABEL
                    : CLAW_SIDEBAR_IM_DISABLED_LABEL}
                </span>
              </span>
            </div>
            <div className="connect-phone-sidebar-connected-actions">
              <button type="button" className="connect-phone-sidebar-settings-btn">
                <Settings className="connect-phone-sidebar-action-icon" strokeWidth={1.8} />
                {CLAW_SIDEBAR_SETTINGS_LABEL}
              </button>
              <button
                type="button"
                className="connect-phone-sidebar-disconnect-btn"
                disabled={disconnecting}
              >
                {disconnecting ? (
                  <Loader2 className="connect-phone-sidebar-action-icon is-spinning" strokeWidth={1.8} />
                ) : (
                  <LogOut className="connect-phone-sidebar-action-icon" strokeWidth={1.8} />
                )}
                {disconnecting ? CONNECT_PHONE_DISCONNECTING_LABEL : CONNECT_PHONE_DISCONNECT_LABEL}
              </button>
            </div>
            {disconnectError ? (
              <div className="connect-phone-sidebar-disconnect-error">{disconnectError}</div>
            ) : null}
          </div>
        ) : (
          <ConnectPhoneQrPanel
            target={target}
            qrStatus={qrStatus}
            qrTimeLeft={qrTimeLeft}
            userCode={userCode}
            qrError={qrError}
            saving={saving}
            hasExistingChannel={false}
            hasDisabledChannels={false}
            compact
            onTargetChange={onTargetChange}
          />
        )}
      </div>
    </div>
  )
}

function viewPreviewState(mode: ConnectPhoneViewPreviewMode): {
  target: ClawInstallTarget
  qrStatus: ConnectPhoneQrStatus
  qrTimeLeft: number
  userCode: string
  qrError: string
  saving: boolean
  channels: ClawImChannelSidebarSnapshot[]
  leftSidebarCollapsed: boolean
} {
  if (mode === 'lark') {
    return {
      target: 'lark',
      qrStatus: 'idle',
      qrTimeLeft: 0,
      userCode: '',
      qrError: '',
      saving: false,
      channels: [],
      leftSidebarCollapsed: false,
    }
  }
  if (mode === 'weixin') {
    return {
      target: 'weixin',
      qrStatus: 'idle',
      qrTimeLeft: 0,
      userCode: '',
      qrError: '',
      saving: false,
      channels: [],
      leftSidebarCollapsed: false,
    }
  }
  if (mode === 'qrLoading') {
    return {
      target: 'feishu',
      qrStatus: 'loading',
      qrTimeLeft: 0,
      userCode: '',
      qrError: '',
      saving: false,
      channels: [],
      leftSidebarCollapsed: false,
    }
  }
  if (mode === 'qrShowing') {
    return {
      target: 'feishu',
      qrStatus: 'showing',
      qrTimeLeft: 87,
      userCode: 'ABCD-1234',
      qrError: '',
      saving: false,
      channels: [],
      leftSidebarCollapsed: false,
    }
  }
  if (mode === 'qrSuccess') {
    return {
      target: 'feishu',
      qrStatus: 'success',
      qrTimeLeft: 0,
      userCode: '',
      qrError: '',
      saving: false,
      channels: [],
      leftSidebarCollapsed: false,
    }
  }
  if (mode === 'qrError') {
    return {
      target: 'feishu',
      qrStatus: 'error',
      qrTimeLeft: 0,
      userCode: '',
      qrError: 'WeChat login service is unavailable. Restart the app and try again.',
      saving: false,
      channels: [],
      leftSidebarCollapsed: false,
    }
  }
  if (mode === 'connected') {
    return {
      target: 'feishu',
      qrStatus: 'idle',
      qrTimeLeft: 0,
      userCode: '',
      qrError: '',
      saving: false,
      channels: CONNECT_PHONE_SIDEBAR_PREVIEW_CHANNELS.filter((channel) => channel.provider === 'feishu'),
      leftSidebarCollapsed: false,
    }
  }
  if (mode === 'sidebarCollapsed') {
    return {
      target: 'feishu',
      qrStatus: 'idle',
      qrTimeLeft: 0,
      userCode: '',
      qrError: '',
      saving: false,
      channels: [],
      leftSidebarCollapsed: true,
    }
  }
  return {
    target: 'feishu',
    qrStatus: 'idle',
    qrTimeLeft: 0,
    userCode: '',
    qrError: '',
    saving: false,
    channels: [],
    leftSidebarCollapsed: false,
  }
}

function sidebarPreviewState(mode: ConnectPhoneSidebarPreviewMode): {
  channels: ClawImChannelSidebarSnapshot[]
  target: ClawInstallTarget
  qrStatus: ConnectPhoneQrStatus
  qrTimeLeft: number
  userCode: string
  qrError: string
  saving: boolean
  disconnecting: boolean
  disconnectError: string
} {
  if (mode === 'empty') {
    return {
      channels: [],
      target: 'feishu',
      qrStatus: 'idle',
      qrTimeLeft: 0,
      userCode: '',
      qrError: '',
      saving: false,
      disconnecting: false,
      disconnectError: '',
    }
  }
  if (mode === 'connected') {
    return {
      channels: CONNECT_PHONE_SIDEBAR_PREVIEW_CHANNELS.filter((channel) => channel.provider === 'feishu'),
      target: 'feishu',
      qrStatus: 'idle',
      qrTimeLeft: 0,
      userCode: '',
      qrError: '',
      saving: false,
      disconnecting: false,
      disconnectError: '',
    }
  }
  if (mode === 'disabled') {
    return {
      channels: CONNECT_PHONE_SIDEBAR_PREVIEW_CHANNELS,
      target: 'weixin',
      qrStatus: 'idle',
      qrTimeLeft: 0,
      userCode: '',
      qrError: '',
      saving: false,
      disconnecting: false,
      disconnectError: '',
    }
  }
  if (mode === 'qrShowing') {
    return {
      channels: [],
      target: 'feishu',
      qrStatus: 'showing',
      qrTimeLeft: 64,
      userCode: 'WXYZ-5678',
      qrError: '',
      saving: false,
      disconnecting: false,
      disconnectError: '',
    }
  }
  if (mode === 'qrSuccess') {
    return {
      channels: [],
      target: 'lark',
      qrStatus: 'success',
      qrTimeLeft: 0,
      userCode: '',
      qrError: '',
      saving: true,
      disconnecting: false,
      disconnectError: '',
    }
  }
  if (mode === 'qrError') {
    return {
      channels: [],
      target: 'weixin',
      qrStatus: 'error',
      qrTimeLeft: 0,
      userCode: '',
      qrError: 'Authorization timed out. Generate a new QR code and try again.',
      saving: false,
      disconnecting: false,
      disconnectError: '',
    }
  }
  if (mode === 'disconnecting') {
    return {
      channels: CONNECT_PHONE_SIDEBAR_PREVIEW_CHANNELS.filter((channel) => channel.provider === 'feishu'),
      target: 'feishu',
      qrStatus: 'idle',
      qrTimeLeft: 0,
      userCode: '',
      qrError: '',
      saving: false,
      disconnecting: true,
      disconnectError: '',
    }
  }
  return {
    channels: CONNECT_PHONE_SIDEBAR_PREVIEW_CHANNELS,
    target: 'feishu',
    qrStatus: 'idle',
    qrTimeLeft: 0,
    userCode: '',
    qrError: '',
    saving: false,
    disconnecting: false,
    disconnectError: '',
  }
}

/** Full-page preview shell for ?connectPhoneViewPreview URL hooks. */
export function ConnectPhoneViewPreview({
  mode,
}: {
  mode: ConnectPhoneViewPreviewMode
}): ReactElement {
  const initial = useMemo(() => viewPreviewState(mode), [mode])
  const [target, setTarget] = useState(initial.target)
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(initial.leftSidebarCollapsed)

  return (
    <div className="connect-phone-view-preview">
      <ConnectPhoneView
        target={target}
        qrStatus={initial.qrStatus}
        qrTimeLeft={initial.qrTimeLeft}
        userCode={initial.userCode}
        qrError={initial.qrError}
        saving={initial.saving}
        channels={initial.channels}
        leftSidebarCollapsed={leftSidebarCollapsed}
        onTargetChange={setTarget}
        onToggleSidebar={() => setLeftSidebarCollapsed(false)}
      />
    </div>
  )
}

/** Sidebar preview shell for ?connectPhoneSidebarPreview URL hooks. */
export function ConnectPhoneSidebarPreview({
  mode,
}: {
  mode: ConnectPhoneSidebarPreviewMode
}): ReactElement {
  const initial = useMemo(() => sidebarPreviewState(mode), [mode])
  const [target, setTarget] = useState(initial.target)

  return (
    <div className="connect-phone-sidebar-preview-wrap">
      <aside className="connect-phone-sidebar-preview-shell">
        <ConnectPhoneSidebarPanel
          channels={initial.channels}
          target={target}
          qrStatus={initial.qrStatus}
          qrTimeLeft={initial.qrTimeLeft}
          userCode={initial.userCode}
          qrError={initial.qrError}
          saving={initial.saving}
          disconnecting={initial.disconnecting}
          disconnectError={initial.disconnectError}
          onTargetChange={setTarget}
        />
      </aside>
    </div>
  )
}
