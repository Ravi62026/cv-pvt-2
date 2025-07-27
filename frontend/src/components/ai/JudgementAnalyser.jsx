import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileSearch, Upload, FileText, AlertCircle, CheckCircle, Download, Eye } from 'lucide-react';
import ChatInterface from './ChatInterface';
import { aiAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const JudgementAnalyser = ({ onBack }) => {
  const [messages, setMessages] = useState([
    {
      content: `Welcome to the **Judgement Analyser**! 📋

I'm here to help you analyze court judgements, extract key insights, and understand legal precedents using the latest **BNS/BNSS/BSA framework (July 2024)**.

**What I can help you with:**
- 📄 **Judgement Analysis** - Comprehensive analysis of court judgements
- 📁 **PDF Upload** - Upload and analyze judgement PDFs directly
- 🔍 **Key Insights** - Extract important legal points and precedents
- ⚖️ **Legal Framework** - Analysis under new and old legal codes
- 📚 **Precedent Review** - Understand how judgements set legal precedents

**How to use:**
1. **Text Analysis**: Paste or type judgement text for analysis
2. **PDF Upload**: Upload judgement PDFs for automatic extraction and analysis
3. **Detailed Analysis**: Enable detailed analysis for comprehensive review

**Example:**
- *"Analyze this Supreme Court judgement on property rights..."*
- *Upload a PDF of a High Court criminal case judgement*
- *"Extract key legal principles from this civil court decision"*

Choose your preferred method to get started!`,
      isUser: false
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadMode, setUploadMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisSettings, setAnalysisSettings] = useState({
    includeDetailedAnalysis: false,
    crimeDetails: '',
    evidenceDetails: ''
  });
  const fileInputRef = useRef(null);
  const { success, error } = useToast();

  const handleSendMessage = async (message) => {
    // Add user message
    const userMessage = { content: message, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call Judgement Analyser API
      const response = await aiAPI.analyzeJudgement(
        message,
        analysisSettings.crimeDetails,
        analysisSettings.evidenceDetails,
        true, // verify
        analysisSettings.includeDetailedAnalysis
      );
      
      if (response.success) {
        const data = response.data;
        
        // Create AI response
        let aiResponseContent = data.analysis || 'Analysis completed successfully.';
        
        // Add suggested questions if available
        if (data.suggested_questions && data.suggested_questions.length > 0) {
          aiResponseContent += `\n\n---\n\n💡 **Suggested Follow-up Questions:**\n`;
          data.suggested_questions.forEach((question, index) => {
            aiResponseContent += `${index + 1}. ${question}\n`;
          });
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
        success('Judgement analysis completed');
      } else {
        // Handle API error
        const errorMessage = {
          content: `❌ **Error**: ${response.error || 'Failed to analyze the judgement. Please try again.'}

Please check your input and try again. If the problem persists, contact support.`,
          isUser: false
        };
        setMessages(prev => [...prev, errorMessage]);
        error('Failed to analyze judgement');
      }
    } catch (error) {
      console.error('Judgement Analyser error:', error);
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

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        success(`Selected: ${file.name}`);
      } else {
        error('Please select a PDF file');
        event.target.value = '';
      }
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      error('Please select a PDF file first');
      return;
    }

    // Add user message about file upload
    const userMessage = { 
      content: `📁 **Uploading PDF**: ${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`, 
      isUser: true 
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // First validate the PDF
      const validateResponse = await aiAPI.validateJudgementPDF(selectedFile);
      
      if (!validateResponse.success) {
        throw new Error(validateResponse.error || 'PDF validation failed');
      }

      // If validation successful, proceed with analysis
      const response = await aiAPI.analyzeJudgementPDF(
        selectedFile,
        analysisSettings.includeDetailedAnalysis
      );
      
      if (response.success) {
        const data = response.data;
        
        // Create AI response
        let aiResponseContent = `✅ **PDF Analysis Complete**\n\n`;
        aiResponseContent += data.analysis || 'Analysis completed successfully.';
        
        // Add suggested questions if available
        if (data.suggested_questions && data.suggested_questions.length > 0) {
          aiResponseContent += `\n\n---\n\n💡 **Suggested Follow-up Questions:**\n`;
          data.suggested_questions.forEach((question, index) => {
            aiResponseContent += `${index + 1}. ${question}\n`;
          });
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
        
        // Clear selected file
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        success('PDF analysis completed');
      } else {
        throw new Error(response.error || 'Failed to analyze PDF');
      }
    } catch (error) {
      console.error('PDF upload error:', error);
      const errorMessage = {
        content: `❌ **PDF Analysis Error**: ${error.message}

Please ensure the PDF contains readable judgement text and try again.`,
        isUser: false
      };
      setMessages(prev => [...prev, errorMessage]);
      error('PDF analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUploadMode = () => {
    setUploadMode(!uploadMode);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSettingChange = (setting, value) => {
    setAnalysisSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <div className="min-h-[85%] bg-gradient-to-br from-black via-gray-900 to-gray-800">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-green-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-600/15 rounded-full blur-[120px] animate-pulse delay-1000"></div>
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
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center mr-4">
                <FileSearch className="h-8 w-8 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  Judgement Analyser
                </h1>
                <p className="text-green-400 text-sm font-medium">
                  Court Judgement Analysis & Insights
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div> */}

      {/* Upload Mode Toggle */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 mb-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Analysis Mode</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setUploadMode(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    !uploadMode 
                      ? 'bg-green-500 text-white' 
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  <FileText className="h-4 w-4 inline mr-2" />
                  Text Analysis
                </button>
                <button
                  onClick={() => setUploadMode(true)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    uploadMode 
                      ? 'bg-green-500 text-white' 
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  <Upload className="h-4 w-4 inline mr-2" />
                  PDF Upload
                </button>
              </div>
            </div>

            {/* PDF Upload Section */}
            {uploadMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-white mb-2">Upload Judgement PDF</p>
                  <p className="text-gray-400 text-sm mb-4">Select a PDF file containing court judgement text</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Choose File
                  </button>
                </div>

                {selectedFile && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-green-400" />
                        <div>
                          <p className="text-white text-sm font-medium">{selectedFile.name}</p>
                          <p className="text-gray-400 text-xs">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button
                        onClick={handleFileUpload}
                        disabled={isLoading}
                        className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                      >
                        {isLoading ? 'Analyzing...' : 'Analyze PDF'}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Analysis Settings */}
            <div className="mt-4 space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={analysisSettings.includeDetailedAnalysis}
                  onChange={(e) => handleSettingChange('includeDetailedAnalysis', e.target.checked)}
                  className="w-4 h-4 text-green-500 bg-transparent border-gray-400 rounded focus:ring-green-500"
                />
                <span className="text-white text-sm">Include Detailed Analysis</span>
              </label>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Feature Cards */}
      {/* <div className="relative z-10 px-4 sm:px-6 lg:px-8 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-green-500/20 p-2 rounded-lg">
                  <Eye className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Key Insights</h3>
                  <p className="text-gray-400 text-xs">Extract important points</p>
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
                <div className="bg-emerald-500/20 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">PDF Support</h3>
                  <p className="text-gray-400 text-xs">Upload & analyze PDFs</p>
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
                  <CheckCircle className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Precedent Review</h3>
                  <p className="text-gray-400 text-xs">Legal precedent analysis</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div> */}

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
              placeholder={uploadMode ? "Upload a PDF above or describe the judgement..." : "Paste judgement text or describe the case for analysis..."}
              title="Judgement Analysis"
              subtitle="Analyze court judgements and extract key legal insights"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default JudgementAnalyser;
