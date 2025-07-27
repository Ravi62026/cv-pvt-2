import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  FileText,
  Scale,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Activity,
  DollarSign,
  Bot,
  FolderOpen,
  ArrowRight,
} from 'lucide-react';
import { adminAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [pendingLawyers, setPendingLawyers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState({});
  const { success, error } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [analyticsResponse, lawyersResponse] = await Promise.all([
        adminAPI.getDashboardAnalytics(),
        adminAPI.getPendingLawyerVerifications(1, 10),
      ]);

      if (analyticsResponse.success) {
        setAnalytics(analyticsResponse.data);
      } else {
        error('Failed to load analytics data');
      }

      if (lawyersResponse.success) {
        setPendingLawyers(lawyersResponse.data.lawyers);
      } else {
        error('Failed to load pending lawyers');
      }
    } catch (err) {
      error('Failed to load dashboard data');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLawyerVerification = async (lawyerId, action, reason = '') => {
    const processingKey = `${lawyerId}-${action}`;
    setIsProcessing(prev => ({ ...prev, [processingKey]: true }));

    try {
      const response = await adminAPI.updateLawyerVerification(lawyerId, action, reason);

      if (response.success) {
        success(response.message || `Lawyer ${action}d successfully`);
        // Remove the lawyer from pending list
        setPendingLawyers(prev => prev.filter(lawyer => lawyer._id !== lawyerId));

        // Refresh analytics to update counts
        const analyticsResponse = await adminAPI.getDashboardAnalytics();
        if (analyticsResponse.success) {
          setAnalytics(analyticsResponse.data);
        }
      } else {
        error(response.error || `Failed to ${action} lawyer`);
      }
    } catch (err) {
      error(`Failed to ${action} lawyer`);
      console.error('Lawyer verification error:', err);
    } finally {
      setIsProcessing(prev => ({ ...prev, [processingKey]: false }));
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const stats = analytics?.counts || {};
  const monthlyStats = analytics?.monthlyStats || [];
  const recentActivities = analytics?.recentActivities || {};

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
                Admin Dashboard 🛡️
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Manage platform operations and monitor system performance
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
                <div className="flex items-center">
                  <div className="p-2 bg-white/20 rounded-lg mr-4">
                    <Activity className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold">System Status</p>
                    <p className="text-sm opacity-90">All Systems Operational</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <QuickActionCard
            title="AI Legal Tools"
            description="Access AI-powered legal assistance"
            icon={Bot}
            color="blue"
            onClick={() => navigate('/ai-tools')}
          />
          <QuickActionCard
            title="Documents"
            description="Manage legal documents"
            icon={FolderOpen}
            color="green"
            onClick={() => navigate('/documents')}
          />
          <QuickActionCard
            title="Pending Lawyers"
            description="Review lawyer verifications"
            icon={UserCheck}
            color="orange"
            onClick={() => navigate('/admin/pending-lawyers')}
          />
          <QuickActionCard
            title="System Analytics"
            description="View platform analytics"
            icon={BarChart3}
            color="purple"
            onClick={() => document.getElementById('analytics-section')?.scrollIntoView({ behavior: 'smooth' })}
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Citizens"
            value={stats.totalCitizens || 0}
            icon={Users}
            color="blue"
            trend="+12%"
          />
          <StatsCard
            title="Total Lawyers"
            value={stats.totalLawyers || 0}
            icon={UserCheck}
            color="green"
            trend="+8%"
          />
          <StatsCard
            title="Total Cases"
            value={(stats.totalQueries || 0) + (stats.totalDisputes || 0)}
            icon={FileText}
            color="purple"
            trend="+15%"
          />
          <StatsCard
            title="Pending Verifications"
            value={stats.pendingLawyerVerifications || 0}
            icon={Clock}
            color="orange"
            trend="0%"
            showViewAll={true}
            onClick={() => {
              // Scroll to pending verifications section
              document.getElementById('pending-verifications')?.scrollIntoView({
                behavior: 'smooth'
              });
            }}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending Lawyer Verifications */}
          <div className="lg:col-span-2">
            <PendingLawyersSection
              lawyers={pendingLawyers}
              onVerify={handleLawyerVerification}
              isProcessing={isProcessing}
            />
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <QuickStatsCard stats={stats} />
            <RecentActivitiesCard activities={recentActivities} />
          </div>
        </div>

        {/* Charts Section */}
        {monthlyStats.length > 0 && (
          <div className="mt-8">
            <MonthlyStatsChart data={monthlyStats} />
          </div>
        )}
      </div>
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value = 0, icon: Icon, color, trend = "0%", onClick, showViewAll = false }) => {
  const navigate = useNavigate();
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-emerald-500 to-teal-500',
    purple: 'from-purple-500 to-pink-500',
    orange: 'from-orange-500 to-red-500',
  };

  const isPositiveTrend = trend.startsWith('+');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={`bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/20 hover:border-white/30 p-6 group transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:shadow-lg hover:shadow-orange-500/20' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} shadow-lg group-hover:shadow-xl transition-all duration-300`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
          isPositiveTrend ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          <TrendingUp className={`h-3 w-3 ${isPositiveTrend ? '' : 'rotate-180'}`} />
          <span>{trend}</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-400 mb-2">{title}</p>
        <p className="text-3xl font-bold text-white group-hover:text-blue-300 transition-colors duration-300">
          {(value || 0).toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 mt-1">from last month</p>

        {/* View All Button for Pending Verifications */}
        {showViewAll && value > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate('/admin/pending-lawyers');
            }}
            className="mt-3 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 hover:text-orange-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center space-x-1"
          >
            <span>View All</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  );
};

