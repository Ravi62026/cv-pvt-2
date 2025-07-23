import React, { useState } from 'react';
import {
  ArrowLeft,
  User,
  Shield,
  MoreVertical,
  Phone,
  Video,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCall } from '../../contexts/CallContext';
// import { consultationAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
// import VoiceCallInterface from '../calls/VoiceCallInterface';
// import VideoCallInterface from '../calls/VideoCallInterface';
// import ConsultationScheduleModal from '../calls/ConsultationScheduleModal';

const ChatHeader = ({ otherParticipant, isOnline, onBack, chatId }) => {
  console.log('ChatHeader rendering with props:', { otherParticipant, isOnline, onBack, chatId });

  const { user } = useAuth();
  const { startCall } = useCall();
  const { success, error } = useToast();

  // Simple test function
  const testFunction = () => {
    console.log('TEST BUTTON CLICKED - This should always work!');
    alert('Test button clicked!');
    if (success) {
      success('Test button works!');
    }
  };

  // Handle voice call initiation
  const handleVoiceCall = async () => {
    console.log('Voice call button clicked!');
    console.log('otherParticipant:', otherParticipant);

    if (!otherParticipant?.user?._id) {
      console.log('No user ID available');
      if (error) error('Cannot start call: User information not available');
      return;
    }

    try {
      console.log('Starting voice call with:', otherParticipant.user.name);
      const result = await startCall(otherParticipant.user._id, 'voice', chatId);
      console.log('✅ Voice call started successfully:', result);
      if (success) success(`Voice call started with ${otherParticipant.user.name}`);
    } catch (err) {
      console.error('Failed to start voice call:', err);
      if (error) error('Failed to start voice call: ' + err.message);
    }
  };

  // Handle video call/consultation request
  const handleVideoCall = async () => {
    console.log('Video call button clicked!');
    console.log('otherParticipant:', otherParticipant);

    if (!otherParticipant?.user?._id) {
      console.log('No user ID available');
      if (error) error('Cannot start consultation: User information not available');
      return;
    }

    try {
      console.log('Starting video consultation with:', otherParticipant.user.name);
      const result = await startCall(otherParticipant.user._id, 'video', chatId);
      console.log('✅ Video call started successfully:', result);
      if (success) success(`Video call started with ${otherParticipant.user.name}`);
    } catch (err) {
      console.error('Failed to start video consultation:', err);
      if (error) error('Failed to start video consultation: ' + err.message);
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

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}

          {/* Avatar */}
          <div className="relative">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              {otherParticipant?.user.role === 'lawyer' ? (
                <Shield className="h-5 w-5 text-white" />
              ) : (
                <User className="h-5 w-5 text-white" />
              )}
            </div>
            {/* Online Status */}
            {isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>

          {/* User Info */}
          <div>
            <h3 className="font-semibold text-gray-900">
              {otherParticipant?.user.name || 'Unknown User'}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="capitalize">{otherParticipant?.user.role}</span>
              {otherParticipant?.user.role === 'lawyer' && 
               otherParticipant?.user.lawyerDetails?.specialization && (
                <>
                  <span>•</span>
                  <span>{otherParticipant.user.lawyerDetails.specialization.join(', ')}</span>
                </>
              )}
            </div>
            <div className="text-xs text-gray-400">
              {isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Test Button - Always clickable */}
          <button
            onClick={testFunction}
            className="p-2 rounded-full transition-colors hover:bg-green-100 text-green-600 border border-green-300"
            title="Test button"
          >
            <span className="text-xs font-bold">T</span>
          </button>

          {/* Voice Call Button */}
          <button
            onClick={handleVoiceCall}
            className="p-2 rounded-full transition-colors border hover:bg-blue-100 text-blue-600 border-blue-300 cursor-pointer"
            title="Start voice call"
          >
            <Phone className="h-5 w-5" />
          </button>

          {/* Video Call/Consultation Button */}
          <button
            onClick={handleVideoCall}
            className="p-2 rounded-full transition-colors border hover:bg-purple-100 text-purple-600 border-purple-300 cursor-pointer"
            title="Request video consultation"
          >
            <Video className="h-5 w-5" />
          </button>

          {/* More Options Button */}
          <button
            onClick={() => {
              console.log('More options clicked!');
              alert('More options clicked!');
              if (success) success('More options clicked!');
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors border border-gray-300"
          >
            <MoreVertical className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Call Interfaces and Modals - Temporarily disabled */}
      {/*
      <VoiceCallInterface
        isOpen={showVoiceCall}
        onClose={() => setShowVoiceCall(false)}
        targetUser={otherParticipant?.user}
        chatId={chatId}
      />

      <VideoCallInterface
        isOpen={showVideoCall}
        onClose={() => setShowVideoCall(false)}
        targetUser={otherParticipant?.user}
        chatId={chatId}
      />

      <ConsultationScheduleModal
        isOpen={showConsultationModal}
        onClose={() => setShowConsultationModal(false)}
        targetUser={otherParticipant?.user}
        onSchedule={handleScheduleConsultation}
      />
      */}
    </div>
  );
};

export default ChatHeader;
