// Encrypted local settings for the main process. The OpenAI API key never
// touches the renderer or plain disk: it is encrypted at rest with Electron's
// safeStorage (OS keychain-backed where available) and only decrypted in the
// main process to hand to the spawned Flue child via an env var. The optional
// base URL (for an OpenAI-compatible gateway) is not a secret, so it is stored
// in plaintext alongside the encrypted key.

import { app, safeStorage } from 'electron'
import { promises as fs } from 'fs'
import path from 'path'

interface StoredSettings {
  /** Base64 of safeStorage.encryptString(apiKey). */
  apiKeyEnc?: string
  /** Optional OpenAI-compatible base URL; empty/absent means direct OpenAI. */
  baseUrl?: string
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
 * Resolve the OpenAI API key: an explicit env var wins (useful for dev),
 * otherwise the safeStorage-encrypted value the user saved in settings.
 * Returns undefined when neither is present.
 */
export async function getApiKey(): Promise<string | undefined> {
  const fromEnv = process.env.OPENAI_API_KEY?.trim()
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

/**
 * Resolve the OpenAI base URL: an explicit env var wins (dev parity with
 * getApiKey), otherwise the value the user saved in settings. Returns undefined
 * for the default (direct OpenAI, api.openai.com).
 */
export async function getBaseUrl(): Promise<string | undefined> {
  const fromEnv = process.env.OPENAI_BASE_URL?.trim()
  if (fromEnv) return fromEnv

  const { baseUrl } = await read()
  return baseUrl?.trim() || undefined
}

/** Persist a custom base URL; an empty/blank value clears it (back to default). */
export async function setBaseUrl(url: string): Promise<void> {
  const trimmed = url.trim()
  const current = await read()
  if (!trimmed) {
    delete current.baseUrl
    await write(current)
    return
  }
  await write({ ...current, baseUrl: trimmed })
}
