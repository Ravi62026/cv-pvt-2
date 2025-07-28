import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Maximize,
  Minimize,
  User,
  Shield,
  RotateCcw
} from 'lucide-react';
import { useWebRTC } from '../../hooks/useWebRTC';
import VideoStreamDebugger from '../debug/VideoStreamDebugger';

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
    toggleVideo,
    startCall
  } = useWebRTC();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [callStatus, setCallStatus] = useState('connecting');
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);
  const [remoteVideoEnabled, setRemoteVideoEnabled] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [localVideoPosition, setLocalVideoPosition] = useState('top-right');
  const [remoteStream, setRemoteStream] = useState(null);
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    if (isConnected) {
      setCallStatus('connected');
    } else if (isCallActive) {
      setCallStatus('connecting');
    } else {
      setCallStatus('ended');
    }
  }, [isConnected, isCallActive]);

  // Monitor for remote stream changes
  useEffect(() => {
    const checkForRemoteStream = () => {
      if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
        const stream = remoteVideoRef.current.srcObject;
        if (stream !== remoteStream) {
          console.log('📹 VideoCall: New remote stream detected:', stream);
          console.log('📹 VideoCall: Remote stream ID:', stream.id);
          console.log('📹 VideoCall: Remote stream tracks:', stream.getTracks().map(t => ({ kind: t.kind, id: t.id })));
          setRemoteStream(stream);

          // Check if stream has video tracks
          const videoTracks = stream.getVideoTracks();
          console.log('📹 VideoCall: Video tracks in remote stream:', videoTracks.length);

          if (videoTracks.length > 0) {
            const videoTrack = videoTracks[0];
            console.log('📹 VideoCall: Video track enabled:', videoTrack.enabled);
            setRemoteVideoEnabled(videoTrack.enabled);
            setHasRemoteVideo(videoTrack.enabled);

            // Listen for track enabled/disabled changes
            videoTrack.addEventListener('ended', () => {
              console.log('📹 VideoCall: Video track ended');
              setHasRemoteVideo(false);
              setRemoteVideoEnabled(false);
            });
          } else {
            setHasRemoteVideo(false);
            setRemoteVideoEnabled(false);
          }
        }
      }
    };

    // Also check local stream for debugging
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const localStream = localVideoRef.current.srcObject;
      console.log('📹 VideoCall: Local stream ID:', localStream.id);
      console.log('📹 VideoCall: Local stream tracks:', localStream.getTracks().map(t => ({ kind: t.kind, id: t.id })));
    } else {
      console.log('📹 VideoCall: No local stream found');
    }

    // Check immediately
    checkForRemoteStream();

    // Set up interval to check for stream changes
    const interval = setInterval(checkForRemoteStream, 2000); // Less frequent logging
    return () => clearInterval(interval);
  }, [remoteStream]);

  // Monitor remote video stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      const videoElement = remoteVideoRef.current;

      const handleLoadedMetadata = () => {
        console.log('📹 VideoCall: Remote video metadata loaded');
        if (remoteStream && remoteStream.getVideoTracks().length > 0) {
          const videoTrack = remoteStream.getVideoTracks()[0];
          if (videoTrack.enabled) {
            setHasRemoteVideo(true);
          }
        }
      };

      const handleLoadedData = () => {
        console.log('📹 VideoCall: Remote video data loaded');
        if (remoteStream && remoteStream.getVideoTracks().length > 0) {
          const videoTrack = remoteStream.getVideoTracks()[0];
          if (videoTrack.enabled) {
            setHasRemoteVideo(true);
          }
        }
      };

      const handleError = (e) => {
        console.error('📹 VideoCall: Remote video error:', e);
        setHasRemoteVideo(false);
      };

      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.addEventListener('loadeddata', handleLoadedData);
      videoElement.addEventListener('error', handleError);

      return () => {
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
        videoElement.removeEventListener('loadeddata', handleLoadedData);
        videoElement.removeEventListener('error', handleError);
      };
    }
  }, [remoteStream]);

  // Auto-hide controls
  useEffect(() => {
    if (showControls && isCallActive) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 5000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, isCallActive]);

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
      await answerCall(callData, 'video');
      setCallStatus('connecting');
    } catch (error) {
      console.error('Failed to answer call:', error);
    }
  };

  const handleStartTestCall = async () => {
    try {
      console.log('📹 VideoCall: Starting test video call');
      await startCall('test-user-123', 'video', 'test-chat-123');
      setCallStatus('connecting');
    } catch (error) {
      console.error('Failed to start test call:', error);
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

  const handleToggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  const handleSwitchCamera = () => {
    // Switch between front and back camera (mobile)
    console.log('Switch camera requested');
  };

  const handleLocalVideoPosition = () => {
    const positions = ['top-right', 'top-left', 'bottom-right', 'bottom-left'];
    const currentIndex = positions.indexOf(localVideoPosition);
    const nextIndex = (currentIndex + 1) % positions.length;
    setLocalVideoPosition(positions[nextIndex]);
  };

  const getStatusText = () => {
    switch (callStatus) {
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return `${Math.floor(callDuration / 60)}:${(callDuration % 60).toString().padStart(2, '0')}`;
      case 'ended':
        return 'Call ended';
      default:
        return 'Calling...';
    }
  };

  const getLocalVideoPositionClasses = () => {
    const baseClasses = "absolute w-32 h-44 bg-gray-800 rounded-lg overflow-hidden border-2 border-white shadow-lg cursor-pointer";
    switch (localVideoPosition) {
      case 'top-left':
        return `${baseClasses} top-4 left-4`;
      case 'bottom-left':
        return `${baseClasses} bottom-20 left-4`;
      case 'bottom-right':
        return `${baseClasses} bottom-20 right-4`;
      default: // top-right
        return `${baseClasses} top-4 right-4`;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-50"
        onMouseMove={handleMouseMove}
      >
        {/* Top bar with user info and call duration */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-black bg-opacity-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                {targetUser?.role === 'lawyer' ? (
                  <Shield className="h-6 w-6 text-white" />
                ) : (
                  <User className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <h3 className="text-white font-medium">
                  {targetUser?.name || 'Unknown User'}
                </h3>
                <p className="text-gray-300 text-sm">
                  {callDuration > 0 ? `${Math.floor(callDuration / 60)}:${(callDuration % 60).toString().padStart(2, '0')}` : '00:00'}
                </p>
              </div>
            </div>

            {/* Fullscreen toggle */}
            <button
              onClick={handleToggleFullscreen}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full h-full bg-black"
        >
          {/* Remote video */}
          <div className="relative w-full h-full bg-black">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              style={{ display: hasRemoteVideo ? 'block' : 'none' }}
            />

            {/* No video placeholder */}
            {(!isConnected || !hasRemoteVideo || !remoteVideoEnabled) && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                    {targetUser?.role === 'lawyer' ? (
                      <Shield className="h-16 w-16 text-white" />
                    ) : (
                      <User className="h-16 w-16 text-white" />
                    )}
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    {targetUser?.name || 'Unknown User'}
                  </h3>
                  <p className="text-gray-300 text-lg">{getStatusText()}</p>
                  {isConnected && remoteStream && !remoteVideoEnabled && (
                    <p className="text-gray-400 text-sm mt-2">Camera is turned off</p>
                  )}
                  {isConnected && (!remoteStream || !hasRemoteVideo) && (
                    <p className="text-gray-400 text-sm mt-2">Waiting for video...</p>
                  )}
                  {!isConnected && (
                    <p className="text-gray-400 text-sm mt-2">Connecting...</p>
                  )}
                </div>
              </div>
            )}

            {/* Local video (Picture-in-Picture) */}
            <div
              className={getLocalVideoPositionClasses()}
              onClick={handleLocalVideoPosition}
            >
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }} // Mirror local video
              />
              {!isVideoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                  <VideoOff className="h-8 w-8 text-gray-400" />
                </div>
              )}

              {/* Local video controls overlay */}
              <div className="absolute top-2 right-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSwitchCamera();
                  }}
                  className="w-6 h-6 bg-black bg-opacity-50 rounded-full flex items-center justify-center"
                >
                  <RotateCcw className="h-3 w-3 text-white" />
                </button>
              </div>
            </div>

            {/* Status indicator */}
            <div className="absolute top-4 left-4">
              <div className="bg-black bg-opacity-60 rounded-full px-4 py-2 backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-white text-sm font-medium">{getStatusText()}</p>
                </div>
              </div>
            </div>

            {/* Connection quality indicator */}
            {isConnected && (
              <div className="absolute top-4 right-4 mr-36">
                <div className="bg-black bg-opacity-60 rounded-full px-3 py-1 backdrop-blur-sm">
                  <div className="flex items-center space-x-1">
                    <div className="w-1 h-3 bg-green-500 rounded-full"></div>
                    <div className="w-1 h-4 bg-green-500 rounded-full"></div>
                    <div className="w-1 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Test call button for development */}
          {process.env.NODE_ENV === 'development' && !isCallActive && !isIncoming && (
            <div className="absolute top-4 left-4 z-10">
              <button
                onClick={handleStartTestCall}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
              >
                Start Test Video Call
              </button>
            </div>
          )}

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

          {/* Bottom controls bar */}
          {isCallActive && (
            <div className="absolute bottom-0 left-0 right-0 z-20 bg-black bg-opacity-50 p-4">
              <div className="flex justify-center items-center space-x-6">
                {/* Mute button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleToggleMute}
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
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
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    !isVideoEnabled
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {!isVideoEnabled ? (
                    <VideoOff className="h-6 w-6 text-white" />
                  ) : (
                    <Video className="h-6 w-6 text-white" />
                  )}
                </motion.button>

                {/* End call button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleEndCall}
                  className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center"
                >
                  <PhoneOff className="h-7 w-7 text-white" />
                </motion.button>
              </div>
            </div>
          )}

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

        {/* Debug Component */}
        {process.env.NODE_ENV === 'development' && (
          <VideoStreamDebugger
            localStream={localVideoRef.current?.srcObject}
            remoteStream={remoteVideoRef.current?.srcObject}
            isConnected={isConnected}
            callStatus={callStatus}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoCallInterface;
