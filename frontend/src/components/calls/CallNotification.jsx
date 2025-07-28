import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  PhoneOff,
  Video,
  User,
  Shield
} from 'lucide-react';

const CallNotification = ({ 
  incomingCall, 
  onAccept, 
  onReject,
  socket 
}) => {
  const [isRinging, setIsRinging] = useState(false);

  useEffect(() => {
    if (incomingCall) {
      setIsRinging(true);
      
      // Play ringtone
      const audio = new Audio('/sounds/ringtone.mp3');
      audio.loop = true;
      audio.play().catch(console.error);

      return () => {
        audio.pause();
        audio.currentTime = 0;
      };
    }
  }, [incomingCall]);

  if (!incomingCall) return null;

  const handleAccept = () => {
    setIsRinging(false);
    onAccept(incomingCall);
  };

  const handleReject = () => {
    setIsRinging(false);
    onReject(incomingCall);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white shadow-2xl border-b border-gray-200"
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            {/* Caller Info */}
            <div className="flex items-center space-x-3">
              <motion.div
                animate={isRinging ? {
                  scale: [1, 1.1, 1],
                } : {}}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                  {incomingCall.caller.role === 'lawyer' ? (
                    <Shield className="h-6 w-6 text-white" />
                  ) : (
                    <User className="h-6 w-6 text-white" />
                  )}
                </div>
                {/* Ringing animation */}
                {isRinging && (
                  <motion.div
                    animate={{
                      scale: [1, 2, 1],
                      opacity: [0.7, 0, 0.7],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeOut"
                    }}
                    className="absolute inset-0 bg-blue-400 rounded-full"
                  />
                )}
              </motion.div>
              
              <div>
                <h3 className="font-semibold text-gray-900">
                  {incomingCall.caller.name}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  {incomingCall.type === 'video' ? (
                    <Video className="h-4 w-4" />
                  ) : (
                    <Phone className="h-4 w-4" />
                  )}
                  <span>
                    Incoming {incomingCall.type} call
                  </span>
                </div>
              </div>
            </div>

            {/* Call Actions */}
            <div className="flex items-center space-x-3">
              {/* Reject Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReject}
                className="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
              >
                <PhoneOff className="h-6 w-6 text-white" />
              </motion.button>

              {/* Accept Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAccept}
                className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors"
              >
                {incomingCall.type === 'video' ? (
                  <Video className="h-6 w-6 text-white" />
                ) : (
                  <Phone className="h-6 w-6 text-white" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Animated border */}
        <motion.div
          animate={{
            scaleX: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="h-1 bg-gradient-to-r from-blue-500 to-green-500"
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default CallNotification;
