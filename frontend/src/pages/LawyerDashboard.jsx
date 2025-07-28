import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  MessageCircle,
  FileText,
  Scale,
  TrendingUp,
  Clock,
  CheckCircle,
  UserCheck,
  MessageSquare,
  Inbox,
  BarChart3,
  Activity,
  ArrowRight,
  Award,
  DollarSign,
  Bot,
  FolderOpen,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { lawyerAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';


const LawyerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await lawyerAPI.getDashboardStats();
      if (response.success) {
        setStats(response.data);
      } else {
        error('Failed to load dashboard data');
      }
    } catch (err) {
      error('Failed to load dashboard data');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950/80 relative overflow-hidden p-6">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/8 to-gray-500/12 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-gray-500/10 to-blue-500/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-500/5 to-gray-500/10 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.name}
          </h1>
          <p className="text-gray-300">
            Manage your clients and legal practice efficiently
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <QuickActionCard
            title="AI Legal Tools"
            description="Access AI-powered legal assistance"
            icon={Bot}
            color="blue"
            onClick={() => navigate('/ai-tools')}
          />
          <QuickActionCard
            title="Documents"
            description="Manage your legal documents"
            icon={FolderOpen}
            color="green"
            onClick={() => navigate('/documents')}
          />
          <QuickActionCard
            title="Incoming Requests"
            description="Review connection requests"
            icon={Inbox}
            color="purple"
            onClick={() => navigate('/lawyer/incoming-requests')}
          />
          <QuickActionCard
            title="Connected Clients"
            description="View your clients"
            icon={UserCheck}
            color="orange"
            onClick={() => navigate('/lawyer/connected-clients')}
          />
          <QuickActionCard
            title="Direct Chats"
            description="Message your clients"
            icon={MessageSquare}
            color="blue"
            onClick={() => navigate('/lawyer/direct-chats')}
          />
          <QuickActionCard
            title="My Cases"
            description="Manage assigned cases"
            icon={FileText}
            color="green"
            onClick={() => navigate('/lawyer/my-cases')}
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Clients"
            value={stats?.totalClients || 0}
            icon={Users}
            color="blue"
            trend="+12%"
          />
          <StatsCard
            title="Active Cases"
            value={stats?.activeCases || 0}
            icon={Activity}
            color="green"
            trend="+8%"
          />
          <StatsCard
            title="Resolved Cases"
            value={stats?.resolvedCases || 0}
            icon={CheckCircle}
            color="purple"
            trend="+15%"
          />
          <StatsCard
            title="Success Rate"
            value="95%"
            icon={Award}
            color="orange"
            trend="+2%"
          />
        </div>

        {/* Quick Access */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {/* Incoming Requests */}
            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-blue-400/50 transition-all duration-300 cursor-pointer group"
              onClick={() => navigate('/lawyer/incoming-requests')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-blue-500/20 rounded-lg backdrop-blur-sm border border-blue-400/30">
                  <Inbox className="h-5 w-5 text-blue-400" />
                </div>
                <ArrowRight className="h-4 w-4 text-white/60 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <h3 className="font-semibold text-white mb-2">Incoming Requests</h3>
              <p className="text-sm text-gray-300">Review connection requests</p>
            </motion.div>

            {/* Connected Clients */}
            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-green-400/50 transition-all duration-300 cursor-pointer group"
              onClick={() => navigate('/lawyer/connected-clients')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-green-500/20 rounded-lg backdrop-blur-sm border border-green-400/30">
                  <UserCheck className="h-5 w-5 text-green-400" />
                </div>
                <ArrowRight className="h-4 w-4 text-white/60 group-hover:text-green-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <h3 className="font-semibold text-white mb-2">Connected Clients</h3>
              <p className="text-sm text-gray-300">View your clients</p>
            </motion.div>

            {/* Direct Chats */}
            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-purple-400/50 transition-all duration-300 cursor-pointer group"
              onClick={() => navigate('/lawyer/direct-chats')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-purple-500/20 rounded-lg backdrop-blur-sm border border-purple-400/30">
                  <MessageSquare className="h-5 w-5 text-purple-400" />
                </div>
                <ArrowRight className="h-4 w-4 text-white/60 group-hover:text-purple-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <h3 className="font-semibold text-white mb-2">Direct Chats</h3>
              <p className="text-sm text-gray-300">Message your clients</p>
            </motion.div>

            {/* My Cases */}
            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-orange-400/50 transition-all duration-300 cursor-pointer group"
              onClick={() => navigate('/lawyer/my-cases')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-orange-500/20 rounded-lg backdrop-blur-sm border border-orange-400/30">
                  <FileText className="h-5 w-5 text-orange-400" />
                </div>
                <ArrowRight className="h-4 w-4 text-white/60 group-hover:text-orange-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <h3 className="font-semibold text-white mb-2">My Cases</h3>
              <p className="text-sm text-gray-300">Manage assigned cases</p>
            </motion.div>

            {/* Case Documents */}
            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-indigo-400/50 transition-all duration-300 cursor-pointer group"
              onClick={() => navigate('/lawyer/case-documents')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-indigo-500/20 rounded-lg backdrop-blur-sm border border-indigo-400/30">
                  <FolderOpen className="h-5 w-5 text-indigo-400" />
                </div>
                <ArrowRight className="h-4 w-4 text-white/60 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <h3 className="font-semibold text-white mb-2">Case Documents</h3>
              <p className="text-sm text-gray-300">Access case files</p>
            </motion.div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <RecentActivitySection />
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <QuickStatsCard stats={stats} />

            <RecentClientsCard />
          </div>
        </div>
      </div>


    </div>
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

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color, trend }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-4 flex items-center">
        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
        <span className="text-sm text-green-600 font-medium">{trend}</span>
        <span className="text-sm text-gray-500 ml-1">from last month</span>
      </div>
    </motion.div>
  );
};

// Recent Activity Section
const RecentActivitySection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-lg border border-white/20"
    >
      <div className="p-6 border-b border-white/20">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Activity className="h-5 w-5 mr-2 text-blue-400" />
          Recent Activity
        </h2>
      </div>
      <div className="p-6">
        <div className="text-center py-8">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-300">No recent activity</p>
          <p className="text-sm text-gray-400 mt-2">
            Your recent cases and client interactions will appear here
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// Quick Stats Card
const QuickStatsCard = ({ stats }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <BarChart3 className="h-5 w-5 mr-2 text-blue-400" />
        Performance Stats
      </h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-300">Total Cases</span>
          <span className="font-semibold text-blue-400">{stats?.totalCases || 0}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-300">Client Satisfaction</span>
          <span className="font-semibold text-green-400">98%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-300">Response Time</span>
          <span className="font-semibold text-purple-400">&lt; 2 hours</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-300">Monthly Revenue</span>
          <span className="font-semibold text-orange-400">₹45,000</span>
        </div>
      </div>
    </motion.div>
  );
};

// Recent Clients Card
const RecentClientsCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Users className="h-5 w-5 mr-2 text-green-400" />
        Recent Clients
      </h3>
      <div className="text-center py-4">
        <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-300">No recent clients</p>
        <p className="text-xs text-gray-400 mt-1">
          New client connections will appear here
        </p>
      </div>
    </motion.div>
  );
};

export default LawyerDashboard;
