import { useEffect, useState } from 'react';

const CSS_VARIABLE = '--openai-max-height';

function readCssMaxHeight(): number | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const value = getComputedStyle(document.documentElement).getPropertyValue(CSS_VARIABLE);
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function useMaxHeight(fallback = 640) {
  const [maxHeight, setMaxHeight] = useState<number>(() => {
    return window.openai?.maxHeight ?? readCssMaxHeight() ?? fallback;
  });

  useEffect(() => {
    const handleResize = () => {
      const cssHeight = readCssMaxHeight();
      setMaxHeight(window.openai?.maxHeight ?? cssHeight ?? Math.min(window.innerHeight, fallback));
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [fallback]);

  return maxHeight;
}
