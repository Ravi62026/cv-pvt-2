import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  Video,
  PhoneOff,
  User,
  Shield,
  Bell,
  X
} from 'lucide-react';
import { useCall } from '../../contexts/CallContext';
import { useAuth } from '../../contexts/AuthContext';

const CallNotificationWidget = () => {
  const { callState, incomingCall, participantInfo, acceptCall, rejectCall } = useCall();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (callState === 'incoming' && incomingCall) {
      setIsVisible(true);
      setTimeLeft(30);
    } else {
      setIsVisible(false);
    }
  }, [callState, incomingCall]);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleReject(); // Auto-reject after timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible]);

  const handleAccept = async () => {
    try {
      await acceptCall();
      setIsVisible(false);
    } catch (error) {
      console.error('Failed to accept call:', error);
    }
  };

  const handleReject = async () => {
    try {
      await rejectCall();
      setIsVisible(false);
    } catch (error) {
      console.error('Failed to reject call:', error);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible || !incomingCall) return null;

  const isVideoCall = incomingCall.callType === 'video';
  const callerName = participantInfo?.name || incomingCall.fromUserName || 'Unknown User';
  const callerRole = participantInfo?.role || incomingCall.fromUserRole || 'user';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        className="fixed bottom-4 right-4 z-50 max-w-sm w-full"
      >
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white relative">
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  {callerRole === 'lawyer' ? (
                    <Shield className="h-6 w-6 text-white" />
                  ) : (
                    <User className="h-6 w-6 text-white" />
                  )}
                </div>
                {/* Pulsing ring animation */}
                <div className="absolute -inset-1 rounded-full border-2 border-white/50 animate-ping"></div>
              </div>
              
              <div className="flex-1">
                <h4 className="font-semibold text-white">
                  {callerName}
                </h4>
                <p className="text-sm text-white/80 capitalize">
                  {callerRole}
                </p>
              </div>

              <div className="text-right">
                <div className="flex items-center space-x-1 text-white">
                  {isVideoCall ? (
                    <Video className="h-4 w-4" />
                  ) : (
                    <Phone className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">
                    {isVideoCall ? 'Video' : 'Voice'}
                  </span>
                </div>
                <p className="text-xs text-white/70">
                  {timeLeft}s remaining
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="text-center mb-4">
              <div className="flex items-center justify-center space-x-2 text-gray-600 mb-2">
                <Bell className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Incoming {isVideoCall ? 'Video' : 'Voice'} Call
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {callerName} is calling you for a consultation
              </p>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-1">
                <motion.div
                  className="bg-blue-600 h-1 rounded-full"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeLeft / 30) * 100}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReject}
                className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                <PhoneOff className="h-4 w-4" />
                <span>Decline</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAccept}
                className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                {isVideoCall ? (
                  <Video className="h-4 w-4" />
                ) : (
                  <Phone className="h-4 w-4" />
                )}
                <span>Answer</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Ripple effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 left-4 w-12 h-12 border-2 border-blue-400 rounded-full animate-ping opacity-20"></div>
          <div className="absolute top-4 left-4 w-12 h-12 border-2 border-blue-400 rounded-full animate-ping opacity-10" style={{ animationDelay: '0.5s' }}></div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CallNotificationWidget;
