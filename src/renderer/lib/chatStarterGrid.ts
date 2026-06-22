// Kun ChatStarterGrid chrome
// (../Kun/src/renderer/src/components/chat/ChatStarterGrid.tsx).
// Visual only — used for production ChatStarterGrid and preview hooks.

export type ChatStarterTone = 'blue' | 'emerald' | 'violet'

export type ChatStarterSuggestion = {
  tone: ChatStarterTone
  title: string
  sub: string
  prompt: string
}

/** English copy matching Kun's promptStructureTitle locale string. */
export const CHAT_STARTER_STRUCTURE_TITLE = "Explain this project's structure"

/** English copy matching Kun's promptStructureSub locale string. */
export const CHAT_STARTER_STRUCTURE_SUB = 'Get a quick map of folders and key files'

/** English copy matching Kun's promptStructurePrompt locale string. */
export const CHAT_STARTER_STRUCTURE_PROMPT =
  "Please explain this project's overall structure, key folders, and how the entry files relate to each other."

/** English copy matching Kun's promptBugTitle locale string. */
export const CHAT_STARTER_BUG_TITLE = 'Help me find and fix a bug'

/** English copy matching Kun's promptBugSub locale string. */
export const CHAT_STARTER_BUG_SUB = 'Analyze the cause and suggest a fix'

/** English copy matching Kun's promptBugPrompt locale string. */
export const CHAT_STARTER_BUG_PROMPT =
  'I have a bug. Please help me locate the root cause and propose a fix.'

/** English copy matching Kun's promptPlanTitle locale string. */
export const CHAT_STARTER_PLAN_TITLE = 'Generate an implementation plan'

/** English copy matching Kun's promptPlanSub locale string. */
export const CHAT_STARTER_PLAN_SUB = 'Turn the request into a step-by-step plan'

/** English copy matching Kun's promptPlanPrompt locale string. */
export const CHAT_STARTER_PLAN_PROMPT =
  'Please break the following requirement into an implementation plan, including files to change and steps.'

/** Starter suggestions matching Kun's CHAT_STARTERS titleKey/subKey/promptKey trio. */
export const CHAT_STARTER_SUGGESTIONS: ChatStarterSuggestion[] = [
  {
    tone: 'blue',
    title: CHAT_STARTER_STRUCTURE_TITLE,
    sub: CHAT_STARTER_STRUCTURE_SUB,
    prompt: CHAT_STARTER_STRUCTURE_PROMPT,
  },
  {
    tone: 'emerald',
    title: CHAT_STARTER_BUG_TITLE,
    sub: CHAT_STARTER_BUG_SUB,
    prompt: CHAT_STARTER_BUG_PROMPT,
  },
  {
    tone: 'violet',
    title: CHAT_STARTER_PLAN_TITLE,
    sub: CHAT_STARTER_PLAN_SUB,
    prompt: CHAT_STARTER_PLAN_PROMPT,
  },
]
