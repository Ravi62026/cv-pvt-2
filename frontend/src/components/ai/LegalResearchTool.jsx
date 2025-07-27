import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Globe, Database, ExternalLink, Star, Zap, Target, BookOpen } from 'lucide-react';
import ChatInterface from './ChatInterface';
import { aiAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const LegalResearchTool = ({ onBack }) => {
  const [messages, setMessages] = useState([
    {
      content: `Welcome to the **Legal Research Tool**! 🔍

I'm your advanced AI-powered legal research assistant with **multi-engine search capabilities** and comprehensive data extraction.

**🔥 Premium Features:**
- 🌐 **Multi-Engine Search** - Tavily AI + Google Custom Search (10+ results)
- 📊 **Comprehensive Data** - Full content extraction from legal sources
- 🤖 **AI Analysis** - Advanced legal insights and interpretation
- 🔗 **Source Links** - Direct links to legal documents and cases
- 💬 **Clarifying Questions** - Interactive research refinement

**What I can research:**
- 📚 **Legal Precedents** - Find relevant case law and judgements
- 📋 **Statutes & Acts** - Research specific laws and regulations
- ⚖️ **Legal Procedures** - Court procedures and legal processes
- 🏛️ **Constitutional Law** - Constitutional provisions and interpretations
- 🌍 **Comparative Law** - Legal systems across jurisdictions

**Example queries:**
- *"Find recent Supreme Court cases on data privacy rights"*
- *"Research the legal framework for cryptocurrency regulation in India"*
- *"What are the procedural requirements for filing a PIL?"*

Ask me any legal research question to get started!`,
      isUser: false
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [pendingClarification, setPendingClarification] = useState(null);
  const { success, error, info } = useToast();

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
      let response;
      
      // Check if this is a follow-up to clarifying questions
      if (pendingClarification) {
        response = await aiAPI.researchFollowUp(
          pendingClarification.conversationId,
          pendingClarification.originalQuery,
          message,
          pendingClarification.questionNumber
        );
        setPendingClarification(null);
      } else {
        // Regular research query
        response = await aiAPI.researchLegalQuery(message, conversationId);
      }
      
      if (response.success) {
        const data = response.data;
        
        // Update conversation ID
        if (data.conversation_id) {
          setConversationId(data.conversation_id);
        }

        if (data.status === 'needs_clarification') {
          // Handle clarifying questions
          let clarificationContent = `🤔 **Need More Information**\n\n`;
          clarificationContent += `${data.message}\n\n`;
          clarificationContent += `**Question ${data.question_number} of ${data.total_questions}:**\n`;
          clarificationContent += `${data.current_question}\n\n`;
          clarificationContent += `Please provide your answer to help me give you the most accurate research results.`;

          // Store pending clarification info
          setPendingClarification({
            conversationId: data.conversation_id,
            originalQuery: message,
            questionNumber: data.question_number
          });

          // Start streaming simulation for clarification
          simulateStreaming(clarificationContent, aiMessageId);

          info(`Clarification needed (${data.question_number}/${data.total_questions})`);
        } else {
          // Handle complete research results
          let researchContent = `✅ **Research Complete**\n\n`;
          researchContent += data.answer || 'Research completed successfully.';
          
          // Add references if available
          if (data.references && data.references.length > 0) {
            researchContent += `\n\n---\n\n📚 **References:**\n`;
            data.references.forEach((ref, index) => {
              if (typeof ref === 'string') {
                researchContent += `${index + 1}. ${ref}\n`;
              } else if (ref.citation) {
                researchContent += `${index + 1}. ${ref.citation}\n`;
              }
            });
          }

          // Add source links if available
          if (data.links && data.links.length > 0) {
            researchContent += `\n\n🔗 **Source Links:**\n`;
            data.links.forEach((link, index) => {
              researchContent += `${index + 1}. [${link.title || 'Source'}](${link.url}) *(${link.source || 'Unknown'})*\n`;
            });
          }

          // Add follow-up suggestions
          if (data.follow_up_suggestions && data.follow_up_suggestions.length > 0) {
            researchContent += `\n\n💡 **Follow-up Research Suggestions:**\n`;
            data.follow_up_suggestions.forEach((suggestion, index) => {
              researchContent += `${index + 1}. ${suggestion}\n`;
            });
          }

          // Add premium analytics if available
          if (data.premium_analytics) {
            const analytics = data.premium_analytics;
            researchContent += `\n\n---\n\n📊 **Research Analytics:**\n`;
            researchContent += `- **Search Engines Used**: ${analytics.search_engines_used?.join(', ') || 'Multiple'}\n`;
            researchContent += `- **Total Results Found**: ${analytics.total_results_found || 'N/A'}\n`;
            researchContent += `- **Source Links**: ${analytics.total_links || 0}\n`;
            researchContent += `- **Search Quality**: ${analytics.search_quality || 'Premium'}\n`;
          }

          // Start streaming simulation
          simulateStreaming(researchContent, aiMessageId);

          success('Research completed successfully');
        }
      } else {
        // Handle API error
        const errorContent = `❌ **Research Error**: ${response.error || 'Failed to complete research. Please try again.'}

Please refine your query and try again. If the problem persists, contact support.`;

        simulateStreaming(errorContent, aiMessageId);
        error('Research failed');
      }
    } catch (err) {
      console.error('Legal Research error:', err);
      const errorContent = `❌ **System Error**: Unable to process your research request at the moment.

Please try again later or contact support if the issue persists.`;

      simulateStreaming(errorContent, aiMessageId);
      error('System error occurred');
    }
  };

  return (
    <div className="min-h-[85%] bg-gradient-to-br from-black via-gray-900 to-gray-800">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-red-600/15 rounded-full blur-[120px] animate-pulse delay-1000"></div>
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
              <div className="bg-gradient-to-r from-orange-500 to-red-500 w-16 h-16 rounded-2xl flex items-center justify-center mr-4">
                <Search className="h-8 w-8 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  Legal Research Tool
                </h1>
                <p className="text-orange-400 text-sm font-medium">
                  🔥 Premium Multi-Engine AI Research
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div> */}

      {/* Premium Features */}
      {/* <div className="relative z-10 px-4 sm:px-6 lg:px-8 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-orange-500/20 p-2 rounded-lg">
                  <Globe className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Multi-Engine</h3>
                  <p className="text-gray-400 text-xs">Tavily + Google Search</p>
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
                <div className="bg-red-500/20 p-2 rounded-lg">
                  <Database className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Comprehensive</h3>
                  <p className="text-gray-400 text-xs">Full data extraction</p>
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
                <div className="bg-yellow-500/20 p-2 rounded-lg">
                  <Zap className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">AI Analysis</h3>
                  <p className="text-gray-400 text-xs">Advanced insights</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <ExternalLink className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Source Links</h3>
                  <p className="text-gray-400 text-xs">Direct legal sources</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div> */}

      {/* Research Categories */}
      {/* <div className="relative z-10 px-4 sm:px-6 lg:px-8 mb-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-sm rounded-xl border border-orange-500/20 p-6"
          >
            <div className="flex items-start space-x-3">
              <Target className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-white font-semibold mb-3">🎯 Research Categories</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="text-orange-400 font-medium mb-2">Case Law & Precedents</h4>
                    <ul className="text-gray-300 space-y-1">
                      <li>• Supreme Court judgements</li>
                      <li>• High Court decisions</li>
                      <li>• Legal precedents</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-red-400 font-medium mb-2">Laws & Regulations</h4>
                    <ul className="text-gray-300 space-y-1">
                      <li>• Constitutional provisions</li>
                      <li>• Statutes and acts</li>
                      <li>• Rules and regulations</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div> */}

      {/* Chat Interface */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden"
            style={{ height: '600px' }}
          >
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              placeholder={pendingClarification ? "Please answer the clarifying question above..." : "Ask any legal research question..."}
              title="Legal Research Assistant"
              subtitle="Premium AI-powered legal research with multi-engine search"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LegalResearchTool;
