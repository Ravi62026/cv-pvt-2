import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  MessageCircle,
  Phone,
  Mail,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  UserPlus,
  Eye,
  Star
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { lawyerAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const LawyerClients = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error } = useToast();
  const [clients, setClients] = useState({
    direct: [],
    query: [],
    dispute: []
  });
  const [stats, setStats] = useState({
    totalClients: 0,
    directClients: 0,
    queryClients: 0,
    disputeClients: 0,
    newThisMonth: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    fetchAllClients();
  }, []);

  const fetchAllClients = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 UPDATED: Fetching clients with new API calls');
      // Fetch all types of clients in parallel
      const [directResponse, assignedCasesResponse] = await Promise.all([
        lawyerAPI.getMyConnectedCitizens(),
        lawyerAPI.getMyAssignedCases()
      ]);
      console.log('📊 UPDATED: API responses:', { directResponse, assignedCasesResponse });

      const allClients = {
        direct: [],
        query: [],
        dispute: []
      };

      // Process direct connections
      if (directResponse.success) {
        allClients.direct = (directResponse.data.connections || []).map(conn => ({
          ...conn.citizen,
          clientType: 'direct',
          connectedAt: conn.connectedAt,
          chatId: conn.chatId,
          status: 'connected'
        }));
      }

      // Process assigned cases (queries and disputes)
      if (assignedCasesResponse.success) {
        const cases = assignedCasesResponse.data.cases || [];

        cases.forEach(caseItem => {
          if (caseItem.citizen) {
            const clientData = {
              ...caseItem.citizen,
              clientType: caseItem.caseType,
              connectedAt: caseItem.createdAt,
              caseId: caseItem._id,
              caseTitle: caseItem.title,
              status: caseItem.status,
              chatRoom: caseItem.chatRoom
            };

            if (caseItem.caseType === 'query') {
              allClients.query.push(clientData);
            } else if (caseItem.caseType === 'dispute') {
              allClients.dispute.push(clientData);
            }
          }
        });
      }

      setClients(allClients);

      // Update stats
      setStats({
        totalClients: allClients.direct.length + allClients.query.length + allClients.dispute.length,
        directClients: allClients.direct.length,
        queryClients: allClients.query.length,
        disputeClients: allClients.dispute.length,
        newThisMonth: 0 // Calculate based on connectedAt dates if needed
      });

    } catch (err) {
      console.error('Error fetching clients:', err);
      error('Failed to load clients');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = (client) => {
    if (client.clientType === 'direct' && client.chatId) {
      // Direct client chat
      navigate(`/chat/${encodeURIComponent(client.chatId)}`);
    } else if (client.chatRoom && client.chatRoom.chatId) {
      // Case-based chat (query/dispute)
      navigate(`/chat/${encodeURIComponent(client.chatRoom.chatId)}`);
    } else if (client.caseId) {
      // Fallback: navigate to case page if no chat available
      navigate(`/${client.clientType}s/${client.caseId}`);
    } else {
      error('Chat not available for this client');
    }
  };

  // Get all clients as a flat array for filtering
  const getAllClients = () => {
    const allClients = [];
    Object.entries(clients).forEach(([type, typeClients]) => {
      if (Array.isArray(typeClients)) {
        allClients.push(...typeClients);
      }
    });
    return allClients;
  };

  const filteredClients = getAllClients().filter(client => {
    const matchesSearch = client.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.caseTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || client.clientType === selectedFilter;
    return matchesSearch && matchesFilter;
  });

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-3">
                My Clients 👥
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Manage and communicate with your clients
              </p>
            </div>
            <button
              onClick={() => navigate('/lawyer/pending-connection-requests')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center shadow-lg transition-all transform hover:scale-105"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Connection Requests
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Clients"
            value={stats.totalClients}
            icon={<Users className="h-8 w-8 text-blue-600" />}
            color="blue"
          />
          <StatsCard
            title="Direct Clients"
            value={stats.directClients}
            icon={<MessageCircle className="h-8 w-8 text-green-600" />}
            color="green"
          />
          <StatsCard
            title="Query Clients"
            value={stats.queryClients}
            icon={<FileText className="h-8 w-8 text-purple-600" />}
            color="purple"
          />
          <StatsCard
            title="Dispute Clients"
            value={stats.disputeClients}
            icon={<AlertCircle className="h-8 w-8 text-orange-600" />}
            color="orange"
          />
        </div>

        {/* Search and Filter */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="pl-10 pr-8 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Clients</option>
                <option value="direct">Direct Clients</option>
                <option value="query">Query Clients</option>
                <option value="dispute">Dispute Clients</option>
              </select>
            </div>
          </div>
        </div>

        {/* Clients Grid */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/20">
          <div className="p-6 border-b border-white/20">
            <h2 className="text-2xl font-bold text-white">Your Clients</h2>
            <p className="text-gray-300">Total: {filteredClients.length} clients</p>
          </div>

          <div className="p-6">
            {filteredClients.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gradient-to-r from-gray-500/20 to-blue-500/20 rounded-full p-6 w-24 h-24 mx-auto mb-6">
                  <Users className="h-12 w-12 text-gray-300 mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">No clients found</h3>
                <p className="text-gray-300">
                  {searchQuery || selectedFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Start connecting with clients to build your practice.'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClients.map((client, index) => (
                  <ClientCard
                    key={client._id}
                    client={client}
                    index={index}
                    onStartChat={handleStartChat}
                  />
                ))}
              </div>
            )}
          </div>
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
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} shadow-lg`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-400 mb-2">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </motion.div>
  );
};

// Client Card Component
const ClientCard = ({ client, index, onStartChat }) => {
  const getClientTypeColor = (type) => {
    switch (type) {
      case 'direct':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'query':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'dispute':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const getClientTypeIcon = (type) => {
    switch (type) {
      case 'direct':
        return <MessageCircle className="h-4 w-4" />;
      case 'query':
        return <FileText className="h-4 w-4" />;
      case 'dispute':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-white/30 hover:shadow-md transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3">
            {client.name?.charAt(0).toUpperCase() || 'C'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{client.name || 'Unknown Client'}</h3>
            <p className="text-sm text-gray-400">{client.email}</p>
          </div>
        </div>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getClientTypeColor(client.clientType)}`}>
          {getClientTypeIcon(client.clientType)}
          <span className="ml-1 capitalize">{client.clientType}</span>
        </span>
      </div>

      {/* Client Info */}
      <div className="space-y-2 mb-4">
        {client.phone && (
          <div className="flex items-center text-sm text-gray-300">
            <Phone className="h-4 w-4 mr-2 text-gray-400" />
            <span>{client.phone}</span>
          </div>
        )}
        <div className="flex items-center text-sm text-gray-300">
          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
          <span>
            Connected: {new Date(client.connectedAt || Date.now()).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </span>
        </div>
        {client.caseTitle && (
          <div className="flex items-center text-sm text-gray-300">
            <FileText className="h-4 w-4 mr-2 text-gray-400" />
            <span className="truncate">{client.caseTitle}</span>
          </div>
        )}
        {client.status && (
          <div className="flex items-center text-sm text-gray-300">
            <CheckCircle className="h-4 w-4 mr-2 text-gray-400" />
            <span className="capitalize">{client.status}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onStartChat(client)}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center text-sm transition-all"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Chat
        </button>
        <button
          className="p-2 bg-white/10 border border-white/20 rounded-lg text-gray-400 hover:text-white hover:bg-white/20 transition-all"
          title="View Profile"
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default LawyerClients;
