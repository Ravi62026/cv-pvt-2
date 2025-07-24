import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Scale,
  Users,
  UserPlus,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  Send,
  Calendar,
  DollarSign,
  MessageCircle,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { lawyerAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const LawyerDashboard = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [stats, setStats] = useState({
    totalCases: 0,
    activeCases: 0,
    completedCases: 0,
    pendingRequests: 0,
  });
  const [availableCases, setAvailableCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch dashboard stats and available cases
      const [statsResponse, casesResponse] = await Promise.all([
        lawyerAPI.getDashboardStats(),
        lawyerAPI.getAvailableCases({ limit: 6 })
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (casesResponse.success) {
        setAvailableCases(casesResponse.data.cases);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      error('Failed to load dashboard data');
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
        // Refresh the available cases
        fetchDashboardData();
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
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'open':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
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
              <h1 className="text-4xl font-bold text-white mb-3">
                Lawyer Dashboard ⚖️
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Manage your cases and find new opportunities
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
                <div className="flex items-center">
                  <div className="p-2 bg-white/20 rounded-lg mr-4">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold">Verified Status</p>
                    <p className="text-sm opacity-90">Professional Lawyer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Your Performance</h2>
            <div className="text-sm text-gray-400">Last updated: just now</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Cases"
              value={stats.totalCases}
              icon={<FileText className="h-8 w-8 text-blue-600" />}
              color="blue"
            />
            <StatsCard
              title="Active Cases"
              value={stats.activeCases}
              icon={<TrendingUp className="h-8 w-8 text-green-600" />}
              color="green"
            />
            <StatsCard
              title="Completed Cases"
              value={stats.completedCases}
              icon={<CheckCircle className="h-8 w-8 text-purple-600" />}
              color="purple"
            />
            <StatsCard
              title="Pending Requests"
              value={stats.pendingRequests}
              icon={<Clock className="h-8 w-8 text-orange-600" />}
              color="orange"
            />
          </div>
        </div>

        {/* Available Cases Section */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/20 mb-8">
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Available Cases</h2>
                <p className="text-gray-300">Browse and request to handle new cases</p>
              </div>
              <button
                onClick={() => navigate('/lawyer/available-cases')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center shadow-lg transition-all transform hover:scale-105"
              >
                <Eye className="h-5 w-5 mr-2" />
                View All Cases
              </button>
            </div>
          </div>

          <div className="p-6">
            {availableCases.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gradient-to-r from-gray-500/20 to-blue-500/20 rounded-full p-6 w-24 h-24 mx-auto mb-6">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">No available cases</h3>
                <p className="text-gray-300">
                  There are currently no cases available for you to handle.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {availableCases.map((caseItem, index) => (
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickActionCard
            title="My Case Requests"
            description="Manage all your case requests"
            icon={<Send className="h-8 w-8 text-purple-600" />}
            onClick={() => navigate('/lawyer/my-case-requests')}
            color="purple"
          />
          <QuickActionCard
            title="Direct Clients"
            description="View and chat with your direct clients"
            icon={<Users className="h-8 w-8 text-blue-600" />}
            onClick={() => navigate('/lawyer/direct-clients')}
            color="blue"
          />
          <QuickActionCard
            title="Connection Requests"
            description="Review pending connection requests"
            icon={<UserPlus className="h-8 w-8 text-green-600" />}
            onClick={() => navigate('/lawyer/pending-connection-requests')}
            color="green"
          />
          <QuickActionCard
            title="Available Cases"
            description="Browse and offer help on new cases"
            icon={<FileText className="h-8 w-8 text-orange-600" />}
            onClick={() => navigate('/lawyer/available-cases')}
            color="orange"
          />
        </div>
      </div>
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-emerald-500 to-teal-500',
    purple: 'from-purple-500 to-pink-500',
    orange: 'from-orange-500 to-red-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/30 group cursor-pointer"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} shadow-lg group-hover:shadow-xl transition-all duration-300`}>
          {React.cloneElement(icon, { className: "h-6 w-6 text-white" })}
        </div>
        <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
          <TrendingUp className="h-3 w-3" />
          <span>+5%</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-400 mb-2">{title}</p>
        <p className="text-3xl font-bold text-white group-hover:text-blue-300 transition-colors duration-300">
          {value || 0}
        </p>
        <p className="text-xs text-gray-500 mt-1">this month</p>
      </div>
    </motion.div>
  );
};

// Quick Action Card Component
const QuickActionCard = ({ title, description, icon, onClick, color }) => {
  const colorClasses = {
    blue: 'hover:border-blue-400/50',
    green: 'hover:border-green-400/50',
    purple: 'hover:border-purple-400/50',
    emerald: 'hover:border-emerald-400/50',
    orange: 'hover:border-orange-400/50',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20 cursor-pointer transition-all duration-200 ${colorClasses[color]} hover:shadow-lg hover:from-white/15 hover:to-white/10`}
    >
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-4">{icon}</div>
        <div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <p className="text-gray-300 text-sm">{description}</p>
        </div>
      </div>
    </motion.div>
  );
};

// Case Card Component (simplified for dashboard)
const CaseCard = ({ caseItem, index, onSendRequest, getStatusIcon, getStatusColor, getPriorityColor }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-white/30 hover:shadow-md transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-center mb-3">
        <div className={`p-2 rounded-lg mr-3 ${
          caseItem.caseType === 'query' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-gradient-to-r from-red-500 to-pink-500'
        }`}>
          {caseItem.caseType === 'query' ? (
            <FileText className="h-4 w-4 text-white" />
          ) : (
            <Scale className="h-4 w-4 text-white" />
          )}
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${
          caseItem.caseType === 'query' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'
        }`}>
          {caseItem.caseType === 'query' ? 'Query' : 'Dispute'}
        </span>
      </div>

      <h3 className="text-sm font-bold text-white mb-2 line-clamp-2">{caseItem.title}</h3>

      <div className="flex flex-wrap items-center gap-1 mb-3">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(caseItem.status)}`}>
          {getStatusIcon(caseItem.status)}
          <span className="ml-1 capitalize">{caseItem.status}</span>
        </span>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold border ${getPriorityColor(caseItem.priority)}`}>
          {caseItem.priority.toUpperCase()}
        </span>
      </div>

      <p className="text-gray-300 text-xs leading-relaxed line-clamp-2 mb-3">
        {caseItem.description}
      </p>

      {/* Dispute Value */}
      {caseItem.caseType === 'dispute' && caseItem.disputeValue && (
        <div className="flex items-center mb-3 p-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg">
          <DollarSign className="h-3 w-3 text-green-400 mr-1" />
          <span className="text-xs font-semibold text-green-400">
            ₹{caseItem.disputeValue.toLocaleString()}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center text-xs text-gray-400">
          <Calendar className="h-3 w-3 mr-1" />
          <span>
            {new Date(caseItem.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short'
            })}
          </span>
        </div>
        <button
          onClick={() => onSendRequest(caseItem)}
          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
        >
          <Send className="h-3 w-3 mr-1" />
          Send Request
        </button>
      </div>
    </motion.div>
  );
};

export default LawyerDashboard;
