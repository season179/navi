import { createAgent } from '@flue/runtime'

export default createAgent(() => ({
  model: 'anthropic/claude-sonnet-4-6',
  instructions: [
    'You are Navi, an AI assistant inside a local-first desktop app.',
    'Be concise and helpful with writing, coding, analysis, and questions.',
  ].join('\n'),
}))
