// Kun AgentsSettingsSection chrome
// (../Kun/src/renderer/src/components/settings-section-agents.tsx).
// Visual only — used for production AgentsSettingsSection and preview hooks.

/** English copy matching Kun's agentsQuickBase locale string. */
export const AGENTS_SETTINGS_AGENTS_QUICK_BASE = "Assistant"

/** English copy matching Kun's agentsQuickSkill locale string. */
export const AGENTS_SETTINGS_AGENTS_QUICK_SKILL = "Skills"

/** English copy matching Kun's agentsQuickMcp locale string. */
export const AGENTS_SETTINGS_AGENTS_QUICK_MCP = "External tools"

/** English copy matching Kun's agentsQuickPermissions locale string. */
export const AGENTS_SETTINGS_AGENTS_QUICK_PERMISSIONS = "Access"

/** English copy matching Kun's agents locale string. */
export const AGENTS_SETTINGS_AGENTS = "AI assistant"

/** English copy matching Kun's autoStart locale string. */
export const AGENTS_SETTINGS_AUTO_START = "Auto-start AI assistant service"

/** English copy matching Kun's autoStartDesc locale string. */
export const AGENTS_SETTINGS_AUTO_START_DESC = "Recommended. The app starts the local assistant service automatically when chats, writing, or phone connections need it."

/** English copy matching Kun's kunProvider locale string. */
export const AGENTS_SETTINGS_KUN_PROVIDER = "Model provider"

/** English copy matching Kun's kunProviderSelectDesc locale string. */
export const AGENTS_SETTINGS_KUN_PROVIDER_SELECT_DESC = "Choose one of the configured providers from the Providers tab."

/** English copy matching Kun's kunModel locale string. */
export const AGENTS_SETTINGS_KUN_MODEL = "Default model"

/** English copy matching Kun's kunModelDesc locale string. */
export const AGENTS_SETTINGS_KUN_MODEL_DESC = "Default model ID used by the AI assistant when a request does not choose one."

/** English copy matching Kun's modelSelectCustomOption locale string. */
export const AGENTS_SETTINGS_MODEL_SELECT_CUSTOM_OPTION = "Custom…"

/** English copy matching Kun's modelSelectCustomPlaceholder locale string. */
export const AGENTS_SETTINGS_MODEL_SELECT_CUSTOM_PLACEHOLDER = "Enter a model id"

/** English copy matching Kun's codePromptPrefix locale string. */
export const AGENTS_SETTINGS_CODE_PROMPT_PREFIX = "Code prompt prefix"

/** English copy matching Kun's codePromptPrefixDesc locale string. */
export const AGENTS_SETTINGS_CODE_PROMPT_PREFIX_DESC = "These instructions are injected before every Code mode conversation. Use for global rules, coding conventions, or persistent preferences."

/** English copy matching Kun's codePromptPrefixPlaceholder locale string. */
export const AGENTS_SETTINGS_CODE_PROMPT_PREFIX_PLACEHOLDER = "Example: Always write unit tests for new code. Prefer functional components over class components. Use TypeScript strict mode conventions."

/** English copy matching Kun's kunAssistantAdvanced locale string. */
export const AGENTS_SETTINGS_KUN_ASSISTANT_ADVANCED = "Assistant advanced settings"

/** English copy matching Kun's kunAssistantAdvancedDesc locale string. */
export const AGENTS_SETTINGS_KUN_ASSISTANT_ADVANCED_DESC = "Model, assistant-only API, local port, and data path settings for advanced users."

/** English copy matching Kun's port locale string. */
export const AGENTS_SETTINGS_PORT = "Local service port"

/** English copy matching Kun's portDesc locale string. */
export const AGENTS_SETTINGS_PORT_DESC = "Port used by the local AI assistant service. Most users do not need to change it."

/** English copy matching Kun's kunBinary locale string. */
export const AGENTS_SETTINGS_KUN_BINARY = "Custom assistant program path"

/** English copy matching Kun's kunBinaryDesc locale string. */
export const AGENTS_SETTINGS_KUN_BINARY_DESC = "Usually leave this empty so the app uses the bundled assistant service. Set a path only for local development or debugging."

/** English copy matching Kun's kunBinaryPlaceholder locale string. */
export const AGENTS_SETTINGS_KUN_BINARY_PLACEHOLDER = "e.g. /usr/local/bin/kun (optional)"

/** English copy matching Kun's kunDataDir locale string. */
export const AGENTS_SETTINGS_KUN_DATA_DIR = "Assistant data folder"

/** English copy matching Kun's kunDataDirDesc locale string. */
export const AGENTS_SETTINGS_KUN_DATA_DIR_DESC = "Stores sessions, cache data, and the configuration synced from the app to the assistant service."

/** English copy matching Kun's runtimeToken locale string. */
export const AGENTS_SETTINGS_RUNTIME_TOKEN = "Local access token (optional)"

/** English copy matching Kun's runtimeTokenDesc locale string. */
export const AGENTS_SETTINGS_RUNTIME_TOKEN_DESC = "Protects the assistant service running on this computer. Fill this only if another local program needs to connect to it."

