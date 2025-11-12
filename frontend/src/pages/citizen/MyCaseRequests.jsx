import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageCircle,
  User,
  Calendar,
  FileText,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { citizenAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MyCaseRequests = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCaseRequests();
    
    // Set up auto-refresh every 30 seconds to catch updates
    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing case requests...');
      fetchCaseRequests();
    }, 30000); // 30 seconds

    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  const fetchCaseRequests = async () => {
    setIsLoading(true);
    try {
      const response = await citizenAPI.getMyCaseRequests();
      if (response.success) {
        setRequests(response.data.requests || []);
      } else {
        error('Failed to load case requests');
      }
    } catch (err) {
      error('Failed to load case requests');
      console.error('Case requests fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeRequest = async (request) => {
    if (!window.confirm('Are you sure you want to revoke this request?')) {
      return;
    }

    try {
      console.log('🗑️ Revoking request:', request);
      
      const response = await citizenAPI.revokeCaseRequest(
        request.caseType,
        request.caseId,
        request.lawyer._id
      );

      console.log('📡 Revoke response:', response);

      if (response.success) {
        success('Request revoked successfully');
        
        // Immediately remove from UI
        setRequests(prev => prev.filter(r => 
          !(r.caseId === request.caseId && 
            r.lawyer._id === request.lawyer._id &&
            r.caseType === request.caseType)
        ));
        
        // Then refresh from server
        setTimeout(() => {
          fetchCaseRequests();
        }, 500);
      } else {
        error(response.error || 'Failed to revoke request');
      }
    } catch (err) {
      error('Failed to revoke request');
      console.error('Revoke error:', err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleStartChat = (request) => {
    // The chat ID format is: {caseType}_{caseId}
    const chatId = `${request.caseType}_${request.caseId}`;
    console.log('🚀 CITIZEN: Starting chat with ID:', chatId);
    console.log('   Request data:', request);
    navigate(`/chat/${encodeURIComponent(chatId)}`);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gray-600/15 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-500/5 to-gray-500/10 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-8 relative z-10">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">My Case Requests</h1>
              <p className="mt-2 text-gray-300">
                Track the status of your requests to lawyers for specific cases
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Send className="h-4 w-4" />
              <span>{requests.length} total requests</span>
            </div>
          </div>
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <Send className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-white">No case requests sent</h3>
            <p className="mt-1 text-sm text-gray-400">
              You haven't sent any requests to lawyers for cases yet.
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/citizen/my-cases')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
              >
                <FileText className="h-4 w-4 mr-2" />
                View My Cases
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => (
              <div
                key={request._id}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/20 p-6 hover:border-white/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Request Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center backdrop-blur-sm border border-purple-400/30">
                            <User className="h-5 w-5 text-purple-400" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-white">
                            {request.lawyer?.name || 'Unknown Lawyer'}
                          </h3>
                          <p className="text-sm text-gray-300">
                            {request.lawyer?.email || 'No email'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {request.lawyer?.specialization?.join(', ') || 'General Practice'}
                          </p>
                        </div>
                      </div>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">{request.status}</span>
                      </div>
                    </div>

                    {/* Case Information */}
                    <div className="bg-white/5 rounded-lg p-4 mb-4 backdrop-blur-sm border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-white">Case Details</h4>
                        <span className="text-xs text-gray-400 capitalize">
                          {request.caseType} Case
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">
                        <strong className="text-white">Title:</strong> {request.caseTitle || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-300">
                        <strong className="text-white">Description:</strong> {request.description || 'N/A'}
                      </p>
                    </div>

                    {/* Request Message */}
                    {request.message && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-white mb-2">Your Message</h4>
                        <p className="text-sm text-gray-300 bg-white/5 p-3 rounded-lg border border-white/10 backdrop-blur-sm">
                          {request.message}
                        </p>
                      </div>
                    )}

                    {/* Lawyer Response */}
                    {request.response && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-white mb-2">Lawyer's Response</h4>
                        <p className="text-sm text-gray-300 bg-green-500/10 p-3 rounded-lg border border-green-400/20 backdrop-blur-sm">
                          {request.response}
                        </p>
                      </div>
                    )}

                    {/* Timestamps */}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Sent: {request.requestedAt ? new Date(request.requestedAt).toLocaleDateString() : 'Invalid Date'}</span>
                        </div>
                        {request.respondedAt && (
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>Responded: {new Date(request.respondedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  {request.status === 'pending' && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-yellow-400 font-medium">
                        ⏳ Waiting for lawyer's response...
                      </p>
                      <button
                        onClick={() => handleRevokeRequest(request)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Revoke Request
                      </button>
                    </div>
                  )}
                  {request.status === 'accepted' && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-green-400 font-medium">
                        ✅ Request accepted! You can now chat with the lawyer.
                      </p>
                      <button
                        onClick={() => handleStartChat(request)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Start Chat
                      </button>
                    </div>
                  )}
                  {request.status === 'rejected' && (
                    <p className="text-sm text-red-400 font-medium">
                      ❌ Request was declined by the lawyer.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCaseRequests;
