import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Volume2, 
  VolumeX,
  Minimize2,
  Maximize2,
  User
} from 'lucide-react';
import './ActiveCallInterface.css';

const ActiveCallInterface = ({
  isVisible,
  callData,
  localStream,
  remoteStream,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  onToggleSpeaker,
  isMuted = false,
  isVideoEnabled = true,
  isSpeakerOn = false,
  participantInfo,
  callDuration = 0
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Set up video streams
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  const isVideoCall = callData?.callType === 'video';

  return (
    <div className={`active-call-interface ${isMinimized ? 'minimized' : ''}`}>
      {/* Call Header */}
      <div className="call-header">
        <div className="participant-info">
          <div className="participant-avatar">
            {participantInfo?.profilePicture ? (
              <img 
                src={participantInfo.profilePicture} 
                alt={participantInfo.name}
                className="avatar-image"
              />
            ) : (
              <User size={24} className="default-avatar" />
            )}
          </div>
          <div className="participant-details">
            <h3 className="participant-name">
              {participantInfo?.name || callData?.targetUserId || 'Unknown'}
            </h3>
            <p className="call-duration">{formatDuration(callDuration)}</p>
          </div>
        </div>
        
        <div className="call-header-actions">
          <button 
            className="minimize-button"
            onClick={() => setIsMinimized(!isMinimized)}
            aria-label={isMinimized ? "Maximize" : "Minimize"}
          >
            {isMinimized ? <Maximize2 size={20} /> : <Minimize2 size={20} />}
          </button>
        </div>
      </div>

      {/* Video Container */}
      {isVideoCall && !isMinimized && (
        <div className="video-container">
          {/* Remote Video */}
          <div className="remote-video">
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="remote-video-element"
              />
            ) : (
              <div className="video-placeholder">
                <User size={80} />
                <p>Waiting for video...</p>
              </div>
            )}
          </div>

          {/* Local Video */}
          <div className="local-video">
            {localStream && isVideoEnabled ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="local-video-element"
              />
            ) : (
              <div className="video-placeholder small">
                <User size={40} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Voice Call Display */}
      {!isVideoCall && !isMinimized && (
        <div className="voice-call-display">
          <div className="voice-avatar">
            {participantInfo?.profilePicture ? (
              <img 
                src={participantInfo.profilePicture} 
                alt={participantInfo.name}
                className="avatar-image"
              />
            ) : (
              <User size={100} className="default-avatar" />
            )}
          </div>
          <h2 className="voice-participant-name">
            {participantInfo?.name || callData?.targetUserId || 'Unknown'}
          </h2>
          <p className="voice-call-status">Voice call active</p>
        </div>
      )}

      {/* Call Controls */}
      <div className="call-controls">
        {/* Mute Button */}
        <button 
          className={`control-button ${isMuted ? 'active' : ''}`}
          onClick={onToggleMute}
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        {/* Video Toggle (only for video calls) */}
        {isVideoCall && (
          <button 
            className={`control-button ${!isVideoEnabled ? 'active' : ''}`}
            onClick={onToggleVideo}
            aria-label={isVideoEnabled ? "Turn off video" : "Turn on video"}
          >
            {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
          </button>
        )}

        {/* Speaker Toggle */}
        <button 
          className={`control-button ${isSpeakerOn ? 'active' : ''}`}
          onClick={onToggleSpeaker}
          aria-label={isSpeakerOn ? "Turn off speaker" : "Turn on speaker"}
        >
          {isSpeakerOn ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </button>

        {/* End Call Button */}
        <button 
          className="control-button end-call"
          onClick={onEndCall}
          aria-label="End call"
        >
          <PhoneOff size={24} />
        </button>
      </div>
    </div>
  );
};

export default ActiveCallInterface;
