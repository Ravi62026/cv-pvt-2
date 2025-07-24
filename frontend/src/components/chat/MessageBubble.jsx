import React from 'react';
import { motion } from 'framer-motion';
import { Check, CheckCheck, Clock, User, Shield } from 'lucide-react';
import FileMessage from './FileMessage';

const MessageBubble = ({ message, isOwn, showAvatar }) => {
  // Handle file messages separately
  if (message.messageType === 'file' && message.fileData) {
    return (
      <FileMessage
        fileData={message.fileData}
        isOwn={isOwn}
        timestamp={message.timestamp}
        sender={message.sender}
      />
    );
  }
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageStatus = () => {
    if (message.status === 'sending') {
      return <Clock className="h-3 w-3 text-gray-400" />;
    }
    if (message.isRead && message.isRead.length > 0) {
      return <CheckCheck className="h-3 w-3 text-blue-400" />;
    }
    return <Check className="h-3 w-3 text-gray-500" />;
  };

  // Handle system messages separately
  if (message.messageType === 'system') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex justify-center mb-4"
      >
        <div className={`text-center text-xs px-4 py-2 rounded-lg max-w-md backdrop-blur-sm ${
          message.callType
            ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
            : 'bg-white/10 text-gray-300 border border-white/20'
        }`}>
          {message.content}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}
    >
      <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[85%] sm:max-w-[75%] lg:max-w-[65%]`}>
        {/* Avatar */}
        {showAvatar && !isOwn && (
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
            {message.sender.role === 'lawyer' ? (
              <Shield className="h-4 w-4 text-white" />
            ) : (
              <User className="h-4 w-4 text-white" />
            )}
          </div>
        )}

        {/* Message Content Container */}
        <div className="flex flex-col min-w-0 flex-1">
          {/* Sender Name (for received messages) */}
          {!isOwn && showAvatar && (
            <div className="text-xs text-gray-300 mb-1 px-1">
              {message.sender.name}
            </div>
          )}

          {/* Message Bubble */}
          <div
            className={`
              relative inline-block max-w-full
              ${isOwn ? 'ml-auto' : 'mr-auto'}
            `}
          >
            <div
              className={`
                px-3 py-2.5 rounded-2xl backdrop-blur-sm relative
                ${isOwn
                  ? 'bg-gradient-to-r from-green-600/90 to-green-700/90 text-white border border-green-500/40 message-bubble-shadow-own'
                  : 'bg-white/15 border border-white/25 text-white message-bubble-shadow'
                }
                ${message.status === 'sending' ? 'opacity-70' : ''}
              `}
            >
              {/* Message Text */}
              <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                {message.content}
              </p>

              {/* Message Time and Status */}
              <div className={`flex items-center justify-end gap-1 mt-1.5 ${isOwn ? 'text-green-100/80' : 'text-gray-300/80'}`}>
                <span className="text-xs font-medium">
                  {formatTime(message.timestamp)}
                </span>
                {isOwn && (
                  <div className="flex items-center ml-1">
                    {getMessageStatus()}
                  </div>
                )}
              </div>

              {/* Message Tail */}
              <div
                className={`
                  absolute top-3 w-2.5 h-2.5 transform rotate-45
                  ${isOwn
                    ? 'bg-gradient-to-br from-green-600/90 to-green-700/90 -right-1'
                    : 'bg-white/15 border-r border-b border-white/25 -left-1'
                  }
                `}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