/** English copy matching Kun's showSecret locale string. */
export const AGENTS_SETTINGS_SHOW_SECRET = "Show value"

/** English copy matching Kun's hideSecret locale string. */
export const AGENTS_SETTINGS_HIDE_SECRET = "Hide value"

/** English copy matching Kun's kunInsecure locale string. */
export const AGENTS_SETTINGS_KUN_INSECURE = "Allow local access without a token"

/** English copy matching Kun's kunInsecureDesc locale string. */
export const AGENTS_SETTINGS_KUN_INSECURE_DESC = "For local development only. Other local programs can connect to the assistant service without an access token."

/** English copy matching Kun's kunInsecureForcedDesc locale string. */
export const AGENTS_SETTINGS_KUN_INSECURE_FORCED_DESC = "Local access protection is off because no access token is set. Add a token to control this switch again."

/** English copy matching Kun's kunTokenEconomy locale string. */
export const AGENTS_SETTINGS_KUN_TOKEN_ECONOMY = "Reduce context usage"

/** English copy matching Kun's kunTokenEconomyDesc locale string. */
export const AGENTS_SETTINGS_KUN_TOKEN_ECONOMY_DESC = "Reduce model context use by compacting safe tool descriptions and tool results without changing stored chat history."

/** English copy matching Kun's kunTokenEconomySavingsLoading locale string. */
export const AGENTS_SETTINGS_KUN_TOKEN_ECONOMY_SAVINGS_LOADING = "Loading savings…"

/** English copy matching Kun's kunTokenEconomySavingsEmpty locale string. */
export const AGENTS_SETTINGS_KUN_TOKEN_ECONOMY_SAVINGS_EMPTY = "Saved tokens will start accumulating after the next request."

/** English copy matching Kun's permissions locale string. */
export const AGENTS_SETTINGS_PERMISSIONS = "Permissions"

/** English copy matching Kun's permissionsBehaviorHint locale string. */
export const AGENTS_SETTINGS_PERMISSIONS_BEHAVIOR_HINT = "Full access only controls which files and commands the AI assistant may reach. Confirmation is separate. By default, full access + automatic execution auto-allows approval requests."

/** English copy matching Kun's approvalPolicy locale string. */
export const AGENTS_SETTINGS_APPROVAL_POLICY = "Confirm before tool actions"

/** English copy matching Kun's approvalPolicyDesc locale string. */
export const AGENTS_SETTINGS_APPROVAL_POLICY_DESC = "Controls whether the AI assistant must ask before editing files, running commands, or using other tools. Changes apply on the next turn."

/** English copy matching Kun's approvalAuto locale string. */
export const AGENTS_SETTINGS_APPROVAL_AUTO = "Run automatically"

/** English copy matching Kun's approvalOnRequest locale string. */
export const AGENTS_SETTINGS_APPROVAL_ON_REQUEST = "Ask when needed"

/** English copy matching Kun's approvalUntrusted locale string. */
export const AGENTS_SETTINGS_APPROVAL_UNTRUSTED = "Ask for sensitive actions"

/** English copy matching Kun's approvalSuggest locale string. */
export const AGENTS_SETTINGS_APPROVAL_SUGGEST = "Suggest only; do not change files"

/** English copy matching Kun's approvalNever locale string. */
export const AGENTS_SETTINGS_APPROVAL_NEVER = "Do not run tools"

/** English copy matching Kun's sandboxMode locale string. */
export const AGENTS_SETTINGS_SANDBOX_MODE = "File access range"

/** English copy matching Kun's sandboxModeDesc locale string. */
export const AGENTS_SETTINGS_SANDBOX_MODE_DESC = "Controls which local files the AI assistant can read or change, and whether it can run terminal commands. Only \"Can access all files\" runs shell commands like bash — \"Can only read files\" and \"Can edit workspace\" block them. Changes apply on the next turn."

/** English copy matching Kun's sandboxWorkspaceWrite locale string. */
export const AGENTS_SETTINGS_SANDBOX_WORKSPACE_WRITE = "Can edit workspace"

/** English copy matching Kun's sandboxReadOnly locale string. */
export const AGENTS_SETTINGS_SANDBOX_READ_ONLY = "Can only read files"

/** English copy matching Kun's sandboxFullAccess locale string. */
export const AGENTS_SETTINGS_SANDBOX_FULL_ACCESS = "Can access all files"

/** English copy matching Kun's sandboxExternal locale string. */
export const AGENTS_SETTINGS_SANDBOX_EXTERNAL = "External sandbox"

/** English copy matching Kun's computerUseTitle locale string. */
export const AGENTS_SETTINGS_COMPUTER_USE_TITLE = "Computer use (screen control)"

/** English copy matching Kun's computerUseHint locale string. */
export const AGENTS_SETTINGS_COMPUTER_USE_HINT = "Lets the agent see your screen and move the mouse / type on your behalf. It controls your real computer — enable only when you intend to supervise it, and you can stop a run at any time."

