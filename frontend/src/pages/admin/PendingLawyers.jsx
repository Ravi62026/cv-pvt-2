import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  UserCheck,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Search,
  Filter,
  Clock,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Scale,
  Eye,
  EyeOff
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PendingLawyers = () => {
  const [lawyers, setLawyers] = useState([]);
  const [filteredLawyers, setFilteredLawyers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedCards, setExpandedCards] = useState({});
  
  const navigate = useNavigate();
  const { success, error } = useToast();
  const lawyersPerPage = 10;

  useEffect(() => {
    fetchPendingLawyers();
  }, [currentPage]);

  useEffect(() => {
    filterLawyers();
  }, [lawyers, searchTerm, filterStatus]);

  const fetchPendingLawyers = async () => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getPendingLawyerVerifications(currentPage, lawyersPerPage);
      if (response.success) {
        setLawyers(response.data.lawyers);
        setTotalPages(Math.ceil(response.data.total / lawyersPerPage));
      } else {
        error('Failed to load pending lawyers');
      }
    } catch (err) {
      error('Error loading pending lawyers');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterLawyers = () => {
    let filtered = lawyers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(lawyer =>
        lawyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lawyer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lawyer.phone.includes(searchTerm)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(lawyer => 
        lawyer.lawyerDetails?.verificationStatus === filterStatus
      );
    }

    setFilteredLawyers(filtered);
  };

  const handleLawyerVerification = async (lawyerId, action, reason = '') => {
    const processingKey = `${lawyerId}-${action}`;
    setIsProcessing(prev => ({ ...prev, [processingKey]: true }));

    try {
      const response = await adminAPI.updateLawyerVerification(lawyerId, action, reason);
      
      if (response.success) {
        success(`Lawyer ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
        // Remove the lawyer from the list
        setLawyers(prev => prev.filter(lawyer => lawyer._id !== lawyerId));
      } else {
        error(`Failed to ${action} lawyer`);
      }
    } catch (err) {
      error(`Failed to ${action} lawyer`);
      console.error('Lawyer verification error:', err);
    } finally {
      setIsProcessing(prev => ({ ...prev, [processingKey]: false }));
    }
  };

  const toggleCardExpansion = (lawyerId) => {
    setExpandedCards(prev => ({
      ...prev,
      [lawyerId]: !prev[lawyerId]
    }));
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 text-white hover:text-blue-300"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
                  <div className="p-2 bg-orange-500/20 rounded-lg mr-3">
                    <UserCheck className="h-8 w-8 text-orange-400" />
                  </div>
                  Pending Lawyer Verifications
                </h1>
                <p className="text-xl text-gray-300">
                  Review and verify lawyer applications
                </p>
              </div>
            </div>
            <div className="bg-orange-500/20 text-orange-400 px-4 py-2 rounded-xl text-lg font-medium">
              {filteredLawyers.length} pending
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="mb-8">
          <MonthlyStatsChart />
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="all" className="bg-gray-800">All Status</option>
                <option value="pending" className="bg-gray-800">Pending</option>
                <option value="rejected" className="bg-gray-800">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lawyers List */}
        {filteredLawyers.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-green-500/20 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">All Caught Up!</h3>
            <p className="text-gray-400 text-lg">No pending lawyer verifications found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredLawyers.map((lawyer, index) => (
              <LawyerCard
                key={lawyer._id}
                lawyer={lawyer}
                index={index}
                isExpanded={expandedCards[lawyer._id]}
                onToggleExpansion={() => toggleCardExpansion(lawyer._id)}
                onVerify={handleLawyerVerification}
                isProcessing={isProcessing}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    currentPage === page
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Individual Lawyer Card Component
const LawyerCard = ({ lawyer, index, isExpanded, onToggleExpansion, onVerify, isProcessing }) => {
  const isApproving = isProcessing[`${lawyer._id}-approve`] || false;
  const isRejecting = isProcessing[`${lawyer._id}-reject`] || false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/20 hover:border-white/30 transition-all duration-300 overflow-hidden"
    >
      {/* Main Card Content */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Lawyer Info */}
            <div className="flex items-center mb-4">
              <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                <UserCheck className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-xl">{lawyer.name}</h3>
                <div className="flex items-center space-x-2 text-gray-300 mt-1">
                  <Mail className="h-4 w-4" />
                  <span>{lawyer.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300 mt-1">
                  <Phone className="h-4 w-4" />
                  <span>{lawyer.phone}</span>
                </div>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex items-center space-x-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                lawyer.lawyerDetails?.verificationStatus === 'verified'
                  ? 'bg-green-500/20 text-green-400 border-green-500/40'
                  : lawyer.lawyerDetails?.verificationStatus === 'rejected'
                  ? 'bg-red-500/20 text-red-400 border-red-500/40'
                  : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
              }`}>
                <Clock className="h-3 w-3 inline mr-1" />
                {lawyer.lawyerDetails?.verificationStatus || 'pending'}
              </span>
              <span className="text-gray-400 text-sm">
                Registered: {new Date(lawyer.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center text-gray-400 mb-1">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  <span className="text-sm">Experience</span>
                </div>
                <p className="text-white font-medium">{lawyer.lawyerDetails?.experience || 'N/A'}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center text-gray-400 mb-1">
                  <Scale className="h-4 w-4 mr-2" />
                  <span className="text-sm">Bar ID</span>
                </div>
                <p className="text-white font-medium">{lawyer.lawyerDetails?.barId || 'N/A'}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center text-gray-400 mb-1">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-sm">Specialization</span>
                </div>
                <p className="text-white font-medium text-sm">
                  {lawyer.lawyerDetails?.specialization?.join(', ') || 'N/A'}
                </p>
              </div>
            </div>

            {/* Expand/Collapse Button */}
            <button
              onClick={onToggleExpansion}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium bg-blue-500/10 hover:bg-blue-500/20 px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
            >
              <span>{isExpanded ? 'Hide Details' : 'Show Details'}</span>
              {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Action Buttons */}
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
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="border-t border-white/10 p-6 bg-white/5"
        >
          <h4 className="text-lg font-semibold text-white mb-4">Additional Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium text-gray-400">Education:</span>
              <p className="text-white mt-1">{lawyer.lawyerDetails?.education || 'N/A'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-400">License Number:</span>
              <p className="text-white mt-1">{lawyer.lawyerDetails?.licenseNumber || 'N/A'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-400">Practice Areas:</span>
              <p className="text-white mt-1">
                {lawyer.lawyerDetails?.practiceAreas?.join(', ') || 'N/A'}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-400">Court Admissions:</span>
              <p className="text-white mt-1">
                {lawyer.lawyerDetails?.courtAdmissions?.join(', ') || 'N/A'}
              </p>
            </div>
            <div className="md:col-span-2">
              <span className="font-medium text-gray-400">Address:</span>
              <p className="text-white mt-1">
                {lawyer.address 
                  ? `${lawyer.address.street || ''}, ${lawyer.address.city || ''}, ${lawyer.address.state || ''} ${lawyer.address.pincode || ''}`.replace(/^,\s*/, '').replace(/,\s*$/, '')
                  : 'N/A'
                }
              </p>
            </div>
            {lawyer.lawyerDetails?.bio && (
              <div className="md:col-span-2">
                <span className="font-medium text-gray-400">Bio:</span>
                <p className="text-white mt-1">{lawyer.lawyerDetails.bio}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Monthly Stats Chart Component
const MonthlyStatsChart = () => {
  // Mock data for demonstration - replace with real API data
  const monthlyData = [
    { month: 'Jan', queries: 0, disputes: 0, verifications: 0 },
    { month: 'Feb', queries: 0, disputes: 0, verifications: 0 },
    { month: 'Mar', queries: 0, disputes: 0, verifications: 0 },
    { month: 'Apr', queries: 0, disputes: 0, verifications: 0 },
    { month: 'May', queries: 0, disputes: 0, verifications: 0 },
    { month: 'Jun', queries: 0, disputes: 0, verifications: 0 },
    { month: 'Jul', queries: 5, disputes: 2, verifications: 3 },
    { month: 'Aug', queries: 0, disputes: 0, verifications: 0 },
    { month: 'Sep', queries: 0, disputes: 0, verifications: 0 },
    { month: 'Oct', queries: 0, disputes: 0, verifications: 0 },
    { month: 'Nov', queries: 0, disputes: 0, verifications: 0 },
    { month: 'Dec', queries: 0, disputes: 0, verifications: 0 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
        <Clock className="h-5 w-5 mr-2 text-purple-400" />
        Monthly Case Statistics
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {monthlyData.map((month, index) => (
          <motion.div
            key={month.month}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-200 border border-white/10"
          >
            <div className="text-center">
              <div className="text-sm font-medium text-gray-300 mb-3">{month.month}</div>

              {/* Queries */}
              <div className="mb-3">
                <div className="text-2xl font-bold text-blue-400">{month.queries}</div>
                <div className="text-xs text-gray-400">Queries</div>
              </div>

              {/* Disputes */}
              <div className="mb-3">
                <div className="text-2xl font-bold text-purple-400">{month.disputes}</div>
                <div className="text-xs text-gray-400">Disputes</div>
              </div>

              {/* Verifications */}
              <div>
                <div className="text-2xl font-bold text-orange-400">{month.verifications}</div>
                <div className="text-xs text-gray-400">Verifications</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-500/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {monthlyData.reduce((sum, month) => sum + month.queries, 0)}
            </div>
            <div className="text-sm text-gray-400">Total Queries</div>
          </div>
          <div className="bg-purple-500/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {monthlyData.reduce((sum, month) => sum + month.disputes, 0)}
            </div>
            <div className="text-sm text-gray-400">Total Disputes</div>
          </div>
          <div className="bg-orange-500/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">
              {monthlyData.reduce((sum, month) => sum + month.verifications, 0)}
            </div>
            <div className="text-sm text-gray-400">Total Verifications</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PendingLawyers;
