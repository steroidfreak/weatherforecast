import { useCallback, useEffect, useMemo, useState } from 'react';
import { WeatherCard } from './components/WeatherCard';
import { useOpenaiGlobal } from './hooks/useOpenaiGlobal';
import { useMaxHeight } from './hooks/useMaxHeight';
import { extractWeatherPayload } from './utils';
import { ToolResult, WeatherPayload } from './types';

type LoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: WeatherPayload }
  | { status: 'error'; message: string };

const DEFAULT_COORDINATES = { lat: 37.7749, lon: -122.4194 };

export function App() {
  const [state, setState] = useState<LoadState>({ status: 'idle' });
  const displayMode = useOpenaiGlobal<'inline' | 'fullscreen'>('displayMode');
  const maxHeight = useMaxHeight(displayMode === 'inline' ? 480 : 720);
  const [isDarkMode, setIsDarkMode] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);

  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mediaQuery) {
      return;
    }

    const listener = (event: MediaQueryListEvent) => setIsDarkMode(event.matches);
    mediaQuery.addEventListener?.('change', listener);
    return () => mediaQuery.removeEventListener?.('change', listener);
  }, []);

  const callWeatherTool = useCallback(async () => {
    if (!window.openai?.callTool) {
      setState({
        status: 'error',
        message: 'OpenAI Apps SDK not detected. Load this widget from an OpenAI app session.',
      });
      return;
    }

    try {
      setState({ status: 'loading' });
      const result = (await window.openai.callTool('get_weather', DEFAULT_COORDINATES)) as ToolResult;
      const payload = extractWeatherPayload(result);
      if (!payload) {
        throw new Error('Weather tool returned an empty payload.');
      }
      setState({ status: 'success', data: payload });
    } catch (error) {
      console.error('Weather tool failed', error);
      const message = error instanceof Error ? error.message : 'Unable to load weather details. Please try again.';
      setState({ status: 'error', message });
    }
  }, []);

  useEffect(() => {
    if (state.status === 'idle') {
      void callWeatherTool();
    }
  }, [callWeatherTool, state.status]);

  const content = useMemo(() => {
    switch (state.status) {
      case 'loading':
        return <p className="loading">Fetching San Francisco weather…</p>;
      case 'error':
        return (
          <p className="error" role="alert">
            {state.message}
          </p>
        );
      case 'success':
        return <WeatherCard payload={state.data} isDarkMode={isDarkMode} />;
      default:
        return null;
    }
  }, [state, isDarkMode]);

  return (
    <main
      className={`widget-frame${displayMode === 'fullscreen' ? ' fullscreen' : ''}`}
      style={{ maxHeight }}
      data-mode={displayMode}
    >
      {content ?? <p className="loading">Preparing weather widget…</p>}
    </main>
  );
}

export default App;
