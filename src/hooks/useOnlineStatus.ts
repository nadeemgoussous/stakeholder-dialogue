import { useState, useEffect } from 'react';

/**
 * Custom hook to detect online/offline status
 *
 * This hook listens to browser online/offline events and provides
 * the current network status. This is critical for the offline-first
 * architecture - we need to gracefully handle offline mode without
 * alarming the user.
 */
export function useOnlineStatus(): boolean {
  // Initialize with current online status
  const [isOnline, setIsOnline] = useState(() => {
    // Check if navigator is available (for SSR compatibility)
    if (typeof navigator !== 'undefined' && typeof navigator.onLine !== 'undefined') {
      return navigator.onLine;
    }
    // Default to online if we can't determine
    return true;
  });

  useEffect(() => {
    // Event handlers
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Register event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
