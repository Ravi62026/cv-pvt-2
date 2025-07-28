import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket, useSocketEvent } from '../hooks/useSocket';
import { useCall } from '../contexts/CallContext';
import { useToast } from '../contexts/ToastContext';
import { Send, ArrowLeft, Video, MoreVertical } from 'lucide-react';
import MessageInput from '../components/chat/MessageInput';
import MessageBubble from '../components/chat/MessageBubble';
import { authAPI, chatAPI } from '../services/api';

const ChatPage = () => {
  const { chatId: rawChatId } = useParams();
  // Decode the URL-encoded chatId
  const chatId = decodeURIComponent(rawChatId);
  const navigate = useNavigate();
  const { user, getToken } = useAuth();
  const { socket, isConnected } = useSocket();
  const { startCall } = useCall();
  const { success, error } = useToast();


  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatInfo, setChatInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);



  useEffect(() => {
    // Only proceed if user is authenticated
    if (!user || !getToken()) {
      console.log('⏳ FRONTEND: Waiting for user authentication...');
      return;
    }

    console.log('👤 FRONTEND: User authenticated, proceeding with chat setup...');

    // Test token validity first
    testTokenValidity().then((validUser) => {
      if (validUser) {
        console.log('🔐 FRONTEND: Token validated for user:', validUser.name);
        fetchChatInfo();
        fetchMessages();
      } else {
        console.log('❌ FRONTEND: Token validation failed, not proceeding with chat setup');
      }
    });

    // Join chat room when component mounts
    if (socket && chatId && isConnected) {
      console.log('🏠 FRONTEND: Joining chat room:', chatId);
      socket.emit('join_chat', chatId);
    }

    // Cleanup: leave chat room when component unmounts
    return () => {
      if (socket && chatId) {
        console.log('🚪 FRONTEND: Leaving chat room:', chatId);
        socket.emit('leave_chat', chatId);
      }
    };
  }, [chatId, socket, isConnected, user]);

  const testTokenValidity = async () => {
    try {
      console.log('🧪 FRONTEND: Testing token validity using API client...');

      const result = await authAPI.getCurrentUser();

      if (result.success) {
        console.log('✅ FRONTEND: Token is valid, user:', result.data.name);
        return result.data;
      } else {
        console.error('❌ FRONTEND: Token validation failed:', result.error);
        if (result.error.includes('token') || result.error.includes('Session expired')) {
          console.log('🔄 FRONTEND: Session expired, redirecting to login...');
          navigate('/login');
        }
        return null;
      }
    } catch (error) {
      console.error('🚨 FRONTEND: Token test failed:', error);
      return null;
    }
  };

  // Socket event handlers
  useSocketEvent('new_message', async (messageData) => {
    console.log('💬 FRONTEND: Received new_message:', messageData);
    if (messageData.chatId === chatId) {
      console.log('   ✅ Message is for current chat, adding to messages');

      setMessages(prev => {
        // Check if message already exists (avoid duplicates)
        const messageExists = prev.some(msg =>
          msg._id === messageData._id ||
          (msg.tempId && msg.tempId === messageData.tempId)
        );

        if (messageExists) {
          // Update existing message (replace temp with real)
          return prev.map(msg =>
            msg.tempId === messageData.tempId
              ? { ...messageData, status: 'sent' }
              : msg
          );
        } else {
          // Add new message
          return [...prev, { ...messageData, status: 'received' }];
        }
      });
    }
  }, [chatId]);

  useSocketEvent('message_sent', (data) => {
    console.log('✅ FRONTEND: Message sent confirmation:', data);
    setIsSending(false);

    // Update the temporary message with the real message data
    if (data.tempId) {
      setMessages(prev => prev.map(msg =>
        msg.tempId === data.tempId
          ? { ...msg, _id: data.messageId, status: 'sent', timestamp: data.timestamp }
          : msg
      ));
    }
  }, []);

  useSocketEvent('error', (error) => {
    console.error('❌ FRONTEND: Socket error:', error);
    setIsSending(false);

    // Remove failed messages
    setMessages(prev => prev.filter(msg => msg.status !== 'sending'));
  }, []);

  const fetchChatInfo = async () => {
    try {
      console.log('📋 FRONTEND: Fetching chat info using API client...');

      const result = await chatAPI.getChatInfo(chatId);

      if (result.success) {
        const data = result.data;

        // Extract other user from participants
        const currentUserId = user?.id || user?._id;
        const otherParticipant = data.chat.participants.find(
          p => (p.user._id || p.user.id) !== currentUserId
        );

        console.log('👥 FRONTEND: Chat participants:', data.chat.participants);
        console.log('👤 FRONTEND: Current user ID:', currentUserId);
        console.log('👤 FRONTEND: Other participant:', otherParticipant);

        // Add otherUser to the data for easier access
        const chatData = {
          ...data.chat,
          otherUser: otherParticipant?.user
        };

        console.log('💬 FRONTEND: Final chat data:', chatData);
        setChatInfo({ ...data, chat: chatData });
      } else if (result.error.includes('not found') && chatId.startsWith('direct_')) {
        // If it's a direct chat that doesn't exist, try to create it
        console.log('📝 FRONTEND: Direct chat not found, attempting to create...');
        await createDirectChatIfNeeded();
      } else if (result.error.includes('token') || result.error.includes('Authentication')) {
        console.error('🔐 FRONTEND: Authentication failed - token may be expired');
        navigate('/login');
      } else {
        console.error('🚨 FRONTEND: Failed to fetch chat info:', result.error);
      }
    } catch (error) {
      console.error('Error fetching chat info:', error);
    }
  };

  const createDirectChatIfNeeded = async () => {
    try {
      // Extract the other user ID from the chatId
      // chatId format: direct_userId1_userId2
      const parts = chatId.split('_');
      if (parts.length !== 3) return;

      const userId1 = parts[1];
      const userId2 = parts[2];
      const currentUserId = user?.id || user?._id;

      // Determine which user is the other user
      const otherUserId = userId1 === currentUserId ? userId2 : userId1;

      console.log('🔄 FRONTEND: Creating direct chat with user using API client:', otherUserId);

      const result = await chatAPI.createDirectChat(otherUserId);

      if (result.success) {
        const data = result.data;
        console.log('✅ FRONTEND: Direct chat created:', data);

        // Extract other user from participants
        const currentUserId = user?.id || user?._id;
        const otherParticipant = data.chat.participants.find(
          p => (p.user._id || p.user.id) !== currentUserId
        );

        // Add otherUser to the data for easier access
        const chatData = {
          ...data.chat,
          otherUser: otherParticipant?.user
        };

        setChatInfo({ ...data, chat: chatData });
        // Fetch messages after creating the chat
        fetchMessages();
      } else {
        console.error('❌ FRONTEND: Failed to create direct chat:', result.error);
      }
    } catch (error) {
      console.error('Error creating direct chat:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      console.log('📥 FRONTEND: Fetching messages using API client...');

      const result = await chatAPI.getChatMessages(chatId);

      if (result.success) {
        console.log('📥 FRONTEND: Fetched messages:', result.data);

        if (result.data && result.data.messages) {
          const messagesData = result.data.messages;
          console.log('📝 FRONTEND: Setting messages:', messagesData.length, 'messages');

          setMessages(Array.isArray(messagesData) ? messagesData : []);
        } else {
          console.log('📝 FRONTEND: No messages in response');
          setMessages([]);
        }
      } else if (result.error.includes('not found')) {
        console.log('📝 FRONTEND: Messages not found (chat may not exist yet)');
        setMessages([]);
      } else {
        console.error('Failed to fetch messages:', result.error);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending || !socket || !isConnected) return;

    const tempId = Date.now().toString();
    const originalMessage = newMessage.trim();

    const messageData = {
      tempId,
      chatId,
      content: originalMessage,
      sender: {
        _id: user.id || user._id,
        name: user.name,
        role: user.role,
      },
      timestamp: new Date(),
      status: 'sending',
    };

    // Add message to UI immediately (optimistic update)
    setMessages(prev => [...prev, messageData]);
    setNewMessage('');
    setIsSending(true);

    try {
      const emitData = {
        chatId,
        content: originalMessage,
        tempId,
      };

      console.log('📤 FRONTEND: Sending message via socket:', emitData);

      socket.emit('send_message', emitData);

      // Set a timeout to reset sending state if no confirmation received
      setTimeout(() => {
        setIsSending(false);
      }, 5000);

    } catch (error) {
      console.error('❌ FRONTEND: Failed to send message:', error);
      // Remove the message from UI on error
      setMessages(prev => prev.filter(msg => msg.tempId !== tempId));
      setIsSending(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file || isUploading || !socket || !isConnected) return;

    setIsUploading(true);

    try {
      // Upload file to server first using API client
      const formData = new FormData();
      formData.append('file', file);
      formData.append('chatId', chatId);
      formData.append('description', `File shared in chat`);

      console.log('📤 FRONTEND: Uploading file using API client...');
      const uploadResult = await chatAPI.uploadFile(formData);

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Failed to upload file');
      }

      // Send file message via socket
      const tempId = Date.now().toString();
      const messageData = {
        tempId,
        content: `📎 ${file.name}`,
        messageType: 'file',
        fileData: uploadResult.data,
        sender: {
          _id: user.id,
          name: user.name,
          role: user.role
        },
        timestamp: new Date().toISOString(),
        status: 'sending'
      };

      // Add to UI immediately
      setMessages(prev => [...prev, messageData]);

      // Send via socket
      const emitData = {
        chatId,
        content: messageData.content,
        messageType: 'file',
        fileData: uploadResult.data,
        tempId
      };

      console.log('📤 FRONTEND: Sending file message via socket:', emitData);
      socket.emit('send_message', emitData);

      // Open the file immediately after upload (WhatsApp-like behavior)
      setTimeout(() => {
        const maskedUrl = uploadResult.data.ipfsHash
          ? `/api/chats/file/${uploadResult.data.ipfsHash}`
          : uploadResult.data.url;
        console.log('🚀 Opening uploaded file:', maskedUrl);
        window.open(maskedUrl, '_blank');
      }, 500);

    } catch (error) {
      console.error('❌ FRONTEND: Failed to upload file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chat...</p>
          <p className="text-sm text-gray-500">
            Socket: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/8 to-gray-500/12 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-500/8 to-cyan-500/12 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-500/4 to-gray-500/8 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      <div className="relative z-10 flex flex-col h-screen pt-0">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border-b border-white/20 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-semibold text-lg">
                  {chatInfo?.chat?.otherUser?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">
                  {chatInfo?.chat?.otherUser?.name || 'User'}
                </h3>
                <div className="space-y-1">
                  <p className="text-sm text-gray-300 flex items-center">
                    <span className="capitalize">
                      {chatInfo?.chat?.otherUser?.role === 'lawyer' ? '⚖️ Lawyer' : '👤 Citizen'}
                    </span>
                    {!isConnected && (
                      <span className="ml-2 text-red-400 flex items-center">
                        <span className="w-2 h-2 bg-red-400 rounded-full mr-1"></span>
                        Offline
                      </span>
                    )}
                    {isConnected && (
                      <span className="ml-2 text-green-400 flex items-center">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                        Online
                      </span>
                    )}
                  </p>

                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Video Call Button */}
            <button
              onClick={async () => {
                if (!chatInfo?.chat?.otherUser?._id) {
                  console.log('❌ No user ID available for video call');
                  if (error) error('Cannot start call: User information not available');
                  return;
                }
                try {
                  console.log('📹 Starting video call from header...');
                  const userInfo = {
                    _id: chatInfo.chat.otherUser._id,
                    name: chatInfo.chat.otherUser.name,
                    role: chatInfo.chat.otherUser.role || 'user'
                  };
                  const result = await startCall(chatInfo.chat.otherUser._id, 'video', chatId, userInfo);
                  console.log('✅ Video call started successfully:', result);
                  if (success) success(`Video call started with ${chatInfo.chat.otherUser.name}`);
                } catch (err) {
                  console.error('❌ Failed to start video call:', err);
                  if (error) error('Failed to start video call: ' + err.message);
                }
              }}
              disabled={!chatInfo?.chat?.otherUser?._id || !socket || !isConnected}
              className={`p-3 hover:bg-purple-500/20 rounded-full transition-colors border border-purple-400/50 backdrop-blur-sm ${
                (!chatInfo?.chat?.otherUser?._id || !socket || !isConnected) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
              title={
                !socket || !isConnected ? 'Connection not available' :
                !chatInfo?.chat?.otherUser?._id ? 'Video call not available' :
                `Start video call with ${chatInfo.chat.otherUser.name}`
              }
            >
              <Video className="h-5 w-5 text-purple-400" />
            </button>

            {/* More Options */}
            <button className="p-3 hover:bg-white/10 rounded-full transition-colors border border-white/20 backdrop-blur-sm">
              <MoreVertical className="h-5 w-5 text-gray-300" />
            </button>
          </div>
        </div>

        {/* Minimal Debug Info - Only Connection Status */}
        {process.env.NODE_ENV === 'development' && !isConnected && (
          <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-sm p-2 text-xs text-red-300 mx-4 mt-2 rounded-lg">
            <p>⚠️ Socket Disconnected - Reconnecting...</p>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-messages">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 mt-16">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 max-w-md mx-auto">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Start the conversation!</h3>
                <p className="text-gray-400">Send a message to begin chatting with {chatInfo?.data?.chat?.otherUser?.name || 'this user'}.</p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <MessageBubble
                key={message._id || message.tempId}
                message={message}
                isOwn={(message.sender._id || message.sender.id) === (user.id || user._id)}
                showAvatar={
                  index === 0 ||
                  messages[index - 1]?.sender._id !== message.sender._id
                }
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <MessageInput
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage(e);
            }
          }}
          onSend={sendMessage}
          onFileUpload={handleFileUpload}
          isSending={isSending}
          isUploading={isUploading}
          placeholder="Type a message..."
          otherParticipant={chatInfo?.data?.chat?.otherUser ? { user: chatInfo.data.chat.otherUser } : null}
          chatId={chatId}
        />
      </div>
    </div>
  );
};

export default ChatPage;
