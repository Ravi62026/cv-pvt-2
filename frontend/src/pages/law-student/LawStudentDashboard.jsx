import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { BookOpen, Users, FileText, Clock, TrendingUp, Award, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LawStudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isLawStudent } = useAuth();
  const { success } = useToast();
  const [stats, setStats] = useState({
    coursesEnrolled: 5,
    studyHours: 24,
    resourcesAccessed: 12,
    certificatesEarned: 2
  });

  useEffect(() => {
    // Verify user is a law student
    if (!isLawStudent()) {
      navigate('/dashboard');
    }
  }, [isLawStudent, navigate]);

  const handleLogout = async () => {
    await logout();
    success('Logged out successfully');
    navigate('/login');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <motion.div
      variants={itemVariants}
      className={`bg-gradient-to-br ${color} rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90 mb-1">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <Icon className="w-12 h-12 opacity-50" />
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0B1C] via-[#1a1d3a] to-[#0A0B1C] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Welcome, {user?.name}! 📚
            </h1>
            <p className="text-gray-400">Law Student Dashboard</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Logout</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <StatCard
          icon={BookOpen}
          label="Courses Enrolled"
          value={stats.coursesEnrolled}
          color="from-blue-600 to-blue-400"
        />
        <StatCard
          icon={Clock}
          label="Study Hours"
          value={stats.studyHours}
          color="from-purple-600 to-purple-400"
        />
        <StatCard
          icon={FileText}
          label="Resources Accessed"
          value={stats.resourcesAccessed}
          color="from-green-600 to-green-400"
        />
        <StatCard
          icon={Award}
          label="Certificates Earned"
          value={stats.certificatesEarned}
          color="from-orange-600 to-orange-400"
        />
      </motion.div>

      {/* Main Content Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Learning Resources */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-blue-900/30 hover:border-blue-700/50 transition-all"
        >
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Learning Resources</h2>
          </div>
          <div className="space-y-4">
            {[
              { title: 'Constitutional Law Basics', progress: 75 },
              { title: 'Criminal Procedure', progress: 60 },
              { title: 'Contract Law Fundamentals', progress: 85 },
              { title: 'Tort Law Introduction', progress: 45 },
            ].map((course, idx) => (
              <motion.div
                key={idx}
                whileHover={{ x: 5 }}
                className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-medium">{course.title}</p>
                  <span className="text-sm text-gray-400">{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${course.progress}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={itemVariants}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-blue-900/30 hover:border-blue-700/50 transition-all"
        >
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-bold text-white">Quick Actions</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Browse Courses', icon: '📖' },
              { label: 'View Certificates', icon: '🏆' },
              { label: 'Study Materials', icon: '📚' },
              { label: 'Connect with Mentors', icon: '👥' },
            ].map((action, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 hover:from-blue-600/40 hover:to-cyan-600/40 rounded-lg text-white transition-all text-left"
              >
                <span className="text-xl">{action.icon}</span>
                <span className="font-medium">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        variants={itemVariants}
        className="mt-6 bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-blue-900/30 hover:border-blue-700/50 transition-all"
      >
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-6 h-6 text-orange-400" />
          <h2 className="text-xl font-bold text-white">Recent Activity</h2>
        </div>
        <div className="space-y-3">
          {[
            { activity: 'Completed "Constitutional Law Basics" module', time: '2 hours ago' },
            { activity: 'Earned "Legal Research" certificate', time: '1 day ago' },
            { activity: 'Accessed Criminal Procedure study guide', time: '2 days ago' },
            { activity: 'Connected with mentor Dr. Sharma', time: '3 days ago' },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ x: 5 }}
              className="flex items-start gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-white text-sm">{item.activity}</p>
                <p className="text-gray-500 text-xs mt-1">{item.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center text-gray-500 text-sm"
      >
        <p>Welcome to your learning journey! Keep exploring and growing your legal knowledge. 🎓</p>
      </motion.div>
    </div>
  );
};

export default LawStudentDashboard;
