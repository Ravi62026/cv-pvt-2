import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Phone,
  Video,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Clock,
  User,
  Shield,
  Calendar,
  MoreVertical
} from 'lucide-react';
import { callAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useSocket, useSocketEvent } from '../../hooks/useSocket';

const CallHistoryCard = ({ limit = 5 }) => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { error } = useToast();
  const { socket } = useSocket();

  useEffect(() => {
    fetchCallHistory();
  }, []);

  // Real-time updates for new calls
  useSocketEvent('call_ended', (callData) => {
    console.log('📞 Call ended, updating history:', callData);
    // Add new call to the beginning of the list and keep only the limit
    setCalls(prev => [callData, ...prev.slice(0, limit - 1)]);
  }, [limit]);

  // Real-time updates for call status changes
  useSocketEvent('call_status_updated', (updateData) => {
    console.log('📞 Call status updated:', updateData);
    setCalls(prev => prev.map(call =>
      call._id === updateData.callId
        ? { ...call, status: updateData.newStatus, duration: updateData.duration }
        : call
    ));
  }, []);

  const fetchCallHistory = async () => {
    try {
      setLoading(true);
      const response = await callAPI.getCallHistory({ limit });
      if (response.success) {
        setCalls(response.data.calls || []);
      }
    } catch (err) {
      console.error('Failed to fetch call history:', err);
      error('Failed to load call history');
    } finally {
      setLoading(false);
    }
  };

  const getCallIcon = (call) => {
    const isIncoming = call.initiator._id !== user._id;
    const isVideo = call.callType === 'video';
    
    if (call.status === 'missed') {
      return <PhoneMissed className="h-4 w-4 text-red-500" />;
    }
    
    if (isIncoming) {
      return isVideo ? 
        <Video className="h-4 w-4 text-blue-500" /> : 
        <PhoneIncoming className="h-4 w-4 text-green-500" />;
    } else {
      return isVideo ? 
        <Video className="h-4 w-4 text-blue-500" /> : 
        <PhoneOutgoing className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCallStatusColor = (status) => {
    switch (status) {
      case 'answered':
      case 'ended':
        return 'text-green-600';
      case 'missed':
        return 'text-red-600';
      case 'rejected':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return 'No duration';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCallTime = (date) => {
    const now = new Date();
    const callDate = new Date(date);
    const diffInHours = (now - callDate) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return callDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return callDate.toLocaleDateString([], { weekday: 'short' });
    } else {
      return callDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getOtherParticipant = (call) => {
    return call.participants.find(p => p.user._id !== user._id)?.user;
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Phone className="h-5 w-5 mr-2 text-blue-400" />
            Recent Calls
          </h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Phone className="h-5 w-5 mr-2 text-blue-400" />
          Recent Calls
        </h3>
        {calls.length > 0 && (
          <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
            View All
          </button>
        )}
      </div>

      {calls.length === 0 ? (
        <div className="text-center py-8">
          <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-300">No recent calls</p>
          <p className="text-sm text-gray-400 mt-2">
            Your call history will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {calls.map((call) => {
            const otherParticipant = getOtherParticipant(call);
            const isIncoming = call.initiator._id !== user._id;
            
            return (
              <motion.div
                key={call._id}
                whileHover={{ scale: 1.02 }}
                className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                {/* Call Type Icon */}
                <div className="flex-shrink-0">
                  {getCallIcon(call)}
                </div>

                {/* Participant Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    {otherParticipant?.role === 'lawyer' ? (
                      <Shield className="h-5 w-5 text-white" />
                    ) : (
                      <User className="h-5 w-5 text-white" />
                    )}
                  </div>
                </div>

                {/* Call Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-white font-medium truncate">
                      {otherParticipant?.name || 'Unknown User'}
                    </p>
                    <span className="text-xs text-gray-400">
                      {formatCallTime(call.startTime)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-xs capitalize ${getCallStatusColor(call.status)}`}>
                      {isIncoming ? 'Incoming' : 'Outgoing'} • {call.status}
                    </span>
                    {call.duration > 0 && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="text-xs text-gray-400 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDuration(call.duration)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Menu */}
                <div className="flex-shrink-0">
                  <button className="p-1 hover:bg-white/10 rounded-full transition-colors">
                    <MoreVertical className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default CallHistoryCard;
