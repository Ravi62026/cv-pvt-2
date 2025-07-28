import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  Video,
  PhoneOff,
  User,
  Shield,
  Bell,
  X
} from 'lucide-react';
import { useCall } from '../../contexts/CallContext';
import { useAuth } from '../../contexts/AuthContext';
import IncomingCallScreen from '../call/IncomingCallScreen';

const CallNotificationWidget = () => {
  const { callState, incomingCall, participantInfo, acceptCall, rejectCall } = useCall();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (callState === 'incoming' && incomingCall) {
      setIsVisible(true);
      setTimeLeft(30);
    } else {
      setIsVisible(false);
    }
  }, [callState, incomingCall]);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleReject(); // Auto-reject after timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible]);

  const handleAccept = async () => {
    try {
      await acceptCall(incomingCall, incomingCall?.callType || 'voice');
      setIsVisible(false);
    } catch (error) {
      console.error('Failed to accept call:', error);
    }
  };

  const handleReject = async () => {
    try {
      await rejectCall(incomingCall);
      setIsVisible(false);
    } catch (error) {
      console.error('Failed to reject call:', error);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible || !incomingCall) return null;

  const isVideoCall = incomingCall.callType === 'video';
  const callerName = participantInfo?.name || incomingCall.fromUserName || 'Unknown User';
  const callerRole = participantInfo?.role || incomingCall.fromUserRole || 'user';

  return (
    <IncomingCallScreen
      isVisible={isVisible}
      callerInfo={{
        name: callerName,
        role: callerRole,
        _id: incomingCall?.fromUserId
      }}
      callType={incomingCall?.callType || 'voice'}
      onAccept={handleAccept}
      onDecline={handleReject}
      chatId={incomingCall?.chatId}
    />
  );
};

export default CallNotificationWidget;
