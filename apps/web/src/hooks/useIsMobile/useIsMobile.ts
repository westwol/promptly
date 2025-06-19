import { useCallback, useEffect, useState } from 'react';

export const useIsMobile = (mobileScreenSize = 768) => {
  const [isMobile, setIsMobile] = useState(false);

  const checkIsMobile = useCallback((event: MediaQueryListEvent) => {
    setIsMobile(event.matches);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (typeof window.matchMedia !== 'function') {
      console.warn('matchMedia not supported by browser!');
      return;
    }

    const mediaListener = window.matchMedia(`(max-width: ${mobileScreenSize}px)`);

    // Set initial state
    setIsMobile(mediaListener.matches);

    try {
      mediaListener.addEventListener('change', checkIsMobile);
    } catch {
      mediaListener.addListener(checkIsMobile);
    }

    return () => {
      try {
        mediaListener.removeEventListener('change', checkIsMobile);
      } catch {
        mediaListener.removeListener(checkIsMobile);
      }
    };
  }, [mobileScreenSize, checkIsMobile]);

  return isMobile;
};
