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
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: callType === 'video' ? {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          frameRate: { ideal: 30, min: 15 },
          facingMode: 'user'
        } : false
      };

      console.log('🎥 WebRTC: Requesting media permissions...', constraints);
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ WebRTC: Media permissions granted');

      // Log local stream details for debugging
      console.log('🎵 WebRTC: Local stream tracks:', this.localStream.getTracks().map(track => ({
        kind: track.kind,
        enabled: track.enabled,
        readyState: track.readyState,
        settings: track.getSettings()
      })));

      // Ensure video tracks are properly configured
      if (callType === 'video') {
        const videoTracks = this.localStream.getVideoTracks();
        if (videoTracks.length === 0) {
          console.warn('⚠️ WebRTC: No video tracks found in local stream');
        } else {
          videoTracks.forEach((track, index) => {
            console.log(`📹 WebRTC: Video track ${index}:`, {
              enabled: track.enabled,
              readyState: track.readyState,
              muted: track.muted,
              settings: track.getSettings()
            });
          });
        }
      }

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
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: this.callType === 'video' ? {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          frameRate: { ideal: 30, min: 15 },
          facingMode: 'user'
        } : false
      };

      console.log('🎥 WebRTC: Requesting media permissions for answer...', constraints);
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ WebRTC: Media permissions granted for answer');

      // Log local stream details for debugging
      console.log('🎵 WebRTC: Local stream tracks (answer):', this.localStream.getTracks().map(track => ({
        kind: track.kind,
        enabled: track.enabled,
        readyState: track.readyState,
        settings: track.getSettings()
      })));

      // Ensure video tracks are properly configured
      if (this.callType === 'video') {
        const videoTracks = this.localStream.getVideoTracks();
        if (videoTracks.length === 0) {
          console.warn('⚠️ WebRTC: No video tracks found in local stream (answer)');
        } else {
          videoTracks.forEach((track, index) => {
            console.log(`📹 WebRTC: Video track ${index} (answer):`, {
              enabled: track.enabled,
              readyState: track.readyState,
              muted: track.muted,
              settings: track.getSettings()
            });
          });
        }
      }

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

      // Log stream details for debugging
      console.log('🎵 WebRTC: Remote stream tracks:', this.remoteStream.getTracks().map(track => ({
        kind: track.kind,
        enabled: track.enabled,
        readyState: track.readyState,
        muted: track.muted
      })));

      // Ensure audio tracks are enabled and properly configured
      this.remoteStream.getAudioTracks().forEach((track, index) => {
        console.log(`🔊 WebRTC: Audio track ${index} details:`, {
          enabled: track.enabled,
          readyState: track.readyState,
          muted: track.muted,
          settings: track.getSettings()
        });

        // Ensure audio track is enabled
        if (!track.enabled) {
          console.warn(`🔊 WebRTC: Enabling audio track ${index}`);
          track.enabled = true;
        }

        // Add event listeners to track
        track.addEventListener('ended', () => {
          console.log(`🔊 WebRTC: Audio track ${index} ended`);
        });

        track.addEventListener('mute', () => {
          console.log(`🔊 WebRTC: Audio track ${index} muted`);
        });

        track.addEventListener('unmute', () => {
          console.log(`🔊 WebRTC: Audio track ${index} unmuted`);
        });
      });

      // Ensure video tracks are enabled and add event listeners
      this.remoteStream.getVideoTracks().forEach((track, index) => {
        console.log(`📹 WebRTC: Video track ${index} details:`, {
          enabled: track.enabled,
          readyState: track.readyState,
          muted: track.muted,
          settings: track.getSettings()
        });

        // Add event listeners to track
        track.addEventListener('ended', () => {
          console.log(`📹 WebRTC: Video track ${index} ended`);
        });

        track.addEventListener('mute', () => {
          console.log(`📹 WebRTC: Video track ${index} muted`);
        });

        track.addEventListener('unmute', () => {
          console.log(`📹 WebRTC: Video track ${index} unmuted`);
        });
      });

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
    console.log('🔊 WebRTC: Getting remote stream:', this.remoteStream);
    return this.remoteStream;
  }

  // Check if remote stream has audio
  hasRemoteAudio() {
    return this.remoteStream && this.remoteStream.getAudioTracks().length > 0;
  }

  // Get remote audio tracks
  getRemoteAudioTracks() {
    return this.remoteStream ? this.remoteStream.getAudioTracks() : [];
  }

  // Check if remote stream has video
  hasRemoteVideo() {
    return this.remoteStream && this.remoteStream.getVideoTracks().length > 0;
  }

  // Get remote video tracks
  getRemoteVideoTracks() {
    return this.remoteStream ? this.remoteStream.getVideoTracks() : [];
  }

  // Check if remote video is enabled
  isRemoteVideoEnabled() {
    const videoTracks = this.getRemoteVideoTracks();
    return videoTracks.length > 0 && videoTracks[0].enabled;
  }

  // Set up audio element for remote stream
  setupAudioElement(audioElement) {
    if (this.remoteStream && audioElement) {
      console.log('🔊 WebRTC: Setting up audio element with remote stream');
      audioElement.srcObject = this.remoteStream;
      audioElement.volume = 1.0;
      audioElement.muted = false;

      // Log audio tracks for debugging
      const audioTracks = this.remoteStream.getAudioTracks();
      console.log('🔊 WebRTC: Audio tracks in remote stream:', audioTracks.map(track => ({
        enabled: track.enabled,
        readyState: track.readyState,
        muted: track.muted
      })));

      audioElement.play().catch(error => {
        console.error('🔊 WebRTC: Failed to play remote audio:', error);
      });
    } else {
      console.warn('🔊 WebRTC: Cannot setup audio element - missing stream or element');
    }
  }

  // Set up video element for remote stream
  setupVideoElement(videoElement) {
    if (this.remoteStream && videoElement) {
      videoElement.srcObject = this.remoteStream;
    }
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
