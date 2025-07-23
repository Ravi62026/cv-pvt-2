import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  User,
  Shield
} from 'lucide-react';
import { useWebRTC } from '../../hooks/useWebRTC';

const VoiceCallInterface = ({ 
  isOpen, 
  onClose, 
  targetUser, 
  chatId,
  isIncoming = false,
  callData = null 
}) => {
  const {
    isCallActive,
    isConnected,
    isMuted,
    callDuration,
    answerCall,
    rejectCall,
    endCall,
    toggleMute
  } = useWebRTC();

  const [callStatus, setCallStatus] = useState('connecting');
  const [volume, setVolume] = useState(80);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  useEffect(() => {
    if (isConnected) {
      setCallStatus('connected');
    } else if (isCallActive) {
      setCallStatus('connecting');
    } else {
      setCallStatus('ended');
    }
  }, [isConnected, isCallActive]);

  const handleAnswer = async () => {
    try {
      await answerCall();
      setCallStatus('connecting');
    } catch (error) {
      console.error('Failed to answer call:', error);
    }
  };

  const handleReject = () => {
    rejectCall();
    onClose();
  };

  const handleEndCall = () => {
    endCall();
    onClose();
  };

  const handleToggleMute = () => {
    toggleMute();
  };

  const handleToggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    // In a real implementation, you would toggle the audio output device
  };

  const getStatusText = () => {
    switch (callStatus) {
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return callDuration;
      case 'ended':
        return 'Call ended';
      default:
        return 'Calling...';
    }
  };

  const getStatusColor = () => {
    switch (callStatus) {
      case 'connected':
        return 'text-green-600';
      case 'connecting':
        return 'text-yellow-600';
      case 'ended':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                {targetUser?.role === 'lawyer' ? (
                  <Shield className="h-12 w-12 text-white" />
                ) : (
                  <User className="h-12 w-12 text-white" />
                )}
              </div>
              {/* Audio wave animation when connected */}
              {isConnected && (
                <div className="absolute -inset-2 rounded-full border-4 border-green-400 animate-pulse"></div>
              )}
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              {targetUser?.name || 'Unknown User'}
            </h3>
            <p className="text-sm text-gray-500 capitalize mb-2">
              {targetUser?.role || 'User'}
            </p>
            <p className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </p>
          </div>

          {/* Incoming call actions */}
          {isIncoming && !isCallActive && (
            <div className="flex justify-center space-x-6 mb-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleReject}
                className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg"
              >
                <PhoneOff className="h-8 w-8 text-white" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleAnswer}
                className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg"
              >
                <Phone className="h-8 w-8 text-white" />
              </motion.button>
            </div>
          )}

          {/* Active call controls */}
          {isCallActive && (
            <div className="space-y-6">
              {/* Volume control */}
              <div className="flex items-center space-x-4">
                <VolumeX className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <Volume2 className="h-5 w-5 text-gray-400" />
              </div>

              {/* Call controls */}
              <div className="flex justify-center space-x-4">
                {/* Mute button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleToggleMute}
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                    isMuted 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  {isMuted ? (
                    <MicOff className="h-6 w-6" />
                  ) : (
                    <Mic className="h-6 w-6" />
                  )}
                </motion.button>

                {/* Speaker button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleToggleSpeaker}
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                    isSpeakerOn 
                      ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  <Volume2 className="h-6 w-6" />
                </motion.button>

                {/* End call button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleEndCall}
                  className="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg"
                >
                  <PhoneOff className="h-6 w-6 text-white" />
                </motion.button>
              </div>
            </div>
          )}

          {/* Call ended state */}
          {callStatus === 'ended' && (
            <div className="text-center">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VoiceCallInterface;