/** English copy matching Kun's computerUseModelQualityTitle locale string. */
export const AGENTS_SETTINGS_COMPUTER_USE_MODEL_QUALITY_TITLE = "Model quality note"

/** English copy matching Kun's computerUseModelQualityBody locale string. */
export const AGENTS_SETTINGS_COMPUTER_USE_MODEL_QUALITY_BODY = "Chinese-mainland multimodal models (MiniMax, Qwen-VL, Kimi, Zhipu GLM, etc.) currently struggle with screenshot-driven visual grounding and multi-step desktop control — they often click the wrong target, fail to spot the icon they need, or trigger upstream 502s and cannot reliably complete a host-control task. For real use, prefer Claude (Sonnet / Opus vision) or GPT-class vision models; treat the domestic models as experimental for now."

/** English copy matching Kun's computerUseEnable locale string. */
export const AGENTS_SETTINGS_COMPUTER_USE_ENABLE = "Enable computer use"

/** English copy matching Kun's computerUseEnableDesc locale string. */
export const AGENTS_SETTINGS_COMPUTER_USE_ENABLE_DESC = "Registers the computer_use tool so the agent can take screenshots and drive the mouse and keyboard."

/** English copy matching Kun's computerUseMode locale string. */
export const AGENTS_SETTINGS_COMPUTER_USE_MODE = "Availability"

/** English copy matching Kun's computerUseModeDesc locale string. */
export const AGENTS_SETTINGS_COMPUTER_USE_MODE_DESC = "Auto exposes the tool only to vision (image-capable) models, which decide for themselves when to use it. Always exposes it to every model. Off keeps it registered but hidden."

/** English copy matching Kun's computerUseModeAuto locale string. */
export const AGENTS_SETTINGS_COMPUTER_USE_MODE_AUTO = "Auto (vision models only)"

/** English copy matching Kun's computerUseModeAlways locale string. */
export const AGENTS_SETTINGS_COMPUTER_USE_MODE_ALWAYS = "Always"

/** English copy matching Kun's computerUseModeOff locale string. */
export const AGENTS_SETTINGS_COMPUTER_USE_MODE_OFF = "Off"

/** English copy matching Kun's computerUsePermissions locale string. */
export const AGENTS_SETTINGS_COMPUTER_USE_PERMISSIONS = "System permissions"

/** English copy matching Kun's computerUsePermissionsDesc locale string. */
export const AGENTS_SETTINGS_COMPUTER_USE_PERMISSIONS_DESC = "macOS requires Accessibility (for mouse/keyboard) and Screen Recording (for screenshots). Grant both, then re-check."

/** English copy matching Kun's computerUseAccessibility locale string. */
export const AGENTS_SETTINGS_COMPUTER_USE_ACCESSIBILITY = "Accessibility"

/** English copy matching Kun's computerUseScreenRecording locale string. */
export const AGENTS_SETTINGS_COMPUTER_USE_SCREEN_RECORDING = "Screen Recording"

/** English copy matching Kun's computerUseGrantAccessibility locale string. */
export const AGENTS_SETTINGS_COMPUTER_USE_GRANT_ACCESSIBILITY = "Grant Accessibility"

/** English copy matching Kun's computerUseGrantScreenRecording locale string. */
export const AGENTS_SETTINGS_COMPUTER_USE_GRANT_SCREEN_RECORDING = "Open Screen Recording settings"

/** English copy matching Kun's computerUseRecheck locale string. */
export const AGENTS_SETTINGS_COMPUTER_USE_RECHECK = "Re-check"

/** English copy matching Kun's computerUsePermission_granted locale string. */
export const AGENTS_SETTINGS_COMPUTER_USE_PERMISSION_GRANTED = "granted"

/** English copy matching Kun's computerUsePermission_denied locale string. */
export const AGENTS_SETTINGS_COMPUTER_USE_PERMISSION_DENIED = "not granted"

/** English copy matching Kun's designQualityTitle locale string. */
export const AGENTS_SETTINGS_DESIGN_QUALITY_TITLE = "Design quality"

/** English copy matching Kun's designQualityHint locale string. */
export const AGENTS_SETTINGS_DESIGN_QUALITY_HINT = "After the agent writes or edits a frontend file (HTML/CSS/JSX/TSX/SVG), Kun automatically scans for AI-generated design tells and craft issues (purple-blue gradients, cream default backgrounds, bounce easing, nested cards, contrast, line length, missing reduced-motion, etc.) and folds the findings back to the model so it self-corrects on the next turn."

/** English copy matching Kun's designQualityEnable locale string. */
export const AGENTS_SETTINGS_DESIGN_QUALITY_ENABLE = "Enable design self-check"

/** English copy matching Kun's designQualityEnableDesc locale string. */
export const AGENTS_SETTINGS_DESIGN_QUALITY_ENABLE_DESC = "On by default. When off, writing/editing frontend files runs no design-quality scan."

