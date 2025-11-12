import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  Shield,
  Calendar,
  Star,
  MapPin,
  Briefcase,
  Award,
  Users,
  Clock,
  CheckCircle,
  MessageSquare,
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { citizenAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ConnectedLawyers = () => {
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('accepted'); // 'accepted' or 'pending'
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalConnections: 0,
    totalPending: 0,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });
  const { success, error } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch data when tab or page changes
  useEffect(() => {
    fetchConnections();
  }, [pagination.current, activeTab]);

  const fetchStats = async () => {
    try {
      // Fetch both counts for stats
      const [connectedResponse, pendingResponse] = await Promise.all([
        citizenAPI.getConnectedLawyers({ page: 1, limit: 1 }),
        citizenAPI.getPendingConnectionRequests({ page: 1, limit: 1 }),
      ]);

      setStats({
        totalConnections: connectedResponse.success ? connectedResponse.data.pagination.total : 0,
        totalPending: pendingResponse.success ? pendingResponse.data.pagination.total : 0,
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchConnections = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: 10,
      };

      if (activeTab === 'accepted') {
        const response = await citizenAPI.getConnectedLawyers(params);
        if (response.success) {
          setConnections(response.data.connections);
          setPagination(response.data.pagination);
          // Update stats
          setStats(prev => ({ ...prev, totalConnections: response.data.pagination.total }));
        } else {
          error('Failed to load connected lawyers');
        }
      } else {
        // Fetch pending requests
        const response = await citizenAPI.getPendingConnectionRequests(params);
        if (response.success) {
          setPendingRequests(response.data.requests);
          setPagination(response.data.pagination);
          // Update stats
          setStats(prev => ({ ...prev, totalPending: response.data.pagination.total }));
        } else {
          error('Failed to load pending requests');
        }
      }
    } catch (err) {
      error('Failed to load data');
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = (connection) => {
    // Generate consistent chat ID like lawyer side does
    const currentUserId = user._id;
    const lawyerId = connection.lawyer._id;
    const chatId = `direct_${[currentUserId, lawyerId].sort().join('_')}`;

    console.log('🚀 CITIZEN: Starting direct chat');
    console.log('   Current User ID:', currentUserId);
    console.log('   Lawyer ID:', lawyerId);
    console.log('   Generated Chat ID:', chatId);

    navigate(`/chat/${encodeURIComponent(chatId)}`);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen pt-26 bg-gradient-to-br from-black via-gray-900 to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Lawyer Connections</h1>
          <p className="text-gray-300">
            Manage your lawyer connections and pending requests
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('accepted')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'accepted'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
            }`}
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Connected ({stats.totalConnections})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'pending'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Pending ({stats.totalPending})</span>
            </div>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total Connections"
            value={stats.totalConnections}
            icon={Users}
            color="blue"
          />
          <StatsCard
            title="Pending Requests"
            value={stats.totalPending}
            icon={Clock}
            color="yellow"
          />
          <StatsCard
            title="Response Rate"
            value="95%"
            icon={CheckCircle}
            color="purple"
          />
        </div>

        {/* Content based on active tab */}
        {isLoading ? (
          <LoadingSpinner />
        ) : activeTab === 'accepted' ? (
          connections.length > 0 ? (
            <div className="space-y-6">
              {connections.map((connection) => (
                <ConnectedLawyerCard
                  key={connection._id}
                  connection={connection}
                  onStartChat={handleStartChat}
                />
              ))}
            </div>
          ) : (
            <EmptyState type="accepted" />
          )
        ) : (
          pendingRequests.length > 0 ? (
            <div className="space-y-6">
              {pendingRequests.map((request) => (
                <PendingRequestCard
                  key={request._id}
                  request={request}
                />
              ))}
            </div>
          ) : (
            <EmptyState type="pending" />
          )
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setPagination(prev => ({ ...prev, current: page }))}
                  className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                    page === pagination.current
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20 backdrop-blur-sm'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'text-blue-400 bg-blue-500/20 border-blue-400/30',
    green: 'text-green-400 bg-green-500/20 border-green-400/30',
    purple: 'text-purple-400 bg-purple-500/20 border-purple-400/30',
    yellow: 'text-yellow-400 bg-yellow-500/20 border-yellow-400/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.02 }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/20 p-6 hover:border-blue-400/50 transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-300">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-full backdrop-blur-sm border ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
};

// Connected Lawyer Card Component
const ConnectedLawyerCard = ({ connection, onStartChat }) => {
  const lawyer = connection.lawyer;
  const chatInfo = connection.chatInfo;
  const connectedAt = new Date(connection.connectedAt).toLocaleDateString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.01 }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/20 p-6 hover:border-blue-400/50 transition-all duration-300"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        {/* Lawyer Info */}
        <div className="flex items-start space-x-4 mb-4 lg:mb-0">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-blue-400/30">
            <Shield className="h-8 w-8 text-blue-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-white">{lawyer.name}</h3>
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-sm text-gray-300 mb-2">{lawyer.email}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-300">
              <div className="flex items-center">
                <Briefcase className="h-4 w-4 mr-2 text-blue-400" />
                <span>{lawyer.lawyerDetails?.experience || 'N/A'} years experience</span>
              </div>
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-2 text-purple-400" />
                <span>{lawyer.lawyerDetails?.specialization?.join(', ') || 'General Practice'}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-cyan-400" />
                <span>Connected on {connectedAt}</span>
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-2 text-yellow-400 fill-current" />
                <span>4.8 rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Info & Actions */}
        <div className="flex flex-col lg:items-end space-y-3">
          {/* Chat Status */}
          {chatInfo && (
            <div className="flex items-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                chatInfo.status === 'active' ? 'bg-green-400' : 'bg-gray-500'
              }`}></div>
              <span className="text-gray-300">
                {chatInfo.status === 'active' ? 'Chat Active' : 'Chat Inactive'}
              </span>
              {chatInfo.unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {chatInfo.unreadCount}
                </span>
              )}
            </div>
          )}

          {/* Last Message */}
          {chatInfo?.lastMessage && (
            <div className="text-sm text-gray-400 max-w-xs">
              <p className="truncate">
                Last: {chatInfo.lastMessage.content}
              </p>
              <p className="text-xs">
                {new Date(chatInfo.lastMessage.timestamp).toLocaleString()}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() => onStartChat(connection)}
              disabled={!chatInfo?.chatId}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-blue-500/25"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Start Chat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Connection Details */}
      {connection.requestMessage && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <p className="text-sm text-gray-300">
            <span className="font-medium text-white">Your request:</span> {connection.requestMessage}
          </p>
          {connection.responseMessage && (
            <p className="text-sm text-gray-300 mt-1">
              <span className="font-medium text-white">Their response:</span> {connection.responseMessage}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
};

// Pending Request Card Component
const PendingRequestCard = ({ request }) => {
  const lawyer = request.lawyer;
  const requestedAt = new Date(request.requestedAt).toLocaleString();
  const requestCount = request.requestCount || 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-yellow-400/30 p-6"
    >
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-yellow-400/30">
          <Clock className="h-8 w-8 text-yellow-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-white">{lawyer.name}</h3>
              <p className="text-sm text-gray-300">{lawyer.email}</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-full border border-yellow-400/30">
                Pending
              </span>
              {requestCount > 1 && (
                <p className="text-xs text-gray-400 mt-1">{requestCount} requests sent</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-300 mb-3">
            <div className="flex items-center">
              <Briefcase className="h-4 w-4 mr-2 text-blue-400" />
              <span>{lawyer.lawyerDetails?.experience || 'N/A'} years experience</span>
            </div>
            <div className="flex items-center">
              <Award className="h-4 w-4 mr-2 text-purple-400" />
              <span>{lawyer.lawyerDetails?.specialization?.join(', ') || 'General Practice'}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-cyan-400" />
              <span>Requested: {requestedAt}</span>
            </div>
          </div>

          {request.message && (
            <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm text-gray-300">
                <span className="font-medium text-white">Your message:</span> {request.message}
              </p>
            </div>
          )}

          <div className="mt-3 flex items-center space-x-2 text-sm text-gray-400">
            <Clock className="h-4 w-4" />
            <span>Waiting for lawyer's response...</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Empty State Component
const EmptyState = ({ type }) => {
  const navigate = useNavigate();

  return (
    <div className="text-center py-12">
      {type === 'accepted' ? (
        <>
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No connected lawyers yet</h3>
          <p className="text-gray-400 mb-6">
            Start by finding and connecting with lawyers who can help with your legal needs
          </p>
        </>
      ) : (
        <>
          <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No pending requests</h3>
          <p className="text-gray-400 mb-6">
            Send connection requests to lawyers to get started
          </p>
        </>
      )}
      <button
        onClick={() => navigate('/citizen/find-lawyers')}
        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 mx-auto shadow-lg hover:shadow-blue-500/25"
      >
        <Users className="h-5 w-5" />
        <span>Find Lawyers</span>
      </button>
    </div>
  );
};

export default ConnectedLawyers;
