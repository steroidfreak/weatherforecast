export interface WeatherPayload {
  location: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  description: string;
  temperatureC: number;
  temperatureF: number;
  humidity: number;
  windKph: number;
  observedAt: string;
  source: 'openweathermap';
}

export type ToolResultContent =
  | { type: 'json'; json?: unknown }
  | { type: 'text'; text?: string }
  | { type: string; [key: string]: unknown };

export interface ToolResult {
  content?: ToolResultContent[];
  structuredContent?: unknown;
}
