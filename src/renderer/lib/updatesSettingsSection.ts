// Kun UpdatesSettingsSection + GuiUpdateControl chrome
// (../Kun/src/renderer/src/components/settings-section-updates.tsx,
//  ../Kun/src/renderer/src/components/settings-gui-update.tsx).
// Visual only — used for production UpdatesSettingsSection, GuiUpdateControl, and preview hooks.

/** English copy matching Kun's sectionUpdates locale string. */
export const UPDATES_SETTINGS_SECTION_TITLE = 'Version & updates'

/** English copy matching Kun's guiUpdateChannel locale string. */
export const UPDATES_SETTINGS_CHANNEL_LABEL = 'Update channel'

/** English copy matching Kun's guiUpdateChannelDesc locale string. */
export const UPDATES_SETTINGS_CHANNEL_DESC =
  'Stable is the default; Frontier is only used after you switch to it. Stable only receives formal stable releases.'

/** English copy matching Kun's guiUpdateChannelFrontier locale string. */
export const UPDATES_SETTINGS_CHANNEL_FRONTIER = 'Frontier'

/** English copy matching Kun's guiUpdateChannelStable locale string. */
export const UPDATES_SETTINGS_CHANNEL_STABLE = 'Stable'

/** English copy matching Kun's guiUpdate locale string. */
export const UPDATES_SETTINGS_GUI_UPDATE_LABEL = 'GUI updates'

/** English copy matching Kun's guiUpdateDesc locale string. */
export const UPDATES_SETTINGS_GUI_UPDATE_DESC =
  'Check the selected release channel for GUI updates, then download and install in the app.'

/** English copy matching Kun's guiUpdateChecking locale string. */
export const GUI_UPDATE_CHECKING = 'Checking for GUI updates…'

/** English copy matching Kun's guiUpdateCheckFailed locale string. */
export const GUI_UPDATE_CHECK_FAILED = 'Could not check for GUI updates'

/** English copy matching Kun's guiUpdateNotConfiguredTitle locale string. */
export const GUI_UPDATE_NOT_CONFIGURED_TITLE = "Can't check for updates"

/** English copy matching Kun's guiUpdateErrNotConfigured locale string. */
export const GUI_UPDATE_ERR_NOT_CONFIGURED = "Update checking isn't available right now."

/** Format Kun's guiUpdateCurrent locale string. */
export function formatGuiUpdateCurrent(version: string): string {
  return `Up to date: ${version}`
}

/** Format Kun's guiUpdateAvailable locale string. */
export function formatGuiUpdateAvailable(current: string, latest: string): string {
  return `New version available: ${current} → ${latest}`
}

/** Format Kun's guiUpdateAvailableManual locale string. */
export function formatGuiUpdateAvailableManual(current: string, latest: string): string {
  return `New version available: ${current} → ${latest}. Install it from the download page.`
}

/** Format Kun's guiUpdateDownloading locale string. */
export function formatGuiUpdateDownloading(percent: number): string {
  return `Downloading update… ${percent}%`
}

/** Format Kun's guiUpdateDownloadProgress locale string. */
export function formatGuiUpdateDownloadProgress(
  transferred: string,
  total: string,
  speed: string,
): string {
  return `${transferred} / ${total}, ${speed}/s`
}

/** Format Kun's guiUpdateDownloaded locale string. */
export function formatGuiUpdateDownloaded(version: string): string {
  return `Update ${version} downloaded`
}

/** English copy matching Kun's guiUpdateDownloadedDesc locale string. */
export const GUI_UPDATE_DOWNLOADED_DESC = 'Restart the app to install the new version.'

/** English copy matching Kun's guiUpdateInstalling locale string. */
export const GUI_UPDATE_INSTALLING = 'Restarting to install update…'

/** English copy matching Kun's guiUpdateCheck locale string. */
export const GUI_UPDATE_CHECK = 'Check for updates'

/** English copy matching Kun's guiUpdateDownload locale string. */
export const GUI_UPDATE_DOWNLOAD = 'Download update'

/** English copy matching Kun's guiUpdateInstall locale string. */
export const GUI_UPDATE_INSTALL = 'Restart and install'

/** English copy matching Kun's guiUpdateOpenRelease locale string. */
export const GUI_UPDATE_OPEN_RELEASE = 'Open download page'
