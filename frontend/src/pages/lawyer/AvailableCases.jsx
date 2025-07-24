import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Scale,
  Search,
  Filter,
  Clock,
  AlertCircle,
  User,
  Calendar,
  Eye,
  DollarSign,
  Send,
  CheckCircle,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { lawyerAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AvailableCases = () => {
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    caseType: 'all',
    category: 'all',
    priority: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });
  const { success, error } = useToast();

  useEffect(() => {
    fetchAvailableCases();
  }, [filters, pagination.current]);

  const fetchAvailableCases = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: 10,
        search: filters.search,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };

      // Only add filter params if they're not 'all'
      if (filters.caseType && filters.caseType !== 'all') {
        params.caseType = filters.caseType;
      }
      if (filters.category && filters.category !== 'all') {
        params.category = filters.category;
      }
      if (filters.priority && filters.priority !== 'all') {
        params.priority = filters.priority;
      }

      console.log('🔍 Fetching available cases with params:', params);
      const response = await lawyerAPI.getAvailableCases(params);
      console.log('🔍 Available cases API response:', response);

      if (response.success) {
        console.log('🔍 Cases received:', response.data.cases.length);
        setCases(response.data.cases);
        setPagination(response.data.pagination);
      } else {
        console.error('🔍 API returned error:', response.error);
        error('Failed to load available cases');
      }
    } catch (err) {
      console.error('Error fetching available cases:', err);
      error('Failed to load available cases');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRequest = async (caseItem) => {
    try {
      const requestData = {
        message: `I would like to handle this ${caseItem.caseType} case. I have experience in ${caseItem.category} law and can provide quality legal assistance.`,
        proposedFee: 1000, // Default fee
        estimatedDuration: '1-2 weeks'
      };

      // Use the offer help method which creates lawyerRequests entries
      const response = await lawyerAPI.offerHelpOnCase(caseItem.caseType, caseItem._id, requestData);

      if (response.success) {
        success('Offer sent successfully!');
        // Refresh the cases list
        fetchAvailableCases();
      } else {
        error(response.error || 'Failed to send offer');
      }
    } catch (err) {
      console.error('Error sending offer:', err);
      error('Failed to send offer');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'open':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
      case 'open':
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
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

  if (isLoading && cases.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950/80 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/8 to-gray-500/12 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-gray-500/10 to-blue-500/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-500/5 to-gray-500/10 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-8 relative z-10">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 rounded-2xl mr-6 shadow-lg">
              <FileText className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-white mb-2">Available Cases</h1>
              <p className="text-gray-300 text-xl">
                Browse and request to handle available legal cases
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/20 mb-8 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cases..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Case Type</label>
              <select
                value={filters.caseType}
                onChange={(e) => setFilters(prev => ({ ...prev, caseType: e.target.value }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              >
                <option value="all" className="text-gray-900">All Types</option>
                <option value="query" className="text-gray-900">Queries</option>
                <option value="dispute" className="text-gray-900">Disputes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              >
                <option value="all" className="text-gray-900">All Categories</option>
                <option value="property" className="text-gray-900">Property</option>
                <option value="civil" className="text-gray-900">Civil</option>
                <option value="criminal" className="text-gray-900">Criminal</option>
                <option value="family" className="text-gray-900">Family</option>
                <option value="corporate" className="text-gray-900">Corporate</option>
                <option value="tax" className="text-gray-900">Tax</option>
                <option value="labor" className="text-gray-900">Labor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              >
                <option value="all" className="text-gray-900">All Priorities</option>
                <option value="low" className="text-gray-900">Low</option>
                <option value="medium" className="text-gray-900">Medium</option>
                <option value="high" className="text-gray-900">High</option>
                <option value="urgent" className="text-gray-900">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cases List */}
        {cases.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-16 text-center"
          >
            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full p-6 w-24 h-24 mx-auto mb-6">
              <FileText className="h-12 w-12 text-blue-400 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">No available cases</h3>
            <p className="text-gray-300 text-lg">
              There are currently no cases available that match your criteria.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {cases.map((caseItem, index) => (
              <CaseCard
                key={`${caseItem.caseType}-${caseItem._id}`}
                caseItem={caseItem}
                index={index}
                onSendRequest={handleSendRequest}
                getStatusIcon={getStatusIcon}
                getStatusColor={getStatusColor}
                getPriorityColor={getPriorityColor}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Case Card Component
const CaseCard = ({ caseItem, index, onSendRequest, getStatusIcon, getStatusColor, getPriorityColor }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="card-sexy bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-6 group relative"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-3">
            <div className={`card-icon p-2 rounded-lg mr-3 ${
              caseItem.caseType === 'query' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-gradient-to-r from-red-500 to-pink-500'
            }`}>
              {caseItem.caseType === 'query' ? (
                <FileText className="h-5 w-5 text-white" />
              ) : (
                <Scale className="h-5 w-5 text-white" />
              )}
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
              caseItem.caseType === 'query' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}>
              {caseItem.caseType === 'query' ? 'Legal Query' : 'Dispute Case'}
            </span>
          </div>
          <div className="card-content">
            <h3 className="text-xl font-bold text-white mb-3">{caseItem.title}</h3>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(caseItem.status)}`}>
                {getStatusIcon(caseItem.status)}
                <span className="ml-1.5 capitalize">{caseItem.status}</span>
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(caseItem.priority)}`}>
                {caseItem.priority.toUpperCase()}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-gray-300 border border-white/20 capitalize">
                {caseItem.category}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
          {caseItem.description}
        </p>
      </div>

      {/* Dispute Value (for disputes only) */}
      {caseItem.caseType === 'dispute' && caseItem.disputeValue && (
        <div className="flex items-center mb-4 p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg">
          <DollarSign className="h-5 w-5 text-green-400 mr-2" />
          <span className="text-sm font-semibold text-green-300">
            Dispute Value: ₹{caseItem.disputeValue.toLocaleString()}
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/20">
        <div className="flex items-center text-sm text-gray-300">
          <Calendar className="h-4 w-4 mr-2" />
          <span className="font-medium">
            {new Date(caseItem.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </span>
        </div>
        {caseItem.hasLawyerRequested ? (
          <div className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-green-300 bg-green-500/20 border border-green-500/30">
            <CheckCircle className="h-4 w-4 mr-1.5 text-green-400" />
            Already Requested
          </div>
        ) : (
          <button
            onClick={() => onSendRequest(caseItem)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-sm hover:shadow-lg hover:scale-105"
          >
            <Send className="h-4 w-4 mr-1.5" />
            Send Request
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default AvailableCases;
