import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, MapPin, Edit3, Save, X, Camera, Shield, Lock, Eye, EyeOff, Clock, RefreshCw, BookOpen, FileText, AlertCircle, Gavel } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { authAPI } from '../services/api';

const ProfilePage = () => {
  const { user, updateProfile, refreshUser } = useAuth();
  const { success, error } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
    },
    lawyerDetails: {
      barRegistrationNumber: '',
      specialization: [],
      experience: '',
      education: '',
    },
    studentDetails: {
      universityName: '',
      enrollmentYear: new Date().getFullYear(),
      semester: '1st',
      specialization: '',
      rollNumber: '',
    },
  });

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          pincode: user.address?.pincode || '',
        },
        lawyerDetails: {
          barRegistrationNumber: user.lawyerDetails?.barRegistrationNumber || '',
          specialization: user.lawyerDetails?.specialization || [],
          experience: user.lawyerDetails?.experience || '',
          education: user.lawyerDetails?.education || '',
        },
        studentDetails: {
          universityName: user.studentDetails?.universityName || '',
          enrollmentYear: user.studentDetails?.enrollmentYear || new Date().getFullYear(),
          semester: user.studentDetails?.semester || '1st',
          specialization: user.studentDetails?.specialization || '',
          rollNumber: user.studentDetails?.rollNumber || '',
        },
      });
    }
  }, [user]);

  // Refresh user data when component mounts to get latest verification status
  useEffect(() => {
    const refreshUserData = async () => {
      if (user && user.role === 'lawyer') {
        try {
          await refreshUser();
        } catch (err) {
          console.error('Failed to refresh user data:', err);
        }
      }
    };

    refreshUserData();
  }, []); // Only run once when component mounts

  // Manual refresh function
  const handleRefreshUser = async () => {
    try {
      setIsLoading(true);
      const result = await refreshUser();
      if (result.success) {
        success('Profile data refreshed successfully');
      } else {
        error('Failed to refresh profile data');
      }
    } catch (err) {
      error('Failed to refresh profile data');
      console.error('Refresh error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSpecializationChange = (specialization) => {
    setFormData(prev => ({
      ...prev,
      lawyerDetails: {
        ...prev.lawyerDetails,
        specialization: prev.lawyerDetails.specialization.includes(specialization)
          ? prev.lawyerDetails.specialization.filter(s => s !== specialization)
          : [...prev.lawyerDetails.specialization, specialization],
      },
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
      };

      if (user.role === 'lawyer') {
        updateData.lawyerDetails = formData.lawyerDetails;
      } else if (user.role === 'law_student') {
        updateData.studentDetails = formData.studentDetails;
      }

      const response = await authAPI.updateProfile(updateData);
      
      if (response.success) {
        updateProfile(response.data.user);
        success('Profile updated successfully');
        setIsEditing(false);
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      error(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          pincode: user.address?.pincode || '',
        },
        lawyerDetails: {
          barRegistrationNumber: user.lawyerDetails?.barRegistrationNumber || '',
          specialization: user.lawyerDetails?.specialization || [],
          experience: user.lawyerDetails?.experience || '',
          education: user.lawyerDetails?.education || '',
        },
        studentDetails: {
          universityName: user.studentDetails?.universityName || '',
          enrollmentYear: user.studentDetails?.enrollmentYear || new Date().getFullYear(),
          semester: user.studentDetails?.semester || '1st',
          specialization: user.studentDetails?.specialization || '',
          rollNumber: user.studentDetails?.rollNumber || '',
        },
      });
    }
    setIsEditing(false);
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      error('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      error('New password must be at least 8 characters long');
      return;
    }

    try {
      setIsLoading(true);
      const response = await authAPI.updatePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
        passwordData.confirmPassword
      );

      if (response.success) {
        success('Password updated successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordSection(false);
      }
    } catch (err) {
      error(err.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const specializations = [
    'Civil Law', 'Criminal Law', 'Family Law', 'Property Law', 
    'Corporate Law', 'Tax Law', 'Labor Law', 'Constitutional Law'
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0B1C] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0B1C] py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Animated Glow Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[520px] h-[340px] bg-cyan-500/10 blur-3xl rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-800/20 blur-2xl rounded-full animate-pulse delay-1000" />
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-600/10 blur-2xl rounded-full animate-pulse delay-500" />
      </div>
      <div className="relative z-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-12 w-12 text-white" />
                </div>
                <button className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow">
                  <Camera className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{user.name}</h1>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.role === 'lawyer' ? 'bg-blue-500/20 text-blue-300' :
                    user.role === 'admin' ? 'bg-red-500/20 text-red-300' :
                    'bg-green-500/20 text-green-300'
                  }`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>

                  {/* Verification Status */}
                  {user.role === 'lawyer' ? (
                    <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                      user.lawyerDetails?.verificationStatus === 'verified'
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : user.lawyerDetails?.verificationStatus === 'rejected'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                    }`}>
                      {user.lawyerDetails?.verificationStatus === 'verified' ? (
                        <>
                          <Shield className="h-4 w-4" />
                          <span>Verified Lawyer</span>
                        </>
                      ) : user.lawyerDetails?.verificationStatus === 'rejected' ? (
                        <>
                          <X className="h-4 w-4" />
                          <span>Verification Rejected</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4" />
                          <span>Verification Pending</span>
                        </>
                      )}
                    </div>
                  ) : user.isVerified && (
                    <div className="flex items-center space-x-1 bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium border border-green-500/30">
                      <Shield className="h-4 w-4" />
                      <span>Verified</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              {!isEditing ? (
                <>
                  <button
                    onClick={handleRefreshUser}
                    disabled={isLoading}
                    className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Basic Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-white">{user.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <p className="text-white">{user.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <p className="text-white">{user.phone || 'Not provided'}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Address Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Address
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Street</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-white">{user.address?.street || 'Not provided'}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-white">{user.address?.city || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">State</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-white">{user.address?.state || 'Not provided'}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Pincode</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address.pincode"
                    value={formData.address.pincode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-white">{user.address?.pincode || 'Not provided'}</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Role-Specific Fields */}
        {user.role === 'lawyer' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Gavel className="h-5 w-5 mr-2" />
                Lawyer Details
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bar Registration Number</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="lawyerDetails.barRegistrationNumber"
                      value={formData.lawyerDetails.barRegistrationNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  ) : (
                    <p className="text-white">{user.lawyerDetails?.barRegistrationNumber || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Experience (Years)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="lawyerDetails.experience"
                      value={formData.lawyerDetails.experience}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  ) : (
                    <p className="text-white">{user.lawyerDetails?.experience || 'Not provided'}</p>
                  )}
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Education</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="lawyerDetails.education"
                      value={formData.lawyerDetails.education}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  ) : (
                    <p className="text-white">{user.lawyerDetails?.education || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {user.role === 'law_student' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Student Details
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">University Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="studentDetails.universityName"
                      value={formData.studentDetails.universityName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-white">{user.studentDetails?.universityName || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Enrollment Year</label>
                  {isEditing ? (
                    <select
                      name="studentDetails.enrollmentYear"
                      value={formData.studentDetails.enrollmentYear}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {[2020, 2021, 2022, 2023, 2024, 2025].map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-white">{user.studentDetails?.enrollmentYear || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Current Semester</label>
                  {isEditing ? (
                    <select
                      name="studentDetails.semester"
                      value={formData.studentDetails.semester}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'].map(sem => (
                        <option key={sem} value={sem}>{sem}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-white">{user.studentDetails?.semester || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Roll Number</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="studentDetails.rollNumber"
                      value={formData.studentDetails.rollNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-white">{user.studentDetails?.rollNumber || 'Not provided'}</p>
                  )}
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Specialization</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="studentDetails.specialization"
                      value={formData.studentDetails.specialization}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-white">{user.studentDetails?.specialization || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Password Change Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Security Settings
              </h2>
              <button
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
              >
                {showPasswordSection ? 'Cancel' : 'Change Password'}
              </button>
            </div>

            {showPasswordSection && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordInputChange}
                      className="w-full px-3 py-2 pr-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordInputChange}
                      className="w-full px-3 py-2 pr-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordInputChange}
                      className="w-full px-3 py-2 pr-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowPasswordSection(false);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePasswordChange}
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      </div>
    </div>
  );
};

export default ProfilePage;
