import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Crown, Sparkles, Star } from 'lucide-react';

const PricingButton = ({
  variant = 'default',
  size = 'md',
  className = '',
  children,
  showIcon = true
}) => {
  const navigate = useNavigate();

  const variants = {
    default: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white',
    outline: 'border-2 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white',
    ghost: 'text-purple-400 hover:bg-purple-500/20',
    premium: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };

  const icons = {
    default: <Crown className="w-4 h-4" />,
    premium: <Sparkles className="w-4 h-4" />,
    success: <Star className="w-4 h-4" />
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate('/pricing')}
      className={`
        inline-flex items-center gap-2 rounded-lg font-semibold transition-all duration-200
        shadow-lg hover:shadow-xl transform
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {showIcon && icons[variant]}
      {children || 'Explore Premium Features'}
    </motion.button>
  );
};

// Pre-built common pricing buttons
export const UpgradeToPremiumButton = ({ className = '' }) => (
  <PricingButton 
    variant="premium" 
    size="md" 
    className={className}
  >
    Upgrade to Premium
  </PricingButton>
);

export const ViewPricingButton = ({ className = '' }) => (
  <PricingButton 
    variant="outline" 
    size="sm" 
    className={className}
  >
    View Pricing
  </PricingButton>
);

export const GetPremiumButton = ({ className = '' }) => (
  <PricingButton 
    variant="success" 
    size="lg" 
    className={className}
  >
    Get Premium Free
  </PricingButton>
);

export const ExploreFeaturesButton = ({ className = '' }) => (
  <PricingButton 
    variant="default" 
    size="md" 
    className={className}
  >
    Explore Premium Features
  </PricingButton>
);

export default PricingButton;
