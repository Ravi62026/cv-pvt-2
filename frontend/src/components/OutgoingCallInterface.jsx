import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneOff, User, Video, Phone } from 'lucide-react';
import './OutgoingCallInterface.css';

const OutgoingCallInterface = ({ 
  isVisible,
  callData,
  participantInfo,
  callState,
  onEndCall
}) => {
  const [ringCount, setRingCount] = useState(0);

  // Ring animation effect
  useEffect(() => {
    if (callState === 'ringing') {
      const interval = setInterval(() => {
        setRingCount(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [callState]);

  const getStatusText = () => {
    switch (callState) {
      case 'outgoing':
        return 'Calling...';
      case 'ringing':
        return 'Ringing...';
      default:
        return 'Connecting...';
    }
  };

  const isVideoCall = callData?.callType === 'video';

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="outgoing-call-overlay"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="outgoing-call-container"
        >
          {/* Background gradient */}
          <div className="call-background">
            <div className="gradient-overlay"></div>
          </div>

          {/* Call content */}
          <div className="call-content">
            {/* Avatar with ring animation */}
            <div className="avatar-container">
              <motion.div
                animate={callState === 'ringing' ? {
                  scale: [1, 1.1, 1],
                  opacity: [1, 0.8, 1]
                } : {}}
                transition={{
                  duration: 1,
                  repeat: callState === 'ringing' ? Infinity : 0,
                  ease: "easeInOut"
                }}
                className="avatar-ring"
              >
                <div className="participant-avatar">
                  {participantInfo?.profilePicture ? (
                    <img 
                      src={participantInfo.profilePicture} 
                      alt={participantInfo.name}
                      className="avatar-image"
                    />
                  ) : (
                    <User size={60} className="default-avatar" />
                  )}
                </div>
              </motion.div>
            </div>

            {/* Participant info */}
            <div className="participant-details">
              <h2 className="participant-name">
                {participantInfo?.name || callData?.targetUserId || 'Unknown'}
              </h2>
              <p className="call-status">
                {getStatusText()}
              </p>
              <div className="call-type">
                {isVideoCall ? (
                  <div className="call-type-indicator">
                    <Video size={16} />
                    <span>Video Call</span>
                  </div>
                ) : (
                  <div className="call-type-indicator">
                    <Phone size={16} />
                    <span>Voice Call</span>
                  </div>
                )}
              </div>
            </div>

            {/* Ring indicator dots */}
            {callState === 'ringing' && (
              <div className="ring-indicator">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                  className="ring-dot"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  className="ring-dot"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  className="ring-dot"
                />
              </div>
            )}

            {/* Call controls */}
            <div className="outgoing-call-controls">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onEndCall}
                className="end-call-button"
                aria-label="End call"
              >
                <PhoneOff size={24} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OutgoingCallInterface;
