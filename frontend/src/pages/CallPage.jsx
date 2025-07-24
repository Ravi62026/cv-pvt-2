import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useCall } from '../contexts/CallContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  PhoneXMarkIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  SpeakerXMarkIcon
} from '@heroicons/react/24/solid';

const CallPage = () => {
  const { callId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error } = useToast();
  
  const {
    currentCall,
    callState,
    callDuration,
    callControls,
    participantInfo,
    localStream,
    remoteStream,
    endCall,
    toggleMute,
    toggleVideo,
    toggleSpeaker
  } = useCall();

  const [callType] = useState(searchParams.get('type') || 'voice');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle call end
  const handleEndCall = async () => {
    try {
      await endCall();
      success('Call ended');
      navigate(-1); // Go back to previous page
    } catch (err) {
      console.error('Failed to end call:', err);
      error('Failed to end call');
    }
  };

  // Setup video streams
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream) {
      if (remoteVideoRef.current && callType === 'video') {
        remoteVideoRef.current.srcObject = remoteStream;
      }
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream;
        // Ensure audio plays
        remoteAudioRef.current.play().catch(console.error);
      }
    }
  }, [remoteStream, callType]);

  // Auto-hide controls for video calls
  useEffect(() => {
    if (callType !== 'video' || !showControls) return;

    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showControls, callType]);

  // Show controls on mouse move for video calls
  const handleMouseMove = () => {
    if (callType === 'video') {
      setShowControls(true);
    }
  };

  // Redirect if no active call
  useEffect(() => {
    if (!currentCall && callState !== 'active') {
      navigate(-1);
    }
  }, [currentCall, callState, navigate]);

  if (!currentCall) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">No Active Call</h2>
          <p className="text-gray-400 mb-6">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (callType === 'video') {
    return (
      <div 
        className={`min-h-screen bg-black relative overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
        onMouseMove={handleMouseMove}
      >
        {/* Remote Video */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Local Video */}
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg object-cover border-2 border-white/20"
        />

        {/* Remote Audio */}
        <audio ref={remoteAudioRef} autoPlay />

        {/* Call Controls Overlay */}
        <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/50 to-transparent">
            <div className="flex items-center justify-between text-white">
              <div>
                <h2 className="text-xl font-semibold">{participantInfo?.name || 'Unknown'}</h2>
                <p className="text-sm text-gray-300">Video Call • {formatDuration(callDuration)}</p>
              </div>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent">
            <div className="flex justify-center space-x-6">
              {/* Mute Button */}
              <button
                onClick={toggleMute}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
                  callControls.isMuted 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                <MicrophoneIcon className={`w-6 h-6 ${callControls.isMuted ? 'text-white' : 'text-white'}`} />
              </button>

              {/* Video Toggle */}
              <button
                onClick={toggleVideo}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
                  !callControls.isVideoEnabled 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                {callControls.isVideoEnabled ? (
                  <VideoCameraIcon className="w-6 h-6 text-white" />
                ) : (
                  <VideoCameraSlashIcon className="w-6 h-6 text-white" />
                )}
              </button>

              {/* Speaker Toggle */}
              <button
                onClick={toggleSpeaker}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
                  callControls.isSpeakerOn 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                {callControls.isSpeakerOn ? (
                  <SpeakerWaveIcon className="w-6 h-6 text-white" />
                ) : (
                  <SpeakerXMarkIcon className="w-6 h-6 text-white" />
                )}
              </button>

              {/* End Call Button */}
              <button
                onClick={handleEndCall}
                className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
              >
                <PhoneXMarkIcon className="w-8 h-8 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Voice Call UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800 flex items-center justify-center">
      {/* Remote Audio */}
      <audio ref={remoteAudioRef} autoPlay />
      
      <div className="text-center text-white max-w-md mx-auto px-6">
        {/* User Avatar */}
        <div className="w-48 h-48 mx-auto mb-8 bg-white/20 rounded-full flex items-center justify-center">
          {participantInfo?.profilePicture ? (
            <img 
              src={participantInfo.profilePicture} 
              alt={participantInfo.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 bg-white/30 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          )}
        </div>

        {/* Call Info */}
        <h2 className="text-3xl font-bold mb-2">{participantInfo?.name || 'Unknown'}</h2>
        <p className="text-xl text-white/80 mb-2">Voice call active</p>
        <p className="text-lg text-white/60 mb-12">{formatDuration(callDuration)}</p>

        {/* Call Controls */}
        <div className="flex justify-center space-x-8">
          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
              callControls.isMuted 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            <MicrophoneIcon className={`w-8 h-8 ${callControls.isMuted ? 'text-white' : 'text-white'}`} />
          </button>

          {/* Speaker Button */}
          <button
            onClick={toggleSpeaker}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
              callControls.isSpeakerOn 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            {callControls.isSpeakerOn ? (
              <SpeakerWaveIcon className="w-8 h-8 text-white" />
            ) : (
              <SpeakerXMarkIcon className="w-8 h-8 text-white" />
            )}
          </button>

          {/* End Call Button */}
          <button
            onClick={handleEndCall}
            className="w-20 h-20 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
          >
            <PhoneXMarkIcon className="w-10 h-10 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallPage;
