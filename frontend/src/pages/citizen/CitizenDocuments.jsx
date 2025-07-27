import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Folder,
  Calendar,
  User,
  Scale
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { documentAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CitizenDocuments = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [documents, setDocuments] = useState({ direct: {}, query: {}, dispute: {} });
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await documentAPI.getUserDocuments();
      if (response.success) {
        setDocuments(response.data.documents || {});
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await documentAPI.getDocumentStats();
      if (response.success) {
        setStats(response.data.stats || response.data || {});
      }
    } catch (err) {
      console.error('Error fetching document stats:', err);
    }
  };

  const getAllDocuments = () => {
    const allDocs = [];
    if (documents && typeof documents === 'object') {
      Object.entries(documents).forEach(([type, typeDocuments]) => {
        if (typeDocuments && typeof typeDocuments === 'object') {
          Object.entries(typeDocuments).forEach(([relatedId, docs]) => {
            if (docs && docs.documents && Array.isArray(docs.documents)) {
              docs.documents.forEach(doc => {
                allDocs.push({ ...doc, type, relatedId });
              });
            }
          });
        }
      });
    }
    return allDocs;
  };

  const filteredDocuments = getAllDocuments().filter(doc => {
    const matchesSearch = doc.originalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || doc.type === selectedType;
    return matchesSearch && matchesType;
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
                Document Repository 📁
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Manage and access all your legal documents
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Documents"
              value={stats.totalDocuments || 0}
              icon={<FileText className="h-8 w-8 text-blue-600" />}
              color="blue"
            />
            <StatsCard
              title="Direct Consultations"
              value={Object.keys(documents.direct).length}
              icon={<User className="h-8 w-8 text-green-600" />}
              color="green"
            />
            <StatsCard
              title="Query Cases"
              value={Object.keys(documents.query).length}
              icon={<FileText className="h-8 w-8 text-purple-600" />}
              color="purple"
            />
            <StatsCard
              title="Dispute Cases"
              value={Object.keys(documents.dispute).length}
              icon={<Scale className="h-8 w-8 text-orange-600" />}
              color="orange"
            />
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="pl-10 pr-8 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em'
                }}
              >
                <option value="all" className="bg-gray-800 text-white">All Types</option>
                <option value="direct" className="bg-gray-800 text-white">Direct Consultations</option>
                <option value="query" className="bg-gray-800 text-white">Query Cases</option>
                <option value="dispute" className="bg-gray-800 text-white">Dispute Cases</option>
              </select>
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/20">
          <div className="p-6 border-b border-white/20">
            <h2 className="text-2xl font-bold text-white">Your Documents</h2>
            <p className="text-gray-300">Total: {filteredDocuments.length} documents</p>
          </div>

          <div className="p-6">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gradient-to-r from-gray-500/20 to-blue-500/20 rounded-full p-6 w-24 h-24 mx-auto mb-6">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">No documents found</h3>
                <p className="text-gray-300">
                  {searchQuery || selectedType !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'No documents available yet.'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDocuments.map((doc, index) => (
                  <DocumentCard
                    key={doc._id}
                    document={doc}
                    index={index}
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

// Document Card Component
const DocumentCard = ({ document, index }) => {
  const getTypeColor = (type) => {
    switch (type) {
      case 'direct': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'query': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'dispute': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'direct': return <User className="h-4 w-4" />;
      case 'query': return <FileText className="h-4 w-4" />;
      case 'dispute': return <Scale className="h-4 w-4" />;
      default: return <Folder className="h-4 w-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-white/30 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(document.type)}`}>
          {getTypeIcon(document.type)}
          <span className="ml-1 capitalize">{document.type}</span>
        </span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.open(document.url, '_blank')}
            className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
            title="View Document"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => window.open(document.url, '_blank')}
            className="p-1 text-gray-400 hover:text-green-400 transition-colors"
            title="Download Document"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      <h3 className="text-sm font-bold text-white mb-2 line-clamp-2">
        {document.originalName}
      </h3>

      {document.description && (
        <p className="text-gray-300 text-xs leading-relaxed line-clamp-2 mb-3">
          {document.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          <span>
            {new Date(document.uploadedAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {document.sizeFormatted || ((document.size || 0) / 1024 / 1024).toFixed(2) + ' MB'}
        </span>
      </div>
    </motion.div>
  );
};

export default CitizenDocuments;
