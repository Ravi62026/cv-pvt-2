import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Brain,
  Scale,
  FileSearch,
  BookOpen,
  ArrowLeft,
  Sparkles,
  Zap,
  Target,
  Search
} from 'lucide-react';

// Import AI feature components (will be created next)
import BNSAdvisor from '../components/ai/BNSAdvisor';
import LegalAdvisor from '../components/ai/LegalAdvisor';
import JudgementAnalyser from '../components/ai/JudgementAnalyser';
import LegalResearchTool from '../components/ai/LegalResearchTool';

const AISection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(null);

  const aiFeatures = [
    {
      id: 'bns-advisor',
      title: 'BNS Advisor',
      description: 'Get expert guidance on BNS/BNSS/BSA legal framework. Analyze cases using the new Indian criminal justice codes.',
      icon: Scale,
      color: 'from-blue-500 to-cyan-500',
      features: ['BNS/BNSS/BSA Analysis', 'Case Verification', 'Legal Code Mapping'],
      component: BNSAdvisor
    },
    {
      id: 'legal-advisor',
      title: 'Legal Advisor',
      description: 'Comprehensive case analysis with evidence evaluation and optional legal debate scenarios.',
      icon: Brain,
      color: 'from-purple-500 to-pink-500',
      features: ['Case Analysis', 'Evidence Review', 'Legal Debate'],
      component: LegalAdvisor
    },
    {
      id: 'judgment-analyzer',
      title: 'Judgment Analyzer',
      description: 'Analyze court judgements, extract key insights, and understand legal precedents.',
      icon: FileSearch,
      color: 'from-green-500 to-emerald-500',
      features: ['Judgement Analysis', 'PDF Upload', 'Precedent Review'],
      component: JudgementAnalyser
    },
    {
      id: 'legal-research',
      title: 'Legal Research Tool',
      description: 'Advanced AI-powered legal research with multi-engine search and comprehensive analysis.',
      icon: Search,
      color: 'from-orange-500 to-red-500',
      features: ['Multi-Engine Search', 'Comprehensive Data', 'AI Analysis'],
      component: LegalResearchTool
    }
  ];

  // Check URL path to determine active feature
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/ai-tools/')) {
      const toolId = path.split('/ai-tools/')[1];
      const feature = aiFeatures.find(f => f.id === toolId);
      if (feature) {
        setActiveFeature(feature);
      }
    } else {
      setActiveFeature(null);
    }
  }, [location.pathname]); // Removed aiFeatures from dependencies to prevent infinite re-renders

  const handleFeatureSelect = (feature) => {
    navigate(`/ai-tools/${feature.id}`);
  };

  const handleBackToMenu = () => {
    navigate('/ai-tools');
  };

  if (activeFeature) {
    const FeatureComponent = activeFeature.component;
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-gray-600/15 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        </div>

        {/* Back Button */}
        <div className="relative z-10 pt-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={handleBackToMenu}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200 mb-6"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to AI Tools</span>
            </motion.button>
          </div>
        </div>

        {/* Feature Component */}
        <div className="relative z-10">
          <FeatureComponent onBack={handleBackToMenu} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gray-600/15 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-2xl flex items-center justify-center mr-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white">
                AI Legal Assistant
              </h1>
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Harness the power of artificial intelligence for comprehensive legal analysis. 
              Choose from our advanced AI tools designed for modern legal practice.
            </p>
          </motion.div>
        </div>
      </section>

      {/* AI Features Grid */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Choose Your AI Tool
            </h2>
            <p className="text-xl text-gray-300">
              Advanced AI-powered legal analysis at your fingertips
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {aiFeatures.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="card-sexy bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 cursor-pointer group hover:border-white/20 transition-all duration-300"
                onClick={() => handleFeatureSelect(feature)}
              >
                <div className={`card-icon bg-gradient-to-r ${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <div className="card-content">
                  <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-cyan-300 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 mb-6 group-hover:text-gray-200 transition-colors duration-300">
                    {feature.description}
                  </p>
                  <ul className="space-y-2 mb-6">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                        <div className={`w-2 h-2 bg-gradient-to-r ${feature.color} rounded-full mr-3`}></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300">
                    <span className="text-sm font-medium">Launch Tool</span>
                    <Zap className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 text-center"
          >
            <Target className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">
              Powered by Advanced AI
            </h3>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Our AI tools are built on the latest legal frameworks including BNS/BNSS/BSA (July 2024) 
              and provide comprehensive analysis with real-time verification and multi-engine research capabilities.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AISection;
