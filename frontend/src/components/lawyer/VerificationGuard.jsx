import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Clock, X, AlertTriangle, Mail, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const VerificationGuard = ({ 
  children, 
  fallback = null, 
  showMessage = true,
  className = "",
  feature = "this feature" 
}) => {
  const { user } = useAuth();

  // Allow access for non-lawyers
  if (!user || user.role !== 'lawyer') {
    return children;
  }

  // Allow access for verified lawyers
  if (user.isVerified) {
    return children;
  }

  // Show custom fallback if provided
  if (fallback) {
    return fallback;
  }

  // Don't show message if disabled
  if (!showMessage) {
    return null;
  }

  const verificationStatus = user.lawyerDetails?.verificationStatus || 'pending';
  const verificationNotes = user.lawyerDetails?.verificationNotes;

  const getStatusConfig = () => {
    switch (verificationStatus) {
      case 'rejected':
        return {
          icon: X,
          title: 'Verification Required',
          message: `Your account verification was not approved. Please review the feedback and update your profile to access ${feature}.`,
          bgColor: 'from-red-500/20 to-red-600/10',
          borderColor: 'border-red-500/30',
          iconColor: 'text-red-400',
          showActions: true
        };
      case 'pending':
      default:
        return {
          icon: Clock,
          title: 'Verification Pending',
          message: `Your lawyer account is under review. You'll be able to access ${feature} once your account is verified.`,
          bgColor: 'from-blue-500/20 to-cyan-600/10',
          borderColor: 'border-blue-500/30',
          iconColor: 'text-blue-400',
          showActions: false
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-gradient-to-r ${config.bgColor} border ${config.borderColor} rounded-xl p-8 backdrop-blur-sm text-center ${className}`}
    >
      <div className={`inline-flex p-4 rounded-full bg-black/20 ${config.iconColor} mb-4`}>
        <Lock className="h-8 w-8" />
      </div>
      
      <h3 className="text-xl font-semibold text-white mb-3">
        {config.title}
      </h3>
      
      <p className="text-gray-300 mb-6 max-w-md mx-auto">
        {config.message}
      </p>

      {verificationNotes && (
        <div className="bg-black/20 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
          <h4 className="text-sm font-medium text-white mb-2 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Admin Feedback:
          </h4>
          <p className="text-sm text-gray-300">{verificationNotes}</p>
        </div>
      )}

      {config.showActions && (
        <div className="flex flex-wrap justify-center gap-3">
          <button 
            onClick={() => window.location.href = '/profile'}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Update Profile</span>
          </button>
          
          <a 
            href="mailto:support@chainverdict.com"
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Mail className="h-4 w-4" />
            <span>Contact Support</span>
          </a>
        </div>
      )}

      {!config.showActions && (
        <div className="text-sm text-gray-400">
          <p>You'll receive an email notification once your account is reviewed.</p>
        </div>
      )}
    </motion.div>
  );
};

// Higher-order component for protecting entire pages
export const withVerificationGuard = (WrappedComponent, options = {}) => {
  return function VerificationGuardedComponent(props) {
    const { user } = useAuth();
    
    // Allow access for non-lawyers or verified lawyers
    if (!user || user.role !== 'lawyer' || user.isVerified) {
      return <WrappedComponent {...props} />;
    }

    // Show verification guard
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-4">
        <VerificationGuard 
          feature={options.feature || "this page"}
          className="max-w-lg w-full"
        />
      </div>
    );
  };
};

export default VerificationGuard;
