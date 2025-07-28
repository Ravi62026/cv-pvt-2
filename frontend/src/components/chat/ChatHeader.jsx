import React, { useState } from 'react';
import {
  ArrowLeft,
  User,
  Shield,
  MoreVertical,
  Video,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCall } from '../../contexts/CallContext';
import { useToast } from '../../contexts/ToastContext';
import CallInterface from '../call/CallInterface';

const ChatHeader = ({ otherParticipant, isOnline, onBack, chatId }) => {
  console.log('ChatHeader rendering with props:', { otherParticipant, isOnline, onBack, chatId });

  const { user } = useAuth();
  const { startCall } = useCall();
  const { success, error } = useToast();

  const [showCallInterface, setShowCallInterface] = useState(false);
  const [callType, setCallType] = useState('voice');
  const [callDuration, setCallDuration] = useState(0);

  // Simple test function
  const testFunction = () => {
    console.log('TEST BUTTON CLICKED - This should always work!');
    alert('Test button clicked!');
    if (success) {
      success('Test button works!');
    }
  };



  // Handle video call/consultation request
  const handleVideoCall = async () => {
    console.log('Video call button clicked!');
    console.log('otherParticipant:', otherParticipant);

    // More flexible user ID check
    const userId = otherParticipant?.user?._id || otherParticipant?.user?.id || otherParticipant?._id || otherParticipant?.id;
    const userName = otherParticipant?.user?.name || otherParticipant?.name || 'Unknown User';

    if (!userId) {
      console.log('No user ID available');
      if (error) error('Cannot start consultation: User information not available');
      return;
    }

    try {
      console.log('Starting video consultation with:', userName);
      setCallType('video');
      setShowCallInterface(true);
      setCallDuration(0);

      const userInfo = {
        _id: userId,
        name: userName,
        role: otherParticipant?.user?.role || otherParticipant?.role || 'user'
      };

      const result = await startCall(userId, 'video', chatId, userInfo);
      console.log('✅ Video call started successfully:', result);
      if (success) success(`Video call started with ${userName}`);
    } catch (err) {
      console.error('Failed to start video consultation:', err);
      if (error) error('Failed to start video consultation: ' + err.message);
      setShowCallInterface(false);
    }
  };

  // Handle consultation scheduling
  const handleScheduleConsultation = async (consultationData) => {
    // Temporarily disabled
    console.log('Consultation scheduling temporarily disabled');
    /*
    try {
      const response = await consultationAPI.createRequest(consultationData);
      if (response.success) {
        success('Consultation request sent successfully');
        setShowConsultationModal(false);
      } else {
        error(response.error || 'Failed to send consultation request');
      }
    } catch (err) {
      console.error('Failed to schedule consultation:', err);
      error('Failed to schedule consultation');
    }
    */
  };

  // For testing - make buttons always enabled
  const canMakeVoiceCall = true;
  const canRequestConsultation = true;

  // Debug logging
  console.log('ChatHeader Debug:', {
    isOnline,
    otherParticipant: otherParticipant?.user,
    canMakeVoiceCall,
    canRequestConsultation
  });

  const handleCallEnd = () => {
    setShowCallInterface(false);
    setCallDuration(0);
  };

  const handleCallAccept = () => {
    // Start call timer
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    // Store timer reference for cleanup
    return () => clearInterval(timer);
  };

  return (
    <>
      <div className="bg-white border-b border-gray-200 p-3 sm:p-4">
        <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          )}

          {/* Avatar */}
          <div className="relative">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
              {otherParticipant?.user.role === 'lawyer' ? (
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              ) : (
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              )}
            </div>
            {/* Online Status */}
            {isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>

          {/* User Info */}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
              {otherParticipant?.user.name || 'Unknown User'}
            </h3>
            <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-500">
              <span className="capitalize">{otherParticipant?.user.role}</span>
              {otherParticipant?.user.role === 'lawyer' &&
               otherParticipant?.user.lawyerDetails?.specialization && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline truncate">{otherParticipant.user.lawyerDetails.specialization.join(', ')}</span>
                </>
              )}
            </div>
            <div className="text-xs text-gray-400">
              {isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Video Call/Consultation Button */}
          <button
            onClick={handleVideoCall}
            className="p-1.5 sm:p-2 rounded-full transition-all duration-200 hover:bg-blue-100 text-blue-600 hover:scale-110 active:scale-95"
            title="Start video call"
          >
            <Video className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          {/* More Options Button */}
          <button
            onClick={() => {
              console.log('More options clicked!');
              if (success) success('More options clicked!');
            }}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
          </button>
        </div>
      </div>
      </div>

      {/* Call Interface */}
      {showCallInterface && (
        <CallInterface
          isIncoming={false}
          callerName={otherParticipant?.user.name || 'Unknown User'}
          callerRole={otherParticipant?.user.role || 'User'}
          onAccept={handleCallAccept}
          onDecline={handleCallEnd}
          onEndCall={handleCallEnd}
          isVideoCall={callType === 'video'}
          callDuration={callDuration}
        />
      )}
    </>
  );
};

export default ChatHeader;
