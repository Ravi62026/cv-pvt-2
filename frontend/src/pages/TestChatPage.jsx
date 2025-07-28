import React, { useState } from 'react';
import Layout from '../components/Layout';
import ChatWindow from '../components/chat/ChatWindow';
import CallInterface from '../components/call/CallInterface';
import VideoCallInterface from '../components/calls/VideoCallInterface';
import VoiceCallInterface from '../components/calls/VoiceCallInterface';

const TestChatPage = () => {
  const [showCallInterface, setShowCallInterface] = useState(false);
  const [callType, setCallType] = useState('voice');
  const [callDuration, setCallDuration] = useState(0);

  // Mock chat data
  const mockChatId = 'test-chat-123';

  const handleStartVoiceCall = () => {
    setCallType('voice');
    setShowCallInterface(true);
    setCallDuration(0);
  };

  const handleStartVideoCall = () => {
    setCallType('video');
    setShowCallInterface(true);
    setCallDuration(0);
  };

  const handleStartLegacyCall = () => {
    setCallType('legacy');
    setShowCallInterface(true);
    setCallDuration(0);
  };

  const handleCallEnd = () => {
    setShowCallInterface(false);
    setCallDuration(0);
  };

  const handleCallAccept = () => {
    // Start call timer
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    // Store timer reference for cleanup
    return () => clearInterval(timer);
  };

  return (
    <Layout>
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Chat & Call Interface Test
            </h1>
            <p className="text-gray-300 text-lg">
              Test the improved responsive chat interface with WhatsApp-like call UI
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chat Interface Demo */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h2 className="text-xl font-semibold text-white mb-2">Chat Interface</h2>
                <p className="text-gray-300 text-sm">
                  Responsive chat with green message bubbles and improved styling
                </p>
              </div>
              <div className="h-96">
                {/* Mock chat would go here - for demo purposes */}
                <div className="h-full flex items-center justify-center text-gray-400">
                  <p>Chat interface would be integrated here</p>
                </div>
              </div>
            </div>

            {/* Call Interface Demo */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h2 className="text-xl font-semibold text-white mb-2">Call Interface</h2>
                <p className="text-gray-300 text-sm">
                  WhatsApp-like call interface with proper controls
                </p>
              </div>
              <div className="p-6 space-y-4">
                <button
                  onClick={handleStartVoiceCall}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 font-medium"
                >
                  Test Voice Call
                </button>
                <button
                  onClick={handleStartVideoCall}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 font-medium"
                >
                  Test Video Call (New UI)
                </button>
                <button
                  onClick={handleStartLegacyCall}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 font-medium"
                >
                  Test Legacy Call UI
                </button>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="mt-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Improvements Made</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">Chat Interface</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• Changed message bubbles from bright blue to green (WhatsApp-like)</li>
                  <li>• Improved responsive design for mobile devices</li>
                  <li>• Better spacing and typography on small screens</li>
                  <li>• Enhanced message input with responsive controls</li>
                  <li>• Improved send button styling with hover effects</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">Call Interface</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• WhatsApp-like incoming call screen</li>
                  <li>• Proper call controls (mute, speaker, video toggle)</li>
                  <li>• Picture-in-picture for video calls</li>
                  <li>• Call duration timer</li>
                  <li>• Responsive design for all screen sizes</li>
                  <li>• Smooth animations and transitions</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Responsive Design Info */}
          <div className="mt-8 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Responsive Design Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-300">
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="font-semibold text-cyan-400 mb-2">Mobile First</h4>
                <p className="text-sm">Optimized for mobile devices with touch-friendly controls</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="font-semibold text-cyan-400 mb-2">Tablet Ready</h4>
                <p className="text-sm">Perfect layout for tablet screens with balanced spacing</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="font-semibold text-cyan-400 mb-2">Desktop Enhanced</h4>
                <p className="text-sm">Full-featured experience on desktop with all controls</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call Interface Overlay */}
      {showCallInterface && callType === 'video' && (
        <VideoCallInterface
          isOpen={showCallInterface}
          onClose={handleCallEnd}
          targetUser={{
            name: "Ravi Shankar",
            role: "citizen",
            id: "test-user-123"
          }}
          chatId="test-chat-123"
          isIncoming={false}
        />
      )}

      {showCallInterface && callType === 'voice' && (
        <VoiceCallInterface
          isOpen={showCallInterface}
          onClose={handleCallEnd}
          targetUser={{
            name: "Ravi Shankar",
            role: "citizen",
            id: "test-user-123"
          }}
          chatId="test-chat-123"
          isIncoming={false}
        />
      )}

      {/* Legacy Call Interface for comparison */}
      {showCallInterface && callType === 'legacy' && (
        <CallInterface
          isIncoming={false}
          callerName="Ravi Shankar"
          callerRole="Citizen"
          onAccept={handleCallAccept}
          onDecline={handleCallEnd}
          onEndCall={handleCallEnd}
          isVideoCall={callType === 'video'}
          callDuration={callDuration}
        />
      )}
    </Layout>
  );
};

export default TestChatPage;
