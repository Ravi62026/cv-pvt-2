import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, FileText, MessageSquare, Settings, Sparkles, Users } from 'lucide-react';
import ChatInterface from './ChatInterface';
import { aiAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const LegalAdvisor = ({ onBack }) => {
  const [messages, setMessages] = useState([
    {
      content: `Welcome to the **Legal Advisor**! ⚖️

I'm your comprehensive legal analysis assistant, powered by advanced AI and the latest legal frameworks including **BNS/BNSS/BSA (July 2024)**.

**What I can help you with:**
- 📋 **Case Analysis** - Comprehensive analysis of legal cases across all domains
- 🔍 **Evidence Evaluation** - Review and analyze evidence in your cases
- 💬 **Legal Debate** - Explore different legal perspectives and arguments
- 📚 **Multi-Domain Expertise** - Criminal, Civil, Family, Corporate, and more

**How to use:**
1. **Basic Analysis**: Describe your case for standard legal analysis
2. **With Evidence**: Include evidence details for comprehensive review
3. **Debate Mode**: Ask for debate analysis to explore multiple legal perspectives

**Example queries:**
- *"Analyze a contract dispute between two companies over software licensing"*
- *"Review evidence in a personal injury case with medical reports and witness statements"*
- *"Provide debate analysis on property inheritance rights between siblings"*

Please describe your case or legal matter to get started!`,
      isUser: false
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [advancedSettings, setAdvancedSettings] = useState({
    includeEvidence: false,
    includeDebate: false,
    evidenceText: ''
  });
  const { success, error } = useToast();

  const handleSendMessage = async (message) => {
    // Add user message
    const userMessage = { content: message, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Prepare request data
      const evidence = advancedSettings.includeEvidence && advancedSettings.evidenceText 
        ? advancedSettings.evidenceText 
        : null;

      // Call Legal Advisor API
      const response = await aiAPI.analyzeLegalCase(
        message,
        evidence,
        true, // verify
        advancedSettings.includeDebate,
        currentChatId
      );
      
      if (response.success) {
        const data = response.data;
        
        // Update chat ID if provided
        if (data.chat_id && !currentChatId) {
          setCurrentChatId(data.chat_id);
        }

        // Create AI response
        let aiResponseContent = data.analysis || 'Analysis completed successfully.';
        
        // Add debate availability info if not included
        if (data.debate_available && !advancedSettings.includeDebate) {
          aiResponseContent += `\n\n---\n\n💡 **Debate Analysis Available**: ${data.debate_prompt}\n\nTo get detailed legal debate analysis, enable "Include Debate" in advanced options and ask your question again.`;
        }

        // Add framework info
        if (data.framework) {
          aiResponseContent += `\n\n📚 **Framework**: ${data.framework}`;
        }

        const aiResponse = {
          content: aiResponseContent,
          isUser: false
        };
        setMessages(prev => [...prev, aiResponse]);
        
        // Show success notification
        success(
          data.debate_included
            ? 'Analysis with debate completed'
            : 'Legal analysis completed'
        );
      } else {
        // Handle API error
        const errorMessage = {
          content: `❌ **Error**: ${response.error || 'Failed to analyze the case. Please try again.'}

Please check your input and try again. If the problem persists, contact support.`,
          isUser: false
        };
        setMessages(prev => [...prev, errorMessage]);
        error('Failed to analyze case');
      }
    } catch (error) {
      console.error('Legal Advisor error:', error);
      const errorMessage = {
        content: `❌ **System Error**: Unable to process your request at the moment.

Please try again later or contact support if the issue persists.`,
        isUser: false
      };
      setMessages(prev => [...prev, errorMessage]);
      error('System error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAdvancedOptions = () => {
    setShowAdvancedOptions(!showAdvancedOptions);
  };

  const handleAdvancedSettingChange = (setting, value) => {
    setAdvancedSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <div className="min-h-[85%] bg-gradient-to-br from-black via-gray-900 to-gray-800">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-pink-600/15 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

     

      {/* Chat Interface */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden"
            style={{ height: '600px' }}
          >
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              placeholder="Describe your legal case or matter for comprehensive analysis..."
              title="Legal Analysis Assistant"
              subtitle="Get expert legal advice with evidence review and debate analysis"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LegalAdvisor;
