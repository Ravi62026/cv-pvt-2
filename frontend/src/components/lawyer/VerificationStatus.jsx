import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Clock, 
  X, 
  AlertTriangle, 
  CheckCircle, 
  Mail,
  Phone,
  ExternalLink
} from 'lucide-react';

const VerificationStatus = ({ user, className = "" }) => {
  if (!user || user.role !== 'lawyer') {
    return null;
  }

  const isVerified = user.isVerified;
  const verificationStatus = user.lawyerDetails?.verificationStatus || 'pending';
  const verificationNotes = user.lawyerDetails?.verificationNotes;

  // Don't show anything if lawyer is verified
  if (isVerified) {
    return null;
  }

  const getStatusConfig = () => {
    switch (verificationStatus) {
      case 'rejected':
        return {
          icon: X,
          title: 'Verification Required',
          message: 'Your lawyer account verification was not approved.',
          bgColor: 'from-red-500/20 to-red-600/10',
          borderColor: 'border-red-500/30',
          iconColor: 'text-red-400',
          textColor: 'text-red-300'
        };
      case 'pending':
      default:
        return {
          icon: Clock,
          title: 'Verification Pending',
          message: 'Your lawyer account is under review by our admin team.',
          bgColor: 'from-yellow-500/20 to-orange-600/10',
          borderColor: 'border-yellow-500/30',
          iconColor: 'text-yellow-400',
          textColor: 'text-yellow-300'
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r ${config.bgColor} border ${config.borderColor} rounded-xl p-6 backdrop-blur-sm ${className}`}
    >
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-full bg-black/20 ${config.iconColor}`}>
          <IconComponent className="h-6 w-6" />
        </div>
        
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${config.textColor} mb-2`}>
            {config.title}
          </h3>
          
          <p className="text-gray-300 mb-4">
            {config.message}
          </p>

          {verificationNotes && (
            <div className="bg-black/20 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-white mb-2">Admin Notes:</h4>
              <p className="text-sm text-gray-300">{verificationNotes}</p>
            </div>
          )}

          {verificationStatus === 'pending' && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Application submitted successfully</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Clock className="h-4 w-4 text-yellow-400" />
                <span>Verification typically takes 1-3 business days</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Mail className="h-4 w-4 text-blue-400" />
                <span>You'll receive an email notification once reviewed</span>
              </div>
            </div>
          )}

          {verificationStatus === 'rejected' && (
            <div className="space-y-3">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <h4 className="text-sm font-medium text-red-300 mb-2 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Action Required
                </h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Review the admin feedback above</li>
                  <li>• Update your profile with required information</li>
                  <li>• Upload any missing documents</li>
                  <li>• Contact support if you need assistance</li>
                </ul>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => window.location.href = '/profile'}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Update Profile</span>
                </button>
                
                <a 
                  href="mailto: admin@chainverdict.in"
                  className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span>Contact Support</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default VerificationStatus;
