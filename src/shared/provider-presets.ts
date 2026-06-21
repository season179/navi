// One-click "Add provider" templates. Verified against @earendil-works/pi-ai's
// catalog (dist/models.generated.js) and live z.ai / DeepSeek docs (2026-06).
//
// Key facts encoded here:
//   - `deepseek` and `zai` are pi-ai CATALOG ids (api/baseUrl optional), but
//     `zai`'s catalog default baseUrl is the *coding-plan* path, against which a
//     general pay-as-you-go key fails auth — so the general preset OVERRIDES it
//     to https://api.z.ai/api/paas/v4.
//   - `zai-coding-plan` is NOT a catalog id, so it must supply api + baseUrl
//     (and its key must be passed explicitly to registerProvider — pi-ai has no
//     env fallback for non-catalog ids).
//   - Catalog models OMIT contextWindow/maxTokens so the catalog's real values
//     win (§F5). Only the pinned, dated OpenAI snapshot sets them.

import type { ProviderModel, ProviderPreset } from './flue'

/** The pinned OpenAI model navi has always shipped; the catalog lacks the dated id. */
export const OPENAI_PINNED_MODEL: ProviderModel = {
  id: 'gpt-5.4-nano-2026-03-17',
  label: 'GPT-5.4 nano',
  contextWindow: 400_000,
  maxTokens: 128_000,
}

/** The GLM model list is shared by both z.ai presets (general + coding plan). */
const GLM_MODELS: ProviderModel[] = [
  { id: 'glm-5.2', label: 'GLM-5.2' },
  { id: 'glm-5.1', label: 'GLM-5.1' },
  { id: 'glm-5-turbo', label: 'GLM-5-Turbo' },
  { id: 'glm-4.7', label: 'GLM-4.7' },
  { id: 'glm-4.5-air', label: 'GLM-4.5-Air' },
  { id: 'glm-5v-turbo', label: 'GLM-5V-Turbo', vision: true },
]

export const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    catalog: true,
    api: 'openai-completions',
    defaultBaseUrl: 'https://api.deepseek.com',
    apiKeyEnv: 'DEEPSEEK_API_KEY',
    apiKeyUrl: 'https://platform.deepseek.com/api_keys',
    defaultModels: [
      { id: 'deepseek-v4-pro', label: 'DeepSeek V4 Pro' },
      { id: 'deepseek-v4-flash', label: 'DeepSeek V4 Flash' },
    ],
  },
  {
    id: 'zai',
    name: 'Z.ai (GLM)',
    catalog: true,
    api: 'openai-completions',
    // OVERRIDE: catalog default is the coding-plan path; general keys need this.
    defaultBaseUrl: 'https://api.z.ai/api/paas/v4',
    apiKeyEnv: 'ZAI_API_KEY',
    apiKeyUrl: 'https://z.ai/manage-apikey/apikey-list',
    defaultModels: GLM_MODELS,
  },
  {
    id: 'zai-coding-plan',
    name: 'Z.ai (Coding Plan)',
    catalog: false, // non-catalog id ⇒ must supply api + baseUrl + explicit key
    api: 'openai-completions',
    defaultBaseUrl: 'https://api.z.ai/api/coding/paas/v4',
    apiKeyEnv: 'ZAI_CODING_PLAN_API_KEY',
    apiKeyUrl: 'https://z.ai/manage-apikey/apikey-list',
    defaultModels: GLM_MODELS,
  },
  {
    id: 'openai',
    name: 'OpenAI',
    catalog: true,
    // MUST pin to force Chat Completions over the catalog Responses default (§F3).
    api: 'openai-completions',
    defaultBaseUrl: undefined, // blank ⇒ catalog default (api.openai.com)
    apiKeyEnv: 'OPENAI_API_KEY',
    apiKeyUrl: 'https://platform.openai.com/api-keys',
    defaultModels: [OPENAI_PINNED_MODEL],
  },
]

export function findPreset(id: string): ProviderPreset | undefined {
  return PROVIDER_PRESETS.find((p) => p.id === id)
}

/** Provider id charset (§F9): lowercase alnum + hyphen; rejects '_', '.', '/'. */
export const PROVIDER_ID_RE = /^[a-z0-9-]+$/
