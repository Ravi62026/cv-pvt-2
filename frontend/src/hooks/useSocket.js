import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

// Use the backend URL directly for socket connection
const SOCKET_URL = 'https://cv-pvt-2-be.onrender.com';

console.log('🔌 SOCKET_URL configured as:', SOCKET_URL);

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, token } = useAuth();
  const socketRef = useRef(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [socketDisabled, setSocketDisabled] = useState(false);

  useEffect(() => {
    if (user && token && !socketRef.current && !socketDisabled) {
      console.log('🔌 FRONTEND: Creating socket connection to:', SOCKET_URL);
      console.log('🔐 FRONTEND: Using token:', token ? 'Present' : 'Missing');
      console.log('👤 FRONTEND: User:', user.name, '(' + (user._id || user.id) + ')');

      // Create socket connection
      const newSocket = io(SOCKET_URL, {
        auth: {
          token: token,
        },
        // Use WebSockets for Render, polling for App Engine
        transports: SOCKET_URL.includes('appspot.com') ? ['polling'] : ['websocket', 'polling'],
        forceNew: true,
        // Additional options for better connection stability
        timeout: 20000,
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        reconnectionAttempts: 10,
        randomizationFactor: 0.5,
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('🔌 FRONTEND: Socket connected:', newSocket.id);
        console.log('   User:', user.name, '(' + user._id + ')');
        console.log('   Role:', user.role);
        setIsConnected(true);
        setConnectionAttempts(0); // Reset connection attempts on successful connection

        // Authenticate with user data
        const authData = {
          userId: user._id,
          userName: user.name,
          userRole: user.role,
        };
        console.log('🔐 FRONTEND: Sending authentication:', authData);
        newSocket.emit('authenticate', authData);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('🔌 FRONTEND: Socket disconnected:', reason);
        console.log('   User:', user.name, '(' + user._id + ')');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ FRONTEND: Socket connection error:', error);
        setIsConnected(false);
        setConnectionAttempts(prev => {
          const newCount = prev + 1;
          if (newCount >= 5) {
            console.warn('⚠️ FRONTEND: Too many socket connection failures, disabling socket');
            setSocketDisabled(true);
          }
          return newCount;
        });
      });

      newSocket.on('authenticated', (data) => {
        console.log('Socket authenticated:', data);
      });

      newSocket.on('authentication_error', (error) => {
        console.error('Socket authentication error:', error);
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log('🔌 FRONTEND: Socket reconnected after', attemptNumber, 'attempts');
        setIsConnected(true);
      });

      newSocket.on('reconnect_attempt', (attemptNumber) => {
        console.log('🔌 FRONTEND: Socket reconnection attempt', attemptNumber);
      });

      newSocket.on('reconnect_error', (error) => {
        console.error('❌ FRONTEND: Socket reconnection error:', error);
      });

      newSocket.on('reconnect_failed', () => {
        console.error('❌ FRONTEND: Socket reconnection failed - all attempts exhausted');
        console.warn('💡 FRONTEND: Consider deploying main backend to Render for better Socket.io support');
        setIsConnected(false);
        setSocketDisabled(true);
      });

      socketRef.current = newSocket;
      setSocket(newSocket);
    }

    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [user, token]);

  // Reconnect when user changes
  useEffect(() => {
    if (socketRef.current && user) {
      socketRef.current.emit('authenticate', {
        userId: user._id,
        userName: user.name,
        userRole: user.role,
      });
    }
  }, [user]);

  return { socket, isConnected };
};

// Hook for managing socket events
export const useSocketEvent = (eventName, handler, dependencies = []) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (socket && handler) {
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
      console.log(`📤 FRONTEND: Emitting event '${eventName}':`);
      console.log('   Data:', data);
      socket.emit(eventName, data);
      return true;
    }
    console.warn('⚠️ FRONTEND: Socket not connected, cannot emit event:', eventName);
    return false;
  };

  return emit;
};
