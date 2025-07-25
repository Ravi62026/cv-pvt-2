import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Check, 
  Star, 
  Crown, 
  Shield, 
  Zap, 
  Briefcase,
  Award,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const PricingModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState(user?.role || 'citizen');

  const handleGetStarted = (planName) => {
    if (!user) {
      toast.error('Please login to get started');
      return;
    }
    toast.success(`Welcome to ${planName}! Enjoy your free access for the next month!`);
    onClose();
  };

  const citizenPlans = [
    {
      id: 'citizen_free',
      name: 'Free Access',
      price: 'Free',
      originalPrice: null,
      duration: 'Next 1 Month',
      popular: false,
      icon: <Shield className="w-6 h-6" />,
      features: [
        'Unlimited Legal Queries',
        'Connect with Verified Lawyers',
        'Document Templates',
        'Community Support',
        'Basic Case Tracking'
      ],
      futurePrice: '₹299/month',
      buttonText: 'Get Started Free',
      gradient: 'from-blue-600 to-cyan-600'
    },
    {
      id: 'citizen_premium',
      name: 'Premium',
      price: 'Free',
      originalPrice: '₹299',
      duration: 'Next 1 Month',
      popular: true,
      icon: <Crown className="w-6 h-6" />,
      features: [
        'Everything in Free',
        'Priority Lawyer Matching',
        'Advanced Case Analytics',
        '15% Consultation Discount',
        'Priority Support'
      ],
      futurePrice: '₹299/month',
      buttonText: 'Start Premium Free',
      gradient: 'from-purple-600 to-pink-600'
    },
    {
      id: 'citizen_pro',
      name: 'Pro',
      price: 'Free',
      originalPrice: '₹599',
      duration: 'Next 1 Month',
      popular: false,
      icon: <Star className="w-6 h-6" />,
      features: [
        'Everything in Premium',
        'Dedicated Legal Advisor',
        'Contract Management',
        '25% Consultation Discount',
        '24/7 Priority Support'
      ],
      futurePrice: '₹599/month',
      buttonText: 'Start Pro Free',
      gradient: 'from-orange-600 to-red-600'
    }
  ];

  const lawyerPlans = [
    {
      id: 'lawyer_professional',
      name: 'Professional',
      price: 'Free',
      originalPrice: '₹999',
      duration: 'Next 1 Month',
      popular: true,
      icon: <Briefcase className="w-6 h-6" />,
      features: [
        'Unlimited Client Connections',
        'Case Management Dashboard',
        'Payment Processing',
        'Calendar & Scheduling',
        'Mobile App Access'
      ],
      futurePrice: '₹999/month',
      buttonText: 'Start Professional Free',
      gradient: 'from-green-600 to-teal-600'
    },
    {
      id: 'lawyer_enterprise',
      name: 'Enterprise',
      price: 'Free',
      originalPrice: '₹1999',
      duration: 'Next 1 Month',
      popular: false,
      icon: <Award className="w-6 h-6" />,
      features: [
        'Everything in Professional',
        'Team Collaboration Tools',
        'Advanced Analytics',
        'Custom Branding',
        'Dedicated Account Manager'
      ],
      futurePrice: '₹1999/month',
      buttonText: 'Start Enterprise Free',
      gradient: 'from-indigo-600 to-purple-600'
    }
  ];

  const adminPlans = [
    {
      id: 'student_basic',
      name: 'Student Basic',
      price: 'Free',
      originalPrice: '₹199',
      duration: 'Next 1 Month',
      popular: false,
      icon: <Award className="w-6 h-6" />,
      features: [
        'Legal Resources Access',
        'Basic Case Studies',
        'Student Community',
        'Document Templates',
        'Study Materials'
      ],
      futurePrice: '₹199/month',
      buttonText: 'Start Student Basic',
      gradient: 'from-blue-600 to-cyan-600'
    },
    {
      id: 'student_premium',
      name: 'Student Premium',
      price: 'Free',
      originalPrice: '₹399',
      duration: 'Next 1 Month',
      popular: true,
      icon: <Crown className="w-6 h-6" />,
      features: [
        'Everything in Basic',
        'Advanced Case Studies',
        'Mock Court Sessions',
        'Mentorship Program',
        'Career Guidance'
      ],
      futurePrice: '₹399/month',
      buttonText: 'Start Student Premium',
      gradient: 'from-purple-600 to-pink-600'
    }
  ];

  const getCurrentPlans = () => {
    switch (selectedRole) {
      case 'citizen': return citizenPlans;
      case 'lawyer': return lawyerPlans;
      case 'admin': return adminPlans;
      default: return citizenPlans;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-slate-900/95 to-blue-900/95 backdrop-blur-sm border-b border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-8 h-8 text-purple-400" />
                  Explore Premium Features
                </h2>
                <p className="text-gray-300 mt-1">Get full access free for the next month!</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Free Month Banner */}
            <div className="mt-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-3">
              <div className="flex items-center justify-center gap-2 text-green-400 font-semibold">
                <Star className="w-5 h-5" />
                🎉 Next 1 Month FREE for Everyone - No Credit Card Required!
                <Star className="w-5 h-5" />
              </div>
            </div>

            {/* Role Selector */}
            <div className="flex justify-center mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-1 flex gap-1">
                {['citizen', 'lawyer', 'admin'].map((role) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                      selectedRole === role
                        ? 'bg-white text-gray-900 shadow-lg'
                        : 'text-white hover:bg-white/20'
                    }`}
                  >
                    {role === 'admin' ? 'Legal Student' : role.charAt(0).toUpperCase() + role.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="p-6">
            <div className={`grid gap-6 ${getCurrentPlans().length === 3 ? 'lg:grid-cols-3' : getCurrentPlans().length === 2 ? 'lg:grid-cols-2' : 'max-w-md mx-auto'}`}>
              {getCurrentPlans().map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className={`relative bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300 ${
                    plan.popular ? 'ring-2 ring-purple-500 scale-105' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className="flex justify-center mb-3 text-purple-400">
                      {plan.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                    
                    <div className="mb-3">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="text-3xl font-bold text-white">{plan.price}</span>
                        {plan.originalPrice && (
                          <span className="text-sm text-gray-400 line-through">{plan.originalPrice}</span>
                        )}
                      </div>
                      <p className="text-purple-400 font-semibold text-sm">{plan.duration}</p>
                      <p className="text-xs text-gray-400 mt-1">Then {plan.futurePrice}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-white text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleGetStarted(plan.name)}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 bg-gradient-to-r ${plan.gradient} text-white hover:shadow-lg transform hover:scale-105`}
                  >
                    {plan.buttonText}
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Bottom Info */}
            <div className="mt-8 text-center">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-gray-300 text-sm">
                  🚀 <strong className="text-purple-400">Launch Special:</strong> Complete free access to all features for the next month. 
                  No commitment, cancel anytime before billing starts.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PricingModal;
