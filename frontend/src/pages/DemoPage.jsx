import React from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Star, 
  Zap, 
  Shield, 
  Users, 
  FileText, 
  MessageCircle,
  Calendar,
  BarChart3,
  Sparkles
} from 'lucide-react';
import PricingButton, { 
  UpgradeToPremiumButton, 
  ViewPricingButton, 
  GetPremiumButton,
  ExploreFeaturesButton 
} from '../components/PricingButton';
import { 
  PremiumAnalyticsCard, 
  PremiumSupportCard, 
  PremiumToolsCard 
} from '../components/PremiumFeatureCard';

const DemoPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-white mb-6">
            ChainVerdict Premium Features
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Discover how pricing is seamlessly integrated throughout our platform. 
            Click any pricing button to explore our premium features!
          </p>
          
          {/* Main CTA */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <GetPremiumButton />
            <ExploreFeaturesButton />
            <ViewPricingButton />
          </div>

          {/* Free Month Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full font-semibold text-lg"
          >
            <Sparkles className="w-5 h-5" />
            🎉 Next 1 Month FREE for Everyone!
            <Sparkles className="w-5 h-5" />
          </motion.div>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          <PremiumAnalyticsCard />
          <PremiumSupportCard />
          <PremiumToolsCard />
        </div>

        {/* Pricing Button Variants Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Pricing Button Variants
          </h2>
          <p className="text-gray-300 text-center mb-8">
            Different pricing button styles used throughout the application
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <h3 className="text-white font-semibold mb-3">Default</h3>
              <PricingButton variant="default" size="md">
                Explore Premium
              </PricingButton>
            </div>
            
            <div className="text-center">
              <h3 className="text-white font-semibold mb-3">Premium</h3>
              <PricingButton variant="premium" size="md">
                Upgrade Now
              </PricingButton>
            </div>
            
            <div className="text-center">
              <h3 className="text-white font-semibold mb-3">Outline</h3>
              <PricingButton variant="outline" size="md">
                View Pricing
              </PricingButton>
            </div>
            
            <div className="text-center">
              <h3 className="text-white font-semibold mb-3">Success</h3>
              <PricingButton variant="success" size="md">
                Get Free Access
              </PricingButton>
            </div>
          </div>
        </motion.div>

        {/* Feature Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Why Upgrade to Premium?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: "Advanced Analytics",
                description: "Get detailed insights into your legal cases and performance metrics",
                color: "text-blue-400"
              },
              {
                icon: <Crown className="w-8 h-8" />,
                title: "Priority Support",
                description: "24/7 priority assistance with dedicated account management",
                color: "text-purple-400"
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "AI Legal Tools",
                description: "Advanced AI-powered legal research and document analysis",
                color: "text-yellow-400"
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Enhanced Security",
                description: "Advanced encryption and security features for sensitive data",
                color: "text-green-400"
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Team Collaboration",
                description: "Advanced team features and collaboration tools",
                color: "text-cyan-400"
              },
              {
                icon: <Calendar className="w-8 h-8" />,
                title: "Advanced Scheduling",
                description: "Smart scheduling with automated reminders and calendar sync",
                color: "text-pink-400"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className={`${feature.color} mb-4 flex justify-center`}>
                  {feature.icon}
                </div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-300 text-sm mb-4">{feature.description}</p>
                <UpgradeToPremiumButton className="text-xs" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="text-center mt-16"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Join thousands of legal professionals already using ChainVerdict Premium
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <GetPremiumButton />
            <ViewPricingButton />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DemoPage;
