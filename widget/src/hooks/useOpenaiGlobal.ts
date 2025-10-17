import { useEffect, useState } from 'react';

type Listener = (...args: unknown[]) => void;

const GLOBAL_UPDATE_EVENT = 'openai:global';

export function useOpenaiGlobal<T = unknown>(key: keyof NonNullable<Window['openai']> | string) {
  const [value, setValue] = useState<T | undefined>(() => {
    const client = window.openai as Record<string, T> | undefined;
    return client?.[key as string];
  });

  useEffect(() => {
    const client = window.openai as (Window['openai'] & {
      on?: (event: string, handler: Listener) => void;
      off?: (event: string, handler: Listener) => void;
    }) | null;

    if (!client) {
      return;
    }

    const handler: Listener = (...args) => {
      const [payload] = args as [{ key: string; value: T } | undefined];
      if (payload && payload.key === key) {
        setValue(payload.value);
      } else {
        setValue(client[key as keyof typeof client] as T);
      }
    };

    client.on?.(GLOBAL_UPDATE_EVENT, handler);

    return () => {
      client.off?.(GLOBAL_UPDATE_EVENT, handler);
    };
  }, [key]);

  return value;
}
