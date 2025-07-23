import { v4 as uuidv4 } from 'uuid';

// Use native WebRTC instead of simple-peer to avoid import issues

class WebRTCService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.socket = null;
    this.isInitiator = false;
    this.callId = null;
    this.callType = null; // 'voice' or 'video'
    this.targetUserId = null; // Store target user ID for ICE candidates
    this.onRemoteStream = null;
    this.onCallEnd = null;
    this.onError = null;
    this.onConnectionStateChange = null;
    this.onIncomingCall = null;

    // ICE servers configuration
    this.iceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ];
  }

  // Initialize WebRTC service with socket connection
  initialize(socket) {
    this.socket = socket;
    this.setupSocketListeners();
  }

  // Setup socket event listeners for WebRTC signaling
  setupSocketListeners() {
    if (!this.socket) return;

    // Listen for incoming call offers
    this.socket.on('webrtc_offer', this.handleOffer.bind(this));
    
    // Listen for call answers
    this.socket.on('webrtc_answer', this.handleAnswer.bind(this));
    
    // Listen for ICE candidates
    this.socket.on('webrtc_ice_candidate', this.handleIceCandidate.bind(this));
    
    // Listen for call end
    this.socket.on('webrtc_call_end', this.handleCallEnd.bind(this));
    
    // Listen for call rejection
    this.socket.on('webrtc_call_rejected', this.handleCallRejected.bind(this));
  }

  // Start a call (voice or video)
  async startCall(targetUserId, callType = 'voice', chatId = null) {
    try {
      console.log('🚀 WebRTC: Starting call...', { targetUserId, callType, chatId });

      // Check if socket is initialized
      if (!this.socket) {
        throw new Error('WebRTC service not initialized - socket is missing');
      }

      // Check if socket is connected
      if (!this.socket.connected) {
        throw new Error('Socket is not connected');
      }

      this.callId = uuidv4();
      this.callType = callType;
      this.targetUserId = targetUserId;
      this.isInitiator = true;

      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('WebRTC is not supported in this browser');
      }

      // Get user media
      const constraints = {
        audio: true,
        video: callType === 'video'
      };

      console.log('🎥 WebRTC: Requesting media permissions...', constraints);
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ WebRTC: Media permissions granted');

      // Create peer connection using native WebRTC
      console.log('🔗 WebRTC: Creating peer connection...');
      console.log('🔍 WebRTC: Local stream:', this.localStream);

      try {
        this.peerConnection = new RTCPeerConnection({
          iceServers: this.iceServers
        });
        console.log('✅ WebRTC: Peer connection created successfully');

        // Add local stream to peer connection
        this.localStream.getTracks().forEach(track => {
          this.peerConnection.addTrack(track, this.localStream);
        });

        this.setupPeerConnectionListeners();

        // Create and send offer
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        console.log('📡 WebRTC: Sending offer via socket...');
        this.socket.emit('webrtc_offer', {
          callId: this.callId,
          targetUserId,
          callType,
          chatId,
          offer: offer
        });

      } catch (peerError) {
        console.error('❌ WebRTC: Failed to create peer connection:', peerError);
        throw new Error(`Failed to create peer connection: ${peerError.message}`);
      }

      console.log('✅ WebRTC: Call initiated successfully, callId:', this.callId);
      return this.callId;
    } catch (error) {
      console.error('❌ WebRTC: Error starting call:', error);
      this.cleanup();
      if (this.onError) this.onError(error);
      throw error;
    }
  }

  // Answer an incoming call
  async answerCall(callData, acceptType) {
    try {
      this.callId = callData.callId;
      this.callType = acceptType || callData.callType;
      this.targetUserId = callData.fromUserId;
      this.isInitiator = false;

      // Get user media
      const constraints = {
        audio: true,
        video: this.callType === 'video'
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);

      // Create peer connection using native WebRTC
      this.peerConnection = new RTCPeerConnection({
        iceServers: this.iceServers
      });

      // Add local stream to peer connection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      this.setupPeerConnectionListeners();

      // Set remote description from the offer
      if (callData.offer) {
        await this.peerConnection.setRemoteDescription(callData.offer);

        // Create and send answer
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        // Send answer via socket
        this.socket.emit('webrtc_answer', {
          callId: this.callId,
          targetUserId: callData.fromUserId,
          answer: answer
        });
      }

      return this.callId;
    } catch (error) {
      console.error('Error answering call:', error);
      if (this.onError) this.onError(error);
      throw error;
    }
  }

  // Accept an incoming call (alias for answerCall)
  async acceptCall(callData, acceptType) {
    return this.answerCall(callData, acceptType);
  }

  // Reject an incoming call
  rejectCall(callData) {
    this.socket.emit('webrtc_call_reject', {
      callId: callData.callId,
      targetUserId: callData.fromUserId
    });
  }

  // End the current call
  endCall() {
    if (this.callId && this.socket) {
      this.socket.emit('webrtc_call_end', {
        callId: this.callId
      });
    }
    this.cleanup();
  }

  // Setup peer connection event listeners for native WebRTC
  setupPeerConnectionListeners() {
    if (!this.peerConnection) return;

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.socket && this.callId) {
        console.log('📡 WebRTC: Sending ICE candidate');
        this.socket.emit('webrtc_ice_candidate', {
          callId: this.callId,
          candidate: event.candidate,
          targetUserId: this.targetUserId
        });
      }
    };

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      console.log('📺 WebRTC: Received remote stream');
      this.remoteStream = event.streams[0];
      if (this.onRemoteStream) {
        this.onRemoteStream(event.streams[0]);
      }
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      console.log('🔗 WebRTC: Connection state:', this.peerConnection.connectionState);
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(this.peerConnection.connectionState);
      }

      if (this.peerConnection.connectionState === 'failed' ||
          this.peerConnection.connectionState === 'disconnected') {
        this.cleanup();
      }
    };

    // Handle ICE connection state changes
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('🧊 WebRTC: ICE connection state:', this.peerConnection.iceConnectionState);
      if (this.peerConnection.iceConnectionState === 'failed') {
        if (this.onError) {
          this.onError(new Error('ICE connection failed'));
        }
      }
    };
  }

  // Handle incoming call offer
  handleOffer(data) {
    // This will be handled by the UI components
    console.log('Received call offer:', data);
    if (this.onIncomingCall) {
      this.onIncomingCall(data);
    }
  }

  // Handle call answer
  async handleAnswer(data) {
    console.log('📞 WebRTC: Call answered:', data);
    if (data.answer && this.peerConnection) {
      try {
        await this.peerConnection.setRemoteDescription(data.answer);
        console.log('✅ WebRTC: Remote description set successfully');
      } catch (error) {
        console.error('❌ WebRTC: Failed to set remote description:', error);
        if (this.onError) this.onError(error);
      }
    }
  }

  // Handle ICE candidate
  async handleIceCandidate(data) {
    console.log('🧊 WebRTC: Received ICE candidate:', data);
    if (this.peerConnection && data.candidate) {
      try {
        await this.peerConnection.addIceCandidate(data.candidate);
        console.log('✅ WebRTC: ICE candidate added successfully');
      } catch (error) {
        console.error('❌ WebRTC: Failed to add ICE candidate:', error);
        if (this.onError) this.onError(error);
      }
    }
  }

  // Handle call end
  handleCallEnd(data) {
    console.log('Call ended:', data);
    this.cleanup();
    if (this.onCallEnd) {
      this.onCallEnd();
    }
  }

  // Handle call rejection
  handleCallRejected(data) {
    console.log('Call rejected:', data);
    this.cleanup();
    if (this.onCallEnd) {
      this.onCallEnd('rejected');
    }
  }

  // Toggle audio mute
  toggleAudio() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }

  // Alias for toggleAudio for consistency with CallContext
  toggleMute() {
    return this.toggleAudio();
  }

  // Toggle video mute
  toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }

  // Get local stream
  getLocalStream() {
    return this.localStream;
  }

  // Get remote stream
  getRemoteStream() {
    return this.remoteStream;
  }

  // Cleanup resources
  cleanup() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    this.remoteStream = null;
    this.callId = null;
    this.callType = null;
    this.isInitiator = false;

    if (this.onConnectionStateChange) {
      this.onConnectionStateChange('disconnected');
    }
  }

  // Set event handlers
  setEventHandlers({ onRemoteStream, onCallEnd, onError, onConnectionStateChange, onIncomingCall }) {
    this.onRemoteStream = onRemoteStream;
    this.onCallEnd = onCallEnd;
    this.onError = onError;
    this.onConnectionStateChange = onConnectionStateChange;
    this.onIncomingCall = onIncomingCall;
  }
}

// Create singleton instance
const webrtcService = new WebRTCService();

export default webrtcService;
