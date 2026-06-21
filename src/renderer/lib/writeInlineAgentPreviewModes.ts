// Shared WriteInlineAgent preview mode identifiers.

export type WriteInlineAgentPreviewMode =
  | 'default'
  | 'blockMenu'
  | 'emptyAgents'
  | 'askOnly'
  | 'preferAbove'
  | 'inFlight'
  | 'skills'
  | 'imageMode'

export function resolveWriteInlineAgentPreviewMode(
  params: URLSearchParams,
): WriteInlineAgentPreviewMode | null {
  if (!params.has('writeInlineAgent')) return null
  const value = params.get('writeInlineAgent')
  if (value === 'blockMenu') return 'blockMenu'
  if (value === 'emptyAgents') return 'emptyAgents'
  if (value === 'askOnly') return 'askOnly'
  if (value === 'preferAbove') return 'preferAbove'
  if (value === 'inFlight') return 'inFlight'
  if (value === 'skills') return 'skills'
  if (value === 'imageMode') return 'imageMode'
  return 'default'
}
