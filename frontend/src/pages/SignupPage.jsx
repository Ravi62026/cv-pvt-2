import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  UserPlus,
  ArrowRight,
  ArrowLeft,
  Scale,
  Users,
  CheckCircle,
  UserCheck,
  AlertCircle,
  Info,
  Gavel,
  FileText,
  BookOpen
} from 'lucide-react';

import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { authAPI } from '../services/api';
import { AuthBackground } from '../components/AuthBackground';
import { AuthContent } from '../components/AuthContent';

const SignupPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const { success, error } = useToast();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [step, setStep] = useState(1);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Debug reCAPTCHA v3 on component mount
  useEffect(() => {
    console.log('SignupPage mounted with reCAPTCHA v3');
    console.log('VITE_RECAPTCHA_SITE_KEY:', import.meta.env.VITE_RECAPTCHA_SITE_KEY);
  }, []);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
    barId: '',
    specialization: [],
    experience: '',
    education: '',
    universityName: '',
    enrollmentYear: new Date().getFullYear(),
    semester: '1st',
    studentSpecialization: '',
    rollNumber: '',

    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  // Password strength criteria
  const strengthChecks = {
    length: password => password.length >= 8,
    uppercase: password => /[A-Z]/.test(password),
    lowercase: password => /[a-z]/.test(password),
    number: password => /[0-9]/.test(password),
    special: password => /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  // Debounce typing indicator
  useEffect(() => {
    if (isTyping) {
      const timer = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isTyping]);

  // Calculate password strength
  useEffect(() => {
    const password = formData.password;
    let strength = 0;
    
    Object.values(strengthChecks).forEach(check => {
      if (check(password)) strength += 1;
    });
    
    setPasswordStrength(strength);
  }, [formData.password]);

  const roles = [
    {
      id: 'citizen',
      title: 'Citizen',
      description: 'Seeking legal advice and consultation',
      icon: Users,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'lawyer',
      title: 'Lawyer',
      description: 'Providing legal services and consultation',
      icon: Scale,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'law_student',
      title: 'Law Student',
      description: 'Learning and exploring legal practice',
      icon: FileText,
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;
    
    // Strip leading 0 from phone number
    if (name === 'phone' && finalValue.startsWith('0')) {
      finalValue = finalValue.substring(1);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
    setIsTyping(true);
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRoleSelect = (roleId) => {
    setFormData(prev => ({ ...prev, role: roleId }));
    if (errors.role) {
      setErrors(prev => ({ ...prev, role: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.role) {
      newErrors.role = 'Please select your role';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (formData.role === 'lawyer' && !formData.barId) {
      newErrors.barId = 'Bar ID is required for lawyers';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep2()) return;

    if (!executeRecaptcha) {
      setApiError('reCAPTCHA not loaded yet. Please try again.');
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      // Execute reCAPTCHA v3
      const captchaToken = await executeRecaptcha('signup');
      console.log('reCAPTCHA v3 token generated:', captchaToken?.substring(0, 20) + '...');

      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        captchaToken: captchaToken,
        address: {
          street: '',
          city: '',
          state: '',
          pincode: '',
        },
      };

      // Add lawyer details (required for lawyers)
      if (formData.role === 'lawyer') {
        userData.lawyerDetails = {
          barRegistrationNumber: formData.barId || '',
          specialization: formData.specialization.length > 0 ? formData.specialization : ['General Practice'],
          experience: parseInt(formData.experience) || 0,
          education: formData.education || 'Law Graduate',
        };
      }

      // Add student details for law students
      if (formData.role === 'law_student') {
        userData.studentDetails = {
          universityName: formData.universityName || '',
          enrollmentYear: parseInt(formData.enrollmentYear) || new Date().getFullYear(),
          semester: formData.semester || '1st',
          specialization: formData.studentSpecialization || '',
          rollNumber: formData.rollNumber || '',
        };
      }

      // Call registration API
      const response = await authAPI.register(userData);

      if (response.success) {
        // Auto-login after successful registration with both tokens
        await login(
          response.data.tokens.accessToken,
          response.data.user,
          response.data.tokens.refreshToken
        );

        // Get user role for personalized message
        const userRole = response.data.user.role;
        const roleNames = {
          citizen: 'Citizen',
          lawyer: 'Lawyer',
          law_student: 'Law Student',
          admin: 'Admin'
        };
        const roleName = roleNames[userRole] || 'User';
        
        success(`Registration successful! Welcome to CV-PVT as ${roleName}.`);

        // Redirect based on role and profile completion
        if (userRole === 'lawyer' && !response.data.user.profileCompletion?.roleSpecificDetails) {
          // Redirect lawyer to complete profile
          navigate('/profile?complete=true');
        } else if (userRole === 'admin') {
          navigate('/admin/dashboard');
        } else if (userRole === 'lawyer') {
          navigate('/lawyer/dashboard');
        } else if (userRole === 'law_student') {
          navigate('/law-student/dashboard');
        } else {
          navigate('/citizen/dashboard');
        }
      } else {
        // Handle API response errors
        let errorMessage = response.error || 'Registration failed';
        setApiError(errorMessage);
        error(errorMessage);
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.error('Registration error:', err);
      let errorMessage = 'An unexpected error occurred. Please try again.';

      // Handle specific validation errors
      if (err.response && err.response.data && err.response.data.errors) {
        const validationErrors = err.response.data.errors;
        errorMessage = validationErrors.map(error => error.msg).join(', ');
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Check if user already exists
      if (errorMessage.toLowerCase().includes('user with this email already exists') || 
          errorMessage.toLowerCase().includes('email already exists') ||
          errorMessage.toLowerCase().includes('user already exists') ||
          errorMessage.toLowerCase().includes('already registered')) {
        setApiError('Account already exists with this email. Redirecting to login...');
        error('Account already exists. Please login.');
        setIsLoading(false);
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setApiError(errorMessage);
        error(errorMessage);
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0A0B1C]">
      {/* Animated Glow Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[520px] h-[340px] bg-cyan-500/10 blur-3xl rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-800/20 blur-2xl rounded-full animate-pulse delay-1000" />
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-600/10 blur-2xl rounded-full animate-pulse delay-500" />

        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400/30 rounded-full animate-float" />
        <div className="absolute top-3/4 left-3/4 w-1 h-1 bg-blue-400/40 rounded-full animate-float delay-1000" />
        <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-purple-400/30 rounded-full animate-float delay-2000" />
        <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-cyan-300/50 rounded-full animate-float delay-3000" />

        {/* Gradient orbs */}
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full blur-xl animate-float delay-500" />
        <div className="absolute bottom-1/3 right-1/3 w-24 h-24 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-xl animate-float delay-1500" />
      </div>

      {/* Left Side - Hidden on mobile, shown on lg+ */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <AuthBackground />
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <AuthContent
            title="Join ChainVerdict"
            subtitle="Your journey to transparent justice begins here"
          />
        </div>
      </div>

      {/* Right Form */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-[#0A0B1C] relative z-10 min-h-screen lg:min-h-0">
        <div className="w-full max-w-lg">
          {/* Mobile Header */}
          <div className="lg:hidden mb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-between mb-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-cyan-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  CV
                </div>
                <span className="text-white text-xl font-semibold">ChainVerdict</span>
              </div>
              <div className="flex gap-2 text-sm">
                <Link
                  to="/"
                  className="text-gray-400 hover:text-white transition-colors duration-200 px-3 py-1.5 rounded-lg hover:bg-white/5"
                >
                  Home
                </Link>
                <Link
                  to="/login"
                  className="text-blue-400 hover:text-blue-300 transition-colors duration-200 px-3 py-1.5 rounded-lg hover:bg-blue-500/10"
                >
                  Sign In
                </Link>
              </div>
            </motion.div>

            {/* Mobile Welcome Section */}
            {/* <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center mb-8"
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Join ChainVerdict
              </h1>
              <p className="text-gray-300 text-sm sm:text-base">
                Your journey to transparent justice begins here
              </p>
            </motion.div> */}
          </div>

          {/* Desktop Welcome Header - Hidden on mobile */}
          {/* <div className="hidden lg:block text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-bold text-white mb-2"
            >
              Create Account
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-gray-300"
            >
              Join the future of legal services
            </motion.p>
          </div> */}
          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center items-center space-x-4 mb-8"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: step >= 1 ? [1, 1.1, 1] : 1,
                opacity: 1
              }}
              transition={{ duration: 0.3 }}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 relative ${
                step >= 1 ? 'bg-gradient-to-br from-blue-700 to-cyan-500 text-white shadow-lg shadow-cyan-500/25' : 'bg-[#1D1F3B] text-gray-400'
              }`}
            >
              {step >= 1 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600 to-cyan-400 animate-pulse"
                />
              )}
              <span className="relative z-10">1</span>
            </motion.div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: step >= 2 ? 1 : 0.3 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`w-16 h-1 rounded-full transition-all duration-500 ${
                step >= 2 ? 'bg-gradient-to-r from-blue-700 via-purple-500 to-cyan-500' : 'bg-[#1D1F3B]'
              }`}
            >
              {step >= 2 && (
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-full w-4 bg-white/30 rounded-full"
                />
              )}
            </motion.div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: step >= 2 ? [1, 1.1, 1] : 1,
                opacity: 1
              }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 relative ${
                step >= 2 ? 'bg-gradient-to-br from-blue-700 to-cyan-500 text-white shadow-lg shadow-cyan-500/25' : 'bg-[#1D1F3B] text-gray-400'
              }`}
            >
              {step >= 2 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600 to-cyan-400 animate-pulse"
                />
              )}
              <span className="relative z-10">2</span>
            </motion.div>
          </motion.div>
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                transition={{ duration: 0.3 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-blue-900/30 relative overflow-hidden hover:shadow-cyan-500/10 hover:shadow-2xl transition-all duration-300"
              >
                {/* Animated border */}
                <div className="absolute inset-0 rounded-2xl pointer-events-none border-2 border-transparent bg-gradient-to-br from-blue-700/30 via-cyan-400/10 to-purple-500/10 animate-gradient-move" style={{zIndex:0}} />

                {/* Floating icons */}
                <div className="absolute top-4 right-4 opacity-20">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Scale className="w-6 h-6 text-blue-400" />
                  </motion.div>
                </div>

                <motion.h3
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl font-semibold text-white mb-6 relative z-10"
                >
                  Choose your role
                </motion.h3>
                <div className="space-y-4 relative z-10">
                  {roles.map((role, index) => (
                    <motion.div
                      key={role.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRoleSelect(role.id)}
                      className={`cursor-pointer rounded-xl p-4 border transition-all duration-300 relative overflow-hidden group ${
                        formData.role === role.id
                          ? 'bg-gradient-to-r from-blue-700 to-cyan-500 border-transparent shadow-lg shadow-cyan-500/25'
                          : 'bg-[#181B2E]/80 border-blue-900/40 hover:bg-[#252849] hover:border-blue-700/60'
                      }`}
                    >
                      {/* Hover effect background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className={`flex items-center space-x-4 relative z-10`}>
                        <motion.div
                          className={`p-2 rounded-lg transition-all duration-300 ${
                            formData.role === role.id ? 'bg-white/20' : 'bg-[#16182F] group-hover:bg-blue-900/30'
                          }`}
                          whileHover={{ rotate: 5 }}
                        >
                          <role.icon className="w-6 h-6 text-white" />
                        </motion.div>
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-white">{role.title}</h4>
                          <p className="text-sm text-gray-300">{role.description}</p>
                        </div>
                        <AnimatePresence>
                          {formData.role === role.id && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 180 }}
                              transition={{ type: "spring", duration: 0.5 }}
                            >
                              <CheckCircle className="w-6 h-6 text-white" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {errors.role && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-400 flex items-center gap-1"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {errors.role}
                  </motion.p>
                )}

                <motion.button
                  type="button"
                  onClick={handleNext}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-700 via-cyan-500 to-purple-500 text-white rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[#16182F] shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/25 relative overflow-hidden group"
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10 flex items-center gap-2">
                    Continue
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </div>
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                transition={{ duration: 0.3 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-blue-900/30 relative overflow-hidden hover:shadow-cyan-500/10 hover:shadow-2xl transition-all duration-300"
              >
                {/* Animated border */}
                <div className="absolute inset-0 rounded-2xl pointer-events-none border-2 border-transparent bg-gradient-to-br from-blue-700/30 via-cyan-400/10 to-purple-500/10 animate-gradient-move" style={{zIndex:0}} />

                {/* Floating icons */}
                <div className="absolute top-4 right-4 opacity-20">
                  <motion.div
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Gavel className="w-5 h-5 text-cyan-400" />
                  </motion.div>
                </div>

                {/* Typing indicator */}
                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute top-4 left-4 flex items-center gap-1"
                    >
                      <div className="flex gap-1">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                          className="w-1 h-1 bg-cyan-400 rounded-full"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                          className="w-1 h-1 bg-cyan-400 rounded-full"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                          className="w-1 h-1 bg-cyan-400 rounded-full"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <AnimatePresence>
                    {apiError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3"
                      >
                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-red-400 text-sm">{apiError}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Name Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="relative z-10"
                  >
                    <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-2">
                      Full Name
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <motion.div
                          animate={isTyping ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          <User className="h-5 w-5 text-cyan-400" />
                        </motion.div>
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-3 bg-[#181B2E]/80 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 group-hover:border-blue-700/60 ${
                          errors.name ? 'border-red-500 ring-red-500/20' : 'border-blue-900/40'
                        }`}
                        placeholder="Enter your full name"
                      />
                      {/* Animated underline */}
                      <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 group-focus-within:w-full" />
                    </div>
                    <AnimatePresence>
                      {errors.name && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-2 text-sm text-red-400 flex items-center gap-1"
                        >
                          <AlertCircle className="w-4 h-4" />
                          {errors.name}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Email Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="relative z-10"
                  >
                    <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                      Email Address
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <motion.div
                          animate={isTyping ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          <Mail className="h-5 w-5 text-cyan-400" />
                        </motion.div>
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-3 bg-[#181B2E]/80 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 group-hover:border-blue-700/60 ${
                          errors.email ? 'border-red-500 ring-red-500/20' : 'border-blue-900/40'
                        }`}
                        placeholder="Enter your email"
                      />
                      {/* Animated underline */}
                      <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 group-focus-within:w-full" />
                    </div>
                    <AnimatePresence>
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-2 text-sm text-red-400 flex items-center gap-1"
                        >
                          <AlertCircle className="w-4 h-4" />
                          {errors.email}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Phone Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="relative z-10"
                  >
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-200 mb-2">
                      Phone Number
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <motion.div
                          animate={isTyping ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          <Phone className="h-5 w-5 text-cyan-400" />
                        </motion.div>
                      </div>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-3 bg-[#181B2E]/80 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 group-hover:border-blue-700/60 ${
                          errors.phone ? 'border-red-500 ring-red-500/20' : 'border-blue-900/40'
                        }`}
                        placeholder="Enter your phone number"
                      />
                      {/* Animated underline */}
                      <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 group-focus-within:w-full" />
                    </div>
                    <AnimatePresence>
                      {errors.phone && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-2 text-sm text-red-400 flex items-center gap-1"
                        >
                          <AlertCircle className="w-4 h-4" />
                          {errors.phone}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Password Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="relative z-10"
                  >
                    <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                      Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <motion.div
                          animate={isTyping ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          <Lock className="h-5 w-5 text-cyan-400" />
                        </motion.div>
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-10 py-3 bg-[#181B2E]/80 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 group-hover:border-blue-700/60 ${
                          errors.password ? 'border-red-500 ring-red-500/20' : 'border-blue-900/40'
                        }`}
                        placeholder="Create a password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors duration-300"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                      {/* Animated underline */}
                      <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 group-focus-within:w-full" />
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <motion.div
                              key={level}
                              className={`h-1 w-full rounded-full ${
                                level <= passwordStrength
                                  ? level <= 2
                                    ? 'bg-red-500'
                                    : level <= 3
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                  : 'bg-gray-700'
                              }`}
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{ duration: 0.2, delay: level * 0.1 }}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          Password strength: {
                            passwordStrength <= 2 ? 'Weak' :
                            passwordStrength <= 3 ? 'Medium' :
                            'Strong'
                          }
                        </p>
                      </div>
                    )}
                    
                    <AnimatePresence>
                      {errors.password && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-2 text-sm text-red-400 flex items-center gap-1"
                        >
                          <AlertCircle className="w-4 h-4" />
                          {errors.password}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Confirm Password Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="relative z-10"
                  >
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <motion.div
                          animate={isTyping ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          <Lock className="h-5 w-5 text-cyan-400" />
                        </motion.div>
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-10 py-3 bg-[#181B2E]/80 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 group-hover:border-blue-700/60 ${
                          errors.confirmPassword ? 'border-red-500 ring-red-500/20' : 'border-blue-900/40'
                        }`}
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors duration-300"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                      {/* Animated underline */}
                      <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 group-focus-within:w-full" />
                    </div>
                    <AnimatePresence>
                      {errors.confirmPassword && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-2 text-sm text-red-400 flex items-center gap-1"
                        >
                          <AlertCircle className="w-4 h-4" />
                          {errors.confirmPassword}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Law Student Fields */}
                  {formData.role === 'law_student' && (
                    <div className="space-y-4">
                      {/* University Name */}
                      <div>
                        <label htmlFor="universityName" className="block text-sm font-medium text-gray-200 mb-2">
                          University Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <BookOpen className="h-5 w-5 text-gray-500" />
                          </div>
                          <input
                            id="universityName"
                            name="universityName"
                            type="text"
                            value={formData.universityName}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-3 py-3 bg-[#1D1F3B] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                            placeholder="e.g., Delhi University"
                          />
                        </div>
                      </div>

                      {/* Enrollment Year */}
                      <div>
                        <label htmlFor="enrollmentYear" className="block text-sm font-medium text-gray-200 mb-2">
                          Enrollment Year
                        </label>
                        <select
                          id="enrollmentYear"
                          name="enrollmentYear"
                          value={formData.enrollmentYear}
                          onChange={handleChange}
                          className="block w-full px-3 py-3 bg-[#1D1F3B] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                        >
                          {[2020, 2021, 2022, 2023, 2024, 2025].map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>

                      {/* Semester */}
                      <div>
                        <label htmlFor="semester" className="block text-sm font-medium text-gray-200 mb-2">
                          Current Semester
                        </label>
                        <select
                          id="semester"
                          name="semester"
                          value={formData.semester}
                          onChange={handleChange}
                          className="block w-full px-3 py-3 bg-[#1D1F3B] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                        >
                          {['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'].map(sem => (
                            <option key={sem} value={sem}>{sem}</option>
                          ))}
                        </select>
                      </div>

                      {/* Specialization */}
                      <div>
                        <label htmlFor="studentSpecialization" className="block text-sm font-medium text-gray-200 mb-2">
                          Specialization (Optional)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FileText className="h-5 w-5 text-gray-500" />
                          </div>
                          <input
                            id="studentSpecialization"
                            name="studentSpecialization"
                            type="text"
                            value={formData.studentSpecialization}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-3 py-3 bg-[#1D1F3B] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                            placeholder="e.g., Criminal Law, Corporate Law"
                          />
                        </div>
                      </div>

                      {/* Roll Number */}
                      <div>
                        <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-200 mb-2">
                          Roll Number (Optional)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserCheck className="h-5 w-5 text-gray-500" />
                          </div>
                          <input
                            id="rollNumber"
                            name="rollNumber"
                            type="text"
                            value={formData.rollNumber}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-3 py-3 bg-[#1D1F3B] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                            placeholder="Enter your roll number"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bar ID Field (for lawyers) */}
                  {formData.role === 'lawyer' && (
                    <div>
                      <label htmlFor="barId" className="block text-sm font-medium text-gray-200 mb-2">
                        Bar Council ID (Optional)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserCheck className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                          id="barId"
                          name="barId"
                          type="text"
                          value={formData.barId}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-3 bg-[#1D1F3B] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                          placeholder="Enter your Bar Council ID"
                        />
                      </div>
                    </div>
                  )}

                  {/* Experience Field (for lawyers) */}
                  {formData.role === 'lawyer' && (
                    <div>
                      <label htmlFor="experience" className="block text-sm font-medium text-gray-200 mb-2">
                        Years of Experience (Optional)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Gavel className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                          id="experience"
                          name="experience"
                          type="number"
                          min="0"
                          max="50"
                          value={formData.experience}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-3 bg-[#1D1F3B] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                          placeholder="Years of practice"
                        />
                      </div>
                    </div>
                  )}

                  {/* Specialization Field (for lawyers) */}
                  {formData.role === 'lawyer' && (
                    <div>
                      <label htmlFor="specialization" className="block text-sm font-medium text-gray-200 mb-2">
                        Specialization (Optional)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Gavel className="h-5 w-5 text-gray-500" />
                        </div>
                        <select
                          id="specialization"
                          name="specialization"
                          value={formData.specialization[0] || ''}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              specialization: e.target.value ? [e.target.value] : []
                            });
                          }}
                          className="block w-full pl-10 pr-3 py-3 bg-[#1D1F3B] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        >
                          <option value="">Select specialization</option>
                          <option value="Criminal Law">Criminal Law</option>
                          <option value="Civil Law">Civil Law</option>
                          <option value="Corporate Law">Corporate Law</option>
                          <option value="Family Law">Family Law</option>
                          <option value="Property Law">Property Law</option>
                          <option value="Labor Law">Labor Law</option>
                          <option value="Tax Law">Tax Law</option>
                          <option value="Constitutional Law">Constitutional Law</option>
                          <option value="Environmental Law">Environmental Law</option>
                          <option value="General Practice">General Practice</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Education Field (for lawyers) */}
                  {formData.role === 'lawyer' && (
                    <div>
                      <label htmlFor="education" className="block text-sm font-medium text-gray-200 mb-2">
                        Education (Optional)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FileText className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                          id="education"
                          name="education"
                          type="text"
                          value={formData.education}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-3 bg-[#1D1F3B] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                          placeholder="e.g., LLB, LLM, etc."
                        />
                      </div>
                    </div>
                  )}

                  {/* Terms and Conditions */}
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="acceptTerms"
                        name="acceptTerms"
                        type="checkbox"
                        checked={formData.acceptTerms}
                        onChange={handleChange}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 bg-white/10 border-white/20 rounded"
                      />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="acceptTerms" className="text-sm text-gray-300">
                        I agree to the{' '}
                        <Link to="/terms" className="text-purple-400 hover:text-purple-300 transition-colors duration-300 underline">
                          Terms and Conditions
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy" className="text-purple-400 hover:text-purple-300 transition-colors duration-300 underline">
                          Privacy Policy
                        </Link>
                      </label>
                      <AnimatePresence>
                        {errors.acceptTerms && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-2 text-sm text-red-400 flex items-center gap-1"
                          >
                            <AlertCircle className="w-4 h-4" />
                            {errors.acceptTerms}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* reCAPTCHA v3 Badge Info */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="flex justify-center relative z-10"
                  >
                    <div className="text-center text-xs text-gray-400">
                      Protected by reCAPTCHA v3
                    </div>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="flex flex-col sm:flex-row gap-3 sm:gap-4 relative z-10"
                  >
                    <motion.button
                      type="button"
                      onClick={handleBack}
                      whileHover={{ scale: 1.02, x: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#181B2E]/80 text-white rounded-lg font-medium border border-blue-900/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[#16182F] transition-all duration-300 hover:bg-[#252849] hover:border-blue-700/60 backdrop-blur-sm"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={!isLoading ? { scale: 1.02, y: -2 } : {}}
                      whileTap={!isLoading ? { scale: 0.98 } : {}}
                      className={`w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-700 via-cyan-500 to-purple-500 text-white rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[#16182F] shadow-lg transition-all duration-300 relative overflow-hidden ${
                        isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-2xl hover:shadow-cyan-500/25'
                      }`}
                    >
                      {/* Animated background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-400 to-purple-400 opacity-0 hover:opacity-100 transition-opacity duration-300" />

                      <div className="relative z-10 flex items-center gap-2">
                        {isLoading ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                            />
                            <span className="hidden sm:inline">Creating Account...</span>
                            <span className="sm:hidden">Creating...</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-5 h-5" />
                            <span className="hidden sm:inline">Create Account</span>
                            <span className="sm:hidden">Create</span>
                            <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
                          </>
                        )}
                      </div>
                    </motion.button>
                  </motion.div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sign In Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-center"
          >
            <p className="text-gray-400">
              Already have an account?{' '}
              <motion.span whileHover={{ scale: 1.05 }}>
                <Link
                  to="/login"
                  className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors duration-300 underline underline-offset-4 decoration-2 inline-flex items-center gap-1"
                >
                  Sign in
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </motion.span>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage; 