/** English copy matching Kun's designQualityStrictness locale string. */
export const AGENTS_SETTINGS_DESIGN_QUALITY_STRICTNESS = "Strictness"

/** English copy matching Kun's designQualityStrictnessDesc locale string. */
export const AGENTS_SETTINGS_DESIGN_QUALITY_STRICTNESS_DESC = "Relaxed: only the most reliable AI tells. Standard: tells + general craft issues. Strict: adds heuristic rules (broader coverage, occasional false positives)."

/** English copy matching Kun's designQualityStrictnessRelaxed locale string. */
export const AGENTS_SETTINGS_DESIGN_QUALITY_STRICTNESS_RELAXED = "Relaxed"

/** English copy matching Kun's designQualityStrictnessStandard locale string. */
export const AGENTS_SETTINGS_DESIGN_QUALITY_STRICTNESS_STANDARD = "Standard"

/** English copy matching Kun's designQualityStrictnessStrict locale string. */
export const AGENTS_SETTINGS_DESIGN_QUALITY_STRICTNESS_STRICT = "Strict"

/** English copy matching Kun's skill locale string. */
export const AGENTS_SETTINGS_SKILL = "Skills"

/** English copy matching Kun's skillsDetectedDirs locale string. */
export const AGENTS_SETTINGS_SKILLS_DETECTED_DIRS = "Skill directories"

/** English copy matching Kun's skillsDetectedDirsDesc locale string. */
export const AGENTS_SETTINGS_SKILLS_DETECTED_DIRS_DESC = "Auto-detected .agents / .claude / .codex / skills folders (workspace + global) plus your extra folders below. Toggle which ones load; duplicate skill ids are de-duplicated with earlier rows winning."

/** English copy matching Kun's skillsDetectedDirsEmpty locale string. */
export const AGENTS_SETTINGS_SKILLS_DETECTED_DIRS_EMPTY = "No skill directories detected. Set a workspace, or add a folder below."

/** English copy matching Kun's loading locale string. */
export const AGENTS_SETTINGS_LOADING = "Loading…"

/** English copy matching Kun's skillsScopeProject locale string. */
export const AGENTS_SETTINGS_SKILLS_SCOPE_PROJECT = "Workspace"

/** English copy matching Kun's skillsScopeGlobal locale string. */
export const AGENTS_SETTINGS_SKILLS_SCOPE_GLOBAL = "Global"

/** English copy matching Kun's skillsDirNotFound locale string. */
export const AGENTS_SETTINGS_SKILLS_DIR_NOT_FOUND = "Not found"

/** English copy matching Kun's skillsOpenRoot locale string. */
export const AGENTS_SETTINGS_SKILLS_OPEN_ROOT = "Open directory"

/** English copy matching Kun's skillsScanDirs locale string. */
export const AGENTS_SETTINGS_SKILLS_SCAN_DIRS = "Extra skill folders"

/** English copy matching Kun's skillsScanDirsDesc locale string. */
export const AGENTS_SETTINGS_SKILLS_SCAN_DIRS_DESC = "One local path per line. Phone connections and scheduled tasks can also use skills from these folders."

/** English copy matching Kun's skillsActions locale string. */
export const AGENTS_SETTINGS_SKILLS_ACTIONS = "Skill management"

/** English copy matching Kun's skillsActionsDesc locale string. */
export const AGENTS_SETTINGS_SKILLS_ACTIONS_DESC = "Create, install, and edit skills from Plugins > Skills. Settings keeps only folder-level options."

/** English copy matching Kun's skillsOpenPlugins locale string. */
export const AGENTS_SETTINGS_SKILLS_OPEN_PLUGINS = "Open Plugins"

/** English copy matching Kun's mcp locale string. */
export const AGENTS_SETTINGS_MCP = "External tools"

/** English copy matching Kun's mcpSearchEnabled locale string. */
export const AGENTS_SETTINGS_MCP_SEARCH_ENABLED = "Smart external tool selection"

/** English copy matching Kun's mcpSearchEnabledDesc locale string. */
export const AGENTS_SETTINGS_MCP_SEARCH_ENABLED_DESC = "When many external tools are connected, give the model only the most relevant tools to reduce pauses and context use."

/** English copy matching Kun's mcpAdvanced locale string. */
export const AGENTS_SETTINGS_MCP_ADVANCED = "External tools advanced settings"

/** English copy matching Kun's mcpAdvancedDesc locale string. */
export const AGENTS_SETTINGS_MCP_ADVANCED_DESC = "Selection mode, candidate counts, connection config file, and save actions."

/** English copy matching Kun's mcpSearchMode locale string. */
export const AGENTS_SETTINGS_MCP_SEARCH_MODE = "Tool selection method"

/** English copy matching Kun's mcpSearchModeDesc locale string. */
export const AGENTS_SETTINGS_MCP_SEARCH_MODE_DESC = "Auto filters when many tools are connected; Always filter searches for relevant tools every time; Direct gives every tool to the model."

