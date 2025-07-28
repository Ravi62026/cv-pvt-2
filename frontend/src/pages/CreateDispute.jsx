import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Scale,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  DollarSign,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { citizenAPI } from '../services/api';

const CreateDispute = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    disputeType: '',
    category: '',
    priority: 'medium',
    opposingParty: {
      name: '',
      contact: '',
      address: ''
    },
    disputeValue: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const disputeTypes = [
    { value: 'property', label: 'Property Dispute' },
    { value: 'contract', label: 'Contract Dispute' },
    { value: 'family', label: 'Family Dispute' },
    { value: 'employment', label: 'Employment Dispute' },
    { value: 'business', label: 'Business Dispute' },
    { value: 'consumer', label: 'Consumer Dispute' },
    { value: 'landlord-tenant', label: 'Landlord-Tenant Dispute' },
    { value: 'other', label: 'Other' }
  ];

  const categories = [
    { value: 'civil', label: 'Civil Law' },
    { value: 'criminal', label: 'Criminal Law' },
    { value: 'family', label: 'Family Law' },
    { value: 'property', label: 'Property Law' },
    { value: 'corporate', label: 'Corporate Law' },
    { value: 'tax', label: 'Tax Law' },
    { value: 'labor', label: 'Labor Law' },
    { value: 'other', label: 'Other' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-600 bg-green-100' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600 bg-yellow-100' },
    { value: 'high', label: 'High', color: 'text-orange-600 bg-orange-100' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600 bg-red-100' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('opposingParty.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        opposingParty: {
          ...prev.opposingParty,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 2000) {
      newErrors.description = 'Description cannot exceed 2000 characters';
    }
    
    if (!formData.disputeType) {
      newErrors.disputeType = 'Please select a dispute type';
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    
    if (formData.disputeValue && isNaN(formData.disputeValue)) {
      newErrors.disputeValue = 'Please enter a valid amount';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const submitData = {
        ...formData,
        disputeValue: formData.disputeValue ? parseFloat(formData.disputeValue) : undefined
      };

      const result = await citizenAPI.createDispute(submitData);

      if (result.success) {
        success('Dispute filed successfully!');
        navigate('/citizen/my-disputes');
      } else {
        error(result.error || 'Failed to file dispute');
      }
    } catch (err) {
      console.error('Submit dispute error:', err);
      error('Failed to file dispute. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 pt-24 pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-300 hover:text-white mb-4 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>

          <div className="flex items-center mb-4">
            <div className="bg-red-500/20 p-3 rounded-full mr-4 backdrop-blur-sm border border-red-400/30">
              <Scale className="h-8 w-8 text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">File Dispute</h1>
              <p className="text-gray-300 mt-1">
                Get legal assistance for your dispute resolution
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/20"
        >
          <div className="p-6 border-b border-white/20">
            <h2 className="text-xl font-semibold text-white">Dispute Details</h2>
            <p className="text-sm text-gray-300 mt-1">
              Provide comprehensive information about your dispute
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Dispute Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Brief summary of your dispute"
                className={`w-full px-3 py-2 bg-white/10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 text-white placeholder-gray-400 backdrop-blur-sm ${
                  errors.title ? 'border-red-400' : 'border-white/20'
                }`}
                maxLength={100}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-400 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.title}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-400">
                {formData.title.length}/100 characters
              </p>
            </div>

            {/* Dispute Type and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="disputeType" className="block text-sm font-medium text-gray-300 mb-2">
                  Dispute Type *
                </label>
                <select
                  id="disputeType"
                  name="disputeType"
                  value={formData.disputeType}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 bg-white/10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 text-white backdrop-blur-sm ${
                    errors.disputeType ? 'border-red-400' : 'border-white/20'
                  }`}
                >
                  <option value="" className="bg-slate-800 text-white">Select dispute type</option>
                  {disputeTypes.map(type => (
                    <option key={type.value} value={type.value} className="bg-slate-800 text-white">
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.disputeType && (
                  <p className="mt-1 text-sm text-red-400 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.disputeType}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                  Legal Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 bg-white/10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 text-white backdrop-blur-sm ${
                    errors.category ? 'border-red-400' : 'border-white/20'
                  }`}
                >
                  <option value="" className="bg-slate-800 text-white">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value} className="bg-slate-800 text-white">
                      {cat.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-400 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.category}
                  </p>
                )}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Priority Level
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {priorities.map(priority => (
                  <label
                    key={priority.value}
                    className={`relative flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all duration-200 backdrop-blur-sm ${
                      formData.priority === priority.value
                        ? 'border-red-400 bg-red-500/20'
                        : 'border-white/20 hover:border-white/40 bg-white/5'
                    }`}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={priority.value}
                      checked={formData.priority === priority.value}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <span className={`text-sm font-medium px-2 py-1 rounded ${priority.color.replace('text-', 'text-').replace('bg-', 'bg-').replace('100', '500/20')}`}>
                      {priority.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Dispute Value */}
            <div>
              <label htmlFor="disputeValue" className="block text-sm font-medium text-gray-300 mb-2">
                Dispute Value (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="disputeValue"
                  name="disputeValue"
                  value={formData.disputeValue}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={`w-full pl-10 pr-3 py-2 bg-white/10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 text-white placeholder-gray-400 backdrop-blur-sm ${
                    errors.disputeValue ? 'border-red-400' : 'border-white/20'
                  }`}
                />
              </div>
              {errors.disputeValue && (
                <p className="mt-1 text-sm text-red-400 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.disputeValue}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-400">
                Estimated monetary value involved in the dispute
              </p>
            </div>

            {/* Opposing Party Information */}
            <div className="border-t border-white/20 pt-6">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-gray-300" />
                Opposing Party Information (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="opposingParty.name" className="block text-sm font-medium text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="opposingParty.name"
                    name="opposingParty.name"
                    value={formData.opposingParty.name}
                    onChange={handleInputChange}
                    placeholder="Name of the opposing party"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 text-white placeholder-gray-400 backdrop-blur-sm"
                  />
                </div>
                <div>
                  <label htmlFor="opposingParty.contact" className="block text-sm font-medium text-gray-300 mb-2">
                    Contact Information
                  </label>
                  <input
                    type="text"
                    id="opposingParty.contact"
                    name="opposingParty.contact"
                    value={formData.opposingParty.contact}
                    onChange={handleInputChange}
                    placeholder="Phone number or email"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 text-white placeholder-gray-400 backdrop-blur-sm"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="opposingParty.address" className="block text-sm font-medium text-gray-300 mb-2">
                  Address
                </label>
                <textarea
                  id="opposingParty.address"
                  name="opposingParty.address"
                  value={formData.opposingParty.address}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Address of the opposing party"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 text-white placeholder-gray-400 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Detailed Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={6}
                placeholder="Provide a comprehensive description of your dispute, including timeline of events, parties involved, attempts at resolution, and desired outcome..."
                className={`w-full px-3 py-2 bg-white/10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 text-white placeholder-gray-400 backdrop-blur-sm ${
                  errors.description ? 'border-red-400' : 'border-white/20'
                }`}
                maxLength={2000}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-400 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.description}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-400">
                {formData.description.length}/2000 characters
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-white/20">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2 border border-white/20 rounded-md text-gray-300 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-200 backdrop-blur-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all duration-200 shadow-lg hover:shadow-red-500/25"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Filing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    File Dispute
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateDispute;
