import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserPlus,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Phone,
  Calendar,
  MessageCircle,
  Search,
  Filter,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { lawyerAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PendingConnectionRequests = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { success, error } = useToast();

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    setIsLoading(true);
    try {
      const response = await lawyerAPI.getPendingConnectionRequests();
      if (response.success) {
        setRequests(response.data?.requests || []);
      } else {
        error(response.message || 'Failed to load pending requests');
      }
    } catch (err) {
      console.error('Fetch pending requests error:', err);
      error('Failed to load pending requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (connectionId) => {
    setProcessingRequest(connectionId);
    try {
      const response = await lawyerAPI.acceptConnectionRequest(connectionId);
      if (response.success) {
        success('Connection request accepted successfully!');
        fetchPendingRequests(); // Refresh the list
      } else {
        error(response.message || 'Failed to accept request');
      }
    } catch (err) {
      console.error('Accept request error:', err);
      error('Failed to accept request');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async (connectionId) => {
    setProcessingRequest(connectionId);
    try {
      const response = await lawyerAPI.rejectConnectionRequest(connectionId);
      if (response.success) {
        success('Connection request rejected');
        fetchPendingRequests(); // Refresh the list
      } else {
        error(response.message || 'Failed to reject request');
      }
    } catch (err) {
      console.error('Reject request error:', err);
      error('Failed to reject request');
    } finally {
      setProcessingRequest(null);
    }
  };

  const filteredRequests = requests.filter(request => 
    request.citizen?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.citizen?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4 rounded-2xl mr-6 shadow-lg">
                <UserPlus className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Pending Connection Requests</h1>
                <p className="text-gray-300 mt-1">Review and respond to direct connection requests from citizens</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search requests by citizen name, email, or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg"
          >
            <div className="flex items-center">
              <div className="bg-orange-500/20 p-3 rounded-lg border border-orange-500/30">
                <Clock className="h-6 w-6 text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Pending Requests</p>
                <p className="text-2xl font-bold text-white">{requests.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg"
          >
            <div className="flex items-center">
              <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/30">
                <UserPlus className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">New Today</p>
                <p className="text-2xl font-bold text-white">
                  {requests.filter(r => {
                    const today = new Date().toDateString();
                    return new Date(r.createdAt).toDateString() === today;
                  }).length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg"
          >
            <div className="flex items-center">
              <div className="bg-green-500/20 p-3 rounded-lg border border-green-500/30">
                <MessageCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">With Messages</p>
                <p className="text-2xl font-bold text-white">
                  {requests.filter(r => r.message && r.message.trim()).length}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <UserPlus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Pending Requests</h3>
            <p className="text-gray-400">
              {searchTerm
                ? 'No requests match your search criteria.'
                : 'You have no pending connection requests at the moment.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredRequests.map((request, index) => (
              <motion.div
                key={request._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full shadow-lg">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-semibold text-white">
                        {request.citizen?.name || 'Unknown Citizen'}
                      </h3>
                      <div className="mt-1 space-y-1">
                        <p className="text-gray-300 text-sm flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          {request.citizen?.email || 'No email provided'}
                        </p>
                        {request.citizen?.phone && (
                          <p className="text-gray-300 text-sm flex items-center">
                            <Phone className="h-4 w-4 mr-2" />
                            {request.citizen.phone}
                          </p>
                        )}
                        <p className="text-gray-400 text-sm flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Requested {new Date(request.createdAt).toLocaleDateString()} at{' '}
                          {new Date(request.createdAt).toLocaleTimeString()}
                        </p>
                      </div>

                      {request.message && (
                        <div className="mt-4 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                          <p className="text-sm font-medium text-gray-300 mb-1">Message:</p>
                          <p className="text-sm text-white">{request.message}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 ml-4">
                    <button
                      onClick={() => handleAcceptRequest(request._id)}
                      disabled={processingRequest === request._id}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {processingRequest === request._id ? 'Processing...' : 'Accept'}
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request._id)}
                      disabled={processingRequest === request._id}
                      className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {processingRequest === request._id ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingConnectionRequests;