/** English copy matching Kun's mcpSearchModeAuto locale string. */
export const AGENTS_SETTINGS_MCP_SEARCH_MODE_AUTO = "Auto (recommended)"

/** English copy matching Kun's mcpSearchModeSearch locale string. */
export const AGENTS_SETTINGS_MCP_SEARCH_MODE_SEARCH = "Always filter"

/** English copy matching Kun's mcpSearchModeDirect locale string. */
export const AGENTS_SETTINGS_MCP_SEARCH_MODE_DIRECT = "Direct (all tools)"

/** English copy matching Kun's mcpSearchLimits locale string. */
export const AGENTS_SETTINGS_MCP_SEARCH_LIMITS = "Filter counts"

/** English copy matching Kun's mcpSearchLimitsDesc locale string. */
export const AGENTS_SETTINGS_MCP_SEARCH_LIMITS_DESC = "Control how many tools trigger filtering and how many candidate tools are offered each time."

/** English copy matching Kun's mcpSearchAutoThreshold locale string. */
export const AGENTS_SETTINGS_MCP_SEARCH_AUTO_THRESHOLD = "Start filtering after this many tools"

/** English copy matching Kun's mcpSearchTopKDefault locale string. */
export const AGENTS_SETTINGS_MCP_SEARCH_TOP_K_DEFAULT = "Default candidates"

/** English copy matching Kun's mcpSearchTopKMax locale string. */
export const AGENTS_SETTINGS_MCP_SEARCH_TOP_K_MAX = "Maximum candidates"

/** English copy matching Kun's mcpSearchMinScore locale string. */
export const AGENTS_SETTINGS_MCP_SEARCH_MIN_SCORE = "Minimum match"

/** English copy matching Kun's mcpSearchDiagnostics locale string. */
export const AGENTS_SETTINGS_MCP_SEARCH_DIAGNOSTICS = "Tool selection status"

/** English copy matching Kun's mcpSearchDiagnosticsDesc locale string. */
export const AGENTS_SETTINGS_MCP_SEARCH_DIAGNOSTICS_DESC = "See whether external tool filtering is active and how many tools are available."

/** English copy matching Kun's mcpSearchStatus locale string. */
export const AGENTS_SETTINGS_MCP_SEARCH_STATUS = "Status"

/** English copy matching Kun's mcpSearchActive locale string. */
export const AGENTS_SETTINGS_MCP_SEARCH_ACTIVE = "active"

/** English copy matching Kun's mcpSearchInactive locale string. */
export const AGENTS_SETTINGS_MCP_SEARCH_INACTIVE = "inactive"

/** English copy matching Kun's mcpSearchIndexed locale string. */
export const AGENTS_SETTINGS_MCP_SEARCH_INDEXED = "Filterable tools"

/** English copy matching Kun's mcpSearchAdvertised locale string. */
export const AGENTS_SETTINGS_MCP_SEARCH_ADVERTISED = "Offered to model"

/** English copy matching Kun's configFilePath locale string. */
export const AGENTS_SETTINGS_CONFIG_FILE_PATH = "External tool config path"

/** English copy matching Kun's mcpPathDesc locale string. */
export const AGENTS_SETTINGS_MCP_PATH_DESC = "Location of the external tool connection config file."

/** English copy matching Kun's mcpEditor locale string. */
export const AGENTS_SETTINGS_MCP_EDITOR = "External tool config"

/** English copy matching Kun's mcpEditorDesc locale string. */
export const AGENTS_SETTINGS_MCP_EDITOR_DESC = "Edit MCP external tool server connections here. Model, API key, and service URL do not live in this file; they are managed by Basics and model config."

/** English copy matching Kun's mcpFileStatusReady locale string. */
export const AGENTS_SETTINGS_MCP_FILE_STATUS_READY = "The current content was loaded from the config file."

/** English copy matching Kun's mcpFileStatusMissing locale string. */
export const AGENTS_SETTINGS_MCP_FILE_STATUS_MISSING = "The config file does not exist yet. It will be created on first save."

/** English copy matching Kun's mcpActions locale string. */
export const AGENTS_SETTINGS_MCP_ACTIONS = "External tool actions"

/** English copy matching Kun's mcpRuntimeHint locale string. */
export const AGENTS_SETTINGS_MCP_RUNTIME_HINT = "If saved changes do not take effect, restart the local assistant service or reopen the app."

/** English copy matching Kun's mcpSave locale string. */
export const AGENTS_SETTINGS_MCP_SAVE = "Save config"

/** English copy matching Kun's mcpReload locale string. */
export const AGENTS_SETTINGS_MCP_RELOAD = "Reload"

/** English copy matching Kun's mcpOpenDir locale string. */
export const AGENTS_SETTINGS_MCP_OPEN_DIR = "Open config directory"

/** English copy matching Kun's kunAdvanced locale string. */
export const AGENTS_SETTINGS_KUN_ADVANCED = "Advanced runtime settings"

/** English copy matching Kun's kunAdvancedDetails locale string. */
export const AGENTS_SETTINGS_KUN_ADVANCED_DETAILS = "Storage, model context, and tool guards"

