import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';

// Log Redux initialization
if (import.meta.env.DEV) {
  console.log('🔴 Redux Toolkit Store Initialized');
  console.log('📦 Available Slices: auth, user');
  console.log('🛠️ Redux DevTools: Enabled');
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for socket/date objects
        ignoredActions: ['socket/connect', 'socket/disconnect'],
      },
    }),
  devTools: import.meta.env.DEV, // Enable Redux DevTools in development
});

// Log all dispatched actions in development
if (import.meta.env.DEV) {
  const originalDispatch = store.dispatch;
  store.dispatch = function(action) {
    console.log('🔴 Redux Action:', action.type);
    if (action.payload) {
      console.log('   Payload:', action.payload);
    }
    return originalDispatch(action);
  };
}

export default store;
