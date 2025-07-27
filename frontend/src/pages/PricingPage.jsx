import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  X, 
  Star, 
  Crown, 
  Shield, 
  Zap, 
  Users, 
  FileText, 
  MessageCircle, 
  Calendar,
  Award,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const PricingPage = () => {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState(user?.role || 'lawyer');

  const handleGetStarted = () => {
    if (!user) {
      toast.error('Please login to get started');
      return;
    }
    toast.success('Welcome! Enjoy your free access for the next month!');
  };

  const citizenPlans = [
    {
      id: 'citizen_free',
      name: 'Free Access',
      price: 'Free',
      originalPrice: null,
      duration: 'Next 1 Month',
      popular: false,
      description: 'Perfect for getting started with legal support',
      icon: <Shield className="w-8 h-8" />,
      features: [
        { name: 'Unlimited Legal Queries', included: true },
        { name: 'Unlimited Dispute Cases', included: true },
        { name: 'Connect with Verified Lawyers', included: true },
        { name: 'Document Templates', included: true },
        { name: 'Community Support', included: true },
        { name: 'Basic Case Tracking', included: true },
        { name: 'Email Notifications', included: true },
        { name: 'Mobile App Access', included: true }
      ],
      futurePrice: '₹299/month',
      buttonText: 'Get Started Free',
      buttonStyle: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700'
    },
    {
      id: 'citizen_premium',
      name: 'Premium',
      price: 'Free',
      originalPrice: '₹299',
      duration: 'Next 1 Month',
      popular: true,
      description: 'Enhanced features for serious legal matters',
      icon: <Crown className="w-8 h-8" />,
      features: [
        { name: 'Everything in Free', included: true },
        { name: 'Priority Lawyer Matching', included: true },
        { name: 'Advanced Case Analytics', included: true },
        { name: 'Priority Support', included: true },
        { name: '15% Consultation Discount', included: true },
        { name: 'Legal Document Review', included: true },
        { name: 'Case Status Alerts', included: true },
        { name: 'Expert Legal Advice', included: true }
      ],
      futurePrice: '₹299/month',
      buttonText: 'Start Premium Free',
      buttonStyle: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
    },
    {
      id: 'citizen_pro',
      name: 'Pro',
      price: 'Free',
      originalPrice: '₹599',
      duration: 'Next 1 Month',
      popular: false,
      description: 'Complete legal solution for businesses',
      icon: <Star className="w-8 h-8" />,
      features: [
        { name: 'Everything in Premium', included: true },
        { name: 'Dedicated Legal Advisor', included: true },
        { name: 'Contract Management', included: true },
        { name: 'Legal Compliance Tracking', included: true },
        { name: '25% Consultation Discount', included: true },
        { name: 'Custom Legal Reports', included: true },
        { name: 'API Access', included: true },
        { name: '24/7 Priority Support', included: true }
      ],
      futurePrice: '₹599/month',
      buttonText: 'Start Pro Free',
      buttonStyle: 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700'
    }
  ];

  const lawyerPlans = [
    {
      id: 'lawyer_individual',
      name: 'For Individual',
      price: '₹999',
      originalPrice: null,
      duration: 'per month',
      popular: false,
      description: 'For individual lawyers and practitioners',
      icon: <Briefcase className="w-8 h-8" />,
      features: [
        { name: 'Unlimited Client Connections', included: true },
        { name: 'Case Management Dashboard', included: true },
        { name: 'Client Communication Tools', included: true },
        { name: 'Document Management', included: true },
        { name: 'Calendar & Scheduling', included: true },
        { name: 'Payment Processing', included: true },
        { name: 'Basic Analytics', included: true },
        { name: 'Mobile App Access', included: true },
        { name: 'Email Support', included: true }
      ],
      buttonText: 'Get Started',
      buttonStyle: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700'
    },
    {
      id: 'lawyer_enterprise_small',
      name: 'Enterprise (Max 5)',
      price: '₹2,999',
      originalPrice: null,
      duration: 'per month',
      popular: true,
      description: 'For small law firms with up to 5 individuals',
      icon: <Users className="w-8 h-8" />,
      features: [
        { name: 'Everything in Individual Plan', included: true },
        { name: 'Up to 5 Team Members', included: true },
        { name: 'Team Collaboration Tools', included: true },
        { name: 'Advanced Analytics & Reports', included: true },
        { name: 'Custom Branding', included: true },
        { name: 'Priority Support', included: true },
        { name: 'Bulk Document Processing', included: true },
        { name: 'Team Calendar Management', included: true },
        { name: 'Multi-user Dashboard', included: true }
      ],
      buttonText: 'Choose Enterprise',
      buttonStyle: 'bg-gradient-to-r from-green-600 to-teal-600 text-white hover:from-green-700 hover:to-teal-700'
    },
    {
      id: 'lawyer_enterprise_large',
      name: 'Enterprise (5+ Users)',
      price: '₹4,999',
      originalPrice: null,
      duration: 'per month',
      popular: false,
      description: 'For large law firms with more than 5 individuals',
      icon: <Award className="w-8 h-8" />,
      features: [
        { name: 'Everything in Enterprise (Max 5)', included: true },
        { name: 'Unlimited Team Members', included: true },
        { name: 'Advanced Team Management', included: true },
        { name: 'Custom Integrations', included: true },
        { name: 'White-label Solutions', included: true },
        { name: 'Dedicated Account Manager', included: true },
        { name: 'API Access', included: true },
        { name: 'Advanced Security Features', included: true },
        { name: '24/7 Priority Support', included: true },
        { name: 'Custom Training Sessions', included: true }
      ],
      buttonText: 'Contact Sales',
      buttonStyle: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
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
      description: 'Perfect for law students starting their journey',
      icon: <Award className="w-8 h-8" />,
      features: [
        { name: 'Access to Legal Resources', included: true },
        { name: 'Basic Case Studies', included: true },
        { name: 'Student Community Forum', included: true },
        { name: 'Legal Document Templates', included: true },
        { name: 'Basic Legal Research Tools', included: true },
        { name: 'Study Materials Access', included: true },
        { name: 'Email Support', included: true },
        { name: 'Mobile App Access', included: true }
      ],
      futurePrice: 'Then ₹199/month',
      buttonText: 'Start Student Basic',
      buttonStyle: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700'
    },
    {
      id: 'student_premium',
      name: 'Student Premium',
      price: 'Free',
      originalPrice: '₹399',
      duration: 'Next 1 Month',
      popular: true,
      description: 'Advanced features for serious law students',
      icon: <Crown className="w-8 h-8" />,
      features: [
        { name: 'Everything in Basic', included: true },
        { name: 'Advanced Case Studies', included: true },
        { name: 'Mock Court Sessions', included: true },
        { name: 'Mentorship Program Access', included: true },
        { name: 'Legal Writing Tools', included: true },
        { name: 'Career Guidance', included: true },
        { name: 'Internship Opportunities', included: true },
        { name: 'Priority Support', included: true }
      ],
      futurePrice: 'Then ₹399/month',
      buttonText: 'Start Student Premium',
      buttonStyle: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
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

  const getRoleTitle = () => {
    switch (selectedRole) {
      case 'citizen': return 'For Citizens';
      case 'lawyer': return 'For Lawyers';
      case 'admin': return 'For Legal Students';
      default: return 'For Citizens';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              View Pricing and Features
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              For Lawyers
            </p>
            
            {/* Free Month Banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full font-semibold text-lg mb-12"
            >
              <Star className="w-5 h-5" />
              🎉 Next 1 Month FREE for Everyone!
              <Star className="w-5 h-5" />
            </motion.div>

            {/* Role Selector */}
            <div className="flex justify-center mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 flex gap-2">
                {['citizen', 'lawyer', 'admin'].map((role) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
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
          </motion.div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-4">{getRoleTitle()}</h2>
          <p className="text-gray-300 text-lg">
            Choose the plan that best fits your needs. All plans are free for the next month!
          </p>
        </motion.div>

        <div className={`grid gap-8 ${getCurrentPlans().length === 3 ? 'lg:grid-cols-3' : getCurrentPlans().length === 2 ? 'lg:grid-cols-2 max-w-4xl mx-auto' : 'max-w-md mx-auto'}`}>
          {getCurrentPlans().map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
              className={`relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 ${
                plan.popular ? 'ring-2 ring-purple-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <div className="flex justify-center mb-4 text-purple-400">
                  {plan.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-300 mb-4">{plan.description}</p>
                
                <div className="mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    {plan.originalPrice && (
                      <span className="text-lg text-gray-400 line-through">{plan.originalPrice}</span>
                    )}
                  </div>
                  <p className="text-purple-400 font-semibold">{plan.duration}</p>
                  <p className="text-sm text-gray-400 mt-1">Then {plan.futurePrice}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    )}
                    <span className={`${feature.included ? 'text-white' : 'text-gray-500'}`}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleGetStarted}
                className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${plan.buttonStyle} shadow-lg hover:shadow-xl transform hover:scale-105`}
              >
                {plan.buttonText}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-center mt-16"
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-4">🎁 Special Launch Offer</h3>
            <p className="text-gray-300 text-lg mb-6">
              We're excited to launch ChainVerdict! As a thank you for being an early user, 
              enjoy <strong className="text-purple-400">complete free access</strong> to all features for the next month.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <h4 className="font-semibold text-white mb-1">No Limits</h4>
                <p className="text-gray-400 text-sm">Unlimited access to all features</p>
              </div>
              <div>
                <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <h4 className="font-semibold text-white mb-1">No Credit Card</h4>
                <p className="text-gray-400 text-sm">Start immediately, no payment required</p>
              </div>
              <div>
                <Calendar className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <h4 className="font-semibold text-white mb-1">Cancel Anytime</h4>
                <p className="text-gray-400 text-sm">No commitment, cancel before billing starts</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PricingPage;
