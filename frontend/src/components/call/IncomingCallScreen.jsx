import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  PhoneOff,
  Video,
  User,
  Shield,
  MessageSquare
} from 'lucide-react';

const IncomingCallScreen = ({ 
  isVisible,
  callerInfo,
  callType = 'voice',
  onAccept,
  onDecline,
  chatId
}) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [isRinging, setIsRinging] = useState(true);

  useEffect(() => {
    if (!isVisible) return;

    // Reset timer when call comes in
    setTimeLeft(30);
    setIsRinging(true);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onDecline(); // Auto-decline after timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, onDecline]);

  // Ring animation effect
  useEffect(() => {
    if (!isVisible) return;

    const ringInterval = setInterval(() => {
      setIsRinging(prev => !prev);
    }, 1000);

    return () => clearInterval(ringInterval);
  }, [isVisible]);

  if (!isVisible || !callerInfo) return null;

  const isVideoCall = callType === 'video';
  const callerName = callerInfo.name || 'Unknown User';
  const callerRole = callerInfo.role || 'user';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)]" />
        
        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-6">
          {/* Call Type Indicator */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-8"
          >
            <div className="flex items-center space-x-2 text-cyan-300 text-lg font-medium">
              {isVideoCall ? (
                <Video className="h-6 w-6" />
              ) : (
                <Phone className="h-6 w-6" />
              )}
              <span>Incoming {isVideoCall ? 'video' : 'voice'} call</span>
            </div>
          </motion.div>

          {/* Caller Avatar with Ring Animation */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative mb-8"
          >
            {/* Pulsing rings */}
            <div className={`absolute inset-0 rounded-full border-4 border-cyan-400/50 ${isRinging ? 'animate-ping' : ''}`} />
            <div className={`absolute inset-0 rounded-full border-4 border-cyan-400/30 ${isRinging ? 'animate-ping' : ''}`} style={{ animationDelay: '0.5s' }} />
            
            {/* Avatar */}
            <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-6xl font-bold shadow-2xl">
              {callerRole === 'lawyer' ? (
                <Shield className="h-20 w-20 text-white" />
              ) : (
                callerName.charAt(0).toUpperCase()
              )}
            </div>
          </motion.div>

          {/* Caller Info */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-8"
          >
            <h2 className="text-4xl font-bold mb-2">{callerName}</h2>
            <p className="text-cyan-300 text-xl capitalize mb-2">{callerRole}</p>
            <p className="text-gray-300 text-lg">
              {isVideoCall ? 'wants to video chat' : 'is calling you'}
            </p>
          </motion.div>

          {/* Timer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-12"
          >
            <div className="text-center">
              <div className="text-2xl font-mono text-cyan-300 mb-2">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
              <div className="w-32 h-1 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-cyan-400"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeLeft / 30) * 100}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center space-x-16"
          >
            {/* Decline Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onDecline}
              className="w-20 h-20 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200"
            >
              <PhoneOff className="h-10 w-10 text-white" />
            </motion.button>

            {/* Message Button (Optional) */}
            {chatId && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  // Navigate to chat instead of answering call
                  window.location.href = `/chat/${chatId}`;
                }}
                className="w-16 h-16 bg-gray-600 hover:bg-gray-700 rounded-full flex items-center justify-center shadow-xl transition-all duration-200"
              >
                <MessageSquare className="h-8 w-8 text-white" />
              </motion.button>
            )}

            {/* Accept Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onAccept}
              className="w-20 h-20 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200"
            >
              {isVideoCall ? (
                <Video className="h-10 w-10 text-white" />
              ) : (
                <Phone className="h-10 w-10 text-white" />
              )}
            </motion.button>
          </motion.div>

          {/* Swipe hint for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 left-0 right-0 text-center"
          >
            <p className="text-gray-400 text-sm">
              Swipe up to answer • Swipe down to decline
            </p>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default IncomingCallScreen;
