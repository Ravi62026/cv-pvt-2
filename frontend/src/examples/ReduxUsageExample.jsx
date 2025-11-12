import React, { useEffect } from 'react';
import { useAppDispatch, useAuth, useUser } from '../store/hooks';
import { 
  loginUser, 
  logoutUser, 
  signupUser,
  clearError 
} from '../store/slices/authSlice';
import {
  fetchUserProfile,
  updateUserProfile
} from '../store/slices/userSlice';
import { useToast } from '../contexts/ToastContext';

/**
 * Example component showing how to use Redux Toolkit with Async Thunks
 */
const ReduxUsageExample = () => {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, isLoading, error } = useAuth();
  const { profile, updateSuccess } = useUser();
  const { success, error: showError } = useToast();

  // Example 1: Login with async thunk
  const handleLogin = async () => {
    try {
      const result = await dispatch(loginUser({
        email: 'user@example.com',
        password: 'password123',
        captcha: 'captcha-token'
      })).unwrap();
      
      // Success - result contains user data
      success('Login successful!');
      console.log('Logged in user:', result.user);
    } catch (err) {
      // Error - err contains error message
      showError(err);
    }
  };

  // Example 2: Signup with async thunk
  const handleSignup = async () => {
    try {
      const result = await dispatch(signupUser({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '1234567890',
        role: 'citizen',
        captchaToken: 'captcha-token'
      })).unwrap();
      
      success('Signup successful!');
      console.log('New user:', result.user);
    } catch (err) {
      showError(err);
    }
  };

  // Example 3: Logout
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      success('Logged out successfully');
    } catch (err) {
      showError('Logout failed');
    }
  };

  // Example 4: Fetch user profile
  const handleFetchProfile = async () => {
    try {
      const profile = await dispatch(fetchUserProfile()).unwrap();
      console.log('User profile:', profile);
    } catch (err) {
      showError('Failed to fetch profile');
    }
  };

  // Example 5: Update user profile
  const handleUpdateProfile = async () => {
    try {
      await dispatch(updateUserProfile({
        name: 'Updated Name',
        phone: '9876543210'
      })).unwrap();
      
      success('Profile updated successfully');
    } catch (err) {
      showError('Failed to update profile');
    }
  };

  // Example 6: Clear error
  const handleClearError = () => {
    dispatch(clearError());
  };

  // Example 7: Using Redux state in useEffect
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User is authenticated:', user.name);
      // Fetch additional data
      dispatch(fetchUserProfile());
    }
  }, [isAuthenticated, user, dispatch]);

  // Example 8: Show toast on update success
  useEffect(() => {
    if (updateSuccess) {
      success('Profile updated!');
    }
  }, [updateSuccess, success]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Redux Toolkit Usage Examples</h2>
      
      {/* Display current state */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">Current State:</h3>
        <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
        <p>User: {user?.name || 'None'}</p>
        <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
        <p>Error: {error || 'None'}</p>
      </div>

      {/* Action buttons */}
      <div className="space-y-2">
        <button 
          onClick={handleLogin}
          className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
          disabled={isLoading}
        >
          Login
        </button>
        
        <button 
          onClick={handleSignup}
          className="px-4 py-2 bg-green-500 text-white rounded mr-2"
          disabled={isLoading}
        >
          Signup
        </button>
        
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded mr-2"
          disabled={isLoading}
        >
          Logout
        </button>
        
        <button 
          onClick={handleFetchProfile}
          className="px-4 py-2 bg-purple-500 text-white rounded mr-2"
          disabled={isLoading}
        >
          Fetch Profile
        </button>
        
        <button 
          onClick={handleUpdateProfile}
          className="px-4 py-2 bg-yellow-500 text-white rounded mr-2"
          disabled={isLoading}
        >
          Update Profile
        </button>
        
        {error && (
          <button 
            onClick={handleClearError}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Clear Error
          </button>
        )}
      </div>
    </div>
  );
};

export default ReduxUsageExample;
