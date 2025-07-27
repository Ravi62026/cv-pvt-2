import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, User, Bot, Copy, Check, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Message Bubble Component
const MessageBubble = ({ message, isUser, isTyping = false }) => {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // Handle both old format (message.content) and new format (message as string)
  const messageContent = typeof message === 'string' ? message : message.content;
  const isStreaming = typeof message === 'object' && message.isStreaming;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([messageContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `legal-response-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    } catch (err) {
      console.error('Failed to download text:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
            : 'bg-gradient-to-r from-purple-500 to-pink-500'
        }`}>
          {isUser ? (
            <User className="h-4 w-4 text-white" />
          ) : (
            <Bot className="h-4 w-4 text-white" />
          )}
        </div>

        {/* Message Content */}
        <div className={`relative ${isUser ? 'mr-3' : 'ml-3'}`}>
          <div className={`rounded-2xl px-4 py-3 ${
            isUser 
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' 
              : 'bg-white/10 backdrop-blur-sm border border-white/20 text-gray-100'
          }`}>
            {isTyping ? (
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-400 ml-2">AI is thinking...</span>
              </div>
            ) : isUser ? (
              <p className="text-sm leading-relaxed">{messageContent}</p>
            ) : (
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Custom styling for markdown elements
                    h1: ({ children }) => <h1 className="text-lg font-bold text-white mb-2">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-base font-semibold text-white mb-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-semibold text-white mb-1">{children}</h3>,
                    p: ({ children }) => <p className="text-sm leading-relaxed text-gray-100 mb-2">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside text-sm text-gray-100 mb-2 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside text-sm text-gray-100 mb-2 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="text-gray-100">{children}</li>,
                    code: ({ children, className }) => {
                      const isInline = !className;
                      return isInline ? (
                        <code className="bg-black/30 text-cyan-300 px-1 py-0.5 rounded text-xs">{children}</code>
                      ) : (
                        <code className="block bg-black/50 text-cyan-300 p-3 rounded-lg text-xs overflow-x-auto">{children}</code>
                      );
                    },
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-cyan-400 pl-4 italic text-gray-200 my-2">{children}</blockquote>
                    ),
                    strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                    em: ({ children }) => <em className="italic text-gray-200">{children}</em>,
                  }}
                >
                  {messageContent}
                </ReactMarkdown>
                {isStreaming && (
                  <div className="flex items-center mt-2">
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse ml-1" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse ml-1" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Copy and Download Buttons for AI messages */}
          {!isUser && !isTyping && (
            <div className="absolute -bottom-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100">
              <button
                onClick={handleCopy}
                className="p-1 bg-white/10 hover:bg-white/20 rounded-full transition-colors duration-200"
                title="Copy response"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-400" />
                ) : (
                  <Copy className="h-3 w-3 text-gray-400" />
                )}
              </button>
              <button
                onClick={handleDownload}
                className="p-1 bg-white/10 hover:bg-white/20 rounded-full transition-colors duration-200"
                title="Download response"
              >
                {downloaded ? (
                  <Check className="h-3 w-3 text-green-400" />
                ) : (
                  <Download className="h-3 w-3 text-gray-400" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Chat Input Component
const ChatInput = ({ onSendMessage, disabled = false, placeholder = "Type your message..." }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e) => {
    setMessage(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-end space-x-3 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-4">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent text-white placeholder-gray-400 resize-none outline-none min-h-[24px] max-h-[120px] text-sm leading-relaxed"
          rows={1}
        />
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className={`flex-shrink-0 p-2 rounded-xl transition-all duration-200 ${
            message.trim() && !disabled
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          {disabled ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
    </form>
  );
};

// Main Chat Interface Component
const ChatInterface = ({ 
  messages = [], 
  onSendMessage, 
  isLoading = false, 
  placeholder = "Type your message...",
  title = "AI Assistant",
  subtitle = "Ask me anything about legal matters"
}) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [userHasScrolled, setUserHasScrolled] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Check if user has manually scrolled up
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 100; // 100px threshold
      setUserHasScrolled(!isAtBottom);
    }
  };

  // Simple auto-scroll logic - only scroll if user hasn't manually scrolled
  useEffect(() => {
    if (!userHasScrolled) {
      scrollToBottom();
    }
  }, [messages, userHasScrolled]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-black via-gray-900 to-gray-800">
      {/* Compact Header */}
      <div className="flex-shrink-0 bg-white/5 backdrop-blur-sm border-b border-white/10 p-3">
        <div className="text-center">
          <h2 className="text-lg font-bold text-white mb-1">{title}</h2>
          <p className="text-gray-300 text-xs">{subtitle}</p>
        </div>
      </div>

      {/* Extended Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0"
        onScroll={handleScroll}
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        <AnimatePresence>
          {messages.map((msg, index) => (
            <div key={index} className="group">
              <MessageBubble
                message={msg}
                isUser={msg.isUser}
              />
            </div>
          ))}
        </AnimatePresence>
        
        {/* Typing Indicator */}
        {isLoading && (
          <MessageBubble 
            message="" 
            isUser={false} 
            isTyping={true}
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Compact Input Area */}
      <div className="flex-shrink-0 p-3 bg-white/5 backdrop-blur-sm border-t border-white/10">
        <ChatInput 
          onSendMessage={onSendMessage}
          disabled={isLoading}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

export default ChatInterface;
export { MessageBubble, ChatInput };
