// Encrypted local settings for the main process. The Anthropic API key never
// touches the renderer or plain disk: it is encrypted at rest with Electron's
// safeStorage (OS keychain-backed where available) and only decrypted in the
// main process to hand to the spawned Flue child via an env var.

import { app, safeStorage } from 'electron'
import { promises as fs } from 'fs'
import path from 'path'

interface StoredSettings {
  /** Base64 of safeStorage.encryptString(apiKey). */
  apiKeyEnc?: string
}

function settingsPath(): string {
  return path.join(app.getPath('userData'), 'navi-settings.json')
}

async function read(): Promise<StoredSettings> {
  try {
    const raw = await fs.readFile(settingsPath(), 'utf8')
    return JSON.parse(raw) as StoredSettings
  } catch {
    return {}
  }
}

async function write(settings: StoredSettings): Promise<void> {
  const file = settingsPath()
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, JSON.stringify(settings, null, 2), { mode: 0o600 })
}

/**
 * Resolve the Anthropic API key: an explicit env var wins (useful for dev),
 * otherwise the safeStorage-encrypted value the user saved in settings.
 * Returns undefined when neither is present.
 */
export async function getApiKey(): Promise<string | undefined> {
  const fromEnv = process.env.ANTHROPIC_API_KEY?.trim()
  if (fromEnv) return fromEnv

  const { apiKeyEnc } = await read()
  if (!apiKeyEnc) return undefined
  if (!safeStorage.isEncryptionAvailable()) return undefined
  try {
    const decrypted = safeStorage.decryptString(Buffer.from(apiKeyEnc, 'base64'))
    return decrypted.trim() || undefined
  } catch {
    return undefined
  }
}

export async function setApiKey(key: string): Promise<void> {
  const trimmed = key.trim()
  if (!trimmed) throw new Error('API key is empty.')
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('Secure storage is unavailable on this system; cannot persist the API key.')
  }
  const enc = safeStorage.encryptString(trimmed).toString('base64')
  const current = await read()
  await write({ ...current, apiKeyEnc: enc })
}

export async function clearApiKey(): Promise<void> {
  const current = await read()
  delete current.apiKeyEnc
  await write(current)
}

export async function hasApiKey(): Promise<boolean> {
  return (await getApiKey()) !== undefined
}
