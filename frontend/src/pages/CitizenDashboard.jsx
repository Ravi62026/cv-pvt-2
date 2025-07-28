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
  Brain,
  Cpu,
  BookOpen,
  Gavel,
  Bot,
  FolderOpen,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useSocket, useSocketEvent } from '../hooks/useSocket';
import { citizenAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

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
  const { socket } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Real-time updates for dashboard stats
  useSocketEvent('dashboard_stats_updated', (updatedStats) => {
    console.log('📊 Real-time stats update:', updatedStats);
    setStats(prev => ({ ...prev, ...updatedStats }));
  }, []);

  // Real-time updates for new activities
  useSocketEvent('new_activity', (activityData) => {
    console.log('🔔 New activity:', activityData);
    // Trigger refresh of dashboard data to get updated stats
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

      {/* Quick Actions */}
      <QuickActionsSection />

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
              className="bg-gradient-to-br from-green-500/20 via-emerald-500/15 to-green-600/10 backdrop-blur-sm rounded-xl p-6 border border-green-400/30 hover:border-green-400/60 transition-all duration-300 cursor-pointer group shadow-lg hover:shadow-green-500/20"
              onClick={() => navigate('/citizen/find-lawyers')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-green-500/30 rounded-lg backdrop-blur-sm border border-green-400/40">
                  <Search className="h-5 w-5 text-green-300" />
                </div>
                <ArrowRight className="h-4 w-4 text-white/60 group-hover:text-green-300 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <h3 className="font-semibold text-white mb-2">Find Lawyers</h3>
              <p className="text-sm text-gray-300">Browse verified legal professionals</p>
            </motion.div>

            {/* Connected Lawyers */}
            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-purple-500/20 via-violet-500/15 to-purple-600/10 backdrop-blur-sm rounded-xl p-6 border border-purple-400/30 hover:border-purple-400/60 transition-all duration-300 cursor-pointer group shadow-lg hover:shadow-purple-500/20"
              onClick={() => navigate('/citizen/connected-lawyers')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-purple-500/30 rounded-lg backdrop-blur-sm border border-purple-400/40">
                  <UserPlus className="h-5 w-5 text-purple-300" />
                </div>
                <ArrowRight className="h-4 w-4 text-white/60 group-hover:text-purple-300 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <h3 className="font-semibold text-white mb-2">Connected Lawyers</h3>
              <p className="text-sm text-gray-300">View your legal connections</p>
            </motion.div>

            {/* My Case Requests */}
            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-blue-500/20 via-cyan-500/15 to-blue-600/10 backdrop-blur-sm rounded-xl p-6 border border-blue-400/30 hover:border-blue-400/60 transition-all duration-300 cursor-pointer group shadow-lg hover:shadow-blue-500/20"
              onClick={() => navigate('/citizen/my-case-requests')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-blue-500/30 rounded-lg backdrop-blur-sm border border-blue-400/40">
                  <Send className="h-5 w-5 text-blue-300" />
                </div>
                <ArrowRight className="h-4 w-4 text-white/60 group-hover:text-blue-300 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <h3 className="font-semibold text-white mb-2">My Requests</h3>
              <p className="text-sm text-gray-300">Requests sent to lawyers</p>
            </motion.div>

            {/* My Case Offers */}
            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-indigo-500/20 via-blue-500/15 to-indigo-600/10 backdrop-blur-sm rounded-xl p-6 border border-indigo-400/30 hover:border-indigo-400/60 transition-all duration-300 cursor-pointer group shadow-lg hover:shadow-indigo-500/20"
              onClick={() => navigate('/citizen/my-case-offers')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-indigo-500/30 rounded-lg backdrop-blur-sm border border-indigo-400/40">
                  <Gift className="h-5 w-5 text-indigo-300" />
                </div>
                <ArrowRight className="h-4 w-4 text-white/60 group-hover:text-indigo-300 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <h3 className="font-semibold text-white mb-2">Offers Received</h3>
              <p className="text-sm text-gray-300">Lawyers offering help</p>
            </motion.div>

            {/* My Queries */}
            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-orange-500/20 via-amber-500/15 to-orange-600/10 backdrop-blur-sm rounded-xl p-6 border border-orange-400/30 hover:border-orange-400/60 transition-all duration-300 cursor-pointer group shadow-lg hover:shadow-orange-500/20"
              onClick={() => navigate('/citizen/my-queries')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-orange-500/30 rounded-lg backdrop-blur-sm border border-orange-400/40">
                  <MessageCircle className="h-5 w-5 text-orange-300" />
                </div>
                <ArrowRight className="h-4 w-4 text-white/60 group-hover:text-orange-300 group-hover:translate-x-1 transition-all duration-300" />
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

      {/* AI Tools Section */}
      <AIToolsSection />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivitySection />
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <QuickStatsCard stats={stats} />
        </div>
      </div>


    </ModernDashboardLayout>
  );
};



// Recent Activity Section
const RecentActivitySection = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  // Real-time updates for new activities
  useSocketEvent('new_activity', (activityData) => {
    console.log('🔔 New activity for recent section:', activityData);
    // Add new activity to the beginning of the list and keep only 5
    setActivities(prev => [activityData, ...prev.slice(0, 4)]);
  }, []);

  // Real-time updates for activity status changes
  useSocketEvent('activity_status_updated', (updateData) => {
    console.log('📝 Activity status updated:', updateData);
    setActivities(prev => prev.map(activity =>
      activity.id === updateData.activityId
        ? { ...activity, status: updateData.newStatus }
        : activity
    ));
  }, []);

  const fetchRecentActivity = async () => {
    try {
      const token = localStorage.getItem('cv_access_token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fluent-music-374010.el.r.appspot.com/api';
      const response = await fetch(`${API_BASE_URL}/citizens/recent-activity?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(data.data.activities);
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'assigned': return 'text-blue-400';
      case 'in-progress': return 'text-purple-400';
      case 'resolved': return 'text-green-400';
      case 'closed': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'query': return FileText;
      case 'dispute': return Scale;
      case 'connection': return Users;
      default: return Activity;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'query': return 'from-blue-500 to-cyan-500';
      case 'dispute': return 'from-orange-500 to-red-500';
      case 'connection': return 'from-green-500 to-emerald-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return time.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/20"
    >
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center">
          <Activity className="h-6 w-6 text-blue-400 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
            <p className="text-gray-300">Your latest case updates and interactions</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading recent activity...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300">No recent activity</p>
            <p className="text-sm text-gray-400 mt-2">
              Your recent cases and lawyer interactions will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const IconComponent = getTypeIcon(activity.type);
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:from-white/10 hover:to-white/15 transition-all duration-300"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 bg-gradient-to-r ${getTypeColor(activity.type)} rounded-lg flex items-center justify-center`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-white truncate">
                          {activity.title}
                        </h4>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>

                      <p className="text-sm text-gray-300 mt-1">
                        {activity.description}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs font-medium ${getStatusColor(activity.status)} capitalize`}>
                          {activity.status}
                        </span>

                        {activity.assignedLawyer && (
                          <span className="text-xs text-gray-400">
                            Lawyer: {activity.assignedLawyer.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Quick Stats Card
const QuickStatsCard = ({ stats }) => {
  const { socket } = useSocket();
  const [localStats, setLocalStats] = useState(stats);
  const [isUpdating, setIsUpdating] = useState(false);

  // Update local stats when props change
  useEffect(() => {
    setLocalStats(stats);
  }, [stats]);

  // Real-time updates for quick stats
  useSocketEvent('quick_stats_updated', (updatedStats) => {
    console.log('📊 Quick stats updated:', updatedStats);
    setIsUpdating(true);
    setLocalStats(prev => ({ ...prev, ...updatedStats }));

    // Remove updating indicator after animation
    setTimeout(() => setIsUpdating(false), 1000);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-6 transition-all duration-300 ${
        isUpdating ? 'ring-2 ring-blue-400/50 shadow-lg shadow-blue-400/20' : ''
      }`}
    >
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-blue-400" />
          Quick Stats
        </div>
        {isUpdating && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-2 h-2 bg-green-400 rounded-full"
          />
        )}
      </h3>
      <div className="space-y-4">
        <motion.div
          className="flex justify-between items-center"
          animate={isUpdating ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <span className="text-sm text-gray-300">Total Cases</span>
          <span className="font-semibold text-blue-400">{localStats?.totalCases || 0}</span>
        </motion.div>
        <motion.div
          className="flex justify-between items-center"
          animate={isUpdating ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <span className="text-sm text-gray-300">Active Cases</span>
          <span className="font-semibold text-orange-400">{localStats?.activeCases || 0}</span>
        </motion.div>
        <motion.div
          className="flex justify-between items-center"
          animate={isUpdating ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <span className="text-sm text-gray-300">Resolved Cases</span>
          <span className="font-semibold text-green-400">{localStats?.resolvedCases || 0}</span>
        </motion.div>
        <motion.div
          className="flex justify-between items-center"
          animate={isUpdating ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <span className="text-sm text-gray-300">Connected Lawyers</span>
          <span className="font-semibold text-purple-400">{localStats?.connectedLawyers || 0}</span>
        </motion.div>
        <motion.div
          className="flex justify-between items-center"
          animate={isUpdating ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <span className="text-sm text-gray-300">Pending Requests</span>
          <span className="font-semibold text-yellow-400">{localStats?.pendingRequests || 0}</span>
        </motion.div>
      </div>
    </motion.div>
  );
};


// Quick Actions Section
const QuickActionsSection = () => {
  const navigate = useNavigate();

  const quickActionItems = [
    {
      title: 'AI Legal Tools',
      description: 'Access AI-powered legal assistance and guidance',
      icon: Bot,
      path: '/ai-tools',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-500/20 to-cyan-500/10',
    },
    {
      title: 'Documents',
      description: 'Manage and organize your legal documents',
      icon: FolderOpen,
      path: '/citizen/documents',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-500/20 to-pink-500/10',
    },
    {
      title: 'Submit Legal Query',
      description: 'Get expert legal advice from verified lawyers for your questions',
      icon: FileText,
      path: '/citizen/create-query',
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-500/20 to-red-500/10',
    },
    {
      title: 'File Dispute',
      description: 'Resolve legal disputes with professional mediation and support',
      icon: Scale,
      path: '/citizen/create-dispute',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-500/20 to-emerald-500/10',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-12"
    >
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/20">
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center">
            <Zap className="h-6 w-6 text-blue-400 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
              <p className="text-gray-300">Get started with your legal needs</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActionItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => navigate(item.path)}
                  className={`bg-gradient-to-br ${item.bgColor} backdrop-blur-sm border border-white/10 rounded-xl p-6 cursor-pointer hover:scale-105 transition-all duration-300 group`}
                >
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${item.color} mb-4`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-gray-300 text-sm leading-relaxed mb-4">
                    {item.description}
                  </p>

                  <div className="flex items-center text-blue-400 text-sm font-medium group-hover:text-blue-300 transition-colors">
                    <span>Available Now</span>
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// AI Tools Section
const AIToolsSection = () => {
  const navigate = useNavigate();

  const aiTools = [
    {
      title: 'BNS Advisor',
      description: 'Get instant guidance on Bharatiya Nyaya Sanhita provisions',
      icon: BookOpen,
      path: '/ai-tools/bns-advisor',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-500/20 to-cyan-500/10',
    },
    {
      title: 'Legal Advisor',
      description: 'AI-powered legal consultation and advice',
      icon: Brain,
      path: '/ai-tools/legal-advisor',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-500/20 to-pink-500/10',
    },
    {
      title: 'Judgment Analyzer',
      description: 'Analyze and understand court judgments',
      icon: Gavel,
      path: '/ai-tools/judgment-analyzer',
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-500/20 to-red-500/10',
    },
    {
      title: 'Legal Research',
      description: 'Research legal cases and precedents',
      icon: Search,
      path: '/ai-tools/legal-research',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-500/20 to-emerald-500/10',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-12"
    >
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/20">
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Cpu className="h-6 w-6 text-blue-400 mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-white">AI Legal Tools</h2>
                <p className="text-gray-300">Powered by advanced AI to assist with your legal needs</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-lg px-4 py-2">
              <p className="text-blue-300 text-sm font-medium">
                📚 Students: Use BNS Advisor & Legal Research tools for free!
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Student Information Banner */}
          <div className="mb-6 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-400/30 rounded-xl p-4">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-500 p-2 rounded-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">📚 For Students & Researchers</h3>
                <p className="text-blue-200 text-sm mb-3">
                  Access our AI-powered legal tools for free! Perfect for law students, researchers, and academic purposes.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-500/30 text-blue-200 px-3 py-1 rounded-full text-xs">
                    ✅ BNS Advisor - Free Access
                  </span>
                  <span className="bg-green-500/30 text-green-200 px-3 py-1 rounded-full text-xs">
                    ✅ Legal Research - Free Access
                  </span>
                  <span className="bg-purple-500/30 text-purple-200 px-3 py-1 rounded-full text-xs">
                    🔜 Student Dashboard Coming Soon
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {aiTools.map((tool, index) => {
              const IconComponent = tool.icon;
              return (
                <motion.div
                  key={tool.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => navigate(tool.path)}
                  className={`bg-gradient-to-br ${tool.bgColor} backdrop-blur-sm border border-white/10 rounded-xl p-6 cursor-pointer hover:scale-105 transition-all duration-300 group`}
                >
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${tool.color} mb-4`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                    {tool.title}
                  </h3>

                  <p className="text-gray-300 text-sm leading-relaxed mb-4">
                    {tool.description}
                  </p>

                  <div className="flex items-center text-blue-400 text-sm font-medium group-hover:text-blue-300 transition-colors">
                    <span>Try Now</span>
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CitizenDashboard;
