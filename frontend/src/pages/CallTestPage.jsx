import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Phone,
  Video,
  PhoneOff,
  User,
  Shield,
  TestTube,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader
} from 'lucide-react';
import { useCall } from '../contexts/CallContext';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { callAPI } from '../services/api';

const CallTestPage = () => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const { startCall, callState, incomingCall, currentCall } = useCall();
  const [testResults, setTestResults] = useState([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testTargetUserId, setTestTargetUserId] = useState('');
  const [testChatId, setTestChatId] = useState('');

  const addTestResult = (test, status, message) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      test,
      status,
      message,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runConnectionTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    
    addTestResult('Socket Connection', 'RUNNING', 'Testing socket connection...');
    
    if (socket && isConnected) {
      addTestResult('Socket Connection', 'PASS', 'Socket is connected');
    } else {
      addTestResult('Socket Connection', 'FAIL', 'Socket is not connected');
    }

    addTestResult('User Authentication', 'RUNNING', 'Checking user authentication...');
    
    if (user && user._id) {
      addTestResult('User Authentication', 'PASS', `Authenticated as ${user.name} (${user.role})`);
    } else {
      addTestResult('User Authentication', 'FAIL', 'User not authenticated');
    }

    addTestResult('Call Context', 'RUNNING', 'Testing call context...');
    
    if (startCall && typeof startCall === 'function') {
      addTestResult('Call Context', 'PASS', 'Call context is available');
    } else {
      addTestResult('Call Context', 'FAIL', 'Call context not available');
    }

    setIsRunningTests(false);
  };

  const testVoiceCall = async () => {
    if (!testTargetUserId || !testChatId) {
      addTestResult('Voice Call Test', 'FAIL', 'Please provide target user ID and chat ID');
      return;
    }

    addTestResult('Voice Call Test', 'RUNNING', 'Initiating voice call...');
    
    try {
      const result = await startCall(testTargetUserId, 'voice', testChatId);
      addTestResult('Voice Call Test', 'PASS', 'Voice call initiated successfully');
    } catch (error) {
      addTestResult('Voice Call Test', 'FAIL', `Failed to initiate voice call: ${error.message}`);
    }
  };

  const testVideoCall = async () => {
    if (!testTargetUserId || !testChatId) {
      addTestResult('Video Call Test', 'FAIL', 'Please provide target user ID and chat ID');
      return;
    }

    addTestResult('Video Call Test', 'RUNNING', 'Initiating video call...');
    
    try {
      const result = await startCall(testTargetUserId, 'video', testChatId);
      addTestResult('Video Call Test', 'PASS', 'Video call initiated successfully');
    } catch (error) {
      addTestResult('Video Call Test', 'FAIL', `Failed to initiate video call: ${error.message}`);
    }
  };

  const testCallHistory = async () => {
    addTestResult('Call History Test', 'RUNNING', 'Fetching call history...');
    
    try {
      const response = await callAPI.getCallHistory({ limit: 5 });
      if (response.success) {
        addTestResult('Call History Test', 'PASS', `Retrieved ${response.data.calls?.length || 0} calls`);
      } else {
        addTestResult('Call History Test', 'FAIL', 'Failed to fetch call history');
      }
    } catch (error) {
      addTestResult('Call History Test', 'FAIL', `Call history error: ${error.message}`);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'FAIL':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'RUNNING':
        return <Loader className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-2xl p-8"
        >
          <div className="flex items-center space-x-3 mb-8">
            <TestTube className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Call System Test Suite</h1>
          </div>

          {/* Current Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Socket Status</h3>
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Call State</h3>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-blue-500" />
                <span className="text-blue-600 capitalize">{callState}</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">User Role</h3>
              <div className="flex items-center space-x-2">
                {user?.role === 'lawyer' ? (
                  <Shield className="h-5 w-5 text-purple-500" />
                ) : (
                  <User className="h-5 w-5 text-blue-500" />
                )}
                <span className="text-gray-600 capitalize">{user?.role || 'Unknown'}</span>
              </div>
            </div>
          </div>

          {/* Test Configuration */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Test Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target User ID
                </label>
                <input
                  type="text"
                  value={testTargetUserId}
                  onChange={(e) => setTestTargetUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter user ID to call"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chat ID
                </label>
                <input
                  type="text"
                  value={testChatId}
                  onChange={(e) => setTestChatId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter chat ID"
                />
              </div>
            </div>
          </div>

          {/* Test Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <button
              onClick={runConnectionTests}
              disabled={isRunningTests}
              className="flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <TestTube className="h-4 w-4" />
              <span>Connection</span>
            </button>

            <button
              onClick={testVoiceCall}
              disabled={isRunningTests || !testTargetUserId || !testChatId}
              className="flex items-center justify-center space-x-2 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span>Voice Call</span>
            </button>

            <button
              onClick={testVideoCall}
              disabled={isRunningTests || !testTargetUserId || !testChatId}
              className="flex items-center justify-center space-x-2 py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Video className="h-4 w-4" />
              <span>Video Call</span>
            </button>

            <button
              onClick={testCallHistory}
              disabled={isRunningTests}
              className="flex items-center justify-center space-x-2 py-3 px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <TestTube className="h-4 w-4" />
              <span>History</span>
            </button>
          </div>

          {/* Test Results */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Test Results</h3>
            {testResults.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No tests run yet</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {testResults.map((result) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center space-x-3 p-3 bg-white rounded-lg"
                  >
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{result.test}</span>
                        <span className="text-xs text-gray-500">{result.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-600">{result.message}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CallTestPage;
