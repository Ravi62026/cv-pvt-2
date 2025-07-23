import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Video, VideoOff, User } from 'lucide-react';
import './IncomingCallModal.css';

const IncomingCallModal = ({ 
  isVisible, 
  callData, 
  onAccept, 
  onReject,
  callerInfo 
}) => {
  const [isRinging, setIsRinging] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsRinging(true);
      // Play ringtone (you can add audio file here)
      const audio = new Audio('/sounds/ringtone.mp3');
      audio.loop = true;
      audio.play().catch(console.error);

      return () => {
        audio.pause();
        audio.currentTime = 0;
      };
    }
  }, [isVisible]);

  if (!isVisible || !callData) return null;

  const isVideoCall = callData.callType === 'video';

  return (
    <div className="incoming-call-overlay">
      <div className="incoming-call-modal">
        {/* Caller Info */}
        <div className="caller-info">
          <div className="caller-avatar">
            {callerInfo?.profilePicture ? (
              <img 
                src={callerInfo.profilePicture} 
                alt={callerInfo.name}
                className="avatar-image"
              />
            ) : (
              <User size={60} className="default-avatar" />
            )}
          </div>
          
          <div className="caller-details">
            <h2 className="caller-name">
              {callerInfo?.name || callData.fromUserId}
            </h2>
            <p className="call-type">
              {isVideoCall ? 'Video Call' : 'Voice Call'}
            </p>
            <p className="call-status">
              Incoming call...
            </p>
          </div>
        </div>

        {/* Call Actions */}
        <div className="call-actions">
          {/* Reject Button */}
          <button 
            className="call-button reject-button"
            onClick={() => onReject(callData)}
            aria-label="Reject call"
          >
            <PhoneOff size={24} />
          </button>

          {/* Accept Voice Button */}
          <button 
            className="call-button accept-button voice-accept"
            onClick={() => onAccept(callData, 'voice')}
            aria-label="Accept voice call"
          >
            <Phone size={24} />
          </button>

          {/* Accept Video Button (only for video calls) */}
          {isVideoCall && (
            <button 
              className="call-button accept-button video-accept"
              onClick={() => onAccept(callData, 'video')}
              aria-label="Accept video call"
            >
              <Video size={24} />
            </button>
          )}
        </div>

        {/* Additional Options */}
        <div className="call-options">
          <button
            className="option-button"
            onClick={() => onReject(callData)}
          >
            <span>Message</span>
          </button>
          <button
            className="option-button"
            onClick={() => onAccept(callData, isVideoCall ? 'video' : 'voice')}
          >
            <span>Accept Call</span>
          </button>
        </div>
      </div>

      {/* Ripple Animation */}
      <div className={`ripple-container ${isRinging ? 'ringing' : ''}`}>
        <div className="ripple"></div>
        <div className="ripple"></div>
        <div className="ripple"></div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
