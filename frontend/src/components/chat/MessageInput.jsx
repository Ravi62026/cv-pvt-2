import React, { useRef } from 'react';
import { Send, Paperclip, Smile, Image, FileText } from 'lucide-react';

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
  showEmoji = true
}) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && onFileUpload) {
      onFileUpload(file);
    }
    // Reset input
    event.target.value = '';
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
