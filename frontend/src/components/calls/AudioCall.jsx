import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Mic,
  MicOff,
  PhoneOff,
  User,
  Volume2,
  VolumeX,
  Minimize,
  Maximize
} from 'lucide-react';

const AudioCall = ({
  call,
  onEndCall,
  socket
}) => {
  const isOpen = !!call;
  const onClose = onEndCall;
  const targetUser = call?.receiver || { name: 'Unknown User', role: 'user' };
  const chatId = call?.chatId;
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);

  // Start call timer
  useEffect(() => {
    if (!isOpen) return;
    
    // Simulate connection after 2 seconds
    const connectionTimer = setTimeout(() => {
      setIsConnected(true);
    }, 2000);

    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => {
      clearTimeout(connectionTimer);
      clearInterval(timer);
    };
  }, [isOpen]);

  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get user media
  useEffect(() => {
    if (!isOpen) return;

    const getUserMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true
        });
        
        if (localAudioRef.current) {
          localAudioRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    };

    getUserMedia();

    return () => {
      // Cleanup streams
      if (localAudioRef.current?.srcObject) {
        const tracks = localAudioRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (localAudioRef.current?.srcObject) {
      const audioTracks = localAudioRef.current.srcObject.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMuted;
      });
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    // In a real implementation, this would switch between earpiece and speaker
  };

  const endCall = () => {
    // Cleanup streams
    if (localAudioRef.current?.srcObject) {
      const tracks = localAudioRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`fixed z-50 ${
        isMinimized 
          ? 'bottom-4 right-4 w-80 h-48' 
          : 'inset-0'
      }`}
    >
      <div className={`${
        isMinimized 
          ? 'w-full h-full bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg shadow-2xl' 
          : 'w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-purple-800'
      }`}>
        
        {/* Hidden audio elements */}
        <audio ref={localAudioRef} autoPlay muted />
        <audio ref={remoteAudioRef} autoPlay />

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center h-full text-white p-8">
          
          {/* User Avatar */}
          <motion.div
            animate={isConnected ? {
              scale: [1, 1.05, 1],
            } : {}}
            transition={{
              duration: 2,
              repeat: isConnected ? Infinity : 0,
              ease: "easeInOut"
            }}
            className="mb-8"
          >
            <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-4 border-white/30">
              <User className="w-16 h-16 text-white" />
            </div>
          </motion.div>

          {/* User Info */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">{targetUser.name}</h2>
            <p className="text-lg text-white/80 mb-2">
              {isConnected ? 'Connected' : 'Connecting...'}
            </p>
            <p className="text-white/60">{formatDuration(callDuration)}</p>
          </div>

          {/* Call Controls */}
          <div className="flex items-center space-x-6">
            {/* Mute Button */}
            <button
              onClick={toggleMute}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
                isMuted 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {isMuted ? (
                <MicOff className="w-8 h-8 text-white" />
              ) : (
                <Mic className="w-8 h-8 text-white" />
              )}
            </button>

            {/* End Call Button */}
            <button
              onClick={endCall}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all duration-200"
            >
              <PhoneOff className="w-8 h-8 text-white" />
            </button>

            {/* Speaker Button */}
            <button
              onClick={toggleSpeaker}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
                isSpeakerOn 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {isSpeakerOn ? (
                <Volume2 className="w-8 h-8 text-white" />
              ) : (
                <VolumeX className="w-8 h-8 text-white" />
              )}
            </button>
          </div>

          {/* Minimize/Maximize Button */}
          {!isMinimized && (
            <button
              onClick={() => setIsMinimized(true)}
              className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <Minimize className="w-6 h-6 text-white" />
            </button>
          )}

          {isMinimized && (
            <button
              onClick={() => setIsMinimized(false)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <Maximize className="w-4 h-4 text-white" />
            </button>
          )}
        </div>

        {/* Connection Status Indicator */}
        {!isConnected && (
          <div className="absolute top-4 left-4">
            <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-white">Connecting...</span>
            </div>
          </div>
        )}

        {isConnected && (
          <div className="absolute top-4 left-4">
            <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-white">Connected</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AudioCall;
