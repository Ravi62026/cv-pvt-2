import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Scale, AlertCircle, CheckCircle, Info, Sparkles } from 'lucide-react';
import ChatInterface from './ChatInterface';
import { aiAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const BNSAdvisor = ({ onBack }) => {
  const [messages, setMessages] = useState([
    {
      content: `Welcome to the **BNS Advisor**! 🏛️

I'm here to help you analyze legal cases using the **new Indian criminal justice framework** - BNS (Bharatiya Nyaya Sanhita), BNSS (Bharatiya Nagarik Suraksha Sanhita), and BSA (Bharatiya Sakshya Adhiniyam) that came into effect in **July 2024**.

**What I can help you with:**
- 📋 **Case Analysis** - Analyze criminal cases under the new legal codes
- 🔍 **Legal Code Mapping** - Map old IPC/CrPC sections to new BNS/BNSS sections
- ✅ **Verification** - Verify legal interpretations and precedents
- 📚 **Framework Guidance** - Understand the new legal framework

**To get started**, please describe your case or legal query. Be as detailed as possible for the most accurate analysis.

*Example: "A person was caught stealing a mobile phone worth ₹15,000 from a shop. What charges can be filed under the new BNS framework?"*`,
      isUser: false
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { success, error } = useToast();

  // Simulate streaming effect
  const simulateStreaming = (text, messageId) => {
    const words = text.split(' ');
    let currentText = '';
    let wordIndex = 0;

    const streamInterval = setInterval(() => {
      if (wordIndex < words.length) {
        // Add multiple words at once to reduce state updates
        const wordsToAdd = Math.min(3, words.length - wordIndex);
        for (let i = 0; i < wordsToAdd; i++) {
          currentText += (wordIndex > 0 ? ' ' : '') + words[wordIndex];
          wordIndex++;
        }

        setMessages(prev => prev.map(msg =>
          msg.id === messageId
            ? { ...msg, content: currentText }
            : msg
        ));
      } else {
        clearInterval(streamInterval);
        setMessages(prev => prev.map(msg =>
          msg.id === messageId
            ? { ...msg, isStreaming: false }
            : msg
        ));
        setIsLoading(false);
      }
    }, 100); // Slower interval to reduce rapid updates
  };

  const handleSendMessage = async (message) => {
    // Add user message
    const userMessage = { content: message, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Add empty AI message for streaming
    const aiMessageId = Date.now();
    const initialAiMessage = {
      id: aiMessageId,
      content: '',
      isUser: false,
      isStreaming: true
    };
    setMessages(prev => [...prev, initialAiMessage]);

    try {
      // Call BNS Advisor API
      const response = await aiAPI.analyzeBNSCase(message, true);

      if (response.success && response.data) {
        let aiResponseContent = response.data.analysis || 'Analysis completed successfully.';

        // Add framework info
        if (response.data.framework) {
          aiResponseContent += `\n\n📚 **Framework**: ${response.data.framework}`;
        }

        // Start streaming simulation
        simulateStreaming(aiResponseContent, aiMessageId);

        // Show success notification
        success('BNS analysis completed');
      } else {
        // Handle API error
        const errorContent = `❌ **Error**: ${response.error || 'Failed to analyze the case. Please try again.'}

Please check your input and try again. If the problem persists, contact support.`;

        simulateStreaming(errorContent, aiMessageId);
        error('Failed to analyze case');
      }
    } catch (err) {
      console.error('BNS Advisor error:', err);
      const errorContent = `❌ **System Error**: Unable to process your request at the moment.

Please try again later or contact support if the issue persists.`;

      simulateStreaming(errorContent, aiMessageId);
      error('System error occurred');
    }
  };

  return (
    <div className="min-h-[85%] bg-gradient-to-br from-black via-gray-900 to-gray-800">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gray-600/15 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      {/* <div className="relative z-10 pt-8 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-2xl flex items-center justify-center mr-4">
                <Scale className="h-8 w-8 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  BNS Advisor
                </h1>
                <p className="text-cyan-400 text-sm font-medium">
                  BNS/BNSS/BSA Legal Framework Analysis
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div> */}

      {/* Info Cards */}
      {/* <div className="relative z-10 px-4 sm:px-6 lg:px-8 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <Info className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">New Framework</h3>
                  <p className="text-gray-400 text-xs">BNS/BNSS/BSA (July 2024)</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-green-500/20 p-2 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Verified Analysis</h3>
                  <p className="text-gray-400 text-xs">AI-powered verification</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-purple-500/20 p-2 rounded-lg">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Code Mapping</h3>
                  <p className="text-gray-400 text-xs">Old to new code mapping</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div> */}

      {/* Chat Interface */}
      <div className="relative h-full z-10 px-4 sm:px-6 lg:px-8 pb-8">
        
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden"
            style={{ height: '600px' }}
          >
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              placeholder="Describe your case or legal query for BNS analysis..."
              title="BNS Legal Analysis"
              subtitle="Get expert guidance on criminal cases under the new BNS/BNSS/BSA framework"
            />
          </motion.div>
        </div>
      </div>

      {/* Quick Tips */}
      {/* <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-sm rounded-xl border border-blue-500/20 p-6"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-white font-semibold mb-2">💡 Tips for Better Analysis</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Provide detailed case descriptions including facts, circumstances, and evidence</li>
                  <li>• Mention specific sections if you're comparing old IPC/CrPC with new BNS/BNSS</li>
                  <li>• Include relevant case details like monetary values, injuries, or property involved</li>
                  <li>• Ask about specific legal procedures or punishments under the new framework</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div> */}
    </div>
  );
};

export default BNSAdvisor;
