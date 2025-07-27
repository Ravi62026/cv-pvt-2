import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  FileText,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  Users,
  Award,
  BarChart3,
  PieChart,
  Activity,
  Target
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { lawyerAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const LawyerPerformance = () => {
  const { user } = useAuth();
  const { error } = useToast();
  const [stats, setStats] = useState({
    totalCases: 0,
    activeCases: 0,
    completedCases: 0,
    pendingRequests: 0,
    totalEarnings: 0,
    successRate: 0,
    avgCaseTime: 0,
    clientSatisfaction: 0
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    setIsLoading(true);
    try {
      const response = await lawyerAPI.getDashboardStats();
      if (response.success) {
        setStats({
          ...response.data,
          totalEarnings: response.data.totalEarnings || 0,
          successRate: response.data.successRate || 85,
          avgCaseTime: response.data.avgCaseTime || 15,
          clientSatisfaction: response.data.clientSatisfaction || 4.5
        });
      }
    } catch (err) {
      console.error('Error fetching performance data:', err);
      error('Failed to load performance data');
    } finally {
      setIsLoading(false);
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
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-8 relative z-10">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">
            Performance Dashboard 📊
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            Track your legal practice performance and analytics
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <MetricCard
            title="Total Cases"
            value={stats.totalCases}
            icon={<FileText className="h-8 w-8 text-blue-600" />}
            color="blue"
            trend="+12%"
          />
          <MetricCard
            title="Success Rate"
            value={`${stats.successRate}%`}
            icon={<Award className="h-8 w-8 text-green-600" />}
            color="green"
            trend="+5%"
          />
          <MetricCard
            title="Active Cases"
            value={stats.activeCases}
            icon={<Activity className="h-8 w-8 text-orange-600" />}
            color="orange"
            trend="+8%"
          />
          <MetricCard
            title="Client Rating"
            value={`${stats.clientSatisfaction}/5`}
            icon={<Users className="h-8 w-8 text-purple-600" />}
            color="purple"
            trend="+0.2"
          />
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Case Distribution */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
            <div className="flex items-center mb-6">
              <PieChart className="h-6 w-6 text-blue-400 mr-3" />
              <h3 className="text-xl font-bold text-white">Case Distribution</h3>
            </div>
            <div className="space-y-4">
              <CaseTypeBar label="Completed Cases" value={stats.completedCases} total={stats.totalCases} color="green" />
              <CaseTypeBar label="Active Cases" value={stats.activeCases} total={stats.totalCases} color="blue" />
              <CaseTypeBar label="Pending Requests" value={stats.pendingRequests} total={stats.totalCases} color="orange" />
            </div>
          </div>

          {/* Monthly Performance */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
            <div className="flex items-center mb-6">
              <BarChart3 className="h-6 w-6 text-purple-400 mr-3" />
              <h3 className="text-xl font-bold text-white">Monthly Trends</h3>
            </div>
            <div className="text-center py-8">
              <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300">Monthly performance chart coming soon</p>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AdditionalMetricCard
            title="Average Case Duration"
            value={`${stats.avgCaseTime} days`}
            icon={<Clock className="h-6 w-6 text-blue-400" />}
            description="Time to resolve cases"
          />
          <AdditionalMetricCard
            title="Total Earnings"
            value={`₹${stats.totalEarnings?.toLocaleString() || '0'}`}
            icon={<DollarSign className="h-6 w-6 text-green-400" />}
            description="This month"
          />
          <AdditionalMetricCard
            title="Response Time"
            value="< 2 hours"
            icon={<Target className="h-6 w-6 text-purple-400" />}
            description="Average response time"
          />
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, icon, color, trend }) => {
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
          {icon}
        </div>
        <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
          <TrendingUp className="h-3 w-3" />
          <span>{trend}</span>
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

// Case Type Bar Component
const CaseTypeBar = ({ label, value, total, color }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const colorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    orange: 'bg-orange-500',
  };

  return (
    <div>
      <div className="flex justify-between text-sm text-gray-300 mb-2">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${colorClasses[color]} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

// Additional Metric Card Component
const AdditionalMetricCard = ({ title, value, icon, description }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20"
    >
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-lg bg-white/10 mr-3">
          {icon}
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white">{title}</h4>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </motion.div>
  );
};

export default LawyerPerformance;
