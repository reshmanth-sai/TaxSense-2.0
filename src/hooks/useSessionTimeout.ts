import { useEffect, useState, useRef } from 'react';
import { useTaxStore } from '../store/useTaxStore';

export function useSessionTimeout(timeoutMs: number = 30 * 60 * 1000) { // 30 minutes default
  const [isExpired, setIsExpired] = useState(false);
  const purgeSession = useTaxStore((state) => state.purgeSession);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Initialize or get last active time
    let lastActive = parseInt(sessionStorage.getItem('taxsense_last_active') || '0', 10);
    if (!lastActive) {
      lastActive = Date.now();
      sessionStorage.setItem('taxsense_last_active', lastActive.toString());
    }

    const resetTimer = () => {
      sessionStorage.setItem('taxsense_last_active', Date.now().toString());
    };

    // Events to track user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    // Check interval
    timerRef.current = setInterval(() => {
      const activeTime = parseInt(sessionStorage.getItem('taxsense_last_active') || '0', 10);
      if (Date.now() - activeTime > timeoutMs) {
        // Session expired
        setIsExpired(true);
        purgeSession();
        // Stop checking once expired
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, 10000); // Check every 10 seconds

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeoutMs, purgeSession]);

  return { isExpired, resetExpired: () => setIsExpired(false) };
}