/** English copy matching Kun's kunAdvancedDetailsDesc locale string. */
export const AGENTS_SETTINGS_KUN_ADVANCED_DETAILS_DESC = "These options affect how the assistant runs internally. Per-model context policy comes from models.profiles; this page mainly adjusts fallback behavior."

/** English copy matching Kun's kunTokenEconomyOptions locale string. */
export const AGENTS_SETTINGS_KUN_TOKEN_ECONOMY_OPTIONS = "What to compact"

/** English copy matching Kun's kunTokenEconomyOptionsDesc locale string. */
export const AGENTS_SETTINGS_KUN_TOKEN_ECONOMY_OPTIONS_DESC = "When context reduction is on, choose which request content is compacted before it reaches the model."

/** English copy matching Kun's kunCompressToolDescriptions locale string. */
export const AGENTS_SETTINGS_KUN_COMPRESS_TOOL_DESCRIPTIONS = "Tool descriptions"

/** English copy matching Kun's kunCompressToolResults locale string. */
export const AGENTS_SETTINGS_KUN_COMPRESS_TOOL_RESULTS = "Tool results"

/** English copy matching Kun's kunConciseResponses locale string. */
export const AGENTS_SETTINGS_KUN_CONCISE_RESPONSES = "Shorter replies"

/** English copy matching Kun's kunHistoryHygiene locale string. */
export const AGENTS_SETTINGS_KUN_HISTORY_HYGIENE = "Long history guard"

/** English copy matching Kun's kunHistoryHygieneDesc locale string. */
export const AGENTS_SETTINGS_KUN_HISTORY_HYGIENE_DESC = "Before each model request, cap long tool results and tool arguments. Original chat history is kept unchanged."

/** English copy matching Kun's kunHistoryMaxResultLines locale string. */
export const AGENTS_SETTINGS_KUN_HISTORY_MAX_RESULT_LINES = "Tool result lines"

/** English copy matching Kun's kunHistoryMaxResultBytes locale string. */
export const AGENTS_SETTINGS_KUN_HISTORY_MAX_RESULT_BYTES = "Tool result bytes"

/** English copy matching Kun's kunHistoryMaxResultTokens locale string. */
export const AGENTS_SETTINGS_KUN_HISTORY_MAX_RESULT_TOKENS = "Tool result tokens"

/** English copy matching Kun's kunHistoryMaxArgumentBytes locale string. */
export const AGENTS_SETTINGS_KUN_HISTORY_MAX_ARGUMENT_BYTES = "Tool argument bytes"

/** English copy matching Kun's kunHistoryMaxArgumentTokens locale string. */
export const AGENTS_SETTINGS_KUN_HISTORY_MAX_ARGUMENT_TOKENS = "Tool argument tokens"

/** English copy matching Kun's kunHistoryMaxArrayItems locale string. */
export const AGENTS_SETTINGS_KUN_HISTORY_MAX_ARRAY_ITEMS = "Array items kept"

/** English copy matching Kun's kunModelContextProfile locale string. */
export const AGENTS_SETTINGS_KUN_MODEL_CONTEXT_PROFILE = "Current model context policy"

/** English copy matching Kun's kunModelContextProfileDesc locale string. */
export const AGENTS_SETTINGS_KUN_MODEL_CONTEXT_PROFILE_DESC = "Model windows and per-model compaction thresholds come from models.profiles in local config.json. DeepSeek V4 defaults to a 1M context window and starts compaction around 980k."

/** English copy matching Kun's kunModelContextModel locale string. */
export const AGENTS_SETTINGS_KUN_MODEL_CONTEXT_MODEL = "Model"

/** English copy matching Kun's kunModelContextWindow locale string. */
export const AGENTS_SETTINGS_KUN_MODEL_CONTEXT_WINDOW = "Context window tokens"

/** English copy matching Kun's kunModelContextSoft locale string. */
export const AGENTS_SETTINGS_KUN_MODEL_CONTEXT_SOFT = "Model start compaction tokens"

/** English copy matching Kun's kunModelContextHard locale string. */
export const AGENTS_SETTINGS_KUN_MODEL_CONTEXT_HARD = "Model force compaction tokens"

/** English copy matching Kun's kunModelContextSourceBuiltIn locale string. */
export const AGENTS_SETTINGS_KUN_MODEL_CONTEXT_SOURCE_BUILT_IN = "Built-in model config"

/** English copy matching Kun's kunStorageBackend locale string. */
export const AGENTS_SETTINGS_KUN_STORAGE_BACKEND = "Conversation storage"

/** English copy matching Kun's kunStorageBackendDesc locale string. */
export const AGENTS_SETTINGS_KUN_STORAGE_BACKEND_DESC = "Hybrid storage uses SQLite to speed up indexes. Pure JSONL does not use SQLite and is simpler for compatibility debugging."

/** English copy matching Kun's kunStorageHybrid locale string. */
export const AGENTS_SETTINGS_KUN_STORAGE_HYBRID = "Hybrid storage (recommended)"

