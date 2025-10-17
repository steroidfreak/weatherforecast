export interface OpenAIWidgetClient {
  readonly displayMode?: 'inline' | 'fullscreen';
  readonly maxHeight?: number;
  callTool?: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  off?: (event: string, handler: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    openai?: OpenAIWidgetClient;
  }
}

export {};
