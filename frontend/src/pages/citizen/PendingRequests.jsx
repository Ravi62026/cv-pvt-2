import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Scale,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Star,
  Award,
  Send,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { citizenAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PendingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { success, error } = useToast();

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/citizens/my-case-requests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data.data?.requests || []);
      } else if (response.status === 401) {
        // Token expired, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      } else {
        error('Failed to load pending requests');
      }
    } catch (err) {
      console.error('Error fetching pending requests:', err);
      error('Failed to load pending requests');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRequests = requests.filter(request => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return request.status === 'pending';
    if (activeTab === 'accepted') return request.status === 'accepted';
    if (activeTab === 'rejected') return request.status === 'rejected';
    return true;
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-2xl mr-6 shadow-lg">
              <Send className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">My Requests</h1>
              <p className="text-gray-300 text-lg">
                Requests you've sent to lawyers for your cases
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8">
          <div className="border-b border-white/20">
            <nav className="flex space-x-8 px-8" aria-label="Tabs">
              {[
                { id: 'all', name: 'All Requests', count: requests.length },
                { id: 'pending', name: 'Pending', count: requests.filter(r => r.status === 'pending').length },
                { id: 'accepted', name: 'Accepted', count: requests.filter(r => r.status === 'accepted').length },
                { id: 'rejected', name: 'Rejected', count: requests.filter(r => r.status === 'rejected').length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-5 px-2 border-b-3 font-semibold text-base transition-all ${
                    activeTab === tab.id
                      ? 'border-blue-400 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
                  }`}
                >
                  {tab.name}
                  <span className={`ml-3 py-1 px-3 rounded-full text-xs font-bold ${
                    activeTab === tab.id
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-white/10 text-gray-300'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-16 text-center"
          >
            <div className="bg-white/10 rounded-full p-6 w-24 h-24 mx-auto mb-6">
              <Send className="h-12 w-12 text-gray-400 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              {activeTab === 'all' ? 'No requests sent' : `No ${activeTab} requests`}
            </h3>
            <p className="text-gray-300 text-lg">
              {activeTab === 'all'
                ? 'When you request lawyers for your cases, they will appear here.'
                : `You don't have any ${activeTab} requests at the moment.`
              }
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredRequests.map((request, index) => (
              <RequestCard
                key={`${request.caseType}-${request.caseId}-${request.requestId}`}
                request={request}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Request Card Component
const RequestCard = ({ request, index }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6 hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Case Info */}
          <div className="flex items-center mb-4">
            <div className={`p-2 rounded-lg mr-3 ${
              request.caseType === 'query' ? 'bg-blue-50' : 'bg-red-50'
            }`}>
              {request.caseType === 'query' ? (
                <FileText className="h-5 w-5 text-blue-600" />
              ) : (
                <Scale className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{request.caseTitle}</h3>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                request.caseType === 'query' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
              }`}>
                {request.caseType === 'query' ? 'Legal Query' : 'Dispute Case'}
              </span>
            </div>
          </div>

          {/* Lawyer Info */}
          <div className="flex items-center mb-4 p-4 bg-white/5 rounded-lg">
            <div className="bg-indigo-500/20 p-3 rounded-full mr-4">
              <User className="h-6 w-6 text-indigo-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-white">{request.lawyer.name}</h4>
              <p className="text-sm text-gray-300">{request.lawyer.email}</p>
              {request.lawyer.specialization && (
                <div className="flex items-center mt-1">
                  <Award className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-300">
                    {request.lawyer.specialization.join(', ')}
                  </span>
                </div>
              )}
              {request.lawyer.experience && (
                <div className="flex items-center mt-1">
                  <Star className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-300">
                    {request.lawyer.experience} years experience
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          {request.message && (
            <div className="mb-4 p-3 bg-blue-500/10 rounded-lg">
              <p className="text-sm text-gray-300 italic">"{request.message}"</p>
            </div>
          )}

          {/* Status and Date */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                {getStatusIcon(request.status)}
                <span className="ml-1.5 capitalize">{request.status}</span>
              </span>
              <div className="flex items-center text-sm text-gray-400">
                <Calendar className="h-4 w-4 mr-1" />
                <span>
                  {new Date(request.requestedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {/* Response Date */}
            {request.respondedAt && (
              <div className="flex items-center text-sm text-gray-400">
                <span className="mr-1">
                  {request.status === 'accepted' ? 'Accepted' : 'Rejected'} on:
                </span>
                <Calendar className="h-4 w-4 mr-1" />
                <span>
                  {new Date(request.respondedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PendingRequests;
