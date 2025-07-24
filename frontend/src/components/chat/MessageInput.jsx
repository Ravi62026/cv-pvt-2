import React, { useRef, useState } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import EmojiPicker from './EmojiPicker';

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && onFileUpload) {
      onFileUpload(file);
    }
    // Reset input
    event.target.value = '';
  };

  const handleEmojiSelect = (emoji) => {
    // Create a synthetic event to update the message input
    const syntheticEvent = {
      target: {
        value: value + emoji
      }
    };
    onChange(syntheticEvent);
    setShowEmojiPicker(false);
  };
  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border-t border-white/20 p-3 sm:p-4">
      <div className="flex items-end space-x-2 sm:space-x-3">
        {/* Attachment Button */}
        {showAttachments && (
          <div className="relative">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="p-2 sm:p-3 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50 border border-white/20"
              title="Attach file"
            >
              <Paperclip className="h-4 w-4 sm:h-5 sm:w-5 text-gray-300" />
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
            className="w-full p-3 sm:p-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 resize-none text-white placeholder-gray-400 backdrop-blur-sm text-sm sm:text-base"
            style={{
              minHeight: '44px',
              maxHeight: '120px',
            }}
          />
        </div>

        {/* Emoji Button */}
        {showEmoji && (
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 sm:p-3 hover:bg-white/10 rounded-full transition-colors border border-white/20"
              title="Add emoji"
            >
              <Smile className="h-4 w-4 sm:h-5 sm:w-5 text-gray-300" />
            </button>

            <EmojiPicker
              isOpen={showEmojiPicker}
              onClose={() => setShowEmojiPicker(false)}
              onEmojiSelect={handleEmojiSelect}
              position="bottom"
            />
          </div>
        )}

        {/* Send Button */}
        <button
          onClick={onSend}
          disabled={(!value.trim() && !isUploading) || isSending}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 sm:p-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-green-500/25 hover:scale-105 active:scale-95"
        >
          <Send className="h-4 w-4 sm:h-5 sm:w-5" />
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