// Pending Lawyers Section Component
const PendingLawyersSection = ({ lawyers = [], onVerify, isProcessing = {} }) => {
  const navigate = useNavigate();
  const displayedLawyers = lawyers.slice(0, 3);

  return (
    <motion.div
      id="pending-verifications"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/20 hover:border-white/30 transition-all duration-300"
    >
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <div className="p-2 bg-orange-500/20 rounded-lg mr-3">
              <UserCheck className="h-6 w-6 text-orange-400" />
            </div>
            Pending Verifications
          </h2>
          <div className="flex items-center space-x-3">
            <div className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm font-medium">
              {lawyers.length} pending
            </div>
            {lawyers.length > 3 && (
              <button
                onClick={() => navigate('/admin/pending-lawyers')}
                className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2"
              >
                <span>View All</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {lawyers.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-green-500/20 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">All Caught Up!</h3>
            <p className="text-gray-400">No pending lawyer verifications at the moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedLawyers.map((lawyer) => (
              <LawyerVerificationCard
                key={lawyer._id}
                lawyer={lawyer}
                onVerify={onVerify}
                isProcessing={isProcessing}
              />
            ))}
            {lawyers.length > 3 && (
              <div className="text-center pt-4">
                <p className="text-gray-400 text-sm">
                  Showing {displayedLawyers.length} of {lawyers.length} pending verifications
                </p>
                <button
                  onClick={() => navigate('/admin/pending-lawyers')}
                  className="mt-2 text-blue-400 hover:text-blue-300 text-sm font-medium underline"
                >
                  View all pending lawyers →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Individual Lawyer Verification Card
const LawyerVerificationCard = ({ lawyer, onVerify, isProcessing = {} }) => {
  const [showDetails, setShowDetails] = useState(false);

  const isApproving = isProcessing[`${lawyer._id}-approve`] || false;
  const isRejecting = isProcessing[`${lawyer._id}-reject`] || false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-white/20 rounded-xl p-6 bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-sm hover:border-white/40 transition-all duration-300 hover:shadow-lg hover:shadow-white/5"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-4">
            <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg">{lawyer.name}</h3>
              <p className="text-sm text-gray-300">{lawyer.email}</p>
              <div className="flex items-center space-x-3 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  lawyer.lawyerDetails?.verificationStatus === 'verified'
                    ? 'bg-green-500/20 text-green-400 border-green-500/40'
                    : lawyer.lawyerDetails?.verificationStatus === 'rejected'
                    ? 'bg-red-500/20 text-red-400 border-red-500/40'
                    : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
                }`}>
                  {lawyer.lawyerDetails?.verificationStatus || 'pending'}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  lawyer.isVerified
                    ? 'bg-green-500/20 text-green-400 border-green-500/40'
                    : 'bg-gray-500/20 text-gray-400 border-gray-500/40'
                }`}>
                  {lawyer.isVerified ? 'Verified' : 'Not Verified'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300 mb-4 mt-4">
            <div className="bg-white/5 rounded-lg p-3">
              <span className="font-medium text-gray-400">Phone:</span>
              <p className="text-white mt-1">{lawyer.phone}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <span className="font-medium text-gray-400">Experience:</span>
              <p className="text-white mt-1">{lawyer.lawyerDetails?.experience || 'N/A'}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <span className="font-medium text-gray-400">Bar ID:</span>
              <p className="text-white mt-1">{lawyer.lawyerDetails?.barId || 'N/A'}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <span className="font-medium text-gray-400">Specialization:</span>
              <p className="text-white mt-1">{lawyer.lawyerDetails?.specialization?.join(', ') || 'N/A'}</p>
            </div>
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1 rounded-lg transition-all duration-200 flex items-center space-x-2"
          >
            <span>{showDetails ? 'Hide Details' : 'Show Details'}</span>
            <motion.div
              animate={{ rotate: showDetails ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </button>

          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10"
            >
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <span className="font-medium text-gray-400">Education:</span>
                  <p className="text-white mt-1">{lawyer.lawyerDetails?.education || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-400">Address:</span>
                  <p className="text-white mt-1">{
                    lawyer.address
                      ? `${lawyer.address.street || ''}, ${lawyer.address.city || ''}, ${lawyer.address.state || ''} ${lawyer.address.pincode || ''}`.replace(/^,\s*/, '').replace(/,\s*$/, '')
                      : 'N/A'
                  }</p>
                </div>
                <div>
                  <span className="font-medium text-gray-400">Registered:</span>
                  <p className="text-white mt-1">{new Date(lawyer.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex flex-col space-y-3 ml-6">
          <button
            onClick={() => onVerify(lawyer._id, 'approve')}
            disabled={isApproving || isRejecting}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm font-medium shadow-lg hover:shadow-green-500/25 transition-all duration-200"
          >
            {isApproving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Approve
          </button>

          <button
            onClick={() => onVerify(lawyer._id, 'reject', 'Documents verification failed')}
            disabled={isApproving || isRejecting}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm font-medium shadow-lg hover:shadow-red-500/25 transition-all duration-200"
          >
            {isRejecting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <XCircle className="h-4 w-4 mr-2" />
            )}
            Reject
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Quick Stats Card Component
const QuickStatsCard = ({ stats = {} }) => {
  const completionRate = (stats.totalQueries || 0) > 0
    ? (((stats.completedQueries || 0) / (stats.totalQueries || 0)) * 100).toFixed(1)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <BarChart3 className="h-5 w-5 mr-2 text-blue-400" />
        Quick Stats
      </h3>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Active Queries</span>
          <span className="font-semibold text-white">
            {(stats.totalQueries || 0) - (stats.completedQueries || 0)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-300">Active Disputes</span>
          <span className="font-semibold text-white">
            {(stats.totalDisputes || 0) - (stats.completedDisputes || 0)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Completion Rate</span>
          <span className="font-semibold text-green-600">{completionRate}%</span>
        </div>

        <div className="pt-2 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Revenue</span>
            <span className="font-semibold text-gray-900">₹1,25,000</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Recent Activities Card Component
const RecentActivitiesCard = ({ activities = {} }) => {
  const recentQueries = activities.queries || [];
  const recentDisputes = activities.disputes || [];

  const allActivities = [
    ...recentQueries.map(q => ({ ...q, type: 'query' })),
    ...recentDisputes.map(d => ({ ...d, type: 'dispute' }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Activity className="h-5 w-5 mr-2 text-green-400" />
        Recent Activities
      </h3>

      <div className="space-y-4">
        {allActivities.length === 0 ? (
          <p className="text-gray-300 text-sm">No recent activities</p>
        ) : (
          allActivities.map((activity, index) => (
            <div key={`${activity.type}-${activity._id}`} className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200">
              <div className={`p-2 rounded-full ${
                activity.type === 'query' ? 'bg-blue-500/20' : 'bg-purple-500/20'
              }`}>
                {activity.type === 'query' ? (
                  <FileText className={`h-4 w-4 ${
                    activity.type === 'query' ? 'text-blue-400' : 'text-purple-400'
                  }`} />
                ) : (
                  <Scale className="h-4 w-4 text-purple-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">
                  New {activity.type} by {activity.citizen?.name || 'Unknown'}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(activity.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

// Monthly Stats Chart Component
const MonthlyStatsChart = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
        <PieChart className="h-5 w-5 mr-2 text-purple-400" />
        Monthly Case Statistics
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {data.map((month, index) => (
          <div key={index} className="text-center bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-200">
            <div className="text-sm font-medium text-gray-300 mb-3">{month.month}</div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-400">{month.queries}</div>
              <div className="text-xs text-gray-400">Queries</div>
              <div className="text-2xl font-bold text-purple-400">{month.disputes}</div>
              <div className="text-xs text-gray-400">Disputes</div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// Quick Action Card Component
const QuickActionCard = ({ title, description, icon: Icon, color, onClick }) => {
  const colorClasses = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    green: 'bg-green-500 hover:bg-green-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    orange: 'bg-orange-500 hover:bg-orange-600',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${colorClasses[color]} text-white p-6 rounded-lg shadow-lg cursor-pointer transition-colors`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className="h-8 w-8" />
        <ArrowRight className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm opacity-90">{description}</p>
    </motion.div>
  );
};

export default AdminDashboard;
