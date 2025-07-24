import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import webrtcService from '../services/webrtc';

// Call States
export const CALL_STATES = {
  IDLE: 'idle',
  OUTGOING: 'outgoing',
  RINGING: 'ringing',
  INCOMING: 'incoming',
  ACTIVE: 'active',
  ENDED: 'ended'
};

// Call Actions
const CALL_ACTIONS = {
  SET_CALL_STATE: 'SET_CALL_STATE',
  SET_OUTGOING_CALL: 'SET_OUTGOING_CALL',
  SET_RINGING_CALL: 'SET_RINGING_CALL',
  SET_INCOMING_CALL: 'SET_INCOMING_CALL',
  SET_ACTIVE_CALL: 'SET_ACTIVE_CALL',
  SET_CALL_CONTROLS: 'SET_CALL_CONTROLS',
  CLEAR_CALL: 'CLEAR_CALL',
  SET_PARTICIPANT_INFO: 'SET_PARTICIPANT_INFO'
};

// Initial State
const initialState = {
  callState: CALL_STATES.IDLE,
  currentCall: null,
  incomingCall: null,
  outgoingCall: null,
  participantInfo: null,
  callStartTime: null,
  callDuration: 0,
  callControls: {
    isMuted: false,
    isVideoEnabled: true,
    isSpeakerOn: false
  }
};

// Reducer
const callReducer = (state, action) => {
  switch (action.type) {
    case CALL_ACTIONS.SET_CALL_STATE:
      return {
        ...state,
        callState: action.payload
      };

    case CALL_ACTIONS.SET_OUTGOING_CALL:
      return {
        ...state,
        callState: CALL_STATES.OUTGOING,
        outgoingCall: action.payload.callData,
        currentCall: action.payload.callData,
        participantInfo: action.payload.participantInfo
      };

    case CALL_ACTIONS.SET_RINGING_CALL:
      return {
        ...state,
        callState: CALL_STATES.RINGING
      };

    case CALL_ACTIONS.SET_INCOMING_CALL:
      return {
        ...state,
        callState: CALL_STATES.INCOMING,
        incomingCall: action.payload.callData,
        participantInfo: action.payload.participantInfo
      };
    
    case CALL_ACTIONS.SET_ACTIVE_CALL:
      return {
        ...state,
        callState: CALL_STATES.ACTIVE,
        currentCall: action.payload.callData || state.currentCall || state.outgoingCall,
        incomingCall: null,
        outgoingCall: null,
        participantInfo: action.payload.participantInfo || state.participantInfo,
        callStartTime: Date.now(),
        callDuration: 0
      };
    
    case CALL_ACTIONS.SET_CALL_CONTROLS:
      return {
        ...state,
        callControls: {
          ...state.callControls,
          ...action.payload
        }
      };
    
    case CALL_ACTIONS.SET_PARTICIPANT_INFO:
      return {
        ...state,
        participantInfo: action.payload
      };
    
    case CALL_ACTIONS.CLEAR_CALL:
      return {
        ...initialState
      };
    
    default:
      return state;
  }
};

// Context
const CallContext = createContext();