/** English copy matching Kun's kunStorageFile locale string. */
export const AGENTS_SETTINGS_KUN_STORAGE_FILE = "Pure JSONL file storage"

/** English copy matching Kun's kunStorageSqlitePath locale string. */
export const AGENTS_SETTINGS_KUN_STORAGE_SQLITE_PATH = "SQLite index path"

/** English copy matching Kun's kunStorageSqlitePathDesc locale string. */
export const AGENTS_SETTINGS_KUN_STORAGE_SQLITE_PATH_DESC = "Optional. Leave empty to create the index under the assistant data folder. Used only with hybrid storage."

/** English copy matching Kun's kunStorageSqlitePathPlaceholder locale string. */
export const AGENTS_SETTINGS_KUN_STORAGE_SQLITE_PATH_PLACEHOLDER = "Leave empty to manage automatically"

/** English copy matching Kun's kunCompactionThresholds locale string. */
export const AGENTS_SETTINGS_KUN_COMPACTION_THRESHOLDS = "Unknown-model fallback compaction thresholds"

/** English copy matching Kun's kunCompactionThresholdsDesc locale string. */
export const AGENTS_SETTINGS_KUN_COMPACTION_THRESHOLDS_DESC = "These values are used only when the current model does not match models.profiles. Known models such as DeepSeek V4 use their model profile thresholds."

/** English copy matching Kun's kunCompactionSoftThreshold locale string. */
export const AGENTS_SETTINGS_KUN_COMPACTION_SOFT_THRESHOLD = "Fallback start compaction tokens"

/** English copy matching Kun's kunCompactionHardThreshold locale string. */
export const AGENTS_SETTINGS_KUN_COMPACTION_HARD_THRESHOLD = "Fallback force compaction tokens"

/** English copy matching Kun's kunCompactionSummary locale string. */
export const AGENTS_SETTINGS_KUN_COMPACTION_SUMMARY = "Compaction summary"

/** English copy matching Kun's kunCompactionSummaryDesc locale string. */
export const AGENTS_SETTINGS_KUN_COMPACTION_SUMMARY_DESC = "Local summaries are fast and free. Model summaries read more naturally but use an extra model request."

/** English copy matching Kun's kunCompactionSummaryMode locale string. */
export const AGENTS_SETTINGS_KUN_COMPACTION_SUMMARY_MODE = "Summary mode"

/** English copy matching Kun's kunCompactionSummaryHeuristic locale string. */
export const AGENTS_SETTINGS_KUN_COMPACTION_SUMMARY_HEURISTIC = "Local rules (recommended)"

/** English copy matching Kun's kunCompactionSummaryModel locale string. */
export const AGENTS_SETTINGS_KUN_COMPACTION_SUMMARY_MODEL = "Model generated"

/** English copy matching Kun's kunCompactionSummaryTimeout locale string. */
export const AGENTS_SETTINGS_KUN_COMPACTION_SUMMARY_TIMEOUT = "Summary timeout ms"

/** English copy matching Kun's kunCompactionSummaryMaxTokens locale string. */
export const AGENTS_SETTINGS_KUN_COMPACTION_SUMMARY_MAX_TOKENS = "Summary max tokens"

/** English copy matching Kun's kunCompactionSummaryInputBytes locale string. */
export const AGENTS_SETTINGS_KUN_COMPACTION_SUMMARY_INPUT_BYTES = "Summary input bytes"

/** English copy matching Kun's kunStreamIdleTimeout locale string. */
export const AGENTS_SETTINGS_KUN_STREAM_IDLE_TIMEOUT = "Stream idle timeout (ms)"

/** English copy matching Kun's kunStreamIdleTimeoutDesc locale string. */
export const AGENTS_SETTINGS_KUN_STREAM_IDLE_TIMEOUT_DESC = "Fail the turn if the model sends no data for this many milliseconds. Raise it for local LLM servers that stay silent while prefilling a large prompt; set 0 to disable the limit. Default 45000."

/** English copy matching Kun's kunToolStorm locale string. */
export const AGENTS_SETTINGS_KUN_TOOL_STORM = "Repeated tool-call protection"

/** English copy matching Kun's kunToolStormDesc locale string. */
export const AGENTS_SETTINGS_KUN_TOOL_STORM_DESC = "When the model repeats the exact same tool call in one turn, suppress the duplicate and ask it to change approach."

/** English copy matching Kun's kunToolStormLimits locale string. */
export const AGENTS_SETTINGS_KUN_TOOL_STORM_LIMITS = "Repeat detection"

/** English copy matching Kun's kunToolStormLimitsDesc locale string. */
export const AGENTS_SETTINGS_KUN_TOOL_STORM_LIMITS_DESC = "A larger window watches more recent tool calls. A lower threshold suppresses repeated calls sooner."

/** English copy matching Kun's kunToolStormWindowSize locale string. */
export const AGENTS_SETTINGS_KUN_TOOL_STORM_WINDOW_SIZE = "Watch window"

