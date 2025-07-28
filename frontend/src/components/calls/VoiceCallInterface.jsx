import React, { useState, useEffect, useRef } from 'react';
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
import VideoStreamDebugger from '../debug/VideoStreamDebugger';
import AudioDebugger from '../debug/AudioDebugger';

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
    localVideoRef,
    remoteVideoRef,
    answerCall,
    rejectCall,
    endCall,
    toggleMute,
    startCall
  } = useWebRTC();

  const [callStatus, setCallStatus] = useState('connecting');
  const [volume, setVolume] = useState(80);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [remoteStream, setRemoteStream] = useState(null);
  const remoteAudioRef = useRef(null);

  useEffect(() => {
    if (isConnected) {
      setCallStatus('connected');
    } else if (isCallActive) {
      setCallStatus('connecting');
    } else {
      setCallStatus('ended');
    }
  }, [isConnected, isCallActive]);

  // Monitor for remote stream changes - same as video calls
  useEffect(() => {
    const checkForRemoteStream = () => {
      if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
        const stream = remoteVideoRef.current.srcObject;
        if (stream !== remoteStream) {
          console.log('🔊 VoiceCall: New remote stream detected:', stream);
          setRemoteStream(stream);

          // Immediately assign to audio element like video calls do
          if (remoteAudioRef.current) {
            console.log('🔊 VoiceCall: Immediately assigning stream to audio element');
            remoteAudioRef.current.srcObject = stream;
            remoteAudioRef.current.volume = 1.0;
            remoteAudioRef.current.muted = false;
            remoteAudioRef.current.autoplay = true;

            // Force play immediately
            remoteAudioRef.current.play().then(() => {
              console.log('🔊 VoiceCall: Immediate audio play successful');
            }).catch(error => {
              console.error('🔊 VoiceCall: Immediate audio play failed:', error);
            });
          }
        }
      }
    };

    // Check immediately
    checkForRemoteStream();

    // Set up interval to check for stream changes
    const interval = setInterval(checkForRemoteStream, 500);
    return () => clearInterval(interval);
  }, [remoteStream]);

  // Direct stream assignment effect - mirrors video call behavior
  useEffect(() => {
    if (remoteVideoRef.current && remoteVideoRef.current.srcObject && remoteAudioRef.current) {
      const stream = remoteVideoRef.current.srcObject;
      console.log('🔊 VoiceCall: Direct stream assignment from remoteVideoRef:', stream);

      // Mirror the exact behavior of video calls
      remoteAudioRef.current.srcObject = stream;
      remoteAudioRef.current.volume = 1.0;
      remoteAudioRef.current.muted = false;
      remoteAudioRef.current.autoplay = true;
      remoteAudioRef.current.playsInline = true;

      // Force play like video calls do
      remoteAudioRef.current.play().then(() => {
        console.log('🔊 VoiceCall: Direct assignment play successful');
      }).catch(error => {
        console.error('🔊 VoiceCall: Direct assignment play failed:', error);
      });
    }
  }, [remoteVideoRef.current?.srcObject]);

  // Handle remote audio stream setup
  useEffect(() => {
    if (remoteStream) {
      console.log('🔊 VoiceCall: Setting up remote audio stream:', {
        streamId: remoteStream.id,
        active: remoteStream.active,
        hasAudioTracks: remoteStream.getAudioTracks().length > 0,
        hasVideoTracks: remoteStream.getVideoTracks().length > 0,
        audioTracks: remoteStream.getAudioTracks().map(track => ({
          id: track.id,
          enabled: track.enabled,
          readyState: track.readyState,
          kind: track.kind,
          muted: track.muted,
          settings: track.getSettings()
        }))
      });

      if (remoteAudioRef.current) {
        console.log('🔊 VoiceCall: Assigning stream to audio element');
        const audioElement = remoteAudioRef.current;

        // Force audio element properties
        audioElement.srcObject = remoteStream;
        audioElement.volume = 1.0; // Maximum volume
        audioElement.muted = false;
        audioElement.autoplay = true;
        audioElement.playsInline = true;

        // Add event listeners for debugging
        const handleCanPlay = () => {
          console.log('🔊 VoiceCall: Audio can play - forcing play');
          audioElement.play().catch(error => {
            console.error('🔊 VoiceCall: Force play on canplay failed:', error);
          });
        };

        const handlePlay = () => {
          console.log('🔊 VoiceCall: Audio started playing successfully');
        };

        const handleError = (e) => {
          console.error('🔊 VoiceCall: Audio error:', e);
        };

        const handleLoadedData = () => {
          console.log('🔊 VoiceCall: Audio data loaded - attempting play');
          audioElement.play().catch(error => {
            console.error('🔊 VoiceCall: Play on loadeddata failed:', error);
          });
        };

        const handleVolumeChange = () => {
          console.log('🔊 VoiceCall: Volume changed to:', audioElement.volume);
        };

        audioElement.addEventListener('canplay', handleCanPlay);
        audioElement.addEventListener('play', handlePlay);
        audioElement.addEventListener('error', handleError);
        audioElement.addEventListener('loadeddata', handleLoadedData);
        audioElement.addEventListener('volumechange', handleVolumeChange);

        // Multiple play attempts with delays
        const playAttempts = [0, 100, 500, 1000];
        playAttempts.forEach(delay => {
          setTimeout(() => {
            if (audioElement.paused) {
              console.log(`🔊 VoiceCall: Play attempt after ${delay}ms`);
              audioElement.play().then(() => {
                console.log(`🔊 VoiceCall: Play successful after ${delay}ms`);
              }).catch(error => {
                console.error(`🔊 VoiceCall: Play failed after ${delay}ms:`, error);
              });
            }
          }, delay);
        });

        // Cleanup listeners
        return () => {
          audioElement.removeEventListener('canplay', handleCanPlay);
          audioElement.removeEventListener('play', handlePlay);
          audioElement.removeEventListener('error', handleError);
          audioElement.removeEventListener('loadeddata', handleLoadedData);
          audioElement.removeEventListener('volumechange', handleVolumeChange);
        };
      } else {
        console.warn('🔊 VoiceCall: remoteAudioRef.current is null');
      }
    } else {
      console.log('🔊 VoiceCall: No remote stream available');
    }
  }, [remoteStream, isSpeakerOn]);

  // Handle speaker volume
  useEffect(() => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.volume = isSpeakerOn ? 1.0 : 0.8;
    }
  }, [isSpeakerOn]);

  const handleAnswer = async () => {
    try {
      await answerCall(callData, 'voice');
      setCallStatus('connecting');
    } catch (error) {
      console.error('Failed to answer call:', error);
    }
  };

  const handleStartTestCall = async () => {
    try {
      console.log('🔊 VoiceCall: Starting test voice call');
      await startCall('test-user-123', 'voice', 'test-chat-123');
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
          {/* Remote Audio Element */}
          <audio
            ref={remoteAudioRef}
            autoPlay
            playsInline
            style={{ display: 'none' }}
          />

          {/* Hidden video element for stream compatibility - mirrors video call setup */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            muted={false}
            style={{ display: 'none' }}
          />
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

          {/* Test call button for development */}
          {process.env.NODE_ENV === 'development' && !isCallActive && !isIncoming && (
            <div className="flex justify-center mb-6">
              <button
                onClick={handleStartTestCall}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Start Test Voice Call
              </button>
            </div>
          )}

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

        {/* Debug Components */}
        {process.env.NODE_ENV === 'development' && (
          <>
            <VideoStreamDebugger
              localStream={localVideoRef.current?.srcObject}
              remoteStream={remoteStream}
              isConnected={isConnected}
              callStatus={callStatus}
            />
            <AudioDebugger
              localStream={localVideoRef.current?.srcObject}
              remoteStream={remoteStream}
              isConnected={isConnected}
              callStatus={callStatus}
              remoteAudioRef={remoteAudioRef}
            />
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default VoiceCallInterface;
