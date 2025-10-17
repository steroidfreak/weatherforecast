import { ToolResult, WeatherPayload } from './types';

export function extractWeatherPayload(result: ToolResult | undefined | null): WeatherPayload | undefined {
  if (!result) {
    return undefined;
  }

  const { structuredContent } = result;
  if (structuredContent && isWeatherPayload(structuredContent)) {
    return structuredContent;
  }

  const jsonItem = result.content?.find((item) => item.type === 'json');
  if (jsonItem && isWeatherPayload((jsonItem as { json?: unknown }).json)) {
    return (jsonItem as { json?: WeatherPayload }).json;
  }

  const textItem = result.content?.find((item) => item.type === 'text');
  if (textItem && typeof (textItem as { text?: unknown }).text === 'string') {
    try {
      const parsed = JSON.parse((textItem as { text: string }).text);
      if (isWeatherPayload(parsed)) {
        return parsed;
      }
    } catch (error) {
      console.warn('Failed to parse weather payload from text content', error);
    }
  }

  return undefined;
}

export function isWeatherPayload(value: unknown): value is WeatherPayload {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as WeatherPayload;
  return (
    typeof candidate.location === 'string' &&
    typeof candidate.description === 'string' &&
    typeof candidate.observedAt === 'string' &&
    typeof candidate.source === 'string' &&
    typeof candidate.temperatureC === 'number'
  );
}

export function formatTemperature(value: number, suffix: 'C' | 'F'): string {
  if (Number.isFinite(value)) {
    return `${value.toFixed(1)}°${suffix}`;
  }
  return '–';
}

export function formatObservedAt(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return date.toLocaleString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
