import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from './useSocket';
import webrtcService from '../services/webrtc';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export const useWebRTC = () => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const { success, error } = useToast();
  
  const [isCallActive, setIsCallActive] = useState(false);
  const [callType, setCallType] = useState(null); // 'voice' or 'video'
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [incomingCallData, setIncomingCallData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const callStartTimeRef = useRef(null);
  const durationIntervalRef = useRef(null);

  // Initialize WebRTC service when socket is available
  useEffect(() => {
    if (socket) {
      console.log('Initializing WebRTC service with socket');
      webrtcService.initialize(socket);
      webrtcService.setEventHandlers({
        onRemoteStream: handleRemoteStream,
        onCallEnd: handleCallEnd,
        onError: handleError,
        onConnectionStateChange: handleConnectionStateChange,
        onIncomingCall: handleIncomingCall
      });
    }
  }, [socket]);

  // Handle remote stream
  const handleRemoteStream = useCallback((stream) => {
    console.log('🎥 useWebRTC: Handling remote stream', stream);

    // Log stream details for debugging
    console.log('🔊 useWebRTC: Remote stream details:', {
      id: stream.id,
      active: stream.active,
      audioTracks: stream.getAudioTracks().length,
      videoTracks: stream.getVideoTracks().length,
      tracks: stream.getTracks().map(track => ({
        kind: track.kind,
        enabled: track.enabled,
        readyState: track.readyState,
        muted: track.muted
      }))
    });

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = stream;

      // Force video to play for video calls
      if (stream.getVideoTracks().length > 0) {
        remoteVideoRef.current.play().catch(error => {
          console.error('Failed to play remote video:', error);
        });
      }

      // Add event listeners for video element
      const videoElement = remoteVideoRef.current;

      const handleCanPlay = () => {
        console.log('🎥 Remote video can play');
      };

      const handleLoadedData = () => {
        console.log('🎥 Remote video data loaded');
      };

      const handleError = (e) => {
        console.error('🎥 Remote video error:', e);
      };

      videoElement.addEventListener('canplay', handleCanPlay);
      videoElement.addEventListener('loadeddata', handleLoadedData);
      videoElement.addEventListener('error', handleError);

      // Cleanup listeners
      return () => {
        videoElement.removeEventListener('canplay', handleCanPlay);
        videoElement.removeEventListener('loadeddata', handleLoadedData);
        videoElement.removeEventListener('error', handleError);
      };
    }

    setIsConnected(true);
    startCallTimer();
  }, []);

  // Handle call end
  const handleCallEnd = useCallback((reason) => {
    setIsCallActive(false);
    setIsIncomingCall(false);
    setIncomingCallData(null);
    setIsConnected(false);
    setCallType(null);
    stopCallTimer();
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    if (reason === 'rejected') {
      error('Call was rejected');
    } else {
      success('Call ended');
    }
  }, [success, error]);

  // Handle errors
  const handleError = useCallback((err) => {
    console.error('WebRTC Error:', err);
    error('Call failed: ' + err.message);
    handleCallEnd();
  }, [error, handleCallEnd]);

  // Handle connection state changes
  const handleConnectionStateChange = useCallback((state) => {
    setIsConnected(state === 'connected');
  }, []);

  // Handle incoming call
  const handleIncomingCall = useCallback((callData) => {
    console.log('📞 WebRTC: Incoming call received', callData);
    setIsIncomingCall(true);
    setIncomingCallData(callData);
    setCallType(callData.callType);
  }, []);

  // Ensure local stream is properly set
  useEffect(() => {
    if (isCallActive && localVideoRef.current) {
      const localStream = webrtcService.getLocalStream();
      if (localStream && localVideoRef.current.srcObject !== localStream) {
        console.log('🎥 useWebRTC: Ensuring local stream is set:', localStream);
        localVideoRef.current.srcObject = localStream;
        localVideoRef.current.play().catch(error => {
          console.error('Failed to play local video in effect:', error);
        });
      }
    }
  }, [isCallActive, localVideoRef.current]);

  // Start call timer
  const startCallTimer = useCallback(() => {
    callStartTimeRef.current = Date.now();
    durationIntervalRef.current = setInterval(() => {
      if (callStartTimeRef.current) {
        const duration = Math.floor((Date.now() - callStartTimeRef.current) / 1000);
        setCallDuration(duration);
      }
    }, 1000);
  }, []);

  // Stop call timer
  const stopCallTimer = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    callStartTimeRef.current = null;
    setCallDuration(0);
  }, []);

  // Start a new call
  const startCall = useCallback(async (targetUserId, type = 'voice', chatId = null) => {
    try {
      console.log('🚀 useWebRTC: Starting WebRTC call:', { targetUserId, type, chatId });

      // Check if socket is available
      if (!socket) {
        throw new Error('Socket connection not available');
      }

      // Check if WebRTC service is initialized
      if (!webrtcService.socket) {
        console.log('🔄 useWebRTC: Re-initializing WebRTC service...');
        webrtcService.initialize(socket);
        webrtcService.setEventHandlers({
          onRemoteStream: handleRemoteStream,
          onCallEnd: handleCallEnd,
          onError: handleError,
          onConnectionStateChange: handleConnectionStateChange,
          onIncomingCall: handleIncomingCall
        });
      }

      setIsCallActive(true);
      setCallType(type);

      console.log('📞 useWebRTC: Calling webrtcService.startCall...');
      const callId = await webrtcService.startCall(targetUserId, type, chatId);

      // Set local stream with better handling
      const localStream = webrtcService.getLocalStream();
      if (localVideoRef.current && localStream) {
        console.log('🎥 useWebRTC: Setting local stream to localVideoRef:', localStream);
        localVideoRef.current.srcObject = localStream;

        // Force play for local video
        localVideoRef.current.play().catch(error => {
          console.error('Failed to play local video:', error);
        });

        // Log local stream tracks
        console.log('🎥 useWebRTC: Local stream tracks:', localStream.getTracks().map(track => ({
          kind: track.kind,
          enabled: track.enabled,
          readyState: track.readyState
        })));
      } else {
        console.warn('🎥 useWebRTC: localVideoRef or localStream not available');
      }

      console.log('✅ useWebRTC: Call started successfully, callId:', callId);
      return callId;
    } catch (err) {
      console.error('❌ useWebRTC: Failed to start call:', err);
      setIsCallActive(false);
      setCallType(null);
      handleError(err);
      throw err;
    }
  }, [socket, handleError, handleRemoteStream, handleCallEnd, handleConnectionStateChange, handleIncomingCall]);

  // Answer incoming call
  const answerCall = useCallback(async () => {
    if (!incomingCallData) return;

    try {
      console.log('Answering call:', incomingCallData);
      setIsCallActive(true);
      setIsIncomingCall(false);

      await webrtcService.answerCall(incomingCallData);

      // Set local stream with better handling
      const localStream = webrtcService.getLocalStream();
      if (localVideoRef.current && localStream) {
        console.log('🎥 useWebRTC: Setting local stream in answerCall:', localStream);
        localVideoRef.current.srcObject = localStream;

        // Force play for local video
        localVideoRef.current.play().catch(error => {
          console.error('Failed to play local video in answerCall:', error);
        });
      } else {
        console.warn('🎥 useWebRTC: localVideoRef or localStream not available in answerCall');
      }
    } catch (err) {
      console.error('Failed to answer call:', err);
      setIsCallActive(false);
      setIsIncomingCall(true);
      handleError(err);
    }
  }, [incomingCallData, handleError]);

  // Reject incoming call
  const rejectCall = useCallback(() => {
    if (incomingCallData) {
      console.log('Rejecting call:', incomingCallData);
      webrtcService.rejectCall(incomingCallData);
      setIsIncomingCall(false);
      setIncomingCallData(null);
      setCallType(null);
    }
  }, [incomingCallData]);

  // End current call
  const endCall = useCallback(() => {
    console.log('Ending call');
    webrtcService.endCall();
    setIsCallActive(false);
    setCallType(null);
    stopCallTimer();
  }, [stopCallTimer]);

  // Toggle audio mute
  const toggleMute = useCallback(() => {
    console.log('Toggling mute');
    const enabled = webrtcService.toggleAudio();
    setIsMuted(!enabled);
    return enabled;
  }, []);

  // Toggle video
  const toggleVideo = useCallback(() => {
    console.log('Toggling video');
    const enabled = webrtcService.toggleVideo();
    setIsVideoEnabled(enabled);
    return enabled;
  }, []);

  // Format call duration
  const formatDuration = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isCallActive) {
        console.log('Cleanup: ending call (simplified)');
        // webrtcService.endCall();
      }
      stopCallTimer();
    };
  }, [isCallActive, stopCallTimer]);

  return {
    // State
    isCallActive,
    callType,
    isIncomingCall,
    incomingCallData,
    isConnected,
    isMuted,
    isVideoEnabled,
    callDuration: formatDuration(callDuration),
    
    // Refs for video elements
    localVideoRef,
    remoteVideoRef,
    
    // Actions
    startCall,
    answerCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo
  };
};

export default useWebRTC;
