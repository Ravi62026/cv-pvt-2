import React, { useState } from 'react';
import {
  ArrowLeft,
  User,
  Shield,
  MoreVertical,
  Video,
  Phone,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import VideoCall from '../calls/VideoCall';
import AudioCall from '../calls/AudioCall';

const ChatHeader = ({ otherParticipant, isOnline, onBack, chatId, socket }) => {
  console.log('ChatHeader rendering with props:', { otherParticipant, isOnline, onBack, chatId, socket: !!socket });

  const { user } = useAuth();
  const { success, error } = useToast();

  const [activeCall, setActiveCall] = useState(null);
  const [callType, setCallType] = useState(null);

  // Start video call
  const startVideoCall = () => {
    console.log('🎥 Video call button clicked!');
    console.log('Socket available:', !!socket);
    console.log('Other participant:', otherParticipant);
    console.log('Current user:', user);
    console.log('Receiver ID:', otherParticipant?.user?._id);
    console.log('Caller ID:', user?._id);

    if (!socket) {
      error('Socket connection not available');
      return;
    }

    if (!otherParticipant) {
      error('No participant to call');
      return;
    }

    console.log('Starting video call with:', otherParticipant.user.name);

    setCallType('video');
    setActiveCall({
      type: 'video',
      caller: user,
      receiver: otherParticipant.user,
      chatId: chatId
    });

    // Emit call initiation to server
    const callData = {
      type: 'video',
      receiverId: otherParticipant.user._id,
      chatId: chatId,
      caller: {
        id: user._id,
        name: user.name,
        role: user.role
      }
    };

    console.log('🚀 Emitting initiate-call event:', callData);
    socket.emit('initiate-call', callData);

    success('Video call initiated');
  };

  // Start audio call
  const startAudioCall = () => {
    console.log('📞 Audio call button clicked!');
    console.log('Socket available:', !!socket);
    console.log('Other participant:', otherParticipant);

    if (!socket) {
      error('Socket connection not available');
      return;
    }

    if (!otherParticipant) {
      error('No participant to call');
      return;
    }

    console.log('Starting audio call with:', otherParticipant.user.name);

    setCallType('audio');
    setActiveCall({
      type: 'audio',
      caller: user,
      receiver: otherParticipant.user,
      chatId: chatId
    });

    // Emit call initiation to server
    const callData = {
      type: 'audio',
      receiverId: otherParticipant.user._id,
      chatId: chatId,
      caller: {
        id: user._id,
        name: user.name,
        role: user.role
      }
    };

    console.log('🚀 Emitting initiate-call event:', callData);
    socket.emit('initiate-call', callData);

    success('Audio call initiated');
  };

  // End call
  const endCall = () => {
    if (socket && activeCall) {
      socket.emit('end-call', {
        chatId: chatId,
        callType: callType
      });
    }

    setActiveCall(null);
    setCallType(null);
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
          {/* Audio Call Button */}
          <button
            onClick={startAudioCall}
            className="p-2 hover:bg-white/10 rounded-full transition-colors border border-white/20 backdrop-blur-sm"
            title="Start audio call"
          >
            <Phone className="h-5 w-5 text-gray-300" />
          </button>

          {/* Video Call Button */}
          <button
            onClick={startVideoCall}
            className="p-2 hover:bg-white/10 rounded-full transition-colors border border-white/20 backdrop-blur-sm"
            title="Start video call"
          >
            <Video className="h-5 w-5 text-gray-300" />
          </button>

          {/* Test Socket Button */}
          <button
            onClick={() => {
              console.log('🧪 Testing socket connection...');
              if (socket) {
                console.log('Socket exists, emitting test event');
                socket.emit('test-event', { message: 'Hello from frontend!' });
                success('Test event sent!');
              } else {
                console.log('❌ No socket available');
                error('No socket connection!');
              }
            }}
            className="p-2 hover:bg-white/10 rounded-full transition-colors border border-white/20 backdrop-blur-sm"
            title="Test Socket"
          >
            <MoreVertical className="h-5 w-5 text-gray-300" />
          </button>
        </div>
      </div>
      </div>

      {/* Call Components */}
      {activeCall && callType === 'video' && (
        <VideoCall
          call={activeCall}
          onEndCall={endCall}
          socket={socket}
        />
      )}

      {activeCall && callType === 'audio' && (
        <AudioCall
          call={activeCall}
          onEndCall={endCall}
          socket={socket}
        />
      )}
    </>
  );
};

export default ChatHeader;
