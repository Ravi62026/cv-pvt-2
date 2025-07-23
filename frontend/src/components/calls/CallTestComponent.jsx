import React, { useState } from 'react';
import { useCall } from '../../contexts/CallContext';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../contexts/AuthContext';
import { callAPI, consultationAPI } from '../../services/api';
import { Phone, Video, TestTube } from 'lucide-react';

const CallTestComponent = () => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const {
    callState,
    incomingCall,
    currentCall,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo
  } = useCall();

  const [testTargetUserId, setTestTargetUserId] = useState('');
  const [testChatId, setTestChatId] = useState('');
  const [testResults, setTestResults] = useState([]);

  const addTestResult = (test, result, details = '') => {
    setTestResults(prev => [...prev, {
      test,
      result,
      details,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  // Test WebRTC service initialization
  const testWebRTCInit = () => {
    try {
      if (socket && isConnected) {
        addTestResult('WebRTC Initialization', 'PASS', 'Socket connected and WebRTC service initialized');
      } else {
        addTestResult('WebRTC Initialization', 'FAIL', 'Socket not connected');
      }
    } catch (error) {
      addTestResult('WebRTC Initialization', 'ERROR', error.message);
    }
  };

  // Test voice call initiation
  const testVoiceCall = async () => {
    if (!testTargetUserId || !testChatId) {
      addTestResult('Voice Call Test', 'FAIL', 'Target user ID and chat ID required');
      return;
    }

    try {
      await startCall(testTargetUserId, 'voice', testChatId);
      addTestResult('Voice Call Test', 'PASS', 'Voice call initiated successfully');
    } catch (error) {
      addTestResult('Voice Call Test', 'ERROR', error.message);
    }
  };

  // Test video call initiation
  const testVideoCall = async () => {
    if (!testTargetUserId || !testChatId) {
      addTestResult('Video Call Test', 'FAIL', 'Target user ID and chat ID required');
      return;
    }

    try {
      await startCall(testTargetUserId, 'video', testChatId);
      addTestResult('Video Call Test', 'PASS', 'Video call initiated successfully');
    } catch (error) {
      addTestResult('Video Call Test', 'ERROR', error.message);
    }
  };

  // Test consultation request
  const testConsultationRequest = async () => {
    if (!testTargetUserId) {
      addTestResult('Consultation Request Test', 'FAIL', 'Target user ID required');
      return;
    }

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(14, 0, 0, 0);

      const consultationData = {
        targetUserId: testTargetUserId,
        scheduledDateTime: tomorrow.toISOString(),
        duration: 30,
        description: 'Test consultation request',
        consultationType: 'video'
      };

      const response = await consultationAPI.createRequest(consultationData);
      if (response.success) {
        addTestResult('Consultation Request Test', 'PASS', 'Consultation request created successfully');
      } else {
        addTestResult('Consultation Request Test', 'FAIL', response.error);
      }
    } catch (error) {
      addTestResult('Consultation Request Test', 'ERROR', error.message);
    }
  };

  // Test call API endpoints
  const testCallAPI = async () => {
    try {
      // Test get call history
      const historyResponse = await callAPI.getCallHistory();
      if (historyResponse.success) {
        addTestResult('Call API - History', 'PASS', `Retrieved ${historyResponse.data.calls?.length || 0} calls`);
      } else {
        addTestResult('Call API - History', 'FAIL', historyResponse.error);
      }

      // Test get active calls
      const activeResponse = await callAPI.getActiveCalls();
      if (activeResponse.success) {
        addTestResult('Call API - Active', 'PASS', `Found ${activeResponse.data.activeCalls?.length || 0} active calls`);
      } else {
        addTestResult('Call API - Active', 'FAIL', activeResponse.error);
      }

      // Test get call stats
      const statsResponse = await callAPI.getCallStats();
      if (statsResponse.success) {
        addTestResult('Call API - Stats', 'PASS', 'Call statistics retrieved');
      } else {
        addTestResult('Call API - Stats', 'FAIL', statsResponse.error);
      }
    } catch (error) {
      addTestResult('Call API Test', 'ERROR', error.message);
    }
  };

  // Test media permissions
  const testMediaPermissions = async () => {
    try {
      // Test audio permission
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStream.getTracks().forEach(track => track.stop());
      addTestResult('Media Permissions - Audio', 'PASS', 'Audio permission granted');

      // Test video permission
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoStream.getTracks().forEach(track => track.stop());
      addTestResult('Media Permissions - Video', 'PASS', 'Video permission granted');
    } catch (error) {
      addTestResult('Media Permissions', 'ERROR', error.message);
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setTestResults([]);
    addTestResult('Test Suite', 'START', 'Running comprehensive call functionality tests');
    
    testWebRTCInit();
    await testMediaPermissions();
    await testCallAPI();
    
    if (testTargetUserId && testChatId) {
      await testConsultationRequest();
    }
    
    addTestResult('Test Suite', 'COMPLETE', 'All tests completed');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center space-x-2 mb-6">
        <TestTube className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Call Functionality Test Suite</h2>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700">Socket Status</h3>
          <p className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700">Call Status</h3>
          <p className={`text-sm ${callState !== 'idle' ? 'text-green-600' : 'text-gray-600'}`}>
            {callState !== 'idle' ? `${callState} (${currentCall?.callType || 'unknown'})` : 'No active call'}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700">Incoming Call</h3>
          <p className={`text-sm ${callState === 'incoming' ? 'text-orange-600' : 'text-gray-600'}`}>
            {callState === 'incoming' ? 'Incoming call' : 'No incoming call'}
          </p>
        </div>
      </div>

      {/* Test Configuration */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Test Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target User ID (for call tests)
            </label>
            <input
              type="text"
              value={testTargetUserId}
              onChange={(e) => setTestTargetUserId(e.target.value)}
              placeholder="Enter target user ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chat ID (for call tests)
            </label>
            <input
              type="text"
              value={testChatId}
              onChange={(e) => setTestChatId(e.target.value)}
              placeholder="Enter chat ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Test Controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={runAllTests}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Run All Tests
        </button>
        <button
          onClick={testWebRTCInit}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Test WebRTC Init
        </button>
        <button
          onClick={testMediaPermissions}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Test Media Permissions
        </button>
        <button
          onClick={testCallAPI}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          Test Call API
        </button>
        <button
          onClick={clearResults}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Clear Results
        </button>
      </div>

      {/* Test Results */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-700 mb-3">Test Results</h3>
        {testResults.length === 0 ? (
          <p className="text-gray-500 text-sm">No tests run yet. Click "Run All Tests" to start.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded border-l-4 ${
                  result.result === 'PASS'
                    ? 'bg-green-50 border-green-500'
                    : result.result === 'FAIL'
                    ? 'bg-red-50 border-red-500'
                    : result.result === 'ERROR'
                    ? 'bg-red-50 border-red-600'
                    : 'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{result.test}</h4>
                    <p className="text-sm text-gray-600">{result.details}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        result.result === 'PASS'
                          ? 'bg-green-100 text-green-800'
                          : result.result === 'FAIL'
                          ? 'bg-red-100 text-red-800'
                          : result.result === 'ERROR'
                          ? 'bg-red-100 text-red-900'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {result.result}
                    </span>
                    <span className="text-xs text-gray-500">{result.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CallTestComponent;
