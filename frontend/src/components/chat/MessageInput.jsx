import React, { useRef } from 'react';
import { Send, Paperclip, Smile, Image, FileText, Phone, Video } from 'lucide-react';
import { useCall } from '../../contexts/CallContext';
import { useToast } from '../../contexts/ToastContext';
import { useSocket } from '../../hooks/useSocket';

const MessageInput = ({
  value,
  onChange,
  onKeyDown,
  onSend,
  onFileUpload,
  isSending,
  isUploading = false,
  placeholder = "Type a message...",
  showAttachments = true,
  showEmoji = true,
  otherParticipant = null,
  chatId = null
}) => {
  const fileInputRef = useRef(null);
  const { startCall } = useCall();
  const { success, error } = useToast();
  const { socket, isConnected } = useSocket();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && onFileUpload) {
      onFileUpload(file);
    }
    // Reset input
    event.target.value = '';
  };

  // Handle voice call initiation
  const handleVoiceCall = async () => {
    console.log('🎤 Voice call button clicked in chat!');
    console.log('📋 Debug info:', {
      otherParticipant,
      chatId,
      startCall: typeof startCall,
      success: typeof success,
      error: typeof error,
      socket: !!socket,
      isConnected
    });

    // Check socket connection first
    if (!socket || !isConnected) {
      console.log('❌ Socket not connected');
      if (error) error('Connection not available. Please check your internet connection.');
      return;
    }

    if (!otherParticipant?.user?._id) {
      console.log('❌ No user ID available for voice call');
      if (error) error('Cannot start call: User information not available');
      return;
    }

    try {
      console.log('📞 Starting voice call with:', otherParticipant.user.name, 'ID:', otherParticipant.user._id);
      const result = await startCall(otherParticipant.user._id, 'voice', chatId);
      console.log('✅ Voice call started successfully:', result);
      if (success) success(`Voice call started with ${otherParticipant.user.name}`);
    } catch (err) {
      console.error('❌ Failed to start voice call:', err);
      if (error) error('Failed to start voice call: ' + err.message);
    }
  };

  // Handle video call initiation
  const handleVideoCall = async () => {
    console.log('📹 Video call button clicked in chat!');
    console.log('📋 Debug info:', {
      otherParticipant,
      chatId,
      startCall: typeof startCall,
      success: typeof success,
      error: typeof error,
      socket: !!socket,
      isConnected
    });

    // Check socket connection first
    if (!socket || !isConnected) {
      console.log('❌ Socket not connected');
      if (error) error('Connection not available. Please check your internet connection.');
      return;
    }

    if (!otherParticipant?.user?._id) {
      console.log('❌ No user ID available for video call');
      if (error) error('Cannot start call: User information not available');
      return;
    }

    try {
      console.log('📹 Starting video call with:', otherParticipant.user.name, 'ID:', otherParticipant.user._id);
      const result = await startCall(otherParticipant.user._id, 'video', chatId);
      console.log('✅ Video call started successfully:', result);
      if (success) success(`Video call started with ${otherParticipant.user.name}`);
    } catch (err) {
      console.error('❌ Failed to start video call:', err);
      if (error) error('Failed to start video call: ' + err.message);
    }
  };
  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border-t border-white/20 p-4">
      <div className="flex items-end space-x-3">
        {/* Attachment Button */}
        {showAttachments && (
          <div className="relative">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
              title="Attach file"
            >
              <Paperclip className="h-5 w-5 text-gray-300" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.xls,.xlsx"
            />
          </div>
        )}

        {/* Message Input */}
        <div className="flex-1 relative">
          <textarea
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            rows={1}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400 resize-none text-white placeholder-gray-400"
            style={{
              minHeight: '44px',
              maxHeight: '120px',
            }}
          />
        </div>

        {/* Emoji Button */}
        {showEmoji && (
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Smile className="h-5 w-5 text-gray-300" />
          </button>
        )}

        {/* Call Buttons - Functional WebRTC calls */}
        <button
          onClick={handleVoiceCall}
          disabled={!otherParticipant?.user?._id || !socket || !isConnected}
          className={`p-2 hover:bg-blue-500/20 rounded-full transition-colors border border-blue-400 ${
            (!otherParticipant?.user?._id || !socket || !isConnected) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
          title={
            !socket || !isConnected ? 'Connection not available' :
            !otherParticipant?.user?._id ? 'Voice call not available' :
            `Start voice call with ${otherParticipant.user.name}`
          }
        >
          <Phone className="h-5 w-5 text-blue-400" />
        </button>

        <button
          onClick={handleVideoCall}
          disabled={!otherParticipant?.user?._id || !socket || !isConnected}
          className={`p-2 hover:bg-purple-500/20 rounded-full transition-colors border border-purple-400 ${
            (!otherParticipant?.user?._id || !socket || !isConnected) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
          title={
            !socket || !isConnected ? 'Connection not available' :
            !otherParticipant?.user?._id ? 'Video call not available' :
            `Start video call with ${otherParticipant.user.name}`
          }
        >
          <Video className="h-5 w-5 text-purple-400" />
        </button>

        <button
          onClick={() => {
            console.log('TEST BUTTON CLICKED IN CHAT!');
            alert('Test button clicked in chat!');
          }}
          className="p-2 hover:bg-green-500/20 rounded-full transition-colors border border-green-400"
          title="Test Button (Chat)"
        >
          <span className="text-xs font-bold text-green-400">T</span>
        </button>

        {/* Send Button */}
        <button
          onClick={onSend}
          disabled={(!value.trim() && !isUploading) || isSending}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-full transition-colors"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="mt-2 p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
            <span className="text-sm text-blue-400">Uploading file...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageInput;