// Provider Component
export const CallProvider = ({ children }) => {
  const [state, dispatch] = useReducer(callReducer, initialState);
  const { socket } = useSocket();

  // Socket Event Handlers
  useEffect(() => {
    if (!socket) return;

    // Initialize WebRTC service with socket
    webrtcService.initialize(socket);

    // Handle incoming call offer
    const handleIncomingCall = (callData) => {
      console.log('📞 Incoming call received:', callData);

      // Get participant info (you might want to fetch from API)
      const participantInfo = {
        name: callData.fromUserName || callData.fromUserId,
        profilePicture: callData.fromUserAvatar || null
      };

      dispatch({
        type: CALL_ACTIONS.SET_INCOMING_CALL,
        payload: { callData, participantInfo }
      });
    };

    // Handle call accepted
    const handleCallAccepted = (callData) => {
      console.log('✅ Call accepted:', callData);

      const participantInfo = {
        name: callData.targetUserName || callData.targetUserId,
        profilePicture: callData.targetUserAvatar || null
      };

      // Add call connected message to chat
      if (callData.chatId) {
        addCallMessageToChat(callData.chatId, `✅ Call connected`, callData.callType || 'voice');
      }

      dispatch({
        type: CALL_ACTIONS.SET_ACTIVE_CALL,
        payload: { callData, participantInfo }
      });

      // Navigate to call page for the caller
      const callUrl = `/call/${callData.callId}?type=${callData.acceptType || callData.callType || 'voice'}`;
      window.history.pushState(null, '', callUrl);
    };

    // Handle call rejected
    const handleCallRejected = (callData) => {
      console.log('❌ Call rejected:', callData);
      dispatch({ type: CALL_ACTIONS.CLEAR_CALL });
    };

    // Handle call ended
    const handleCallEnded = (callData) => {
      console.log('📴 Call ended:', callData);
      dispatch({ type: CALL_ACTIONS.CLEAR_CALL });
      webrtcService.cleanup();
    };

    // Register socket listeners
    socket.on('webrtc_offer', handleIncomingCall);
    socket.on('webrtc_call_accepted', handleCallAccepted);
    socket.on('webrtc_call_rejected', handleCallRejected);
    socket.on('webrtc_call_end', handleCallEnded);

    return () => {
      socket.off('webrtc_offer', handleIncomingCall);
      socket.off('webrtc_call_accepted', handleCallAccepted);
      socket.off('webrtc_call_rejected', handleCallRejected);
      socket.off('webrtc_call_end', handleCallEnded);
    };
  }, [socket]);

  // Helper function to add call message to chat
  const addCallMessageToChat = (chatId, messageContent, callType) => {
    if (!socket || !chatId) return;

    const callMessage = {
      chatId,
      content: messageContent,
      messageType: 'system',
      callType: callType,
      timestamp: new Date()
    };

    // Emit the call message to the chat
    socket.emit('send_message', callMessage);
  };

  // Call Actions
  const startCall = async (targetUserId, callType = 'voice', chatId = null) => {
    try {
      const participantInfo = {
        name: targetUserId, // You might want to fetch actual user info
        profilePicture: null
      };

      // Set outgoing call state first
      dispatch({
        type: CALL_ACTIONS.SET_OUTGOING_CALL,
        payload: {
          callData: {
            targetUserId,
            callType,
            chatId
          },
          participantInfo
        }
      });

      // Add call started message to chat
      if (chatId) {
        addCallMessageToChat(chatId, `📞 ${callType === 'video' ? 'Video' : 'Voice'} call started`, callType);
      }

      // Start the WebRTC call
      const callId = await webrtcService.startCall(targetUserId, callType, chatId);

      // Set to ringing state after call is initiated
      dispatch({ type: CALL_ACTIONS.SET_RINGING_CALL });

      return { success: true, callId };
    } catch (error) {
      console.error('Failed to start call:', error);
      dispatch({ type: CALL_ACTIONS.CLEAR_CALL });
      throw error;
    }
  };

  const acceptCall = async (callData, acceptType = 'voice') => {
    try {
      // Update call data with accept type
      const updatedCallData = { ...callData, callType: acceptType };

      // Accept the call through WebRTC
      await webrtcService.acceptCall(updatedCallData, acceptType);

      const participantInfo = {
        name: callData.fromUserName || callData.fromUserId,
        profilePicture: callData.fromUserAvatar || null
      };

      // Emit call acceptance to the caller
      if (webrtcService.socket) {
        webrtcService.socket.emit('webrtc_call_accept', {
          callId: callData.callId,
          targetUserId: callData.fromUserId,
          acceptType: acceptType
        });
      }

      dispatch({
        type: CALL_ACTIONS.SET_ACTIVE_CALL,
        payload: {
          callData: updatedCallData,
          participantInfo
        }
      });

      // Navigate to call page
      const callUrl = `/call/${callData.callId}?type=${acceptType}`;
      window.history.pushState(null, '', callUrl);
    } catch (error) {
      console.error('Failed to accept call:', error);
      dispatch({ type: CALL_ACTIONS.CLEAR_CALL });
      throw error;
    }
  };

  const rejectCall = (callData) => {
    webrtcService.rejectCall(callData);
    dispatch({ type: CALL_ACTIONS.CLEAR_CALL });
  };

  const endCall = () => {
    // Add call ended message to chat
    const currentCallData = state.currentCall || state.outgoingCall;
    if (currentCallData?.chatId && state.callStartTime) {
      const duration = Math.floor((Date.now() - state.callStartTime) / 1000);
      const durationText = formatCallDuration(duration);
      const callType = currentCallData.callType || 'voice';
      addCallMessageToChat(
        currentCallData.chatId,
        `📞 ${callType === 'video' ? 'Video' : 'Voice'} call ended • Duration: ${durationText}`,
        callType
      );
    }

    webrtcService.endCall();
    dispatch({ type: CALL_ACTIONS.CLEAR_CALL });
  };

  // Helper function to format call duration
  const formatCallDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  };

  const toggleMute = () => {
    const newMutedState = !state.callControls.isMuted;
    webrtcService.toggleMute(newMutedState);
    dispatch({
      type: CALL_ACTIONS.SET_CALL_CONTROLS,
      payload: { isMuted: newMutedState }
    });
  };

  const toggleVideo = () => {
    const newVideoState = !state.callControls.isVideoEnabled;
    webrtcService.toggleVideo(newVideoState);
    dispatch({
      type: CALL_ACTIONS.SET_CALL_CONTROLS,
      payload: { isVideoEnabled: newVideoState }
    });
  };

  const toggleSpeaker = () => {
    const newSpeakerState = !state.callControls.isSpeakerOn;
    // Implement speaker toggle logic
    dispatch({
      type: CALL_ACTIONS.SET_CALL_CONTROLS,
      payload: { isSpeakerOn: newSpeakerState }
    });
  };

  // Call timer effect
  useEffect(() => {
    let interval;
    if (state.callState === CALL_STATES.ACTIVE && state.callStartTime) {
      interval = setInterval(() => {
        const duration = Math.floor((Date.now() - state.callStartTime) / 1000);
        dispatch({
          type: CALL_ACTIONS.SET_CALL_STATE,
          payload: state.callState // This will trigger re-render with updated duration
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.callState, state.callStartTime]);

  // Calculate current call duration
  const currentCallDuration = state.callStartTime
    ? Math.floor((Date.now() - state.callStartTime) / 1000)
    : 0;

  const value = {
    // State
    ...state,
    callDuration: currentCallDuration,

    // WebRTC streams
    localStream: webrtcService.localStream,
    remoteStream: webrtcService.remoteStream,

    // Actions
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleSpeaker
  };

  return (
    <CallContext.Provider value={value}>
      {children}
    </CallContext.Provider>
  );
};

// Hook to use call context
export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};

export default CallContext;
