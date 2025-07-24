import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

// Modern Stats Card Component
export const ModernStatsCard = ({ 
  title, 
  value = 0, 
  icon: Icon, 
  color = 'blue', 
  trend = "+0%",
  subtitle = "this month",
  onClick = null 
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-emerald-500 to-teal-500',
    purple: 'from-purple-500 to-pink-500',
    orange: 'from-orange-500 to-red-500',
    red: 'from-red-500 to-pink-500',
    indigo: 'from-indigo-500 to-purple-500',
  };

  const isPositiveTrend = trend.startsWith('+');
  const isClickable = onClick !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: isClickable ? 1.02 : 1.01 }}
      transition={{ duration: 0.2 }}
      className={`bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/20 hover:border-white/30 p-6 group ${
        isClickable ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} shadow-lg group-hover:shadow-xl transition-all duration-300`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
          isPositiveTrend ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {isPositiveTrend ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          <span>{trend}</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-400 mb-2">{title}</p>
        <p className="text-3xl font-bold text-white group-hover:text-blue-300 transition-colors duration-300">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      </div>
    </motion.div>
  );
};

// Modern Action Card Component
export const ModernActionCard = ({
  title,
  description,
  icon: Icon,
  onClick,
  color = 'blue',
  badge = null,
  disabled = false
}) => {
  const colorClasses = {
    blue: 'from-blue-500 via-blue-600 to-blue-700',
    green: 'from-emerald-500 via-emerald-600 to-emerald-700',
    purple: 'from-purple-500 via-purple-600 to-purple-700',
    orange: 'from-orange-500 via-orange-600 to-orange-700',
    red: 'from-red-500 via-red-600 to-red-700',
    indigo: 'from-indigo-500 via-indigo-600 to-indigo-700',
  };

  return (
    <motion.div
      whileHover={disabled ? {} : { scale: 1.02, y: -4 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${colorClasses[color]} p-8 shadow-xl hover:shadow-2xl transition-all duration-300 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      onClick={disabled ? undefined : onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Icon className="h-8 w-8 text-white" />
          </div>
          <div className="flex items-center space-x-2">
            {badge && (
              <div className="bg-white/20 text-white px-2 py-1 rounded-full text-xs font-medium">
                {badge}
              </div>
            )}
            <ArrowRight className="h-6 w-6 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </div>

        <h3 className="text-2xl font-bold text-white mb-3">
          {title}
        </h3>
        <p className="text-white/90 text-lg leading-relaxed">
          {description}
        </p>

        <div className="mt-6 flex items-center text-white/80">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
          <span className="text-sm font-medium">Available Now</span>
        </div>
      </div>
    </motion.div>
  );
};

// Modern Section Header Component
export const ModernSectionHeader = ({ 
  title, 
  subtitle = null, 
  action = null,
  icon: Icon = null 
}) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-3">
        {Icon && (
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Icon className="h-6 w-6 text-blue-400" />
          </div>
        )}
        <div>
          <h2 className="text-3xl font-bold text-white">{title}</h2>
          {subtitle && (
            <p className="text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      {action && (
        <div className="text-sm text-gray-400">
          {action}
        </div>
      )}
    </div>
  );
};

// Modern Container Component
export const ModernContainer = ({ 
  children, 
  className = "",
  padding = "p-6",
  rounded = "rounded-2xl"
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm ${rounded} border border-white/20 hover:border-white/30 transition-all duration-300 ${padding} ${className}`}
    >
      {children}
    </motion.div>
  );
};

// Modern Grid Component
export const ModernGrid = ({ 
  children, 
  cols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  gap = "gap-6",
  className = ""
}) => {
  return (
    <div className={`grid ${cols} ${gap} ${className}`}>
      {children}
    </div>
  );
};

// Modern Dashboard Layout Component
export const ModernDashboardLayout = ({ children, className = "" }) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 relative overflow-hidden ${className}`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gray-600/15 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-500/5 to-gray-500/10 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-8 relative z-10">
        {children}
      </div>
    </div>
  );
};

// Modern Welcome Header Component
export const ModernWelcomeHeader = ({ 
  title, 
  subtitle, 
  emoji = "👋",
  statusCard = null 
}) => {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-3">
            {title} {emoji}
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            {subtitle}
          </p>
        </div>
        {statusCard && (
          <div className="hidden lg:block">
            {statusCard}
          </div>
        )}
      </div>
    </div>
  );
};

// Modern Status Card Component
export const ModernStatusCard = ({ 
  title, 
  subtitle, 
  icon: Icon,
  color = 'blue' 
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-600',
    green: 'from-emerald-500 to-teal-600',
    purple: 'from-purple-500 to-pink-600',
    orange: 'from-orange-500 to-red-600',
  };

  return (
    <div className={`bg-gradient-to-r ${colorClasses[color]} rounded-2xl p-6 text-white`}>
      <div className="flex items-center">
        <div className="p-2 bg-white/20 rounded-lg mr-4">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-sm opacity-90">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};
