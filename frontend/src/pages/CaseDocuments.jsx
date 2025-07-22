import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  ArrowLeft,
  Calendar,
  User,
  Tag,
  ExternalLink,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CaseDocuments = () => {
  const { documentType, relatedId } = useParams();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { user, getToken } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && getToken()) {
      fetchDocuments();
    }
  }, [documentType, relatedId, user]);

  const fetchDocuments = async () => {
    try {
      const token = getToken();
      if (!token) {
        error('Please log in to view documents');
        return;
      }

      const response = await fetch(`/api/documents/${documentType}/${relatedId}`, {
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

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);
    formData.append('relatedId', relatedId);
    formData.append('description', document.getElementById('description')?.value || '');
    formData.append('documentCategory', document.getElementById('category')?.value || 'other');
    formData.append('tags', document.getElementById('tags')?.value || '');

    try {
      const token = getToken();
      if (!token) {
        error('Please log in to upload documents');
        setIsUploading(false);
        return;
      }

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        success('Document uploaded successfully');
        setShowUploadModal(false);
        fetchDocuments();
      } else {
        const data = await response.json();
        error(data.error || 'Failed to upload document');
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      error('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
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

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.documentCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const documentCategories = [
    { value: 'all', label: 'All Categories' },
    { value: 'evidence', label: 'Evidence' },
    { value: 'contract', label: 'Contract' },
    { value: 'agreement', label: 'Agreement' },
    { value: 'legal_notice', label: 'Legal Notice' },
    { value: 'court_order', label: 'Court Order' },
    { value: 'affidavit', label: 'Affidavit' },
    { value: 'power_of_attorney', label: 'Power of Attorney' },
    { value: 'identity_proof', label: 'Identity Proof' },
    { value: 'address_proof', label: 'Address Proof' },
    { value: 'financial_document', label: 'Financial Document' },
    { value: 'correspondence', label: 'Correspondence' },
    { value: 'other', label: 'Other' }
  ];

  if (isLoading || !user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950/80 relative overflow-hidden p-6">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/8 to-gray-500/12 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-gray-500/10 to-blue-500/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate('/documents')}
              className="mr-4 p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {documentType.charAt(0).toUpperCase() + documentType.slice(1)} Case Documents
              </h1>
              <p className="text-gray-300">
                Case ID: {relatedId.slice(-8)} • {documents.length} documents
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
              >
                {documentCategories.map(category => (
                  <option key={category.value} value={category.value} className="bg-gray-800">
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </button>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document) => (
            <motion.div
              key={document._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-6 hover:border-white/30 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-3xl mr-3">{getDocumentIcon(document.mimeType)}</span>
                  <div>
                    <h3 className="text-white font-medium text-sm truncate max-w-[150px]">
                      {document.originalName}
                    </h3>
                    <p className="text-gray-400 text-xs">
                      {formatFileSize(document.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.open(document.url, '_blank')}
                    className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                    title="View Document"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => window.open(document.url, '_blank')}
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
                <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                  {document.description}
                </p>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    {document.uploadedBy.name}
                  </span>
                  <span className="text-gray-400 flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(document.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    document.documentCategory === 'evidence' ? 'bg-red-500/20 text-red-400' :
                    document.documentCategory === 'contract' ? 'bg-blue-500/20 text-blue-400' :
                    document.documentCategory === 'legal_notice' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {document.documentCategory.replace('_', ' ')}
                  </span>
                  
                  {document.tags && document.tags.length > 0 && (
                    <div className="flex items-center">
                      <Tag className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-gray-400 text-xs">
                        {document.tags.slice(0, 2).join(', ')}
                        {document.tags.length > 2 && '...'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No documents found</h3>
            <p className="text-gray-400 mb-6">
              {searchQuery || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Upload your first document to get started'
              }
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Upload Document
            </button>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-white/20 p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-xl font-bold text-white mb-4">Upload Document</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Select File
                </label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.xls,.xlsx"
                  className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  disabled={isUploading}
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Category
                </label>
                <select
                  id="category"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
                >
                  {documentCategories.slice(1).map(category => (
                    <option key={category.value} value={category.value} className="bg-gray-800">
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  rows="3"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  placeholder="Brief description of the document..."
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Tags (Optional)
                </label>
                <input
                  type="text"
                  id="tags"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  placeholder="contract, important, evidence (comma separated)"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                onClick={() => document.querySelector('input[type="file"]').click()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CaseDocuments;
