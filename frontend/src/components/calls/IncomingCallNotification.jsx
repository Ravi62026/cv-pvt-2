import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  PhoneOff,
  Video,
  User,
  Shield
} from 'lucide-react';

const IncomingCallNotification = ({ 
  isVisible, 
  callData, 
  onAnswer, 
  onReject 
}) => {
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds to answer

  useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onReject(); // Auto-reject after timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, onReject]);

  useEffect(() => {
    if (isVisible) {
      setTimeLeft(30); // Reset timer when call comes in
    }
  }, [isVisible]);

  if (!isVisible || !callData) return null;

  const isVideoCall = callData.callType === 'video';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        className="fixed top-4 right-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 max-w-sm w-full"
        >
          {/* Header */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                {callData.fromUserRole === 'lawyer' ? (
                  <Shield className="h-6 w-6 text-white" />
                ) : (
                  <User className="h-6 w-6 text-white" />
                )}
              </div>
              {/* Pulsing ring animation */}
              <div className="absolute -inset-1 rounded-full border-2 border-blue-400 animate-ping"></div>
            </div>
            
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">
                {callData.fromUserName || 'Unknown User'}
              </h4>
              <p className="text-sm text-gray-500 capitalize">
                {callData.fromUserRole || 'User'}
              </p>
            </div>

            <div className="text-right">
              <div className="flex items-center space-x-1 text-blue-600">
                {isVideoCall ? (
                  <Video className="h-4 w-4" />
                ) : (
                  <Phone className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                  {isVideoCall ? 'Video' : 'Voice'} Call
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {timeLeft}s remaining
              </p>
            </div>
          </div>

          {/* Call type indicator */}
          <div className="mb-4">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              {isVideoCall ? (
                <>
                  <Video className="h-4 w-4" />
                  <span>Incoming video consultation</span>
                </>
              ) : (
                <>
                  <Phone className="h-4 w-4" />
                  <span>Incoming voice call</span>
                </>
              )}
            </div>
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
              onClick={onReject}
              className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              <PhoneOff className="h-4 w-4" />
              <span>Decline</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAnswer}
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

          {/* Additional info for video calls */}
          {isVideoCall && (
            <div className="mt-3 p-2 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700 text-center">
                This is a consultation request. The call will be scheduled after you accept.
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default IncomingCallNotification;
