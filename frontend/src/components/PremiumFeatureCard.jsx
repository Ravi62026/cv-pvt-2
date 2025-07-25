import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Crown, Star, Zap } from 'lucide-react';
import PricingButton from './PricingButton';

const PremiumFeatureCard = ({ 
  title, 
  description, 
  icon: Icon = Crown, 
  features = [],
  className = '',
  variant = 'default'
}) => {
  const variants = {
    default: 'from-purple-600/20 to-pink-600/20 border-purple-500/30',
    premium: 'from-yellow-600/20 to-orange-600/20 border-yellow-500/30',
    pro: 'from-blue-600/20 to-cyan-600/20 border-blue-500/30'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`
        relative bg-gradient-to-br ${variants[variant]} 
        border rounded-xl p-6 backdrop-blur-sm hover:shadow-lg 
        transition-all duration-300 ${className}
      `}
    >
      {/* Premium Badge */}
      <div className="absolute -top-3 -right-3">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2 rounded-full shadow-lg">
          <Lock className="w-4 h-4" />
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-white/10 rounded-lg">
          <Icon className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="text-gray-300 text-sm">{description}</p>
        </div>
      </div>

      {/* Features */}
      {features.length > 0 && (
        <div className="mb-6">
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-gray-300">
                <Star className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA */}
      <div className="flex flex-col gap-3">
        <PricingButton 
          variant="premium" 
          size="md" 
          className="w-full justify-center"
        >
          Unlock Premium Features
        </PricingButton>
        
        <div className="text-center">
          <p className="text-xs text-gray-400">
            🎉 <span className="text-green-400 font-semibold">Free for next 1 month!</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// Pre-built premium feature cards
export const PremiumAnalyticsCard = () => (
  <PremiumFeatureCard
    title="Advanced Analytics"
    description="Get detailed insights into your legal cases"
    icon={Zap}
    variant="premium"
    features={[
      'Case success rate tracking',
      'Performance analytics',
      'Custom reports',
      'Data export options'
    ]}
  />
);

export const PremiumSupportCard = () => (
  <PremiumFeatureCard
    title="Priority Support"
    description="Get 24/7 priority assistance"
    icon={Crown}
    variant="default"
    features={[
      '24/7 live chat support',
      'Priority response time',
      'Dedicated account manager',
      'Phone support access'
    ]}
  />
);

export const PremiumToolsCard = () => (
  <PremiumFeatureCard
    title="AI Legal Tools"
    description="Advanced AI-powered legal assistance"
    icon={Star}
    variant="pro"
    features={[
      'AI document analysis',
      'Legal research assistant',
      'Contract review AI',
      'Case prediction models'
    ]}
  />
);

export default PremiumFeatureCard;
