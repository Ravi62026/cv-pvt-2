import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  MessageCircle,
  FileText,
  Scale,
  CheckCircle,
  Search,
  UserPlus,
  BarChart3,
  Activity,
  ArrowRight,
  Send,
  Gift,
  Zap,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { citizenAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CallHistoryCard from '../components/dashboard/CallHistoryCard';
import CallNotificationWidget from '../components/dashboard/CallNotificationWidget';
import {
  ModernStatsCard,
  ModernActionCard,
  ModernSectionHeader,
  ModernDashboardLayout,
  ModernWelcomeHeader,
  ModernStatusCard,
  ModernGrid
} from '../components/dashboard/ModernDashboardComponents';

const CitizenDashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { error } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await citizenAPI.getDashboard();
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
    <ModernDashboardLayout>
      <ModernWelcomeHeader
        title={`Welcome back, ${user?.name}!`}
        subtitle="Manage your legal matters and connect with verified lawyers"
        statusCard={
          <ModernStatusCard
            title="Legal Support"
            subtitle="Available 24/7"
            icon={CheckCircle}
            color="blue"
          />
        }
      />

      {/* Primary Actions */}
      <ModernSectionHeader
        title="Quick Actions"
        subtitle="Get started with your legal needs"
        icon={Zap}
      />
      <ModernGrid cols="grid-cols-1 md:grid-cols-2" className="mb-12">
        <ModernActionCard
          title="Submit Legal Query"
          description="Get expert legal advice from verified lawyers for your questions"
          icon={FileText}
          onClick={() => navigate('/citizen/create-query')}
          color="blue"
          badge="24/7"
        />

        <ModernActionCard
          title="File Dispute"
          description="Resolve legal disputes with professional mediation and support"
          icon={Scale}
          onClick={() => navigate('/citizen/create-dispute')}
          color="red"
          badge="Expert"
        />
      </ModernGrid>

        {/* My Cases Card */}
        <div className="mb-8">
          <motion.div
            whileHover={{ scale: 1.01, y: -2 }}
            whileTap={{ scale: 0.99 }}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-700 p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => navigate('/citizen/my-cases')}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-transparent"></div>

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm mr-4">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    My Cases
                  </h3>
                  <p className="text-indigo-100">
                    View and manage all your queries & disputes
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </motion.div>
        </div>

        {/* Secondary Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {/* Find Lawyers */}
            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-green-400/50 transition-all duration-300 cursor-pointer group"
              onClick={() => navigate('/citizen/find-lawyers')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-green-500/20 rounded-lg backdrop-blur-sm border border-green-400/30">
                  <Search className="h-5 w-5 text-green-400" />
                </div>
                <ArrowRight className="h-4 w-4 text-white/60 group-hover:text-green-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <h3 className="font-semibold text-white mb-2">Find Lawyers</h3>
              <p className="text-sm text-gray-300">Browse verified legal professionals</p>
            </motion.div>

            {/* Connected Lawyers */}
            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-purple-400/50 transition-all duration-300 cursor-pointer group"
              onClick={() => navigate('/citizen/connected-lawyers')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-purple-500/20 rounded-lg backdrop-blur-sm border border-purple-400/30">
                  <UserPlus className="h-5 w-5 text-purple-400" />
                </div>
                <ArrowRight className="h-4 w-4 text-white/60 group-hover:text-purple-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <h3 className="font-semibold text-white mb-2">Connected Lawyers</h3>
              <p className="text-sm text-gray-300">View your legal connections</p>
            </motion.div>

            {/* My Case Requests */}
            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-blue-400/50 transition-all duration-300 cursor-pointer group"
              onClick={() => navigate('/citizen/my-case-requests')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-blue-500/20 rounded-lg backdrop-blur-sm border border-blue-400/30">
                  <Send className="h-5 w-5 text-blue-400" />
                </div>
                <ArrowRight className="h-4 w-4 text-white/60 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <h3 className="font-semibold text-white mb-2">My Requests</h3>
              <p className="text-sm text-gray-300">Requests sent to lawyers</p>
            </motion.div>

            {/* My Case Offers */}
            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-indigo-400/50 transition-all duration-300 cursor-pointer group"
              onClick={() => navigate('/citizen/my-case-offers')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-indigo-500/20 rounded-lg backdrop-blur-sm border border-indigo-400/30">
                  <Gift className="h-5 w-5 text-indigo-400" />
                </div>
                <ArrowRight className="h-4 w-4 text-white/60 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <h3 className="font-semibold text-white mb-2">Offers Received</h3>
              <p className="text-sm text-gray-300">Lawyers offering help</p>
            </motion.div>

            {/* My Queries */}
            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-orange-400/50 transition-all duration-300 cursor-pointer group"
              onClick={() => navigate('/citizen/my-queries')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-orange-500/20 rounded-lg backdrop-blur-sm border border-orange-400/30">
                  <MessageCircle className="h-5 w-5 text-orange-400" />
                </div>
                <ArrowRight className="h-4 w-4 text-white/60 group-hover:text-orange-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <h3 className="font-semibold text-white mb-2">My Queries</h3>
              <p className="text-sm text-gray-300">Manage legal questions</p>
            </motion.div>
          </div>
        </div>

      {/* Stats Overview */}
      <ModernSectionHeader
        title="Your Overview"
        action="Last updated: just now"
        icon={BarChart3}
      />
      <ModernGrid cols="grid-cols-1 md:grid-cols-2 lg:grid-cols-4" className="mb-12">
        <ModernStatsCard
          title="Total Cases"
          value={stats?.totalCases || 0}
          icon={FileText}
          color="blue"
          trend="+12%"
          subtitle="all time"
        />

        <ModernStatsCard
          title="Active Cases"
          value={stats?.activeCases || 0}
          icon={Activity}
          color="green"
          trend="+8%"
          subtitle="in progress"
        />
        <ModernStatsCard
          title="Connected Lawyers"
          value={stats?.connectedLawyers || 0}
          icon={Users}
          color="purple"
          trend="+15%"
          subtitle="verified"
        />
        <ModernStatsCard
          title="Success Rate"
          value="94%"
          icon={CheckCircle}
          color="orange"
          trend="+2%"
          subtitle="case resolution"
        />
      </ModernGrid>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivitySection />
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <QuickStatsCard stats={stats} />
          <CallHistoryCard limit={5} />
          <RecentConnectionsCard />
        </div>
      </div>

      {/* Call Notification Widget */}
      <CallNotificationWidget />
    </ModernDashboardLayout>
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
            Your recent cases and lawyer interactions will appear here
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
        Quick Stats
      </h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-300">Resolved Cases</span>
          <span className="font-semibold text-green-400">{stats?.resolvedCases || 0}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-300">Received Offers</span>
          <span className="font-semibold text-blue-400">{stats?.receivedOffers || 0}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-300">Success Rate</span>
          <span className="font-semibold text-purple-400">95%</span>
        </div>
      </div>
    </motion.div>
  );
};

// Recent Connections Card
const RecentConnectionsCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Users className="h-5 w-5 mr-2 text-green-400" />
        Recent Connections
      </h3>
      <div className="text-center py-4">
        <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-300">No recent connections</p>
        <p className="text-xs text-gray-400 mt-1">
          Connect with lawyers to see them here
        </p>
      </div>
    </motion.div>
  );
};

export default CitizenDashboard;
