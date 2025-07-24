import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone, Monitor } from 'lucide-react';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running on iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      window.navigator.standalone === true;
    setIsStandalone(standalone);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event so it can be triggered later
      setDeferredPrompt(e);
      // Show our custom install prompt
      if (!standalone) {
        setShowPrompt(true);
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Show iOS install prompt if on iOS and not standalone
    if (iOS && !standalone) {
      // Delay showing the prompt to avoid overwhelming the user
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember user dismissed the prompt (you might want to store this in localStorage)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't show if already installed or user dismissed recently
  if (isStandalone || !showPrompt) return null;

  // Check if user dismissed recently (within 7 days)
  const dismissedTime = localStorage.getItem('pwa-install-dismissed');
  if (dismissedTime && Date.now() - parseInt(dismissedTime) < 7 * 24 * 60 * 60 * 1000) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 shadow-lg">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-purple-600 to-cyan-500 p-2 rounded-lg mr-3">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Install ChainVerdict</h3>
              <p className="text-gray-300 text-xs">Get the full app experience</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isIOS ? (
          <div className="space-y-2">
            <p className="text-gray-300 text-xs">
              To install this app on your iPhone/iPad:
            </p>
            <div className="flex items-center text-xs text-gray-300">
              <span className="mr-2">1.</span>
              <span>Tap the share button</span>
              <div className="ml-2 w-4 h-4 border border-gray-400 rounded flex items-center justify-center">
                <div className="w-2 h-2 border-t border-gray-400"></div>
              </div>
            </div>
            <div className="flex items-center text-xs text-gray-300">
              <span className="mr-2">2.</span>
              <span>Select "Add to Home Screen"</span>
            </div>
          </div>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleInstallClick}
              className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center"
            >
              <Download className="h-4 w-4 mr-1" />
              Install App
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-2 text-gray-300 hover:text-white text-sm transition-colors"
            >
              Later
            </button>
          </div>
        )}

        <div className="mt-3 flex items-center justify-center space-x-4 text-xs text-gray-400">
          <div className="flex items-center">
            <Monitor className="h-3 w-3 mr-1" />
            <span>Offline access</span>
          </div>
          <div className="flex items-center">
            <Smartphone className="h-3 w-3 mr-1" />
            <span>Native feel</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