/** English copy matching Kun's kunToolStormThreshold locale string. */
export const AGENTS_SETTINGS_KUN_TOOL_STORM_THRESHOLD = "Repeat threshold"

/** English copy matching Kun's kunToolArgumentRepair locale string. */
export const AGENTS_SETTINGS_KUN_TOOL_ARGUMENT_REPAIR = "Tool argument max string"

/** English copy matching Kun's kunToolArgumentRepairDesc locale string. */
export const AGENTS_SETTINGS_KUN_TOOL_ARGUMENT_REPAIR_DESC = "Single string arguments longer than this byte count are truncated before tool execution, avoiding unusually large arguments."

/** English copy matching Kun's kunDiagnostics locale string. */
export const AGENTS_SETTINGS_KUN_DIAGNOSTICS = "Assistant status"

/** English copy matching Kun's kunDiagnosticsAdvanced locale string. */
export const AGENTS_SETTINGS_KUN_DIAGNOSTICS_ADVANCED = "View detailed status"

/** English copy matching Kun's kunDiagnosticsAdvancedDesc locale string. */
export const AGENTS_SETTINGS_KUN_DIAGNOSTICS_ADVANCED_DESC = "Runtime abilities, tool connections, and memory records."

/** English copy matching Kun's kunRuntimeCapabilities locale string. */
export const AGENTS_SETTINGS_KUN_RUNTIME_CAPABILITIES = "Available abilities"

/** English copy matching Kun's kunRuntimeCapabilitiesDesc locale string. */
export const AGENTS_SETTINGS_KUN_RUNTIME_CAPABILITIES_DESC = "Check whether the local AI assistant service currently has web, skills, attachments, and memory available."

/** English copy matching Kun's kunRuntimeModel locale string. */
export const AGENTS_SETTINGS_KUN_RUNTIME_MODEL = "Model"

/** English copy matching Kun's kunRuntimePid locale string. */
export const AGENTS_SETTINGS_KUN_RUNTIME_PID = "Process ID"

/** English copy matching Kun's kunDiagnosticsRefresh locale string. */
export const AGENTS_SETTINGS_KUN_DIAGNOSTICS_REFRESH = "Refresh diagnostics"

/** English copy matching Kun's kunToolDiagnostics locale string. */
export const AGENTS_SETTINGS_KUN_TOOL_DIAGNOSTICS = "Tool status"

/** English copy matching Kun's kunToolDiagnosticsDesc locale string. */
export const AGENTS_SETTINGS_KUN_TOOL_DIAGNOSTICS_DESC = "Check connected tool sources, external tool services, skills, attachments, and memory."

/** English copy matching Kun's kunDiagnosticsProviders locale string. */
export const AGENTS_SETTINGS_KUN_DIAGNOSTICS_PROVIDERS = "Tool sources"

/** English copy matching Kun's kunDiagnosticsMcpServers locale string. */
export const AGENTS_SETTINGS_KUN_DIAGNOSTICS_MCP_SERVERS = "External tool services"

/** English copy matching Kun's kunDiagnosticsSkills locale string. */
export const AGENTS_SETTINGS_KUN_DIAGNOSTICS_SKILLS = "Skills"

/** English copy matching Kun's kunDiagnosticsAttachments locale string. */
export const AGENTS_SETTINGS_KUN_DIAGNOSTICS_ATTACHMENTS = "Attachments"

/** English copy matching Kun's kunMemoryRecords locale string. */
export const AGENTS_SETTINGS_KUN_MEMORY_RECORDS = "Saved memories"

/** English copy matching Kun's kunMemoryRecordsDesc locale string. */
export const AGENTS_SETTINGS_KUN_MEMORY_RECORDS_DESC = "Review memories available to this workspace, then disable or delete anything you do not want reused."

/** English copy matching Kun's kunMemoryEmpty locale string. */
export const AGENTS_SETTINGS_KUN_MEMORY_EMPTY = "No memory records are visible for this workspace."

/** English copy matching Kun's kunMemoryDisabled locale string. */
export const AGENTS_SETTINGS_KUN_MEMORY_DISABLED = "disabled"

/** English copy matching Kun's kunMemoryDisable locale string. */
export const AGENTS_SETTINGS_KUN_MEMORY_DISABLE = "Disable memory"

/** English copy matching Kun's kunMemoryDelete locale string. */
export const AGENTS_SETTINGS_KUN_MEMORY_DELETE = "Delete memory"

/** English copy matching Kun's modelSelectDefaultSuffix locale string. */
export function formatAgentsSettingsModelSelectDefaultSuffix(model: string): string {
  return `${model} (default)`
}

/** English copy matching Kun's kunTokenEconomySavings locale string. */
export function formatAgentsSettingsTokenEconomySavings(tokens: string): string {
  return `Saved about ${tokens} tokens`
}

/** English copy matching Kun's skillsDirSkillCount locale string. */
export function formatAgentsSettingsSkillsDirSkillCount(count: number): string {
  return `${count} skills`
}

