import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Maximize,
  Minimize,
  Settings,
  User,
  Shield
} from 'lucide-react';
import { useWebRTC } from '../../hooks/useWebRTC';

const VideoCallInterface = ({ 
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
    isVideoEnabled,
    callDuration,
    localVideoRef,
    remoteVideoRef,
    answerCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo
  } = useWebRTC();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [callStatus, setCallStatus] = useState('connecting');

  useEffect(() => {
    if (isConnected) {
      setCallStatus('connected');
    } else if (isCallActive) {
      setCallStatus('connecting');
    } else {
      setCallStatus('ended');
    }
  }, [isConnected, isCallActive]);

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    if (!showControls) return;

    const timer = setTimeout(() => {
      if (isConnected) {
        setShowControls(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [showControls, isConnected]);

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

  const handleToggleVideo = () => {
    toggleVideo();
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleMouseMove = () => {
    setShowControls(true);
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 bg-black z-50 ${isFullscreen ? '' : 'bg-opacity-90 flex items-center justify-center'}`}
        onMouseMove={handleMouseMove}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`relative ${
            isFullscreen 
              ? 'w-full h-full' 
              : 'w-full max-w-4xl h-full max-h-[80vh] mx-4 rounded-lg overflow-hidden'
          } bg-gray-900`}
        >
          {/* Remote video */}
          <div className="relative w-full h-full">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* No video placeholder */}
            {!isConnected && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    {targetUser?.role === 'lawyer' ? (
                      <Shield className="h-12 w-12 text-white" />
                    ) : (
                      <User className="h-12 w-12 text-white" />
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {targetUser?.name || 'Unknown User'}
                  </h3>
                  <p className="text-gray-300">{getStatusText()}</p>
                </div>
              </div>
            )}

            {/* Local video (Picture-in-Picture) */}
            <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white shadow-lg">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {!isVideoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                  <VideoOff className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>

            {/* Status indicator */}
            <div className="absolute top-4 left-4">
              <div className="bg-black bg-opacity-50 rounded-lg px-3 py-2">
                <p className="text-white text-sm font-medium">{getStatusText()}</p>
              </div>
            </div>
          </div>

          {/* Incoming call overlay */}
          {isIncoming && !isCallActive && (
            <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  {targetUser?.role === 'lawyer' ? (
                    <Shield className="h-16 w-16 text-white" />
                  ) : (
                    <User className="h-16 w-16 text-white" />
                  )}
                </div>
                
                <h3 className="text-2xl font-semibold text-white mb-2">
                  {targetUser?.name || 'Unknown User'}
                </h3>
                <p className="text-gray-300 mb-8">Incoming video consultation</p>

                <div className="flex justify-center space-x-8">
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
                    <Video className="h-8 w-8 text-white" />
                  </motion.button>
                </div>
              </div>
            </div>
          )}

          {/* Controls overlay */}
          <AnimatePresence>
            {showControls && isCallActive && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6"
              >
                <div className="flex justify-center space-x-4">
                  {/* Mute button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleToggleMute}
                    className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                      isMuted 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {isMuted ? (
                      <MicOff className="h-6 w-6 text-white" />
                    ) : (
                      <Mic className="h-6 w-6 text-white" />
                    )}
                  </motion.button>

                  {/* Video toggle button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleToggleVideo}
                    className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                      !isVideoEnabled 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {isVideoEnabled ? (
                      <Video className="h-6 w-6 text-white" />
                    ) : (
                      <VideoOff className="h-6 w-6 text-white" />
                    )}
                  </motion.button>

                  {/* Fullscreen toggle */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleToggleFullscreen}
                    className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center shadow-lg"
                  >
                    {isFullscreen ? (
                      <Minimize className="h-6 w-6 text-white" />
                    ) : (
                      <Maximize className="h-6 w-6 text-white" />
                    )}
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
              </motion.div>
            )}
          </AnimatePresence>

          {/* Close button for non-fullscreen mode */}
          {!isFullscreen && !isIncoming && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full flex items-center justify-center text-white"
            >
              ×
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoCallInterface;
