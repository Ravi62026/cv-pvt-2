import React, { useState, useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { useWebRTC } from '../../hooks/useWebRTC';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import IncomingCallNotification from './IncomingCallNotification';
import VoiceCallInterface from './VoiceCallInterface';
import VideoCallInterface from './VideoCallInterface';
import ConsultationScheduleModal from './ConsultationScheduleModal';
import { consultationAPI, callAPI } from '../../services/api';

const CallManager = () => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const { success, error } = useToast();
  const {
    isCallActive,
    callType,
    isIncomingCall,
    incomingCallData,
    answerCall,
    rejectCall,
    endCall
  } = useWebRTC();

  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [currentCallData, setCurrentCallData] = useState(null);
  const [consultationRequest, setConsultationRequest] = useState(null);

  // Handle incoming call notifications
  useEffect(() => {
    if (!socket) return;

    // Listen for incoming calls
    const handleIncomingCall = (callData) => {
      console.log('📞 Incoming call:', callData);
      setCurrentCallData(callData);
      setShowIncomingCall(true);
      
      // Play notification sound (optional)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`Incoming ${callData.callType} call`, {
          body: `${callData.fromUserName} is calling you`,
          icon: '/favicon.ico',
          tag: 'incoming-call'
        });
      }
    };

    // Listen for call status updates
    const handleCallAnswered = (data) => {
      console.log('📞 Call answered:', data);
      setShowIncomingCall(false);
      
      if (data.callType === 'voice') {
        setShowVoiceCall(true);
      } else if (data.callType === 'video') {
        setShowVideoCall(true);
      }
    };

    const handleCallEnded = (data) => {
      console.log('📞 Call ended:', data);
      setShowIncomingCall(false);
      setShowVoiceCall(false);
      setShowVideoCall(false);
      setCurrentCallData(null);
      
      if (data.duration > 0) {
        success(`Call ended. Duration: ${formatDuration(data.duration)}`);
      }
    };

    const handleCallRejected = (data) => {
      console.log('📞 Call rejected:', data);
      setShowIncomingCall(false);
      setCurrentCallData(null);
      error('Call was rejected');
    };

    // Listen for consultation requests
    const handleConsultationRequest = (data) => {
      console.log('📅 Consultation request:', data);
      setConsultationRequest(data);
      
      // Show notification for lawyers
      if (user?.role === 'lawyer') {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('New Consultation Request', {
            body: `${data.citizen.name} has requested a consultation`,
            icon: '/favicon.ico',
            tag: 'consultation-request'
          });
        }
        success(`New consultation request from ${data.citizen.name}`);
      }
    };

    const handleConsultationStatusUpdate = (data) => {
      console.log('📅 Consultation status updated:', data);
      
      if (data.status === 'confirmed') {
        success('Your consultation has been confirmed');
      } else if (data.status === 'cancelled') {
        error('Your consultation has been cancelled');
      }
    };

    const handleConsultationCancelled = (data) => {
      console.log('📅 Consultation cancelled:', data);
      error(`Consultation cancelled by ${data.cancelledBy.name}`);
    };

    // Register event listeners
    socket.on('incoming_call', handleIncomingCall);
    socket.on('call_answered', handleCallAnswered);
    socket.on('call_ended', handleCallEnded);
    socket.on('call_rejected', handleCallRejected);
    socket.on('new_consultation_request', handleConsultationRequest);
    socket.on('consultation_status_updated', handleConsultationStatusUpdate);
    socket.on('consultation_cancelled', handleConsultationCancelled);

    // Cleanup listeners
    return () => {
      socket.off('incoming_call', handleIncomingCall);
      socket.off('call_answered', handleCallAnswered);
      socket.off('call_ended', handleCallEnded);
      socket.off('call_rejected', handleCallRejected);
      socket.off('new_consultation_request', handleConsultationRequest);
      socket.off('consultation_status_updated', handleConsultationStatusUpdate);
      socket.off('consultation_cancelled', handleConsultationCancelled);
    };
  }, [socket, user, success, error]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Handle answering incoming call
  const handleAnswerCall = async () => {
    if (!currentCallData) return;

    try {
      setShowIncomingCall(false);
      
      // Answer the call through WebRTC
      await answerCall(currentCallData);
      
      // Update call status via API
      await callAPI.answerCall(currentCallData.callId);
      
      // Show appropriate call interface
      if (currentCallData.callType === 'voice') {
        setShowVoiceCall(true);
      } else if (currentCallData.callType === 'video') {
        setShowVideoCall(true);
      }
    } catch (err) {
      console.error('Failed to answer call:', err);
      error('Failed to answer call');
      setShowIncomingCall(false);
    }
  };

  // Handle rejecting incoming call
  const handleRejectCall = async () => {
    if (!currentCallData) return;

    try {
      setShowIncomingCall(false);
      
      // Reject the call through WebRTC
      rejectCall(currentCallData);
      
      // Update call status via API
      await callAPI.rejectCall(currentCallData.callId);
      
      setCurrentCallData(null);
    } catch (err) {
      console.error('Failed to reject call:', err);
      error('Failed to reject call');
    }
  };

  // Handle ending call
  const handleEndCall = async () => {
    try {
      // End the call through WebRTC
      endCall();
      
      // Update call status via API if we have call data
      if (currentCallData?.callId) {
        await callAPI.endCall(currentCallData.callId);
      }
      
      // Close call interfaces
      setShowVoiceCall(false);
      setShowVideoCall(false);
      setCurrentCallData(null);
    } catch (err) {
      console.error('Failed to end call:', err);
      error('Failed to end call');
    }
  };

  // Format duration in seconds to MM:SS
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Incoming Call Notification */}
      <IncomingCallNotification
        isVisible={showIncomingCall}
        callData={currentCallData}
        onAnswer={handleAnswerCall}
        onReject={handleRejectCall}
      />

      {/* Voice Call Interface */}
      <VoiceCallInterface
        isOpen={showVoiceCall}
        onClose={handleEndCall}
        targetUser={currentCallData ? {
          _id: currentCallData.fromUserId,
          name: currentCallData.fromUserName,
          role: currentCallData.fromUserRole
        } : null}
        chatId={currentCallData?.chatId}
        isIncoming={true}
        callData={currentCallData}
      />

      {/* Video Call Interface */}
      <VideoCallInterface
        isOpen={showVideoCall}
        onClose={handleEndCall}
        targetUser={currentCallData ? {
          _id: currentCallData.fromUserId,
          name: currentCallData.fromUserName,
          role: currentCallData.fromUserRole
        } : null}
        chatId={currentCallData?.chatId}
        isIncoming={true}
        callData={currentCallData}
      />
    </>
  );
};

export default CallManager;
