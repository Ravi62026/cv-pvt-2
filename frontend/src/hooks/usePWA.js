import { useEffect, useState } from 'react';

export const usePWA = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    // Check if app is installed (running in standalone mode)
    const checkInstalled = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone === true;
      setIsInstalled(standalone);
    };

    checkInstalled();

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register service worker if supported
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      setRegistration(registration);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content is available - only show in production
            if (import.meta.env.PROD) {
              setUpdateAvailable(true);
            }
          }
        });
      });

      console.log('Service Worker registered successfully');
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  const updateApp = () => {
    if (registration && registration.waiting) {
      // Tell the waiting service worker to skip waiting and become active
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Listen for the controlling service worker change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Reload the page to get the new content
        window.location.reload();
      });
    }
  };

  const installApp = async () => {
    // This would be handled by the PWAInstallPrompt component
    // but we can provide a programmatic way to trigger it
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      const { outcome } = await window.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setIsInstalled(true);
      }
      
      window.deferredPrompt = null;
    }
  };

  // PWA capabilities detection
  const capabilities = {
    serviceWorker: 'serviceWorker' in navigator,
    notification: 'Notification' in window,
    backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
    pushMessaging: 'serviceWorker' in navigator && 'PushManager' in window,
    badging: 'setAppBadge' in navigator,
    webShare: 'share' in navigator,
    fullscreen: 'requestFullscreen' in document.documentElement,
    wakeLock: 'wakeLock' in navigator
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (!capabilities.notification) {
      return 'not-supported';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  };

  // Show notification
  const showNotification = (title, options = {}) => {
    if (Notification.permission === 'granted') {
      if (registration) {
        // Use service worker to show notification
        registration.showNotification(title, {
          icon: '/icon512_rounded.png',
          badge: '/icon512_maskable.png',
          ...options
        });
      } else {
        // Fallback to regular notification
        new Notification(title, {
          icon: '/icon512_rounded.png',
          ...options
        });
      }
    }
  };

  // Share content using Web Share API
  const shareContent = async (data) => {
    if (capabilities.webShare) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        console.error('Error sharing:', error);
        return false;
      }
    }
    return false;
  };

  // Set app badge (for supported browsers)
  const setAppBadge = (count) => {
    if (capabilities.badging) {
      if (count > 0) {
        navigator.setAppBadge(count);
      } else {
        navigator.clearAppBadge();
      }
    }
  };

  return {
    isOnline,
    isInstalled,
    updateAvailable,
    capabilities,
    updateApp,
    installApp,
    requestNotificationPermission,
    showNotification,
    shareContent,
    setAppBadge
  };
};
