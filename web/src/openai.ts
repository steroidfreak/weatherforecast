import { useSyncExternalStore } from 'react'

export type UnknownObject = Record<string, unknown>

export type CallToolResponse = {
  content?: Array<{ type: string; text?: string }>
  structuredContent?: UnknownObject
  _meta?: UnknownObject
}

export type DisplayMode = 'pip' | 'inline' | 'fullscreen'

export type Theme = 'light' | 'dark'

export type SafeAreaInsets = {
  top: number
  bottom: number
  left: number
  right: number
}

export type SafeArea = {
  insets: SafeAreaInsets
}

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'unknown'

export type UserAgent = {
  device: { type: DeviceType }
  capabilities: {
    hover: boolean
    touch: boolean
  }
}

export type OpenAiGlobals<
  ToolInput extends UnknownObject = UnknownObject,
  ToolOutput extends UnknownObject = UnknownObject,
  ToolResponseMetadata extends UnknownObject = UnknownObject,
  WidgetState extends UnknownObject = UnknownObject
> = {
  theme: Theme
  userAgent: UserAgent
  locale: string

  // layout
  maxHeight: number
  displayMode: DisplayMode
  safeArea: SafeArea

  // state
  toolInput: ToolInput
  toolOutput: ToolOutput | null
  toolResponseMetadata: ToolResponseMetadata | null
  widgetState: WidgetState | null
}

export type API<WidgetState extends UnknownObject> = {
  /** Calls a tool on your MCP. Returns the full response. */
  callTool: (name: string, args: Record<string, unknown>) => Promise<CallToolResponse>

  /** Triggers a followup turn in the ChatGPT conversation */
  sendFollowUpMessage: (args: { prompt: string }) => Promise<void>

  /** Opens an external link, redirects web page or mobile app */
  openExternal(payload: { href: string }): void

  /** For transitioning an app from inline to fullscreen or pip */
  requestDisplayMode: (args: { mode: DisplayMode }) => Promise<{
    /**
     * The granted display mode. The host may reject the request.
     * For mobile, PiP is always coerced to fullscreen.
     */
    mode: DisplayMode
  }>

  setWidgetState: (state: WidgetState) => Promise<void>
}

export type CallTool = (
  name: string,
  args: Record<string, unknown>
) => Promise<CallToolResponse>

export const SET_GLOBALS_EVENT_TYPE = 'openai:set_globals'

export class SetGlobalsEvent<
  ToolInput extends UnknownObject = UnknownObject,
  ToolOutput extends UnknownObject = UnknownObject,
  ToolResponseMetadata extends UnknownObject = UnknownObject,
  WidgetState extends UnknownObject = UnknownObject
> extends CustomEvent<{
  globals: Partial<OpenAiGlobals<ToolInput, ToolOutput, ToolResponseMetadata, WidgetState>>
}> {
  readonly type = SET_GLOBALS_EVENT_TYPE

  constructor(
    detail: {
      globals: Partial<OpenAiGlobals<ToolInput, ToolOutput, ToolResponseMetadata, WidgetState>>
    }
  ) {
    super(SET_GLOBALS_EVENT_TYPE, { detail })
  }
}

declare global {
  interface Window {
    openai: API<UnknownObject> & OpenAiGlobals
  }

  interface WindowEventMap {
    [SET_GLOBALS_EVENT_TYPE]: SetGlobalsEvent
  }
}

export function useOpenAiGlobal<K extends keyof OpenAiGlobals>(key: K): OpenAiGlobals[K] {
  return useSyncExternalStore(
    (onChange) => {
      const handleSetGlobal = (event: SetGlobalsEvent) => {
        const value = event.detail.globals[key]
        if (value === undefined) {
          return
        }

        onChange()
      }

      window.addEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal, {
        passive: true
      })

      return () => {
        window.removeEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal)
      }
    },
    () => window.openai[key]
  )
}

export function useToolInput<TInput = UnknownObject>() {
  return useOpenAiGlobal('toolInput') as TInput
}

export function useToolOutput<TOutput = UnknownObject | null>() {
  return useOpenAiGlobal('toolOutput') as TOutput
}

export function useToolResponseMetadata<TMetadata = UnknownObject | null>() {
  return useOpenAiGlobal('toolResponseMetadata') as TMetadata
}

export function useWidgetState<TState = UnknownObject | null>() {
  return useOpenAiGlobal('widgetState') as TState
}
