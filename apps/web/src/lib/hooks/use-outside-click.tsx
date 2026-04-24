'use client';

import { useEffect, useCallback, RefObject } from 'react';

export const useOutsideClick = (
  ref: RefObject<HTMLInputElement | HTMLDivElement | null>,
  callback: (event: MouseEvent) => void,
) => {
  const stableCallback = useCallback((event: MouseEvent) => {
    if (!ref.current || ref.current.contains(event.target as Node)) return;
    callback(event);
  }, [callback, ref]);

  useEffect(() => {
    document.addEventListener('mousedown', stableCallback);
    return () => document.removeEventListener('mousedown', stableCallback);
  }, [stableCallback]);
};
