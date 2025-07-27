import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  MessageSquare,
  MessageCircle,
  Eye
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const MyQueries = () => {
  const navigate = useNavigate();
  const { user, getToken } = useAuth();
  const { success, error } = useToast();
  
  const [queries, setQueries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      if (!token) {
        console.error('No authentication token available');
        error('Please login again to view your queries');
        setQueries([]);
        setIsLoading(false);
        return;
      }

      // Use the same endpoint as My Cases page
      const response = await fetch(`${import.meta.env.VITE_API_URL}/citizens/my-cases`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        console.error('Authentication token expired');
        error('Your session has expired. Please login again.');
        setQueries([]);
        setIsLoading(false);
        return;
      }

      const result = await response.json();
      console.log('My Queries API Response:', result);

      if (result.success && result.data && Array.isArray(result.data.cases)) {
        // Filter only queries from the cases
        const queriesData = result.data.cases.filter(c => c.caseType === 'query');
        console.log('Loaded queries:', queriesData.length);
        setQueries(queriesData);
      } else {
        console.log('No queries found or invalid response structure');
        setQueries([]);
      }
    } catch (err) {
      console.error('Fetch queries error:', err);
      setQueries([]);
      error('Failed to load queries');
    } finally {
      setIsLoading(false);
    }
  };



  const filteredQueries = Array.isArray(queries) ? queries.filter(query => {
    const matchesSearch = query.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         query.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || query.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen pt-26 bg-gradient-to-br from-black via-gray-900 to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-blue-500/20 p-3 rounded-full mr-4 backdrop-blur-sm border border-blue-400/30">
                <FileText className="h-8 w-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">My Legal Queries</h1>
                <p className="text-gray-300 mt-1">
                  Manage and track your legal questions
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/citizen/create-query')}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Query
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-300" />
                <input
                  type="text"
                  placeholder="Search queries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-gray-300"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Filter className="h-5 w-5 text-gray-300 mr-2" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white"
                >
                  <option value="all" className="bg-slate-800 text-white">All Status</option>
                  <option value="pending" className="bg-slate-800 text-white">Pending</option>
                  <option value="assigned" className="bg-slate-800 text-white">Assigned</option>
                  <option value="in-progress" className="bg-slate-800 text-white">In Progress</option>
                  <option value="resolved" className="bg-slate-800 text-white">Resolved</option>
                  <option value="closed" className="bg-slate-800 text-white">Closed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Queries List */}
        {filteredQueries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-12 text-center"
          >
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No queries found' : 'No queries yet'}
            </h3>
            <p className="text-gray-300 mb-6">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Submit your first legal query to get expert advice from verified lawyers'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => navigate('/citizen/create-query')}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center mx-auto transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
              >
                <Plus className="h-5 w-5 mr-2" />
                Submit Your First Query
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredQueries.map((query, index) => (
              <QueryCard 
                key={query._id} 
                query={query} 
                index={index}
                onViewDetails={() => navigate(`/citizen/queries/${query._id}`)}
                onFindLawyer={() => navigate(`/citizen/find-lawyers?queryId=${query._id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Query Card Component
const QueryCard = ({ query, index, onViewDetails, onFindLawyer }) => {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const handleStartChat = () => {
    console.log('🚀 CITIZEN: Start Chat clicked from My Queries');
    console.log('   Query data:', query);
    console.log('   Chat room:', query.chatRoom);
    console.log('   Chat ID:', query.chatRoom?.chatId);

    if (query.chatRoom && query.chatRoom.chatId) {
      console.log('✅ Navigating to chat:', `/chat/${query.chatRoom.chatId}`);
      navigate(`/chat/${query.chatRoom.chatId}`);
    } else {
      console.log('❌ No chat room or chat ID available');
      console.log('   Available query properties:', Object.keys(query));
      // Try with the known working chat ID for testing
      console.log('🧪 Testing with known chat ID...');
      navigate('/chat/query_687e812be025b16185b6f15d');
    }
  };

  // Handle accepting lawyer offer
  const handleAcceptOffer = async (offerId) => {
    try {
      // Import citizenAPI at the top if not already imported
      const { citizenAPI } = await import('../services/api');
      const response = await citizenAPI.acceptCaseOffer(offerId);

      if (response.success) {
        success('Lawyer offer accepted successfully! Other pending offers have been automatically rejected.');
        // Refresh the data by calling parent's fetch function
        window.location.reload(); // Simple refresh for now
      } else {
        error(response.error || 'Failed to accept offer');
      }
    } catch (err) {
      console.error('Accept offer error:', err);
      error('Failed to accept offer');
    }
  };

  // Handle rejecting lawyer offer
  const handleRejectOffer = async (offerId) => {
    try {
      const { citizenAPI } = await import('../services/api');
      const response = await citizenAPI.rejectCaseOffer(offerId);

      if (response.success) {
        success('Lawyer offer rejected');
        window.location.reload(); // Simple refresh for now
      } else {
        error(response.error || 'Failed to reject offer');
      }
    } catch (err) {
      console.error('Reject offer error:', err);
      error('Failed to reject offer');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'assigned':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'in-progress':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
      case 'assigned':
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
      case 'in-progress':
        return 'bg-orange-500/20 text-orange-300 border border-orange-500/30';
      case 'resolved':
        return 'bg-green-500/20 text-green-300 border border-green-500/30';
      case 'closed':
        return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'bg-green-500/20 text-green-300 border border-green-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-300 border border-orange-500/30';
      case 'urgent':
        return 'bg-red-500/20 text-red-300 border border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6 hover:bg-white/15 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
            {query.title || 'Untitled Query'}
          </h3>
          <div className="flex items-center space-x-3 mb-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(query.status)}`}>
              {getStatusIcon(query.status)}
              <span className="ml-1 capitalize">{query.status || 'pending'}</span>
            </span>
            {query.priority && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(query.priority)}`}>
                {query.priority.toUpperCase()}
              </span>
            )}
            {query.category && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-gray-300 border border-white/30 capitalize">
                {query.category}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-300 text-sm mb-4 line-clamp-3">
        {query.description || 'No description provided'}
      </p>

      {/* Offers received from lawyers */}
      {query.receivedOffers && query.receivedOffers.length > 0 && (
        <div className="mb-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
          <div className="flex items-center mb-2">
            <MessageCircle className="h-5 w-5 text-green-400 mr-2" />
            <span className="text-sm font-semibold text-green-300">
              Offers from Lawyers ({query.receivedOffers.length})
            </span>
          </div>
          <div className="space-y-3">
            {query.receivedOffers.map((offer, index) => (
              <div key={index} className="border border-green-500/30 rounded-lg p-3 bg-green-500/5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="font-medium text-green-300">
                        {offer.lawyerId?.name || 'Unknown Lawyer'}
                      </span>
                      {offer.lawyerId?.lawyerDetails?.specialization && (
                        <span className="text-xs text-green-400 ml-2">
                          ({offer.lawyerId.lawyerDetails.specialization.join(', ')})
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-green-400 mb-2">
                      Lawyer offered to help
                    </div>
                    {offer.message && (
                      <div className="text-xs text-gray-300 mb-2 italic">
                        "{offer.message}"
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {offer.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleAcceptOffer(offer._id)}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectOffer(offer._id)}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          offer.status === 'accepted' ? 'bg-green-500/20 text-green-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {offer.status}
                        </span>
                        {offer.status === 'accepted' && (
                          <button
                            onClick={handleStartChat}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Start Chat
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/20">
        <div className="flex items-center text-sm text-gray-300">
          <Calendar className="h-4 w-4 mr-1" />
          {query.createdAt ? new Date(query.createdAt).toLocaleDateString() : 'Date not available'}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onViewDetails}
            className="bg-white/10 text-gray-300 px-4 py-2 rounded-md text-sm hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 flex items-center transition-all duration-200 border border-white/20"
          >
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </button>

          {/* Show different buttons based on query status */}
          {(query.status === 'assigned' || query.status === 'in-progress') && query.chatRoom && query.chatRoom.chatId ? (
            <button
              onClick={handleStartChat}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-400 flex items-center transition-all duration-200 shadow-lg hover:shadow-green-500/25"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Start Chat
            </button>
          ) : (
            <button
              onClick={onFindLawyer}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
            >
              <User className="h-4 w-4 mr-1" />
              {(query.status === 'assigned' || query.status === 'in-progress') ? 'Change Lawyer' :
               (query.requestedLawyers && query.requestedLawyers.length > 0 ? 'View Requests' : 'Find Lawyer')}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MyQueries;
