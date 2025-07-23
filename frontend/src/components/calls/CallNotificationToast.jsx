import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  Video,
  Calendar,
  Check,
  X,
  Clock,
  User,
  Shield
} from 'lucide-react';

const CallNotificationToast = ({ 
  notification, 
  onAccept, 
  onReject, 
  onClose,
  isVisible 
}) => {
  if (!isVisible || !notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'incoming_call':
        return notification.callType === 'video' ? Video : Phone;
      case 'consultation_request':
        return Calendar;
      case 'call_ended':
        return Phone;
      case 'consultation_confirmed':
        return Check;
      default:
        return Phone;
    }
  };

  const getTitle = () => {
    switch (notification.type) {
      case 'incoming_call':
        return `Incoming ${notification.callType} call`;
      case 'consultation_request':
        return 'Consultation Request';
      case 'call_ended':
        return 'Call Ended';
      case 'consultation_confirmed':
        return 'Consultation Confirmed';
      default:
        return 'Notification';
    }
  };

  const getMessage = () => {
    switch (notification.type) {
      case 'incoming_call':
        return `${notification.fromUserName} is calling you`;
      case 'consultation_request':
        return `${notification.citizen?.name} has requested a consultation`;
      case 'call_ended':
        return notification.duration 
          ? `Call duration: ${formatDuration(notification.duration)}`
          : 'Call ended';
      case 'consultation_confirmed':
        return `Your consultation has been confirmed`;
      default:
        return notification.message || '';
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getNotificationColor = () => {
    switch (notification.type) {
      case 'incoming_call':
        return 'bg-blue-500';
      case 'consultation_request':
        return 'bg-green-500';
      case 'call_ended':
        return 'bg-gray-500';
      case 'consultation_confirmed':
        return 'bg-green-500';
      default:
        return 'bg-blue-500';
    }
  };

  const showActionButtons = () => {
    return notification.type === 'incoming_call' || notification.type === 'consultation_request';
  };

  const Icon = getIcon();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 300, scale: 0.9 }}
        className="fixed top-4 right-4 z-50 max-w-sm w-full"
      >
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className={`${getNotificationColor()} px-4 py-3`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon className="h-5 w-5 text-white" />
                <h4 className="text-white font-semibold">{getTitle()}</h4>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* User info for calls */}
            {(notification.type === 'incoming_call' || notification.type === 'consultation_request') && (
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  {notification.fromUserRole === 'lawyer' || notification.citizen?.role === 'lawyer' ? (
                    <Shield className="h-5 w-5 text-white" />
                  ) : (
                    <User className="h-5 w-5 text-white" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {notification.fromUserName || notification.citizen?.name}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">
                    {notification.fromUserRole || notification.citizen?.role}
                  </p>
                </div>
              </div>
            )}

            {/* Message */}
            <p className="text-gray-700 mb-4">{getMessage()}</p>

            {/* Consultation details */}
            {notification.type === 'consultation_request' && notification.scheduledDateTime && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>
                    {new Date(notification.scheduledDateTime).toLocaleString()}
                  </span>
                </div>
                {notification.duration && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                    <span>Duration: {notification.duration} minutes</span>
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            {showActionButtons() && (
              <div className="flex space-x-2">
                <button
                  onClick={onReject}
                  className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                >
                  {notification.type === 'incoming_call' ? 'Decline' : 'Reject'}
                </button>
                <button
                  onClick={onAccept}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  {notification.type === 'incoming_call' ? 'Answer' : 'Accept'}
                </button>
              </div>
            )}

            {/* Auto-dismiss timer for non-interactive notifications */}
            {!showActionButtons() && (
              <div className="mt-3">
                <motion.div
                  className="w-full bg-gray-200 rounded-full h-1"
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 5, ease: 'linear' }}
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CallNotificationToast;
