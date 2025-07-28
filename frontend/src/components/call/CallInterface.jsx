import React, { useState, useEffect, useRef } from 'react';
import './CallInterface.css';
import {
  PhoneIcon,
  PhoneXMarkIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  SpeakerXMarkIcon
} from '@heroicons/react/24/solid';

const CallInterface = ({
  isIncoming = false,
  callerName = "Ravi Shankar",
  callerRole = "Citizen",
  onAccept,
  onDecline,
  onEndCall,
  isVideoCall = false
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(isVideoCall);
  const [callStatus, setCallStatus] = useState(isIncoming ? 'incoming' : 'connecting');
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);



  const handleAcceptCall = () => {
    setCallStatus('connected');
    onAccept?.();
  };

  const handleDeclineCall = () => {
    setCallStatus('ended');
    onDecline?.();
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    onEndCall?.();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };



  // Simulate remote video stream availability
  useEffect(() => {
    if (callStatus === 'connected' && isVideoCall && remoteVideoRef.current) {
      // Simulate remote video becoming available after 2 seconds
      const timer = setTimeout(() => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.style.display = 'block';
          // In real implementation, you would set the srcObject to the remote stream
          // remoteVideoRef.current.srcObject = remoteStream;
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [callStatus, isVideoCall]);

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  if (callStatus === 'incoming') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-50 flex flex-col items-center justify-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)]" />
        
        {/* Incoming Call UI */}
        <div className="relative z-10 text-center text-white px-6">
          {/* Avatar */}
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-4xl font-bold shadow-2xl call-ring call-pulse">
            {callerName.charAt(0)}
          </div>
          
          {/* Caller Info */}
          <h2 className="text-2xl font-semibold mb-2">{callerName}</h2>
          <p className="text-cyan-300 mb-2">{callerRole}</p>
          <p className="text-gray-300 mb-8">
            {isVideoCall ? 'Incoming video call...' : 'Incoming call...'}
          </p>
          
          {/* Call Actions */}
          <div className="flex justify-center space-x-12">
            {/* Decline Button */}
            <button
              onClick={handleDeclineCall}
              className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
            >
              <PhoneXMarkIcon className="w-8 h-8 text-white" />
            </button>
            
            {/* Accept Button */}
            <button
              onClick={handleAcceptCall}
              className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
            >
              <PhoneIcon className="w-8 h-8 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (callStatus === 'connected') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-50 flex flex-col">
        {/* Remote Audio Element */}
        <audio ref={remoteAudioRef} autoPlay />
        {/* Video Call Area */}
        {isVideoCall ? (
          <div className="flex-1 relative bg-black">
            {/* Remote Video Background */}
            <div className="w-full h-full video-placeholder flex items-center justify-center">
              {/* Placeholder for remote video - in real implementation this would be the actual video stream */}
              <div className="text-center text-white">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-4xl font-bold">
                  {callerName.charAt(0)}
                </div>
                <p className="text-lg font-medium">{callerName}</p>
                <p className="text-gray-300">Connecting video...</p>
              </div>
            </div>

            {/* Remote Video (when stream is available) */}
            <video
              ref={remoteVideoRef}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              playsInline
              style={{ display: 'none' }} // Will be shown when stream is available
            />

            {/* Local Video (Picture in Picture) */}
            <div className="absolute top-4 right-4 w-24 h-32 sm:w-32 sm:h-40 bg-gray-800 rounded-lg overflow-hidden shadow-lg border-2 border-white/20">
              {isVideoOn ? (
                <video
                  ref={localVideoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <div className="text-white text-xs text-center">
                    <div className="w-8 h-8 mx-auto mb-1 rounded-full bg-gray-600 flex items-center justify-center text-sm font-bold">
                      You
                    </div>
                    <p>Video Off</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Voice Call Area */
          <div className="flex-1 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center">
            <div className="text-center text-white">
              {/* Large Avatar */}
              <div className="w-40 h-40 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-6xl font-bold shadow-2xl">
                {callerName.charAt(0)}
              </div>

              {/* Caller Info */}
              <h2 className="text-3xl font-semibold mb-2">{callerName}</h2>
              <p className="text-purple-200 mb-2">{callerRole}</p>
              <p className="text-purple-300 text-lg">
                {isVideoCall ? 'Video call active' : 'Voice call active'}
              </p>

              {/* Audio Visualization */}
              <div className="audio-wave">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="audio-bar" />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Call Info Header */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent z-10">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-lg font-bold">
                {callerName.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{callerName}</h3>
                <p className="text-sm text-gray-300">{callerRole}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">Connected</p>
              <p className="text-xs text-gray-300">{isVideoCall ? 'Video Call' : 'Voice Call'}</p>
            </div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
          <div className="flex justify-center items-center space-x-6">
            {/* Mute Button */}
            <button
              onClick={toggleMute}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                isMuted 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              <div className="relative">
                <MicrophoneIcon className="w-6 h-6 text-white" />
                {isMuted && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-0.5 bg-white transform rotate-45"></div>
                  </div>
                )}
              </div>
            </button>
            
            {/* Speaker Button */}
            <button
              onClick={toggleSpeaker}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                isSpeakerOn 
                  ? 'bg-cyan-500 hover:bg-cyan-600' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {isSpeakerOn ? (
                <SpeakerWaveIcon className="w-6 h-6 text-white" />
              ) : (
                <SpeakerXMarkIcon className="w-6 h-6 text-white" />
              )}
            </button>
            
            {/* Video Toggle (if video call) */}
            {isVideoCall && (
              <button
                onClick={toggleVideo}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                  !isVideoOn 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                {isVideoOn ? (
                  <VideoCameraIcon className="w-6 h-6 text-white" />
                ) : (
                  <VideoCameraSlashIcon className="w-6 h-6 text-white" />
                )}
              </button>
            )}
            
            {/* End Call Button */}
            <button
              onClick={handleEndCall}
              className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
            >
              <PhoneXMarkIcon className="w-7 h-7 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default CallInterface;
