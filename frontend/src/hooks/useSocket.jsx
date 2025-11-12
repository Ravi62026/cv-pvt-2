import { useEffect, useState, useRef, createContext, useContext } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

// Use the backend URL from environment variable
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Global socket instance to prevent multiple connections
let globalSocket = null;
let globalConnectionAttempts = 0;
let globalSocketDisabled = false;

// Socket Context
const SocketContext = createContext({ socket: null, isConnected: false });

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, token } = useAuth();
  const initRef = useRef(false);

  useEffect(() => {
    // Only initialize once per user session
    if (user && token && !globalSocket && !globalSocketDisabled && !initRef.current) {
      initRef.current = true;
      
      if (import.meta.env.DEV) {
        console.log('🔌 Initializing socket connection...');
      }
      
      // Create socket connection
      globalSocket = io(SOCKET_URL, {
        auth: {
          token: token,
        },
        transports: ['polling'], // Use polling only to avoid WebSocket errors
        forceNew: false,
        timeout: 5000,
        reconnection: false, // Disable auto-reconnection to prevent spam
      });

      // Connection event handlers
      globalSocket.on('connect', () => {
        if (import.meta.env.DEV) {
          console.log('✅ Socket connected successfully!');
        }
        setIsConnected(true);
        globalConnectionAttempts = 0;

        // Authenticate with user data
        globalSocket.emit('authenticate', {
          userId: user._id,
          userName: user.name,
          userRole: user.role,
        });
      });

      globalSocket.on('disconnect', () => {
        if (import.meta.env.DEV) {
          console.log('🔌 Socket disconnected');
        }
        setIsConnected(false);
      });

      globalSocket.on('connect_error', (error) => {
        globalConnectionAttempts++;
        if (import.meta.env.DEV) {
          console.warn('⚠️ Socket connection failed:', error.message);
        }
        
        if (globalConnectionAttempts >= 1) {
          // Disable after first failed attempt
          if (import.meta.env.DEV) {
            console.log('❌ Socket disabled - Backend server not running');
          }
          globalSocketDisabled = true;
          if (globalSocket) {
            globalSocket.disconnect();
            globalSocket = null;
          }
          initRef.current = false;
        }
        setIsConnected(false);
      });

      setSocket(globalSocket);
    }

    // Cleanup function
    return () => {
      // Don't disconnect global socket on unmount
      // It will be reused across components
    };
  }, [user, token]);

  // Log socket status on mount (only in development)
  useEffect(() => {
    if (import.meta.env.DEV) {
      if (globalSocketDisabled) {
        console.log('ℹ️ Socket Status: DISABLED (Backend not available)');
      } else if (isConnected) {
        console.log('ℹ️ Socket Status: CONNECTED');
      } else if (user && token) {
        console.log('ℹ️ Socket Status: CONNECTING...');
      }
    }
  }, [isConnected, user, token]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    // Return dummy socket if provider not found
    return { socket: null, isConnected: false };
  }
  return context;
};

// Hook for managing socket events
export const useSocketEvent = (eventName, handler, dependencies = []) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (socket && socket.connected && handler) {
      socket.on(eventName, handler);
      
      return () => {
        socket.off(eventName, handler);
      };
    }
  }, [socket, eventName, handler, ...dependencies]);
};

// Hook for emitting socket events
export const useSocketEmit = () => {
  const { socket } = useSocket();

  const emit = (eventName, data) => {
    if (socket && socket.connected) {
      socket.emit(eventName, data);
      return true;
    }
    return false;
  };

  return emit;
};
