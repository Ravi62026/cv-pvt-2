import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Folder,
  Download,
  Eye,
  Calendar,
  User,
  Search,
  Filter,
  Upload,
  Trash2,
  ExternalLink,
  FolderOpen
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DocumentRepository = () => {
  const [documents, setDocuments] = useState({ direct: {}, query: {}, dispute: {} });
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { user, getToken } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && getToken()) {
      fetchDocuments();
      fetchStats();
    }
  }, [user]);

  const fetchDocuments = async () => {
    try {
      const token = getToken();
      if (!token) {
        error('Please log in to view documents');
        return;
      }

      const response = await fetch('/api/documents/repository/my-documents', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.data.documents);
      } else {
        error('Failed to fetch documents');
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      error('Failed to fetch documents');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = getToken();
      if (!token) {
        return;
      }

      const response = await fetch('/api/documents/stats/overview', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleViewDocument = (document) => {
    // Use masked URL if we have IPFS hash, otherwise fallback to original URL
    const url = document.ipfsHash
      ? `/api/chats/file/${document.ipfsHash}`
      : document.url;
    console.log('🔗 Opening document with masked URL:', url);
    window.open(url, '_blank');
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        error('Please log in to delete documents');
        return;
      }

      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        success('Document deleted successfully');
        fetchDocuments();
        fetchStats();
      } else {
        error('Failed to delete document');
      }
    } catch (err) {
      console.error('Error deleting document:', err);
      error('Failed to delete document');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    return '📎';
  };

  const DocumentCard = ({ document, type, relatedId }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-4 hover:border-white/30 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <span className="text-2xl mr-3">{getDocumentIcon(document.mimeType)}</span>
          <div>
            <h4 className="text-white font-medium text-sm truncate max-w-[200px]">
              {document.originalName}
            </h4>
            <p className="text-gray-400 text-xs">
              {formatFileSize(document.size)} • {new Date(document.uploadedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewDocument(document)}
            className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
            title="View Document"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              const url = document.ipfsHash
                ? `/api/chats/file/${document.ipfsHash}`
                : document.url;
              window.open(url, '_blank');
            }}
            className="p-1 text-green-400 hover:text-green-300 transition-colors"
            title="Open in New Tab"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
          {document.uploadedBy._id === user.id && (
            <button
              onClick={() => handleDeleteDocument(document._id)}
              className="p-1 text-red-400 hover:text-red-300 transition-colors"
              title="Delete Document"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      
      {document.description && (
        <p className="text-gray-300 text-xs mb-2 line-clamp-2">
          {document.description}
        </p>
      )}
      
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">
          By {document.uploadedBy.name}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          document.documentCategory === 'evidence' ? 'bg-red-500/20 text-red-400' :
          document.documentCategory === 'contract' ? 'bg-blue-500/20 text-blue-400' :
          document.documentCategory === 'legal_notice' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-gray-500/20 text-gray-400'
        }`}>
          {document.documentCategory.replace('_', ' ')}
        </span>
      </div>
    </motion.div>
  );

  const DocumentSection = ({ title, type, documents, icon: Icon }) => {
    const sectionDocs = Object.entries(documents);
    
    if (sectionDocs.length === 0) {
      return (
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-8 text-center">
          <Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-white font-medium mb-2">{title}</h3>
          <p className="text-gray-400 text-sm">No documents found</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Icon className="h-6 w-6 text-blue-400 mr-2" />
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <span className="ml-2 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
              {sectionDocs.length} {sectionDocs.length === 1 ? 'case' : 'cases'}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          {sectionDocs.map(([relatedId, caseData]) => (
            <div key={relatedId} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FolderOpen className="h-5 w-5 text-yellow-400 mr-2" />
                  <span className="text-white font-medium">
                    Case ID: {relatedId.slice(-8)}
                  </span>
                  <span className="ml-2 text-gray-400 text-sm">
                    {caseData.documents.length} documents • {formatFileSize(caseData.totalSize)}
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/documents/${type}/${relatedId}`)}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  View All →
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ml-7">
                {caseData.documents.slice(0, 3).map((document) => (
                  <DocumentCard
                    key={document._id}
                    document={document}
                    type={type}
                    relatedId={relatedId}
                  />
                ))}
                {caseData.documents.length > 3 && (
                  <div className="bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm rounded-lg border border-white/10 p-4 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-gray-400 text-sm">
                        +{caseData.documents.length - 3} more
                      </span>
                      <button
                        onClick={() => navigate(`/documents/${type}/${relatedId}`)}
                        className="block text-blue-400 hover:text-blue-300 text-xs mt-1 transition-colors"
                      >
                        View All
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading || !user) {
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
          <h1 className="text-4xl font-bold text-white mb-2">Document Repository</h1>
          <p className="text-gray-300 text-lg">
            Manage and access all your legal documents stored securely on IPFS
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Total Documents</p>
                  <p className="text-2xl font-bold text-white">{stats.overall.totalDocuments}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Total Size</p>
                  <p className="text-2xl font-bold text-white">{formatFileSize(stats.overall.totalSize)}</p>
                </div>
                <Folder className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Direct Cases</p>
                  <p className="text-2xl font-bold text-white">{Object.keys(documents.direct).length}</p>
                </div>
                <User className="h-8 w-8 text-purple-400" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Legal Cases</p>
                  <p className="text-2xl font-bold text-white">
                    {Object.keys(documents.query).length + Object.keys(documents.dispute).length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-orange-400" />
              </div>
            </div>
          </div>
        )}

        {/* Document Sections */}
        <div className="space-y-12">
          <DocumentSection
            title="Direct Consultations"
            type="direct"
            documents={documents.direct}
            icon={User}
          />
          
          <DocumentSection
            title="Query Cases"
            type="query"
            documents={documents.query}
            icon={FileText}
          />
          
          <DocumentSection
            title="Dispute Cases"
            type="dispute"
            documents={documents.dispute}
            icon={Calendar}
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentRepository;
