import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatWindow from '../components/chat/ChatWindow';

const ChatPage = () => {
  const { chatId: rawChatId } = useParams();
  // Decode the URL-encoded chatId
  const chatId = decodeURIComponent(rawChatId);
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800">
      <ChatWindow
        chatId={chatId}
        onBack={handleBack}
        className="h-screen"
        showHeader={true}
        autoJoin={true}
      />
    </div>
  );
};

export default ChatPage;